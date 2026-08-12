import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { BedrockService } from './bedrock.service';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
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
      throw new Error('Only learners can request feedback');
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
      throw new Error('Only learners can request hints');
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
      throw new Error('Only learners can request explanations');
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
      throw new Error('Only learners can request analysis');
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

  @Get('moderation/stats')
  async getModerationStats(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!user.educator && !user.parent) {
      throw new Error('Only educators and parents can view moderation stats');
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    return this.moderation.getModerationStats(start, end);
  }

  @Get('moderation/quarantined')
  async getQuarantinedContent(
    @CurrentUser() user: any,
    @Query('status') status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING',
  ) {
    if (!user.educator && !user.parent) {
      throw new Error('Only educators and parents can view quarantined content');
    }

    return this.moderation.getQuarantinedContent(status);
  }
}
