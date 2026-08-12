import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new project
   */
  async createProject(
    learnerId: string,
    data: {
      title: string;
      description: string;
      type: string;
      visibility: string;
      tags?: string[];
    },
  ) {
    const project = await this.prisma.project.create({
      data: {
        learnerId,
        title: data.title,
        description: data.description,
        visibility: data.visibility as any,
        state: 'DRAFT',
        skills: data.tags || [],
      },
    });

    return project;
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: string, requestingLearnerId?: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        learner: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check visibility permissions
    if (project.visibility === 'PRIVATE' && project.learnerId !== requestingLearnerId) {
      throw new ForbiddenException('This project is private');
    }

    return project;
  }

  /**
   * Update project
   */
  async updateProject(
    projectId: string,
    learnerId: string,
    data: Partial<{
      title: string;
      description: string;
      state: string;
      visibility: string;
      tags: string[];
    }>,
  ) {
    // Verify ownership
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.learnerId !== learnerId) {
      throw new ForbiddenException('Not authorized to update this project');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        title: data.title,
        description: data.description,
        state: data.state as any,
        visibility: data.visibility as any,
        skills: data.tags,
      },
    });
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string, learnerId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.learnerId !== learnerId) {
      throw new ForbiddenException('Not authorized to delete this project');
    }

    await this.prisma.project.delete({
      where: { id: projectId },
    });

    return { success: true };
  }

  /**
   * Get learner's portfolio
   */
  async getPortfolio(learnerId: string, requestingLearnerId?: string) {
    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
    });

    if (!learner) {
      throw new NotFoundException('Learner not found');
    }

    // Determine which projects to show based on visibility
    const isOwnPortfolio = learnerId === requestingLearnerId;

    const projects = await this.prisma.project.findMany({
      where: {
        learnerId,
        ...(isOwnPortfolio
          ? {}
          : {
              visibility: { in: ['PUBLIC', 'GUARDIANS_ONLY'] },
              state: { in: ['SHOWCASED', 'COMPLETED'] },
            }),
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      learner: {
        id: learner.id,
        name: learner.displayName,
      },
      projects,
      stats: {
        totalProjects: projects.length,
        showcasedProjects: projects.filter((p) => p.state === 'SHOWCASED').length,
      },
    };
  }

  /**
   * Browse public projects (community feed)
   */
  async browseProjects(filters?: {
    type?: string;
    tags?: string[];
    limit?: number;
  }) {
    const projects = await this.prisma.project.findMany({
      where: {
        visibility: 'PUBLIC',
        state: 'SHOWCASED',
        ...(filters?.tags && { skills: { hasSome: filters.tags } }),
      },
      include: {
        learner: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: filters?.limit || 20,
    });

    return projects;
  }

  /**
   * Get my projects
   */
  async getMyProjects(learnerId: string) {
    return this.prisma.project.findMany({
      where: { learnerId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Submit project for showcase
   */
  async showcaseProject(projectId: string, learnerId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.learnerId !== learnerId) {
      throw new ForbiddenException('Not authorized');
    }

    if (project.state !== 'COMPLETED') {
      throw new Error('Project must be completed before showcasing');
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        state: 'SHOWCASED',
        visibility: 'PUBLIC',
      },
    });

    return { success: true, message: 'Project showcased!' };
  }
}
