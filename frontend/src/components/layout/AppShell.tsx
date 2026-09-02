import { useState, useMemo } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Home,
  BookOpen,
  Target,
  Users2,
  UserCircle2,
  MoreHorizontal,
  Trophy,
  BarChart3,
  TrendingUp,
  Mic,
  Timer,
  LogOut,
  X,
  Languages,
  Palette,
} from 'lucide-react'

/**
 * AppShell — the one persistent navigation frame for every authenticated page.
 *
 * Structure:
 *  - Top header: branding + logout (kept from the previous per-page header)
 *  - Bottom tab bar (mobile-first, 5 primary destinations) with an animated
 *    sliding active-pill indicator
 *  - "More" tab opens a bottom sheet/drawer for lower-frequency pages
 *    (Achievements, Leaderboard, Progress, Voice Chat, Time Limits)
 *  - Page content renders via <Outlet /> with a subtle fade/slide transition
 *    keyed on the route path
 */

interface NavItem {
  key: string
  label: string
  icon: typeof Home
  to: string
  // Which route prefixes should highlight this tab as active
  match: (path: string) => boolean
}

const primaryNav: NavItem[] = [
  {
    key: 'home',
    label: 'Home',
    icon: Home,
    to: '/dashboard',
    match: (p) => p === '/' || p === '/dashboard',
  },
  {
    key: 'learn',
    label: 'Learn',
    icon: BookOpen,
    to: '/learn',
    match: (p) =>
      p.startsWith('/learn') || p.startsWith('/english') || p.startsWith('/projects'),
  },
  {
    key: 'missions',
    label: 'Missions',
    icon: Target,
    to: '/missions',
    match: (p) => p.startsWith('/missions'),
  },
  {
    key: 'community',
    label: 'Community',
    icon: Users2,
    to: '/community',
    match: (p) => p.startsWith('/community'),
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: UserCircle2,
    to: '/parents',
    match: (p) => p.startsWith('/parents'),
  },
]

interface MoreItem {
  label: string
  to: string
  icon: typeof Trophy
  description: string
}

const moreItems: MoreItem[] = [
  { label: 'Achievements', to: '/achievements', icon: Trophy, description: 'Badges & milestones' },
  { label: 'Leaderboard', to: '/leaderboard', icon: BarChart3, description: 'See how you rank' },
  { label: 'Progress', to: '/progress', icon: TrendingUp, description: 'Your mastery over time' },
  { label: 'Voice Chat', to: '/voice-chat', icon: Mic, description: 'Talk with your AI coach' },
  { label: 'Time Limits', to: '/parents', icon: Timer, description: "Manage a learner's screen time (via Parent Dashboard)" },
]

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)

  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  const activeKey = useMemo(() => {
    // "More" pages count as active on their own tab (not a bottom-bar entry)
    const found = primaryNav.find((item) => item.match(location.pathname))
    return found?.key ?? null
  }, [location.pathname])

  const isMoreActive = useMemo(
    () =>
      ['/achievements', '/leaderboard', '/progress', '/voice-chat'].some((p) =>
        location.pathname.startsWith(p)
      ) || location.pathname.startsWith('/parents/children'),
    [location.pathname]
  )

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Top header — branding + logout, shared across every authenticated page */}
      <header className="bg-primary-600 shadow-soft sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-display font-bold text-white">
            USAM Learning Worlds
          </Link>
          <button
            onClick={handleLogout}
            className="btn bg-white/10 text-white hover:bg-white/20 shadow-none focus:ring-white/40"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Page content — subtle fade/slide transition on route change */}
      <main className="flex-1 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom tab bar — mobile-first primary navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-200
          shadow-[0_-4px_16px_rgba(15,23,42,0.06)] pb-[env(safe-area-inset-bottom)]"
        aria-label="Primary"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-6 relative">
          {primaryNav.map((item) => {
            const isActive = activeKey === item.key
            const Icon = item.icon
            return (
              <Link
                key={item.key}
                to={item.to}
                className="relative flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-x-2 top-1 bottom-1 bg-primary-50 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={`relative w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`}
                  strokeWidth={2}
                />
                <span className={`relative ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* More tab — overflow drawer for lower-frequency pages */}
          <button
            onClick={() => setMoreOpen(true)}
            className="relative flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium"
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
          >
            {isMoreActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-x-2 top-1 bottom-1 bg-primary-50 rounded-xl"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <MoreHorizontal
              className={`relative w-5 h-5 ${isMoreActive ? 'text-primary-600' : 'text-slate-400'}`}
              strokeWidth={2}
            />
            <span className={`relative ${isMoreActive ? 'text-primary-600' : 'text-slate-400'}`}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* More sheet/drawer */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-slate-900/40 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-soft-md
                max-w-6xl mx-auto p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              role="dialog"
              aria-label="More navigation"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-slate-900">More</h3>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="icon-chip bg-surface-100 text-slate-500"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {moreItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMoreOpen(false)}
                      className="quick-action !items-start !text-left"
                    >
                      <div className="icon-chip bg-primary-50 text-primary-600">
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.description}</p>
                      </div>
                    </Link>
                  )
                })}
                {user?.role === 'GUARDIAN' && (
                  <Link
                    to="/parents"
                    onClick={() => setMoreOpen(false)}
                    className="quick-action !items-start !text-left"
                  >
                    <div className="icon-chip bg-secondary-50 text-secondary-600">
                      <Palette className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">Parent Dashboard</p>
                      <p className="text-xs text-slate-400">Guardian controls</p>
                    </div>
                  </Link>
                )}
                <Link
                  to="/english"
                  onClick={() => setMoreOpen(false)}
                  className="quick-action !items-start !text-left"
                >
                  <div className="icon-chip bg-accent-50 text-accent-600">
                    <Languages className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 text-sm">English</p>
                    <p className="text-xs text-slate-400">Strands & AI coach</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
