import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Intervention Engine v1.
 *
 * Distinct from two adjacent, already-real systems (do not confuse with
 * either):
 *   - ZPD Engine (adaptive/): proactively targets difficulty within a
 *     learner's zone of proximal development BEFORE they attempt an
 *     activity — it doesn't react to an observed struggle pattern.
 *   - Spaced Repetition (mastery/flashcards): proactively schedules
 *     REVIEW of already-learned material on a decay curve — it isn't
 *     triggered by a real-time struggle signal either.
 *
 * This engine is the missing reactive half: it watches actual
 * ActivityAttempt outcomes as they happen and, once a real STRUGGLE
 * PATTERN is detected (not a single wrong answer — that's already
 * handled by the Misconception Engine), creates a concrete, actionable
 * InterventionRecommendation row a parent/staff member can act on.
 *
 * v1 triggers (both evaluated on every submitActivity call, best-effort,
 * never blocking submission):
 *   1. CONSECUTIVE_WRONG_SAME_COMPETENCY — the learner's last 3 attempts
 *      on activities belonging to the SAME competency were all wrong.
 *   2. LOW_MASTERY_REPEATED_ATTEMPTS — the learner has 5+ recorded
 *      attempts against a competency whose MasteryRecord confidence is
 *      still below 0.3 (i.e. real practice volume isn't translating to
 *      mastery growth — a stronger signal than a single low score).
 *
 * Both triggers de-duplicate: if an OPEN recommendation already exists
 * for the same learner+competency+triggerType, no duplicate is created
 * (the existing one stays open until a human/future auto-flow resolves
 * it) — mirrors the Content QA Engine's open-flag dedup pattern.
 */
@Injectable()
export class InterventionService {
  private readonly logger = new Logger(InterventionService.name);

  static readonly CONSECUTIVE_WRONG_THRESHOLD = 3;
  static readonly LOW_MASTERY_ATTEMPT_THRESHOLD = 5;
  static readonly LOW_MASTERY_CONFIDENCE_CEILING = 0.3;

  constructor(private prisma: PrismaService) {}

  /**
   * Evaluate both triggers for a single learner+competency pair, called
   * right after an attempt is recorded and mastery evidence applied.
   * Best-effort — any error here must never surface to the caller.
   */
  async evaluateAfterAttempt(learnerId: string, competencyId: string): Promise<void> {
    try {
      await this.checkConsecutiveWrong(learnerId, competencyId);
      await this.checkLowMasteryRepeatedAttempts(learnerId, competencyId);
    } catch (err) {
      this.logger.warn(
        `Intervention evaluation failed for learner=${learnerId} competency=${competencyId}: ${
          (err as Error).message
        }`,
      );
    }
  }

  private async checkConsecutiveWrong(learnerId: string, competencyId: string) {
    const recentAttempts = await this.prisma.activityAttempt.findMany({
      where: {
        run: { learnerId },
        activity: { objective: { competencyId } },
      },
      orderBy: { createdAt: 'desc' },
      take: InterventionService.CONSECUTIVE_WRONG_THRESHOLD,
      select: { success: true },
    });

    if (recentAttempts.length < InterventionService.CONSECUTIVE_WRONG_THRESHOLD) return;
    const allWrong = recentAttempts.every((a) => a.success === false);
    if (!allWrong) return;

    await this.createIfNotOpen(learnerId, competencyId, 'CONSECUTIVE_WRONG_SAME_COMPETENCY', {
      triggerDetail: `Last ${InterventionService.CONSECUTIVE_WRONG_THRESHOLD} attempts on this competency were all incorrect.`,
      recommendedAction:
        'Recommend a guided review session or 1:1 support before the learner attempts more activities in this competency — repeated failure without intervention risks disengagement.',
    });
  }

  private async checkLowMasteryRepeatedAttempts(learnerId: string, competencyId: string) {
    const [mastery, attemptCount] = await Promise.all([
      this.prisma.masteryRecord.findUnique({
        where: { learnerId_competencyId: { learnerId, competencyId } },
      }),
      this.prisma.activityAttempt.count({
        where: {
          run: { learnerId },
          activity: { objective: { competencyId } },
        },
      }),
    ]);

    if (!mastery) return;
    if (attemptCount < InterventionService.LOW_MASTERY_ATTEMPT_THRESHOLD) return;
    if (mastery.confidence >= InterventionService.LOW_MASTERY_CONFIDENCE_CEILING) return;

    await this.createIfNotOpen(learnerId, competencyId, 'LOW_MASTERY_REPEATED_ATTEMPTS', {
      triggerDetail: `${attemptCount} attempts recorded but mastery confidence is still ${(
        mastery.confidence * 100
      ).toFixed(0)}% (below ${(InterventionService.LOW_MASTERY_CONFIDENCE_CEILING * 100).toFixed(
        0,
      )}% threshold).`,
      recommendedAction:
        'High practice volume is not translating into mastery growth — consider re-teaching the underlying concept with a different modality rather than assigning more of the same activity type.',
    });
  }

  private async createIfNotOpen(
    learnerId: string,
    competencyId: string,
    triggerType: 'CONSECUTIVE_WRONG_SAME_COMPETENCY' | 'LOW_MASTERY_REPEATED_ATTEMPTS',
    payload: { triggerDetail: string; recommendedAction: string },
  ) {
    const existingOpen = await this.prisma.interventionRecommendation.findFirst({
      where: { learnerId, competencyId, triggerType, status: 'OPEN' },
    });
    if (existingOpen) return existingOpen;

    const created = await this.prisma.interventionRecommendation.create({
      data: {
        learnerId,
        competencyId,
        triggerType,
        triggerDetail: payload.triggerDetail,
        recommendedAction: payload.recommendedAction,
      },
    });
    this.logger.log(
      `Intervention created: learner=${learnerId} competency=${competencyId} trigger=${triggerType}`,
    );
    return created;
  }

  async listForLearner(learnerId: string, status?: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED') {
    return this.prisma.interventionRecommendation.findMany({
      where: { learnerId, ...(status ? { status } : {}) },
      include: { competency: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listOpen(take = 200) {
    return this.prisma.interventionRecommendation.findMany({
      where: { status: 'OPEN' },
      include: {
        competency: { select: { id: true, name: true } },
        learner: { select: { id: true, firstName: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  async setStatus(id: string, status: 'ACKNOWLEDGED' | 'RESOLVED') {
    return this.prisma.interventionRecommendation.update({
      where: { id },
      data: {
        status,
        ...(status === 'ACKNOWLEDGED' ? { acknowledgedAt: new Date() } : {}),
        ...(status === 'RESOLVED' ? { resolvedAt: new Date() } : {}),
      },
    });
  }
}
