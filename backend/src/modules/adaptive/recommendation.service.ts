import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ZPDCalculatorService } from './zpd-calculator.service';

export interface Recommendation {
  type: 'MISSION' | 'ACTIVITY' | 'REVIEW' | 'PROJECT';
  entityId: string;
  title: string;
  reason: string;
  priority: number;
  estimatedMinutes?: number;
  competencyId?: string;
}

@Injectable()
export class RecommendationService {
  constructor(
    private prisma: PrismaService,
    private zpdCalculator: ZPDCalculatorService,
  ) {}

  /**
   * Generate personalized recommendations for learner
   */
  async getRecommendations(
    learnerId: string,
    limit: number = 10,
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Get ZPD profile
    const zpd = await this.zpdCalculator.calculateZPD(learnerId);

    // 1. Add review recommendations (spaced repetition)
    const reviewRecs = await this.getReviewRecommendations(learnerId);
    recommendations.push(...reviewRecs);

    // 2. Add mission recommendations
    const missionRecs = await this.getMissionRecommendations(learnerId, zpd);
    recommendations.push(...missionRecs);

    // 3. Add activity recommendations for focus areas
    const activityRecs = await this.getActivityRecommendations(learnerId, zpd);
    recommendations.push(...activityRecs);

    // 4. Add challenge recommendations if ready
    if (zpd.readyForChallenge) {
      const challengeRecs = await this.getChallengeRecommendations(learnerId);
      recommendations.push(...challengeRecs);
    }

    // Sort by priority and return top N
    return recommendations.sort((a, b) => b.priority - a.priority).slice(0, limit);
  }

  /**
   * Get review recommendations based on spaced repetition
   */
  private async getReviewRecommendations(
    learnerId: string,
  ): Promise<Recommendation[]> {
    const dueReviews = await this.prisma.masteryRecord.findMany({
      where: {
        learnerId,
        reviewDue: { lte: new Date() },
      },
      include: {
        competency: true,
      },
      orderBy: { reviewDue: 'asc' },
      take: 5,
    });

    return dueReviews.map((record) => ({
      type: 'REVIEW' as const,
      entityId: record.competencyId,
      title: `Review: ${record.competency.name}`,
      reason: 'Due for review to maintain mastery',
      priority: 90, // High priority
      competencyId: record.competencyId,
    }));
  }

  /**
   * Get mission recommendations
   */
  private async getMissionRecommendations(
    learnerId: string,
    zpd: any,
  ): Promise<Recommendation[]> {
    // Get completed missions
    const completedMissions = await this.prisma.missionRun.findMany({
      where: {
        learnerId,
        status: 'COMPLETED',
      },
      select: { missionId: true },
    });

    const completedIds = completedMissions.map((m) => m.missionId);

    // Find missions learner hasn't completed
    const availableMissions = await this.prisma.mission.findMany({
      where: {
        isActive: true,
        id: { notIn: completedIds },
      },
      orderBy: { order: 'asc' },
      take: 5,
    });

    return availableMissions.map((mission, index) => ({
      type: 'MISSION' as const,
      entityId: mission.id,
      title: mission.title,
      reason: index === 0 ? 'Next in your learning path' : 'Recommended mission',
      priority: 70 - index * 5,
      estimatedMinutes: mission.estimatedMinutes,
    }));
  }

  /**
   * Get activity recommendations for focus areas
   */
  private async getActivityRecommendations(
    learnerId: string,
    zpd: any,
  ): Promise<Recommendation[]> {
    if (zpd.recommendedFocus.length === 0) {
      return [];
    }

    // Get competencies for focus areas
    const focusCompetencies = await this.prisma.competency.findMany({
      where: {
        name: { in: zpd.recommendedFocus },
      },
    });

    const recommendations: Recommendation[] = [];

    for (const competency of focusCompetencies.slice(0, 3)) {
      // Get recommended difficulty for this competency
      const difficulty = await this.zpdCalculator.getRecommendedDifficulty(
        learnerId,
        competency.id,
      );

      // Find activities at that difficulty
      const activities = await this.prisma.activity.findMany({
        where: {
          objective: {
            competencyId: competency.id,
          },
          difficulty,
          isActive: true,
        },
        include: {
          objective: true,
        },
        take: 2,
      });

      recommendations.push(
        ...activities.map((activity) => ({
          type: 'ACTIVITY' as const,
          entityId: activity.id,
          title: activity.title,
          reason: `Practice ${competency.name}`,
          priority: 60,
          competencyId: competency.id,
        })),
      );
    }

    return recommendations;
  }

  /**
   * Get challenge recommendations for advanced learners
   */
  private async getChallengeRecommendations(
    learnerId: string,
  ): Promise<Recommendation[]> {
    // Find hard/challenge activities in strength areas
    const masteryRecords = await this.prisma.masteryRecord.findMany({
      where: {
        learnerId,
        confidence: { gte: 0.7 },
      },
      include: {
        competency: true,
      },
      orderBy: { confidence: 'desc' },
      take: 3,
    });

    const recommendations: Recommendation[] = [];

    for (const record of masteryRecords) {
      const activities = await this.prisma.activity.findMany({
        where: {
          objective: {
            competencyId: record.competencyId,
          },
          difficulty: { in: ['HARD', 'CHALLENGE'] },
          isActive: true,
        },
        include: {
          objective: true,
        },
        take: 1,
      });

      recommendations.push(
        ...activities.map((activity) => ({
          type: 'ACTIVITY' as const,
          entityId: activity.id,
          title: `Challenge: ${activity.title}`,
          reason: 'Test your mastery with a challenging problem',
          priority: 50,
          competencyId: record.competencyId,
        })),
      );
    }

    return recommendations;
  }

  /**
   * Get next best activity for a specific competency
   */
  async getNextActivity(
    learnerId: string,
    competencyId: string,
  ): Promise<string | null> {
    // Get recommended difficulty
    const difficulty = await this.zpdCalculator.getRecommendedDifficulty(
      learnerId,
      competencyId,
    );

    // Get activities learner has already attempted
    const attemptedActivityIds = await this.prisma.activityAttempt.findMany({
      where: {
        run: {
          learnerId,
        },
      },
      select: { activityId: true },
      distinct: ['activityId'],
    });

    const attemptedIds = attemptedActivityIds.map((a) => a.activityId);

    // Find next activity at recommended difficulty
    const activity = await this.prisma.activity.findFirst({
      where: {
        objective: {
          competencyId,
        },
        difficulty,
        isActive: true,
        id: { notIn: attemptedIds },
      },
      orderBy: { order: 'asc' },
    });

    return activity?.id || null;
  }

  /**
   * Get learning path suggestion
   */
  async getLearningPath(
    learnerId: string,
    skillId: string,
  ): Promise<{
    competencies: string[];
    estimatedHours: number;
    currentProgress: number;
  }> {
    const competencies = await this.prisma.competency.findMany({
      where: {
        skillId,
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });

    const masteryRecords = await this.prisma.masteryRecord.findMany({
      where: {
        learnerId,
        competencyId: { in: competencies.map((c) => c.id) },
      },
    });

    const masteryMap = new Map(
      masteryRecords.map((r) => [r.competencyId, r.confidence]),
    );

    const totalCompetencies = competencies.length;
    const masteredCount = competencies.filter(
      (c) => (masteryMap.get(c.id) || 0) >= 0.7,
    ).length;

    return {
      competencies: competencies.map((c) => c.name),
      estimatedHours: Math.max(1, (totalCompetencies - masteredCount) * 2),
      currentProgress: totalCompetencies > 0 ? masteredCount / totalCompetencies : 0,
    };
  }
}
