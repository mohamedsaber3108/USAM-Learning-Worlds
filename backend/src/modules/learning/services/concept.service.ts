import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { Concept, PrerequisiteType } from '@prisma/client';

interface ConceptWithPrerequisites extends Concept {
  prerequisites: Array<{
    id: string;
    prerequisiteId: string;
    type: PrerequisiteType;
    prerequisite: Concept;
  }>;
  dependents: Array<{
    id: string;
    conceptId: string;
    type: PrerequisiteType;
    concept: Concept;
  }>;
}

interface PrerequisiteChain {
  conceptId: string;
  path: string[];
  depth: number;
}

@Injectable()
export class ConceptService {
  constructor(private prisma: PrismaService) {}

  async findAll(competencyId?: string): Promise<Concept[]> {
    return this.prisma.concept.findMany({
      where: competencyId ? { competencyId } : undefined,
      orderBy: { order: 'asc' },
      include: {
        competency: {
          select: { id: true, name: true, skillId: true },
        },
      },
    });
  }

  async findOne(id: string): Promise<ConceptWithPrerequisites> {
    const concept = await this.prisma.concept.findUnique({
      where: { id },
      include: {
        competency: { select: { id: true, name: true, skillId: true } },
        objectives: { where: { isActive: true } },
        prerequisites: {
          include: {
            prerequisite: {
              include: {
                competency: { select: { id: true, name: true } },
              },
            },
          },
        },
        dependents: {
          include: {
            concept: {
              include: {
                competency: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!concept) {
      throw new NotFoundException(`Concept with ID ${id} not found`);
    }

    return concept as ConceptWithPrerequisites;
  }

  async findBySlug(slug: string): Promise<ConceptWithPrerequisites> {
    const concept = await this.prisma.concept.findUnique({
      where: { slug },
      include: {
        competency: { select: { id: true, name: true, skillId: true } },
        objectives: { where: { isActive: true } },
        prerequisites: {
          include: {
            prerequisite: {
              include: {
                competency: { select: { id: true, name: true } },
              },
            },
          },
        },
        dependents: {
          include: {
            concept: {
              include: {
                competency: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!concept) {
      throw new NotFoundException(`Concept with slug ${slug} not found`);
    }

    return concept as ConceptWithPrerequisites;
  }

  async getPrerequisiteChain(conceptId: string): Promise<PrerequisiteChain[]> {
    const visited = new Set<string>();
    const chain: PrerequisiteChain[] = [];

    const traverse = async (id: string, path: string[], depth: number): Promise<void> => {
      if (visited.has(id)) {
        throw new BadRequestException(`Circular prerequisite detected at concept ${id}`);
      }

      visited.add(id);

      const concept = await this.prisma.concept.findUnique({
        where: { id },
        include: {
          prerequisites: {
            where: { type: { in: ['REQUIRED', 'COREQUISITE'] } },
            include: { prerequisite: true },
          },
        },
      });

      if (!concept) return;

      chain.push({
        conceptId: id,
        path: [...path, id],
        depth,
      });

      for (const prereq of concept.prerequisites) {
        await traverse(prereq.prerequisiteId, [...path, id], depth + 1);
      }

      visited.delete(id);
    };

    await traverse(conceptId, [], 0);
    return chain.sort((a, b) => b.depth - a.depth);
  }

  async isUnlocked(conceptId: string, learnerId: string): Promise<boolean> {
    const concept = await this.prisma.concept.findUnique({
      where: { id: conceptId },
      include: {
        prerequisites: {
          where: { type: 'REQUIRED' },
          include: { prerequisite: true },
        },
      },
    });

    if (!concept || concept.prerequisites.length === 0) {
      return true;
    }

    const prerequisiteIds = concept.prerequisites.map((p) => p.prerequisiteId);

    const masteryRecords = await this.prisma.masteryRecord.findMany({
      where: {
        learnerId,
        competencyId: {
          in: await this.getCompetencyIdsForConcepts(prerequisiteIds),
        },
      },
    });

    const requiredCount = concept.prerequisites.length;
    const proficientCount = masteryRecords.filter(
      (m) => ['PROFICIENT', 'MASTERED'].includes(m.state)
    ).length;

    return proficientCount >= requiredCount;
  }

  async getUnlockStatus(conceptId: string, learnerId: string) {
    const concept = await this.prisma.concept.findUnique({
      where: { id: conceptId },
      include: {
        prerequisites: {
          where: { type: 'REQUIRED' },
          include: {
            prerequisite: {
              include: { competency: true },
            },
          },
        },
      },
    });

    if (!concept) {
      throw new NotFoundException(`Concept ${conceptId} not found`);
    }

    const unlocked = await this.isUnlocked(conceptId, learnerId);

    const prerequisiteStatus = await Promise.all(
      concept.prerequisites.map(async (p) => {
        const mastery = await this.prisma.masteryRecord.findUnique({
          where: {
            learnerId_competencyId: {
              learnerId,
              competencyId: p.prerequisite.competencyId,
            },
          },
        });

        return {
          conceptId: p.prerequisiteId,
          conceptName: p.prerequisite.name,
          competencyId: p.prerequisite.competencyId,
          type: p.type,
          state: mastery?.state || 'NOT_STARTED',
          complete: ['PROFICIENT', 'MASTERED'].includes(mastery?.state || ''),
        };
      })
    );

    return {
      conceptId: concept.id,
      conceptName: concept.name,
      unlocked,
      prerequisites: prerequisiteStatus,
      progress: {
        required: concept.prerequisites.length,
        completed: prerequisiteStatus.filter((p) => p.complete).length,
      },
    };
  }

  async addPrerequisite(
    conceptId: string,
    prerequisiteId: string,
    type: PrerequisiteType = 'REQUIRED'
  ) {
    if (conceptId === prerequisiteId) {
      throw new BadRequestException('Concept cannot be its own prerequisite');
    }

    const existing = await this.prisma.conceptPrerequisite.findUnique({
      where: {
        conceptId_prerequisiteId: { conceptId, prerequisiteId },
      },
    });

    if (existing) {
      throw new BadRequestException('Prerequisite relationship already exists');
    }

    const wouldCreateCycle = await this.checkForCycle(conceptId, prerequisiteId);
    if (wouldCreateCycle) {
      throw new BadRequestException('Adding this prerequisite would create a circular dependency');
    }

    return this.prisma.conceptPrerequisite.create({
      data: {
        conceptId,
        prerequisiteId,
        type,
      },
      include: {
        concept: true,
        prerequisite: true,
      },
    });
  }

  async removePrerequisite(conceptId: string, prerequisiteId: string) {
    const existing = await this.prisma.conceptPrerequisite.findUnique({
      where: {
        conceptId_prerequisiteId: { conceptId, prerequisiteId },
      },
    });

    if (!existing) {
      throw new NotFoundException('Prerequisite relationship not found');
    }

    await this.prisma.conceptPrerequisite.delete({
      where: { id: existing.id },
    });

    return { success: true };
  }

  private async checkForCycle(startId: string, newPrereqId: string): Promise<boolean> {
    const visited = new Set<string>();

    const dfs = async (currentId: string): Promise<boolean> => {
      if (currentId === startId) return true;
      if (visited.has(currentId)) return false;

      visited.add(currentId);

      const concept = await this.prisma.concept.findUnique({
        where: { id: currentId },
        include: {
          prerequisites: {
            select: { prerequisiteId: true },
          },
        },
      });

      if (!concept) return false;

      for (const prereq of concept.prerequisites) {
        if (await dfs(prereq.prerequisiteId)) {
          return true;
        }
      }

      return false;
    };

    return dfs(newPrereqId);
  }

  private async getCompetencyIdsForConcepts(conceptIds: string[]): Promise<string[]> {
    const concepts = await this.prisma.concept.findMany({
      where: { id: { in: conceptIds } },
      select: { competencyId: true },
    });

    return concepts.map((c) => c.competencyId);
  }

  async getConceptsForSkill(skillId: string): Promise<Concept[]> {
    const competencies = await this.prisma.competency.findMany({
      where: { skillId, isActive: true },
      include: {
        concepts: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    return competencies.flatMap((c) => c.concepts);
  }

  async getConceptsForDomain(domainId: string): Promise<Concept[]> {
    const skills = await this.prisma.skill.findMany({
      where: { domainId, isActive: true },
      include: {
        competencies: {
          where: { isActive: true },
          include: {
            concepts: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return skills.flatMap((s) => s.competencies.flatMap((c) => c.concepts));
  }
}
