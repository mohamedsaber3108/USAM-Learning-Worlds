import { create } from 'zustand'
import { authApi } from '@/lib/api/endpoints'
import { tokenStore, setOnAuthExpired } from '@/lib/api/client'
import type { CurrentUser, LoginRequest, RegisterRequest } from '@/lib/api/types'

interface AuthState {
  user: CurrentUser | null
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
  error: string | null
  login: (data: LoginRequest) => Promise<CurrentUser>
  register: (data: RegisterRequest) => Promise<CurrentUser>
  loadSession: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  error: null,

  async login(data) {
    set({ status: 'loading', error: null })
    try {
      const { data: res } = await authApi.login(data)
      tokenStore.set(res.accessToken, res.refreshToken)
      set({ user: res.user, status: 'authenticated', error: null })
      return res.user
    } catch (e) {
      set({ status: 'unauthenticated', error: 'Invalid email or password.' })
      throw e
    }
  },

  async register(data) {
    set({ status: 'loading', error: null })
    try {
      const { data: res } = await authApi.register(data)
      tokenStore.set(res.accessToken, res.refreshToken)
      set({ user: res.user, status: 'authenticated', error: null })
      return res.user
    } catch (e) {
      set({ status: 'unauthenticated', error: 'Could not create the account.' })
      throw e
    }
  },

  async loadSession() {
    if (!tokenStore.access) {
      set({ status: 'unauthenticated', user: null })
      return
    }
    set({ status: 'loading' })
    try {
      const { data: user } = await authApi.me()
      set({ user, status: 'authenticated', error: null })
    } catch {
      tokenStore.clear()
      set({ status: 'unauthenticated', user: null })
    }
  },

  logout() {
    tokenStore.clear()
    set({ user: null, status: 'unauthenticated', error: null })
  },
}))

// When the API client gives up on refresh, reflect it in the store (the router
// will then redirect to /login without a hard reload).
setOnAuthExpired(() => {
  tokenStore.clear()
  useAuthStore.setState({ user: null, status: 'unauthenticated' })
})
