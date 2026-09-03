/**
 * AI Memory Governance v1 (agent-ai-memory-governance)
 *
 * The platform persists ConversationMessage and CharacterInteraction
 * rows indefinitely today. This service adds a real purge job that
 * deletes rows whose retention window (createdForRetention +
 * retentionDays) has elapsed, plus admin-facing stats so staff can see
 * how much data exists per purposeTag and how much is currently past
 * retention. See docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md
 * "AI Memory Governance" row for the confirmed gap this closes.
 *
 * Not a stub: `purgeExpiredRecords()` issues real Prisma `deleteMany`
 * calls scoped by an expiry cutoff computed per-row via raw SQL
 * (Postgres interval arithmetic on `createdForRetention` +
 * `retentionDays` days), because Prisma's query builder can't express
 * a per-row "createdForRetention + retentionDays days < now()"
 * comparison against another column of the same row.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';

export interface PurgeResult {
  conversationMessagesDeleted: number;
  characterInteractionsDeleted: number;
  ranAt: Date;
}

export interface PurposeTagCount {
  purposeTag: string;
  total: number;
  pastRetention: number;
}

export interface MemoryGovernanceStats {
  conversationMessages: PurposeTagCount[];
  characterInteractions: PurposeTagCount[];
  totals: {
    conversationMessages: number;
    conversationMessagesPastRetention: number;
    characterInteractions: number;
    characterInteractionsPastRetention: number;
  };
  generatedAt: Date;
}

@Injectable()
export class MemoryGovernanceService {
  private readonly logger = new Logger(MemoryGovernanceService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Deletes ConversationMessage and CharacterInteraction rows whose
   * retention window has elapsed:
   *   createdForRetention + (retentionDays days) < now()
   *
   * Runs daily via the @Cron job below, and is also callable directly
   * (e.g. from an admin action or a test) since it returns a real
   * count of what it deleted.
   */
  async purgeExpiredRecords(): Promise<PurgeResult> {
    const ranAt = new Date();

    const expiredMessages = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "conversation_messages"
      WHERE "createdForRetention" + ("retentionDays" || ' days')::interval < NOW()
    `;
    const expiredInteractions = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "character_interactions"
      WHERE "createdForRetention" + ("retentionDays" || ' days')::interval < NOW()
    `;

    const messageIds = expiredMessages.map((row) => row.id);
    const interactionIds = expiredInteractions.map((row) => row.id);

    let conversationMessagesDeleted = 0;
    let characterInteractionsDeleted = 0;

    if (messageIds.length > 0) {
      const result = await this.prisma.conversationMessage.deleteMany({
        where: { id: { in: messageIds } },
      });
      conversationMessagesDeleted = result.count;
    }

    if (interactionIds.length > 0) {
      const result = await this.prisma.characterInteraction.deleteMany({
        where: { id: { in: interactionIds } },
      });
      characterInteractionsDeleted = result.count;
    }

    this.logger.log(
      `AI Memory Governance purge complete: ${conversationMessagesDeleted} conversation message(s), ` +
        `${characterInteractionsDeleted} character interaction(s) deleted for exceeding retentionDays.`,
    );

    return {
      conversationMessagesDeleted,
      characterInteractionsDeleted,
      ranAt,
    };
  }

  /**
   * Scheduled daily purge. NestJS's @Cron decorator (from
   * @nestjs/schedule, MIT-licensed) runs this once a day at 03:00
   * server time — a low-traffic window — so retention limits are
   * actually enforced instead of only being metadata.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleScheduledPurge(): Promise<void> {
    try {
      await this.purgeExpiredRecords();
    } catch (error) {
      this.logger.error('Scheduled AI Memory Governance purge failed', error as Error);
    }
  }

  /**
   * Admin-visibility stats: how many ConversationMessage /
   * CharacterInteraction rows exist per purposeTag, and how many of
   * those are already past their retention window (i.e. awaiting the
   * next purge run). Backs GET /api/admin/memory-governance/stats.
   */
  async getStats(): Promise<MemoryGovernanceStats> {
    const [messageGroups, interactionGroups, expiredMessageGroups, expiredInteractionGroups] =
      await Promise.all([
        this.prisma.conversationMessage.groupBy({
          by: ['purposeTag'],
          _count: { _all: true },
        }),
        this.prisma.characterInteraction.groupBy({
          by: ['purposeTag'],
          _count: { _all: true },
        }),
        this.prisma.$queryRaw<{ purposeTag: string; count: bigint }[]>`
          SELECT "purposeTag", COUNT(*) as count FROM "conversation_messages"
          WHERE "createdForRetention" + ("retentionDays" || ' days')::interval < NOW()
          GROUP BY "purposeTag"
        `,
        this.prisma.$queryRaw<{ purposeTag: string; count: bigint }[]>`
          SELECT "purposeTag", COUNT(*) as count FROM "character_interactions"
          WHERE "createdForRetention" + ("retentionDays" || ' days')::interval < NOW()
          GROUP BY "purposeTag"
        `,
      ]);

    const expiredMessageMap = new Map<string, number>(
      expiredMessageGroups.map((row) => [row.purposeTag, Number(row.count)]),
    );
    const expiredInteractionMap = new Map<string, number>(
      expiredInteractionGroups.map((row) => [row.purposeTag, Number(row.count)]),
    );

    const conversationMessages: PurposeTagCount[] = messageGroups.map((group) => ({
      purposeTag: group.purposeTag,
      total: group._count._all,
      pastRetention: expiredMessageMap.get(group.purposeTag) ?? 0,
    }));

    const characterInteractions: PurposeTagCount[] = interactionGroups.map((group) => ({
      purposeTag: group.purposeTag,
      total: group._count._all,
      pastRetention: expiredInteractionMap.get(group.purposeTag) ?? 0,
    }));

    return {
      conversationMessages,
      characterInteractions,
      totals: {
        conversationMessages: conversationMessages.reduce((sum, row) => sum + row.total, 0),
        conversationMessagesPastRetention: conversationMessages.reduce(
          (sum, row) => sum + row.pastRetention,
          0,
        ),
        characterInteractions: characterInteractions.reduce((sum, row) => sum + row.total, 0),
        characterInteractionsPastRetention: characterInteractions.reduce(
          (sum, row) => sum + row.pastRetention,
          0,
        ),
      },
      generatedAt: new Date(),
    };
  }
}
