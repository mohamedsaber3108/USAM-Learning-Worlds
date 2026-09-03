import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';

@Injectable()
export class ParentsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  /**
   * Get parent's children
   */
  async getChildren(guardianId: string) {
    const guardianships = await this.prisma.guardianship.findMany({
      where: { guardianId },
      include: {
        learner: {
          select: {
            id: true,
            userId: true,
            displayName: true,
            ageBand: true,
            avatarUrl: true,
            status: true,
          },
        },
      },
    });

    return guardianships.map((rel) => ({
      relationshipId: rel.id,
      learner: rel.learner,
      relationship: rel.relationship,
      status: rel.status,
      linkedAt: rel.createdAt,
    }));
  }

  /**
   * Get child's dashboard
   */
  async getChildDashboard(parentId: string, learnerId: string) {
    // Verify parent-child relationship
    await this.verifyRelationship(parentId, learnerId);

    const [progression, mastery, recentActivity, projects] = await Promise.all([
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
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
      this.prisma.evidence.findMany({
        where: { learnerId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.project.count({
        where: { learnerId, state: 'SHOWCASED' },
      }),
    ]);

    const streak = await this.prisma.practiceStreak.findUnique({
      where: { learnerId },
    });

    return {
      progression: {
        level: progression?.level || 1,
        totalXP: progression?.totalXP || 0,
        coins: progression?.coins || 0,
      },
      streak: {
        current: streak?.currentStreak || 0,
        longest: streak?.longestStreak || 0,
      },
      mastery: {
        total: mastery.length,
        proficient: mastery.filter((m) => m.confidence >= 0.7).length,
        developing: mastery.filter((m) => m.confidence >= 0.4 && m.confidence < 0.7).length,
        emerging: mastery.filter((m) => m.confidence < 0.4).length,
        byDomain: this.groupByDomain(mastery),
      },
      recentActivity: recentActivity.map((e) => ({
        type: e.type,
        success: e.success,
        date: e.createdAt,
      })),
      projects: {
        showcased: projects,
      },
    };
  }

  /**
   * Get child's learning progress
   */
  async getChildProgress(parentId: string, learnerId: string) {
    await this.verifyRelationship(parentId, learnerId);

    const [masteryRecords, missions, evidence] = await Promise.all([
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
      this.prisma.missionRun.findMany({
        where: { learnerId, status: 'COMPLETED' },
        include: {
          mission: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        take: 10,
      }),
      this.prisma.evidence.findMany({
        where: { learnerId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Calculate weekly progress
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyEvidence = evidence.filter((e) => e.createdAt >= weekAgo);
    const weeklySuccessRate =
      weeklyEvidence.length > 0
        ? weeklyEvidence.filter((e) => e.success).length / weeklyEvidence.length
        : 0;

    return {
      mastery: masteryRecords.map((m) => ({
        competency: m.competency.name,
        skill: m.competency.skill.name,
        domain: m.competency.skill.domain.name,
        confidence: m.confidence,
        state: m.state,
        evidenceCount: m.evidenceCount,
        lastPracticed: m.lastPracticed,
      })),
      recentMissions: missions.map((m) => ({
        title: m.mission.title,
        completedAt: m.completedAt,
      })),
      weeklyStats: {
        practiceCount: weeklyEvidence.length,
        successRate: Math.round(weeklySuccessRate * 100),
      },
    };
  }

  /**
   * Get child's activity log
   */
  async getChildActivity(
    parentId: string,
    learnerId: string,
    days: number = 7,
  ) {
    await this.verifyRelationship(parentId, learnerId);

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [evidence, missions, projects] = await Promise.all([
      this.prisma.evidence.findMany({
        where: {
          learnerId,
          createdAt: { gte: since },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.missionRun.findMany({
        where: {
          learnerId,
          startedAt: { gte: since },
        },
        include: {
          mission: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.project.findMany({
        where: {
          learnerId,
          updatedAt: { gte: since },
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return {
      days,
      activities: {
        evidence: evidence.map((e) => ({
          type: e.type,
          success: e.success,
          score: e.score,
          date: e.createdAt,
        })),
        missions: missions.map((m) => ({
          title: m.mission.title,
          status: m.status,
          date: m.startedAt,
        })),
        projects: projects.map((p) => ({
          title: p.title,
          state: p.state,
          date: p.updatedAt,
        })),
      },
    };
  }

  /**
   * Set learning time limits
   */
  async setTimeLimits(
    parentId: string,
    learnerId: string,
    limits: {
      dailyMinutes?: number;
      weeklyMinutes?: number;
      bedtimeHour?: number;
    },
  ) {
    await this.verifyRelationship(parentId, learnerId);

    // Store in learner preferences
    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
    });

    const preferencesBefore = (learner?.preferences as any) || {};
    const preferences = { ...preferencesBefore, timeLimits: limits };

    await this.prisma.learner.update({
      where: { id: learnerId },
      data: {
        preferences: preferences as any,
      },
    });

    await this.auditLog.record({
      actorUserId: parentId,
      actorRole: 'GUARDIAN',
      action: 'SET_TIME_LIMITS',
      targetType: 'Learner',
      targetId: learnerId,
      before: preferencesBefore.timeLimits ?? null,
      after: limits,
    });

    return { success: true, limits };
  }

  /**
   * Get family summary
   */
  async getFamilySummary(parentId: string) {
    const children = await this.getChildren(parentId);

    const summaries = await Promise.all(
      children.map(async (child) => {
        const dashboard = await this.getChildDashboard(
          parentId,
          child.learner.id,
        );

        return {
          learner: child.learner,
          summary: {
            level: dashboard.progression.level,
            currentStreak: dashboard.streak.current,
            proficientCount: dashboard.mastery.proficient,
            recentActivityCount: dashboard.recentActivity.length,
          },
        };
      }),
    );

    return {
      totalChildren: children.length,
      children: summaries,
    };
  }

  /**
   * Verify guardian-learner relationship
   */
  private async verifyRelationship(guardianId: string, learnerId: string) {
    const relationship = await this.prisma.guardianship.findFirst({
      where: {
        guardianId,
        learnerId,
        status: 'ACTIVE',
      },
    });

    if (!relationship) {
      throw new ForbiddenException('No access to this learner');
    }

    return relationship;
  }

  /**
   * Group mastery records by domain
   */
  private groupByDomain(mastery: any[]) {
    const grouped: Record<string, any> = {};

    mastery.forEach((m) => {
      const domain = m.competency.skill.domain.name;

      if (!grouped[domain]) {
        grouped[domain] = {
          total: 0,
          proficient: 0,
          avgConfidence: 0,
        };
      }

      grouped[domain].total++;
      if (m.confidence >= 0.7) {
        grouped[domain].proficient++;
      }
      grouped[domain].avgConfidence += m.confidence;
    });

    Object.keys(grouped).forEach((domain) => {
      grouped[domain].avgConfidence /= grouped[domain].total;
      grouped[domain].avgConfidence = Math.round(
        grouped[domain].avgConfidence * 100,
      );
    });

    return grouped;
  }
}
