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
export const communityApi = {
  getFeed: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/community/feed', { params }),

  getTrending: () =>
    apiClient.get('/community/trending'),

  search: (query: string) =>
    apiClient.get('/community/search', { params: { query } }),

  report: (data: any) =>
    apiClient.post('/community/report', data),
}

// ==================== Parents ====================
export const parentsApi = {
  getChildren: () =>
    apiClient.get('/parents/children'),

  getFamilySummary: () =>
    apiClient.get('/parents/family-summary'),

  getChildDashboard: (learnerId: number) =>
    apiClient.get(`/parents/children/${learnerId}/dashboard`),

  getChildProgress: (learnerId: number, params?: { startDate?: string; endDate?: string }) =>
    apiClient.get(`/parents/children/${learnerId}/progress`, { params }),

  getChildActivity: (learnerId: number, params?: { days?: number }) =>
    apiClient.get(`/parents/children/${learnerId}/activity`, { params }),
}
