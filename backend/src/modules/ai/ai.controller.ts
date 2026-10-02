import { Controller, Post, Body, UseGuards, Get, Query, ForbiddenException } from '@nestjs/common';
import { BedrockService } from './bedrock.service';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import {
  GenerateFeedbackDto,
  GenerateHintDto,
  ExplainConceptDto,
  AnalyzeResponseDto,
  ModerateContentDto,
} from './dto/ai-request.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private bedrock: BedrockService,
    private moderation: ModerationService,
  ) {}

  @Post('feedback')
  async generateFeedback(
    @CurrentUser() user: any,
    @Body() dto: GenerateFeedbackDto,
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new ForbiddenException('Only learners can request feedback');
    }

    const isSafe = await this.moderation.isSafe(dto.work, 'TEXT');
    if (!isSafe) {
      return {
        error: 'Content flagged by moderation',
        message: 'Please ensure your submission follows community guidelines.',
      };
    }

    const feedback = await this.bedrock.generateFeedback(
      dto.work,
      dto.rubric,
      dto.context,
    );

    return { feedback };
  }

  @Post('hint')
  async generateHint(
    @CurrentUser() user: any,
    @Body() dto: GenerateHintDto,
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new ForbiddenException('Only learners can request hints');
    }

    // SAFETY (T-P0-3): the learner's attempt is free-text — moderate it.
    if (dto.learnerAttempt) {
      const attemptSafe = await this.moderation.isSafe(dto.learnerAttempt, 'TEXT');
      if (!attemptSafe) {
        return {
          error: 'Content flagged by moderation',
          message: 'Please ensure your submission follows community guidelines.',
        };
      }
    }

    const hint = await this.bedrock.generateHint(
      dto.question,
      dto.learnerAttempt,
      dto.difficulty,
    );

    return { hint };
  }

  @Post('explain')
  async explainConcept(
    @CurrentUser() user: any,
    @Body() dto: ExplainConceptDto,
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new ForbiddenException('Only learners can request explanations');
    }

    // SAFETY (T-P0-3): concept + context are learner-supplied free-text.
    const explainSafe = await this.moderation.isSafe(
      [dto.concept, dto.context].filter(Boolean).join('\n'),
      'TEXT',
    );
    if (!explainSafe) {
      return {
        error: 'Content flagged by moderation',
        message: 'Please ensure your request follows community guidelines.',
      };
    }

    const explanation = await this.bedrock.explainConcept(
      dto.concept,
      dto.learnerAge,
      dto.context,
    );

    return { explanation };
  }

  @Post('analyze')
  async analyzeResponse(
    @CurrentUser() user: any,
    @Body() dto: AnalyzeResponseDto,
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new ForbiddenException('Only learners can request analysis');
    }

    const isSafe = await this.moderation.isSafe(dto.learnerResponse, 'TEXT');
    if (!isSafe) {
      return {
        error: 'Content flagged by moderation',
        message: 'Please ensure your response follows community guidelines.',
      };
    }

    const analysis = await this.bedrock.analyzeResponse(
      dto.question,
      dto.learnerResponse,
      dto.keyPoints,
    );

    return analysis;
  }

  @Post('moderate')
  async moderateContent(
    @CurrentUser() user: any,
    @Body() dto: ModerateContentDto,
  ) {
    const result = await this.moderation.moderateContent(
      dto.content,
      dto.contentType,
      user.id,
    );

    return result;
  }

  /**
   * FIX (2026-10-02): same defect as community.controller.ts — gated on
   * `user.educator`/`user.parent`, properties that never exist on the
   * authenticated user (only `learner`/`guardian` do), so this always 403'd
   * for everyone. Replaced with the standard RolesGuard + @Roles() pattern.
   */
  @Get('moderation/stats')
  @UseGuards(RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  async getModerationStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    return this.moderation.getModerationStats(start, end);
  }

  @Get('moderation/quarantined')
  @UseGuards(RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  async getQuarantinedContent(
    @Query('status') status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING',
  ) {
    return this.moderation.getQuarantinedContent(status);
  }
}
