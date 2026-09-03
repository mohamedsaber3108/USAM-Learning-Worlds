/**
 * Safety Policy Service
 *
 * AI Prompt/Policy Engine (Safety slice). Backs the `SafetyPolicy`
 * table: a versioned, auditable, per-ageBand set of safety rule
 * thresholds (session-length limits, severity thresholds, pattern
 * lists) that moderation.service.ts and character-safety.service.ts
 * can reference by version instead of hardcoded constants scattered
 * across those files. See docs/architecture/
 * USAM_KIDS_ENGINE_GAP_MATRIX.md "AI Prompt/Policy Engine" row
 * (Safety & Parent Engine bundle).
 *
 * Design mirrors PromptTemplateService: every caller keeps its
 * existing inline DEFAULT_RULES object so a safety-critical code path
 * never hard-fails or silently opens up because the DB row is
 * missing/inactive/errors - it just falls back to the hardcoded
 * defaults. This is a real migration off inline constants (callers
 * call getActivePolicy()/getRule() instead of referencing the
 * constant directly), not a parallel unused table.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AgeBand, SafetyPolicy } from '@prisma/client';

export interface SafetyPolicyRules {
  maxHealthySessionMinutes?: number;
  maxHealthyMessagesPerSession?: number;
  severityBlockThreshold?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  severityEscalateThreshold?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  parentBypassPatterns?: string[];
  dependencyPhrases?: string[];
  [key: string]: unknown;
}

@Injectable()
export class SafetyPolicyService {
  private readonly logger = new Logger(SafetyPolicyService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Fetch the active policy row for an age band (highest
   * policyVersion among isActive=true rows), or null if none exists
   * yet - callers must treat null as "use my inline defaults", never
   * as "no restrictions apply".
   */
  async getActivePolicy(ageBand: AgeBand): Promise<SafetyPolicy | null> {
    try {
      return await this.prisma.safetyPolicy.findFirst({
        where: { ageBand, isActive: true },
        orderBy: { policyVersion: 'desc' },
      });
    } catch (error: any) {
      this.logger.warn(
        `SafetyPolicy lookup failed for ageBand="${ageBand}", callers should fall back to inline defaults: ${error?.message}`,
      );
      return null;
    }
  }

  /**
   * Convenience accessor: fetch a single rule value from the active
   * policy for an ageBand, falling back to `fallback` if there is no
   * active policy, the policy has no such key, or the lookup errors.
   */
  async getRule<T>(ageBand: AgeBand, ruleKey: string, fallback: T): Promise<T> {
    const policy = await this.getActivePolicy(ageBand);
    if (!policy) return fallback;
    const rules = policy.rules as SafetyPolicyRules;
    return (rules?.[ruleKey] as T) ?? fallback;
  }

  /**
   * Create a new policy version for an ageBand. Never mutates an
   * existing row in place - each call inserts the next policyVersion
   * so history is fully auditable (effectiveFrom + changelog per
   * version), and deactivates the previous active version for that
   * ageBand so getActivePolicy() resolves unambiguously.
   */
  async createPolicyVersion(
    ageBand: AgeBand,
    rules: SafetyPolicyRules,
    changelog: string,
    effectiveFrom?: Date,
  ): Promise<SafetyPolicy> {
    const current = await this.prisma.safetyPolicy.findFirst({
      where: { ageBand },
      orderBy: { policyVersion: 'desc' },
    });

    const nextVersion = (current?.policyVersion ?? 0) + 1;

    return this.prisma.$transaction(async (tx) => {
      if (current?.isActive) {
        await tx.safetyPolicy.update({
          where: { id: current.id },
          data: { isActive: false },
        });
      }

      return tx.safetyPolicy.create({
        data: {
          ageBand,
          policyVersion: nextVersion,
          rules: rules as any,
          changelog,
          isActive: true,
          effectiveFrom: effectiveFrom ?? new Date(),
        },
      });
    });
  }

  /**
   * List every policy version across all age bands, most recent
   * first - backs the admin read-only view.
   */
  async listPolicies(ageBand?: AgeBand): Promise<SafetyPolicy[]> {
    return this.prisma.safetyPolicy.findMany({
      where: ageBand ? { ageBand } : undefined,
      orderBy: [{ ageBand: 'asc' }, { policyVersion: 'desc' }],
    });
  }

  /**
   * Fetch one specific version for an ageBand - used for audit
   * drill-down (e.g. "what did v2 say before we changed it").
   */
  async getPolicyVersion(ageBand: AgeBand, policyVersion: number): Promise<SafetyPolicy | null> {
    return this.prisma.safetyPolicy.findUnique({
      where: { ageBand_policyVersion: { ageBand, policyVersion } },
    });
  }
}
