import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { ConceptService } from './services/concept.service';
import { LearningPathService } from './services/learning-path.service';
import { ContentAdaptationService } from './services/content-adaptation.service';
import { LearningEventService } from './services/learning-event.service';
import { TranslationService } from './services/translation.service';
import { LearningController } from './learning.controller';
import { EnglishController } from './english.controller';
import { CodingController } from './coding.controller';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AIModule],
  controllers: [LearningController, EnglishController, CodingController],
  providers: [
    ConceptService,
    LearningPathService,
    ContentAdaptationService,
    LearningEventService,
    TranslationService,
  ],
  exports: [
    ConceptService,
    LearningPathService,
    ContentAdaptationService,
    LearningEventService,
    TranslationService,
  ],
})
export class LearningModule {}
