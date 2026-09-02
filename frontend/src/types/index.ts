export interface User {
  id: string
  email: string
  displayName: string
  userType: 'LEARNER' | 'EDUCATOR' | 'GUARDIAN'
  learner?: Learner
  educator?: Educator
  guardian?: Guardian
}

export interface Learner {
  id: string
  userId: string
  firstName: string
  lastName: string
  displayName: string
  ageBand: string | null
  avatarUrl: string | null
  status: string
}

export interface Educator {
  id: string
  userId: string
  firstName: string
  lastName: string
  displayName: string
}

export interface Guardian {
  id: string
  userId: string
  firstName: string
  lastName: string
  displayName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  displayName: string
  userType: 'LEARNER' | 'EDUCATOR' | 'GUARDIAN'
  learnerData?: {
    firstName: string
    lastName: string
    ageBand: string
    dateOfBirth: string
  }
}
