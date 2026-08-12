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
import { EnglishCoachService } from '../ai/services/english-coach.service';

@Controller('english')
export class EnglishController {
  constructor(
    private prisma: PrismaService,
    private englishCoach: EnglishCoachService,
  ) {}

  @Get('strands')
  async listStrands(@Query('cefrLevel') cefrLevel?: string) {
    const where = cefrLevel ? { cefrLevel, isActive: true } : { isActive: true };

    return this.prisma.englishStrand.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  @Get('strands/:slug')
  async getStrand(@Param('slug') slug: string) {
    return this.prisma.englishStrand.findUnique({
      where: { slug },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversation')
  async startConversation(
    @Request() req,
    @Body() body: { topic?: string; cefrLevel?: string },
  ) {
    const learnerId = req.user.learnerId;

    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
      include: {
        progression: true,
      },
    });

    if (!learner) {
      throw new Error('Learner not found');
    }

    const result = await this.englishCoach.conductConversation({
      learnerId,
      message: body.topic
        ? `I want to practice English. Let's talk about ${body.topic}.`
        : "I want to practice English conversation.",
      context: {
        ageBand: learner.ageBand,
        topic: body.topic,
        cefrLevel: body.cefrLevel,
      },
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('grammar/correct')
  async correctGrammar(@Request() req, @Body() body: { text: string }) {
    const learnerId = req.user.learnerId;

    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
    });

    if (!learner) {
      throw new Error('Learner not found');
    }

    const result = await this.englishCoach.correctGrammar({
      learnerId,
      text: body.text,
      context: {
        ageBand: learner.ageBand,
      },
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('pronunciation/feedback')
  async getPronunciationFeedback(
    @Request() req,
    @Body() body: { text: string; transcription: string },
  ) {
    const learnerId = req.user.learnerId;

    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
    });

    if (!learner) {
      throw new Error('Learner not found');
    }

    const result = await this.englishCoach.providePronunciationFeedback({
      learnerId,
      targetText: body.text,
      spokenTranscription: body.transcription,
      context: {
        ageBand: learner.ageBand,
      },
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('vocabulary/practice')
  async generateVocabularyPractice(
    @Request() req,
    @Body() body: { topic: string; wordCount?: number },
  ) {
    const learnerId = req.user.learnerId;

    const result = await this.englishCoach.generateVocabularyPractice(
      learnerId,
      body.topic,
      body.wordCount,
    );

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('reading/passage')
  async generateReadingPassage(
    @Request() req,
    @Body() body: { topic: string; length?: 'short' | 'medium' | 'long' },
  ) {
    const learnerId = req.user.learnerId;

    const result = await this.englishCoach.generateReadingPassage(
      learnerId,
      body.topic,
      body.length,
    );

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('learner/cefr-level')
  async getLearnerCEFRLevel(@Request() req) {
    const learnerId = req.user.learnerId;

    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
      include: {
        progression: true,
      },
    });

    if (!learner) {
      throw new Error('Learner not found');
    }

    let estimatedLevel = 'A1';

    if (learner.ageBand === 'AGE_8_9') {
      estimatedLevel = 'A1';
    } else if (learner.ageBand === 'AGE_10_11') {
      estimatedLevel = learner.progression?.xp && learner.progression.xp > 500 ? 'A2' : 'A1';
    } else if (learner.ageBand === 'AGE_12_14') {
      if (learner.progression?.xp && learner.progression.xp > 1000) {
        estimatedLevel = 'B2';
      } else if (learner.progression?.xp && learner.progression.xp > 500) {
        estimatedLevel = 'B1';
      } else {
        estimatedLevel = 'A2';
      }
    }

    return {
      learnerId,
      ageBand: learner.ageBand,
      estimatedCEFRLevel: estimatedLevel,
      xp: learner.progression?.xp || 0,
    };
  }
}
