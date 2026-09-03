import { Module } from '@nestjs/common';
import { AdaptiveController } from './adaptive.controller';
import { ZPDCalculatorService } from './zpd-calculator.service';
import { RecommendationService } from './recommendation.service';
import { CognitiveLoadService } from './cognitive-load.service';

@Module({
  controllers: [AdaptiveController],
  providers: [ZPDCalculatorService, RecommendationService, CognitiveLoadService],
  exports: [ZPDCalculatorService, RecommendationService, CognitiveLoadService],
})
export class AdaptiveModule {}
