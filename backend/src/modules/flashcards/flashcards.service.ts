import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { FsrsService } from './fsrs.service';

/**
 * Flashcard Engine
 *
 * Per-learner spaced-repetition scheduling now backed by the real Free
 * Spaced Repetition Scheduler (FSRS) via FsrsService/ts-fsrs (audit T-P1-4).
 * Replaces the previous naive confidence-bucket -> fixed 1/3/7/14/30-day
 * scheduler; intervals adapt per-card to each learner's actual recall.
 */
@Injectable()
export class FlashcardsService {
  constructor(
    private prisma: PrismaService,
    private fsrs: FsrsService,
  ) {}

  async listByDomain(domainId: string) {
    return this.prisma.flashcard.findMany({
      where: { domainId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Cards due for review right now for this learner: either never
   * reviewed, or nextReviewDue in the past. Falls back to "not yet
   * reviewed" cards for a given domain so a first-time learner gets a
   * real study session immediately.
   */
  async getDueCards(learnerId: string, domainId?: string, limit = 20) {
    const now = new Date();

    const reviewedButDue = await this.prisma.flashcardReview.findMany({
      where: { learnerId, nextReviewDue: { lte: now } },
      include: { flashcard: true },
      take: limit,
    });

    const reviewedIds = new Set(
      (
        await this.prisma.flashcardReview.findMany({
          where: { learnerId },
          select: { flashcardId: true },
        })
      ).map((r) => r.flashcardId),
    );

    const remaining = limit - reviewedButDue.length;
    let neverReviewed: any[] = [];
    if (remaining > 0) {
      neverReviewed = await this.prisma.flashcard.findMany({
        where: {
          isActive: true,
          ...(domainId ? { domainId } : {}),
          id: { notIn: Array.from(reviewedIds) },
        },
        take: remaining,
        orderBy: { createdAt: 'asc' },
      });
    }

    const due = reviewedButDue
      .filter((r) => (domainId ? r.flashcard.domainId === domainId : true))
      .map((r) => r.flashcard);

    return [...due, ...neverReviewed];
  }

  /**
   * Record a study-session review: success/failure feeds a confidence
   * bump/decay, then calculateNextInterval (same bucket boundaries as
   * MasteryConfidenceAlgorithm.calculateNextReview) schedules the next
   * review date.
   */
  async recordReview(learnerId: string, flashcardId: string, remembered: boolean) {
    const flashcard = await this.prisma.flashcard.findUnique({ where: { id: flashcardId } });
    if (!flashcard) throw new NotFoundException('Flashcard not found');

    let review = await this.prisma.flashcardReview.findUnique({
      where: { learnerId_flashcardId: { learnerId, flashcardId } },
    });

    const now = new Date();
    // Real FSRS scheduling: feed the prior persisted card state + the
    // remembered/forgot signal into the scheduler, get back the next
    // memory state + due date.
    const next = this.fsrs.schedule(review ?? null, remembered, now);

    const fsrsData = {
      confidence: next.confidence,
      lastReviewedAt: next.lastReviewedAt,
      nextReviewDue: next.nextReviewDue,
      stability: next.stability,
      difficulty: next.difficulty,
      fsrsState: next.fsrsState,
      reps: next.reps,
      lapses: next.lapses,
      elapsedDays: next.elapsedDays,
      scheduledDays: next.scheduledDays,
    };

    if (!review) {
      review = await this.prisma.flashcardReview.create({
        data: {
          learnerId,
          flashcardId,
          reviewCount: 1,
          ...fsrsData,
        },
      });
    } else {
      review = await this.prisma.flashcardReview.update({
        where: { id: review.id },
        data: {
          reviewCount: review.reviewCount + 1,
          ...fsrsData,
        },
      });
    }

    return review;
  }

  async getStats(learnerId: string) {
    const reviews = await this.prisma.flashcardReview.findMany({ where: { learnerId } });
    const now = new Date();
    return {
      totalReviewed: reviews.length,
      dueNow: reviews.filter((r) => r.nextReviewDue && r.nextReviewDue <= now).length,
      mastered: reviews.filter((r) => r.confidence >= 0.9).length,
    };
  }
}
