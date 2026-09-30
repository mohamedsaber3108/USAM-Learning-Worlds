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
  getMine: () => apiClient.get('/entitlements/me'),
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

export const flashcardsApi = {
  getDue: () => apiClient.get('/flashcards/due'),
  review: (id: string, body: Record<string, unknown>) => apiClient.post(`/flashcards/${id}/review`, body),
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

export const dailyGoalsApi = {
  getProgress: () => apiClient.get('/daily-goals/me/progress'),
}

// ==================== Projects ====================
export const projectsApi = {
  mine: () => apiClient.get('/projects/my'),
  getById: (id: string) => apiClient.get(`/projects/${id}`),
  portfolio: (learnerId: string) => apiClient.get(`/projects/portfolio/${learnerId}`),
}

// ==================== Characters / companions ====================
export const charactersApi = {
  list: () => apiClient.get('/characters'),
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
export const reflectionApi = {
  prompts: () => apiClient.get('/reflection/prompts'),
  respond: (body: Record<string, unknown>) => apiClient.post('/reflection/responses', body),
}

// ==================== Voice (PROVIDER-GATED) ====================
export const voiceApi = {
  turn: (body: Record<string, unknown>) => apiClient.post('/voice/turn', body),
}
