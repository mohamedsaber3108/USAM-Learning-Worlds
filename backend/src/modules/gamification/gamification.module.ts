import { Module } from '@nestjs/common';
import { GamificationController } from './gamification.controller';
import { ProgressionService } from './progression.service';
import { AchievementsService } from './achievements.service';
import { StreaksService } from './streaks.service';
import { CosmeticsService } from './cosmetics.service';

@Module({
  controllers: [GamificationController],
  providers: [ProgressionService, AchievementsService, StreaksService, CosmeticsService],
  exports: [ProgressionService, AchievementsService, StreaksService, CosmeticsService],
})
export class GamificationModule {}
