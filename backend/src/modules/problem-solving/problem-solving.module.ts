import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ProblemSolvingController } from './problem-solving.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ProblemSolvingController],
})
export class ProblemSolvingModule {}
