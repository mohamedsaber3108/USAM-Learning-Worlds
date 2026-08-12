import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ModerationService } from '../ai/moderation.service';

@Injectable()
export class CommunityService {
  constructor(
    private prisma: PrismaService,
    private moderation: ModerationService,
  ) {}

  /**
   * Get community feed (public projects)
   */
  async getCommunityFeed(filters?: {
    type?: string;
    limit?: number;
  }) {
    const projects = await this.prisma.project.findMany({
      where: {
        visibility: 'PUBLIC',
        state: 'SHOWCASED',
      },
      include: {
        learner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: filters?.limit || 20,
    });

    return {
      projects,
      total: projects.length,
    };
  }

  /**
   * Report content (logged to moderation system)
   */
  async reportContent(
    reporterId: string,
    data: {
      entityType: string;
      entityId: string;
      reason: string;
      description?: string;
    },
  ) {
    // Get content to moderate
    let content = '';

    if (data.entityType === 'PROJECT') {
      const project = await this.prisma.project.findUnique({
        where: { id: data.entityId },
      });
      content = `${project?.title} - ${project?.description}`;
    }

    // Moderate the content
    if (content) {
      await this.moderation.moderateWithQuarantine(
        content,
        'TEXT',
        data.entityType,
        data.entityId,
        reporterId,
      );
    }

    return {
      success: true,
      message: 'Content reported and sent for review',
    };
  }

  /**
   * Get quarantined content (moderators only)
   */
  async getQuarantinedContent(status?: string) {
    const validStatus = status || 'PENDING';
    return this.moderation.getQuarantinedContent(validStatus as any);
  }

  /**
   * Review content (moderators only)
   */
  async reviewContent(
    contentId: string,
    moderatorId: string,
    data: {
      decision: 'APPROVED' | 'REJECTED';
      notes?: string;
    },
  ) {
    await this.moderation.reviewContent(
      contentId,
      data.decision,
      moderatorId,
      data.notes,
    );

    return { success: true };
  }

  /**
   * Search community
   */
  async searchCommunity(query: string, filters?: {
    type?: string;
    limit?: number;
  }) {
    const projects = await this.prisma.project.findMany({
      where: {
        visibility: 'PUBLIC',
        state: 'SHOWCASED',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { skills: { has: query } },
        ],
      },
      include: {
        learner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: filters?.limit || 20,
    });

    return {
      query,
      results: projects,
      total: projects.length,
    };
  }

  /**
   * Get trending projects
   */
  async getTrendingProjects(limit: number = 10) {
    return this.prisma.project.findMany({
      where: {
        visibility: 'PUBLIC',
        state: 'SHOWCASED',
      },
      include: {
        learner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get community stats
   */
  async getCommunityStats() {
    const [totalProjects, totalLearners, recentProjects] = await Promise.all([
      this.prisma.project.count({
        where: {
          visibility: 'PUBLIC',
          state: 'SHOWCASED',
        },
      }),
      this.prisma.learner.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.project.count({
        where: {
          visibility: 'PUBLIC',
          state: 'SHOWCASED',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalProjects,
      totalLearners,
      recentProjects,
    };
  }
}
