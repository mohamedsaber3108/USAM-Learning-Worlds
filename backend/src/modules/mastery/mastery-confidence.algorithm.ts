import { Injectable } from '@nestjs/common';
import { Evidence, EvidenceType } from '@prisma/client';

/**
 * Mastery Confidence Algorithm
 *
 * Evidence-based learning system inspired by FSRS (Free Spaced Repetition Scheduler)
 * Calculates confidence (0.0 - 1.0) based on:
 * 1. Weighted success rate (recent evidence weighted more)
 * 2. Evidence diversity (8 evidence types)
 * 3. Spacing effect (distributed > massed practice)
 * 4. Forgetting curve (decay over time)
 */

@Injectable()
export class MasteryConfidenceAlgorithm {
  /**
   * Calculate mastery confidence from evidence history
   * Returns value between 0.0 and 1.0
   */
  calculate(evidence: Evidence[]): number {
    if (evidence.length === 0) return 0.0;

    // 1. Weighted success rate (60% weight)
    const successRate = this.calculateWeightedSuccessRate(evidence);

    // 2. Evidence diversity bonus (20% weight)
    const diversity = this.calculateDiversityScore(evidence);

    // 3. Spacing effect (20% weight)
    const spacing = this.calculateSpacingScore(evidence);

    // Combine factors
    const baseConfidence = successRate * 0.6 + diversity * 0.2 + spacing * 0.2;

    // 4. Apply forgetting curve (recency factor)
    const recency = this.calculateRecencyFactor(evidence);

    // Final confidence (clamped to 0-1)
    return Math.max(0, Math.min(1, baseConfidence * recency));
  }

  /**
   * 1. Weighted Success Rate
   * Recent evidence is weighted more heavily
   */
  private calculateWeightedSuccessRate(evidence: Evidence[]): number {
    let totalWeight = 0;
    let weightedSuccess = 0;

    evidence.forEach((e, index) => {
      // More recent evidence has higher weight (exponential decay)
      const weight = Math.exp(-0.1 * (evidence.length - index - 1));
      totalWeight += weight;

      if (e.success) {
        weightedSuccess += weight;
      }
    });

    return totalWeight > 0 ? weightedSuccess / totalWeight : 0;
  }

  /**
   * 2. Evidence Diversity Score
   * Reward variety in evidence types (8 types total)
   */
  private calculateDiversityScore(evidence: Evidence[]): number {
    const types = new Set(evidence.map((e) => e.type));
    const uniqueTypes = types.size;

    // 8 evidence types total
    const allTypes = [
      'KNOWLEDGE',
      'APPLICATION',
      'CREATION',
      'EXPLANATION',
      'CONVERSATION',
      'PROBLEM_SOLVING',
      'TRANSFER',
      'REFLECTION',
    ];

    return uniqueTypes / allTypes.length;
  }

  /**
   * 3. Spacing Effect Score
   * Distributed practice > massed practice
   * Measures time intervals between practice sessions
   */
  private calculateSpacingScore(evidence: Evidence[]): number {
    if (evidence.length < 2) return 0.5; // Neutral for single evidence

    // Calculate intervals between evidence (in days)
    const intervals: number[] = [];
    for (let i = 1; i < evidence.length; i++) {
      const timeDiff =
        new Date(evidence[i].createdAt).getTime() -
        new Date(evidence[i - 1].createdAt).getTime();
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      intervals.push(daysDiff);
    }

    // Ideal spacing is 1-7 days
    // Too close (< 1 day) = massed practice (bad)
    // Too far (> 30 days) = forgetting (bad)
    const avgInterval =
      intervals.reduce((sum, val) => sum + val, 0) / intervals.length;

    if (avgInterval < 1) {
      return 0.3; // Massed practice
    } else if (avgInterval > 30) {
      return 0.4; // Too spaced out
    } else if (avgInterval >= 1 && avgInterval <= 7) {
      return 1.0; // Ideal spacing
    } else {
      return 0.7; // Acceptable spacing
    }
  }

  /**
   * 4. Recency Factor (Forgetting Curve)
   * Confidence decays over time without practice
   * Based on Ebbinghaus forgetting curve
   */
  private calculateRecencyFactor(evidence: Evidence[]): number {
    if (evidence.length === 0) return 1.0;

    // Get most recent evidence
    const mostRecent = evidence[evidence.length - 1];
    const daysSince =
      (Date.now() - new Date(mostRecent.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);

    // Forgetting curve: retention = e^(-t/s)
    // s = stability (days before 63% forgotten)
    // Higher confidence = higher stability
    const stability = 7; // Base stability of 7 days

    const retention = Math.exp(-daysSince / stability);

    // Minimum retention of 0.5 (doesn't decay below 50%)
    return Math.max(0.5, retention);
  }

  /**
   * Determine mastery state from confidence score
   */
  determineState(confidence: number): string {
    if (confidence === 0) return 'NOT_STARTED';
    if (confidence < 0.20) return 'INTRODUCED';
    if (confidence < 0.40) return 'EXPLORING';
    if (confidence < 0.60) return 'PRACTICING';
    if (confidence < 0.75) return 'DEVELOPING';
    if (confidence < 0.90) return 'PROFICIENT';
    return 'MASTERED';
  }

  /**
   * Calculate next review date using FSRS-inspired scheduling
   */
  calculateNextReview(
    confidence: number,
    lastReviewDate: Date,
  ): Date {
    // Base interval in days based on confidence
    let interval: number;

    if (confidence < 0.3) {
      interval = 1; // 1 day (still learning)
    } else if (confidence < 0.5) {
      interval = 3; // 3 days
    } else if (confidence < 0.7) {
      interval = 7; // 1 week
    } else if (confidence < 0.85) {
      interval = 14; // 2 weeks
    } else {
      interval = 30; // 1 month (mastered)
    }

    const nextReview = new Date(lastReviewDate);
    nextReview.setDate(nextReview.getDate() + interval);

    return nextReview;
  }
}
