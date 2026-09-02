/**
 * Voice Module DTOs.
 */
import { IsString } from 'class-validator';

export class VoiceTurnDto {
  @IsString()
  conversationId: string;
}

export interface VoiceTurnResult {
  transcript: string;
  aiResponseText: string;
  audioUrl: string;
}
