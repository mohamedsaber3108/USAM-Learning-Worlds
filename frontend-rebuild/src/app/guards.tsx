import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/auth/authStore'
import { LoadingState, RestrictedState } from '@/components/common/States'
import type { Role } from '@/lib/api/types'

/** Requires an authenticated session; otherwise → /login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  if (status === 'idle' || status === 'loading') return <LoadingState />
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  return <>{children}</>
}

/** Requires the user's role to be in `allow`; otherwise shows a 403 state.
 * Frontend hiding is NOT security — the backend enforces authz; this is UX. */
export function RequireRole({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  if (status === 'idle' || status === 'loading') return <LoadingState />
  if (status === 'unauthenticated' || !user) return <Navigate to="/login" replace />
  if (!allow.includes(user.role)) return <RestrictedState />
  return <>{children}</>
}

/** Home destination for the current role after login. */
export function roleHome(role: Role): string {
  switch (role) {
    case 'GUARDIAN':
      return '/parent'
    case 'MODERATOR':
      return '/mod'
    case 'ADMIN':
      return '/admin'
    case 'LEARNER':
    default:
      return '/app'
  }
}
