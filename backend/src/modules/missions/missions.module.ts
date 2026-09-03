import { Module } from '@nestjs/common';
import { MissionsController } from './missions.controller';
import { AdminMissionsController } from './admin-missions.controller';
import { MissionsService } from './missions.service';
import { ActivityEvaluator } from './evaluators/activity-evaluator';
import { MasteryModule } from '../mastery/mastery.module';
import { AuthModule } from '../auth/auth.module';
import { AdaptiveModule } from '../adaptive/adaptive.module';

@Module({
  imports: [MasteryModule, AuthModule, AdaptiveModule],
  controllers: [MissionsController, AdminMissionsController],
  providers: [MissionsService, ActivityEvaluator],
  exports: [MissionsService],
})
export class MissionsModule {}
