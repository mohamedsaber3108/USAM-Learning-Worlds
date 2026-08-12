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

async function fetchAPI<T>(
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

export const englishAPI = {
  listStrands: (cefrLevel?: string) =>
    fetchAPI<EnglishStrand[]>(
      `/english/strands${cefrLevel ? `?cefrLevel=${cefrLevel}` : ''}`,
    ),

  getStrand: (slug: string) =>
    fetchAPI<EnglishStrand>(`/english/strands/${slug}`),

  startConversation: (topic?: string, cefrLevel?: string) =>
    fetchAPI<{ response: string; conversationId: string }>(
      '/english/conversation',
      {
        method: 'POST',
        body: JSON.stringify({ topic, cefrLevel }),
      },
    ),

  correctGrammar: (text: string) =>
    fetchAPI<GrammarCorrection>('/english/grammar/correct', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  getPronunciationFeedback: (text: string, transcription: string) =>
    fetchAPI<any>('/english/pronunciation/feedback', {
      method: 'POST',
      body: JSON.stringify({ text, transcription }),
    }),

  generateVocabulary: (topic: string, wordCount?: number) =>
    fetchAPI<VocabularyPractice>('/english/vocabulary/practice', {
      method: 'POST',
      body: JSON.stringify({ topic, wordCount }),
    }),

  generateReading: (topic: string, length?: 'short' | 'medium' | 'long') =>
    fetchAPI<any>('/english/reading/passage', {
      method: 'POST',
      body: JSON.stringify({ topic, length }),
    }),

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

export const codingAPI = {
  listConcepts: (category?: string, maxDifficulty?: number) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (maxDifficulty) params.append('maxDifficulty', maxDifficulty.toString());
    return fetchAPI<CodingConcept[]>(
      `/coding/concepts${params.toString() ? `?${params.toString()}` : ''}`,
    );
  },

  getConcept: (slug: string) =>
    fetchAPI<CodingConcept>(`/coding/concepts/${slug}`),

  listCategories: () => fetchAPI<string[]>('/coding/categories'),

  getDebugHelp: (
    code: string,
    language: string,
    error?: string,
    expectedBehavior?: string,
  ) =>
    fetchAPI<DebugAssistance>('/coding/debug', {
      method: 'POST',
      body: JSON.stringify({ code, language, error, expectedBehavior }),
    }),

  reviewCode: (code: string, language: string, focusAreas?: string[]) =>
    fetchAPI<CodeReview>('/coding/review', {
      method: 'POST',
      body: JSON.stringify({ code, language, focusAreas }),
    }),

  explainCode: (code: string, language: string, specificPart?: string) =>
    fetchAPI<{ explanation: string; keyPoints: string[] }>('/coding/explain', {
      method: 'POST',
      body: JSON.stringify({ code, language, specificPart }),
    }),

  generateChallenge: (conceptSlug: string, difficulty?: number) =>
    fetchAPI<any>('/coding/challenge', {
      method: 'POST',
      body: JSON.stringify({ conceptSlug, difficulty }),
    }),

  getSocraticGuidance: (code: string, stuckPoint: string) =>
    fetchAPI<{ questions: string[]; hints: string[] }>('/coding/guidance', {
      method: 'POST',
      body: JSON.stringify({ code, stuckPoint }),
    }),

  suggestNextProject: () => fetchAPI<any>('/coding/next-project'),

  getProgress: () =>
    fetchAPI<{
      learnerId: string;
      ageBand: string;
      totalCodingSkills: number;
      masteredSkills: number;
      masteryByState: Record<string, number>;
      maxDifficulty: number;
      suggestedConcepts: CodingConcept[];
    }>('/coding/learner/progress'),
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
  translations: translationAPI,
  auth: authAPI,
};

export default api;
