/**
 * AI Evaluation Harness v1 — runner script.
 *
 * WHAT THIS IS:
 * Runs backend/test/ai-eval/golden-dataset.json against the REAL coach/
 * character services (CodingCoachService, EnglishCoachService,
 * CharacterService), which internally call AIProviderService -> the
 * BedrockAdapter -> AWS Bedrock, exactly the same code path production
 * traffic uses. There is no mocking of the AI call itself.
 *
 * SCORING METHOD (READ THIS BEFORE TRUSTING A NUMBER):
 * Scoring is simple, honest keyword/structure-based heuristics evaluated
 * against each case's rubric in golden-dataset.json — NOT an LLM-judge.
 * This is a deliberate v1 choice: keyword/structure checks are cheap,
 * deterministic, and don't require an extra paid Bedrock call per
 * criterion. It means the score is a rough proxy for quality
 * ("did the response mention the right concepts / avoid the wrong
 * things / have a sane shape"), not a semantic judgement of correctness
 * or tone. A future v2 could add a real LLM-judge criterion type (calling
 * BedrockService.invoke with a grading prompt) — if you add that, update
 * this comment and the golden-dataset description field so nobody
 * mistakes heuristic scores for judged ones.
 *
 * HOW TO RUN (does spend real Bedrock $ — one call per golden-dataset
 * case, ~19 calls total at time of writing):
 *   cd backend
 *   npx ts-node -r tsconfig-paths/register scripts/run-ai-eval.ts
 *
 * Requires a real learner in the DB (the script picks the first LEARNER
 * user it finds) and at least one Character row for the character-chat
 * cases; it will skip a case with an errorMessage if neither exists.
 *
 * Each run + its per-case results are persisted to AIEvalRun /
 * AIEvalResult (see prisma/schema.prisma) so GET /api/admin/ai-eval/runs
 * can show score trends over time.
 */

import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { CodingCoachService } from '../src/modules/ai/services/coding-coach.service';
import { EnglishCoachService } from '../src/modules/ai/services/english-coach.service';
import { CharacterService } from '../src/modules/ai/character.service';

const PASS_THRESHOLD = 0.7; // fraction of rubric criteria a case must satisfy to be "passed"
const MAX_STORED_RESPONSE_CHARS = 4000; // avoid storing enormous blobs

interface RubricCriterion {
  id: string;
  type: 'keyword' | 'length' | 'structure';
  description?: string;
  must_include_any?: string[];
  must_not_include?: string | string[];
  must_not_include_any?: string[];
  min_chars?: number;
  max_chars?: number;
  check?: 'min_question_marks' | 'has_list_or_steps';
  min_count?: number;
}

interface GoldenCase {
  id: string;
  domain: 'coding-coach' | 'english-coach' | 'character-chat';
  method: string;
  learnerAge?: number;
  cefrLevel?: string;
  input: Record<string, any>;
  rubric: RubricCriterion[];
}

interface CriterionResult {
  id: string;
  description?: string;
  passed: boolean;
  reason: string;
}

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

/** Evaluate ONE rubric criterion against response text. Pure/sync, no AI call. */
function evaluateCriterion(text: string, criterion: RubricCriterion): CriterionResult {
  const lower = text.toLowerCase();

  if (criterion.type === 'keyword') {
    const includeAny = toArray(criterion.must_include_any);
    const excludeAny = [
      ...toArray(criterion.must_not_include),
      ...toArray(criterion.must_not_include_any),
    ];

    if (includeAny.length > 0) {
      const hit = includeAny.find((kw) => lower.includes(kw.toLowerCase()));
      if (!hit) {
        return {
          id: criterion.id,
          description: criterion.description,
          passed: false,
          reason: `none of [${includeAny.join(', ')}] found in response`,
        };
      }
    }

    if (excludeAny.length > 0) {
      const hit = excludeAny.find((kw) => lower.includes(kw.toLowerCase()));
      if (hit) {
        return {
          id: criterion.id,
          description: criterion.description,
          passed: false,
          reason: `forbidden phrase "${hit}" found in response`,
        };
      }
    }

    return { id: criterion.id, description: criterion.description, passed: true, reason: 'ok' };
  }

  if (criterion.type === 'length') {
    const len = text.trim().length;
    const min = criterion.min_chars ?? 0;
    const max = criterion.max_chars ?? Infinity;
    const passed = len >= min && len <= max;
    return {
      id: criterion.id,
      description: criterion.description,
      passed,
      reason: passed ? 'ok' : `length ${len} not in [${min}, ${max}]`,
    };
  }

  if (criterion.type === 'structure') {
    if (criterion.check === 'min_question_marks') {
      const count = (text.match(/\?/g) || []).length;
      const min = criterion.min_count ?? 1;
      const passed = count >= min;
      return {
        id: criterion.id,
        description: criterion.description,
        passed,
        reason: passed ? 'ok' : `found ${count} question marks, need >= ${min}`,
      };
    }
    if (criterion.check === 'has_list_or_steps') {
      const passed = /(\n\s*[\-\*\d]+[\.\)]?\s)/.test('\n' + text);
      return {
        id: criterion.id,
        description: criterion.description,
        passed,
        reason: passed ? 'ok' : 'no numbered/bulleted list structure detected',
      };
    }
  }

  return {
    id: criterion.id,
    description: criterion.description,
    passed: false,
    reason: `unknown criterion type/check: ${criterion.type}/${criterion.check}`,
  };
}

function scoreResponse(text: string, rubric: RubricCriterion[]) {
  const results = rubric.map((c) => evaluateCriterion(text, c));
  const passedCount = results.filter((r) => r.passed).length;
  const score = rubric.length > 0 ? passedCount / rubric.length : 0;
  return { results, passedCount, score };
}

async function callCase(
  goldenCase: GoldenCase,
  services: {
    codingCoach: CodingCoachService;
    englishCoach: EnglishCoachService;
    character: CharacterService;
  },
  learnerId: string,
  characterId: string | null,
): Promise<{ text: string } | { error: string }> {
  try {
    const { domain, method, input } = goldenCase;

    if (domain === 'coding-coach') {
      const svc = services.codingCoach as any;
      if (typeof svc[method] !== 'function') {
        return { error: `CodingCoachService has no method '${method}'` };
      }
      if (method === 'provideDebugAssistance') {
        const result = await svc.provideDebugAssistance({ learnerId, ...input });
        return { text: result.diagnosis ?? JSON.stringify(result) };
      }
      if (method === 'reviewCode') {
        const result = await svc.reviewCode({ learnerId, ...input });
        return { text: result.feedback ?? JSON.stringify(result) };
      }
      if (method === 'explainCode') {
        const result = await svc.explainCode({ learnerId, ...input });
        return { text: result.explanation ?? JSON.stringify(result) };
      }
      if (method === 'provideSocraticGuidance') {
        const result = await svc.provideSocraticGuidance(
          learnerId,
          input.code,
          input.stuckPoint,
        );
        return { text: (result.questions || []).join('\n') || JSON.stringify(result) };
      }
      return { error: `Unmapped coding-coach method '${method}'` };
    }

    if (domain === 'english-coach') {
      const svc = services.englishCoach as any;
      if (typeof svc[method] !== 'function') {
        return { error: `EnglishCoachService has no method '${method}'` };
      }
      if (method === 'conductConversation') {
        const result = await svc.conductConversation({
          learnerId,
          topic: input.topic,
          difficulty: goldenCase.cefrLevel,
          userMessage: input.userMessage,
        });
        return { text: result.response ?? JSON.stringify(result) };
      }
      if (method === 'correctGrammar') {
        const result = await svc.correctGrammar({
          learnerId,
          text: input.text,
          explainMistakes: input.explainMistakes ?? true,
        });
        return { text: result.feedback ?? JSON.stringify(result) };
      }
      return { error: `Unmapped english-coach method '${method}'` };
    }

    if (domain === 'character-chat') {
      if (!characterId) {
        return { error: 'No Character row found in DB — cannot run character-chat case' };
      }
      const result = await services.character.generateResponse(
        characterId,
        learnerId,
        input.message,
        input.context,
      );
      return { text: result.message ?? JSON.stringify(result) };
    }

    return { error: `Unknown domain '${domain}'` };
  } catch (err: any) {
    return { error: err?.message || String(err) };
  }
}

async function main() {
  const datasetPath = path.join(__dirname, '..', 'test', 'ai-eval', 'golden-dataset.json');
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
  const cases: GoldenCase[] = dataset.cases;

  console.log(`[ai-eval] Loaded ${cases.length} golden-dataset cases (v${dataset.version})`);
  console.log(
    '[ai-eval] Scoring is keyword/structure-based heuristics, NOT an LLM-judge — see file header.',
  );

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const prisma = app.get(PrismaService);
  const codingCoach = app.get(CodingCoachService);
  const englishCoach = app.get(EnglishCoachService);
  const character = app.get(CharacterService);

  const learner = await prisma.learner.findFirst({ select: { id: true } });
  const characterRow = await prisma.character.findFirst({ select: { id: true } });

  if (!learner) {
    console.error('[ai-eval] No Learner rows found in DB — cannot run eval. Seed the DB first.');
    await app.close();
    process.exit(1);
  }

  const run = await prisma.aIEvalRun.create({
    data: {
      datasetVersion: String(dataset.version ?? 'unknown'),
      totalCases: cases.length,
      status: 'running',
    },
  });

  let passedCases = 0;
  let scoreSum = 0;

  for (const goldenCase of cases) {
    const outcome = await callCase(
      goldenCase,
      { codingCoach, englishCoach, character },
      learner.id,
      characterRow?.id ?? null,
    );

    if ('error' in outcome) {
      console.log(`[ai-eval] ${goldenCase.id} -> ERROR: ${outcome.error}`);
      await prisma.aIEvalResult.create({
        data: {
          runId: run.id,
          caseId: goldenCase.id,
          domain: goldenCase.domain,
          method: goldenCase.method,
          score: 0,
          passed: false,
          criteriaTotal: goldenCase.rubric.length,
          criteriaPassed: 0,
          criteriaDetail: [],
          errorMessage: outcome.error,
        },
      });
      continue;
    }

    const { results, passedCount, score } = scoreResponse(outcome.text, goldenCase.rubric);
    const passed = score >= PASS_THRESHOLD;
    if (passed) passedCases += 1;
    scoreSum += score;

    console.log(
      `[ai-eval] ${goldenCase.id} (${goldenCase.domain}/${goldenCase.method}) -> score ${score.toFixed(2)} (${passedCount}/${goldenCase.rubric.length}) ${passed ? 'PASS' : 'FAIL'}`,
    );

    await prisma.aIEvalResult.create({
      data: {
        runId: run.id,
        caseId: goldenCase.id,
        domain: goldenCase.domain,
        method: goldenCase.method,
        score,
        passed,
        criteriaTotal: goldenCase.rubric.length,
        criteriaPassed: passedCount,
        criteriaDetail: results as any,
        responseText: outcome.text.slice(0, MAX_STORED_RESPONSE_CHARS),
      },
    });
  }

  const averageScore = cases.length > 0 ? scoreSum / cases.length : 0;

  await prisma.aIEvalRun.update({
    where: { id: run.id },
    data: {
      finishedAt: new Date(),
      passedCases,
      averageScore,
      status: 'completed',
    },
  });

  console.log(
    `[ai-eval] Run ${run.id} complete: ${passedCases}/${cases.length} cases passed, average score ${averageScore.toFixed(3)}`,
  );

  await app.close();
}

main().catch((err) => {
  console.error('[ai-eval] Fatal error running eval harness:', err);
  process.exit(1);
});
