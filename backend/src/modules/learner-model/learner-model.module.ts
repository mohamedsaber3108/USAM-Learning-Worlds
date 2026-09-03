import { Module } from '@nestjs/common';
import { LearnerModelController } from './learner-model.controller';
import { LearnerModelService } from './learner-model.service';
import { AdaptiveModule } from '../adaptive/adaptive.module';

/**
 * Learner Model Engine
 *
 * Standalone module exposing the learner's state contract
 * (ageBand, masterySnapshot, preferences, zpdProfile) via
 * GET /learner-model/:id — usable by other engines/frontend
 * independently of AI. See learner-model.service.ts.
 */
@Module({
  imports: [AdaptiveModule],
  controllers: [LearnerModelController],
  providers: [LearnerModelService],
  exports: [LearnerModelService],
})
export class LearnerModelModule {}
