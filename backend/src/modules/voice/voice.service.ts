/**
 * Voice Service
 *
 * Orchestrates the Voice Pipeline v1 round-trip described in
 * docs/architecture/USAM_OSS_INTEGRATION_PLAN.md Section 3:
 *
 *   audio blob -> ASR sidecar -> text -> existing ConversationService
 *   (same path a typed message takes) -> AI text response -> TTS sidecar
 *   -> { transcript, aiResponseText, audioUrl }
 *
 * Deliberately does NOT build a parallel AI pipeline: the AI text
 * generation step reuses ai/services/conversation.service.ts's
 * sendMessage() exactly as the text-chat UI would call it.
 *
 * RESILIENCE NOTE (voice sidecar health):
 * The ASR/TTS sidecars are separate local processes (127.0.0.1:8100/8200
 * by default). Plain `fetch()` has NO built-in timeout in Node — if a
 * sidecar process is hung, wedged, or the port is firewalled/blackholed
 * (as opposed to actively refusing the connection), a request can hang
 * indefinitely. Because this pipeline is driven by a child pressing "record"
 * on a mic button, an indefinite hang leaves a kid staring at a stuck
 * "Transcribing..." spinner with no way to recover short of navigating away.
 * Every sidecar call below is wrapped with a hard timeout + a child-friendly,
 * actionable fallback so the learner is never stuck waiting on a broken
 * service.
 */
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ConversationService } from '../ai/services/conversation.service';
import {
  STT_PROVIDERS,
  TTS_PROVIDERS,
  SttProvider,
  TtsProvider,
} from './interfaces/voice-provider.interface';

export interface VoiceTurnResult {
  transcript: string;
  aiResponseText: string;
  /** Null when TTS failed/timed out — the turn still succeeds as text-only. */
  audioUrl: string | null;
  /** True when speech synthesis failed/timed out but the text turn succeeded. */
  audioUnavailable?: boolean;
}

/**
 * Thrown when a sidecar is unreachable/hung and the learner should be
 * bounced back to text chat instead of waiting on a dead mic recording.
 */
export class VoiceSidecarUnavailableException extends HttpException {
  constructor(stage: 'asr' | 'tts', childMessage: string) {
    super(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'VoiceSidecarUnavailable',
        stage,
        message: childMessage,
        // Signals to the frontend: stop waiting on voice, switch the
        // learner over to the text chat input automatically.
        fallbackToText: true,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private readonly audioDir: string;
  private readonly publicAudioPrefix = '/voice-audio';

  constructor(
    private readonly conversationService: ConversationService,
    // Ordered by priority (index 0 = preferred). VoiceService tries each in
    // turn until one succeeds — e.g. a fine-tuned EG-Arabic provider first,
    // generic Whisper as fallback.
    @Inject(STT_PROVIDERS) private readonly sttProviders: SttProvider[],
    @Inject(TTS_PROVIDERS) private readonly ttsProviders: TtsProvider[],
  ) {
    // Served statically by main.ts (app.useStaticAssets) under /voice-audio.
    this.audioDir = join(process.cwd(), 'public', 'voice-audio');
    if (!existsSync(this.audioDir)) {
      mkdirSync(this.audioDir, { recursive: true });
    }
  }

  /**
   * Full voice turn: audio in, {transcript, aiResponseText, audioUrl} out.
   *
   * ASR failure/timeout: no text was recovered from the recording at all,
   * so there is nothing safe to continue with — we throw
   * VoiceSidecarUnavailableException with fallbackToText so the child is
   * routed straight to the text chat input instead of watching a spinner.
   *
   * TTS failure/timeout: the AI text reply already exists (from the same
   * pipeline typed chat uses), so we degrade gracefully — the turn still
   * completes with the transcript + text reply, just without audio
   * playback, rather than failing the whole turn over a voice-only step.
   */
  async processTurn(
    audioBuffer: Buffer,
    filename: string,
    conversationId: string,
    learnerId: string,
  ): Promise<VoiceTurnResult> {
    const transcript = await this.transcribe(audioBuffer, filename);

    if (!transcript) {
      throw new VoiceSidecarUnavailableException(
        'asr',
        "I couldn't quite hear that. Let's type your message instead!",
      );
    }

    // Reuse the EXISTING conversation/AI pipeline exactly as a typed
    // message would flow through it — no parallel voice-specific AI logic.
    const { characterMessage } = await this.conversationService.sendMessage(
      conversationId,
      learnerId,
      { content: transcript, metadata: { source: 'voice' } },
    );

    const aiResponseText: string = characterMessage.content;

    let audioUrl: string | null = null;
    let audioUnavailable = false;
    try {
      audioUrl = await this.synthesize(aiResponseText);
    } catch (err) {
      // Don't fail the whole turn: the learner still gets their answer as
      // text, they just won't hear it read aloud this time.
      this.logger.warn(
        `TTS unavailable, degrading voice turn to text-only response: ${err}`,
      );
      audioUnavailable = true;
    }

    return { transcript, aiResponseText, audioUrl, audioUnavailable };
  }

  /**
   * Call the ASR sidecar (faster-whisper) to transcribe an audio buffer.
   * Bounded by a hard timeout so an unreachable/hung sidecar can never
   * leave the caller waiting indefinitely on a broken mic recording.
   */
  async transcribe(audioBuffer: Buffer, filename: string): Promise<string> {
    let sawTimeout = false;
    // Try each registered STT provider in priority order (fallback).
    for (const provider of this.sttProviders) {
      try {
        const result = await provider.transcribe(audioBuffer, { filename });
        const text = (result.text || '').trim();
        if (text) return text;
        // Empty transcript: try the next provider before giving up.
        this.logger.warn(`STT provider ${provider.id} returned empty transcript, trying next`);
      } catch (err) {
        if (this.isTimeoutError(err)) sawTimeout = true;
        this.logger.error(`STT provider ${provider.id} failed: ${err}`);
        // Fall through to the next provider.
      }
    }

    // All providers failed/empty.
    if (sawTimeout) {
      throw new VoiceSidecarUnavailableException(
        'asr',
        "This is taking too long — let's switch to typing for now!",
      );
    }
    throw new VoiceSidecarUnavailableException(
      'asr',
      "I couldn't hear you right now — let's type instead!",
    );
  }

  /**
   * Call the TTS sidecar (Piper) to synthesize speech from text, save the
   * resulting wav to public/voice-audio/, and return its public URL path.
   * Bounded by a hard timeout — callers (processTurn) treat TTS failure as
   * non-fatal and degrade to a text-only reply rather than hanging.
   */
  async synthesize(text: string): Promise<string> {
    let sawTimeout = false;
    // Try each registered TTS provider in priority order (fallback).
    for (const provider of this.ttsProviders) {
      try {
        const { audio } = await provider.synthesize(text);
        const filename = `${randomUUID()}.wav`;
        writeFileSync(join(this.audioDir, filename), audio);
        return `${this.publicAudioPrefix}/${filename}`;
      } catch (err) {
        if (this.isTimeoutError(err)) sawTimeout = true;
        this.logger.error(`TTS provider ${provider.id} failed: ${err}`);
        // Fall through to the next provider.
      }
    }

    if (sawTimeout) {
      throw new VoiceSidecarUnavailableException(
        'tts',
        "I couldn't read that out loud right now, but here's your answer!",
      );
    }
    throw new VoiceSidecarUnavailableException(
      'tts',
      "Voice playback isn't working right now, but here's your answer!",
    );
  }

  private isTimeoutError(err: unknown): boolean {
    return (
      err instanceof Error &&
      (err.name === 'AbortError' || /aborted/i.test(err.message))
    );
  }
}
