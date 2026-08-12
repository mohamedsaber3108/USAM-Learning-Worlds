import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BedrockService } from './bedrock.service';

export interface ModerationResult {
  flagged: boolean;
  categories: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string;
  shouldBlock: boolean;
}

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    private prisma: PrismaService,
    private bedrock: BedrockService,
  ) {}

  /**
   * Moderate user-generated content
   */
  async moderateContent(
    content: string,
    contentType: 'TEXT' | 'IMAGE_URL' | 'CODE',
    userId?: string,
  ): Promise<ModerationResult> {
    const systemPrompt = `You are a content moderation AI for a K-12 educational platform.
Flag content that is:
- Inappropriate for children (violence, adult content, hate speech)
- Contains personal information (names, addresses, phone numbers, emails)
- Contains bullying or harassment
- Contains dangerous instructions
- Spam or commercial content

Return JSON:
{
  "flagged": boolean,
  "categories": ["category1", "category2"],
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "explanation": "brief explanation",
  "shouldBlock": boolean
}`;

    const userMessage = `Moderate this ${contentType.toLowerCase()} content for a K-12 platform:

${content}

Analyze and return the JSON response.`;

    try {
      const response = await this.bedrock.invoke(
        [{ role: 'user', content: userMessage }],
        {
          systemPrompt,
          maxTokens: 500,
          temperature: 0.2,
        },
      );

      const result = JSON.parse(response.content);

      await this.logModeration(content, contentType, result, userId);

      return result;
    } catch (error) {
      this.logger.error(`Moderation failed: ${error.message}`, error.stack);

      return {
        flagged: true,
        categories: ['ERROR'],
        severity: 'HIGH',
        explanation: 'Moderation service error - content blocked for safety',
        shouldBlock: true,
      };
    }
  }

  /**
   * Check if content is safe for learners
   */
  async isSafe(content: string, contentType: 'TEXT' | 'IMAGE_URL' | 'CODE'): Promise<boolean> {
    const result = await this.moderateContent(content, contentType);
    return !result.shouldBlock;
  }

  /**
   * Moderate with auto-quarantine
   */
  async moderateWithQuarantine(
    content: string,
    contentType: 'TEXT' | 'IMAGE_URL' | 'CODE',
    entityType: string,
    entityId: string,
    userId: string,
  ): Promise<ModerationResult> {
    const result = await this.moderateContent(content, contentType, userId);

    if (result.shouldBlock) {
      await this.quarantineContent(entityType, entityId, result);
    }

    return result;
  }

  /**
   * Log moderation check
   */
  private async logModeration(
    content: string,
    contentType: string,
    result: ModerationResult,
    userId?: string,
  ): Promise<void> {
    try {
      await this.prisma.moderationLog.create({
        data: {
          contentType,
          contentPreview: content.substring(0, 500),
          flagged: result.flagged,
          categories: result.categories,
          severity: result.severity,
          action: result.shouldBlock ? 'BLOCKED' : 'ALLOWED',
          reviewedBy: null,
          reviewedAt: null,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log moderation: ${error.message}`);
    }
  }

  /**
   * Quarantine flagged content
   */
  private async quarantineContent(
    entityType: string,
    entityId: string,
    moderationResult: ModerationResult,
  ): Promise<void> {
    this.logger.warn(
      `Quarantining ${entityType}:${entityId} - ${moderationResult.explanation}`,
    );

    try {
      await this.prisma.quarantinedContent.create({
        data: {
          entityType,
          entityId,
          reason: moderationResult.explanation,
          severity: moderationResult.severity,
          categories: moderationResult.categories,
          status: 'PENDING',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to quarantine content: ${error.message}`);
    }
  }

  /**
   * Get moderation statistics
   */
  async getModerationStats(startDate: Date, endDate: Date) {
    const logs = await this.prisma.moderationLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const total = logs.length;
    const flagged = logs.filter((l) => l.flagged).length;
    const blocked = logs.filter((l) => l.action === 'BLOCKED').length;

    const categoryCounts: Record<string, number> = {};
    logs.forEach((log) => {
      log.categories.forEach((cat) => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    return {
      total,
      flagged,
      blocked,
      flagRate: total > 0 ? (flagged / total) * 100 : 0,
      blockRate: total > 0 ? (blocked / total) * 100 : 0,
      categoryCounts,
    };
  }

  /**
   * Get quarantined content for review
   */
  async getQuarantinedContent(status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return this.prisma.quarantinedContent.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * Review quarantined content
   */
  async reviewContent(
    contentId: string,
    decision: 'APPROVED' | 'REJECTED',
    reviewerId: string,
    notes?: string,
  ) {
    return this.prisma.quarantinedContent.update({
      where: { id: contentId },
      data: {
        status: decision,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: notes,
      },
    });
  }
}
