import { Module } from '@nestjs/common';
import { GamificationController } from './gamification.controller';
import { ProgressionService } from './progression.service';
import { AchievementsService } from './achievements.service';
import { StreaksService } from './streaks.service';

@Module({
  controllers: [GamificationController],
  providers: [ProgressionService, AchievementsService, StreaksService],
  exports: [ProgressionService, AchievementsService, StreaksService],
})
export class GamificationModule {}
