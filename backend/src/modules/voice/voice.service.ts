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
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ConversationService } from '../ai/services/conversation.service';

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

const DEFAULT_SIDECAR_TIMEOUT_MS = 9_000; // within the 8-10s target window

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private readonly asrUrl: string;
  private readonly ttsUrl: string;
  private readonly audioDir: string;
  private readonly publicAudioPrefix = '/voice-audio';
  private readonly sidecarTimeoutMs: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly conversationService: ConversationService,
  ) {
    this.asrUrl = this.configService.get<string>('ASR_SIDECAR_URL') || 'http://127.0.0.1:8100';
    this.ttsUrl = this.configService.get<string>('TTS_SIDECAR_URL') || 'http://127.0.0.1:8200';
    this.sidecarTimeoutMs =
      Number(this.configService.get<string>('VOICE_SIDECAR_TIMEOUT_MS')) ||
      DEFAULT_SIDECAR_TIMEOUT_MS;
    // Served statically by main.ts (app.useStaticAssets) under /voice-audio.
    this.audioDir = join(process.cwd(), 'public', 'voice-audio');
    if (!existsSync(this.audioDir)) {
      mkdirSync(this.audioDir, { recursive: true });
    }
  }

  /**
   * fetch() with a hard timeout. Node's global fetch has no default
   * timeout, so a hung/unreachable sidecar can otherwise block forever.
   * Aborts the request after `this.sidecarTimeoutMs` and surfaces a
   * distinguishable timeout error to the caller.
   */
  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.sidecarTimeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
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
    try {
      const form = new FormData();
      form.append(
        'file',
        new Blob([new Uint8Array(audioBuffer)]),
        filename || 'audio.wav',
      );

      const res = await this.fetchWithTimeout(`${this.asrUrl}/transcribe`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`ASR sidecar returned ${res.status}: ${body}`);
      }

      const data = (await res.json()) as { text: string };
      return (data.text || '').trim();
    } catch (err) {
      this.logger.error(`ASR sidecar call failed: ${err}`);
      if (this.isTimeoutError(err)) {
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
  }

  /**
   * Call the TTS sidecar (Piper) to synthesize speech from text, save the
   * resulting wav to public/voice-audio/, and return its public URL path.
   * Bounded by a hard timeout — callers (processTurn) treat TTS failure as
   * non-fatal and degrade to a text-only reply rather than hanging.
   */
  async synthesize(text: string): Promise<string> {
    try {
      const res = await this.fetchWithTimeout(`${this.ttsUrl}/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`TTS sidecar returned ${res.status}: ${body}`);
      }

      const wavBuffer = Buffer.from(await res.arrayBuffer());
      const filename = `${randomUUID()}.wav`;
      writeFileSync(join(this.audioDir, filename), wavBuffer);

      return `${this.publicAudioPrefix}/${filename}`;
    } catch (err) {
      this.logger.error(`TTS sidecar call failed: ${err}`);
      if (this.isTimeoutError(err)) {
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
  }

  private isTimeoutError(err: unknown): boolean {
    return (
      err instanceof Error &&
      (err.name === 'AbortError' || /aborted/i.test(err.message))
    );
  }
}
