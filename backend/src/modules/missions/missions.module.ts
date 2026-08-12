import { Module } from '@nestjs/common';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';
import { ActivityEvaluator } from './evaluators/activity-evaluator';
import { MasteryModule } from '../mastery/mastery.module';

@Module({
  imports: [MasteryModule],
  controllers: [MissionsController],
  providers: [MissionsService, ActivityEvaluator],
  exports: [MissionsService],
})
export class MissionsModule {}
