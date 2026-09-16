/**
 * Voice provider interfaces (audit T-P1-9).
 *
 * Abstracts speech-to-text (STT/ASR) and text-to-speech (TTS) behind
 * provider interfaces so USAM can swap or stack engines — e.g. an
 * off-the-shelf Whisper sidecar today, a fine-tuned Egyptian-Arabic
 * child-speech model tomorrow — without touching the orchestration logic
 * in VoiceService. Multiple providers can be registered in priority order;
 * VoiceService tries them in turn (fallback) until one succeeds.
 *
 * WHY THIS MATTERS FOR EG-ARABIC (see the benchmark harness):
 * Off-the-shelf Whisper transcribes Egyptian-Arabic child speech poorly
 * (WER ~0.59 in our reference numbers). Fine-tuned EG-Arabic models roughly
 * halve that. This abstraction lets us register a fine-tuned EG provider as
 * primary and keep generic Whisper as fallback, and lets the benchmark
 * harness measure any provider through the exact same interface the product
 * uses.
 */

export interface SttResult {
  /** The recognized transcript (may be empty if nothing was recognized). */
  text: string;
  /** ISO language code the provider decided/was told, if known. */
  language?: string;
  /** Provider-reported confidence 0..1, if available. */
  confidence?: number;
}

export interface SttOptions {
  /** Original upload filename (helps some engines pick a decoder). */
  filename?: string;
  /** Expected language hint, e.g. 'ar' / 'ar-EG' / 'en'. */
  languageHint?: string;
}

export interface SttProvider {
  /** Stable provider id, e.g. 'whisper-sidecar', 'eg-arabic-finetuned'. */
  readonly id: string;
  /** Human-readable name for logs/benchmarks. */
  readonly name: string;
  /** Transcribe an audio buffer to text. Throws on failure/timeout. */
  transcribe(audio: Buffer, options?: SttOptions): Promise<SttResult>;
  /** Whether this provider is currently configured/reachable. */
  isAvailable(): Promise<boolean>;
}

export interface TtsResult {
  /** Synthesized audio bytes (wav). */
  audio: Buffer;
  /** MIME type of the audio, e.g. 'audio/wav'. */
  mimeType: string;
}

export interface TtsOptions {
  /** Language/voice hint, e.g. 'ar-EG', 'en'. */
  languageHint?: string;
}

export interface TtsProvider {
  readonly id: string;
  readonly name: string;
  /** Synthesize speech audio from text. Throws on failure/timeout. */
  synthesize(text: string, options?: TtsOptions): Promise<TtsResult>;
  isAvailable(): Promise<boolean>;
}

/** DI tokens for the ordered provider arrays. */
export const STT_PROVIDERS = 'STT_PROVIDERS';
export const TTS_PROVIDERS = 'TTS_PROVIDERS';
