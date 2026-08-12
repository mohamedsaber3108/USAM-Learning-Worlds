import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { CodingCoachService } from '../ai/services/coding-coach.service';

@Controller('coding')
export class CodingController {
  constructor(
    private prisma: PrismaService,
    private codingCoach: CodingCoachService,
  ) {}

  @Get('concepts')
  async listConcepts(
    @Query('category') category?: string,
    @Query('maxDifficulty') maxDifficulty?: string,
  ) {
    const where: any = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (maxDifficulty) {
      where.difficulty = { lte: parseInt(maxDifficulty, 10) };
    }

    return this.prisma.codingConcept.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
  }

  @Get('concepts/:slug')
  async getConcept(@Param('slug') slug: string) {
    return this.prisma.codingConcept.findUnique({
      where: { slug },
    });
  }

  @Get('categories')
  async listCategories() {
    const concepts = await this.prisma.codingConcept.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    return concepts.map((c) => c.category);
  }

  @UseGuards(JwtAuthGuard)
  @Post('debug')
  async getDebugHelp(
    @Request() req,
    @Body()
    body: {
      code: string;
      language: string;
      error?: string;
      expectedBehavior?: string;
    },
  ) {
    const learnerId = req.user.learnerId;

    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
    });

    if (!learner) {
      throw new Error('Learner not found');
    }

    const result = await this.codingCoach.provideDebugAssistance({
      learnerId,
      code: body.code,
      language: body.language,
      error: body.error,
      expectedBehavior: body.expectedBehavior,
      context: {
        ageBand: learner.ageBand,
      },
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('review')
  async reviewCode(
    @Request() req,
    @Body() body: { code: string; language: string; focusAreas?: string[] },
  ) {
    const learnerId = req.user.learnerId;

    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
    });

    if (!learner) {
      throw new Error('Learner not found');
    }

    const result = await this.codingCoach.reviewCode({
      learnerId,
      code: body.code,
      language: body.language,
      focusAreas: body.focusAreas,
      context: {
        ageBand: learner.ageBand,
      },
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('explain')
  async explainCode(
    @Request() req,
    @Body() body: { code: string; language: string; specificPart?: string },
  ) {
    const learnerId = req.user.learnerId;

    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
    });

    if (!learner) {
      throw new Error('Learner not found');
    }

    const result = await this.codingCoach.explainCode({
      learnerId,
      code: body.code,
      language: body.language,
      specificPart: body.specificPart,
      context: {
        ageBand: learner.ageBand,
      },
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('challenge')
  async generateChallenge(
    @Request() req,
    @Body() body: { conceptSlug: string; difficulty?: number },
  ) {
    const learnerId = req.user.learnerId;

    const concept = await this.prisma.codingConcept.findUnique({
      where: { slug: body.conceptSlug },
    });

    if (!concept) {
      throw new Error('Concept not found');
    }

    const result = await this.codingCoach.generateChallenge(
      learnerId,
      concept.id,
      body.difficulty || concept.difficulty,
    );

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('guidance')
  async getSocraticGuidance(
    @Request() req,
    @Body() body: { code: string; stuckPoint: string },
  ) {
    const learnerId = req.user.learnerId;

    const result = await this.codingCoach.provideSocraticGuidance(
      learnerId,
      body.code,
      body.stuckPoint,
    );

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('next-project')
  async suggestNextProject(@Request() req) {
    const learnerId = req.user.learnerId;

    const result = await this.codingCoach.suggestNextProject(learnerId);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('learner/progress')
  async getLearnerCodingProgress(@Request() req) {
    const learnerId = req.user.learnerId;

    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
      include: {
        progression: true,
        masteryRecords: {
          where: {
            skill: {
              domain: {
                name: 'Coding',
              },
            },
          },
          include: {
            skill: {
              include: {
                domain: true,
              },
            },
          },
        },
      },
    });

    if (!learner) {
      throw new Error('Learner not found');
    }

    const masteryByState = learner.masteryRecords.reduce(
      (acc, record) => {
        acc[record.masteryState] = (acc[record.masteryState] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalCodingSkills = learner.masteryRecords.length;
    const masteredSkills = masteryByState['MASTERED'] || 0;

    const maxDifficulty =
      learner.ageBand === 'AGE_8_9' ? 2 : learner.ageBand === 'AGE_10_11' ? 3 : 4;

    const suggestedConcepts = await this.prisma.codingConcept.findMany({
      where: {
        isActive: true,
        difficulty: { lte: maxDifficulty },
      },
      orderBy: { difficulty: 'asc' },
      take: 5,
    });

    return {
      learnerId,
      ageBand: learner.ageBand,
      totalCodingSkills,
      masteredSkills,
      masteryByState,
      maxDifficulty,
      suggestedConcepts,
    };
  }
}
