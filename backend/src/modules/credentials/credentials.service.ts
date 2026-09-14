/**
 * Credentials Service (audit T-P1-6)
 *
 * Turns real mastery evidence into verifiable, Open Badges 3.0 / W3C
 * Verifiable-Credential-shaped credentials. The chain is:
 *
 *   Evidence (activity attempts, conversations, creations, ...)
 *     -> MasteryRecord.confidence + evidenceCount  (MasteryService)
 *       -> when it crosses a competency's CredentialDefinition threshold
 *         -> Credential issued (this service)
 *
 * WHAT IS AND ISN'T HERE:
 *  - The credential JSON is a real, standards-shaped Open Badges 3.0
 *    AchievementCredential (a W3C VC with an OpenBadgeCredential type). It is
 *    fully populated from real data and can be exported/rendered as-is.
 *  - Cryptographic signing (a Data Integrity / JWS proof) is intentionally
 *    left as an optional hook: `proofJws` is null until a signing key is
 *    configured. The credential is valid and useful unsigned for in-product
 *    display and parent export; signing can be layered on without changing
 *    the stored shape. This is called out honestly rather than faking a
 *    signature.
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';

/** Base URL used to mint stable credential + issuer identifiers. */
const ISSUER_ID =
  process.env.CREDENTIAL_ISSUER_ID || 'https://usamlearning.com/issuer';
const ISSUER_NAME = process.env.CREDENTIAL_ISSUER_NAME || 'USAM Learning Worlds';
const CREDENTIAL_BASE_URL =
  process.env.CREDENTIAL_BASE_URL || 'https://usamlearning.com/credentials';

@Injectable()
export class CredentialsService {
  private readonly logger = new Logger(CredentialsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Called after a mastery recalculation. If the learner now meets the
   * competency's CredentialDefinition threshold and doesn't already hold the
   * credential, issue it. Idempotent + fail-soft: never throws into the
   * mastery pipeline, and a race that tries to issue twice is caught by the
   * unique (learnerId, definitionId) constraint.
   *
   * Returns the issued Credential, or null if nothing was issued.
   */
  async maybeIssueForMastery(
    learnerId: string,
    competencyId: string,
    confidence: number,
    evidenceCount: number,
  ) {
    try {
      const definition = await this.prisma.credentialDefinition.findUnique({
        where: { competencyId },
      });
      if (!definition || !definition.isActive) return null;

      if (
        confidence < definition.minConfidence ||
        evidenceCount < definition.minEvidence
      ) {
        return null;
      }

      const existing = await this.prisma.credential.findUnique({
        where: {
          learnerId_definitionId: { learnerId, definitionId: definition.id },
        },
      });
      if (existing) return null;

      return await this.issue(learnerId, definition.id, confidence, evidenceCount);
    } catch (err) {
      // Credential issuance must never break mastery recalculation.
      this.logger.error(
        `maybeIssueForMastery failed (learner=${learnerId}, competency=${competencyId}): ${(err as Error).message}`,
      );
      return null;
    }
  }

  /**
   * Issue a credential for a learner against a definition, building and
   * persisting the full Open Badges 3.0 document.
   */
  async issue(
    learnerId: string,
    definitionId: string,
    confidence: number,
    evidenceCount: number,
  ) {
    const [learner, definition] = await Promise.all([
      this.prisma.learner.findUnique({ where: { id: learnerId } }),
      this.prisma.credentialDefinition.findUnique({ where: { id: definitionId } }),
    ]);

    if (!learner) throw new NotFoundException('Learner not found');
    if (!definition) throw new NotFoundException('Credential definition not found');

    const credentialUid = randomUUID();
    const issuedAt = new Date();

    const assertionJson = this.buildOpenBadge({
      credentialUid,
      issuedAt,
      learnerDisplayName: learner.displayName,
      learnerId: learner.id,
      achievementId: definition.id,
      achievementName: definition.name,
      achievementDescription: definition.description,
      criteria: definition.criteria,
      imageUrl: definition.imageUrl,
    });

    try {
      return await this.prisma.credential.create({
        data: {
          learnerId,
          definitionId,
          confidence,
          evidenceCount,
          assertionJson: assertionJson as any,
          credentialUid,
          issuedAt,
        },
      });
    } catch (err: any) {
      // Unique constraint => another path already issued it; return existing.
      if (err?.code === 'P2002') {
        return this.prisma.credential.findUnique({
          where: {
            learnerId_definitionId: { learnerId, definitionId },
          },
        });
      }
      throw err;
    }
  }

  /**
   * Build an Open Badges 3.0 AchievementCredential (a W3C Verifiable
   * Credential). Shape follows the OB 3.0 context; `proof` is omitted until a
   * signing key is configured (see class doc).
   */
  private buildOpenBadge(params: {
    credentialUid: string;
    issuedAt: Date;
    learnerDisplayName: string;
    learnerId: string;
    achievementId: string;
    achievementName: string;
    achievementDescription: string;
    criteria: string;
    imageUrl?: string | null;
  }) {
    const credentialId = `${CREDENTIAL_BASE_URL}/${params.credentialUid}`;

    return {
      '@context': [
        'https://www.w3.org/ns/credentials/v2',
        'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json',
      ],
      id: credentialId,
      type: ['VerifiableCredential', 'OpenBadgeCredential'],
      name: params.achievementName,
      issuer: {
        id: ISSUER_ID,
        type: ['Profile'],
        name: ISSUER_NAME,
      },
      validFrom: params.issuedAt.toISOString(),
      credentialSubject: {
        // Subject is identified by an internal, non-PII id URN. We use the
        // learner's chosen displayName (already unique + not legal PII) for
        // the human-readable name only.
        id: `urn:usam:learner:${params.learnerId}`,
        type: ['AchievementSubject'],
        name: params.learnerDisplayName,
        achievement: {
          id: `${ISSUER_ID}/achievements/${params.achievementId}`,
          type: ['Achievement'],
          name: params.achievementName,
          description: params.achievementDescription,
          criteria: { narrative: params.criteria },
          ...(params.imageUrl
            ? { image: { id: params.imageUrl, type: 'Image' } }
            : {}),
        },
      },
    };
  }

  /** List a learner's (non-revoked) credentials, newest first. */
  async listForLearner(learnerId: string) {
    return this.prisma.credential.findMany({
      where: { learnerId, revokedAt: null },
      orderBy: { issuedAt: 'desc' },
      include: { definition: true },
    });
  }

  /** Public verification lookup by the stable credential UID. */
  async getByUid(credentialUid: string) {
    const credential = await this.prisma.credential.findUnique({
      where: { credentialUid },
      include: { definition: true },
    });
    if (!credential) throw new NotFoundException('Credential not found');
    return {
      credential: credential.assertionJson,
      revoked: credential.revokedAt != null,
      revokedReason: credential.revokedReason,
      issuedAt: credential.issuedAt,
    };
  }
}
