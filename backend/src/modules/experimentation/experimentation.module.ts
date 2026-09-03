import { Module } from '@nestjs/common';
import { ExperimentationService } from './experimentation.service';
import { ExperimentationController } from './experimentation.controller';

@Module({
  controllers: [ExperimentationController],
  providers: [ExperimentationService],
  exports: [ExperimentationService],
})
export class ExperimentationModule {}
