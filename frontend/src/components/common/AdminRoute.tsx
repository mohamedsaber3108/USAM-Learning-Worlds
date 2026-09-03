import { Navigate } from 'react-router-dom'

interface AdminRouteProps {
  children: React.ReactNode
}

/**
 * Gates admin-only frontend routes (e.g. /admin/missions) on the real
 * ADMIN role (backend/prisma/schema.prisma Role enum). Mirrors
 * ProtectedRoute's token check, then additionally checks the cached
 * user's role from localStorage (same pattern AppShell.tsx already uses
 * for `user?.role === 'GUARDIAN'`). The backend RolesGuard is the real
 * enforcement point — this is a UX convenience, not the security boundary.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    return <Navigate to="/login" replace />
  }

  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
