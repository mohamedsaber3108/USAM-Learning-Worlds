/**
 * Conversation Service
 *
 * Manages conversation sessions, message history, and conversation lifecycle
 * Conversations are educational interactions, not social chat
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { LearnerContextService } from '../learner-context.service';
import { CharacterService } from '../character.service';
import { ModerationService } from '../moderation.service';
import {
  Conversation,
  ConversationType,
  ConversationStatus,
  MessageRole,
} from '@prisma/client';

export interface CreateConversationDto {
  learnerId: string;
  characterId: string;
  type: ConversationType;
  sessionId?: string;
  initialMessage?: string;
}

export interface SendMessageDto {
  content: string;
  metadata?: any;
}

export interface ConversationWithMessages extends Conversation {
  messages: any[];
  character: any;
}

@Injectable()
export class ConversationService {
  constructor(
    private prisma: PrismaService,
    private learnerContext: LearnerContextService,
    private characterService: CharacterService,
    private moderation: ModerationService,
  ) {}

  /**
   * Create new conversation session
   */
  async createConversation(dto: CreateConversationDto): Promise<ConversationWithMessages> {
    // Verify character exists
    await this.characterService.getCharacter(dto.characterId);

    // Verify learner exists
    const learner = await this.prisma.learner.findUnique({
      where: { id: dto.learnerId },
    });

    if (!learner) {
      throw new NotFoundException('Learner not found');
    }

    // Check for existing active conversation with same character
    const existingActive = await this.prisma.conversation.findFirst({
      where: {
        learnerId: dto.learnerId,
        characterId: dto.characterId,
        status: 'ACTIVE',
      },
    });

    if (existingActive) {
      // Resume existing conversation
      return this.getConversation(existingActive.id);
    }

    // Build context snapshot
    const context = await this.learnerContext.buildContext(dto.learnerId, dto.sessionId);

    // Create conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        learnerId: dto.learnerId,
        characterId: dto.characterId,
        type: dto.type,
        status: 'ACTIVE',
        sessionId: dto.sessionId,
        contextSnapshot: context as any,
      },
      include: {
        character: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Send initial message if provided
    if (dto.initialMessage) {
      await this.sendMessage(conversation.id, dto.learnerId, {
        content: dto.initialMessage,
      });

      // Reload conversation with messages
      return this.getConversation(conversation.id);
    }

    return conversation as ConversationWithMessages;
  }

  /**
   * Get conversation with full message history
   */
  async getConversation(conversationId: string): Promise<ConversationWithMessages> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        character: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation as ConversationWithMessages;
  }

  /**
   * Send message in conversation and get character response
   */
  async sendMessage(
    conversationId: string,
    learnerId: string,
    dto: SendMessageDto,
  ): Promise<{
    learnerMessage: any;
    characterMessage: any;
  }> {
    const conversation = await this.getConversation(conversationId);

    // Verify ownership
    if (conversation.learnerId !== learnerId) {
      throw new BadRequestException('Not your conversation');
    }

    // Verify conversation is active
    if (conversation.status !== 'ACTIVE') {
      throw new BadRequestException('Conversation is not active');
    }

    // Moderate learner message — real check, not a bypassed stub.
    // Fails closed on infra error (treated as HIGH) so a moderation-service
    // outage never silently lets unmoderated content through.
    let moderationResult: { flagged: boolean; severity: string; explanation?: string };
    try {
      const result = await this.moderation.moderateContent(dto.content, 'TEXT', learnerId);
      moderationResult = { flagged: result.flagged, severity: result.severity, explanation: result.explanation };
    } catch (error: any) {
      moderationResult = { flagged: true, severity: 'HIGH', explanation: 'moderation service error' };
    }

    if (moderationResult.flagged) {
      // Block conversation if severe violation
      if (moderationResult.severity === 'HIGH' || moderationResult.severity === 'CRITICAL') {
        await this.updateStatus(conversationId, 'BLOCKED');
        throw new BadRequestException('Message violates content policy');
      }
    }

    // Save learner message
    const learnerMessage = await this.prisma.conversationMessage.create({
      data: {
        conversationId,
        role: 'LEARNER',
        content: dto.content,
        metadata: dto.metadata,
        moderationResult: moderationResult as any,
      },
    });

    // Generate character response
    const characterResponse = await this.characterService.generateResponse(
      conversation.characterId,
      learnerId,
      dto.content,
      {
        missionId: (conversation.contextSnapshot as any)?.currentMission?.id,
        projectId: (conversation.contextSnapshot as any)?.currentProject?.id,
        situation: this.determineConversationSituation(conversation),
        conversationType: conversation.type,
      },
    );

    // Save character message
    const characterMessage = await this.prisma.conversationMessage.create({
      data: {
        conversationId,
        role: 'CHARACTER',
        content: characterResponse.message,
        metadata: {
          mood: characterResponse.mood,
          suggestedActions: characterResponse.suggestedActions,
          ...characterResponse.metadata,
        },
      },
    });

    // Update conversation context if needed (every 10 messages)
    const messageCount = await this.prisma.conversationMessage.count({
      where: { conversationId },
    });

    if (messageCount % 10 === 0) {
      await this.refreshContext(conversationId, learnerId);
    }

    return {
      learnerMessage,
      characterMessage,
    };
  }

  /**
   * Get conversation message history
   */
  async getMessageHistory(
    conversationId: string,
    learnerId: string,
    options: {
      limit?: number;
      offset?: number;
      since?: Date;
    } = {},
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.learnerId !== learnerId) {
      throw new BadRequestException('Not your conversation');
    }

    return this.prisma.conversationMessage.findMany({
      where: {
        conversationId,
        createdAt: options.since ? { gte: options.since } : undefined,
      },
      orderBy: { createdAt: 'asc' },
      take: options.limit || 100,
      skip: options.offset || 0,
    });
  }

  /**
   * List learner's conversations
   */
  async listConversations(
    learnerId: string,
    options: {
      status?: ConversationStatus;
      characterId?: string;
      type?: ConversationType;
      limit?: number;
    } = {},
  ) {
    return this.prisma.conversation.findMany({
      where: {
        learnerId,
        status: options.status,
        characterId: options.characterId,
        type: options.type,
      },
      include: {
        character: { select: { id: true, name: true, role: true, avatarUrl: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: options.limit || 20,
    });
  }

  /**
   * Update conversation status
   */
  async updateStatus(
    conversationId: string,
    status: ConversationStatus,
  ): Promise<Conversation> {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status,
        endedAt: status === 'ENDED' || status === 'BLOCKED' ? new Date() : undefined,
      },
    });
  }

  /**
   * Pause conversation
   */
  async pauseConversation(conversationId: string, learnerId: string): Promise<Conversation> {
    const conversation = await this.getConversation(conversationId);

    if (conversation.learnerId !== learnerId) {
      throw new BadRequestException('Not your conversation');
    }

    return this.updateStatus(conversationId, 'PAUSED');
  }

  /**
   * Resume conversation
   */
  async resumeConversation(conversationId: string, learnerId: string): Promise<Conversation> {
    const conversation = await this.getConversation(conversationId);

    if (conversation.learnerId !== learnerId) {
      throw new BadRequestException('Not your conversation');
    }

    if (conversation.status !== 'PAUSED') {
      throw new BadRequestException('Can only resume paused conversations');
    }

    return this.updateStatus(conversationId, 'ACTIVE');
  }

  /**
   * End conversation
   */
  async endConversation(conversationId: string, learnerId: string): Promise<Conversation> {
    const conversation = await this.getConversation(conversationId);

    if (conversation.learnerId !== learnerId) {
      throw new BadRequestException('Not your conversation');
    }

    return this.updateStatus(conversationId, 'ENDED');
  }

  /**
   * Refresh conversation context snapshot
   */
  async refreshContext(conversationId: string, learnerId: string): Promise<void> {
    const context = await this.learnerContext.buildContext(learnerId);

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        contextSnapshot: context as any,
      },
    });
  }

  /**
   * Get conversation summary/stats
   */
  async getConversationSummary(conversationId: string, learnerId: string) {
    const conversation = await this.getConversation(conversationId);

    if (conversation.learnerId !== learnerId) {
      throw new BadRequestException('Not your conversation');
    }

    const messages = conversation.messages;
    const learnerMessages = messages.filter((m) => m.role === 'LEARNER');
    const characterMessages = messages.filter((m) => m.role === 'CHARACTER');

    const duration = conversation.endedAt
      ? conversation.endedAt.getTime() - conversation.startedAt.getTime()
      : Date.now() - conversation.startedAt.getTime();

    return {
      conversationId,
      type: conversation.type,
      status: conversation.status,
      character: {
        id: conversation.character.id,
        name: conversation.character.name,
        role: conversation.character.role,
      },
      startedAt: conversation.startedAt,
      endedAt: conversation.endedAt,
      durationMinutes: Math.round(duration / 60000),
      messageCount: messages.length,
      learnerMessageCount: learnerMessages.length,
      characterMessageCount: characterMessages.length,
    };
  }

  /**
   * Determine conversation situation for context
   */
  private determineConversationSituation(conversation: any): string {
    const context = conversation.contextSnapshot;

    if (conversation.type === 'ENGLISH_PRACTICE') {
      return 'English conversation practice';
    }

    if (conversation.type === 'CODING_HELP') {
      return 'Coding assistance';
    }

    if (conversation.type === 'PROJECT_GUIDANCE') {
      return `Project guidance for: ${context?.currentProject?.title || 'current project'}`;
    }

    if (conversation.type === 'ROLEPLAY') {
      return `Roleplay scenario${context?.currentMission ? ` set in mission: ${context.currentMission.title}` : ''}`;
    }

    if (conversation.type === 'DEBATE') {
      return `Friendly debate${context?.currentMission ? ` connected to mission: ${context.currentMission.title}` : ''} - argue a side, then swap`;
    }

    if (conversation.type === 'INTERVIEW') {
      return `Interview practice${context?.currentMission ? ` for mission: ${context.currentMission.title}` : ''} - character asks the questions`;
    }

    if (context?.currentMission) {
      return `Mission: ${context.currentMission.title}`;
    }

    return 'General learning support';
  }

  /**
   * Delete old conversations (data retention)
   */
  async deleteOldConversations(olderThanDays: number = 90): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    const result = await this.prisma.conversation.deleteMany({
      where: {
        status: { in: ['ENDED', 'BLOCKED'] },
        endedAt: { lt: cutoff },
      },
    });

    return result.count;
  }
}
