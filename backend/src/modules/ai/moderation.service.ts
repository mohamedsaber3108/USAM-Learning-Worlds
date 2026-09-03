import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BedrockService } from './bedrock.service';
import { PiiDetectionService } from './services/pii-detection.service';
import { PromptTemplateService } from './services/prompt-template.service';

export interface ModerationResult {
  flagged: boolean;
  categories: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string;
  shouldBlock: boolean;
}

/** Inline fallback used if the DB template is missing/inactive/errors -
 * moderation must never hard-fail because of a prompt-table outage.
 * This is also the seed content for the `moderation.system` row (see
 * prisma/seeds/seed-prompt-templates.ts). */
const MODERATION_SYSTEM_PROMPT_FALLBACK = `You are a content moderation AI for a K-12 educational platform.
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

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    private prisma: PrismaService,
    private bedrock: BedrockService,
    private piiDetection: PiiDetectionService,
    private promptTemplates: PromptTemplateService,
  ) {}

  /**
   * Moderate user-generated content
   */
  async moderateContent(
    content: string,
    contentType: 'TEXT' | 'IMAGE_URL' | 'CODE',
    userId?: string,
  ): Promise<ModerationResult> {
    // Deterministic pre-check / backstop: self-hosted Presidio (MIT,
    // separate sidecar service, see
    // docs/architecture/USAM_OSS_INTEGRATION_PLAN.md Section 4) scans for
    // PII patterns (phone numbers, emails, etc.) independent of the LLM
    // call below. This never replaces the Bedrock LLM check — its verdict
    // is OR'd with the LLM's verdict, so a child sharing a phone number
    // gets flagged even if the LLM happens to miss it on a given call.
    let piiHits: Array<{ entityType: string; start: number; end: number; score: number }> = [];
    try {
      piiHits = await this.piiDetection.detectPii(content);
    } catch (error: any) {
      this.logger.warn(`Presidio PII pre-check failed, continuing with LLM-only moderation: ${error?.message}`);
    }
    const piiDetected = piiHits.length > 0;

    // AI Prompt/Policy Engine: read the moderation system prompt from
    // the versioned PromptTemplate table (key "moderation.system")
    // instead of a hardcoded string literal, with the exact original
    // text as the inline fallback if the DB row is missing/inactive/
    // errors (moderation must never hard-fail on a prompt-table outage).
    const systemPrompt = await this.promptTemplates.getPrompt(
      'moderation.system',
      MODERATION_SYSTEM_PROMPT_FALLBACK,
    );

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

      const llmResult: ModerationResult = JSON.parse(response.content);

      // OR the deterministic Presidio signal with the LLM verdict: any
      // detected PII is treated as an immediate, high-confidence flag,
      // regardless of what the LLM concluded.
      const result: ModerationResult = piiDetected
        ? {
            flagged: true,
            categories: Array.from(
              new Set([...llmResult.categories, 'PII_DETECTED']),
            ),
            severity:
              this.severityRank(llmResult.severity) >= this.severityRank('HIGH')
                ? llmResult.severity
                : 'HIGH',
            explanation: llmResult.flagged
              ? llmResult.explanation
              : `${llmResult.explanation} | Presidio detected potential PII: ${piiHits
                  .map((h) => h.entityType)
                  .join(', ')}`,
            shouldBlock: true,
          }
        : llmResult;

      await this.logModeration(content, contentType, result, userId);

      return result;
    } catch (error) {
      this.logger.error(`Moderation failed: ${error.message}`, error.stack);

      // Even if the LLM call fails, the deterministic Presidio signal
      // still applies — a Bedrock outage should never silently let PII
      // through unflagged.
      return {
        flagged: true,
        categories: piiDetected ? ['ERROR', 'PII_DETECTED'] : ['ERROR'],
        severity: 'HIGH',
        explanation: piiDetected
          ? 'Moderation service error, but Presidio detected potential PII - content blocked for safety'
          : 'Moderation service error - content blocked for safety',
        shouldBlock: true,
      };
    }
  }

  /**
   * Rank severity for comparison (higher = more severe).
   */
  private severityRank(severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): number {
    const order = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
    return order[severity] ?? 0;
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
