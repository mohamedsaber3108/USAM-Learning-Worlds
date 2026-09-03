import { apiClient } from './client'
import type { AuthResponse, LoginRequest } from '@/types'

// ==================== Auth ====================
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  me: () =>
    apiClient.get('/auth/me'),

  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
}

// ==================== Gamification ====================
export const gamificationApi = {
  getProgression: () =>
    apiClient.get('/gamification/progression'),

  getLeaderboard: (params?: { scope?: 'global' | 'friends'; limit?: number }) =>
    apiClient.get('/gamification/leaderboard', { params }),

  getAchievements: () =>
    apiClient.get('/gamification/achievements'),

  getStreak: () =>
    apiClient.get('/gamification/streak'),

  getRank: () =>
    apiClient.get('/gamification/rank'),
}

// ==================== Cosmetics (XP-spending shop) ====================
export const cosmeticsApi = {
  list: () =>
    apiClient.get('/gamification/cosmetics'),

  getEquipped: () =>
    apiClient.get('/gamification/cosmetics/equipped'),

  unlock: (id: string) =>
    apiClient.post(`/gamification/cosmetics/${id}/unlock`),

  equip: (id: string) =>
    apiClient.post(`/gamification/cosmetics/${id}/equip`),
}

// ==================== Daily Goal (real server-computed progress) ====================
export const dailyGoalsApi = {
  getGoal: () =>
    apiClient.get('/daily-goals/me'),

  setGoal: (data: { targetMinutes: number; targetActivities: number }) =>
    apiClient.put('/daily-goals/me', data),

  getProgress: () =>
    apiClient.get('/daily-goals/me/progress'),
}

// ==================== Streak Freeze (coin-spending shop) ====================
export const streakFreezeApi = {
  getStatus: () =>
    apiClient.get('/gamification/streak-freeze/status'),

  purchase: () =>
    apiClient.post('/gamification/streak-freeze/purchase'),
}

// ==================== Mastery ====================
export const masteryApi = {
  getOverview: () =>
    apiClient.get('/mastery/overview'),

  getByDomain: () =>
    apiClient.get('/mastery/by-domain'),

  getReviewDue: () =>
    apiClient.get('/mastery/review-due'),

  getGoals: () =>
    apiClient.get('/mastery/goals'),
}

// ==================== Missions ====================
export const missionsApi = {
  browse: (params?: {
    domainId?: number
    difficulty?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  }) =>
    apiClient.get('/missions', { params }),

  getById: (id: string) =>
    apiClient.get(`/missions/${id}`),

  start: (id: string) =>
    apiClient.post(`/missions/${id}/start`),

  getRun: (runId: string) =>
    apiClient.get(`/missions/runs/${runId}`),

  submitActivity: (runId: string, data: any) =>
    apiClient.post(`/missions/runs/${runId}/submit`, data),

  complete: (runId: string) =>
    apiClient.post(`/missions/runs/${runId}/complete`),

  getHistory: () =>
    apiClient.get('/missions/history/me'),
}

// ==================== Projects ====================
export const projectsApi = {
  create: (data: any) =>
    apiClient.post('/projects', data),

  getMy: () =>
    apiClient.get('/projects/my'),

  browse: (params?: { category?: string; featured?: boolean }) =>
    apiClient.get('/projects/browse', { params }),

  getById: (id: string) =>
    apiClient.get(`/projects/${id}`),

  update: (id: string, data: any) =>
    apiClient.put(`/projects/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/projects/${id}`),

  showcase: (id: string) =>
    apiClient.post(`/projects/${id}/showcase`),

  getRubric: (id: number | string) =>
    apiClient.get(`/projects/${id}/rubric`),

  getMilestones: (id: string) =>
    apiClient.get(`/projects/${id}/milestones`),

  updateMilestone: (id: string, milestoneId: string, status: string) =>
    apiClient.put(`/projects/${id}/milestones/${milestoneId}`, { status }),

  listResearchNotes: (id: string) =>
    apiClient.get(`/projects/${id}/research-notes`),

  addResearchNote: (id: string, data: { content: string; sourceTitle?: string; sourceUrl?: string }) =>
    apiClient.post(`/projects/${id}/research-notes`, data),

  listCollaborators: (id: string) =>
    apiClient.get(`/projects/${id}/collaborators`),

  // Real-World Challenge Engine: surfaces Project rows flagged
  // isRealWorldChallenge=true (externally-sourced project prompts a
  // learner can adopt and turn into their own real project), backed by
  // GET /projects/real-world-challenges/list (projects.controller.ts).
  listRealWorldChallenges: () =>
    apiClient.get('/projects/real-world-challenges/list'),
}

// ==================== Rubrics ====================
export const rubricsApi = {
  list: () =>
    apiClient.get('/rubrics'),
}

// ==================== Adaptive ====================
export const adaptiveApi = {
  getZPD: () =>
    apiClient.get('/adaptive/zpd'),

  getRecommendations: () =>
    apiClient.get('/adaptive/recommendations'),

  getNextActivity: (competencyId: number) =>
    apiClient.get(`/adaptive/next-activity/${competencyId}`),
}

// ==================== Community ====================
// Backed by backend/src/modules/community/community.controller.ts +
// community.service.ts. The feed only ever surfaces Project rows with
// visibility=PUBLIC and state=SHOWCASED — i.e. content that has already
// passed the showcase step. There is no separate "community post" entity;
// posting to the community means creating a Project and submitting it for
// showcase via projectsApi.create() + projectsApi.showcase(), which is the
// real moderation-adjacent pipeline available on this backend today.
export interface CommunityReportPayload {
  entityType: 'PROJECT' | 'COMMENT' | 'MESSAGE' | 'PROFILE'
  entityId: string
  reason: 'INAPPROPRIATE' | 'SPAM' | 'HARASSMENT' | 'COPYRIGHT' | 'SAFETY' | 'OTHER'
  description?: string
}

export const communityApi = {
  getFeed: (params?: { type?: string; limit?: number }) =>
    apiClient.get('/community/feed', { params }),

  getTrending: (params?: { limit?: number }) =>
    apiClient.get('/community/trending', { params }),

  search: (query: string, params?: { type?: string; limit?: number }) =>
    apiClient.get('/community/search', { params: { q: query, ...params } }),

  getStats: () =>
    apiClient.get('/community/stats'),

  // Reports flagged content into the real ModerationService/QuarantinedContent
  // pipeline (community.service.ts -> moderation.moderateWithQuarantine).
  report: (data: CommunityReportPayload) =>
    apiClient.post('/community/report', data),

  // Educator/parent-only moderation queue endpoints.
  getQuarantined: (status?: string) =>
    apiClient.get('/community/moderation/quarantined', { params: { status } }),

  reviewContent: (id: string, decision: 'APPROVED' | 'REJECTED', notes?: string) =>
    apiClient.post(`/community/moderation/review/${id}`, { decision, notes }),
}

// ==================== Parents ====================
// Backed by backend/src/modules/parents/parents.controller.ts + parents.service.ts.
// learnerId is a UUID string (Learner.id), not a numeric id.
export interface SetTimeLimitsPayload {
  dailyMinutes?: number
  weeklyMinutes?: number
  bedtimeHour?: number
}

export const parentsApi = {
  getChildren: () =>
    apiClient.get('/parents/children'),

  getFamilySummary: () =>
    apiClient.get('/parents/family-summary'),

  getChildDashboard: (learnerId: string) =>
    apiClient.get(`/parents/children/${learnerId}/dashboard`),

  getChildProgress: (learnerId: string) =>
    apiClient.get(`/parents/children/${learnerId}/progress`),

  getChildActivity: (learnerId: string, params?: { days?: number }) =>
    apiClient.get(`/parents/children/${learnerId}/activity`, { params }),

  setTimeLimits: (learnerId: string, data: SetTimeLimitsPayload) =>
    apiClient.post(`/parents/children/${learnerId}/time-limits`, data),
}

// ==================== Curriculum (Domains) ====================
export const curriculumApi = {
  getDomains: () =>
    apiClient.get('/domains'),
}

// ==================== Learning (Concepts, Prerequisites, Paths) ====================
export const learningApi = {
  // Concepts
  getConcepts: (params?: { competencyId?: string }) =>
    apiClient.get('/learning/concepts', { params }),

  getConcept: (id: string) =>
    apiClient.get(`/learning/concepts/${id}`),

  getConceptBySlug: (slug: string) =>
    apiClient.get(`/learning/concepts/slug/${slug}`),

  getPrerequisiteChain: (id: string) =>
    apiClient.get(`/learning/concepts/${id}/prerequisites`),

  getUnlockStatus: (id: string) =>
    apiClient.get(`/learning/concepts/${id}/unlock-status`),

  getConceptsForSkill: (skillId: string) =>
    apiClient.get(`/learning/skills/${skillId}/concepts`),

  getConceptsForDomain: (domainId: string) =>
    apiClient.get(`/learning/domains/${domainId}/concepts`),

  // Learning Paths
  getPaths: (params?: { domainId?: string; ageBand?: string }) =>
    apiClient.get('/learning/paths', { params }),

  getPath: (id: string) =>
    apiClient.get(`/learning/paths/${id}`),

  getPathProgress: (id: string) =>
    apiClient.get(`/learning/paths/${id}/progress`),

  advancePathProgress: (id: string, nodeId: string) =>
    apiClient.post(`/learning/paths/${id}/advance`, { nodeId }),

  resetPathProgress: (id: string) =>
    apiClient.post(`/learning/paths/${id}/reset`),

  recommendPath: (domainId?: string) =>
    apiClient.get('/learning/paths/recommend', { params: { domainId } }),

  getMyPaths: () =>
    apiClient.get('/learning/my-paths'),
}

// ==================== Learning Events (Analytics pipeline) ====================
// Real response shapes read from backend/src/modules/learning/services/
// learning-event.service.ts + learning.controller.ts — NOT guessed:
//   GET /learning/events/stats    -> EventStats[]   { eventType, count, lastOccurred }
//   GET /learning/events/recent   -> LearningEvent[] (Prisma rows: id, learnerId, type,
//                                     entityType, entityId, data, sessionId, createdAt)
//   GET /learning/events/patterns -> { period: { days, since }, activeDays, consistency,
//                                     avgActivitiesPerDay, peakLearningHour, hourlyDistribution }
export interface LearningEventStat {
  eventType: string
  count: number
  lastOccurred: string
}

export interface LearningEventRow {
  id: string
  learnerId: string
  type: string
  entityType: string | null
  entityId: string | null
  data: any
  sessionId: string | null
  createdAt: string
}

export interface LearningPatterns {
  period: { days: number; since: string }
  activeDays: number
  consistency: number
  avgActivitiesPerDay: number
  peakLearningHour: number
  hourlyDistribution: number[]
}

export const learningEventsApi = {
  getStats: (since?: string) =>
    apiClient.get<LearningEventStat[]>('/learning/events/stats', { params: { since } }),

  getRecent: (hours: number = 72) =>
    apiClient.get<LearningEventRow[]>('/learning/events/recent', { params: { hours } }),

  getPatterns: (days: number = 30) =>
    apiClient.get<LearningPatterns>('/learning/events/patterns', { params: { days } }),
}

// ==================== English (Strands + Coach) ====================
export type EnglishStrandFamily =
  | 'VOCABULARY'
  | 'GRAMMAR'
  | 'PRONUNCIATION'
  | 'LISTENING'
  | 'READING'
  | 'WRITING'
  | 'SPEAKING'
  | 'SHADOWING'
  | 'DICTATION'

export interface EnglishStrand {
  id: string
  name: string
  slug: string
  description: string | null
  cefrLevel: string | null
  strandType: EnglishStrandFamily | null
  order: number
  isActive: boolean
  createdAt: string
}

/**
 * Real content routes, backed by the `EnglishStrand` Prisma model
 * (`backend/src/modules/learning/english.controller.ts`, mounted at
 * `/api/english`). 45 seeded rows across the 9 strand families
 * (Vocabulary, Grammar, Pronunciation, Listening, Reading, Writing,
 * Speaking, Shadowing, Dictation), CEFR A1-B2. Family is a real
 * `strandType` enum column (migration
 * `20260903_add_english_strand_type_column.sql`), not client-side
 * name-string-parsing.
 */
export const englishApi = {
  listStrands: (params?: { cefrLevel?: string; strandType?: EnglishStrandFamily }) =>
    apiClient.get<EnglishStrand[]>('/english/strands', { params }),

  getStrand: (slug: string) =>
    apiClient.get<EnglishStrand>(`/english/strands/${slug}`),
}

/**
 * Real Bedrock-backed coaching routes
 * (`backend/src/modules/ai/english-coach.controller.ts`, mounted at
 * `/api/english-coach`). Requires a valid AWS Bedrock credential on the
 * backend; if Bedrock creds are invalid the backend still responds (500
 * with a JSON error body), it does not crash the process — the caller
 * should treat any non-2xx here as "coach unavailable" and show a
 * graceful message rather than a stack trace.
 */
export const englishCoachApi = {
  conversation: (data: { userMessage: string; topic?: string; difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' }) =>
    apiClient.post('/english-coach/conversation', data),

  grammar: (data: { text: string; explainMistakes?: boolean }) =>
    apiClient.post('/english-coach/grammar', data),

  pronunciation: (data: { word: string; transcript?: string }) =>
    apiClient.post('/english-coach/pronunciation', data),

  vocabulary: (data: { topic: string; wordCount?: number }) =>
    apiClient.post('/english-coach/vocabulary', data),

  reading: (data: { topic: string; length?: 'short' | 'medium' | 'long' }) =>
    apiClient.post('/english-coach/reading', data),
}

// ==================== Character Universe ====================
/**
 * Talks to `backend/src/modules/ai/character.controller.ts` (mounted at
 * `/api/characters`).
 *
 * Verified live against production on 2026-09-02:
 *   - GET /characters/:id            → 200, real Character row (confirmed
 *     with Azouz's real id, e.g. {"id":"...","name":"Azouz","role":"GUIDE",
 *     "personality":{...},"avatarUrl":"/characters/azouz.png"})
 *   - POST /characters/:id/chat      → routes correctly (auth + Prisma +
 *     controller all fire), but currently 500s downstream at the Bedrock
 *     call ("The security token included in the request is invalid").
 *     That is the pre-existing, documented AWS Bedrock credential blocker
 *     (same one english-coach hits) — not a bug in this client or in the
 *     chat route itself.
 *
 * `list()` (GET /characters) and `getUnlocked()` (GET /characters/unlocked)
 * are NOT live yet — the sibling backend-data agent is adding the full
 * 15-character seed + these two endpoints in parallel. Built here against
 * the expected response shape (an array of the same Character shape the
 * working `:id` endpoint already returns, with `getUnlocked()` additionally
 * carrying `isUnlocked` / `unlockHint` per item so the gallery can render
 * locked silhouettes). FOLLOW-UP: once that lands, sanity-check the actual
 * field names against this comment and adjust CharacterGalleryPage's mapping
 * if they differ.
 */
export interface CharacterSummary {
  id: string
  name: string
  nameAr?: string
  role: string
  personality?: {
    tone?: string
    style?: string
    traits?: string[]
  }
  description?: string
  avatarUrl?: string | null
  isActive?: boolean
  // Present on /characters/unlocked (expected shape, backend pending):
  isUnlocked?: boolean
  unlockHint?: string
}

export const charactersApi = {
  list: () => apiClient.get<CharacterSummary[]>('/characters'),

  getUnlocked: () => apiClient.get<CharacterSummary[]>('/characters/unlocked'),

  getById: (id: string) => apiClient.get<CharacterSummary>(`/characters/${id}`),

  /**
   * Per-learner relationship state for a character (GET /characters/:id/state).
   * Backed by CharacterService.getCharacterState — real relationshipLevel
   * (1-5, derived from interaction count) used to drive the companion's
   * visual evolution stage in CharacterFace (see engine gap matrix,
   * "Character Progression Engine" Conflict row — avatar/companion visual
   * leveling interpretation).
   */
  getState: (id: string) =>
    apiClient.get<{
      state: {
        characterId: string;
        characterName: string;
        characterRole: string;
        relationshipLevel: number;
        interactionCount: number;
        lastInteraction?: string;
      };
    }>(`/characters/${id}/state`),

  chat: (id: string, message: string, context?: Record<string, unknown>) =>
    apiClient.post<{ response: { message: string; mood?: string; suggestedActions?: string[] } }>(
      `/characters/${id}/chat`,
      { message, context },
    ),
}

// ==================== Flashcard Engine (spaced-repetition study cards) ====================
export interface Flashcard {
  id: string
  domainId: string
  front: string
  back: string
  isActive: boolean
}

export interface FlashcardStats {
  totalReviewed: number
  dueNow: number
  mastered: number
}

export const flashcardsApi = {
  listByDomain: (domainId: string) =>
    apiClient.get<Flashcard[]>(`/flashcards/domain/${domainId}`),

  getDueCards: (domainId?: string, limit?: number) =>
    apiClient.get<Flashcard[]>('/flashcards/due', {
      params: { domainId, limit },
    }),

  recordReview: (flashcardId: string, remembered: boolean) =>
    apiClient.post(`/flashcards/${flashcardId}/review`, { remembered }),

  getStats: () => apiClient.get<FlashcardStats>('/flashcards/stats'),
}

// ==================== Coding Sandbox (Pyodide/Sandpack — zero backend execution) ====================
export interface CodingSandboxMission {
  activityId: string
  title: string
  language: 'python' | 'javascript'
  runner: 'pyodide' | 'sandpack'
  prompt: string
  starterCode: string
  assertions: Array<{ id: string; description: string; type: string; expected: string }>
}

export interface CodingSandboxSubmission {
  runId: string | number
  activityId: string
  code: string
  language: 'python' | 'javascript'
  stdout: string
  stderr?: string
  result?: unknown
  durationMs?: number
  timedOut?: boolean
}

/**
 * Talks to backend/src/modules/coding-sandbox/*. That backend module
 * NEVER executes code — it serves mission specs and grades results that
 * were already executed client-side (Pyodide Worker or Sandpack).
 */
export const codingSandboxApi = {
  getMission: (activityId: string) =>
    apiClient.get<CodingSandboxMission>(`/coding-sandbox/missions/${activityId}`),

  submitResult: (submission: CodingSandboxSubmission) =>
    apiClient.post('/coding-sandbox/submissions', submission),
}

// ==================== Cross-Curricular Concepts ====================
// Real data backed by three Prisma models seeded with age-banded content
// (backend/prisma/seeds/seed-cross-curricular.ts):
//   - AILiteracyConcept        (18 rows, ai_literacy_concepts)
//   - EntrepreneurshipConcept  (15 rows, entrepreneurship_concepts)
//   - FinancialLiteracyConcept (19 rows, financial_literacy_concepts)
// Served by backend/src/modules/cross-curricular/cross-curricular.controller.ts,
// mounted at `/api/cross-curricular`.
export type CrossCurricularCategory = 'ai-literacy' | 'entrepreneurship' | 'financial-literacy' | 'digital-literacy' | 'career-exploration' | 'communication-skills' | 'coding-concepts'

export interface CrossCurricularConcept {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  /** Absent (undefined) on CodingConcept rows, which use `difficulty` instead. */
  ageAppropriate?: 'AGE_8_9' | 'AGE_10_11' | 'AGE_12_14'
  /** Only present on CodingConcept rows (1-5 scale). */
  difficulty?: number
  order: number
  isActive: boolean
  createdAt: string
}

export const crossCurricularApi = {
  list: (category: CrossCurricularCategory, params?: { ageBand?: string }) =>
    apiClient.get<CrossCurricularConcept[]>(`/cross-curricular/${category}`, { params }),

  getConcept: (category: CrossCurricularCategory, slug: string) =>
    apiClient.get<CrossCurricularConcept>(`/cross-curricular/${category}/${slug}`),
}

// ==================== Thinking Skills (Problem Solving / Computational /
// Critical Thinking) ====================
// Three real, independently-seeded models sharing an identical shape:
//   - ProblemSolvingConcept        (15 rows, problem_solving_concepts)
//   - ComputationalThinkingConcept (14 rows, computational_thinking_concepts)
//   - CriticalThinkingConcept      (15 rows, critical_thinking_concepts)
// Each served by its own thin controller (problem-solving.controller.ts,
// computational-thinking.controller.ts, critical-thinking.controller.ts),
// mounted at `/api/problem-solving`, `/api/computational-thinking`,
// `/api/critical-thinking` respectively. Found (2026-09-03) fully built and
// seeded on the backend with zero frontend surface — same bug class as the
// Cross-Curricular/Flashcards/Communication-Skills fixes.
export type ThinkingSkillEngine = 'problem-solving' | 'computational-thinking' | 'critical-thinking'

export interface ThinkingSkillConcept {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  ageAppropriate: 'AGE_8_9' | 'AGE_10_11' | 'AGE_12_14'
  order: number
  isActive: boolean
  createdAt: string
}

export const thinkingSkillsApi = {
  list: (engine: ThinkingSkillEngine, params?: { ageBand?: string; category?: string }) =>
    apiClient.get<ThinkingSkillConcept[]>(`/${engine}`, { params }),

  listCategories: (engine: ThinkingSkillEngine) =>
    apiClient.get<string[]>(`/${engine}/categories`),

  getConcept: (engine: ThinkingSkillEngine, slug: string) =>
    apiClient.get<ThinkingSkillConcept>(`/${engine}/${slug}`),
}

// ==================== Metacognition / Reflection ====================
// Real data backed by ReflectionPrompt + MissionReflection Prisma models
// (backend/prisma/seeds/seed-reflection-prompts.ts, 3 seeded prompts).
// Served by backend/src/modules/reflection/reflection.controller.ts,
// mounted at `/api/reflection`. Shown to learners right after a mission
// completes (see MissionCompletePage.tsx).
export interface ReflectionPrompt {
  id: string
  text: string
  kind: 'FEELING' | 'DIFFICULTY' | 'STRATEGY'
  isActive: boolean
  order: number
  createdAt: string
}

export interface MissionReflection {
  id: string
  learnerId: string
  missionRunId: string
  promptId: string
  rating: number
  note: string | null
  createdAt: string
}

export const reflectionApi = {
  getPrompts: () => apiClient.get<ReflectionPrompt[]>('/reflection/prompts'),

  submitResponse: (data: { missionRunId: string; promptId: string; rating: number; note?: string }) =>
    apiClient.post<MissionReflection>('/reflection/responses', data),

  getResponsesForRun: (missionRunId: string) =>
    apiClient.get<MissionReflection[]>('/reflection/responses/by-run', { params: { missionRunId } }),
}

// ==================== Admin: Missions CMS/Authoring (v1) ====================
// Thin wrapper around the admin-only /admin/missions endpoints (ADMIN role
// required server-side via RolesGuard). Mission-content-type only — see
// docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md CMS row for scope notes.
export interface AdminMissionInput {
  title: string
  description: string
  type: 'GUIDED' | 'EXPLORATION' | 'CHALLENGE' | 'PROJECT_BASED'
  estimatedMinutes?: number | undefined
  order?: number | undefined
  isActive?: boolean | undefined
  worldId?: string | undefined
}

export const adminMissionsApi = {
  list: () => apiClient.get('/admin/missions'),

  getById: (id: string) => apiClient.get(`/admin/missions/${id}`),

  create: (data: AdminMissionInput) => apiClient.post('/admin/missions', data),

  update: (id: string, data: Partial<AdminMissionInput>) =>
    apiClient.patch(`/admin/missions/${id}`, data),

  remove: (id: string) => apiClient.delete(`/admin/missions/${id}`),
}

// ==================== Story Engine (gap matrix cluster-8) ====================
// Small, real branching-story reader — StoryPage.choiceOptions carries the
// branching tree, walked client-side (satisfies "Story Branching Engine").
export interface StoryPage {
  id: string
  pageNumber: number
  text: string
  safetyReviewed?: boolean
  choiceOptions: { label: string; nextPageNumber: number | null }[] | null
}

export interface StorySummary {
  id: string
  title: string
  summary?: string
  ageBand: string
  domain?: { name: string; slug: string; icon?: string; color?: string } | null
  _count?: { pages: number }
}

export interface StoryDetail extends StorySummary {
  pages: StoryPage[]
}

export const storiesApi = {
  listStories: (params?: { ageBand?: string; domainSlug?: string }) =>
    apiClient.get<StorySummary[]>('/stories', { params }),

  getStory: (id: string) => apiClient.get<StoryDetail>(`/stories/${id}`),
}

// ==================== Notifications ====================
export interface NotificationRecord {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
  data?: Record<string, unknown> | null
}

export const notificationsApi = {
  list: (unreadOnly?: boolean) =>
    apiClient.get<NotificationRecord[]>('/notifications', { params: unreadOnly ? { unreadOnly: 'true' } : undefined }),

  unreadCount: () => apiClient.get<{ count: number }>('/notifications/unread-count'),

  markRead: (id: string) => apiClient.post(`/notifications/${id}/read`),

  markAllRead: () => apiClient.post('/notifications/read-all'),
}

// ==================== Search ====================
export interface SearchResultItem {
  type: 'mission' | 'activity' | 'concept'
  id: string
  title: string
  snippet: string
  rank: number
}

export const searchApi = {
  search: (q: string, limit?: number) =>
    apiClient.get<{ query: string; results: SearchResultItem[] }>('/search', { params: { q, limit } }),
}

// ==================== Worlds (World Engine) ====================
// Real data backed by the `World` Prisma model (one per major Domain),
// seeded via backend/prisma/seeds/seed-worlds.ts (7 worlds: Numeria,
// Verdantia, Circuit City, Prisma Isles, Wordhaven, Gearhollow, The Riddle
// Reach). Served by worlds.controller.ts, mounted at `/api/worlds`.
// Per-learner unlock status is computed server-side (domain-engagement +
// mission-completion signal), not derived client-side.
export interface WorldRecord {
  id: string
  name: string
  slug: string
  description?: string | null
  order: number
  isActive: boolean
  unlockCondition?: string | null
  domain: { id: string; name: string; slug: string }
  missionCount: number
  isUnlocked: boolean
}

export const worldsApi = {
  list: () => apiClient.get<WorldRecord[]>('/worlds'),
  getOne: (id: string) => apiClient.get('/worlds/' + id),
}

// ==================== Creativity Engine ====================
// Real data backed by CreativityPrompt/CreativitySubmission Prisma models
// (backend/src/modules/creativity/creativity.controller.ts, mounted at
// `/api/creativity`), seeded via backend/prisma/seeds/seed-creativity-prompts.ts
// (13 open-ended prompts spanning story/art/music/invention across Domains).
// A guided creative-project-prompt system distinct from generic
// Project/ProjectMilestone — a curated prompt library + opt-in public
// submission gallery, not open-ended free-form project tracking.
export interface CreativityPromptRecord {
  id: string
  title: string
  slug: string
  prompt: string
  ageBand: string
  order: number
  isActive: boolean
  domain?: { id: string; name: string; slug: string } | null
}

export interface CreativitySubmissionRecord {
  id: string
  promptId: string
  learnerId: string
  title?: string | null
  content: string
  visibility: 'PRIVATE' | 'PUBLIC'
  createdAt: string
  prompt?: { id: string; title: string; slug: string }
  learner?: { id: string; displayName: string; avatarUrl?: string | null }
}

export const creativityApi = {
  listPrompts: (params?: { ageBand?: string; domainId?: string }) =>
    apiClient.get<CreativityPromptRecord[]>('/creativity/prompts', { params }),

  getPrompt: (slug: string) => apiClient.get<CreativityPromptRecord>(`/creativity/prompts/${slug}`),

  submit: (dto: { promptId: string; title?: string; content: string; visibility?: 'PRIVATE' | 'PUBLIC' }) =>
    apiClient.post<CreativitySubmissionRecord>('/creativity/submissions', dto),

  mySubmissions: () => apiClient.get<CreativitySubmissionRecord[]>('/creativity/submissions/mine'),

  gallery: (promptId?: string) =>
    apiClient.get<CreativitySubmissionRecord[]>('/creativity/gallery', { params: promptId ? { promptId } : {} }),

  setVisibility: (id: string, visibility: 'PRIVATE' | 'PUBLIC') =>
    apiClient.post(`/creativity/submissions/${id}/visibility`, { visibility }),
}

// ==================== Feature Flags (admin) ====================
export interface FeatureFlagRecord {
  key: string
  description?: string | null
  isEnabledGlobally: boolean
}

export const featureFlagsApi = {
  list: () => apiClient.get<FeatureFlagRecord[]>('/feature-flags'),

  toggle: (key: string, isEnabledGlobally: boolean) =>
    apiClient.patch(`/feature-flags/${key}`, { isEnabledGlobally }),
}

// ==================== Experimentation Engine v1 ====================
// Backend: ExperimentationController/ExperimentationService
// (backend/src/modules/experimentation/), deterministic hash-based
// variant bucketing + persisted ExperimentAssignment rows. Merged with
// zero frontend consumer — same "backend built, frontend dead" bug class
// as the Audit/Feature-Flag engines. Staff (ADMIN/MODERATOR) list;
// ADMIN-only create + status changes. No outcome/results endpoint exists
// server-side yet (by design — see service header comment), so this page
// is a plain list + create + status-control surface only.
export interface ExperimentRecord {
  id: string
  key: string
  name: string
  description: string | null
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED'
  variants: (string | { name: string })[]
  createdAt: string
  updatedAt?: string
}

export const experimentsApi = {
  list: () => apiClient.get<ExperimentRecord[]>('/experiments'),

  create: (data: { key: string; name: string; description?: string; variants: string[] }) =>
    apiClient.post<ExperimentRecord>('/experiments', data),

  setStatus: (key: string, status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED') =>
    apiClient.patch<ExperimentRecord>(`/experiments/${key}/status`, { status }),
}

// ==================== Safety Policy Engine (read-only history viewer) ====================
// Backend: AdminSafetyPolicyController (backend/src/modules/ai/admin-safety-policy.controller.ts)
// over SafetyPolicyService, a versioned/auditable per-ageBand table that
// moderation.service.ts / character-safety.service.ts fall back from if a
// row is missing (never hard-fails safety-critical paths). ADMIN-only,
// read-only — no create/edit endpoint exists server-side (policy authoring
// is via seed scripts today). Had zero frontend consumer despite being a
// real audit-trail surface — same bug class as Audit Log/Experimentation.
export type AgeBandKey = 'AGE_8_9' | 'AGE_10_11' | 'AGE_12_14'

export interface SafetyPolicyRecord {
  id: string
  ageBand: AgeBandKey
  policyVersion: number
  isActive: boolean
  rules: Record<string, unknown>
  createdAt: string
}

export const safetyPolicyApi = {
  list: (ageBand?: AgeBandKey) =>
    apiClient.get<SafetyPolicyRecord[]>('/admin/safety-policies', {
      params: ageBand ? { ageBand } : undefined,
    }),

  getActive: (ageBand: AgeBandKey) =>
    apiClient.get<SafetyPolicyRecord | null>(`/admin/safety-policies/${ageBand}/active`),

  getVersion: (ageBand: AgeBandKey, version: number) =>
    apiClient.get<SafetyPolicyRecord>(`/admin/safety-policies/${ageBand}/versions/${version}`),
}

// ==================== Translations (localization QA) ====================
// Backend: TranslationController (backend/src/modules/learning/translation.controller.ts),
// real seeded rows across CHARACTER/DOMAIN/ACTIVITY/DIGITAL_LITERACY_CONCEPT/
// SYSTEM (112 rows live). Returns the full per-field TranslatedEntity map
// when `language` is omitted, or a single resolved value when passed.
export const translationsApi = {
  getEntity: (entityType: string, entityId: string, language?: string) =>
    apiClient.get(
      `/translations/${entityType}/${entityId}${language ? `?language=${language}` : ''}`,
    ),
}

// ==================== Question Engine (gap matrix: QuestionTemplate) ====================
// Curriculum-linked reusable question definitions (MCQ/FILL_BLANK/DRAG_DROP).
// Admin-only browse/generate UI — the "generate" endpoint composes a real
// missions Activity from a template so generated questions flow through the
// existing delivery/mastery pipeline, not a parallel system.
export interface QuestionTemplateRecord {
  id: string
  objectiveId: string
  type: 'MCQ' | 'FILL_BLANK' | 'DRAG_DROP' | string
  stem: string
  options: string[] | null
  correctAnswer: string
  distractors: string[]
  difficulty: string
  isActive: boolean
}

export const questionsApi = {
  listTemplates: (params?: { objectiveId?: string; type?: string }) => {
    const qs = new URLSearchParams()
    if (params?.objectiveId) qs.set('objectiveId', params.objectiveId)
    if (params?.type) qs.set('type', params.type)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return apiClient.get<QuestionTemplateRecord[]>(`/questions/templates${suffix}`)
  },

  getTemplate: (id: string) => apiClient.get<QuestionTemplateRecord>(`/questions/templates/${id}`),

  generateActivity: (data: {
    templateId: string
    distractorCount?: number
    missionId?: string
    order?: number
  }) => apiClient.post('/questions/generate', data),
}

// ==================== Analytics Engine (admin, gap matrix) ====================
// Backend: AnalyticsController/AnalyticsService (backend/src/modules/analytics),
// real aggregation over the `learning_events` table (no derived counters,
// no separate storage). Staff/ADMIN-only, matches AdminFeatureFlagsPage's
// established pattern for this class of admin-only read-only dashboards.
export interface AnalyticsEventTypeCount {
  type: string
  count: number
}
export interface AnalyticsDailyActivity {
  date: string
  activeLearners: number
  totalEvents: number
}
export interface AnalyticsOverview {
  rangeDays: number
  totalEvents: number
  activeLearners: number
  eventsByType: AnalyticsEventTypeCount[]
  dailyActivity: AnalyticsDailyActivity[]
}

export const analyticsApi = {
  getOverview: (days = 30) =>
    apiClient.get<AnalyticsOverview>('/admin/analytics/overview', { params: { days } }),
}

// Audit Engine — staff-only read side over AdminAuditLog. Real call sites:
// guardian time-limit changes, community moderation review, learner
// age-band changes. See backend/src/modules/audit/audit-log.service.ts.
export interface AuditLogEntry {
  id: string
  actorUserId: string
  actorRole: string
  action: string
  targetType: string
  targetId: string
  before: unknown
  after: unknown
  metadata: unknown
  createdAt: string
}

export const auditApi = {
  getLogs: (params?: { action?: string; targetType?: string; take?: number }) =>
    apiClient.get<AuditLogEntry[]>('/audit/logs', { params }),
}

// Intervention Engine — staff (ADMIN/MODERATOR) surface over
// InterventionRecommendation, created reactively by InterventionService
// when a real struggle pattern (3 consecutive wrong on same competency,
// or 5+ attempts with confidence still <0.3) is detected right after an
// activity submission. See backend/src/modules/interventions/.
export interface InterventionRecommendation {
  id: string
  learnerId: string
  competencyId: string
  triggerType: 'CONSECUTIVE_WRONG_SAME_COMPETENCY' | 'LOW_MASTERY_REPEATED_ATTEMPTS'
  triggerDetail: string
  recommendedAction: string
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
  createdAt: string
  acknowledgedAt: string | null
  resolvedAt: string | null
  learner?: { id: string; displayName?: string }
  competency?: { id: string; name?: string }
}

export const interventionsApi = {
  listOpen: (take?: number) =>
    apiClient.get<InterventionRecommendation[]>('/admin/interventions', {
      params: take ? { take } : undefined,
    }),
  acknowledge: (id: string) =>
    apiClient.patch<InterventionRecommendation>(`/admin/interventions/${id}/acknowledge`),
  resolve: (id: string) =>
    apiClient.patch<InterventionRecommendation>(`/admin/interventions/${id}/resolve`),
}

// Misconception Engine v1 — admin overview surface over MisconceptionPattern
// rows, created reactively by MisconceptionService.recordWrongAnswer() right
// after a wrong-answer evaluation. Shows the most frequent wrong-answer
// patterns platform-wide so a curriculum admin can see what learners
// actually get wrong. See backend/src/modules/misconceptions/.
export interface MisconceptionPattern {
  id: string
  questionTemplateId: string | null
  activityId: string | null
  wrongAnswerValue: string
  frequencyCount: number
  description: string | null
  isLabeled: boolean
  isConfirmedRecurring: boolean
  firstSeenAt: string
  lastSeenAt: string
  questionTemplate?: { id: string; stem?: string }
  activity?: { id: string; title?: string }
}

export const misconceptionsApi = {
  listTop: (take?: number) =>
    apiClient.get<MisconceptionPattern[]>('/admin/misconceptions', {
      params: take ? { take } : undefined,
    }),
}

// Assessment Quality Engine — admin surface over AssessmentQualityFlag,
// a rule-based scan (NO_CORRECT_ANSWER, CORRECT_ANSWER_NOT_IN_OPTIONS,
// TOO_FEW_OPTIONS, DUPLICATE_OPTIONS, ALL_OPTIONS_CORRECT) of SELECT/
// MATCH/SEQUENCE activities' question-item structure, triggerable on
// demand from this admin page (no cron yet). See
// backend/src/modules/assessment-quality/admin-assessment-quality.controller.ts.
export type AssessmentQualityFlagType =
  | 'NO_CORRECT_ANSWER'
  | 'CORRECT_ANSWER_NOT_IN_OPTIONS'
  | 'TOO_FEW_OPTIONS'
  | 'DUPLICATE_OPTIONS'
  | 'ALL_OPTIONS_CORRECT'

export interface AssessmentQualityFlag {
  id: string
  activityId: string
  flagType: AssessmentQualityFlagType
  detail: string
  detectedAt: string
  resolvedAt: string | null
}

export interface AssessmentQualityScanResult {
  scannedAt: string
  activitiesScanned: number
  flagsFound: number
  flagsCreated: number
  flagsAlreadyOpen: number
  flagsAutoResolved: number
  candidates: { activityId: string; flagType: AssessmentQualityFlagType; detail: string }[]
}

export const assessmentQualityApi = {
  listFlags: () => apiClient.get<AssessmentQualityFlag[]>('/admin/assessment-quality/flags'),
  scan: () => apiClient.post<AssessmentQualityScanResult>('/admin/assessment-quality/scan'),
}

// Content QA Engine — admin surface over ContentQAFlag, distinct from
// Assessment Quality (question-item structure) and Rubrics (human grading).
export type ContentQAFlagType =
  | 'MISSING_DESCRIPTION'
  | 'CONTENT_TOO_SHORT'
  | 'NO_AGE_BAND_SIGNAL'
  | 'ZERO_AGE_VARIANT_COVERAGE'

export interface ContentQAFlag {
  id: string
  entityType: 'ACTIVITY' | 'MISSION'
  entityId: string
  flagType: ContentQAFlagType
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  detail: string
  detectedAt: string
}

export interface ContentQAScanResult {
  scannedAt: string
  activitiesScanned: number
  missionsScanned: number
  flagsFound: number
  flagsCreated: number
  flagsAlreadyOpen: number
  candidates: { entityType: string; entityId: string; flagType: ContentQAFlagType; detail: string }[]
}

export const contentQaApi = {
  listFlags: () => apiClient.get<ContentQAFlag[]>('/admin/content-qa/flags'),
  scan: () => apiClient.post<ContentQAScanResult>('/admin/content-qa/scan'),
}

// AI Memory Governance — admin visibility over ConversationMessage /
// CharacterInteraction retention (volumes + past-retention backlog).
export interface PurposeTagCount {
  purposeTag: string
  total: number
  pastRetention: number
}

export interface MemoryGovernanceStats {
  conversationMessages: PurposeTagCount[]
  characterInteractions: PurposeTagCount[]
  totals: {
    conversationMessages: number
    conversationMessagesPastRetention: number
    characterInteractions: number
    characterInteractionsPastRetention: number
  }
  generatedAt: string
}

export const memoryGovernanceApi = {
  getStats: () => apiClient.get<MemoryGovernanceStats>('/admin/memory-governance/stats'),
}

// AI Evaluation Harness — admin read-only history over AIEvalRun/AIEvalResult,
// populated by backend/scripts/run-ai-eval.ts (run manually/via cron, not
// triggered from this UI). See backend/src/modules/ai/admin-ai-eval.controller.ts.
export interface AIEvalRunSummary {
  id: string
  startedAt: string
  finishedAt: string | null
  datasetVersion: string | null
  totalCases: number
  passedCases: number
  passRate: number
  averageScore: number | null
  status: string
  notes: string | null
  resultCount: number
}

export interface AIEvalResultDetail {
  id: string
  caseId: string
  passed: boolean
  score: number | null
  responseText: string | null
  errorMessage: string | null
  rubricBreakdown?: unknown
}

export interface AIEvalRunDetail extends Omit<AIEvalRunSummary, 'resultCount'> {
  results: AIEvalResultDetail[]
}

export const aiEvalApi = {
  listRuns: (limit?: number) =>
    apiClient.get<{ runs: AIEvalRunSummary[] }>('/admin/ai-eval/runs', {
      params: limit ? { limit } : undefined,
    }),
  getRun: (id: string) => apiClient.get<AIEvalRunDetail>(`/admin/ai-eval/runs/${id}`),
}

// Safety Escalation Queue — staff (MODERATOR/ADMIN) surface over
// SafetyEscalation, the persisted record created whenever
// CharacterSafetyService.evaluateSafety() resolves to
// 'escalation_required'. See backend/src/modules/ai/safety-escalation.controller.ts.
export type SafetyEscalationStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'

export interface SafetyEscalationEntry {
  id: string
  learnerId: string
  triggerReason: string
  safetyState: string
  status: SafetyEscalationStatus
  assignedTo: string | null
  resolvedAt: string | null
  createdAt: string
  learner?: {
    id: string
    displayName: string | null
    firstName: string | null
    ageBand: string
  }
}

export const safetyEscalationApi = {
  list: (status?: SafetyEscalationStatus) =>
    apiClient.get<SafetyEscalationEntry[]>('/safety-escalations', {
      params: status ? { status } : undefined,
    }),
  getOne: (id: string) => apiClient.get<SafetyEscalationEntry>(`/safety-escalations/${id}`),
  assign: (id: string, assignedTo?: string) =>
    apiClient.patch<SafetyEscalationEntry>(`/safety-escalations/${id}/assign`, {
      assignedTo,
    }),
  resolve: (id: string, resolvedBy?: string) =>
    apiClient.patch<SafetyEscalationEntry>(`/safety-escalations/${id}/resolve`, {
      resolvedBy,
    }),
}

