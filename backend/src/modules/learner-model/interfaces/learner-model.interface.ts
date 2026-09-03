/**
 * Learner Model Contract
 *
 * Stable, engine-agnostic shape describing a learner's current state.
 * Any engine (adaptive, recommendation, content-adaptation, frontend)
 * can consume this without depending on AI-specific context building.
 */

export interface MasterySnapshot {
  totalCompetencies: number;
  proficientCount: number;
  masteringCount: number;
  needsReviewCount: number;
  strengths: string[];
  struggles: string[];
}

export interface LearnerPreferences {
  interactionStyle?: 'visual' | 'verbal' | 'hands-on';
  pacePreference?: 'slower' | 'normal' | 'faster';
  challengeLevel?: 'gentle' | 'moderate' | 'high';
  language?: string;
}

export interface ZPDProfileSummary {
  optimalDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CHALLENGE';
  readyForChallenge: boolean;
  strugglingAreas: string[];
  strengthAreas: string[];
  recommendedFocus: string[];
}

export interface LearnerModel {
  learnerId: string;
  ageBand: 'AGE_8_9' | 'AGE_10_11' | 'AGE_12_14';
  masterySnapshot: MasterySnapshot;
  preferences: LearnerPreferences;
  zpdProfile: ZPDProfileSummary;
}
