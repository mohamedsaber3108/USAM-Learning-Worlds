import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ZPDCalculatorService } from './zpd-calculator.service';

export interface InterleavedPracticeItem {
  order: number;
  competencyId: string;
  competencyName: string;
  activityId: string | null;
  activityTitle: string | null;
  difficulty: string | null;
  reason: 'REVIEW_DUE' | 'STRUGGLING_FOCUS';
}

/**
 * Interleaving Engine v1.
 *
 * Confirmed genuinely Missing per docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md
 * ("Learning Science Engine" row: "interleaving — no trace found").
 *
 * Distinct from two adjacent, already-real systems (do not confuse with
 * either):
 *   - Spaced Repetition (mastery/reviewDue): decides WHEN to review a
 *     SINGLE competency, on a decay schedule.
 *   - ZPD Calculator (adaptive/zpd-calculator.service.ts): decides WHICH
 *     DIFFICULTY to serve within ONE competency.
 *
 * Neither of those decides the ORDER of a multi-competency practice
 * session. This engine does: it builds a session mixing several due/weak
 * competencies and interleaves them so consecutive items never repeat the
 * same competency — the classic "interleaved practice beats blocked
 * practice for long-term retention" retrieval-practice technique from
 * learning science. This is a real ordering algorithm (round-robin across
 * competency-grouped candidates), not a stub or random shuffle.
 */
@Injectable()
export class InterleavingService {
  constructor(
    private prisma: PrismaService,
    private zpdCalculator: ZPDCalculatorService,
  ) {}

  /**
   * Build an interleaved multi-competency practice set for a learner.
   *
   * 1. Gather a pool of distinct competencies from two real sources:
   *    spaced-repetition review-due records, and ZPD struggling/
   *    recommended-focus competencies.
   * 2. For each competency, pick one concrete next unattempted activity
   *    at the learner's ZPD-recommended difficulty.
   * 3. Round-robin the results across competencies so the final order
   *    alternates competency (never two consecutive items from the same
   *    competency when more than one competency has candidates) instead
   *    of grouping everything from one competency together (blocked
   *    practice — the pattern this engine exists to avoid).
   */
  async getInterleavedPracticeSet(
    learnerId: string,
    limit = 6,
  ): Promise<InterleavedPracticeItem[]> {
    const competencyPool = await this.buildCompetencyPool(learnerId);
    if (competencyPool.length === 0) return [];

    const candidates: InterleavedPracticeItem[] = [];
    for (const entry of competencyPool) {
      const difficulty = await this.zpdCalculator.getRecommendedDifficulty(
        learnerId,
        entry.competencyId,
      );
      const activity = await this.pickNextActivity(learnerId, entry.competencyId, difficulty);
      candidates.push({
        order: 0,
        competencyId: entry.competencyId,
        competencyName: entry.competencyName,
        activityId: activity?.id ?? null,
        activityTitle: activity?.title ?? null,
        difficulty,
        reason: entry.reason,
      });
    }

    const withActivity = candidates.filter((c) => c.activityId);
    if (withActivity.length === 0) return [];

    // Group by competency (currently one candidate per competency, but
    // the round-robin below generalizes correctly if that ever grows).
    const grouped = new Map<string, InterleavedPracticeItem[]>();
    for (const c of withActivity) {
      grouped.set(c.competencyId, [...(grouped.get(c.competencyId) ?? []), c]);
    }

    const ordered: InterleavedPracticeItem[] = [];
    let round = 0;
    while (ordered.length < limit) {
      let addedThisRound = false;
      for (const [, items] of grouped) {
        if (items[round]) {
          ordered.push(items[round]);
          addedThisRound = true;
          if (ordered.length >= limit) break;
        }
      }
      if (!addedThisRound) break;
      round += 1;
    }

    return ordered.map((item, index) => ({ ...item, order: index }));
  }

  /**
   * Pool distinct competencies to interleave across: due-for-review
   * competencies (spaced repetition) plus ZPD's recommended-focus
   * (struggling but practicable) competencies, deduplicated.
   */
  private async buildCompetencyPool(
    learnerId: string,
  ): Promise<Array<{ competencyId: string; competencyName: string; reason: 'REVIEW_DUE' | 'STRUGGLING_FOCUS' }>> {
    const [dueReviews, zpd] = await Promise.all([
      this.prisma.masteryRecord.findMany({
        where: { learnerId, reviewDue: { lte: new Date() } },
        include: { competency: true },
        orderBy: { reviewDue: 'asc' },
        take: 6,
      }),
      this.zpdCalculator.calculateZPD(learnerId),
    ]);

    const pool = new Map<
      string,
      { competencyId: string; competencyName: string; reason: 'REVIEW_DUE' | 'STRUGGLING_FOCUS' }
    >();

    for (const record of dueReviews) {
      pool.set(record.competencyId, {
        competencyId: record.competencyId,
        competencyName: record.competency.name,
        reason: 'REVIEW_DUE',
      });
    }

    if (zpd.recommendedFocus.length > 0) {
      const focusCompetencies = await this.prisma.competency.findMany({
        where: { name: { in: zpd.recommendedFocus } },
      });
      for (const c of focusCompetencies) {
        if (!pool.has(c.id)) {
          pool.set(c.id, { competencyId: c.id, competencyName: c.name, reason: 'STRUGGLING_FOCUS' });
        }
      }
    }

    return Array.from(pool.values());
  }

  private async pickNextActivity(learnerId: string, competencyId: string, difficulty: string) {
    const attemptedActivityIds = await this.prisma.activityAttempt.findMany({
      where: { run: { learnerId }, activity: { objective: { competencyId } } },
      select: { activityId: true },
      distinct: ['activityId'],
    });
    const attemptedIds = attemptedActivityIds.map((a) => a.activityId);

    return this.prisma.activity.findFirst({
      where: {
        objective: { competencyId },
        difficulty: difficulty as any,
        isActive: true,
        id: { notIn: attemptedIds },
      },
      orderBy: { order: 'asc' },
      select: { id: true, title: true },
    });
  }
}
