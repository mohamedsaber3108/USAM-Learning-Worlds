import { Module } from '@nestjs/common';
import { AdaptiveController } from './adaptive.controller';
import { ZPDCalculatorService } from './zpd-calculator.service';
import { RecommendationService } from './recommendation.service';

@Module({
  controllers: [AdaptiveController],
  providers: [ZPDCalculatorService, RecommendationService],
  exports: [ZPDCalculatorService, RecommendationService],
})
export class AdaptiveModule {}
