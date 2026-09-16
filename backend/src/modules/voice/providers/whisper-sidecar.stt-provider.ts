/**
 * Whisper sidecar STT provider (audit T-P1-9).
 *
 * Wraps the existing faster-whisper Python sidecar (default
 * 127.0.0.1:8100) behind the SttProvider interface. This is the generic,
 * always-available baseline provider. A fine-tuned Egyptian-Arabic provider
 * can be registered ahead of it (higher priority); VoiceService falls back
 * to this one if the specialized provider is unavailable/fails.
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SttOptions,
  SttProvider,
  SttResult,
} from '../interfaces/voice-provider.interface';

const DEFAULT_TIMEOUT_MS = 9_000;

@Injectable()
export class WhisperSidecarSttProvider implements SttProvider {
  readonly id = 'whisper-sidecar';
  readonly name = 'faster-whisper sidecar';
  private readonly logger = new Logger(WhisperSidecarSttProvider.name);
  private readonly url: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: ConfigService) {
    this.url = this.config.get<string>('ASR_SIDECAR_URL') || 'http://127.0.0.1:8100';
    this.timeoutMs =
      Number(this.config.get<string>('VOICE_SIDECAR_TIMEOUT_MS')) || DEFAULT_TIMEOUT_MS;
  }

  async transcribe(audio: Buffer, options?: SttOptions): Promise<SttResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const form = new FormData();
      form.append('file', new Blob([new Uint8Array(audio)]), options?.filename || 'audio.wav');
      if (options?.languageHint) {
        form.append('language', options.languageHint);
      }

      const res = await fetch(`${this.url}/transcribe`, {
        method: 'POST',
        body: form,
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`ASR sidecar returned ${res.status}: ${body}`);
      }

      const data = (await res.json()) as { text: string; language?: string; confidence?: number };
      return {
        text: (data.text || '').trim(),
        language: data.language,
        confidence: data.confidence,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2_000);
      const res = await fetch(`${this.url}/health`, { signal: controller.signal }).finally(() =>
        clearTimeout(timer),
      );
      return res.ok;
    } catch (err) {
      this.logger.debug(`Whisper sidecar health check failed: ${err}`);
      return false;
    }
  }
}
