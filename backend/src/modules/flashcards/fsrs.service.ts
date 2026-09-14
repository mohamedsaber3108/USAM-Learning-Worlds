import { Injectable } from '@nestjs/common';
import {
  createEmptyCard,
  FSRS,
  generatorParameters,
  Rating,
  State,
  type Card,
  type Grade,
} from 'ts-fsrs';

/**
 * Persisted FSRS card state (audit T-P1-4). Mirrors the ts-fsrs `Card`
 * fields we store on FlashcardReview, decoupled from Prisma types.
 */
export interface FsrsCardState {
  stability: number;
  difficulty: number;
  fsrsState: number; // ts-fsrs State enum as int
  reps: number;
  lapses: number;
  elapsedDays: number;
  scheduledDays: number;
  lastReviewedAt: Date | null;
  nextReviewDue: Date | null;
}

export interface FsrsReviewResult extends FsrsCardState {
  /** Convenience: FSRS confidence proxy in [0,1] for legacy UI/aggregation. */
  confidence: number;
}

/**
 * Thin, well-tested wrapper around the `ts-fsrs` Free Spaced Repetition
 * Scheduler (open-spaced-repetition, MIT). Converts between our persisted
 * columns and ts-fsrs `Card` objects, and schedules the next review from a
 * binary remembered/forgot signal (mapped to FSRS ratings).
 *
 * This REPLACES the old naive confidence-bucket -> fixed 1/3/7/14/30-day
 * scheduler. Intervals now adapt per-card to each learner's real recall,
 * using the FSRS memory model (stability + difficulty + retrievability).
 */
@Injectable()
export class FsrsService {
  private readonly fsrs: FSRS;

  constructor() {
    // request_retention 0.9 is the FSRS default target recall probability.
    this.fsrs = new FSRS(generatorParameters({ enable_fuzz: true }));
  }

  /** Build a ts-fsrs Card from persisted state, or a fresh card if new. */
  private toCard(state: Partial<FsrsCardState> | null | undefined): Card {
    if (!state || !state.lastReviewedAt || (state.reps ?? 0) === 0) {
      return createEmptyCard(new Date());
    }
    return {
      due: state.nextReviewDue ?? new Date(),
      stability: state.stability ?? 0,
      difficulty: state.difficulty ?? 0,
      elapsed_days: state.elapsedDays ?? 0,
      scheduled_days: state.scheduledDays ?? 0,
      reps: state.reps ?? 0,
      lapses: state.lapses ?? 0,
      state: (state.fsrsState ?? 0) as State,
      last_review: state.lastReviewedAt ?? undefined,
      learning_steps: 0,
    } as Card;
  }

  /**
   * Schedule the next review. `remembered=false` => Rating.Again (a lapse),
   * `remembered=true` => Rating.Good. (A future UI can pass Hard/Easy for a
   * 4-button grid; this keeps the current binary study UX working.)
   */
  schedule(
    prior: Partial<FsrsCardState> | null | undefined,
    remembered: boolean,
    now: Date = new Date(),
  ): FsrsReviewResult {
    const card = this.toCard(prior);
    const rating: Grade = (remembered ? Rating.Good : Rating.Again) as Grade;

    const scheduled = this.fsrs.next(card, now, rating);
    const next = scheduled.card;

    // Confidence proxy: FSRS retrievability at the moment of review is the
    // most faithful [0,1] "how well do they know it" signal for legacy code
    // (mastery aggregation, "mastered" stat) that still reads `confidence`.
    const retrievability = this.fsrs.get_retrievability(next, now, false) as number;
    const confidence = Number.isFinite(retrievability)
      ? Math.max(0, Math.min(1, retrievability))
      : next.state === State.Review
        ? 0.9
        : 0.3;

    return {
      stability: next.stability,
      difficulty: next.difficulty,
      fsrsState: next.state as number,
      reps: next.reps,
      lapses: next.lapses,
      elapsedDays: next.elapsed_days,
      scheduledDays: next.scheduled_days,
      lastReviewedAt: now,
      nextReviewDue: next.due,
      confidence,
    };
  }
}
