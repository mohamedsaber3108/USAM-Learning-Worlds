import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Audit Engine — real, small AdminAuditLog writer.
 *
 * Deliberately NOT a global middleware/interceptor that logs every
 * request/response (that's the "generic everything-logger" the gap
 * matrix explicitly warns against building). Instead, this is a plain
 * service that the 2-3 sensitive service methods listed below call
 * directly, at the exact point the mutation happens, so `before`/`after`
 * reflect the real domain change rather than a raw HTTP body.
 *
 * Current real call sites (see gap matrix Audit Engine row):
 *   1. ParentsService.setTimeLimits() — guardian changes a child's
 *      daily/weekly/bedtime limits.
 *   2. CommunityService.reviewContent() — educator/parent approves or
 *      rejects quarantined moderation content.
 *   3. AuthService.updateLearnerAgeBand() — a learner's age band changes,
 *      which re-routes their entire content-adaptation tier.
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private prisma: PrismaService) {}

  async record(params: {
    actorUserId: string;
    actorRole: string;
    action: string;
    targetType: string;
    targetId: string;
    before?: unknown;
    after?: unknown;
    metadata?: unknown;
  }) {
    try {
      return await this.prisma.adminAuditLog.create({
        data: {
          actorUserId: params.actorUserId,
          actorRole: params.actorRole,
          action: params.action,
          targetType: params.targetType,
          targetId: params.targetId,
          before: params.before as any,
          after: params.after as any,
          metadata: params.metadata as any,
        },
      });
    } catch (error: any) {
      // Audit logging must never block the real mutation it's
      // observing — log-and-continue rather than throwing.
      this.logger.error(`Failed to write audit log for action=${params.action}: ${error?.message}`);
      return null;
    }
  }

  /**
   * List recent audit entries, optionally filtered by action or target
   * type — the minimal read-side needed to prove entries land and are
   * queryable (used by the /audit/logs endpoint for verification).
   */
  async list(filters: { action?: string; targetType?: string; take?: number } = {}) {
    return this.prisma.adminAuditLog.findMany({
      where: {
        ...(filters.action ? { action: filters.action } : {}),
        ...(filters.targetType ? { targetType: filters.targetType } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: filters.take ?? 50,
    });
  }
}
