import { Module } from '@nestjs/common';
import { AdaptiveController } from './adaptive.controller';
import { ZPDCalculatorService } from './zpd-calculator.service';
import { RecommendationService } from './recommendation.service';
import { CognitiveLoadService } from './cognitive-load.service';
import { InterleavingService } from './interleaving.service';
import { TransferService } from './transfer.service';

@Module({
  controllers: [AdaptiveController],
  providers: [
    ZPDCalculatorService,
    RecommendationService,
    CognitiveLoadService,
    InterleavingService,
    TransferService,
  ],
  exports: [
    ZPDCalculatorService,
    RecommendationService,
    CognitiveLoadService,
    InterleavingService,
    TransferService,
  ],
})
export class AdaptiveModule {}
