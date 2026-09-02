import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { CharacterController } from './character.controller';
import { CodingCoachController } from './coding-coach.controller';
import { EnglishCoachController } from './english-coach.controller';
import { BedrockService } from './bedrock.service';
import { ModerationService } from './moderation.service';
import { AIUsageService } from './ai-usage.service';
import { PiiDetectionService } from './services/pii-detection.service';

// Phase 3 services
import { BedrockAdapter } from './providers/bedrock.adapter';
import { AIProviderService } from './ai-provider.service';
import { LearnerContextService } from './learner-context.service';
import { CharacterService } from './character.service';
import { ConversationService } from './services/conversation.service';
import { CharacterSafetyService } from './services/character-safety.service';

// Domain-specific coaches
import { EnglishCoachService } from './services/english-coach.service';
import { CodingCoachService } from './services/coding-coach.service';
import { EnglishLearningModule } from '../english-learning/grammar-check.module';

@Module({
  imports: [EnglishLearningModule],
  controllers: [
    AIController,
    CharacterController,
    CodingCoachController,
    EnglishCoachController,
  ],
  providers: [
    // Legacy services (kept for backward compatibility)
    BedrockService,
    ModerationService,
    AIUsageService,
    PiiDetectionService,

    // Phase 3 services
    BedrockAdapter,
    AIProviderService,
    LearnerContextService,
    CharacterService,
    ConversationService,
    CharacterSafetyService,

    // Domain coaches
    EnglishCoachService,
    CodingCoachService,
  ],
  exports: [
    // Export both old and new for gradual migration
    BedrockService,
    ModerationService,
    AIUsageService,
    PiiDetectionService,
    AIProviderService,
    LearnerContextService,
    CharacterService,
    ConversationService,
    CharacterSafetyService,
    EnglishCoachService,
    CodingCoachService,
  ],
})
export class AIModule {
  constructor(
    private aiProvider: AIProviderService,
    private bedrockAdapter: BedrockAdapter,
  ) {
    // Register Bedrock as primary provider on module init
    this.aiProvider.registerProvider(bedrockAdapter, true);
  }
}
