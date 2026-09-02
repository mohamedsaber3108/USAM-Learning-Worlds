/**
 * Voice Module — Voice Pipeline v1.
 *
 * Two Python sidecars (services/asr-sidecar, services/tts-sidecar) do the
 * ML-heavy ASR/TTS work; this module is a thin NestJS orchestration layer
 * that reuses the existing AIModule's ConversationService for the actual
 * text-in/text-out AI logic — it deliberately does not duplicate any AI
 * pipeline. See docs/architecture/USAM_OSS_INTEGRATION_PLAN.md Section 3.
 */
import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [VoiceController],
  providers: [VoiceService],
  exports: [VoiceService],
})
export class VoiceModule {}
