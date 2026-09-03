import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ZPDCalculatorService } from './zpd-calculator.service';
import { RecommendationService } from './recommendation.service';
import { InterleavingService } from './interleaving.service';
import { TransferService } from './transfer.service';
import { CognitiveLoadService } from './cognitive-load.service';
import { EngagementService } from './engagement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('adaptive')
@UseGuards(JwtAuthGuard)
export class AdaptiveController {
  constructor(
    private zpdCalculator: ZPDCalculatorService,
    private recommendations: RecommendationService,
    private interleaving: InterleavingService,
    private transfer: TransferService,
    private cognitiveLoad: CognitiveLoadService,
    private engagement: EngagementService,
  ) {}

  /**
   * Attention/Engagement Engine v1: session-level abandonment-rate +
   * completion-speed signal computed from real LearningEvent rows (see
   * engagement.service.ts header for full scope notes). Distinct from
   * Cognitive Load Engine's per-attempt fatigue signal above.
   */
  @Get('engagement')
  async getEngagement(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have an engagement assessment');
    }
    return this.engagement.assessEngagement(learnerId);
  }

  /**
   * Cognitive Load Engine v1 — the read side (`assessLoad()`) existed in
   * `CognitiveLoadService` since it was first built but was never exposed
   * via any controller route (Gap Matrix note: "the fatigue-level/pacing-
   * recommendation read side exists in code but not yet exposed via a
   * controller route"). This closes that gap: a learner (or an admin
   * viewing on a learner's behalf, guard TBD) can now fetch their own
   * current rolling-window fatigue assessment.
   */
  @Get('cognitive-load')
  async getCognitiveLoad(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have a cognitive load assessment');
    }
    return this.cognitiveLoad.assessLoad(learnerId);
  }

  /**
   * Interleaving Engine v1: build an interleaved (competency-alternating)
   * multi-competency practice set, mixing review-due and struggling-focus
   * competencies instead of blocking practice by a single competency.
   */
  @Get('interleaved-practice')
  async getInterleavedPractice(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners can get an interleaved practice set');
    }
    const limitNum = limit ? parseInt(limit, 10) : 6;
    return this.interleaving.getInterleavedPracticeSet(learnerId, limitNum);
  }

  /**
   * Transfer Engine v1 (read-only view): concrete cross-competency
   * transfer opportunities not yet primed for this learner — competencies
   * they've mastered whose dependents haven't been primed yet.
   */
  @Get('transfer-opportunities')
  async getTransferOpportunities(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have transfer opportunities');
    }
    return this.transfer.listTransferOpportunities(learnerId);
  }

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

  /**
   * Full adaptive-loop orchestration in one call: calculate the
   * learner's ZPD, then hand it straight to the recommendation engine
   * to pick one concrete next activity. Closes the "no full
   * adaptive-loop orchestration" gap with a single-purpose endpoint
   * (not a generic framework).
   */
  @Get('next-activity')
  async getNextActivityOrchestrated(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners can get a next-activity suggestion');
    }

    return this.recommendations.getOrchestratedNextActivity(learnerId);
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
