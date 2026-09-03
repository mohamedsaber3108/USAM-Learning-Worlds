import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MasteryState } from '@prisma/client';

export interface TransferOpportunity {
  sourceCompetencyId: string;
  sourceCompetencyName: string;
  sourceConfidence: number;
  dependentCompetencyId: string;
  dependentCompetencyName: string;
  primedConfidence: number;
}

/**
 * Transfer Engine v1.
 *
 * Confirmed genuinely Missing per docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md
 * ("Transfer Engine" row: "Zero trace — no cross-domain skill-transfer
 * detection or modeling ... found anywhere in backend/src").
 *
 * The gap matrix's own example is literally: "mastering fractions helps
 * with financial-literacy percentages." The real, already-existing
 * `CompetencyPrerequisite` model captures exactly this kind of
 * cross-competency dependency graph, but nothing in the codebase reads it
 * to actually act on transfer. This service is the missing read+act half.
 *
 * v1 algorithm (real, not a stub):
 *   1. Triggered from MasteryService.recalculateMastery() whenever a
 *      competency's mastery reaches PROFICIENT or MASTERED.
 *   2. Looks up every OTHER competency that lists the just-mastered one
 *      as a prerequisite (CompetencyPrerequisite.prerequisiteId).
 *   3. For each dependent competency the learner hasn't started
 *      practicing yet (no MasteryRecord, or one still at NOT_STARTED
 *      with zero evidence — never overwrites real earned progress),
 *      "primes" it: creates/updates a MasteryRecord with a small
 *      confidence head start (a fraction of the source competency's
 *      confidence) and bumps state from NOT_STARTED to INTRODUCED, so
 *      downstream ZPD/recommendation flows start the learner slightly
 *      ahead instead of from zero — a concrete, measurable transfer
 *      effect, not just a log line.
 *
 * Deliberately conservative: primed confidence is capped and only ever
 * applied to records with zero real evidence, so it can never inflate a
 * learner's confidence past what they've actually demonstrated.
 */
@Injectable()
export class TransferService {
  private readonly logger = new Logger(TransferService.name);

  static readonly TRIGGER_STATES: MasteryState[] = ['PROFICIENT', 'MASTERED'];
  static readonly TRANSFER_CONFIDENCE_FACTOR = 0.2;
  static readonly MAX_PRIMED_CONFIDENCE = 0.35;

  constructor(private prisma: PrismaService) {}

  /**
   * Best-effort, non-blocking hook called after mastery recalculation.
   * Never throws to the caller.
   */
  async propagateTransfer(learnerId: string, competencyId: string): Promise<void> {
    try {
      const mastery = await this.prisma.masteryRecord.findUnique({
        where: { learnerId_competencyId: { learnerId, competencyId } },
      });
      if (!mastery || !TransferService.TRIGGER_STATES.includes(mastery.state)) return;

      const dependentLinks = await this.prisma.competencyPrerequisite.findMany({
        where: { prerequisiteId: competencyId },
        include: { competency: true },
      });
      if (dependentLinks.length === 0) return;

      for (const link of dependentLinks) {
        await this.primeDependent(
          learnerId,
          link.competencyId,
          link.competency.name,
          mastery.confidence,
          competencyId,
        );
      }
    } catch (err) {
      this.logger.warn(
        `Transfer propagation failed learner=${learnerId} competency=${competencyId}: ${
          (err as Error).message
        }`,
      );
    }
  }

  private async primeDependent(
    learnerId: string,
    dependentCompetencyId: string,
    dependentCompetencyName: string,
    sourceConfidence: number,
    sourceCompetencyId: string,
  ) {
    const primedConfidence = Math.min(
      TransferService.MAX_PRIMED_CONFIDENCE,
      sourceConfidence * TransferService.TRANSFER_CONFIDENCE_FACTOR,
    );

    const existing = await this.prisma.masteryRecord.findUnique({
      where: { learnerId_competencyId: { learnerId, competencyId: dependentCompetencyId } },
    });

    if (!existing) {
      await this.prisma.masteryRecord.create({
        data: {
          learnerId,
          competencyId: dependentCompetencyId,
          state: 'INTRODUCED',
          confidence: primedConfidence,
          evidenceCount: 0,
        },
      });
      this.logger.log(
        `Transfer priming: learner=${learnerId} ${sourceCompetencyId}->${dependentCompetencyId} (${dependentCompetencyName}) confidence=${primedConfidence.toFixed(2)}`,
      );
      return;
    }

    // Only prime records with zero real evidence, so we never overwrite
    // a learner's genuinely earned confidence.
    if (
      existing.state === 'NOT_STARTED' &&
      existing.evidenceCount === 0 &&
      primedConfidence > existing.confidence
    ) {
      await this.prisma.masteryRecord.update({
        where: { id: existing.id },
        data: { confidence: primedConfidence, state: 'INTRODUCED' },
      });
      this.logger.log(
        `Transfer priming updated NOT_STARTED record: learner=${learnerId} competency=${dependentCompetencyId} confidence=${primedConfidence.toFixed(2)}`,
      );
    }
  }

  /**
   * Read-only view: for every competency the learner has mastered
   * (PROFICIENT/MASTERED), list dependent competencies that have NOT yet
   * received transfer priming (still NOT_STARTED with zero evidence) —
   * i.e. concrete, actionable transfer opportunities not yet applied.
   * Useful both as an admin/debug endpoint and for verifying the engine
   * has real data to act on for a given learner.
   */
  async listTransferOpportunities(learnerId: string): Promise<TransferOpportunity[]> {
    const masteredRecords = await this.prisma.masteryRecord.findMany({
      where: { learnerId, state: { in: TransferService.TRIGGER_STATES } },
      include: { competency: true },
    });
    if (masteredRecords.length === 0) return [];

    const opportunities: TransferOpportunity[] = [];

    for (const record of masteredRecords) {
      const dependentLinks = await this.prisma.competencyPrerequisite.findMany({
        where: { prerequisiteId: record.competencyId },
        include: { competency: true },
      });

      for (const link of dependentLinks) {
        const dependentRecord = await this.prisma.masteryRecord.findUnique({
          where: { learnerId_competencyId: { learnerId, competencyId: link.competencyId } },
        });

        const alreadyPrimedOrStarted =
          dependentRecord && (dependentRecord.state !== 'NOT_STARTED' || dependentRecord.evidenceCount > 0);
        if (alreadyPrimedOrStarted) continue;

        opportunities.push({
          sourceCompetencyId: record.competencyId,
          sourceCompetencyName: record.competency.name,
          sourceConfidence: record.confidence,
          dependentCompetencyId: link.competencyId,
          dependentCompetencyName: link.competency.name,
          primedConfidence: Math.min(
            TransferService.MAX_PRIMED_CONFIDENCE,
            record.confidence * TransferService.TRANSFER_CONFIDENCE_FACTOR,
          ),
        });
      }
    }

    return opportunities;
  }
}
