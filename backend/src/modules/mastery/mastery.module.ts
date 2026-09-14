import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MasteryController } from './mastery.controller';
import { MasteryService } from './mastery.service';
import { MasteryConfidenceAlgorithm } from './mastery-confidence.algorithm';
import { MasteryProcessor } from './processors/mastery.processor';
import { CredentialsModule } from '../credentials/credentials.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mastery',
    }),
    CredentialsModule,
  ],
  controllers: [MasteryController],
  providers: [MasteryService, MasteryConfidenceAlgorithm, MasteryProcessor],
  exports: [MasteryService],
})
export class MasteryModule {}
