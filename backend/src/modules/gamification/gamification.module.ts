import { Module } from '@nestjs/common';
import { GamificationController } from './gamification.controller';
import { ProgressionService } from './progression.service';
import { AchievementsService } from './achievements.service';
import { StreaksService } from './streaks.service';
import { CosmeticsService } from './cosmetics.service';
import { StreakFreezeService } from './streak-freeze.service';

@Module({
  controllers: [GamificationController],
  providers: [ProgressionService, AchievementsService, StreaksService, CosmeticsService, StreakFreezeService],
  exports: [ProgressionService, AchievementsService, StreaksService, CosmeticsService, StreakFreezeService],
})
export class GamificationModule {}
