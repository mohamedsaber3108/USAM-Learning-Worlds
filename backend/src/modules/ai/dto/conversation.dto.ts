/**
 * Conversation DTOs
 * Request/response objects for character conversation APIs
 */

import { IsString, IsEnum, IsOptional, IsObject, MaxLength } from 'class-validator';
import { ConversationType } from '@prisma/client';

export class CreateConversationDto {
  @IsString()
  characterId: string;

  @IsEnum(ConversationType)
  type: ConversationType;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  initialMessage?: string;
}

export class SendMessageDto {
  @IsString()
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class ChatWithCharacterDto {
  @IsString()
  @MaxLength(2000)
  message: string;

  @IsOptional()
  @IsObject()
  context?: {
    missionId?: string;
    activityId?: string;
    projectId?: string;
    situation?: string;
  };
}
