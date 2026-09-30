import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/lib/auth/authStore'
import { setLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'
import type { Role } from '@/lib/api/types'

interface NavItem {
  to: string
  key: string
}

// Role-variant navigation (IA: 5 learner anchors; parent/mod/admin consoles).
const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  LEARNER: [
    { to: '/app', key: 'nav.home' },
    { to: '/app/learn', key: 'nav.learn' },
    { to: '/app/practice', key: 'nav.practice' },
    { to: '/app/projects', key: 'nav.projects' },
    { to: '/app/progress', key: 'nav.progress' },
  ],
  GUARDIAN: [{ to: '/parent', key: 'nav.home' }],
  MODERATOR: [{ to: '/mod', key: 'nav.home' }],
  ADMIN: [{ to: '/admin', key: 'nav.home' }],
}

export function AppShell() {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const items = user ? NAV_BY_ROLE[user.role] : []

  return (
    <div className="min-h-screen bg-canvas-off">
      <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <span className="font-display text-lg font-extrabold text-brand-700">USAM</span>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === '/app' || it.to === '/parent' || it.to === '/mod' || it.to === '/admin'}
                className={({ isActive }) =>
                  cn(
                    'rounded-control px-3 py-2 text-sm font-medium transition-colors duration-fast',
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-canvas-off hover:text-ink-900',
                  )
                }
              >
                {t(it.key)}
              </NavLink>
            ))}
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <button
              onClick={() => setLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
              className="rounded-control px-2 py-1 text-sm text-ink-600 hover:bg-canvas-off"
              aria-label="Toggle language"
            >
              {i18n.language === 'ar' ? 'EN' : 'ع'}
            </button>
            <button
              onClick={logout}
              className="rounded-control px-3 py-1.5 text-sm text-ink-600 hover:bg-canvas-off"
            >
              {t('common.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar (learner anchors). */}
      {items.length > 1 && (
        <nav
          className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-white md:hidden"
          aria-label="Primary"
        >
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === '/app'}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 py-2 text-xs',
                  isActive ? 'text-brand-700' : 'text-ink-500',
                )
              }
            >
              {t(it.key)}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
