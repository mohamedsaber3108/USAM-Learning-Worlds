import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Attention/Engagement Engine v1
 *
 * Gap Matrix note (Attention/Engagement Engine row): "no behavioral-signal
 * tracking (hesitation, rapid-skipping, time-on-task) distinct from the
 * already-Missing Cognitive Load Engine ... `LearningEvent.data: Json`
 * could carry such signals but nothing writes/reads them today."
 *
 * Cognitive Load Engine (cognitive-load.service.ts) already covers
 * *within-attempt* fatigue (hints/time/pauses on a single activity, via an
 * explicit client-supplied signal). This engine is deliberately distinct:
 * it looks at *behavioral engagement across a session*, computed purely
 * from real `LearningEvent` rows that already exist (ACTIVITY_STARTED /
 * ACTIVITY_COMPLETED pairs) — no new input contract needed, no new table.
 *
 * v1 scope, stated honestly:
 * - "Abandonment rate": fraction of ACTIVITY_STARTED events in a session
 *   with no matching ACTIVITY_COMPLETED for the same entityId — a real
 *   rapid-skipping/disengagement signal.
 * - "Median time-to-completion": for activities that WERE completed,
 *   how long between started/completed timestamps (a real hesitation-vs-
 *   speed-through signal, distinct from CognitiveLoadSignal's per-attempt
 *   timeOnTaskSeconds which requires the client to explicitly report it).
 * - Read-only. Does not yet feed back into recommendation/pacing decisions
 *   — same explicitly-deferred "does not act on it yet" pattern already
 *   used by Cognitive Load Engine v1.
 */
@Injectable()
export class EngagementService {
  constructor(private prisma: PrismaService) {}

  private static readonly WINDOW_DAYS = 14;

  async assessEngagement(learnerId: string) {
    const since = new Date(Date.now() - EngagementService.WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const events = await this.prisma.learningEvent.findMany({
      where: {
        learnerId,
        createdAt: { gte: since },
        type: { in: ['ACTIVITY_STARTED', 'ACTIVITY_COMPLETED'] },
      },
      orderBy: { createdAt: 'asc' },
      select: { type: true, entityId: true, createdAt: true },
    });

    // Pair each ACTIVITY_STARTED with the next ACTIVITY_COMPLETED for the
    // same entityId that occurs after it (simple FIFO pairing per entity —
    // good enough for v1 since retries on the same activity are rare and
    // this errs toward under-counting abandonment, not over-counting it).
    const pendingStarts = new Map<string, Date[]>();
    let startedCount = 0;
    let completedCount = 0;
    const completionDurationsMs: number[] = [];

    for (const ev of events) {
      if (!ev.entityId) continue;
      if (ev.type === 'ACTIVITY_STARTED') {
        startedCount++;
        const arr = pendingStarts.get(ev.entityId) ?? [];
        arr.push(ev.createdAt);
        pendingStarts.set(ev.entityId, arr);
      } else if (ev.type === 'ACTIVITY_COMPLETED') {
        completedCount++;
        const arr = pendingStarts.get(ev.entityId);
        if (arr && arr.length > 0) {
          const startedAt = arr.shift()!;
          completionDurationsMs.push(ev.createdAt.getTime() - startedAt.getTime());
        }
      }
    }

    const unmatchedStarts = [...pendingStarts.values()].reduce((sum, arr) => sum + arr.length, 0);
    const abandonmentRate = startedCount > 0 ? unmatchedStarts / startedCount : 0;

    const sortedDurations = [...completionDurationsMs].sort((a, b) => a - b);
    const medianDurationSeconds =
      sortedDurations.length > 0
        ? Math.round(sortedDurations[Math.floor(sortedDurations.length / 2)] / 1000)
        : null;

    let engagementLevel: 'LOW' | 'MODERATE' | 'HIGH';
    if (startedCount < 3) {
      // Not enough real signal to draw a conclusion yet — honestly report
      // that rather than defaulting to a misleadingly confident label.
      engagementLevel = 'MODERATE';
    } else if (abandonmentRate >= 0.5) {
      engagementLevel = 'LOW';
    } else if (abandonmentRate >= 0.2) {
      engagementLevel = 'MODERATE';
    } else {
      engagementLevel = 'HIGH';
    }

    return {
      learnerId,
      windowDays: EngagementService.WINDOW_DAYS,
      startedCount,
      completedCount,
      unmatchedStarts,
      abandonmentRate: Math.round(abandonmentRate * 100) / 100,
      medianCompletionSeconds: medianDurationSeconds,
      engagementLevel,
      insufficientData: startedCount < 3,
    };
  }
}
