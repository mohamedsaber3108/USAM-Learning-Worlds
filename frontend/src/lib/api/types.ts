// Shared API types mirroring the real backend contracts.
// Roles are the definitive Prisma enum: no teacher/org/company/career role.

export type Role = 'LEARNER' | 'GUARDIAN' | 'MODERATOR' | 'ADMIN'

/** Persisted age enum (COMPATIBILITY MODE / MIGRATION PENDING). Displayed as
 * product bands (7-9 / 10-12 / 13-15) via the age-labels layer — never shown
 * raw. Do not upgrade the enum. */
export type AgeBand = 'AGE_8_9' | 'AGE_10_11' | 'AGE_12_14'

export interface LearnerProfile {
  id: string
  firstName: string
  lastName?: string | null
  displayName: string
  ageBand: AgeBand | null
  avatarUrl?: string | null
}

export interface GuardianProfile {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
}

/** `GET /auth/me` shape (JWT strategy eager-loads learner + guardian). */
export interface CurrentUser {
  id: string
  email: string
  role: Role
  learner?: LearnerProfile | null
  guardian?: GuardianProfile | null
}

export interface AuthResponse {
  user: CurrentUser
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  role: Extract<Role, 'LEARNER' | 'GUARDIAN'>
  firstName?: string
  lastName?: string
  displayName?: string
  ageBand?: AgeBand
  dateOfBirth?: string
  guardianFirstName?: string
  guardianLastName?: string
  phone?: string
}
