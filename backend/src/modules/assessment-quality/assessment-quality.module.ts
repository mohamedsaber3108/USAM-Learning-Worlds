import { Module } from '@nestjs/common';
import { AssessmentQualityService } from './assessment-quality.service';
import { AdminAssessmentQualityController } from './admin-assessment-quality.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminAssessmentQualityController],
  providers: [AssessmentQualityService],
  exports: [AssessmentQualityService],
})
export class AssessmentQualityModule {}
