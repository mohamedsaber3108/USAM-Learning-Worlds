import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ZPDCalculatorService } from './zpd-calculator.service';
import { RecommendationService } from './recommendation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('adaptive')
@UseGuards(JwtAuthGuard)
export class AdaptiveController {
  constructor(
    private zpdCalculator: ZPDCalculatorService,
    private recommendations: RecommendationService,
  ) {}

  @Get('zpd')
  async getZPDProfile(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have ZPD profiles');
    }

    return this.zpdCalculator.calculateZPD(learnerId);
  }

  @Get('recommendations')
  async getRecommendations(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners can get recommendations');
    }

    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.recommendations.getRecommendations(learnerId, limitNum);
  }

  @Get('next-activity/:competencyId')
  async getNextActivity(
    @CurrentUser() user: any,
    @Param('competencyId') competencyId: string,
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners can get next activities');
    }

    const activityId = await this.recommendations.getNextActivity(
      learnerId,
      competencyId,
    );

    return { activityId };
  }

  @Get('learning-path/:skillId')
  async getLearningPath(
    @CurrentUser() user: any,
    @Param('skillId') skillId: string,
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have learning paths');
    }

    return this.recommendations.getLearningPath(learnerId, skillId);
  }

  @Get('difficulty/:competencyId')
  async getRecommendedDifficulty(
    @CurrentUser() user: any,
    @Param('competencyId') competencyId: string,
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have difficulty recommendations');
    }

    const difficulty = await this.zpdCalculator.getRecommendedDifficulty(
      learnerId,
      competencyId,
    );

    return { difficulty };
  }

  @Get('growth-velocity')
  async getGrowthVelocity(
    @CurrentUser() user: any,
    @Query('days') days?: string,
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have growth velocity');
    }

    const daysNum = days ? parseInt(days, 10) : 30;
    const velocity = await this.zpdCalculator.calculateGrowthVelocity(
      learnerId,
      daysNum,
    );

    return {
      velocity,
      trend: velocity > 0.1 ? 'improving' : velocity < -0.1 ? 'declining' : 'stable',
    };
  }

  @Get('should-level-up')
  async shouldLevelUp(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners can level up');
    }

    const shouldLevel = await this.zpdCalculator.shouldLevelUp(learnerId);

    return { shouldLevelUp: shouldLevel };
  }
}
