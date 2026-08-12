import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { BedrockService } from './bedrock.service';
import { ModerationService } from './moderation.service';
import { AIUsageService } from './ai-usage.service';

@Module({
  controllers: [AIController],
  providers: [BedrockService, ModerationService, AIUsageService],
  exports: [BedrockService, ModerationService, AIUsageService],
})
export class AIModule {}
