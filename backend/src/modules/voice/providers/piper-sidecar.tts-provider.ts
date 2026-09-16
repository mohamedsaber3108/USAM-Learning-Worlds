/**
 * Piper sidecar TTS provider (audit T-P1-9).
 *
 * Wraps the existing Piper Python sidecar (default 127.0.0.1:8200) behind
 * the TtsProvider interface. Baseline synthesis engine; a higher-priority
 * provider (e.g. a more natural EG-Arabic child voice) can be registered
 * ahead of it with this as fallback.
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TtsOptions,
  TtsProvider,
  TtsResult,
} from '../interfaces/voice-provider.interface';

const DEFAULT_TIMEOUT_MS = 9_000;

@Injectable()
export class PiperSidecarTtsProvider implements TtsProvider {
  readonly id = 'piper-sidecar';
  readonly name = 'Piper sidecar';
  private readonly logger = new Logger(PiperSidecarTtsProvider.name);
  private readonly url: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: ConfigService) {
    this.url = this.config.get<string>('TTS_SIDECAR_URL') || 'http://127.0.0.1:8200';
    this.timeoutMs =
      Number(this.config.get<string>('VOICE_SIDECAR_TIMEOUT_MS')) || DEFAULT_TIMEOUT_MS;
  }

  async synthesize(text: string, options?: TtsOptions): Promise<TtsResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.url}/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: options?.languageHint }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`TTS sidecar returned ${res.status}: ${body}`);
      }

      return {
        audio: Buffer.from(await res.arrayBuffer()),
        mimeType: 'audio/wav',
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
      this.logger.debug(`Piper sidecar health check failed: ${err}`);
      return false;
    }
  }
}
