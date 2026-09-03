import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Assessment Quality Engine v1.
 *
 * Distinct from two adjacent, already-real systems (do not confuse with
 * either):
 *   - Content QA Engine (content-qa/): general content-completeness
 *     sweep over Activity/Mission rows (missing description, content
 *     too short, no age-band signal, zero AgeVariant coverage) — it
 *     does NOT inspect the actual question logic (options/answer keys).
 *   - Rubric system (projects/rubrics.service.ts): human-authored
 *     grading criteria applied by staff to a learner's PROJECT
 *     submission — grades a submission, doesn't review a question item.
 *
 * This engine automatically reviews QUESTION ITEM quality itself before
 * it reaches learners: for SELECT-type activities (the only type with a
 * real fixed answer-key/options structure `ActivityEvaluator` can
 * reason about — MATCH/SEQUENCE have a similar shape and are included
 * too), it checks:
 *   - NO_CORRECT_ANSWER: correctAnswers is empty/missing — every
 *     submission would be marked wrong regardless of the learner's
 *     choice, a broken item.
 *   - CORRECT_ANSWER_NOT_IN_OPTIONS: a correctAnswers entry doesn't
 *     match any real option — unwinnable item.
 *   - TOO_FEW_OPTIONS: fewer than 2 distinct options (not really a
 *     choice at all).
 *   - DUPLICATE_OPTIONS: two or more options are identical strings —
 *     ambiguous, breaks distractor quality.
 *   - ALL_OPTIONS_CORRECT: every option is marked correct — the item
 *     tests nothing.
 *
 * v1 is deliberately rule-based, not an LLM-based Bloom-level/ambiguity
 * reviewer (that would need a real AI call per item and the inventory's
 * own guidance is to default to Tier C custom-build only once a real
 * need justifies the AI cost) — these are genuine structural defects a
 * simple rule pass catches with zero false-positive risk.
 */

export type AssessmentQualityFlagType =
  | 'NO_CORRECT_ANSWER'
  | 'CORRECT_ANSWER_NOT_IN_OPTIONS'
  | 'TOO_FEW_OPTIONS'
  | 'DUPLICATE_OPTIONS'
  | 'ALL_OPTIONS_CORRECT';

export interface AssessmentQualityCandidate {
  activityId: string;
  flagType: AssessmentQualityFlagType;
  detail: string;
}

@Injectable()
export class AssessmentQualityService {
  private readonly logger = new Logger(AssessmentQualityService.name);

  constructor(private prisma: PrismaService) {}

  async scan(): Promise<{ activitiesScanned: number; candidates: AssessmentQualityCandidate[] }> {
    const activities = await this.prisma.activity.findMany({
      where: { isActive: true, type: { in: ['SELECT', 'MATCH', 'SEQUENCE'] } },
      select: { id: true, type: true, title: true, content: true },
    });

    const candidates: AssessmentQualityCandidate[] = [];
    for (const activity of activities) {
      if (activity.type === 'SELECT') {
        candidates.push(...this.checkSelect(activity.id, activity.title, activity.content));
      }
      // MATCH/SEQUENCE share the "options must exist and be non-degenerate"
      // structural shape closely enough to reuse the same options-array
      // checks (both content payloads carry an `items`/`options`-shaped
      // array per ActivityEvaluator's evaluateMatch/evaluateSequence).
      if (activity.type === 'MATCH' || activity.type === 'SEQUENCE') {
        candidates.push(...this.checkPairsOrSequence(activity.id, activity.title, activity.content));
      }
    }

    return { activitiesScanned: activities.length, candidates };
  }

  async scanAndPersist() {
    const { activitiesScanned, candidates } = await this.scan();

    let created = 0;
    let alreadyOpen = 0;
    const candidateKeys = new Set(candidates.map((c) => `${c.activityId}::${c.flagType}`));

    for (const candidate of candidates) {
      const existing = await this.prisma.assessmentQualityFlag.findFirst({
        where: { activityId: candidate.activityId, flagType: candidate.flagType, resolvedAt: null },
      });
      if (existing) {
        alreadyOpen++;
        continue;
      }
      await this.prisma.assessmentQualityFlag.create({
        data: { activityId: candidate.activityId, flagType: candidate.flagType, detail: candidate.detail },
      });
      created++;
    }

    // Auto-resolve stale flags, same pattern as Content QA Engine.
    const openFlags = await this.prisma.assessmentQualityFlag.findMany({
      where: { resolvedAt: null },
      select: { id: true, activityId: true, flagType: true },
    });
    const staleIds = openFlags
      .filter((f) => !candidateKeys.has(`${f.activityId}::${f.flagType}`))
      .map((f) => f.id);
    let autoResolved = 0;
    if (staleIds.length > 0) {
      const result = await this.prisma.assessmentQualityFlag.updateMany({
        where: { id: { in: staleIds } },
        data: { resolvedAt: new Date() },
      });
      autoResolved = result.count;
    }

    this.logger.log(
      `Assessment Quality scan: ${activitiesScanned} activities scanned, ${candidates.length} issues found ` +
        `(${created} new, ${alreadyOpen} already open, ${autoResolved} auto-resolved).`,
    );

    return {
      scannedAt: new Date(),
      activitiesScanned,
      flagsFound: candidates.length,
      flagsCreated: created,
      flagsAlreadyOpen: alreadyOpen,
      flagsAutoResolved: autoResolved,
      candidates,
    };
  }

  async listOpenFlags(take = 200) {
    return this.prisma.assessmentQualityFlag.findMany({
      where: { resolvedAt: null },
      orderBy: { detectedAt: 'desc' },
      take,
    });
  }

  private checkSelect(
    activityId: string,
    title: string,
    content: any,
  ): AssessmentQualityCandidate[] {
    const flags: AssessmentQualityCandidate[] = [];
    const options: string[] = Array.isArray(content?.options) ? content.options : [];
    const correctAnswers: string[] = Array.isArray(content?.correctAnswers)
      ? content.correctAnswers
      : [];

    if (correctAnswers.length === 0) {
      flags.push({
        activityId,
        flagType: 'NO_CORRECT_ANSWER',
        detail: `SELECT activity "${title}" has no correctAnswers — every submission would be marked wrong.`,
      });
    }

    for (const ans of correctAnswers) {
      if (!options.includes(ans)) {
        flags.push({
          activityId,
          flagType: 'CORRECT_ANSWER_NOT_IN_OPTIONS',
          detail: `SELECT activity "${title}": correct answer "${ans}" is not among the listed options.`,
        });
      }
    }

    const distinctOptions = new Set(options);
    if (distinctOptions.size < 2) {
      flags.push({
        activityId,
        flagType: 'TOO_FEW_OPTIONS',
        detail: `SELECT activity "${title}" has ${distinctOptions.size} distinct option(s) — not a real choice.`,
      });
    }
    if (distinctOptions.size !== options.length) {
      flags.push({
        activityId,
        flagType: 'DUPLICATE_OPTIONS',
        detail: `SELECT activity "${title}" has duplicate option strings.`,
      });
    }
    if (options.length > 0 && correctAnswers.length >= options.length) {
      flags.push({
        activityId,
        flagType: 'ALL_OPTIONS_CORRECT',
        detail: `SELECT activity "${title}": all options are marked correct — the item tests nothing.`,
      });
    }

    return flags;
  }

  private checkPairsOrSequence(
    activityId: string,
    title: string,
    content: any,
  ): AssessmentQualityCandidate[] {
    const flags: AssessmentQualityCandidate[] = [];
    const items: unknown[] = Array.isArray(content?.items)
      ? content.items
      : Array.isArray(content?.pairs)
        ? content.pairs
        : [];

    if (items.length < 2) {
      flags.push({
        activityId,
        flagType: 'TOO_FEW_OPTIONS',
        detail: `Activity "${title}" has ${items.length} item(s) to match/sequence — not enough for a real exercise.`,
      });
    }

    return flags;
  }
}
