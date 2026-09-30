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
}
