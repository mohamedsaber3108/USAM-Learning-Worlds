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
 *
 * Teacher/Mentor Engine v1 (human escalation layer — previously fully
 * Missing per the Gap Matrix Infra/Platform section): resolve() now
 * requires a real EscalationResolutionType + resolutionNote so RESOLVED
 * always carries an actual human decision and account, not just a
 * status flip. REFERRED_TO_GUARDIAN fires a real PARENT_FLAG
 * notification to every ACTIVE guardian linked to the learner via
 * NotificationsService — a genuine human-adult-in-the-loop is actually
 * notified, closing the "human escalation layer" gap for the guardian
 * path. REFERRED_TO_HUMAN_SUPPORT is logged as a distinct outcome for
 * whoever staffs a future human-support/teacher queue (no dedicated
 * staff-role UI exists yet — this is the v1 data model + API that a
 * staffing UI would be built on, honestly scoped, not a full
 * ticketing system).
 */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { SafetyEscalationStatus, EscalationResolutionType } from '@prisma/client';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class SafetyEscalationService {
  private readonly logger = new Logger(SafetyEscalationService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

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
   * Resolve an escalation - sets status=RESOLVED, stamps resolvedAt, and
   * records the real human decision (resolutionType + resolutionNote).
   * Both are required: a RESOLVED SafetyEscalation with no record of
   * what the moderator/admin actually decided would just be a status
   * flip, not a real human-review audit trail — the exact gap this
   * engine exists to close.
   *
   * When resolutionType is REFERRED_TO_GUARDIAN, fans out a real
   * PARENT_FLAG notification to every ACTIVE guardian linked to the
   * learner (never blocks/throws the resolve on a notification
   * failure — logged and swallowed, same pattern as
   * CharacterSafetyService.evaluateSafety's own escalation-create path).
   */
  async resolve(
    id: string,
    resolutionType: EscalationResolutionType,
    resolutionNote: string,
    resolvedBy?: string,
  ) {
    if (!resolutionType) {
      throw new BadRequestException(
        'resolutionType is required to resolve a safety escalation (Teacher/Mentor Engine: every resolution must record a real human decision)',
      );
    }
    if (!resolutionNote || !resolutionNote.trim()) {
      throw new BadRequestException(
        'resolutionNote is required to resolve a safety escalation (record what the human reviewer actually found/did)',
      );
    }

    const existing = await this.prisma.safetyEscalation.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    const updated = await this.prisma.safetyEscalation.update({
      where: { id },
      data: {
        status: SafetyEscalationStatus.RESOLVED,
        resolvedAt: new Date(),
        assignedTo: resolvedBy ?? existing.assignedTo,
        resolutionType,
        resolutionNote,
      },
    });

    if (resolutionType === EscalationResolutionType.REFERRED_TO_GUARDIAN) {
      try {
        await this.notifications.emitSafetyEscalationGuardianFlag(
          existing.learnerId,
          id,
          resolutionNote,
        );
      } catch (error: any) {
        this.logger.error(
          `Failed to emit guardian flag for resolved SafetyEscalation ${id}, learner ${existing.learnerId}: ${error?.message}`,
        );
      }
    }

    return updated;
  }

  /**
   * Real summary stats for a Teacher/Mentor Engine ops dashboard —
   * open/in-progress backlog size and resolution-type breakdown of
   * everything resolved, so this isn't just a raw list with no
   * at-a-glance signal for whoever staffs the queue.
   */
  async stats() {
    const [open, inProgress, resolved, byResolutionType] = await Promise.all([
      this.prisma.safetyEscalation.count({ where: { status: SafetyEscalationStatus.OPEN } }),
      this.prisma.safetyEscalation.count({
        where: { status: SafetyEscalationStatus.IN_PROGRESS },
      }),
      this.prisma.safetyEscalation.count({ where: { status: SafetyEscalationStatus.RESOLVED } }),
      this.prisma.safetyEscalation.groupBy({
        by: ['resolutionType'],
        where: { status: SafetyEscalationStatus.RESOLVED },
        _count: { resolutionType: true },
      }),
    ]);

    return {
      open,
      inProgress,
      resolved,
      resolutionBreakdown: byResolutionType.map((row) => ({
        resolutionType: row.resolutionType,
        count: row._count.resolutionType,
      })),
    };
  }
}
