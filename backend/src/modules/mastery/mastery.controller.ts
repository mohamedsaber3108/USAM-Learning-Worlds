import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { MasteryService } from './mastery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EvidenceType } from '@prisma/client';

@Controller('mastery')
@UseGuards(JwtAuthGuard)
export class MasteryController {
  constructor(private masteryService: MasteryService) {}

  @Post('evidence')
  async recordEvidence(
    @CurrentUser() user: any,
    @Body() dto: {
      competencyId: string;
      type: EvidenceType;
      success: boolean;
      score?: number;
      context?: any;
      attemptId?: string;
    },
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners can record evidence');
    }

    return this.masteryService.recordEvidence(
      learnerId,
      dto.competencyId,
      dto.type,
      dto.success,
      dto.score,
      dto.context,
      dto.attemptId,
    );
  }

  @Get('overview')
  async getOverview(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have mastery records');
    }

    return this.masteryService.getMasteryOverview(learnerId);
  }

  @Get('by-domain')
  async getByDomain(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have mastery records');
    }

    return this.masteryService.getMasteryByDomain(learnerId);
  }

  @Get('review-due')
  async getReviewDue(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have mastery records');
    }

    return this.masteryService.getReviewDue(learnerId);
  }

  @Get('goals')
  async getLearningGoals(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have mastery records');
    }

    return this.masteryService.getLearningGoals(learnerId);
  }
}
