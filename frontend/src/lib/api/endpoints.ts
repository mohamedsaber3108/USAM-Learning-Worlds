import { apiClient } from './client'
import type { AuthResponse, CurrentUser, LoginRequest, RegisterRequest, AgeBand } from './types'

/**
 * Typed endpoint groups. Each maps 1:1 to a real backend route (see
 * docs/frontend/BACKEND_FRONTEND_TRACEABILITY_MATRIX.md). Feature code calls
 * these — never raw axios — so contracts live in one place. Groups are added
 * as surfaces are built; the foundation ships auth (needed by every screen).
 */

export const authApi = {
  login: (data: LoginRequest) => apiClient.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => apiClient.post<AuthResponse>('/auth/register', data),
  me: () => apiClient.get<CurrentUser>('/auth/me'),
  refresh: (refreshToken: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }),
  updateAgeBand: (ageBand: AgeBand) => apiClient.patch<CurrentUser>('/auth/me/age-band', { ageBand }),
  updatePreferences: (data: {
    interests?: string[]
    learningStyle?: string
    goals?: string[]
    extra?: Record<string, unknown>
  }) => apiClient.patch<CurrentUser>('/auth/me/preferences', data),
}

/** Public plan catalog (no auth). */
export const entitlementsApi = {
  listPlans: () => apiClient.get('/entitlements/plans'),
  getMine: () =>
    apiClient.get<{ plan: { code: string; name: string } | null; features: Record<string, unknown> }>(
      '/entitlements/me',
    ),
}

// ==================== Learning ====================
export const learningApi = {
  getDomainPath: (slug: string) => apiClient.get(`/learning/domains/${slug}/path`),
}

export interface WorldMission {
  id: string
  title: string
  description?: string | null
  order: number
  status: 'COMPLETED' | 'IN_PROGRESS' | 'AVAILABLE' | 'LOCKED'
  locked: boolean
}
export interface WorldDetail {
  id: string
  name: string
  slug: string
  description?: string | null
  domain: { id: string; name: string; slug: string }
  isUnlocked: boolean
  missions: WorldMission[]
}
export const worldsApi = {
  list: () => apiClient.get('/worlds'),
  /**
   * World Detail — real GET /worlds/:id (worlds.service.ts getWorld). Had
   * zero frontend wrapper/caller before this pass despite the backend
   * computing real per-learner sequential mission-unlock status
   * (COMPLETED/IN_PROGRESS/AVAILABLE/LOCKED) — the app previously only
   * showed the flat world list, skipping straight to a mission by id and
   * never surfacing a world's own missions-in-order view. Named explicitly
   * as a required surface ("World Details").
   */
  getById: (id: string) => apiClient.get<WorldDetail>(`/worlds/${id}`),
}

// ==================== Missions ====================
export interface MissionHistoryRun {
  id: string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
  startedAt: string
  completedAt?: string | null
  mission: { id: string; title: string }
}
export const missionsApi = {
  getById: (id: string) => apiClient.get(`/missions/${id}`),
  start: (id: string) => apiClient.post(`/missions/${id}/start`),
  getRun: (runId: string) => apiClient.get(`/missions/runs/${runId}`),
  /** body: { activityId, response: {...} } */
  submit: (runId: string, body: { activityId: string; response: Record<string, unknown> }) =>
    apiClient.post(`/missions/runs/${runId}/submit`, body),
  // FIX (reverse-engineering/experience directive, 2026-10-07, §15: mission
  // completion should show "evidence created, mastery impact, XP/reward,
  // what to do next"): POST /missions/runs/:runId/complete already returns
  // a real computed outcome (missions.service.ts completeMission) —
  // finalScore, pass/fail, required-vs-attempted counts, and the real XP
  // award (amount/leveledUp/newLevel from progression.service.ts awardXP)
  // — but the wrapper was untyped and MissionPlayerPage discarded the
  // response entirely. Typed here so it can actually be shown.
  complete: (runId: string) =>
    apiClient.post<{
      success: boolean
      message: string
      outcome: {
        finalScore: number
        passed: boolean
        requiredActivities: number
        activitiesAttempted: number
        xp:
          | { awarded: false; alreadyAwarded?: boolean; error?: boolean }
          | { awarded: true; amount: number; leveledUp: boolean; newLevel: number }
      }
    }>(`/missions/runs/${runId}/complete`),
  getHistory: () => apiClient.get<MissionHistoryRun[]>('/missions/history/me'),
}

// ==================== Coding sandbox (client-exec, server-revalidate) ========
export const codingSandboxApi = {
  getMission: (activityId: string) => apiClient.get(`/coding-sandbox/missions/${activityId}`),
  submit: (body: {
    runId: string
    activityId: string
    code: string
    language: string
    stdout: string
    stderr?: string
    testOutcomes?: Array<{ id: string; description?: string; hidden?: boolean; passed: boolean; actual?: string }>
  }) => apiClient.post('/coding-sandbox/submissions', body),
}

// ==================== Mastery / review ====================
export const masteryApi = {
  getOverview: () => apiClient.get('/mastery/overview'),
  getByDomain: () => apiClient.get('/mastery/by-domain'),
  getReviewDue: () => apiClient.get('/mastery/review-due'),
  getGoals: () => apiClient.get('/mastery/goals'),
}

export interface Flashcard {
  id: string
  domainId: string
  front: string
  back: string
}
export const flashcardsApi = {
  getDue: (params?: { domainId?: string; limit?: number }) =>
    apiClient.get<Flashcard[]>('/flashcards/due', { params }),
  review: (id: string, remembered: boolean) => apiClient.post(`/flashcards/${id}/review`, { remembered }),
  getStats: () =>
    apiClient.get<{ totalReviewed: number; dueNow: number; mastered: number }>('/flashcards/stats'),
}

// ==================== Adaptive ====================
export const adaptiveApi = {
  getRecommendations: () => apiClient.get('/adaptive/recommendations'),
}

// ==================== Gamification ====================
export const gamificationApi = {
  getProgression: () => apiClient.get('/gamification/progression'),
  getStreak: () => apiClient.get('/gamification/streak'),
}

export interface DailyGoalProgress {
  goal: { targetMinutes: number; targetActivities: number }
  progress: { minutesSpent: number; activitiesCompleted: number }
  percentComplete: { minutes: number; activities: number }
  goalMet: boolean
}
export const dailyGoalsApi = {
  getProgress: () => apiClient.get<DailyGoalProgress>('/daily-goals/me/progress'),
  setGoal: (body: { targetMinutes: number; targetActivities: number }) => apiClient.put('/daily-goals/me', body),
}

// ==================== Projects ====================
export const projectsApi = {
  create: (body: {
    title: string
    description: string
    type: string
    visibility: string
    tags?: string[]
    competencyId?: string
    objectiveId?: string
    domainIds?: string[]
  }) => apiClient.post('/projects', body),
  mine: () => apiClient.get('/projects/my'),
  browse: (params?: { type?: string; tags?: string; limit?: number }) =>
    apiClient.get('/projects/browse', { params }),
  getById: (id: string) => apiClient.get(`/projects/${id}`),
  update: (id: string, body: Record<string, unknown>) => apiClient.put(`/projects/${id}`, body),
  remove: (id: string) => apiClient.delete(`/projects/${id}`),
  showcase: (id: string) => apiClient.post(`/projects/${id}/showcase`),
  portfolio: (learnerId: string) => apiClient.get(`/projects/portfolio/${learnerId}`),
  /** Project→Domain/Skill/Competency/Objective chain. Separate endpoint —
   * NOT embedded in GET /projects/:id's response. */
  getCurriculumContext: (id: string) => apiClient.get(`/projects/${id}/curriculum-context`),
  /** Project milestones. Separate endpoint — NOT embedded in GET /projects/:id. */
  getMilestones: (id: string) => apiClient.get(`/projects/${id}/milestones`),
  updateMilestoneStatus: (id: string, milestoneId: string, status: string) =>
    apiClient.put(`/projects/${id}/milestones/${milestoneId}`, { status }),
  getRubric: (id: string) => apiClient.get(`/projects/${id}/rubric`),
  listCollaborators: (id: string) => apiClient.get(`/projects/${id}/collaborators`),
  addCollaborator: (id: string, learnerId: string, role?: 'EDITOR' | 'COMMENTER') =>
    apiClient.post(`/projects/${id}/collaborators`, { learnerId, role }),
  removeCollaborator: (id: string, learnerId: string) =>
    apiClient.delete(`/projects/${id}/collaborators/${learnerId}`),
  listResearchNotes: (id: string) => apiClient.get(`/projects/${id}/research-notes`),
  addResearchNote: (id: string, body: { content: string; sourceTitle?: string; sourceUrl?: string }) =>
    apiClient.post(`/projects/${id}/research-notes`, body),
  removeResearchNote: (noteId: string) => apiClient.delete(`/projects/research-notes/${noteId}`),
  realWorldChallenges: () => apiClient.get('/projects/real-world-challenges/list'),
  crossDomain: (limit?: number) => apiClient.get('/projects/cross-domain/list', { params: { limit } }),
}

export const rubricsApi = {
  list: () => apiClient.get('/rubrics'),
}

// ==================== Characters / companions ====================
// NOTE: every GET below returns a wrapped `{ characters: [...] }` /
// `{ character: {...} }` / `{ conversation: {...} }` object, NOT a bare
// array/object — matches backend/src/modules/ai/character.controller.ts
// exactly (confirmed by reading every handler's return statement).
export const charactersApi = {
  list: (role?: string) => apiClient.get<{ characters: unknown[] }>('/characters', { params: { role } }),
  unlocked: () => apiClient.get<{ characters: unknown[] }>('/characters/unlocked'),
  orchestrate: (params?: { domainSlug?: string; missionId?: string }) =>
    apiClient.get<{
      character: { id: string; name: string; role: string; avatarUrl: string | null }
      reason: string
      domainSlug: string | null
      isFallback: boolean
    }>('/characters/orchestrate', { params }),
  getById: (id: string) =>
    apiClient.get<{ id: string; name: string; role: string; personality: unknown; avatarUrl: string | null }>(
      `/characters/${id}`,
    ),
  getState: (id: string) =>
    apiClient.get<{
      state: {
        characterId: string
        characterName: string
        characterRole: string
        relationshipLevel: number
        interactionCount: number
        lastInteraction: string | null
      }
    }>(`/characters/${id}/state`),
}

// ==================== Character conversations (chat) ====================
export interface ConversationMessage {
  id: string
  conversationId: string
  role: 'LEARNER' | 'CHARACTER' | 'SYSTEM'
  content: string
  metadata?: { mood?: string; suggestedActions?: string[] } | null
  createdAt: string
}
export interface ConversationRecord {
  id: string
  learnerId: string
  characterId: string
  type: 'LEARNING_SUPPORT' | 'ENGLISH_PRACTICE' | 'CODING_HELP' | 'PROJECT_GUIDANCE' | 'CASUAL' | 'ROLEPLAY' | 'DEBATE' | 'INTERVIEW'
  status: 'ACTIVE' | 'PAUSED' | 'ENDED' | 'BLOCKED'
  startedAt: string
  messages?: ConversationMessage[]
  character?: { id: string; name: string; role: string; avatarUrl: string | null }
}

export const conversationsApi = {
  create: (characterId: string, body: { type: ConversationRecord['type']; sessionId?: string; initialMessage?: string }) =>
    apiClient.post<{ conversation: ConversationRecord }>(`/characters/${characterId}/conversations`, body),
  get: (conversationId: string) =>
    apiClient.get<{ conversation: ConversationRecord }>(`/characters/conversations/${conversationId}`),
  sendMessage: (conversationId: string, body: { content: string; metadata?: Record<string, unknown> }) =>
    apiClient.post<{ learnerMessage: ConversationMessage; characterMessage: ConversationMessage }>(
      `/characters/conversations/${conversationId}/messages`,
      body,
    ),
  getMessages: (conversationId: string, params?: { limit?: number; offset?: number }) =>
    apiClient.get<{ messages: ConversationMessage[] }>(`/characters/conversations/${conversationId}/messages`, { params }),
  list: (params?: { status?: ConversationRecord['status']; characterId?: string; limit?: number }) =>
    apiClient.get<{ conversations: ConversationRecord[] }>('/characters/conversations', { params }),
  pause: (conversationId: string) =>
    apiClient.patch<{ conversation: ConversationRecord }>(`/characters/conversations/${conversationId}/pause`),
  resume: (conversationId: string) =>
    apiClient.patch<{ conversation: ConversationRecord }>(`/characters/conversations/${conversationId}/resume`),
  end: (conversationId: string) =>
    apiClient.patch<{ conversation: ConversationRecord }>(`/characters/conversations/${conversationId}/end`),
}

// ==================== Creativity ====================
export const creativityApi = {
  getPrompts: () => apiClient.get('/creativity/prompts'),
  getPrompt: (slug: string) => apiClient.get(`/creativity/prompts/${slug}`),
  submit: (body: { promptId?: string; title?: string; content: string }) =>
    apiClient.post('/creativity/submissions', body),
  mySubmissions: () => apiClient.get('/creativity/submissions/mine'),
  gallery: () => apiClient.get('/creativity/gallery'),
}

// ==================== Content libraries (consumed inside Learn) ============
export const storiesApi = {
  list: () => apiClient.get('/stories'),
  getById: (id: string) => apiClient.get(`/stories/${id}`),
}
export interface SimulationDecisionNode {
  id: string
  scenarioId: string
  nodeKey: string
  prompt: string
  isEnding: boolean
  outcomeNote?: string | null
  choiceOptions: Array<{ label: string; nextNode?: string }>
}
export interface SimulationScenarioDetail {
  id: string
  title: string
  slug: string
  description: string
  startNodeId: string | null
  nodes: SimulationDecisionNode[]
}
export const simulationsApi = {
  list: () => apiClient.get('/simulations'),
  getBySlug: (slug: string) => apiClient.get<SimulationScenarioDetail>(`/simulations/${slug}`),
  getNode: (scenarioId: string, nodeKey: string) =>
    apiClient.get<SimulationDecisionNode>(`/simulations/${scenarioId}/nodes/${nodeKey}`),
}
export interface ConceptCatalogItem {
  id: string
  name: string
  slug: string
  description?: string | null
  category: string
  ageAppropriate: string
  order: number
}
export const crossCurricularApi = {
  byCategory: (category: string) => apiClient.get<ConceptCatalogItem[]>(`/cross-curricular/${category}`),
  getConcept: (category: string, slug: string) =>
    apiClient.get<ConceptCatalogItem>(`/cross-curricular/${category}/${slug}`),
}
export const thinkingApi = {
  problemSolving: () => apiClient.get<ConceptCatalogItem[]>('/problem-solving'),
  computational: () => apiClient.get<ConceptCatalogItem[]>('/computational-thinking'),
  critical: () => apiClient.get<ConceptCatalogItem[]>('/critical-thinking'),
}
export interface VisualLanguageCard {
  id: string
  word: string
  slug: string
  category: string
  imageUrl: string
  caption: string
}
export const visualLanguageApi = {
  list: () => apiClient.get<VisualLanguageCard[]>('/visual-language'),
  getBySlug: (slug: string) => apiClient.get<VisualLanguageCard>(`/visual-language/${slug}`),
}

// ==================== Credentials ====================
export const credentialsApi = {
  mine: () => apiClient.get('/credentials/me'),
  verify: (uid: string) => apiClient.get(`/credentials/${uid}`),
}

// ==================== Notifications ====================
export const notificationsApi = {
  list: () => apiClient.get('/notifications'),
  unreadCount: () => apiClient.get('/notifications/unread-count'),
  markRead: (id: string) => apiClient.post(`/notifications/${id}/read`),
  markAllRead: () => apiClient.post('/notifications/read-all'),
}

// ==================== Search ====================
export const searchApi = {
  query: (q: string) => apiClient.get('/search', { params: { q } }),
}

// ==================== Gamification (rewards) ====================
export interface CosmeticItem {
  id: string
  name: string
  category: 'BORDER' | 'BADGE' | 'TITLE' | 'COLOR_THEME'
  xpCost: number
  iconOrStyleKey: string
  isDefault: boolean
  owned: boolean
  canAfford: boolean
  isEquipped: boolean
}
export const rewardsApi = {
  progression: () => apiClient.get('/gamification/progression'),
  achievements: () => apiClient.get('/gamification/achievements'),
  leaderboard: () => apiClient.get('/gamification/leaderboard'),
  streak: () => apiClient.get('/gamification/streak'),
  cosmetics: () => apiClient.get<{ totalXP: number; items: CosmeticItem[] }>('/gamification/cosmetics'),
  equipCosmetic: (id: string) => apiClient.post(`/gamification/cosmetics/${id}/equip`),
  unlockCosmetic: (id: string) => apiClient.post(`/gamification/cosmetics/${id}/unlock`),
  /**
   * Streak Freeze shop — real backend (gamification.controller.ts +
   * streak-freeze.service.ts), had ZERO frontend callers before this pass
   * (the wrapper existed with a WRONG response shape -
   * `{ freezesAvailable, coinCost }` - that didn't match what the service
   * actually returns, confirmed by reading streak-freeze.service.ts's
   * `getStatus`/`purchase` return statements directly). Fixed the type and
   * wired it into RewardsPage next to the streak stat.
   */
  streakFreezeStatus: () =>
    apiClient.get<{
      coins: number
      freezesAvailable: number
      costCoins: number
      maxFreezesHeld: number
      canAfford: boolean
      atCap: boolean
      lastFreezeUsedAt: string | null
    }>('/gamification/streak-freeze/status'),
  purchaseStreakFreeze: () =>
    apiClient.post<{ success: boolean; remainingCoins: number; freezesAvailable: number }>(
      '/gamification/streak-freeze/purchase',
    ),
}

/**
 * Learning events — real backend (`learning-events` module, routes under
 * `/learning/events/*`), had ZERO frontend callers in this tree (surfaced
 * building the legacy URL redirect map — legacy `/insights` used it, no
 * `frontend-rebuild` equivalent existed yet). Backs a learner-facing "My
 * Journey" view: activity-type stats, recent events, and detected learning
 * patterns (consistency, peak hour).
 */
export interface LearningEventStat {
  eventType: string
  count: number
  lastOccurred: string
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
  getStats: (since?: string) => apiClient.get<LearningEventStat[]>('/learning/events/stats', { params: { since } }),
  getPatterns: (days = 30) => apiClient.get<LearningPatterns>('/learning/events/patterns', { params: { days } }),
}

// ==================== Community ====================
/**
 * FIX (reconciliation audit, 2026-10-02): confirmed LIVE via an authenticated
 * Playwright run against production (frontend/scripts/live-verify.mjs) —
 * CommunityPage.tsx threw `TypeError: a.map is not a function` on real
 * navigation, a bug route-200 checks never catch.
 *
 * 1) GET /community/feed (community.service.ts getCommunityFeed) returns
 *    `{ projects, total }`, not a bare array — the frontend cast the whole
 *    wrapped response to `FeedItem[]` and called `.map` on it directly.
 * 2) POST /community/report's real DTO (community.dto.ts ReportContentDto)
 *    requires `entityType` (one of PROJECT|COMMENT|MESSAGE|PROFILE) and
 *    `reason` (one of INAPPROPRIATE|SPAM|HARASSMENT|COPYRIGHT|SAFETY|OTHER)
 *    — the wrapper sent `targetType`/`targetId` (wrong keys) and a
 *    lowercase `reason` value, so every report attempt would 400.
 */
export interface CommunityFeedItem {
  id: string
  title: string
  description?: string | null
  skills: string[]
  learner: { id: string; displayName: string; avatarUrl?: string | null }
}
export type ReportEntityType = 'PROJECT' | 'COMMENT' | 'MESSAGE' | 'PROFILE'
export type ReportReason = 'INAPPROPRIATE' | 'SPAM' | 'HARASSMENT' | 'COPYRIGHT' | 'SAFETY' | 'OTHER'
export const communityApi = {
  feed: () => apiClient.get<{ projects: CommunityFeedItem[]; total: number }>('/community/feed'),
  trending: (limit?: number) => apiClient.get<CommunityFeedItem[]>('/community/trending', { params: { limit } }),
  search: (q: string, params?: { type?: string; limit?: number }) =>
    apiClient.get<{ results: CommunityFeedItem[]; total: number }>('/community/search', { params: { q, ...params } }),
  stats: () => apiClient.get<{ totalProjects: number; totalLearners: number; recentProjects: number }>('/community/stats'),
  report: (body: { entityType: ReportEntityType; entityId: string; reason: ReportReason; description?: string }) =>
    apiClient.post('/community/report', body),
}

// ==================== Reflection ====================
export interface ReflectionPrompt {
  id: string
  text: string
  kind: string
  order: number
}
export const reflectionApi = {
  prompts: () => apiClient.get<ReflectionPrompt[]>('/reflection/prompts'),
  respond: (body: { missionRunId: string; promptId: string; rating: number; note?: string }) =>
    apiClient.post('/reflection/responses', body),
}

// ==================== Voice (PROVIDER-GATED) ====================
export const voiceApi = {
  turn: (body: Record<string, unknown>) => apiClient.post('/voice/turn', body),
}

/**
 * Generic AI tutoring (feedback/hint/explain/analyze) — real backend
 * (`ai.controller.ts`), had ZERO frontend callers before this pass despite
 * full working logic + child-safety moderation on every path. Surfaced as
 * an inline "Ask for a hint" / "Explain this" action on non-code activities
 * (ActivityView) — never auto-fires, always learner-initiated.
 */
export const aiTutorApi = {
  hint: (body: { question: string; learnerAttempt?: string; difficulty?: string }) =>
    apiClient.post<{ hint: string }>('/ai/hint', body),
  explain: (body: { concept: string; learnerAge?: number; context?: string }) =>
    apiClient.post<{ explanation: string }>('/ai/explain', body),
  feedback: (body: { work: string; rubric?: string; context?: string }) =>
    apiClient.post<{ feedback: string }>('/ai/feedback', body),
}

/**
 * Coding Coach — real backend (`coding-coach.controller.ts`), had ZERO
 * frontend callers before this pass. Surfaced as an "Ask Codey" debug-help
 * action in CodingActivityPanel, learner-initiated after a failed run —
 * never auto-fires, never writes the solution for the learner (the backend
 * prompt explicitly coaches toward self-correction, not an answer).
 *
 * `review` and `challenge` added in a follow-up pass — same backend
 * controller, same zero-caller gap (confirmed by reading
 * coding-coach.controller.ts's `@Post('review')`/`@Post('challenge')`
 * handlers, which existed with real working service logic but no route
 * was ever called from the frontend). `review` is wired into
 * CodingActivityPanel as a "Review my code" action available after any run
 * (pass or fail) — the service prompt explicitly coaches toward strengths/
 * next-steps and never pastes a full solution. `challenge` requires a real
 * `CodingConcept.id` (backend 404s on `generateChallenge` if the concept
 * doesn't exist), so it's wired into the Explore page's existing
 * "Coding Concepts" catalog tab, which is the only frontend surface that
 * already fetches real concept ids.
 */
export const codingCoachApi = {
  debug: (body: { code: string; language: 'scratch' | 'blockly' | 'python' | 'javascript' | 'html' | 'css'; error?: string; expectedBehavior?: string }) =>
    apiClient.post<{ diagnosis: string; suggestedFix?: string; explanation?: string; learningPoints?: string[] }>(
      '/coding-coach/debug',
      body,
    ),
  explain: (body: { code: string; language: string; specificLine?: number }) =>
    apiClient.post<{ explanation: string }>('/coding-coach/explain', body),
  review: (body: {
    code: string
    language: string
    objectiveId?: string
    taskPrompt?: string
    failingTests?: { description: string; actual?: string }[]
    hintsUsed?: number
    attemptNumber?: number
  }) =>
    apiClient.post<{
      code: string
      feedback: string
      strengths: string[]
      improvements: string[]
      nextConcept: string
      codeQualityScore: number
    }>('/coding-coach/review', body),
  challenge: (body: { conceptId: string; difficulty: 'easy' | 'medium' | 'hard' }) =>
    apiClient.post<{ concept: string; difficulty: string; challenge: string; estimatedTime: number }>(
      '/coding-coach/challenge',
      body,
    ),
}

/**
 * English Coach — real backend (`english-coach.controller.ts`), had ZERO
 * frontend callers before this pass. Surfaced as a dedicated conversation-
 * practice + grammar-check page, linked from the English domain path.
 */
export const englishCoachApi = {
  conversation: (body: { topic?: string; difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'; userMessage: string }) =>
    apiClient.post<{ response: string; cefrLevel: string; suggestedVocabulary?: string[] }>(
      '/english-coach/conversation',
      body,
    ),
  grammar: (body: { text: string; explainMistakes: boolean }) =>
    apiClient.post<{ originalText: string; correctedText: string; feedback: string; mistakeCount: number }>(
      '/english-coach/grammar',
      body,
    ),
  /**
   * Vocabulary + reading — real backend (english-coach.controller.ts
   * vocabulary/reading routes), had ZERO frontend callers before this pass
   * despite full working logic (CEFR-leveled, age-appropriate generation).
   * `vocabulary` items are typed `unknown[]` because the backend's own
   * parser (`parseVocabulary`) returns `any[]` — rendered defensively on
   * the frontend rather than assuming a shape the backend doesn't guarantee.
   * `pronunciation` is intentionally NOT wrapped here: the backend's own
   * code comment states `pronunciationScore` is a hardcoded placeholder
   * pending real STT-based scoring — wrapping it would surface fabricated
   * data as if it were measured, which the product's own data-honesty rule
   * forbids.
   */
  vocabulary: (body: { topic: string; wordCount?: number }) =>
    apiClient.post<{ topic: string; cefrLevel: string; vocabulary: unknown[] }>('/english-coach/vocabulary', body),
  reading: (body: { topic: string; length?: 'short' | 'medium' | 'long' }) =>
    apiClient.post<{ topic: string; cefrLevel: string; passage: string; wordCount: number; estimatedReadingTime: number }>(
      '/english-coach/reading',
      body,
    ),
}

// ==================== Guardian (parent) ====================
export interface ChildDashboard {
  progression: { level: number; totalXP: number; coins: number }
  streak: { current: number; longest: number }
  mastery: {
    total: number
    proficient: number
    developing: number
    emerging: number
    byDomain: Record<string, unknown>
  }
  recentActivity: Array<{ type: string; success: boolean; date: string }>
  projects: { showcased: number }
}
export const parentsApi = {
  children: () => apiClient.get('/parents/children'),
  familySummary: () => apiClient.get('/parents/family-summary'),
  dashboard: (learnerId: string) => apiClient.get<ChildDashboard>(`/parents/children/${learnerId}/dashboard`),
  progress: (learnerId: string) => apiClient.get(`/parents/children/${learnerId}/progress`),
  activity: (learnerId: string, days = 7) =>
    apiClient.get(`/parents/children/${learnerId}/activity`, { params: { days } }),
  reflections: (learnerId: string) => apiClient.get(`/parents/children/${learnerId}/reflections`),
  safety: (learnerId: string) => apiClient.get(`/parents/children/${learnerId}/safety`),
  setTimeLimits: (learnerId: string, body: { dailyMinutes?: number; weeklyMinutes?: number; bedtimeHour?: number }) =>
    apiClient.post(`/parents/children/${learnerId}/time-limits`, body),
}

export type ConsentPurpose =
  | 'ESSENTIAL_SERVICE'
  | 'PERSONALIZATION'
  | 'AI_PROCESSING'
  | 'VOICE_PROCESSING'
  | 'COMMUNITY'
  | 'ANALYTICS'
export interface EffectiveConsent {
  purpose: ConsentPurpose
  granted: boolean
  policyVersion: string | null
  updatedAt: string | null
}
/** Current policy version guardians are consenting to. Bump this when the
 * privacy policy text changes; the backend records exactly which version
 * was agreed to (ConsentRecord.policyVersion) for compliance evidence. */
export const CURRENT_POLICY_VERSION = '2026-10-02'

export const legalApi = {
  consent: (body: { learnerId: string; purpose: ConsentPurpose; granted: boolean; policyVersion: string }) =>
    apiClient.post('/legal/consent', body),
  getConsent: (learnerId: string) => apiClient.get<EffectiveConsent[]>(`/legal/consent/${learnerId}`),
  exportData: (learnerId: string) => apiClient.get(`/legal/export/${learnerId}`),
  requestDelete: (learnerId: string) => apiClient.post(`/legal/delete/${learnerId}`),
}

export const entitlementsMgmtApi = {
  subscribe: (planCode: string) => apiClient.post('/entitlements/subscribe', { planCode }),
  cancel: (subscriptionId: string) => apiClient.post(`/entitlements/cancel/${subscriptionId}`),
}

// ==================== Moderator ====================
export const moderationApi = {
  escalations: () => apiClient.get('/safety-escalations'),
  escalation: (id: string) => apiClient.get(`/safety-escalations/${id}`),
  assign: (id: string) => apiClient.patch(`/safety-escalations/${id}/assign`),
  /** body must match backend/src/modules/ai/dto/safety-escalation.dto.ts ResolveSafetyEscalationDto exactly. */
  resolve: (
    id: string,
    body: {
      resolutionType: 'RESOLVED_INTERNALLY' | 'REFERRED_TO_GUARDIAN' | 'REFERRED_TO_HUMAN_SUPPORT' | 'FALSE_POSITIVE'
      resolutionNote: string
    },
  ) => apiClient.patch(`/safety-escalations/${id}/resolve`, body),
  stats: () => apiClient.get('/safety-escalations/stats/summary'),
  quarantined: () => apiClient.get('/community/moderation/quarantined'),
  /** decision must be 'APPROVED' | 'REJECTED' — matches QuarantinedContent.status exactly. */
  review: (id: string, body: { decision: 'APPROVED' | 'REJECTED'; notes?: string }) =>
    apiClient.post(`/community/moderation/review/${id}`, body),
  interventions: () => apiClient.get('/admin/interventions'),
  interventionsForLearner: (learnerId: string, status?: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED') =>
    apiClient.get(`/admin/interventions/learner/${learnerId}`, { params: { status } }),
  ackIntervention: (id: string) => apiClient.patch(`/admin/interventions/${id}/acknowledge`),
  resolveIntervention: (id: string) => apiClient.patch(`/admin/interventions/${id}/resolve`),
}

// ==================== Admin ====================
export const adminApi = {
  analyticsOverview: () => apiClient.get('/admin/analytics/overview'),
  analyticsDaily: () => apiClient.get('/admin/analytics/daily-activity'),
  analyticsRetentionCohorts: (cohortWeeks?: number, weeksTracked?: number) =>
    apiClient.get('/admin/analytics/retention-cohorts', { params: { cohortWeeks, weeksTracked } }),
  analyticsStickiness: (days?: number) => apiClient.get('/admin/analytics/stickiness', { params: { days } }),
  contentItems: () => apiClient.get('/admin/content-items'),
  createContentItem: (body: Record<string, unknown>) => apiClient.post('/admin/content-items', body),
  setContentStatus: (id: string, status: string) => apiClient.patch(`/admin/content-items/${id}/status`, { status }),
  missions: () => apiClient.get('/admin/missions'),
  createMission: (body: Record<string, unknown>) => apiClient.post('/admin/missions', body),
  updateMission: (id: string, body: Record<string, unknown>) => apiClient.patch(`/admin/missions/${id}`, body),
  deleteMission: (id: string) => apiClient.delete(`/admin/missions/${id}`),
  promptTemplates: () => apiClient.get('/admin/prompt-templates'),
  getPromptTemplate: (key: string) => apiClient.get(`/admin/prompt-templates/${key}`),
  updatePromptTemplate: (key: string, body: { content: string; changelog: string }) =>
    apiClient.put(`/admin/prompt-templates/${key}`, body),
  deactivatePromptTemplate: (key: string) => apiClient.patch(`/admin/prompt-templates/${key}/deactivate`),
  safetyPolicies: () => apiClient.get('/admin/safety-policies'),
  aiEvalRuns: () => apiClient.get('/admin/ai-eval/runs'),
  misconceptions: () => apiClient.get('/admin/misconceptions'),
  contentQaFlags: () => apiClient.get('/admin/content-qa/flags'),
  contentQaScan: () => apiClient.post('/admin/content-qa/scan'),
  /**
   * FIX (2026-10-02): FeatureFlagController.toggleFlag reads
   * `dto.isEnabledGlobally` (feature-flag.controller.ts), not `enabled` —
   * this wrapper previously sent `{ enabled }`, a key the backend never
   * reads, so every toggle PATCH silently wrote `isEnabledGlobally:
   * undefined` instead of the intended value. Corrected to the real DTO
   * key.
   */
  featureFlags: () => apiClient.get<Array<{ id: string; key: string; description?: string | null; isEnabledGlobally: boolean }>>('/feature-flags'),
  setFeatureFlag: (key: string, isEnabledGlobally: boolean) =>
    apiClient.patch(`/feature-flags/${key}`, { isEnabledGlobally }),
  experiments: () => apiClient.get('/experiments'),
  auditLogs: () => apiClient.get('/audit/logs'),
  memoryGovernanceStats: () => apiClient.get('/admin/memory-governance/stats'),
  // Difficulty calibration (admin-only; scan + list open flags).
  difficultyCalibrationFlags: (take?: number) =>
    apiClient.get('/admin/difficulty-calibration/flags', { params: { take } }),
  difficultyCalibrationScan: () => apiClient.post('/admin/difficulty-calibration/scan'),
  // Assessment quality (admin+moderator; scan + list open flags).
  assessmentQualityFlags: () => apiClient.get('/admin/assessment-quality/flags'),
  assessmentQualityScan: () => apiClient.post('/admin/assessment-quality/scan'),
  // Content provenance (licenses/sources registry + compliance check).
  provenanceLicenses: () => apiClient.get('/admin/content-provenance/licenses'),
  upsertProvenanceLicense: (body: Record<string, unknown>) =>
    apiClient.post('/admin/content-provenance/licenses', body),
  provenanceSources: () => apiClient.get('/admin/content-provenance/sources'),
  createProvenanceSource: (body: Record<string, unknown>) => apiClient.post('/admin/content-provenance/sources', body),
  // Curriculum mapping (free-text -> ranked LearningObjective suggestions).
  suggestCurriculumMapping: (body: { title: string; description?: string; take?: number }) =>
    apiClient.post('/admin/curriculum-mapping/suggest', body),
  /**
   * Question-template authoring — real backend (`questions.controller.ts`,
   * routes under `/questions/*`), had ZERO frontend callers in this tree
   * (surfaced building the legacy URL redirect map — legacy
   * `/admin/question-templates`). Grouped under adminApi for organization
   * even though the backend route itself only requires auth, not an ADMIN
   * role check — template authoring is an admin workflow by product intent.
   */
  questionTemplates: (params?: { objectiveId?: string; type?: string }) =>
    apiClient.get('/questions/templates', { params }),
  generateFromTemplate: (body: { templateId: string; distractorCount?: number; missionId?: string; order?: number }) =>
    apiClient.post('/questions/generate', body),
}
