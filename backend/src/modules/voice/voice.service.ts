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
 */
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ConversationService } from '../ai/services/conversation.service';

export interface VoiceTurnResult {
  transcript: string;
  aiResponseText: string;
  audioUrl: string;
}

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private readonly asrUrl: string;
  private readonly ttsUrl: string;
  private readonly audioDir: string;
  private readonly publicAudioPrefix = '/voice-audio';

  constructor(
    private readonly configService: ConfigService,
    private readonly conversationService: ConversationService,
  ) {
    this.asrUrl = this.configService.get<string>('ASR_SIDECAR_URL') || 'http://127.0.0.1:8100';
    this.ttsUrl = this.configService.get<string>('TTS_SIDECAR_URL') || 'http://127.0.0.1:8200';
    // Served statically by main.ts (app.useStaticAssets) under /voice-audio.
    this.audioDir = join(process.cwd(), 'public', 'voice-audio');
    if (!existsSync(this.audioDir)) {
      mkdirSync(this.audioDir, { recursive: true });
    }
  }

  /**
   * Full voice turn: audio in, {transcript, aiResponseText, audioUrl} out.
   */
  async processTurn(
    audioBuffer: Buffer,
    filename: string,
    conversationId: string,
    learnerId: string,
  ): Promise<VoiceTurnResult> {
    const transcript = await this.transcribe(audioBuffer, filename);

    if (!transcript) {
      throw new InternalServerErrorException('ASR returned empty transcript');
    }

    // Reuse the EXISTING conversation/AI pipeline exactly as a typed
    // message would flow through it — no parallel voice-specific AI logic.
    const { characterMessage } = await this.conversationService.sendMessage(
      conversationId,
      learnerId,
      { content: transcript, metadata: { source: 'voice' } },
    );

    const aiResponseText: string = characterMessage.content;

    const audioUrl = await this.synthesize(aiResponseText);

    return { transcript, aiResponseText, audioUrl };
  }

  /**
   * Call the ASR sidecar (faster-whisper) to transcribe an audio buffer.
   */
  async transcribe(audioBuffer: Buffer, filename: string): Promise<string> {
    try {
      const form = new FormData();
      form.append(
        'file',
        new Blob([new Uint8Array(audioBuffer)]),
        filename || 'audio.wav',
      );

      const res = await fetch(`${this.asrUrl}/transcribe`, {
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
      throw new InternalServerErrorException('Speech-to-text service unavailable');
    }
  }

  /**
   * Call the TTS sidecar (Piper) to synthesize speech from text, save the
   * resulting wav to public/voice-audio/, and return its public URL path.
   */
  async synthesize(text: string): Promise<string> {
    try {
      const res = await fetch(`${this.ttsUrl}/synthesize`, {
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
      throw new InternalServerErrorException('Text-to-speech service unavailable');
    }
  }
}
