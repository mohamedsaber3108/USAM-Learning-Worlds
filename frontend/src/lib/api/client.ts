import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

/**
 * Typed API client for the USAM backend.
 *
 * Contract (code-traced from the real backend, see FINAL_CAPABILITY_REGISTRY):
 * - Global prefix `/api`, unversioned.
 * - Bearer JWT access token; `POST /auth/refresh` takes the refresh token in
 *   the BODY (not a header) and ROTATES both tokens.
 * - Same-origin in production (`VITE_API_URL=/api`); dev proxies `/api` to the
 *   backend on :3001.
 */
const API_URL = import.meta.env.VITE_API_URL || '/api'

const ACCESS_KEY = 'usam.accessToken'
const REFRESH_KEY = 'usam.refreshToken'

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY)
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY)
  },
  set(accessToken: string, refreshToken?: string) {
    localStorage.setItem(ACCESS_KEY, accessToken)
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.access
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

/** Called when refresh fails / no refresh token — hard logout. Overridable so
 * the auth layer can route via the SPA router instead of a full reload. */
let onAuthExpired: () => void = () => {
  tokenStore.clear()
  if (window.location.pathname !== '/login') window.location.assign('/login')
}
export function setOnAuthExpired(handler: () => void) {
  onAuthExpired = handler
}

// Single-flight refresh: concurrent 401s share one refresh call.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStore.refresh
  if (!refreshToken) throw new Error('no-refresh-token')
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh`, { refreshToken })
      .then((res) => {
        const { accessToken, refreshToken: rotated } = res.data ?? {}
        if (!accessToken) throw new Error('refresh-no-access-token')
        tokenStore.set(accessToken, rotated)
        return accessToken as string
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true
      try {
        const accessToken = await refreshAccessToken()
        original.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(original)
      } catch {
        tokenStore.clear()
        onAuthExpired()
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
