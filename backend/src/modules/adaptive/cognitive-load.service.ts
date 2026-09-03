import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Cognitive Load Engine v1
 *
 * Distinct from ZPDCalculatorService: ZPD looks at *mastery* (which
 * competencies is the learner strong/weak in, over days/weeks) to pick
 * difficulty. This service looks at *pacing/fatigue within a session* —
 * how many hints a learner is burning through, how long they're
 * spending on individual activities, and how much they're pausing —
 * to estimate whether they're currently showing signs of cognitive
 * overload, independent of whether they're getting answers right.
 *
 * v1 scope, stated honestly:
 * - Records one CognitiveLoadSignal row per activity attempt submission.
 * - Computes a rolling-window LOW/MODERATE/HIGH load level from the
 *   learner's most recent signals using a real (if simple) scoring
 *   rule — not a stub/random value.
 * - Does NOT yet act on that load level (e.g. suggest a break, throttle
 *   hint availability, or change activity selection). See
 *   docs/COGNITIVE_LOAD_ENGINE.md for that explicitly-deferred
 *   follow-up.
 */

export type CognitiveLoadLevel = 'LOW' | 'MODERATE' | 'HIGH';

export interface CognitiveLoadSignalInput {
  learnerId: string;
  activityId: string;
  missionRunId?: string | null;
  attemptId?: string | null;
  hintCount?: number;
  timeOnTaskSeconds?: number;
  pauseCount?: number;
}

export interface CognitiveLoadAssessment {
  learnerId: string;
  loadLevel: CognitiveLoadLevel;
  score: number;
  windowSize: number;
  averages: {
    hintCount: number;
    timeOnTaskSeconds: number;
    pauseCount: number;
  };
  recentSignals: Array<{
    id: string;
    activityId: string;
    missionRunId: string | null;
    hintCount: number;
    timeOnTaskSeconds: number;
    pauseCount: number;
    createdAt: Date;
  }>;
}

@Injectable()
export class CognitiveLoadService {
  // Rolling window: how many of the learner's most recent signals feed
  // the load calculation. Kept small deliberately — this is meant to
  // reflect "how is this learner doing right now", not a long-term
  // trend (that's closer to ZPD/growth-velocity territory).
  private readonly WINDOW_SIZE = 8;

  // Thresholds used to flag a single attempt as fatigue-relevant.
  // Chosen as simple, explainable heuristics for v1, not tuned against
  // real usage data yet.
  private readonly HIGH_HINT_THRESHOLD = 3; // 3+ hints on one activity
  private readonly LONG_TIME_ON_TASK_SECONDS = 240; // 4+ minutes on one activity
  private readonly HIGH_PAUSE_THRESHOLD = 3; // 3+ pauses/inactivity gaps

  constructor(private prisma: PrismaService) {}

  /**
   * Record a fatigue-relevant signal for one activity attempt.
   * Called from MissionsService.submitActivity() right after the
   * ActivityAttempt is created, so attemptId/runId are known.
   *
   * Never throws on its own — a failure to record a cognitive-load
   * signal must not break activity submission. Callers get back the
   * created row (or null on failure) so it's visible if needed, but
   * submitActivity() does not need to await/inspect it.
   */
  async recordSignal(
    input: CognitiveLoadSignalInput,
  ): Promise<{ id: string } | null> {
    try {
      const signal = await this.prisma.cognitiveLoadSignal.create({
        data: {
          learnerId: input.learnerId,
          activityId: input.activityId,
          missionRunId: input.missionRunId ?? null,
          attemptId: input.attemptId ?? null,
          hintCount: Math.max(0, input.hintCount ?? 0),
          timeOnTaskSeconds: Math.max(0, input.timeOnTaskSeconds ?? 0),
          pauseCount: Math.max(0, input.pauseCount ?? 0),
        },
        select: { id: true },
      });
      return signal;
    } catch (err) {
      // Intentionally swallow: recording a fatigue signal is a
      // best-effort side effect of submitActivity(), not part of its
      // core contract. Logging left as a follow-up wiring detail once
      // a shared logger is settled on in this module.
      return null;
    }
  }

  /**
   * Compute the learner's current cognitive load level from a rolling
   * window of their most recent signals across all activities.
   *
   * Algorithm (v1, genuinely computed — not a stub):
   * 1. Pull the last WINDOW_SIZE signals for the learner, newest first.
   * 2. For each signal, award load points if it crosses one or more of
   *    the three fatigue thresholds (high hints / long time-on-task /
   *    many pauses). A single attempt can contribute up to 3 points if
   *    it trips all three signals at once — this is what lets, e.g., a
   *    learner burning hints AND taking a long time on the same
   *    activity register as more concerning than either signal alone.
   * 3. Average those per-signal points across the window to get a
   *    score in [0, 3].
   * 4. Map the averaged score to LOW / MODERATE / HIGH via fixed
   *    cutoffs.
   *
   * With fewer than 3 signals in the window, we return LOW rather than
   * drawing a real conclusion from too little data.
   */
  async assessLoad(learnerId: string): Promise<CognitiveLoadAssessment> {
    const recent = await this.prisma.cognitiveLoadSignal.findMany({
      where: { learnerId },
      orderBy: { createdAt: 'desc' },
      take: this.WINDOW_SIZE,
    });

    if (recent.length < 3) {
      return {
        learnerId,
        loadLevel: 'LOW',
        score: 0,
        windowSize: recent.length,
        averages: { hintCount: 0, timeOnTaskSeconds: 0, pauseCount: 0 },
        recentSignals: recent.map((s) => ({
          id: s.id,
          activityId: s.activityId,
          missionRunId: s.missionRunId,
          hintCount: s.hintCount,
          timeOnTaskSeconds: s.timeOnTaskSeconds,
          pauseCount: s.pauseCount,
          createdAt: s.createdAt,
        })),
      };
    }

    let totalPoints = 0;
    let hintSum = 0;
    let timeSum = 0;
    let pauseSum = 0;

    for (const signal of recent) {
      hintSum += signal.hintCount;
      timeSum += signal.timeOnTaskSeconds;
      pauseSum += signal.pauseCount;

      let points = 0;
      if (signal.hintCount >= this.HIGH_HINT_THRESHOLD) points += 1;
      if (signal.timeOnTaskSeconds >= this.LONG_TIME_ON_TASK_SECONDS) points += 1;
      if (signal.pauseCount >= this.HIGH_PAUSE_THRESHOLD) points += 1;
      totalPoints += points;
    }

    const score = totalPoints / recent.length; // in [0, 3]

    let loadLevel: CognitiveLoadLevel;
    if (score >= 1.5) {
      loadLevel = 'HIGH';
    } else if (score >= 0.6) {
      loadLevel = 'MODERATE';
    } else {
      loadLevel = 'LOW';
    }

    return {
      learnerId,
      loadLevel,
      score: Math.round(score * 100) / 100,
      windowSize: recent.length,
      averages: {
        hintCount: Math.round((hintSum / recent.length) * 100) / 100,
        timeOnTaskSeconds: Math.round((timeSum / recent.length) * 100) / 100,
        pauseCount: Math.round((pauseSum / recent.length) * 100) / 100,
      },
      recentSignals: recent.map((s) => ({
        id: s.id,
        activityId: s.activityId,
        missionRunId: s.missionRunId,
        hintCount: s.hintCount,
        timeOnTaskSeconds: s.timeOnTaskSeconds,
        pauseCount: s.pauseCount,
        createdAt: s.createdAt,
      })),
    };
  }
}
