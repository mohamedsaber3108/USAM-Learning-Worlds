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

  // Retrieval-grounding v1 (lightweight, non-vector): real ContentItem/
  // Concept rows keyword/full-text matched against the learner's current
  // question, reusing the Postgres tsvector pattern from
  // modules/search/search.service.ts. Each item carries a `sourceTag`
  // the AI prompt explicitly instructs the model to cite when it draws
  // on that item, so a reply can be traced back to real curriculum data
  // instead of being pure context-stuffing. Empty/absent when no
  // question was supplied or nothing matched - never fabricated.
  retrievedContext?: RetrievedContextItem[];
}

/**
 * A single retrieval-grounding hit: a real Concept or ContentItem row
 * matched against the learner's question text, plus the exact citation
 * tag the AI is instructed to reference if it uses this item.
 */
export interface RetrievedContextItem {
  type: 'concept' | 'content_item';
  id: string;
  title: string;
  snippet: string;
  /** Stable citation the AI should quote back, e.g. "concept:<id>". */
  sourceTag: string;
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
