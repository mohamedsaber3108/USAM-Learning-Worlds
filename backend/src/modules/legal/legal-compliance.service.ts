/**
 * Legal Compliance Service (audit T-P1-13)
 *
 * Implements the operational side of COPPA / GDPR-K obligations:
 *  1. CONSENT CAPTURE — versioned, purpose-specific, jurisdiction-aware
 *     parental-consent records (COPPA verifiable parental consent + GDPR
 *     lawful basis). Consent can be granted and revoked; the full history is
 *     retained so we can prove what was agreed to, when, and under which
 *     policy version.
 *  2. DATA EXPORT (GDPR Art. 15 / "right of access") — aggregates a copy of
 *     everything we hold about a learner into a single JSON document.
 *  3. DATA DELETION (GDPR Art. 17 / "right to erasure") — deletes the
 *     learner and everything that cascades from them, recording the request
 *     for audit.
 *
 * NOTE ON RETENTION: per-domain retention windows already exist on other
 * models (e.g. AI memory retentionDays); this service adds the *subject-
 * initiated* deletion right on top of those automated windows. See
 * docs/legal/JURISDICTION_MATRIX.md for the rule matrix.
 */
import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { ConsentPurpose } from '@prisma/client';

export interface CaptureConsentDto {
  guardianId: string;
  learnerId: string;
  purpose: ConsentPurpose;
  granted: boolean;
  policyVersion: string;
  jurisdiction?: string;
  verificationMethod?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class LegalComplianceService {
  private readonly logger = new Logger(LegalComplianceService.name);

  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  /** Ensure the guardian actually controls this learner before acting. */
  private async verifyGuardian(guardianId: string, learnerId: string) {
    const rel = await this.prisma.guardianship.findFirst({
      where: { guardianId, learnerId, status: 'ACTIVE' },
    });
    if (!rel) throw new ForbiddenException('No guardianship over this learner');
    return rel;
  }

  /**
   * Record a consent grant/revocation. Each call is an immutable new row
   * (append-only history); the latest row per (learner, purpose) is the
   * effective state. Revocations set granted=false + revokedAt.
   */
  async captureConsent(dto: CaptureConsentDto) {
    await this.verifyGuardian(dto.guardianId, dto.learnerId);

    const record = await this.prisma.consentRecord.create({
      data: {
        guardianId: dto.guardianId,
        learnerId: dto.learnerId,
        purpose: dto.purpose,
        granted: dto.granted,
        policyVersion: dto.policyVersion,
        jurisdiction: dto.jurisdiction ?? 'US',
        verificationMethod: dto.verificationMethod,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        revokedAt: dto.granted ? null : new Date(),
      },
    });

    await this.auditLog.record({
      actorUserId: dto.guardianId,
      actorRole: 'GUARDIAN',
      action: dto.granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
      targetType: 'Learner',
      targetId: dto.learnerId,
      after: { purpose: dto.purpose, policyVersion: dto.policyVersion },
    });

    return record;
  }

  /**
   * Effective consent state: the most recent record per purpose for a
   * learner. Purposes with no record are treated as NOT consented.
   */
  async getEffectiveConsent(guardianId: string, learnerId: string) {
    await this.verifyGuardian(guardianId, learnerId);

    const records = await this.prisma.consentRecord.findMany({
      where: { learnerId },
      orderBy: { grantedAt: 'desc' },
    });

    const latestByPurpose = new Map<string, (typeof records)[number]>();
    for (const r of records) {
      if (!latestByPurpose.has(r.purpose)) latestByPurpose.set(r.purpose, r);
    }

    return Object.values(ConsentPurpose).map((purpose) => {
      const latest = latestByPurpose.get(purpose);
      return {
        purpose,
        granted: latest?.granted ?? false,
        policyVersion: latest?.policyVersion ?? null,
        updatedAt: latest?.grantedAt ?? null,
      };
    });
  }

  /**
   * Produce a full data export (GDPR Art. 15) for a learner: a single JSON
   * object aggregating everything we store. Reads across the core tables the
   * learner participates in. Records the request for audit.
   */
  async exportLearnerData(guardianId: string, learnerId: string) {
    await this.verifyGuardian(guardianId, learnerId);

    const request = await this.prisma.dataSubjectRequest.create({
      data: {
        learnerId,
        requestedByGuardianId: guardianId,
        type: 'EXPORT',
        status: 'PROCESSING',
      },
    });

    try {
      const [
        learner,
        progression,
        masteryRecords,
        evidence,
        missionRuns,
        projects,
        conversations,
        credentials,
        consentRecords,
        flashcardReviews,
      ] = await Promise.all([
        this.prisma.learner.findUnique({ where: { id: learnerId } }),
        this.prisma.progression.findUnique({ where: { learnerId } }),
        this.prisma.masteryRecord.findMany({ where: { learnerId } }),
        this.prisma.evidence.findMany({ where: { learnerId } }),
        this.prisma.missionRun.findMany({ where: { learnerId } }),
        this.prisma.project.findMany({ where: { learnerId } }),
        this.prisma.conversation.findMany({ where: { learnerId } }),
        this.prisma.credential.findMany({ where: { learnerId } }),
        this.prisma.consentRecord.findMany({ where: { learnerId } }),
        this.prisma.flashcardReview.findMany({ where: { learnerId } }),
      ]);

      if (!learner) throw new NotFoundException('Learner not found');

      const exportDoc = {
        exportedAt: new Date().toISOString(),
        learner,
        progression,
        masteryRecords,
        evidence,
        missionRuns,
        projects,
        conversations,
        credentials,
        consentRecords,
        flashcardReviews,
      };

      await this.prisma.dataSubjectRequest.update({
        where: { id: request.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      await this.auditLog.record({
        actorUserId: guardianId,
        actorRole: 'GUARDIAN',
        action: 'DATA_EXPORT',
        targetType: 'Learner',
        targetId: learnerId,
      });

      return { requestId: request.id, data: exportDoc };
    } catch (err) {
      await this.prisma.dataSubjectRequest.update({
        where: { id: request.id },
        data: { status: 'FAILED', notes: (err as Error).message },
      });
      throw err;
    }
  }

  /**
   * Process a deletion request (GDPR Art. 17). Deletes the learner row;
   * every learner-owned table is defined with onDelete: Cascade in the Prisma
   * schema, so this removes their mastery, evidence, conversations, projects,
   * credentials, consent, etc. in one transaction. The request record itself
   * lives on the learner and would cascade too, so we snapshot the outcome to
   * the audit log FIRST, then delete.
   */
  async deleteLearnerData(guardianId: string, learnerId: string, reason?: string) {
    await this.verifyGuardian(guardianId, learnerId);

    const learner = await this.prisma.learner.findUnique({ where: { id: learnerId } });
    if (!learner) throw new NotFoundException('Learner not found');

    // Audit BEFORE deletion (the request row would cascade away with the
    // learner, so the durable record of this action is the audit log).
    await this.auditLog.record({
      actorUserId: guardianId,
      actorRole: 'GUARDIAN',
      action: 'DATA_DELETION',
      targetType: 'Learner',
      targetId: learnerId,
      before: { displayName: learner.displayName, userId: learner.userId },
      metadata: { reason: reason ?? null },
    });

    // Deleting the learner cascades to all learner-owned rows. We also delete
    // the backing User account so no orphaned auth identity remains.
    await this.prisma.$transaction([
      this.prisma.learner.delete({ where: { id: learnerId } }),
      this.prisma.user.delete({ where: { id: learner.userId } }),
    ]);

    this.logger.warn(`Erased all data for learner ${learnerId} (GDPR Art. 17)`);
    return { deleted: true, learnerId };
  }
}
