import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Home, BookOpen, Target, Users2, Sparkles, Trophy, BarChart3, TrendingUp,
  Mic, ShoppingBag, FolderKanban, Zap, Languages, UserCircle2, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import usamLogo from '@/assets/usam-logo.png'

/**
 * Desktop sidebar navigation (lg+ only). The mobile experience keeps the
 * bottom tab bar in AppShell; this gives large screens a real persistent
 * nav rail so the product doesn't look empty/unfinished on desktop.
 *
 * Grouped IA:
 *  - Learn: the core learning destinations
 *  - Play: gamification / rewards / social
 *  - You: profile, portfolio, parents
 * Every item is a real route already wired in the router.
 */

interface Item {
  to: string
  labelKey: string
  fallback: string
  icon: typeof Home
  match: (p: string) => boolean
}

interface Group {
  headingKey: string
  fallback: string
  items: Item[]
}

const GROUPS: Group[] = [
  {
    headingKey: 'sidebar.learn',
    fallback: 'Learn',
    items: [
      { to: '/dashboard', labelKey: 'nav.home', fallback: 'Home', icon: Home, match: (p) => p === '/' || p.startsWith('/dashboard') },
      { to: '/learn', labelKey: 'nav.learn', fallback: 'Learn', icon: BookOpen, match: (p) => p.startsWith('/learn') || p.startsWith('/cross-curricular') },
      { to: '/missions', labelKey: 'nav.missions', fallback: 'Missions', icon: Target, match: (p) => p.startsWith('/missions') },
      { to: '/english', labelKey: 'more.english', fallback: 'English', icon: Languages, match: (p) => p.startsWith('/english') },
      { to: '/characters', labelKey: 'more.characters', fallback: 'Characters', icon: Sparkles, match: (p) => p.startsWith('/characters') },
      { to: '/voice-chat', labelKey: 'more.voiceChat', fallback: 'Voice Chat', icon: Mic, match: (p) => p.startsWith('/voice-chat') },
    ],
  },
  {
    headingKey: 'sidebar.play',
    fallback: 'Play & Progress',
    items: [
      { to: '/progress', labelKey: 'more.progress', fallback: 'Progress', icon: TrendingUp, match: (p) => p.startsWith('/progress') },
      { to: '/achievements', labelKey: 'more.achievements', fallback: 'Achievements', icon: Trophy, match: (p) => p.startsWith('/achievements') },
      { to: '/leaderboard', labelKey: 'more.leaderboard', fallback: 'Leaderboard', icon: BarChart3, match: (p) => p.startsWith('/leaderboard') },
      { to: '/shop', labelKey: 'more.shop', fallback: 'Shop', icon: ShoppingBag, match: (p) => p.startsWith('/shop') },
      { to: '/insights', labelKey: 'more.myJourney', fallback: 'My Journey', icon: Zap, match: (p) => p.startsWith('/insights') },
    ],
  },
  {
    headingKey: 'sidebar.you',
    fallback: 'You',
    items: [
      { to: '/portfolio', labelKey: 'more.myPortfolio', fallback: 'Portfolio', icon: FolderKanban, match: (p) => p.startsWith('/portfolio') },
      { to: '/community', labelKey: 'nav.community', fallback: 'Community', icon: Users2, match: (p) => p.startsWith('/community') },
      { to: '/parents', labelKey: 'nav.profile', fallback: 'Profile', icon: UserCircle2, match: (p) => p.startsWith('/parents') },
    ],
  },
]

export function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 shrink-0 border-e border-surface-200 bg-white sticky top-0 h-screen">
      <Link
        to="/dashboard"
        className="flex items-center gap-2.5 px-5 h-16 border-b border-surface-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        aria-label={t('common.appName')}
      >
        <img src={usamLogo} alt="" aria-hidden="true" className="h-8 w-auto" />
        <span className="font-display font-bold text-lg text-ink tracking-tight">
          {t('common.appName')}
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label="Sidebar">
        {GROUPS.map((group) => (
          <div key={group.headingKey}>
            <p className="px-3.5 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t(group.headingKey, group.fallback)}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.match(location.pathname)
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={cn('side-nav-item', active && 'side-nav-item-active')}
                  >
                    <Icon
                      className="w-5 h-5 shrink-0"
                      strokeWidth={active ? 2.5 : 2}
                      fill={active ? 'currentColor' : 'none'}
                      fillOpacity={active ? 0.12 : 0}
                    />
                    <span className="truncate">{t(item.labelKey, item.fallback)}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {user?.role === 'ADMIN' && (
          <div>
            <p className="px-3.5 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Admin
            </p>
            <Link to="/admin/missions" className={cn('side-nav-item', location.pathname.startsWith('/admin') && 'side-nav-item-active')}>
              <Settings className="w-5 h-5 shrink-0" strokeWidth={2} />
              <span className="truncate">Admin Studio</span>
            </Link>
          </div>
        )}
      </nav>
    </aside>
  )
}
