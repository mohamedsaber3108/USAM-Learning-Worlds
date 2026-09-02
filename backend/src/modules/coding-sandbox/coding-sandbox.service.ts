/**
 * Coding Sandbox Service
 *
 * Trust boundary: this service NEVER executes learner-submitted code.
 * Code execution happens entirely client-side in the browser, via Pyodide
 * (Python, WASM, in a Web Worker) or Sandpack (JS/React, in-browser bundler).
 * See docs/architecture/USAM_OSS_INTEGRATION_PLAN.md Section 1.
 *
 * This service's job is exactly the three things the plan calls for:
 *  (a) serve mission starter code + test assertions
 *  (b) receive already-executed RESULTS (stdout/stderr/return value) from
 *      the browser and validate them against an expected-output spec
 *  (c) persist the outcome to ActivityAttempt (reusing the existing
 *      Missions/Mastery data model rather than inventing new tables)
 *  (d) hand the code TEXT (never execute it) to CodingCoachService for
 *      AI review commentary
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MasteryService } from '../mastery/mastery.service';
import { CodingCoachService } from '../ai/services/coding-coach.service';

export type SandboxLanguage = 'python' | 'javascript';

export interface CodingMissionSpec {
  activityId: string;
  title: string;
  language: SandboxLanguage;
  runner: 'pyodide' | 'sandpack';
  prompt: string;
  starterCode: string;
  /**
   * Expected-output assertions. Each assertion is checked against the
   * client-reported result (stdout text match, or exact/contains match on
   * a returned value). No code is ever executed here — this is pure
   * string/JSON comparison against what the browser already ran.
   */
  assertions: CodingAssertion[];
}

export interface CodingAssertion {
  id: string;
  description: string;
  type: 'stdout-equals' | 'stdout-contains' | 'result-equals';
  expected: string;
}

export interface SubmitResultDto {
  runId: string;
  activityId: string;
  code: string;
  language: SandboxLanguage;
  /** Already-executed output captured client-side. */
  stdout: string;
  stderr?: string;
  result?: unknown;
  durationMs?: number;
  timedOut?: boolean;
}

export interface AssertionOutcome {
  id: string;
  description: string;
  passed: boolean;
}

@Injectable()
export class CodingSandboxService {
  constructor(
    private prisma: PrismaService,
    private masteryService: MasteryService,
    private codingCoach: CodingCoachService,
  ) {}

  /**
   * Serve mission starter code + assertions for a CODE-type Activity.
   * The mission's `content` JSON on the Activity model already stores
   * exactly this shape (no new Prisma model needed).
   */
  async getMission(activityId: string): Promise<CodingMissionSpec> {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException('Coding mission not found');
    }

    if (activity.type !== 'CODE') {
      throw new BadRequestException('Activity is not a coding mission');
    }

    const content = (activity.content as any) ?? {};
    const language: SandboxLanguage = content.language === 'javascript' ? 'javascript' : 'python';

    return {
      activityId: activity.id,
      title: activity.title,
      language,
      runner: language === 'javascript' ? 'sandpack' : 'pyodide',
      prompt: content.prompt ?? activity.description ?? '',
      starterCode: content.starterCode ?? '',
      assertions: Array.isArray(content.assertions) ? content.assertions : [],
    };
  }

  /**
   * Validate already-executed client results against the mission's
   * expected-output spec. Pure comparison — no execution of any kind.
   */
  private validate(spec: CodingMissionSpec, submission: SubmitResultDto): {
    outcomes: AssertionOutcome[];
    passed: boolean;
    score: number;
  } {
    if (submission.timedOut) {
      return { outcomes: [], passed: false, score: 0 };
    }

    if (spec.assertions.length === 0) {
      // No deterministic assertions defined — fall back to "ran without error"
      const ok = !submission.stderr;
      return {
        outcomes: [
          { id: 'ran-without-error', description: 'Code ran without raising an error', passed: ok },
        ],
        passed: ok,
        score: ok ? 1 : 0,
      };
    }

    const outcomes = spec.assertions.map((assertion) => {
      let passed = false;
      switch (assertion.type) {
        case 'stdout-equals':
          passed = submission.stdout.trim() === assertion.expected.trim();
          break;
        case 'stdout-contains':
          passed = submission.stdout.includes(assertion.expected);
          break;
        case 'result-equals':
          passed = this.stringifyResult(submission.result) === assertion.expected;
          break;
        default:
          passed = false;
      }
      return { id: assertion.id, description: assertion.description, passed };
    });

    const passedCount = outcomes.filter((o) => o.passed).length;
    const score = outcomes.length ? passedCount / outcomes.length : 0;

    return { outcomes, passed: passedCount === outcomes.length, score };
  }

  private stringifyResult(result: unknown): string {
    if (result === undefined) return '';
    if (typeof result === 'string') return result;
    try {
      return JSON.stringify(result);
    } catch {
      return String(result);
    }
  }

  /**
   * Receive client-executed results, validate, persist to ActivityAttempt,
   * and attach AI code-review commentary (static text review only — the
   * AI is never given execution capability either).
   */
  async submitResult(learnerId: string, submission: SubmitResultDto) {
    if (!learnerId) {
      throw new BadRequestException('Only learners can submit coding attempts');
    }

    const run = await this.prisma.missionRun.findUnique({ where: { id: submission.runId } });
    if (!run || run.learnerId !== learnerId) {
      throw new NotFoundException('Mission run not found');
    }

    const activity = await this.prisma.activity.findUnique({
      where: { id: submission.activityId },
      include: { objective: { include: { competency: true } } },
    });
    if (!activity) {
      throw new NotFoundException('Coding activity not found');
    }

    const spec = await this.getMission(submission.activityId);
    const { outcomes, passed, score } = this.validate(spec, submission);

    // AI code review — static text analysis only, never executes the code.
    let coachFeedback: string | null = null;
    try {
      const review = await this.codingCoach.reviewCode({
        learnerId,
        code: submission.code,
        language: submission.language,
        objectiveId: activity.objectiveId,
      });
      coachFeedback = review.feedback;
    } catch {
      // AI feedback is best-effort; a failure here must not block grading.
      coachFeedback = null;
    }

    const attempt = await this.prisma.activityAttempt.create({
      data: {
        runId: submission.runId,
        activityId: submission.activityId,
        response: {
          code: submission.code,
          language: submission.language,
          stdout: submission.stdout,
          stderr: submission.stderr ?? null,
          result: submission.result ?? null,
          durationMs: submission.durationMs ?? null,
          timedOut: submission.timedOut ?? false,
          assertionOutcomes: outcomes,
          executedBy: spec.runner, // client-side runner, never the backend
        } as any,
        success: passed,
        score,
        feedback: coachFeedback,
      },
    });

    if (activity.objective?.competencyId) {
      await this.masteryService.recordEvidence(
        learnerId,
        activity.objective.competencyId,
        'CREATION',
        passed,
        score,
        { activityId: activity.id, attemptId: attempt.id, runner: spec.runner },
        attempt.id,
      );
    }

    return {
      attempt,
      outcomes,
      passed,
      score,
      coachFeedback,
    };
  }
}
