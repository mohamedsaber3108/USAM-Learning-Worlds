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

export const worldsApi = {
  list: () => apiClient.get('/worlds'),
}

// ==================== Missions ====================
export const missionsApi = {
  getById: (id: string) => apiClient.get(`/missions/${id}`),
  start: (id: string) => apiClient.post(`/missions/${id}/start`),
  getRun: (runId: string) => apiClient.get(`/missions/runs/${runId}`),
  /** body: { activityId, response: {...} } */
  submit: (runId: string, body: { activityId: string; response: Record<string, unknown> }) =>
    apiClient.post(`/missions/runs/${runId}/submit`, body),
  complete: (runId: string) => apiClient.post(`/missions/runs/${runId}/complete`),
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
export const simulationsApi = {
  list: () => apiClient.get('/simulations'),
  getBySlug: (slug: string) => apiClient.get(`/simulations/${slug}`),
}
export const visualLanguageApi = {
  list: () => apiClient.get('/visual-language'),
  getBySlug: (slug: string) => apiClient.get(`/visual-language/${slug}`),
}
export const crossCurricularApi = {
  byCategory: (category: string) => apiClient.get(`/cross-curricular/${category}`),
  getConcept: (category: string, slug: string) => apiClient.get(`/cross-curricular/${category}/${slug}`),
}
export const thinkingApi = {
  problemSolving: () => apiClient.get('/problem-solving'),
  computational: () => apiClient.get('/computational-thinking'),
  critical: () => apiClient.get('/critical-thinking'),
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
export const rewardsApi = {
  progression: () => apiClient.get('/gamification/progression'),
  achievements: () => apiClient.get('/gamification/achievements'),
  leaderboard: () => apiClient.get('/gamification/leaderboard'),
  streak: () => apiClient.get('/gamification/streak'),
  cosmetics: () => apiClient.get('/gamification/cosmetics'),
  equipCosmetic: (id: string) => apiClient.post(`/gamification/cosmetics/${id}/equip`),
  unlockCosmetic: (id: string) => apiClient.post(`/gamification/cosmetics/${id}/unlock`),
}

// ==================== Community ====================
export const communityApi = {
  feed: () => apiClient.get('/community/feed'),
  trending: () => apiClient.get('/community/trending'),
  report: (body: { targetType: string; targetId: string; reason: string }) =>
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

// ==================== Guardian (parent) ====================
export const parentsApi = {
  children: () => apiClient.get('/parents/children'),
  familySummary: () => apiClient.get('/parents/family-summary'),
  dashboard: (learnerId: string) => apiClient.get(`/parents/children/${learnerId}/dashboard`),
  progress: (learnerId: string) => apiClient.get(`/parents/children/${learnerId}/progress`),
  activity: (learnerId: string, days = 7) =>
    apiClient.get(`/parents/children/${learnerId}/activity`, { params: { days } }),
  reflections: (learnerId: string) => apiClient.get(`/parents/children/${learnerId}/reflections`),
  safety: (learnerId: string) => apiClient.get(`/parents/children/${learnerId}/safety`),
  setTimeLimits: (learnerId: string, body: { dailyMinutes?: number; weeklyMinutes?: number; bedtimeHour?: number }) =>
    apiClient.post(`/parents/children/${learnerId}/time-limits`, body),
}

export const legalApi = {
  consent: (body: Record<string, unknown>) => apiClient.post('/legal/consent', body),
  getConsent: (learnerId: string) => apiClient.get(`/legal/consent/${learnerId}`),
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
  ackIntervention: (id: string) => apiClient.patch(`/admin/interventions/${id}/acknowledge`),
  resolveIntervention: (id: string) => apiClient.patch(`/admin/interventions/${id}/resolve`),
}

// ==================== Admin ====================
export const adminApi = {
  analyticsOverview: () => apiClient.get('/admin/analytics/overview'),
  analyticsDaily: () => apiClient.get('/admin/analytics/daily-activity'),
  contentItems: () => apiClient.get('/admin/content-items'),
  createContentItem: (body: Record<string, unknown>) => apiClient.post('/admin/content-items', body),
  setContentStatus: (id: string, status: string) => apiClient.patch(`/admin/content-items/${id}/status`, { status }),
  missions: () => apiClient.get('/admin/missions'),
  createMission: (body: Record<string, unknown>) => apiClient.post('/admin/missions', body),
  deleteMission: (id: string) => apiClient.delete(`/admin/missions/${id}`),
  promptTemplates: () => apiClient.get('/admin/prompt-templates'),
  safetyPolicies: () => apiClient.get('/admin/safety-policies'),
  aiEvalRuns: () => apiClient.get('/admin/ai-eval/runs'),
  misconceptions: () => apiClient.get('/admin/misconceptions'),
  contentQaFlags: () => apiClient.get('/admin/content-qa/flags'),
  featureFlags: () => apiClient.get('/feature-flags'),
  setFeatureFlag: (key: string, enabled: boolean) => apiClient.patch(`/feature-flags/${key}`, { enabled }),
  experiments: () => apiClient.get('/experiments'),
  auditLogs: () => apiClient.get('/audit/logs'),
}
