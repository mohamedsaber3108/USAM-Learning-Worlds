import type { Role } from '@/lib/api/types'

/** Home destination for the current role after login. Split out of
 * guards.tsx (react-refresh/only-export-components: a file with JSX
 * components must only export components). */
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
