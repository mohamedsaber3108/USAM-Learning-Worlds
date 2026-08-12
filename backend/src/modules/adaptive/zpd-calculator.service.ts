import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * ZPD (Zone of Proximal Development) Calculator
 *
 * Determines optimal difficulty level for each learner based on:
 * - Current mastery levels across competencies
 * - Recent performance trends
 * - Challenge preference
 * - Growth trajectory
 */

export interface ZPDProfile {
  learnerId: string;
  optimalDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CHALLENGE';
  confidenceRange: { min: number; max: number };
  readyForChallenge: boolean;
  strugglingAreas: string[];
  strengthAreas: string[];
  recommendedFocus: string[];
}

@Injectable()
export class ZPDCalculatorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate learner's ZPD profile
   */
  async calculateZPD(learnerId: string): Promise<ZPDProfile> {
    // Get all mastery records
    const masteryRecords = await this.prisma.masteryRecord.findMany({
      where: { learnerId },
      include: {
        competency: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (masteryRecords.length === 0) {
      return this.getDefaultProfile(learnerId);
    }

    // Calculate average confidence
    const avgConfidence =
      masteryRecords.reduce((sum, r) => sum + r.confidence, 0) /
      masteryRecords.length;

    // Identify struggling areas (confidence < 0.5)
    const strugglingAreas = masteryRecords
      .filter((r) => r.confidence < 0.5)
      .map((r) => r.competency.name);

    // Identify strength areas (confidence >= 0.8)
    const strengthAreas = masteryRecords
      .filter((r) => r.confidence >= 0.8)
      .map((r) => r.competency.name);

    // Determine optimal difficulty based on confidence
    let optimalDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CHALLENGE';
    if (avgConfidence < 0.4) {
      optimalDifficulty = 'EASY';
    } else if (avgConfidence < 0.65) {
      optimalDifficulty = 'MEDIUM';
    } else if (avgConfidence < 0.85) {
      optimalDifficulty = 'HARD';
    } else {
      optimalDifficulty = 'CHALLENGE';
    }

    // Check if ready for challenge
    const recentlyPracticed = masteryRecords.filter(
      (r) =>
        r.lastPracticed &&
        new Date(r.lastPracticed).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
    );
    const recentSuccessRate =
      recentlyPracticed.length > 0
        ? recentlyPracticed.filter((r) => r.confidence >= 0.7).length /
          recentlyPracticed.length
        : 0;

    const readyForChallenge = recentSuccessRate >= 0.7 && avgConfidence >= 0.6;

    // Recommend focus areas (low confidence but not too low)
    const recommendedFocus = masteryRecords
      .filter((r) => r.confidence >= 0.3 && r.confidence < 0.7)
      .sort((a, b) => b.evidenceCount - a.evidenceCount) // Prioritize practiced areas
      .slice(0, 3)
      .map((r) => r.competency.name);

    return {
      learnerId,
      optimalDifficulty,
      confidenceRange: {
        min: Math.min(...masteryRecords.map((r) => r.confidence)),
        max: Math.max(...masteryRecords.map((r) => r.confidence)),
      },
      readyForChallenge,
      strugglingAreas: strugglingAreas.slice(0, 5),
      strengthAreas: strengthAreas.slice(0, 5),
      recommendedFocus,
    };
  }

  /**
   * Get activity difficulty for learner based on competency
   */
  async getRecommendedDifficulty(
    learnerId: string,
    competencyId: string,
  ): Promise<'EASY' | 'MEDIUM' | 'HARD' | 'CHALLENGE'> {
    const mastery = await this.prisma.masteryRecord.findFirst({
      where: {
        learnerId,
        competencyId,
      },
    });

    if (!mastery) {
      return 'EASY'; // Start easy for new competencies
    }

    // ZPD: slightly above current level
    if (mastery.confidence < 0.3) {
      return 'EASY';
    } else if (mastery.confidence < 0.6) {
      return 'MEDIUM';
    } else if (mastery.confidence < 0.8) {
      return 'HARD';
    } else {
      return 'CHALLENGE';
    }
  }

  /**
   * Check if learner should level up
   */
  async shouldLevelUp(learnerId: string): Promise<boolean> {
    const masteryRecords = await this.prisma.masteryRecord.findMany({
      where: { learnerId },
    });

    if (masteryRecords.length === 0) return false;

    // Level up if 70% of competencies are at PROFICIENT or higher
    const proficientCount = masteryRecords.filter(
      (r) => r.confidence >= 0.7,
    ).length;

    return proficientCount / masteryRecords.length >= 0.7;
  }

  /**
   * Default profile for new learners
   */
  private getDefaultProfile(learnerId: string): ZPDProfile {
    return {
      learnerId,
      optimalDifficulty: 'EASY',
      confidenceRange: { min: 0, max: 0 },
      readyForChallenge: false,
      strugglingAreas: [],
      strengthAreas: [],
      recommendedFocus: [],
    };
  }

  /**
   * Calculate growth velocity (rate of improvement)
   */
  async calculateGrowthVelocity(
    learnerId: string,
    days: number = 30,
  ): Promise<number> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const evidence = await this.prisma.evidence.findMany({
      where: {
        learnerId,
        createdAt: { gte: cutoffDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (evidence.length < 5) {
      return 0; // Not enough data
    }

    // Calculate trend: improvement in success rate over time
    const firstHalf = evidence.slice(0, Math.floor(evidence.length / 2));
    const secondHalf = evidence.slice(Math.floor(evidence.length / 2));

    const firstHalfSuccess =
      firstHalf.filter((e) => e.success).length / firstHalf.length;
    const secondHalfSuccess =
      secondHalf.filter((e) => e.success).length / secondHalf.length;

    return secondHalfSuccess - firstHalfSuccess; // Positive = improving
  }
}
