import { Module } from '@nestjs/common';
import { AdaptiveController } from './adaptive.controller';
import { ZPDCalculatorService } from './zpd-calculator.service';
import { RecommendationService } from './recommendation.service';
import { CognitiveLoadService } from './cognitive-load.service';
import { InterleavingService } from './interleaving.service';
import { TransferService } from './transfer.service';
import { EngagementService } from './engagement.service';

@Module({
  controllers: [AdaptiveController],
  providers: [
    ZPDCalculatorService,
    RecommendationService,
    CognitiveLoadService,
    InterleavingService,
    TransferService,
    EngagementService,
  ],
  exports: [
    ZPDCalculatorService,
    RecommendationService,
    CognitiveLoadService,
    InterleavingService,
    TransferService,
    EngagementService,
  ],
})
export class AdaptiveModule {}
