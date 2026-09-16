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
import { WhisperSidecarSttProvider } from './providers/whisper-sidecar.stt-provider';
import { PiperSidecarTtsProvider } from './providers/piper-sidecar.tts-provider';
import {
  STT_PROVIDERS,
  TTS_PROVIDERS,
} from './interfaces/voice-provider.interface';

@Module({
  imports: [AIModule],
  controllers: [VoiceController],
  providers: [
    VoiceService,
    WhisperSidecarSttProvider,
    PiperSidecarTtsProvider,
    // Ordered provider arrays (priority order). A fine-tuned EG-Arabic
    // provider, once added, is prepended here ahead of the generic ones;
    // VoiceService falls back down the list on failure.
    {
      provide: STT_PROVIDERS,
      useFactory: (whisper: WhisperSidecarSttProvider) => [whisper],
      inject: [WhisperSidecarSttProvider],
    },
    {
      provide: TTS_PROVIDERS,
      useFactory: (piper: PiperSidecarTtsProvider) => [piper],
      inject: [PiperSidecarTtsProvider],
    },
  ],
  exports: [VoiceService],
})
export class VoiceModule {}
