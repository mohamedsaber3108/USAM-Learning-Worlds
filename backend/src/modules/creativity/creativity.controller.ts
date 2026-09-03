/**
 * Creativity Engine Controller
 *
 * Zero-trace engine per USAM_KIDS_ENGINE_GAP_MATRIX.md ("No model, service,
 * or module... nothing dedicated beyond generic Project/ai-task.interface
 * enum value"). Built from scratch this pass: a real seeded prompt library
 * (`creativity_prompts`) plus a lightweight submission+gallery layer
 * (`creativity_submissions`), read/write endpoints mirroring the shape of
 * reflection.controller.ts (list prompts, submit response, list mine).
 */
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AgeBand } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../../database/prisma.service';

@Controller('creativity')
@UseGuards(JwtAuthGuard)
export class CreativityController {
  constructor(private prisma: PrismaService) {}

  /**
   * List active creativity prompts, optionally filtered by ageBand or
   * domainId. Real data from `creativity_prompts`
   * (prisma/seeds/seed-creativity-prompts.ts, 10 seeded rows).
   */
  @Get('prompts')
  async listPrompts(
    @Query('ageBand') ageBand?: AgeBand,
    @Query('domainId') domainId?: string,
  ) {
    return this.prisma.creativityPrompt.findMany({
      where: {
        isActive: true,
        ...(ageBand ? { ageBand } : {}),
        ...(domainId ? { domainId } : {}),
      },
      include: { domain: { select: { id: true, name: true, slug: true } } },
      orderBy: { order: 'asc' },
    });
  }

  @Get('prompts/:slug')
  async getPrompt(@Param('slug') slug: string) {
    const prompt = await this.prisma.creativityPrompt.findUnique({
      where: { slug },
      include: { domain: { select: { id: true, name: true, slug: true } } },
    });
    if (!prompt) {
      throw new NotFoundException('Creativity prompt not found');
    }
    return prompt;
  }

  /**
   * Submit a response to a creativity prompt. Defaults to PRIVATE
   * visibility — the learner explicitly opts into the public gallery via
   * `visibility: 'PUBLIC'`.
   */
  @Post('submissions')
  async submit(
    @CurrentUser() user: any,
    @Body()
    dto: { promptId: string; title?: string; content: string; visibility?: 'PRIVATE' | 'PUBLIC' },
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new BadRequestException('Only learners can submit creativity responses');
    }
    if (!dto.promptId || !dto.content || !dto.content.trim()) {
      throw new BadRequestException('promptId and content are required');
    }

    const prompt = await this.prisma.creativityPrompt.findUnique({
      where: { id: dto.promptId },
    });
    if (!prompt) {
      throw new NotFoundException('Creativity prompt not found');
    }

    return this.prisma.creativitySubmission.create({
      data: {
        promptId: dto.promptId,
        learnerId,
        title: dto.title,
        content: dto.content,
        visibility: dto.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
      },
    });
  }

  /** The calling learner's own submissions, across all prompts. */
  @Get('submissions/mine')
  async mySubmissions(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new BadRequestException('Only learners have submissions');
    }
    return this.prisma.creativitySubmission.findMany({
      where: { learnerId },
      include: { prompt: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Public gallery: all PUBLIC submissions, optionally filtered to one
   * prompt. Shows the learner's display name so the gallery has a real
   * author credit.
   */
  @Get('gallery')
  async gallery(@Query('promptId') promptId?: string) {
    return this.prisma.creativitySubmission.findMany({
      where: {
        visibility: 'PUBLIC',
        ...(promptId ? { promptId } : {}),
      },
      include: {
        prompt: { select: { id: true, title: true, slug: true } },
        learner: { select: { id: true, displayName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /** Toggle a learner's own submission between PRIVATE and PUBLIC. */
  @Post('submissions/:id/visibility')
  async setVisibility(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: { visibility: 'PRIVATE' | 'PUBLIC' },
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new BadRequestException('Only learners can update submissions');
    }
    const submission = await this.prisma.creativitySubmission.findUnique({ where: { id } });
    if (!submission || submission.learnerId !== learnerId) {
      throw new ForbiddenException('Not authorized to update this submission');
    }
    if (dto.visibility !== 'PRIVATE' && dto.visibility !== 'PUBLIC') {
      throw new BadRequestException('visibility must be PRIVATE or PUBLIC');
    }
    return this.prisma.creativitySubmission.update({
      where: { id },
      data: { visibility: dto.visibility },
    });
  }
}
