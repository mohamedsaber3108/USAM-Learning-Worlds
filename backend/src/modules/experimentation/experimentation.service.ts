import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../database/prisma.service';

/**
 * Experimentation Engine v1 — deterministic hash-based variant bucketing
 * + a durable assignment record.
 *
 * Distinct from FeatureFlagService (../feature-flags/feature-flag.service.ts),
 * which only does global on/off + a per-learner allow-list. This service
 * adds real %-style variant bucketing across an arbitrary variant list,
 * and persists the assignment so it can be joined against later.
 *
 * OUTCOME MEASUREMENT IS DELIBERATELY NOT BUILT HERE. Per the platform
 * inventory's caveat ("A/B test learning outcomes, not just engagement"),
 * whether a variant actually moved a learning metric should be answered
 * by querying the existing `LearningEvent` table (learnerId, type,
 * entityType/entityId, createdAt) filtered/joined by the learnerIds in
 * an experiment's ExperimentAssignment rows — NOT by adding a parallel
 * events/metrics table to this module. That analysis query is future
 * work; this v1 only ships the assignment primitive.
 */
@Injectable()
export class ExperimentationService {
  private readonly logger = new Logger(ExperimentationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Deterministically maps (experimentKey, learnerId) to one of the
   * experiment's variants. Pure function of its inputs — no randomness,
   * no DB read required — so the same learner always lands on the same
   * variant for a given experiment even before any assignment row exists.
   */
  bucketVariant(experimentKey: string, learnerId: string, variants: string[]): string {
    if (!variants || variants.length === 0) {
      throw new Error(`Experiment "${experimentKey}" has no variants configured`);
    }

    const hash = createHash('sha256').update(`${experimentKey}:${learnerId}`).digest('hex');
    // Use the first 8 hex chars (32 bits) as a stable unsigned integer,
    // then modulo into the variant list — even distribution, deterministic.
    const bucket = parseInt(hash.slice(0, 8), 16);
    const index = bucket % variants.length;
    return variants[index];
  }

  private extractVariantNames(variantsJson: unknown): string[] {
    if (Array.isArray(variantsJson)) {
      return variantsJson.map((v) => (typeof v === 'string' ? v : (v as { name: string }).name));
    }
    throw new Error('Experiment.variants must be a JSON array of strings or {name} objects');
  }

  /**
   * Returns the learner's variant for an experiment, assigning (and
   * persisting) it on first call. Idempotent — repeat calls for the same
   * learner+experiment always return the same variant, either from the
   * existing row or recomputed identically via bucketVariant().
   */
  async getOrAssignVariant(experimentKey: string, learnerId: string): Promise<string> {
    const experiment = await this.prisma.experiment.findUnique({ where: { key: experimentKey } });

    if (!experiment) {
      throw new NotFoundException(`Experiment "${experimentKey}" not found`);
    }

    if (experiment.status !== 'RUNNING') {
      this.logger.warn(
        `Experiment "${experimentKey}" is ${experiment.status}, not RUNNING — assigning anyway (caller may gate on status separately)`,
      );
    }

    const existing = await this.prisma.experimentAssignment.findUnique({
      where: { learnerId_experimentId: { learnerId, experimentId: experiment.id } },
    });

    if (existing) {
      return existing.variant;
    }

    const variants = this.extractVariantNames(experiment.variants);
    const variant = this.bucketVariant(experiment.key, learnerId, variants);

    const created = await this.prisma.experimentAssignment.upsert({
      where: { learnerId_experimentId: { learnerId, experimentId: experiment.id } },
      create: { learnerId, experimentId: experiment.id, variant },
      update: {},
    });

    return created.variant;
  }

  async listExperiments() {
    return this.prisma.experiment.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createExperiment(data: { key: string; name: string; description?: string; variants: string[] }) {
    return this.prisma.experiment.create({
      data: {
        key: data.key,
        name: data.name,
        description: data.description,
        variants: data.variants,
      },
    });
  }

  async setStatus(key: string, status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED') {
    return this.prisma.experiment.update({ where: { key }, data: { status } });
  }
}
