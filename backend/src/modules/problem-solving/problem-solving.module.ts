import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ProblemSolvingController } from './problem-solving.controller';
import { ComputationalThinkingController } from './computational-thinking.controller';
import { CriticalThinkingController } from './critical-thinking.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ProblemSolvingController, ComputationalThinkingController, CriticalThinkingController],
})
export class ProblemSolvingModule {}
