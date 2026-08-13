import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { LearningPath, AgeBand } from '@prisma/client';

interface PathProgress {
  pathId: string;
  pathName: string;
  currentNodeIndex: number;
  totalNodes: number;
  completedNodes: string[];
  percentComplete: number;
  currentNode?: {
    nodeId: string;
    entityType: string;
    entityId: string;
    entityName?: string;
  };
  nextNode?: {
    nodeId: string;
    entityType: string;
    entityId: string;
    entityName?: string;
  };
}

@Injectable()
export class LearningPathService {
  constructor(private prisma: PrismaService) {}

  async findAll(domainId?: string, ageBand?: AgeBand): Promise<LearningPath[]> {
    return this.prisma.learningPath.findMany({
      where: {
        domainId,
        ageBand,
        isActive: true,
      },
      include: {
        domain: { select: { id: true, name: true, slug: true } },
        nodes: {
          orderBy: { order: 'asc' },
          take: 5,
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id },
      include: {
        domain: true,
        nodes: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!path) {
      throw new NotFoundException(`Learning path ${id} not found`);
    }

    const nodesWithDetails = await Promise.all(
      path.nodes.map(async (node) => {
        const details = await this.getNodeDetails(node.entityType, node.entityId);
        return {
          ...node,
          entityName: details?.name || 'Unknown',
          entitySlug: details?.slug,
        };
      })
    );

    return {
      ...path,
      nodes: nodesWithDetails,
    };
  }

  async getProgress(pathId: string, learnerId: string): Promise<PathProgress> {
    const path = await this.prisma.learningPath.findUnique({
      where: { id: pathId },
      include: {
        nodes: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!path) {
      throw new NotFoundException(`Learning path ${pathId} not found`);
    }

    let progress = await this.prisma.learningPathProgress.findUnique({
      where: {
        learnerId_pathId: { learnerId, pathId },
      },
    });

    if (!progress) {
      progress = await this.prisma.learningPathProgress.create({
        data: {
          learnerId,
          pathId,
          currentNodeIndex: 0,
          completedNodes: [],
        },
      });
    }

    const currentNode = path.nodes[progress.currentNodeIndex];
    const nextNode = path.nodes[progress.currentNodeIndex + 1];

    const currentDetails = currentNode
      ? await this.getNodeDetails(currentNode.entityType, currentNode.entityId)
      : null;

    const nextDetails = nextNode
      ? await this.getNodeDetails(nextNode.entityType, nextNode.entityId)
      : null;

    return {
      pathId: path.id,
      pathName: path.name,
      currentNodeIndex: progress.currentNodeIndex,
      totalNodes: path.nodes.length,
      completedNodes: progress.completedNodes,
      percentComplete: Math.round((progress.completedNodes.length / path.nodes.length) * 100),
      currentNode: currentNode
        ? {
            nodeId: currentNode.id,
            entityType: currentNode.entityType,
            entityId: currentNode.entityId,
            entityName: currentDetails?.name,
          }
        : undefined,
      nextNode: nextNode
        ? {
            nodeId: nextNode.id,
            entityType: nextNode.entityType,
            entityId: nextNode.entityId,
            entityName: nextDetails?.name,
          }
        : undefined,
    };
  }

  async advanceProgress(pathId: string, learnerId: string, nodeId: string) {
    const progress = await this.prisma.learningPathProgress.findUnique({
      where: {
        learnerId_pathId: { learnerId, pathId },
      },
    });

    if (!progress) {
      throw new NotFoundException('Learning path progress not found');
    }

    const path = await this.prisma.learningPath.findUnique({
      where: { id: pathId },
      include: { nodes: { orderBy: { order: 'asc' } } },
    });

    if (!path) {
      throw new NotFoundException(`Learning path ${pathId} not found`);
    }

    const currentNode = path.nodes[progress.currentNodeIndex];
    if (!currentNode || currentNode.id !== nodeId) {
      throw new BadRequestException('Cannot advance: node does not match current position');
    }

    const completedNodes = [...progress.completedNodes, nodeId];
    const newIndex = progress.currentNodeIndex + 1;

    return this.prisma.learningPathProgress.update({
      where: { id: progress.id },
      data: {
        currentNodeIndex: newIndex < path.nodes.length ? newIndex : progress.currentNodeIndex,
        completedNodes,
      },
    });
  }

  async resetProgress(pathId: string, learnerId: string) {
    const progress = await this.prisma.learningPathProgress.findUnique({
      where: {
        learnerId_pathId: { learnerId, pathId },
      },
    });

    if (!progress) {
      throw new NotFoundException('Learning path progress not found');
    }

    return this.prisma.learningPathProgress.update({
      where: { id: progress.id },
      data: {
        currentNodeIndex: 0,
        completedNodes: [],
      },
    });
  }

  async recommendPath(learnerId: string, domainId?: string): Promise<LearningPath | null> {
    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
      select: { ageBand: true },
    });

    if (!learner) {
      throw new NotFoundException(`Learner ${learnerId} not found`);
    }

    const masteryRecords = await this.prisma.masteryRecord.findMany({
      where: { learnerId },
      include: {
        competency: {
          include: { skill: { select: { domainId: true } } },
        },
      },
    });

    const domainScores = new Map<string, { total: number; proficient: number }>();

    for (const record of masteryRecords) {
      const domainId = record.competency.skill.domainId;
      const current = domainScores.get(domainId) || { total: 0, proficient: 0 };
      current.total++;
      if (['PROFICIENT', 'MASTERED'].includes(record.state)) {
        current.proficient++;
      }
      domainScores.set(domainId, current);
    }

    const paths = await this.prisma.learningPath.findMany({
      where: {
        domainId,
        ageBand: learner.ageBand,
        isActive: true,
      },
      include: {
        domain: true,
        progress: {
          where: { learnerId },
        },
      },
    });

    const inProgressPaths = paths.filter((p) => p.progress.length > 0);
    if (inProgressPaths.length > 0) {
      return inProgressPaths[0];
    }

    const unstarted = paths.filter((p) => p.progress.length === 0);

    const sortedByDomainMastery = unstarted.sort((a, b) => {
      const scoreA = domainScores.get(a.domainId);
      const scoreB = domainScores.get(b.domainId);

      const proficiencyA = scoreA ? scoreA.proficient / scoreA.total : 0;
      const proficiencyB = scoreB ? scoreB.proficient / scoreB.total : 0;

      return proficiencyB - proficiencyA;
    });

    return sortedByDomainMastery[0] || null;
  }

  private async getNodeDetails(entityType: string, entityId: string) {
    switch (entityType) {
      case 'SKILL':
        return this.prisma.skill.findUnique({
          where: { id: entityId },
          select: { name: true, slug: true },
        });

      case 'CONCEPT':
        return this.prisma.concept.findUnique({
          where: { id: entityId },
          select: { name: true, slug: true },
        });

      case 'MISSION':
        return this.prisma.mission.findUnique({
          where: { id: entityId },
          select: { title: true },
        }).then((m) => (m ? { name: m.title, slug: entityId } : null));

      default:
        return null;
    }
  }

  async getLearnerPaths(learnerId: string) {
    const progress = await this.prisma.learningPathProgress.findMany({
      where: { learnerId },
      include: {
        path: {
          include: {
            domain: { select: { name: true, slug: true } },
            nodes: { orderBy: { order: 'asc' } },
          },
        },
      },
    });

    return Promise.all(
      progress.map(async (p) => ({
        pathId: p.pathId,
        pathName: p.path.name,
        domainName: p.path.domain.name,
        currentNodeIndex: p.currentNodeIndex,
        totalNodes: p.path.nodes.length,
        percentComplete: Math.round((p.completedNodes.length / p.path.nodes.length) * 100),
        startedAt: p.startedAt,
        updatedAt: p.updatedAt,
      }))
    );
  }
}
