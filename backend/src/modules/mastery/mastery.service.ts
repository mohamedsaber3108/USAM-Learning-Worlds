import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../database/prisma.service';
import { MasteryConfidenceAlgorithm } from './mastery-confidence.algorithm';
import { EvidenceType, MasteryState } from '@prisma/client';

@Injectable()
export class MasteryService {
  constructor(
    private prisma: PrismaService,
    private algorithm: MasteryConfidenceAlgorithm,
    @InjectQueue('mastery') private masteryQueue: Queue,
  ) {}

  /**
   * Record new evidence and trigger mastery recalculation
   */
  async recordEvidence(
    learnerId: string,
    competencyId: string,
    type: EvidenceType,
    success: boolean,
    score?: number,
    context?: any,
    attemptId?: string,
  ) {
    // Get or create mastery record
    let mastery = await this.prisma.masteryRecord.findUnique({
      where: {
        learnerId_competencyId: {
          learnerId,
          competencyId,
        },
      },
    });

    if (!mastery) {
      mastery = await this.prisma.masteryRecord.create({
        data: {
          learnerId,
          competencyId,
          state: 'NOT_STARTED',
          confidence: 0,
          evidenceCount: 0,
        },
      });
    }

    // Create evidence record
    const evidence = await this.prisma.evidence.create({
      data: {
        learnerId,
        competencyId,
        masteryId: mastery.id,
        type,
        success,
        score,
        context,
        attemptId,
      },
    });

    // Queue mastery recalculation (async)
    await this.masteryQueue.add('recalculate', {
      masteryId: mastery.id,
      learnerId,
      competencyId,
    });

    return evidence;
  }

  /**
   * Recalculate mastery confidence (called by job processor)
   */
  async recalculateMastery(masteryId: string) {
    const mastery = await this.prisma.masteryRecord.findUnique({
      where: { id: masteryId },
      include: {
        evidence: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!mastery) {
      throw new Error('Mastery record not found');
    }

    // Calculate new confidence using algorithm
    const newConfidence = this.algorithm.calculate(mastery.evidence);
    const newState = this.algorithm.determineState(newConfidence) as MasteryState;

    // Calculate next review date
    const nextReview = this.algorithm.calculateNextReview(
      newConfidence,
      new Date(),
    );

    // Update mastery record
    await this.prisma.masteryRecord.update({
      where: { id: masteryId },
      data: {
        confidence: newConfidence,
        state: newState,
        evidenceCount: mastery.evidence.length,
        lastPracticed: new Date(),
        reviewDue: nextReview,
      },
    });

    return {
      confidence: newConfidence,
      state: newState,
      reviewDue: nextReview,
    };
  }

  /**
   * Get mastery overview for a learner
   */
  async getMasteryOverview(learnerId: string) {
    const records = await this.prisma.masteryRecord.findMany({
      where: { learnerId },
      include: {
        competency: {
          include: {
            skill: {
              include: {
                domain: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return records;
  }

  /**
   * Get mastery by domain (aggregated)
   */
  async getMasteryByDomain(learnerId: string) {
    const records = await this.getMasteryOverview(learnerId);

    // Group by domain
    const byDomain = records.reduce((acc, record) => {
      const domainName = record.competency.skill.domain.name;

      if (!acc[domainName]) {
        acc[domainName] = {
          domain: domainName,
          totalCompetencies: 0,
          masteredCount: 0,
          proficientCount: 0,
          avgConfidence: 0,
          totalConfidence: 0,
        };
      }

      acc[domainName].totalCompetencies++;
      acc[domainName].totalConfidence += record.confidence;

      if (record.state === 'MASTERED') {
        acc[domainName].masteredCount++;
      } else if (record.state === 'PROFICIENT') {
        acc[domainName].proficientCount++;
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    Object.values(byDomain).forEach((domain: any) => {
      domain.avgConfidence = domain.totalConfidence / domain.totalCompetencies;
      delete domain.totalConfidence;
    });

    return Object.values(byDomain);
  }

  /**
   * Get competencies due for review
   */
  async getReviewDue(learnerId: string) {
    const now = new Date();

    return this.prisma.masteryRecord.findMany({
      where: {
        learnerId,
        reviewDue: {
          lte: now,
        },
        state: {
          in: ['PROFICIENT', 'MASTERED'],
        },
      },
      include: {
        competency: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { reviewDue: 'asc' },
      take: 10,
    });
  }

  /**
   * Get learning goals (weak competencies)
   */
  async getLearningGoals(learnerId: string, limit: number = 5) {
    return this.prisma.masteryRecord.findMany({
      where: {
        learnerId,
        confidence: {
          lt: 0.7,
        },
        state: {
          not: 'NOT_STARTED',
        },
      },
      include: {
        competency: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: [
        { confidence: 'asc' },
        { lastPracticed: 'asc' },
      ],
      take: limit,
    });
  }
}
