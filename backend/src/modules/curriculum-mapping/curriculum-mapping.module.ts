import { Module } from '@nestjs/common';
import { CurriculumMappingService } from './curriculum-mapping.service';
import { CurriculumMappingController } from './curriculum-mapping.controller';

@Module({
  controllers: [CurriculumMappingController],
  providers: [CurriculumMappingService],
  exports: [CurriculumMappingService],
})
export class CurriculumMappingModule {}
