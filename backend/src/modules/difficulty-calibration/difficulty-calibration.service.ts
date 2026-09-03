import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Difficulty Calibration Engine — v1.
 *
 * This is NOT the same thing as any of the three adjacent, already-real
 * evaluation systems in this codebase — verified before writing a line
 * of this file (see docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md,
 * "Evaluation Engine" / "AI Evaluation Harness" rows, both confirmed
 * naming duplicates for the same missing capability: automated quality
 * scoring of AI coach/character *output text*, already closed by
 * `ai-eval.service.ts` + `AdminAIEvalPage.tsx`):
 *
 *   - AI Evaluation Harness (ai/ai-eval.service.ts): scores AI-GENERATED
 *     TEXT against a golden dataset of expected coaching responses.
 *     Nothing to do with mission/activity content.
 *   - Assessment Quality Engine (assessment-quality/): STATIC structural
 *     review of a question item's authored shape (missing correct
 *     answer, duplicate options, unwinnable item) — never looks at how
 *     real learners actually performed on it.
 *   - Content QA Engine (content-qa/): general content-completeness
 *     sweep (missing description, thin content, zero AgeVariant
 *     coverage) — also never touches real attempt/performance data.
 *
 * None of the three consumes `ActivityAttempt` (the one table with real
 * learner outcomes). This engine is the genuinely distinct gap: it
 * compares each Activity's AUTHORED `difficulty` (EASY/MEDIUM/HARD/
 * CHALLENGE, schema.prisma DifficultyLevel enum) against the EMPIRICAL
 * success rate real learners actually achieve on it
 * (ActivityAttempt.success), and flags activities where the two
 * disagree enough to suggest the authored difficulty tier is
 * miscalibrated — e.g. an "EASY" item only 20% of attempts succeed on,
 * or a "CHALLENGE" item 98% of attempts pass on first try.
 *
 * This directly feeds ZPD/adaptive sequencing quality: `zpd-calculator
 * .service.ts` and `recommendation.service.ts` both trust
 * `Activity.difficulty` as ground truth when deciding what to serve a
 * learner next. If that field is wrong, the whole adaptive loop
 * mis-targets learners. No existing system checks whether it's wrong.
 *
 * v1 is deliberately a simple threshold-based statistical check, not a
 * full IRT/Rasch difficulty-parameter estimation model — same
 * "Tier C custom-build only once a real need justifies it" philosophy
 * already applied to Assessment Quality Engine's v1. Requires a
 * minimum sample size per activity before flagging, to avoid noisy
 * single-attempt false positives.
 */

export type DifficultyCalibrationFlagType =
  | 'MISRATED_TOO_HARD' // authored tier is easy/medium but real success rate is low
  | 'MISRATED_TOO_EASY'; // authored tier is hard/challenge but real success rate is very high

export interface DifficultyCalibrationCandidate {
  activityId: string;
  flagType: DifficultyCalibrationFlagType;
  authoredDifficulty: string;
  empiricalSuccessRate: number;
  attemptCount: number;
  detail: string;
}

interface ExpectedRange {
  min: number;
  max: number;
}

@Injectable()
export class DifficultyCalibrationService {
  private readonly logger = new Logger(DifficultyCalibrationService.name);

  // Minimum real attempts before we trust the success rate enough to flag
  // anything — picked to avoid a single lucky/unlucky learner skewing the
  // signal for low-traffic content. Configurable via constructor for tests.
  private readonly MIN_ATTEMPTS = 10;

  // Expected empirical success-rate band per authored DifficultyLevel.
  // An activity whose real success rate falls OUTSIDE its own tier's
  // band is a calibration mismatch candidate. Bands deliberately have a
  // buffer zone between them (no shared boundaries) so "borderline"
  // items near a boundary don't flip-flop on flag status.
  private readonly EXPECTED_RANGE: Record<string, ExpectedRange> = {
    EASY: { min: 0.7, max: 1.0 },
    MEDIUM: { min: 0.45, max: 0.85 },
    HARD: { min: 0.25, max: 0.65 },
    CHALLENGE: { min: 0.0, max: 0.45 },
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Run the full scan: for every active Activity with enough real
   * attempts, compute empirical success rate and compare against its
   * authored difficulty's expected band. Pure read — does not write.
   */
  async scan(): Promise<{
    activitiesScanned: number;
    activitiesWithEnoughData: number;
    candidates: DifficultyCalibrationCandidate[];
  }> {
    const activities = await this.prisma.activity.findMany({
      where: { isActive: true },
      select: { id: true, title: true, type: true, difficulty: true },
    });

    const attemptStats = await this.prisma.activityAttempt.groupBy({
      by: ['activityId'],
      _count: { _all: true },
      _avg: { score: true },
    });

    // success rate per activity: prefer average of the boolean `success`
    // field over `score` where possible for a strict pass/fail signal,
    // but ActivityAttempt.success has no groupBy-avg support for
    // booleans in Prisma directly, so compute it via a raw count query.
    const successCounts = await this.prisma.activityAttempt.groupBy({
      by: ['activityId', 'success'],
      _count: { _all: true },
    });

    const statsByActivity = new Map<
      string,
      { total: number; successCount: number }
    >();
    for (const row of successCounts) {
      const entry = statsByActivity.get(row.activityId) ?? { total: 0, successCount: 0 };
      entry.total += row._count._all;
      if (row.success) entry.successCount += row._count._all;
      statsByActivity.set(row.activityId, entry);
    }

    const candidates: DifficultyCalibrationCandidate[] = [];
    let withEnoughData = 0;

    for (const activity of activities) {
      const stats = statsByActivity.get(activity.id);
      if (!stats || stats.total < this.MIN_ATTEMPTS) {
        continue;
      }
      withEnoughData++;

      const successRate = stats.successCount / stats.total;
      const band = this.EXPECTED_RANGE[activity.difficulty];
      if (!band) continue; // unknown enum value defensively skipped

      if (successRate < band.min) {
        candidates.push({
          activityId: activity.id,
          flagType: 'MISRATED_TOO_HARD',
          authoredDifficulty: activity.difficulty,
          empiricalSuccessRate: successRate,
          attemptCount: stats.total,
          detail: `Activity "${activity.title}" (${activity.type}) is authored as ${activity.difficulty} (expected success rate ${Math.round(band.min * 100)}-${Math.round(band.max * 100)}%) but real learners succeed only ${(successRate * 100).toFixed(1)}% of the time across ${stats.total} attempts — likely mis-rated too hard for its tier.`,
        });
      } else if (successRate > band.max) {
        candidates.push({
          activityId: activity.id,
          flagType: 'MISRATED_TOO_EASY',
          authoredDifficulty: activity.difficulty,
          empiricalSuccessRate: successRate,
          attemptCount: stats.total,
          detail: `Activity "${activity.title}" (${activity.type}) is authored as ${activity.difficulty} (expected success rate ${Math.round(band.min * 100)}-${Math.round(band.max * 100)}%) but real learners succeed ${(successRate * 100).toFixed(1)}% of the time across ${stats.total} attempts — likely mis-rated too easy for its tier.`,
        });
      }
    }

    return {
      activitiesScanned: activities.length,
      activitiesWithEnoughData: withEnoughData,
      candidates,
    };
  }

  /**
   * Run the scan and persist every candidate as a
   * DifficultyCalibrationFlag row, skipping ones that already have an
   * open (unresolved) flag for the same activityId/flagType, and
   * auto-resolving previously-open flags whose condition no longer
   * holds — same idempotent pattern as Content QA / Assessment Quality
   * Engines.
   */
  async scanAndPersist() {
    const { activitiesScanned, activitiesWithEnoughData, candidates } = await this.scan();

    let created = 0;
    let alreadyOpen = 0;
    const candidateKeys = new Set(candidates.map((c) => `${c.activityId}::${c.flagType}`));

    for (const candidate of candidates) {
      const existing = await this.prisma.difficultyCalibrationFlag.findFirst({
        where: { activityId: candidate.activityId, flagType: candidate.flagType, resolvedAt: null },
      });
      if (existing) {
        alreadyOpen++;
        continue;
      }
      await this.prisma.difficultyCalibrationFlag.create({
        data: {
          activityId: candidate.activityId,
          flagType: candidate.flagType,
          authoredDifficulty: candidate.authoredDifficulty,
          empiricalSuccessRate: candidate.empiricalSuccessRate,
          attemptCount: candidate.attemptCount,
          detail: candidate.detail,
        },
      });
      created++;
    }

    const openFlags = await this.prisma.difficultyCalibrationFlag.findMany({
      where: { resolvedAt: null },
      select: { id: true, activityId: true, flagType: true },
    });
    const staleIds = openFlags
      .filter((f) => !candidateKeys.has(`${f.activityId}::${f.flagType}`))
      .map((f) => f.id);
    let autoResolved = 0;
    if (staleIds.length > 0) {
      const result = await this.prisma.difficultyCalibrationFlag.updateMany({
        where: { id: { in: staleIds } },
        data: { resolvedAt: new Date() },
      });
      autoResolved = result.count;
    }

    this.logger.log(
      `Difficulty Calibration scan: ${activitiesScanned} activities scanned ` +
        `(${activitiesWithEnoughData} with >= ${this.MIN_ATTEMPTS} attempts), ` +
        `${candidates.length} mismatches found (${created} new, ${alreadyOpen} already open, ${autoResolved} auto-resolved).`,
    );

    return {
      scannedAt: new Date(),
      activitiesScanned,
      activitiesWithEnoughData,
      flagsFound: candidates.length,
      flagsCreated: created,
      flagsAlreadyOpen: alreadyOpen,
      flagsAutoResolved: autoResolved,
      candidates,
    };
  }

  async listOpenFlags(take = 200) {
    return this.prisma.difficultyCalibrationFlag.findMany({
      where: { resolvedAt: null },
      orderBy: { detectedAt: 'desc' },
      take,
    });
  }
}
