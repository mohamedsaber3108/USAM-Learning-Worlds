import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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
      competencyId?: string;
      objectiveId?: string;
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
        competencyId: data.competencyId,
        objectiveId: data.objectiveId,
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
        competency: { include: { skill: { include: { domain: true } } } },
        objective: true,
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
   * Curriculum chain context for a project — where this project sits in
   * Domain -> Skill -> Competency -> LearningObjective (closes the
   * Curriculum Engine gap: Project stage was previously untethered from
   * the hierarchy).
   */
  async getProjectCurriculumContext(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        competency: { include: { skill: { include: { domain: true } } } },
        objective: { include: { competency: { include: { skill: { include: { domain: true } } } } } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const competency = project.objective?.competency || project.competency;

    if (!competency) {
      return {
        projectId,
        linked: false,
        message: 'Project is not yet linked to a Domain/Skill/Competency',
      };
    }

    return {
      projectId,
      linked: true,
      domain: competency.skill.domain
        ? { id: competency.skill.domain.id, name: competency.skill.domain.name }
        : null,
      skill: { id: competency.skill.id, name: competency.skill.name },
      competency: { id: competency.id, name: competency.name },
      objective: project.objective
        ? { id: project.objective.id, name: project.objective.name }
        : null,
    };
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
      competencyId: string;
      objectiveId: string;
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
        competencyId: data.competencyId,
        objectiveId: data.objectiveId,
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

  // ==================== Collaboration Engine ====================
  // Small, real version: 2+ learners co-membered on one Project with
  // shared edit/comment access, per docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md.

  async addCollaborator(
    projectId: string,
    ownerLearnerId: string,
    collaboratorLearnerId: string,
    role: 'EDITOR' | 'COMMENTER' = 'EDITOR',
  ) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.learnerId !== ownerLearnerId) {
      throw new ForbiddenException('Only the project owner can add collaborators');
    }
    if (collaboratorLearnerId === ownerLearnerId) {
      throw new BadRequestException('Owner is already on the project');
    }
    return this.prisma.projectCollaborator.upsert({
      where: { projectId_learnerId: { projectId, learnerId: collaboratorLearnerId } },
      create: { projectId, learnerId: collaboratorLearnerId, role, invitedBy: ownerLearnerId },
      update: { role },
    });
  }

  async listCollaborators(projectId: string) {
    return this.prisma.projectCollaborator.findMany({
      where: { projectId },
      include: { learner: { select: { id: true, displayName: true } } },
    });
  }

  async removeCollaborator(projectId: string, ownerLearnerId: string, collaboratorLearnerId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.learnerId !== ownerLearnerId) {
      throw new ForbiddenException('Only the project owner can remove collaborators');
    }
    await this.prisma.projectCollaborator.deleteMany({ where: { projectId, learnerId: collaboratorLearnerId } });
    return { success: true };
  }

  /** True if learnerId is the owner OR a collaborator - used to gate shared edit access. */
  async hasProjectAccess(projectId: string, learnerId: string): Promise<boolean> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return false;
    if (project.learnerId === learnerId) return true;
    const collab = await this.prisma.projectCollaborator.findUnique({
      where: { projectId_learnerId: { projectId, learnerId } },
    });
    return !!collab;
  }

  // ==================== Milestone stage machine ====================
  // Idea -> Plan -> Build -> Test -> Present, backed by ProjectMilestone rows.
  // Closes the "Project Stage Machine" gap: previously ProjectMilestone had
  // no controller/service surface at all despite being seeded (10 projects /
  // 50 milestones live in prod per seed-projects-rubrics.ts).

  async listMilestones(projectId: string, learnerId?: string) {
    if (learnerId) {
      const hasAccess = await this.hasProjectAccess(projectId, learnerId);
      const project = await this.prisma.project.findUnique({ where: { id: projectId } });
      if (!hasAccess && project?.visibility === 'PRIVATE') {
        throw new ForbiddenException('No access to this project');
      }
    }
    return this.prisma.projectMilestone.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });
  }

  async updateMilestoneStatus(
    projectId: string,
    milestoneId: string,
    learnerId: string,
    status: string,
  ) {
    const hasAccess = await this.hasProjectAccess(projectId, learnerId);
    if (!hasAccess) throw new ForbiddenException('No access to this project');

    const milestone = await this.prisma.projectMilestone.findUnique({
      where: { id: milestoneId },
    });
    if (!milestone || milestone.projectId !== projectId) {
      throw new NotFoundException('Milestone not found');
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETE'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`status must be one of ${validStatuses.join(', ')}`);
    }

    const updated = await this.prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: { status },
    });

    // Auto-advance project state to match furthest-reached milestone stage,
    // so the Project.state (DRAFT/PLANNING/BUILDING/REVIEW/...) stays a real
    // reflection of stepper progress instead of drifting from it.
    const allMilestones = await this.prisma.projectMilestone.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });
    const completedCount = allMilestones.filter((m) => m.status === 'COMPLETE').length;
    const stageToState: Record<number, string> = {
      0: 'PLANNING',
      1: 'PLANNING',
      2: 'BUILDING',
      3: 'REVIEW',
      4: 'COMPLETED',
    };
    const newState = stageToState[completedCount] ?? undefined;
    if (newState) {
      const project = await this.prisma.project.findUnique({ where: { id: projectId } });
      if (project && project.state !== 'SHOWCASED' && project.state !== newState) {
        await this.prisma.project.update({ where: { id: projectId }, data: { state: newState as any } });
      }
    }

    return updated;
  }

  // ==================== Research Engine ====================
  // Minimal real version: sourced notes/citations attached to a Project.

  async addResearchNote(
    projectId: string,
    learnerId: string,
    data: { content: string; sourceTitle?: string; sourceUrl?: string },
  ) {
    const hasAccess = await this.hasProjectAccess(projectId, learnerId);
    if (!hasAccess) throw new ForbiddenException('No access to this project');
    return this.prisma.researchNote.create({
      data: { projectId, learnerId, ...data },
    });
  }

  async listResearchNotes(projectId: string, learnerId: string) {
    const hasAccess = await this.hasProjectAccess(projectId, learnerId);
    if (!hasAccess) throw new ForbiddenException('No access to this project');
    return this.prisma.researchNote.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: { learner: { select: { id: true, displayName: true } } },
    });
  }

  async deleteResearchNote(noteId: string, learnerId: string) {
    const note = await this.prisma.researchNote.findUnique({ where: { id: noteId } });
    if (!note || note.learnerId !== learnerId) throw new ForbiddenException('Not authorized');
    await this.prisma.researchNote.delete({ where: { id: noteId } });
    return { success: true };
  }

  // ==================== Real-World Challenge Engine ====================
  // Surfaces Project.isRealWorldChallenge/externalSourceUrl (added directly
  // to the existing Project model, not a new system).

  async listRealWorldChallenges() {
    return this.prisma.project.findMany({
      where: { isRealWorldChallenge: true, visibility: 'PUBLIC' },
      select: {
        id: true,
        title: true,
        description: true,
        externalSourceUrl: true,
        state: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
