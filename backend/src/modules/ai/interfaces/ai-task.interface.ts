/**
 * AI Task Types and Interfaces
 *
 * Defines all AI task types and their input/output contracts
 */

export enum AITaskType {
  // Core Educational
  EXPLAIN = 'EXPLAIN',
  HINT = 'HINT',
  ASSESS = 'ASSESS',
  FEEDBACK = 'FEEDBACK',
  QUESTION = 'QUESTION',
  ENCOURAGE = 'ENCOURAGE',

  // Conversation & Character
  CONVERSE = 'CONVERSE',
  ROLEPLAY = 'ROLEPLAY',
  CHARACTER_RESPONSE = 'CHARACTER_RESPONSE',

  // Coding Support
  CODE_HELP = 'CODE_HELP',
  CODE_REVIEW = 'CODE_REVIEW',
  DEBUG = 'DEBUG',

  // English Learning
  ENGLISH_CONVERSATION = 'ENGLISH_CONVERSATION',
  ENGLISH_CORRECTION = 'ENGLISH_CORRECTION',
  ENGLISH_PRONUNCIATION = 'ENGLISH_PRONUNCIATION',

  // Project Support
  PROJECT_GUIDANCE = 'PROJECT_GUIDANCE',
  PROJECT_REVIEW = 'PROJECT_REVIEW',

  // Creative & Critical Thinking
  BRAINSTORM = 'BRAINSTORM',
  CREATIVE_COACHING = 'CREATIVE_COACHING',
  CRITICAL_THINKING = 'CRITICAL_THINKING',

  // Domain-Specific
  ENTREPRENEURSHIP_SIM = 'ENTREPRENEURSHIP_SIM',
  SCIENCE_INQUIRY = 'SCIENCE_INQUIRY',

  // System
  RECOMMEND = 'RECOMMEND',
  REFLECT = 'REFLECT',
  CONTENT_GENERATION = 'CONTENT_GENERATION',
  CONTENT_REVIEW = 'CONTENT_REVIEW',
}

export interface AITask {
  type: AITaskType;
  input: any;
  context?: AIContext;
  constraints?: AIConstraints;
}

export interface AIContext {
  learnerId?: string;
  age?: number;
  ageBand?: string;
  language?: string;
  domainId?: string;
  skillId?: string;
  objectiveId?: string;
  activityId?: string;
  missionId?: string;
  projectId?: string;

  // Learning State
  masterySnapshot?: any;
  recentPerformance?: any;
  commonErrors?: string[];

  // Character Context
  characterId?: string;
  characterMood?: string;
  conversationId?: string;

  // Session
  sessionId?: string;
  timestamp?: Date;
}

export interface AIConstraints {
  maxTokens?: number;
  temperature?: number;
  maxResponseLength?: number;
  requiredFormat?: 'TEXT' | 'JSON' | 'STRUCTURED';
  safetyLevel?: 'STRICT' | 'MODERATE' | 'RELAXED';
  costTier?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AIResponse {
  content: string | any;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cost?: number;
  };
  metadata?: {
    model?: string;
    provider?: string;
    latency?: number;
    confidence?: number;
  };
  safety?: {
    flagged: boolean;
    categories?: string[];
  };
}
