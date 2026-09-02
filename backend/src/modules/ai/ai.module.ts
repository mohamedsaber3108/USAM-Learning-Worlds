import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { CharacterController } from './character.controller';
import { CodingCoachController } from './coding-coach.controller';
import { EnglishCoachController } from './english-coach.controller';
import { BedrockService } from './bedrock.service';
import { ModerationService } from './moderation.service';
import { AIUsageService } from './ai-usage.service';

// Phase 3 services
import { BedrockAdapter } from './providers/bedrock.adapter';
import { AIProviderService } from './ai-provider.service';
import { LearnerContextService } from './learner-context.service';
import { CharacterService } from './character.service';
import { ConversationService } from './services/conversation.service';

// Domain-specific coaches
import { EnglishCoachService } from './services/english-coach.service';
import { CodingCoachService } from './services/coding-coach.service';

@Module({
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

    // Phase 3 services
    BedrockAdapter,
    AIProviderService,
    LearnerContextService,
    CharacterService,
    ConversationService,

    // Domain coaches
    EnglishCoachService,
    CodingCoachService,
  ],
  exports: [
    // Export both old and new for gradual migration
    BedrockService,
    ModerationService,
    AIUsageService,
    AIProviderService,
    LearnerContextService,
    CharacterService,
    ConversationService,
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
