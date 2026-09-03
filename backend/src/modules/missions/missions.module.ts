import { Module } from '@nestjs/common';
import { MissionsController } from './missions.controller';
import { AdminMissionsController } from './admin-missions.controller';
import { MissionsService } from './missions.service';
import { ActivityEvaluator } from './evaluators/activity-evaluator';
import { MasteryModule } from '../mastery/mastery.module';
import { AuthModule } from '../auth/auth.module';
import { AdaptiveModule } from '../adaptive/adaptive.module';
import { MisconceptionModule } from '../misconceptions/misconception.module';
import { InterventionModule } from '../interventions/intervention.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MasteryModule, AuthModule, AdaptiveModule, MisconceptionModule, InterventionModule, NotificationsModule],
  controllers: [MissionsController, AdminMissionsController],
  providers: [MissionsService, ActivityEvaluator],
  exports: [MissionsService],
})
export class MissionsModule {}
