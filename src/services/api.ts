/**
 * API Client Service
 * Replaces mock data with real backend API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      errorData.message || 'API request failed',
      response.status,
      errorData,
    );
  }

  return response.json();
}

// ============================================
// CHARACTER API
// ============================================

export interface Character {
  id: string;
  name: string;
  slug: string;
  personality: string;
  systemPrompt: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface CharacterState {
  characterId: string;
  trustLevel: number;
  conversationCount: number;
  lastInteractionAt?: Date;
}

export interface ChatMessage {
  id: string;
  role: 'LEARNER' | 'CHARACTER' | 'SYSTEM';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  characterResponse: string;
  messageId: string;
  conversationId: string;
  context?: any;
}

export const characterAPI = {
  list: (language?: string) =>
    fetchAPI<Character[]>(`/characters${language ? `?language=${language}` : ''}`),

  get: (id: string, language?: string) =>
    fetchAPI<Character>(`/characters/${id}${language ? `?language=${language}` : ''}`),

  getState: (id: string) => fetchAPI<CharacterState>(`/characters/${id}/state`),

  chat: (id: string, message: string, context?: any) =>
    fetchAPI<ChatResponse>(`/characters/${id}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    }),

  createConversation: (
    id: string,
    type: string,
    initialMessage?: string,
  ) =>
    fetchAPI<{ id: string; messages: ChatMessage[] }>(
      `/characters/${id}/conversations`,
      {
        method: 'POST',
        body: JSON.stringify({ type, initialMessage }),
      },
    ),

  sendMessage: (conversationId: string, content: string) =>
    fetchAPI<ChatMessage>(`/characters/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
};

// ============================================
// ENGLISH LEARNING API
// ============================================

export interface EnglishStrand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  cefrLevel?: string;
  order: number;
  isActive: boolean;
}

export interface GrammarCorrection {
  originalText: string;
  correctedText: string;
  corrections: Array<{
    issue: string;
    suggestion: string;
    explanation: string;
  }>;
  feedback: string;
}

export interface VocabularyPractice {
  topic: string;
  words: Array<{
    word: string;
    definition: string;
    example: string;
    difficulty: string;
  }>;
  exercises: any[];
}

/**
 * NOTE: `learning/english.controller.ts` is a permanently-disabled empty
 * class (see docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md Part 5), so
 * `/api/english/*` routes below it never existed. The real, reachable
 * routes are on `ai/english-coach.controller.ts` (`/api/english-coach/*`).
 * This client talks to those instead. `listStrands`/`getStrand` have no
 * backend model at all yet (no EnglishStrand table) — left as best-effort
 * stubs that throw until that lands.
 */
export const englishAPI = {
  listStrands: (_cefrLevel?: string): Promise<EnglishStrand[]> =>
    Promise.reject(new Error('No backend EnglishStrand endpoint yet')),

  getStrand: (_slug: string): Promise<EnglishStrand> =>
    Promise.reject(new Error('No backend EnglishStrand endpoint yet')),

  startConversation: (topic?: string, cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2', userMessage = '') =>
    fetchAPI<{ response: string; cefrLevel: string; topic?: string; suggestedVocabulary: string[] }>(
      '/english-coach/conversation',
      {
        method: 'POST',
        body: JSON.stringify({ topic, difficulty: cefrLevel, userMessage }),
      },
    ),

  correctGrammar: (text: string, explainMistakes = true) =>
    fetchAPI<{ originalText: string; correctedText: string; feedback: string; mistakeCount: number }>(
      '/english-coach/grammar',
      {
        method: 'POST',
        body: JSON.stringify({ text, explainMistakes }),
      },
    ),

  getPronunciationFeedback: (word: string, transcript?: string) =>
    fetchAPI<{ word: string; feedback: string; pronunciationScore: number | null }>(
      '/english-coach/pronunciation',
      {
        method: 'POST',
        body: JSON.stringify({ word, transcript }),
      },
    ),

  generateVocabulary: (topic: string, wordCount?: number) =>
    fetchAPI<{ topic: string; cefrLevel: string; vocabulary: any[] }>(
      '/english-coach/vocabulary',
      {
        method: 'POST',
        body: JSON.stringify({ topic, wordCount }),
      },
    ),

  generateReading: (topic: string, length?: 'short' | 'medium' | 'long') =>
    fetchAPI<{ topic: string; cefrLevel: string; passage: string; wordCount: number; estimatedReadingTime: number }>(
      '/english-coach/reading',
      {
        method: 'POST',
        body: JSON.stringify({ topic, length }),
      },
    ),

  getCEFRLevel: () =>
    fetchAPI<{
      learnerId: string;
      ageBand: string;
      estimatedCEFRLevel: string;
      xp: number;
    }>('/english/learner/cefr-level'),
};

// ============================================
// CODING LEARNING API
// ============================================

export interface CodingConcept {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  difficulty: number;
  order: number;
  isActive: boolean;
}

export interface DebugAssistance {
  diagnosis: string;
  suggestedFix: string;
  explanation: string;
  learningPoints: string[];
}

export interface CodeReview {
  strengths: string[];
  improvements: string[];
  nextConcept?: string;
  overallFeedback: string;
}

/**
 * NOTE: `learning/coding.controller.ts` is a permanently-disabled empty
 * class (see docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md Part 5), so
 * `/api/coding/*` routes below never existed. The real, reachable routes
 * are on `ai/coding-coach.controller.ts` (`/api/coding-coach/*`). This
 * client talks to those. `listConcepts`/`getConcept`/`listCategories` have
 * no reachable backend route yet — left as best-effort stubs that throw
 * until that lands.
 */
export const codingAPI = {
  listConcepts: (_category?: string, _maxDifficulty?: number): Promise<CodingConcept[]> =>
    Promise.reject(new Error('No reachable backend coding-concepts endpoint yet')),

  getConcept: (_slug: string): Promise<CodingConcept> =>
    Promise.reject(new Error('No reachable backend coding-concepts endpoint yet')),

  listCategories: (): Promise<string[]> =>
    Promise.reject(new Error('No reachable backend coding-categories endpoint yet')),

  getDebugHelp: (
    code: string,
    language: 'scratch' | 'blockly' | 'python' | 'javascript' | 'html' | 'css',
    error?: string,
    expectedBehavior?: string,
  ) =>
    fetchAPI<{ diagnosis: string; suggestedFix: string; explanation: string; learningPoints: string[] }>(
      '/coding-coach/debug',
      {
        method: 'POST',
        body: JSON.stringify({ code, language, error, expectedBehavior }),
      },
    ),

  reviewCode: (code: string, language: string, objectiveId?: string) =>
    fetchAPI<{ code: string; feedback: string; strengths: string[]; improvements: string[]; nextConcept: string; codeQualityScore: number }>(
      '/coding-coach/review',
      {
        method: 'POST',
        body: JSON.stringify({ code, language, objectiveId }),
      },
    ),

  explainCode: (code: string, language: string, specificLine?: number) =>
    fetchAPI<{ code: string; explanation: string; keyConceptsintroduced: string[]; analogies: string[] }>(
      '/coding-coach/explain',
      {
        method: 'POST',
        body: JSON.stringify({ code, language, specificLine }),
      },
    ),

  generateChallenge: (conceptId: string, difficulty?: 'easy' | 'medium' | 'hard') =>
    fetchAPI<{ concept: string; difficulty: string; challenge: string; estimatedTime: number }>(
      '/coding-coach/challenge',
      {
        method: 'POST',
        body: JSON.stringify({ conceptId, difficulty: difficulty ?? 'medium' }),
      },
    ),

  getSocraticGuidance: (_code: string, _stuckPoint: string): Promise<{ questions: string[]; hints: string[] }> =>
    Promise.reject(new Error('No reachable backend socratic-guidance endpoint yet')),

  suggestNextProject: (): Promise<any> =>
    Promise.reject(new Error('No reachable backend next-project endpoint yet')),

  getProgress: (): Promise<{
    learnerId: string;
    ageBand: string;
    totalCodingSkills: number;
    masteredSkills: number;
    masteryByState: Record<string, number>;
    maxDifficulty: number;
    suggestedConcepts: CodingConcept[];
  }> => Promise.reject(new Error('No reachable backend coding-progress endpoint yet')),
};

// ============================================
// CODING SANDBOX API (Pyodide/Sandpack — zero backend execution)
// ============================================

export interface CodingSandboxMission {
  activityId: string;
  title: string;
  language: 'python' | 'javascript';
  runner: 'pyodide' | 'sandpack';
  prompt: string;
  starterCode: string;
  assertions: Array<{ id: string; description: string; type: string; expected: string }>;
}

export interface CodingSandboxSubmission {
  runId: string;
  activityId: string;
  code: string;
  language: 'python' | 'javascript';
  stdout: string;
  stderr?: string;
  result?: unknown;
  durationMs?: number;
  timedOut?: boolean;
}

export interface CodingSandboxResult {
  attempt: any;
  outcomes: Array<{ id: string; description: string; passed: boolean }>;
  passed: boolean;
  score: number;
  coachFeedback: string | null;
}

/**
 * Talks to backend/src/modules/coding-sandbox/*. That module NEVER
 * executes code — it serves mission specs and grades already-executed
 * client results (Pyodide in a Worker, or Sandpack in the browser).
 */
export const codingSandboxAPI = {
  getMission: (activityId: string) =>
    fetchAPI<CodingSandboxMission>(`/coding-sandbox/missions/${activityId}`),

  submitResult: (submission: CodingSandboxSubmission) =>
    fetchAPI<CodingSandboxResult>('/coding-sandbox/submissions', {
      method: 'POST',
      body: JSON.stringify(submission),
    }),
};

// ============================================
// TRANSLATION API
// ============================================

export interface Translation {
  entityType: string;
  entityId: string;
  field: string;
  language: string;
  value: string;
}

export const translationAPI = {
  get: (entityType: string, entityId: string, field: string, language: string) =>
    fetchAPI<Translation>(
      `/translations/${entityType}/${entityId}/${field}?language=${language}`,
    ),

  getAll: (entityType: string, entityId: string, language?: string) =>
    fetchAPI<Translation[]>(
      `/translations/${entityType}/${entityId}${language ? `?language=${language}` : ''}`,
    ),

  create: (
    entityType: string,
    entityId: string,
    field: string,
    language: string,
    value: string,
  ) =>
    fetchAPI<Translation>('/translations', {
      method: 'POST',
      body: JSON.stringify({ entityType, entityId, field, language, value }),
    }),
};

// ============================================
// AUTH API
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    learnerId?: string;
  };
}

export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    const response = await fetchAPI<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    localStorage.setItem('auth_token', response.accessToken);
    return response;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: () => fetchAPI<any>('/auth/me'),
};

// ============================================
// EXPORT
// ============================================

export const api = {
  characters: characterAPI,
  english: englishAPI,
  coding: codingAPI,
  codingSandbox: codingSandboxAPI,
  translations: translationAPI,
  auth: authAPI,
};

export default api;
