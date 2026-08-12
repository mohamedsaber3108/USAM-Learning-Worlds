import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MasteryController } from './mastery.controller';
import { MasteryService } from './mastery.service';
import { MasteryConfidenceAlgorithm } from './mastery-confidence.algorithm';
import { MasteryProcessor } from './processors/mastery.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mastery',
    }),
  ],
  controllers: [MasteryController],
  providers: [MasteryService, MasteryConfidenceAlgorithm, MasteryProcessor],
  exports: [MasteryService],
})
export class MasteryModule {}
