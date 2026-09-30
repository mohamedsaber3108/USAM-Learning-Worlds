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
