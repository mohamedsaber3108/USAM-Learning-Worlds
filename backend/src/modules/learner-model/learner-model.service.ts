/**
 * Learner Model Service
 *
 * Standalone Learner Model Engine. Assembles the learner's current
 * state (age band, mastery snapshot, preferences, ZPD profile) into a
 * stable contract that other engines (adaptive, recommendation,
 * content-adaptation) and the frontend can consume directly via
 * GET /learner-model/:id, independently of the AI module.
 *
 * This is the "general learner-state API" gap identified in the engine
 * gap matrix (row 1, Learner Model Engine) — previously this logic only
 * existed inside ai/learner-context.service.ts as an AI-prompt builder.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ZPDCalculatorService } from '../adaptive/zpd-calculator.service';
import {
  LearnerModel,
  MasterySnapshot,
  LearnerPreferences,
} from './interfaces/learner-model.interface';

@Injectable()
export class LearnerModelService {
  constructor(
    private prisma: PrismaService,
    private zpdCalculator: ZPDCalculatorService,
  ) {}

  /**
   * Build the stable learner model contract for a given learner.
   */
  async getLearnerModel(learnerId: string): Promise<LearnerModel> {
    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
    });

    if (!learner) {
      throw new NotFoundException(`Learner ${learnerId} not found`);
    }

    const [masteryRecords, zpd] = await Promise.all([
      this.prisma.masteryRecord.findMany({
        where: { learnerId },
        include: {
          competency: true,
        },
      }),
      this.zpdCalculator.calculateZPD(learnerId),
    ]);

    const masterySnapshot = this.buildMasterySnapshot(masteryRecords);
    const preferences = this.buildPreferences(learner.preferences as any);

    return {
      learnerId,
      ageBand: (learner.ageBand as LearnerModel['ageBand']) || 'AGE_10_11',
      masterySnapshot,
      preferences,
      zpdProfile: {
        optimalDifficulty: zpd.optimalDifficulty,
        readyForChallenge: zpd.readyForChallenge,
        strugglingAreas: zpd.strugglingAreas,
        strengthAreas: zpd.strengthAreas,
        recommendedFocus: zpd.recommendedFocus,
      },
    };
  }

  private buildMasterySnapshot(masteryRecords: any[]): MasterySnapshot {
    const proficientCount = masteryRecords.filter((m) => m.confidence >= 0.75).length;
    const masteringCount = masteryRecords.filter(
      (m) => m.confidence >= 0.5 && m.confidence < 0.75,
    ).length;
    const needsReviewCount = masteryRecords.filter(
      (m) => m.reviewDue && m.reviewDue <= new Date(),
    ).length;

    const strengths = masteryRecords
      .filter((m) => m.confidence >= 0.75)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .map((m) => m.competency.name);

    const struggles = masteryRecords
      .filter((m) => m.confidence < 0.5 && m.evidenceCount > 2)
      .sort((a, b) => a.confidence - b.confidence)
      .slice(0, 3)
      .map((m) => m.competency.name);

    return {
      totalCompetencies: masteryRecords.length,
      proficientCount,
      masteringCount,
      needsReviewCount,
      strengths,
      struggles,
    };
  }

  private buildPreferences(prefs: any): LearnerPreferences {
    if (!prefs) {
      return {};
    }

    return {
      interactionStyle: prefs.interactionStyle,
      pacePreference: prefs.pacePreference,
      challengeLevel: prefs.challengeLevel,
      language: prefs.language || 'en',
    };
  }
}
