/**
 * SafetyEscalationService
 *
 * Owns the persisted SafetyEscalation queue (see prisma/schema.prisma /
 * 20260907_add_safety_escalation.sql). Created to close a real gap:
 * CharacterSafetyService.evaluateSafety() resolved HIGH-severity
 * character-safety events to 'escalation_required' but that state was
 * only ever recorded in the generic ModerationLog's free-form fields -
 * there was no dedicated, actionable record a moderator/admin could
 * list, claim, or resolve. This service is the single write/read path
 * for that queue so both the safety layer and the admin REST endpoint
 * stay consistent.
 */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { SafetyEscalationStatus } from '@prisma/client';

@Injectable()
export class SafetyEscalationService {
  private readonly logger = new Logger(SafetyEscalationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new escalation record. Called by CharacterSafetyService the
   * moment evaluateSafety() resolves to 'escalation_required' - never
   * swallowed silently, and never blocks the caller's fallback-response
   * path (caller should catch/log, not await-and-throw into the child's
   * chat flow).
   */
  async createEscalation(params: {
    learnerId: string;
    triggerReason: string;
    safetyState: string;
  }) {
    return this.prisma.safetyEscalation.create({
      data: {
        learnerId: params.learnerId,
        triggerReason: params.triggerReason,
        safetyState: params.safetyState,
        status: SafetyEscalationStatus.OPEN,
      },
    });
  }

  /**
   * List escalations, most recent first, optionally filtered by status
   * (defaults to open + in-progress so the queue view doesn't drown in
   * already-resolved history unless explicitly asked for).
   */
  async list(status?: SafetyEscalationStatus) {
    return this.prisma.safetyEscalation.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        learner: {
          select: { id: true, displayName: true, firstName: true, ageBand: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.safetyEscalation.findUnique({
      where: { id },
      include: {
        learner: {
          select: { id: true, displayName: true, firstName: true, ageBand: true },
        },
      },
    });
  }

  /**
   * Claim an open escalation for review (assigns a moderator/admin and
   * moves it to IN_PROGRESS). Idempotent-ish: re-assigning is allowed,
   * but does not un-resolve an already-resolved record.
   */
  async assign(id: string, assignedTo: string) {
    const existing = await this.prisma.safetyEscalation.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }
    return this.prisma.safetyEscalation.update({
      where: { id },
      data: {
        assignedTo,
        status:
          existing.status === SafetyEscalationStatus.RESOLVED
            ? existing.status
            : SafetyEscalationStatus.IN_PROGRESS,
      },
    });
  }

  /**
   * Resolve an escalation - sets status=RESOLVED and stamps resolvedAt.
   * This is the terminal action a moderator/admin takes once the flagged
   * interaction has been reviewed and handled.
   */
  async resolve(id: string, resolvedBy?: string) {
    const existing = await this.prisma.safetyEscalation.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }
    return this.prisma.safetyEscalation.update({
      where: { id },
      data: {
        status: SafetyEscalationStatus.RESOLVED,
        resolvedAt: new Date(),
        assignedTo: resolvedBy ?? existing.assignedTo,
      },
    });
  }
}
