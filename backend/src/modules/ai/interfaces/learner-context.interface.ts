/**
 * Learner Context Interface
 *
 * Structured context about the learner for AI personalization
 * Includes only what is pedagogically necessary (data minimization)
 */

export interface LearnerContext {
  // Identity (minimal)
  learnerId: string;
  age: number;
  ageBand: 'AGE_8_9' | 'AGE_10_11' | 'AGE_12_14';
  language: string;
  displayName?: string; // Only first name for personalization

  // Current Learning State
  currentDomain?: {
    id: string;
    name: string;
  };
  currentSkill?: {
    id: string;
    name: string;
  };
  currentMission?: {
    id: string;
    title: string;
    type: string;
  };
  currentActivity?: {
    id: string;
    type: string;
    difficulty: string;
  };
  currentProject?: {
    id: string;
    title: string;
  };

  // Mastery Summary (aggregated, not raw data)
  mastery: {
    totalCompetencies: number;
    proficientCount: number;
    masteringCount: number;
    needsReviewCount: number;
    strengths: string[]; // Top 3 skill names
    struggles: string[]; // Areas needing support
  };

  // Recent Performance (last 7 days)
  recentPerformance: {
    successRate: number;
    activitiesCompleted: number;
    hintsUsed: number;
    commonErrors: string[];
    lastPracticeDate: Date;
  };

  // Learning Preferences (if available)
  preferences?: {
    interactionStyle?: 'visual' | 'verbal' | 'hands-on';
    pacePreference?: 'slower' | 'normal' | 'faster';
    challengeLevel?: 'gentle' | 'moderate' | 'high';
  };

  // Current Session
  sessionId?: string;
  sessionStartedAt?: Date;
}

export interface CharacterContext {
  characterId: string;
  characterName: string;
  characterRole: string;
  mood?: string;
  conversationId?: string;
  relationshipLevel: number; // 1-5
  interactionCount: number;
  lastInteraction?: Date;
}
