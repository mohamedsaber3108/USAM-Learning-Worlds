import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CrossCurricularController } from './cross-curricular.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CrossCurricularController],
})
export class CrossCurricularModule {}
