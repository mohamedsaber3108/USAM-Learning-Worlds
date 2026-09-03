/**
 * Metacognition Engine — Reflection Controller
 *
 * Zero-trace engine per USAM_KIDS_ENGINE_GAP_MATRIX.md Part 7b ("No model,
 * no service, no seed, no frontend trace anywhere. Missing."). Built from
 * scratch this pass: a minimal, real quick-reflection system shown after
 * mission completion (see frontend MissionCompletePage.tsx).
 *
 * Deliberately small in scope: a short bank of reusable prompts
 * ("How did that feel?" / "What was tricky?" / "What helped you get
 * through it?") plus a per-learner, per-mission-run response log storing a
 * 1-5 self-rating and an optional free-text note. Not a general survey
 * engine — just enough real metacognition signal to close the gap.
 */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../../database/prisma.service';

@Controller('reflection')
@UseGuards(JwtAuthGuard)
export class ReflectionController {
  constructor(private prisma: PrismaService) {}

  /**
   * List active reflection prompts (the short quick-reflection bank shown
   * after mission completion). Real data from `reflection_prompts`
   * (backend/prisma/seeds/seed-reflection-prompts.ts).
   */
  @Get('prompts')
  async listPrompts() {
    return this.prisma.reflectionPrompt.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Submit a learner's self-rating for a completed mission run against one
   * prompt. `rating` is a 1-5 scale (kid-facing UI can render this as
   * emoji/faces rather than raw numbers). Validates the mission run and
   * prompt both exist and the run belongs to the calling learner, so
   * learners can only reflect on their own mission runs.
   */
  @Post('responses')
  async submitResponse(
    @CurrentUser() user: any,
    @Body()
    dto: { missionRunId: string; promptId: string; rating: number; note?: string },
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new BadRequestException('Only learners can submit reflections');
    }
    if (!dto.missionRunId || !dto.promptId) {
      throw new BadRequestException('missionRunId and promptId are required');
    }
    if (
      typeof dto.rating !== 'number' ||
      dto.rating < 1 ||
      dto.rating > 5 ||
      !Number.isInteger(dto.rating)
    ) {
      throw new BadRequestException('rating must be an integer between 1 and 5');
    }

    const run = await this.prisma.missionRun.findUnique({
      where: { id: dto.missionRunId },
    });
    if (!run || run.learnerId !== learnerId) {
      throw new NotFoundException('Mission run not found');
    }

    const prompt = await this.prisma.reflectionPrompt.findUnique({
      where: { id: dto.promptId },
    });
    if (!prompt) {
      throw new NotFoundException('Reflection prompt not found');
    }

    return this.prisma.missionReflection.create({
      data: {
        learnerId,
        missionRunId: dto.missionRunId,
        promptId: dto.promptId,
        rating: dto.rating,
        note: dto.note,
      },
    });
  }

  /**
   * Get the calling learner's own reflections for one mission run (used to
   * skip re-showing the prompt if already answered, or to render a
   * "you said..." summary).
   */
  @Get('responses/by-run')
  async getResponsesForRun(
    @CurrentUser() user: any,
    @Query('missionRunId') missionRunId: string,
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new BadRequestException('Only learners can view reflections');
    }
    if (!missionRunId) {
      throw new BadRequestException('missionRunId is required');
    }

    return this.prisma.missionReflection.findMany({
      where: { learnerId, missionRunId },
      include: { prompt: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
