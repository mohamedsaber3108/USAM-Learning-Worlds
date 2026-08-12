import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AgeBand, ScaffoldLevel } from '@prisma/client';

interface AdaptedContent {
  entityType: string;
  entityId: string;
  baseContent: any;
  ageVariant?: {
    framing: string;
    languageLevel: string | null;
    scaffoldLevel: ScaffoldLevel;
    surface: string | null;
    content: any;
  };
  adapted: boolean;
  ageBand: AgeBand;
}

interface AgeConfig {
  ageBand: AgeBand;
  sentenceComplexity: string;
  vocabularyLevel: string;
  maxWordsPerSentence: number;
  scaffoldDefault: ScaffoldLevel;
  examplesRequired: boolean;
  visualAids: boolean;
  abstractThinking: boolean;
}

@Injectable()
export class ContentAdaptationService {
  constructor(private prisma: PrismaService) {}

  private readonly AGE_CONFIGS: Record<AgeBand, AgeConfig> = {
    AGE_8_9: {
      ageBand: 'AGE_8_9' as AgeBand,
      sentenceComplexity: 'simple',
      vocabularyLevel: 'basic',
      maxWordsPerSentence: 12,
      scaffoldDefault: 'MODELLED' as ScaffoldLevel,
      examplesRequired: true,
      visualAids: true,
      abstractThinking: false,
    },
    AGE_10_11: {
      ageBand: 'AGE_10_11' as AgeBand,
      sentenceComplexity: 'moderate',
      vocabularyLevel: 'intermediate',
      maxWordsPerSentence: 18,
      scaffoldDefault: 'GUIDED' as ScaffoldLevel,
      examplesRequired: true,
      visualAids: true,
      abstractThinking: false,
    },
    AGE_12_14: {
      ageBand: 'AGE_12_14' as AgeBand,
      sentenceComplexity: 'complex',
      vocabularyLevel: 'advanced',
      maxWordsPerSentence: 25,
      scaffoldDefault: 'COACHED' as ScaffoldLevel,
      examplesRequired: false,
      visualAids: false,
      abstractThinking: true,
    },
  };

  async getAdaptedActivity(activityId: string, ageBand: AgeBand): Promise<AdaptedContent> {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException(`Activity ${activityId} not found`);
    }

    const variant = await this.prisma.ageVariant.findUnique({
      where: {
        entityType_entityId_ageBand: {
          entityType: 'ACTIVITY',
          entityId: activityId,
          ageBand,
        },
      },
    });

    return {
      entityType: 'ACTIVITY',
      entityId: activityId,
      baseContent: activity,
      ageVariant: variant
        ? {
            framing: variant.framing,
            languageLevel: variant.languageLevel,
            scaffoldLevel: variant.scaffoldLevel,
            surface: variant.surface,
            content: variant.content,
          }
        : undefined,
      adapted: !!variant,
      ageBand,
    };
  }

  async getAdaptedObjective(objectiveId: string, ageBand: AgeBand): Promise<AdaptedContent> {
    const objective = await this.prisma.learningObjective.findUnique({
      where: { id: objectiveId },
    });

    if (!objective) {
      throw new NotFoundException(`Learning objective ${objectiveId} not found`);
    }

    const variant = await this.prisma.ageVariant.findUnique({
      where: {
        entityType_entityId_ageBand: {
          entityType: 'OBJECTIVE',
          entityId: objectiveId,
          ageBand,
        },
      },
    });

    return {
      entityType: 'OBJECTIVE',
      entityId: objectiveId,
      baseContent: objective,
      ageVariant: variant
        ? {
            framing: variant.framing,
            languageLevel: variant.languageLevel,
            scaffoldLevel: variant.scaffoldLevel,
            surface: variant.surface,
            content: variant.content,
          }
        : undefined,
      adapted: !!variant,
      ageBand,
    };
  }

  async getAdaptedMission(missionId: string, ageBand: AgeBand): Promise<AdaptedContent> {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      throw new NotFoundException(`Mission ${missionId} not found`);
    }

    const variant = await this.prisma.ageVariant.findUnique({
      where: {
        entityType_entityId_ageBand: {
          entityType: 'MISSION',
          entityId: missionId,
          ageBand,
        },
      },
    });

    return {
      entityType: 'MISSION',
      entityId: missionId,
      baseContent: mission,
      ageVariant: variant
        ? {
            framing: variant.framing,
            languageLevel: variant.languageLevel,
            scaffoldLevel: variant.scaffoldLevel,
            surface: variant.surface,
            content: variant.content,
          }
        : undefined,
      adapted: !!variant,
      ageBand,
    };
  }

  async createAgeVariant(
    entityType: string,
    entityId: string,
    ageBand: AgeBand,
    data: {
      framing: string;
      languageLevel?: string;
      scaffoldLevel?: ScaffoldLevel;
      surface?: string;
      content?: any;
    }
  ) {
    const config = this.AGE_CONFIGS[ageBand];

    return this.prisma.ageVariant.create({
      data: {
        entityType,
        entityId,
        ageBand,
        framing: data.framing,
        languageLevel: data.languageLevel || config.vocabularyLevel,
        scaffoldLevel: data.scaffoldLevel || config.scaffoldDefault,
        surface: data.surface,
        content: data.content,
      },
    });
  }

  async updateAgeVariant(
    entityType: string,
    entityId: string,
    ageBand: AgeBand,
    data: Partial<{
      framing: string;
      languageLevel: string;
      scaffoldLevel: ScaffoldLevel;
      surface: string;
      content: any;
    }>
  ) {
    const existing = await this.prisma.ageVariant.findUnique({
      where: {
        entityType_entityId_ageBand: { entityType, entityId, ageBand },
      },
    });

    if (!existing) {
      throw new NotFoundException('Age variant not found');
    }

    return this.prisma.ageVariant.update({
      where: { id: existing.id },
      data,
    });
  }

  async deleteAgeVariant(entityType: string, entityId: string, ageBand: AgeBand) {
    const existing = await this.prisma.ageVariant.findUnique({
      where: {
        entityType_entityId_ageBand: { entityType, entityId, ageBand },
      },
    });

    if (!existing) {
      throw new NotFoundException('Age variant not found');
    }

    await this.prisma.ageVariant.delete({
      where: { id: existing.id },
    });

    return { success: true };
  }

  getAgeConfig(ageBand: AgeBand): AgeConfig {
    return this.AGE_CONFIGS[ageBand];
  }

  getAllAgeConfigs(): Record<AgeBand, AgeConfig> {
    return this.AGE_CONFIGS;
  }

  async getVariantCoverage(entityType: string) {
    const total = await this.countEntities(entityType);

    const variants = await this.prisma.ageVariant.groupBy({
      by: ['ageBand'],
      where: { entityType },
      _count: true,
    });

    return {
      entityType,
      totalEntities: total,
      variants: variants.map((v) => ({
        ageBand: v.ageBand,
        count: v._count,
        coverage: total > 0 ? Math.round((v._count / total) * 100) : 0,
      })),
    };
  }

  private async countEntities(entityType: string): Promise<number> {
    switch (entityType) {
      case 'ACTIVITY':
        return this.prisma.activity.count({ where: { isActive: true } });
      case 'OBJECTIVE':
        return this.prisma.learningObjective.count({ where: { isActive: true } });
      case 'MISSION':
        return this.prisma.mission.count({ where: { isActive: true } });
      case 'CONCEPT':
        return this.prisma.concept.count({ where: { isActive: true } });
      default:
        return 0;
    }
  }

  getScaffoldGuidance(level: ScaffoldLevel): string {
    const guidance = {
      MODELLED: 'Full demonstration with step-by-step walkthrough. Show complete example before learner attempts.',
      GUIDED: 'Provide hints and structure. Guide learner through process with prompts and partial solutions.',
      COACHED: 'Offer hints on request. Let learner attempt independently with coaching available.',
      INDEPENDENT: 'Minimal support. Learner works independently with resources available.',
    };

    return guidance[level];
  }

  getLanguageLevelGuidance(level: string): string {
    const guidance = {
      simple: 'Short sentences (8-12 words). Basic vocabulary. Concrete examples. Visual support required.',
      moderate: 'Clear sentences (12-18 words). Familiar words with some academic vocabulary. Mix concrete and abstract.',
      complex: 'Longer sentences (18-25 words). Academic vocabulary. Abstract concepts. Technical terms introduced.',
    };

    return guidance[level] || 'Unknown language level';
  }
}
