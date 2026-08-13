/**
 * Learner Context Service
 *
 * Assembles rich learning context for AI personalization
 * Implements data minimization - only includes pedagogically necessary information
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LearnerContext } from './interfaces/learner-context.interface';

@Injectable()
export class LearnerContextService {
  constructor(private prisma: PrismaService) {}

  /**
   * Build complete learner context for AI
   */
  async buildContext(learnerId: string, sessionId?: string): Promise<LearnerContext> {
    const [learner, progression, mastery, recentEvidence, practiceStreak] =
      await Promise.all([
        this.prisma.learner.findUnique({
          where: { id: learnerId },
        }),
        this.prisma.progression.findUnique({
          where: { learnerId },
        }),
        this.prisma.masteryRecord.findMany({
          where: { learnerId },
          include: {
            competency: {
              include: {
                skill: {
                  include: {
                    domain: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.evidence.findMany({
          where: {
            learnerId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
        this.prisma.practiceStreak.findUnique({
          where: { learnerId },
        }),
      ]);

    if (!learner) {
      throw new Error('Learner not found');
    }

    // Calculate mastery summary
    const masterySummary = this.calculateMasterySummary(mastery);
    const performanceSummary = this.calculatePerformanceSummary(recentEvidence);

    // Get current learning state (most recent mission run)
    const currentMissionRun = await this.prisma.missionRun.findFirst({
      where: {
        learnerId,
        status: 'IN_PROGRESS',
      },
      include: {
        mission: true,
      },
      orderBy: { startedAt: 'desc' },
    });

    // Get current project
    const currentProject = await this.prisma.project.findFirst({
      where: {
        learnerId,
        state: { in: ['PLANNING', 'BUILDING', 'REVIEW'] },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Build context
    const context: LearnerContext = {
      learnerId,
      age: this.calculateAge(learner.dateOfBirth),
      ageBand: learner.ageBand,
      language: (learner.preferences as any)?.language || 'en',
      displayName: learner.firstName, // Only first name for privacy

      mastery: masterySummary,
      recentPerformance: performanceSummary,

      sessionId,
      sessionStartedAt: new Date(),
    };

    // Add current mission if exists
    if (currentMissionRun) {
      context.currentMission = {
        id: currentMissionRun.missionId,
        title: currentMissionRun.mission.title,
        type: currentMissionRun.mission.type,
      };
    }

    // Add current project if exists
    if (currentProject) {
      context.currentProject = {
        id: currentProject.id,
        title: currentProject.title,
      };
    }

    // Add preferences if available
    const prefs = learner.preferences as any;
    if (prefs) {
      context.preferences = {
        interactionStyle: prefs.interactionStyle,
        pacePreference: prefs.pacePreference,
        challengeLevel: prefs.challengeLevel,
      };
    }

    return context;
  }

  /**
   * Build lightweight context (for simple tasks)
   */
  async buildLightweightContext(learnerId: string): Promise<Partial<LearnerContext>> {
    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
    });

    if (!learner) {
      throw new Error('Learner not found');
    }

    return {
      learnerId,
      age: this.calculateAge(learner.dateOfBirth),
      ageBand: learner.ageBand,
      language: (learner.preferences as any)?.language || 'en',
      displayName: learner.firstName,
    };
  }

  /**
   * Calculate mastery summary
   */
  private calculateMasterySummary(masteryRecords: any[]) {
    const proficientCount = masteryRecords.filter(
      (m) => m.confidence >= 0.75,
    ).length;
    const masteringCount = masteryRecords.filter(
      (m) => m.confidence >= 0.5 && m.confidence < 0.75,
    ).length;
    const needsReviewCount = masteryRecords.filter(
      (m) => m.reviewDue && m.reviewDue <= new Date(),
    ).length;

    // Get top 3 strengths (highest confidence)
    const strengths = masteryRecords
      .filter((m) => m.confidence >= 0.75)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .map((m) => m.competency.name);

    // Get areas needing support (low confidence but practiced)
    const struggles = masteryRecords
      .filter((m) => m.confidence < 0.5 && m.evidenceCount > 2)
      .sort((a, b) => a.confidence - b.confidence)
      .slice(0, 3)
      .map((m) => m.competency.name);

    return {
      totalCompetencies: masteryRecords.length,
      proficientCount,
      masteringCount,
      needsReviewCount,
      strengths,
      struggles,
    };
  }

  /**
   * Calculate recent performance summary
   */
  private calculatePerformanceSummary(evidence: any[]) {
    if (evidence.length === 0) {
      return {
        successRate: 0,
        activitiesCompleted: 0,
        hintsUsed: 0,
        commonErrors: [],
        lastPracticeDate: new Date(),
      };
    }

    const successCount = evidence.filter((e) => e.success).length;
    const successRate = successCount / evidence.length;

    // Identify common error patterns (simplified - in production this would be more sophisticated)
    const errorTypes = new Set<string>();
    evidence
      .filter((e) => !e.success && e.context)
      .forEach((e) => {
        if (e.context.errorType) {
          errorTypes.add(e.context.errorType);
        }
      });

    const mostRecentEvidence = evidence.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0];

    return {
      successRate,
      activitiesCompleted: evidence.length,
      hintsUsed: 0, // Would track this separately
      commonErrors: Array.from(errorTypes),
      lastPracticeDate: mostRecentEvidence.createdAt,
    };
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date | null): number {
    if (!dateOfBirth) {
      return 10; // Default fallback
    }

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}
