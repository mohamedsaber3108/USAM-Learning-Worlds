import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Flashcard Engine
 *
 * Per-learner spaced-repetition scheduling ported directly from
 * MasteryConfidenceAlgorithm.calculateNextReview (mastery-confidence.algorithm.ts)
 * — same confidence-bucket -> interval-in-days mapping, applied to
 * FlashcardReview instead of MasteryRecord.
 */
@Injectable()
export class FlashcardsService {
  constructor(private prisma: PrismaService) {}

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

    const priorConfidence = review?.confidence ?? 0;
    // Simple bounded confidence update: correct answers step up towards 1,
    // wrong answers step back down towards 0 — mirrors the "weighted
    // success rate moves confidence" spirit of MasteryConfidenceAlgorithm
    // without needing a full Evidence[] history per card.
    const nextConfidence = remembered
      ? Math.min(1, priorConfidence + 0.25)
      : Math.max(0, priorConfidence - 0.3);

    const nextReviewDue = this.calculateNextInterval(nextConfidence, new Date());

    if (!review) {
      review = await this.prisma.flashcardReview.create({
        data: {
          learnerId,
          flashcardId,
          confidence: nextConfidence,
          reviewCount: 1,
          lastReviewedAt: new Date(),
          nextReviewDue,
        },
      });
    } else {
      review = await this.prisma.flashcardReview.update({
        where: { id: review.id },
        data: {
          confidence: nextConfidence,
          reviewCount: review.reviewCount + 1,
          lastReviewedAt: new Date(),
          nextReviewDue,
        },
      });
    }

    return review;
  }

  /**
   * Ported from MasteryConfidenceAlgorithm.calculateNextReview — identical
   * confidence-bucket -> day-interval mapping (1/3/7/14/30 days).
   */
  private calculateNextInterval(confidence: number, lastReviewDate: Date): Date {
    let interval: number;

    if (confidence < 0.3) {
      interval = 1;
    } else if (confidence < 0.5) {
      interval = 3;
    } else if (confidence < 0.7) {
      interval = 7;
    } else if (confidence < 0.9) {
      interval = 14;
    } else {
      interval = 30;
    }

    const nextReview = new Date(lastReviewDate);
    nextReview.setDate(nextReview.getDate() + interval);
    return nextReview;
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
