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

// ==================== Mastery ====================
export const masteryApi = {
  getOverview: () =>
    apiClient.get('/mastery/overview'),

  getByDomain: (domainId: number) =>
    apiClient.get('/mastery/by-domain', { params: { domainId } }),

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

  getById: (id: number) =>
    apiClient.get(`/missions/${id}`),

  start: (id: number) =>
    apiClient.post(`/missions/${id}/start`),

  getRun: (runId: number) =>
    apiClient.get(`/missions/runs/${runId}`),

  submitActivity: (runId: number, data: any) =>
    apiClient.post(`/missions/runs/${runId}/submit`, data),

  complete: (runId: number) =>
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

  getById: (id: number) =>
    apiClient.get(`/projects/${id}`),

  update: (id: number, data: any) =>
    apiClient.put(`/projects/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/projects/${id}`),

  showcase: (id: number) =>
    apiClient.post(`/projects/${id}/showcase`),

  getRubric: (id: number | string) =>
    apiClient.get(`/projects/${id}/rubric`),
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
