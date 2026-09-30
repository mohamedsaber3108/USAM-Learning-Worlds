import { useState } from 'react'
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Home,
  BookOpen,
  RotateCcw,
  FolderKanban,
  TrendingUp,
  Search,
  Bell,
  Globe,
  LogOut,
  Settings,
  Users,
  ShieldAlert,
  MessageSquareWarning,
  LifeBuoy,
  LayoutDashboard,
  FileText,
  GraduationCap,
  Bot,
  BarChart3,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth/authStore'
import { setLanguage } from '@/lib/i18n'
import { notificationsApi } from '@/lib/api/endpoints'
import { Avatar } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import type { Role } from '@/lib/api/types'

interface NavItem {
  to: string
  key: string
  icon: LucideIcon
}

// Role-variant navigation with icons (IA: learner 5 anchors; role consoles).
const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  LEARNER: [
    { to: '/app', key: 'nav.home', icon: Home },
    { to: '/app/learn', key: 'nav.learn', icon: BookOpen },
    { to: '/app/practice', key: 'nav.practice', icon: RotateCcw },
    { to: '/app/projects', key: 'nav.projects', icon: FolderKanban },
    { to: '/app/progress', key: 'nav.progress', icon: TrendingUp },
  ],
  GUARDIAN: [
    { to: '/parent', key: 'parent.children', icon: Users },
    { to: '/parent/plan', key: 'parent.plan', icon: FileText },
    { to: '/parent/privacy', key: 'parent.privacy', icon: ShieldAlert },
  ],
  MODERATOR: [
    { to: '/mod', key: 'mod.console', icon: LayoutDashboard },
    { to: '/mod/escalations', key: 'mod.escalations', icon: ShieldAlert },
    { to: '/mod/community', key: 'mod.communityQueue', icon: MessageSquareWarning },
    { to: '/mod/interventions', key: 'mod.interventions', icon: LifeBuoy },
  ],
  ADMIN: [
    { to: '/admin', key: 'admin.overview', icon: LayoutDashboard },
    { to: '/admin/content', key: 'admin.content', icon: FileText },
    { to: '/admin/curriculum', key: 'admin.curriculum', icon: GraduationCap },
    { to: '/admin/ai', key: 'admin.aiSafety', icon: Bot },
    { to: '/admin/analytics', key: 'admin.analytics', icon: BarChart3 },
    { to: '/admin/platform', key: 'admin.platform', icon: SlidersHorizontal },
  ],
}

const TOP_LEVEL = new Set(['/app', '/parent', '/mod', '/admin'])

export function AppShell() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [menuOpen, setMenuOpen] = useState(false)
  const items = user ? NAV_BY_ROLE[user.role] : []
  const isLearner = user?.role === 'LEARNER'
  const displayName = user?.learner?.displayName || user?.learner?.firstName || user?.guardian?.firstName || user?.email || ''

  // Notification unread count (real; learner + guardian have notifications).
  const { data: unread } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => (await notificationsApi.unreadCount()).data as { count?: number },
    retry: false,
    enabled: Boolean(user),
  })
  const unreadCount = unread?.count ?? 0

  return (
    <div className="min-h-screen bg-canvas-off pb-16 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link to={items[0]?.to ?? '/app'} className="font-display text-lg font-extrabold text-brand-700">
            USAM
          </Link>

          <nav className="ms-4 hidden items-center gap-1 md:flex" aria-label="Primary">
            {items.map((it) => {
              const Icon = it.icon
              return (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={TOP_LEVEL.has(it.to)}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-1.5 rounded-control px-3 py-2 text-sm font-medium transition-colors duration-fast',
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-canvas-off hover:text-ink-900',
                    )
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {t(it.key)}
                </NavLink>
              )
            })}
          </nav>

          <div className="ms-auto flex items-center gap-1">
            {isLearner && (
              <button
                onClick={() => navigate('/app/search')}
                aria-label={t('learner.search')}
                className="rounded-control p-2 text-ink-600 hover:bg-canvas-off"
              >
                <Search className="h-5 w-5" aria-hidden />
              </button>
            )}
            {isLearner && (
              <button
                onClick={() => navigate('/app/notifications')}
                aria-label={t('learner.notifications')}
                className="relative rounded-control p-2 text-ink-600 hover:bg-canvas-off"
              >
                <Bell className="h-5 w-5" aria-hidden />
                {unreadCount > 0 && (
                  <span className="absolute end-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
              className="rounded-control p-2 text-ink-600 hover:bg-canvas-off"
              aria-label="Toggle language"
            >
              <Globe className="h-5 w-5" aria-hidden />
            </button>

            {/* Profile menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={displayName}
                className="ms-1 rounded-full ring-brand-200 hover:ring-2"
              >
                <Avatar name={displayName} size={32} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div role="menu" className="absolute end-0 z-20 mt-2 w-48 rounded-card border border-line bg-white p-1 shadow-lift">
                    <div className="border-b border-line px-3 py-2 text-sm">
                      <p className="truncate font-medium text-ink-900">{displayName}</p>
                    </div>
                    {isLearner && (
                      <NavLink
                        to="/app/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-control px-3 py-2 text-sm text-ink-700 hover:bg-canvas-off"
                      >
                        <Settings className="h-4 w-4" aria-hidden />
                        {t('learner.settings')}
                      </NavLink>
                    )}
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        logout()
                      }}
                      className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-start text-sm text-ink-700 hover:bg-canvas-off"
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      {t('common.logout')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      {items.length > 1 && (
        <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-white md:hidden" aria-label="Primary">
          {items.map((it) => {
            const Icon = it.icon
            return (
              <NavLink
                key={it.to}
                to={it.to}
                end={TOP_LEVEL.has(it.to)}
                className={({ isActive }) =>
                  cn('flex flex-1 flex-col items-center gap-1 py-2 text-[11px]', isActive ? 'text-brand-700' : 'text-ink-500')
                }
              >
                <Icon className="h-5 w-5" aria-hidden />
                {t(it.key)}
              </NavLink>
            )
          })}
        </nav>
      )}
    </div>
  )
}
