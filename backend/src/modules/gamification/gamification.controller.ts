import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ProgressionService } from './progression.service';
import { AchievementsService } from './achievements.service';
import { StreaksService } from './streaks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(
    private progression: ProgressionService,
    private achievements: AchievementsService,
    private streaks: StreaksService,
  ) {}

  @Get('progression')
  async getProgression(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have progression');
    }

    const progression = await this.progression.getProgression(learnerId);
    const xpForNext = this.progression.getXPForNextLevel(progression.level);
    const xpInCurrentLevel = progression.totalXP - (xpForNext - this.getLevelXPRange(progression.level));

    return {
      ...progression,
      xpForNextLevel: xpForNext,
      xpInCurrentLevel,
      progress: (xpInCurrentLevel / this.getLevelXPRange(progression.level)) * 100,
    };
  }

  @Post('award-xp')
  async awardXP(
    @CurrentUser() user: any,
    @Body() dto: { amount: number; source: string; sourceId: string; reason?: string },
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners can earn XP');
    }

    return this.progression.awardXP(
      learnerId,
      dto.amount,
      dto.source,
      dto.sourceId,
      dto.reason,
    );
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.progression.getLeaderboard(limitNum);
  }

  @Get('rank')
  async getMyRank(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have ranks');
    }

    return this.progression.getLearnerRank(learnerId);
  }

  @Get('achievements')
  async getAchievements(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have achievements');
    }

    return this.achievements.getAchievementProgress(learnerId);
  }

  @Get('streak')
  async getStreak(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have streaks');
    }

    return this.streaks.getStreak(learnerId);
  }

  @Post('streak/update')
  async updateStreak(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have streaks');
    }

    return this.streaks.updateStreak(learnerId);
  }

  private getLevelXPRange(level: number): number {
    if (level === 1) return 100;
    if (level === 2) return 200;
    if (level === 3) return 300;
    if (level === 4) return 400;
    if (level === 5) return 500;
    if (level === 6) return 600;
    if (level === 7) return 700;
    if (level === 8) return 800;
    if (level === 9) return 900;
    if (level === 10) return 1000;
    return 1000;
  }
}
