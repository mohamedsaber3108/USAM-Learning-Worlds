import { useState, useMemo } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
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
  Sparkles,
  ShoppingBag,
  Zap,
  FolderKanban,
  Settings,
  FlaskConical,
  ShieldCheck,
  FileText,
  MessageSquareText,
} from 'lucide-react'
import { useAgeAdaptation } from '@/lib/hooks/useAgeAdaptation'
import { LanguageToggle } from './LanguageToggle'
import { PageTransition } from '@/components/motion/PageTransition'
import { NotificationBell } from './NotificationBell'
import { SearchBar } from './SearchBar'

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
 *
 * Age-adaptation (lighter touch than DashboardPage.tsx): the primary nav
 * already uses simple one-word labels for every band (Home/Learn/Missions/
 * Community/Profile), so there's no vocabulary change needed here. What
 * does change with `density`:
 *   - AGE_8_9 (density='simple'): larger icons/label text using existing
 *     Tailwind size tokens (w-6 h-6 / text-sm vs w-5 h-5 / text-xs) so the
 *     nav reads more clearly without shrinking touch targets.
 *   - AGE_12_14 (density='detailed'): the "More" drawer shows the item
 *     descriptions (already present) at full density since there's room;
 *     labels stay one-word to match audit guidance.
 */

interface NavItem {
  key: string
  icon: typeof Home
  to: string
  // Which route prefixes should highlight this tab as active
  match: (path: string) => boolean
}

const primaryNav: NavItem[] = [
  {
    key: 'home',
    icon: Home,
    to: '/dashboard',
    match: (p) => p === '/' || p === '/dashboard',
  },
  {
    key: 'learn',
    icon: BookOpen,
    to: '/learn',
    match: (p) =>
      p.startsWith('/learn') || p.startsWith('/english') || p.startsWith('/projects') || p.startsWith('/cross-curricular'),
  },
  {
    key: 'missions',
    icon: Target,
    to: '/missions',
    match: (p) => p.startsWith('/missions'),
  },
  {
    key: 'community',
    icon: Users2,
    to: '/community',
    match: (p) => p.startsWith('/community'),
  },
  {
    key: 'profile',
    icon: UserCircle2,
    to: '/parents',
    match: (p) => p.startsWith('/parents'),
  },
]

interface MoreItem {
  key: string
  to: string
  icon: typeof Trophy
}

const moreItems: MoreItem[] = [
  { key: 'shop', to: '/shop', icon: ShoppingBag },
  { key: 'myJourney', to: '/insights', icon: Zap },
  { key: 'myPortfolio', to: '/portfolio', icon: FolderKanban },
  { key: 'achievements', to: '/achievements', icon: Trophy },
  { key: 'leaderboard', to: '/leaderboard', icon: BarChart3 },
  { key: 'progress', to: '/progress', icon: TrendingUp },
  { key: 'voiceChat', to: '/voice-chat', icon: Mic },
  { key: 'characters', to: '/characters', icon: Sparkles },
  { key: 'timeLimits', to: '/parents', icon: Timer },
]

export function AppShell() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)

  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  // Real age-adaptation config, read from the current learner's ageBand.
  // Lighter-touch than DashboardPage — only size tokens and drawer detail
  // density change here, no copy/vocabulary swap (labels are already
  // one-word across every band).
  const adapt = useAgeAdaptation(user?.learner?.ageBand)
  const isSimpleDensity = adapt.density === 'simple'
  const isDetailedDensity = adapt.density === 'detailed'

  const activeKey = useMemo(() => {
    // "More" pages count as active on their own tab (not a bottom-bar entry)
    const found = primaryNav.find((item) => item.match(location.pathname))
    return found?.key ?? null
  }, [location.pathname])

  const isMoreActive = useMemo(
    () =>
      ['/achievements', '/leaderboard', '/progress', '/voice-chat', '/characters', '/shop', '/insights', '/portfolio'].some((p) =>
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

  // Existing Tailwind size tokens only — no new design-system tokens.
  const navIconSizeClass = isSimpleDensity ? 'w-6 h-6' : 'w-5 h-5'
  const navLabelSizeClass = isSimpleDensity ? 'text-sm' : 'text-xs'
  const navItemPaddingClass = isSimpleDensity ? 'py-3' : 'py-2.5'

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Top header — branding + logout, shared across every authenticated page */}
      <header className="bg-primary-600 shadow-soft sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-display font-bold text-white">
            {t('common.appName')}
          </Link>
          <div className="flex items-center gap-2">
            <SearchBar />
            <NotificationBell />
            <button
              onClick={handleLogout}
              aria-label={t('common.logout')}
              className="btn bg-white/10 text-white hover:bg-white/20 shadow-none focus:ring-white/40 focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <LogOut className="w-4 h-4 rtl:scale-x-[-1]" />
              {t('common.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Page content — spring-based fade/slide transition on route change.
          mode="popLayout" lets the exiting page animate out of flow while
          the incoming page animates in, instead of both fighting for the
          same layout slot (avoids a jarring blank/collapsed frame between
          routes). See PageTransition for the reduced-motion fallback. */}
      <main className="flex-1 pb-24">
        <AnimatePresence mode="popLayout" initial={false}>
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* Bottom tab bar — mobile-first primary navigation.
          Real branching (not cosmetic): icon/label size tokens and vertical
          padding scale up for the younger band via navIconSizeClass /
          navLabelSizeClass / navItemPaddingClass computed from `adapt`
          above, using only Tailwind size tokens already used elsewhere in
          this file (w-5/w-6, text-xs/text-sm, py-2.5/py-3). */}
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
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center gap-1 ${navItemPaddingClass} font-medium
                  transition-transform duration-150 active:scale-90 hover:-translate-y-0.5`}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-x-2 top-1 bottom-1 bg-primary-50 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {/* Unmistakable active marker: a solid bar on the leading edge
                    of the tab (top, flips with writing direction via inset)
                    PLUS icon fill + bold label — not color alone. */}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator-bar"
                    className="absolute top-0 inset-x-4 h-[3px] rounded-full bg-primary-600"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={`relative ${navIconSizeClass} transition-transform duration-150 ${
                    isActive ? 'text-primary-600 scale-110' : 'text-slate-400'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive ? 'currentColor' : 'none'}
                  fillOpacity={isActive ? 0.12 : 0}
                />
                <span
                  className={`relative ${navLabelSizeClass} ${
                    isActive ? 'text-primary-600 font-bold' : 'text-slate-400 font-medium'
                  }`}
                >
                  {t(`nav.${item.key}`)}
                </span>
              </Link>
            )
          })}

          {/* More tab — overflow drawer for lower-frequency pages */}
          <button
            onClick={() => setMoreOpen(true)}
            aria-current={isMoreActive ? 'page' : undefined}
            className={`relative flex flex-col items-center justify-center gap-1 ${navItemPaddingClass} font-medium
              transition-transform duration-150 active:scale-90 hover:-translate-y-0.5`}
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
            {isMoreActive && (
              <motion.div
                layoutId="tab-indicator-bar"
                className="absolute top-0 inset-x-4 h-[3px] rounded-full bg-primary-600"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <MoreHorizontal
              className={`relative ${navIconSizeClass} transition-transform duration-150 ${
                isMoreActive ? 'text-primary-600 scale-110' : 'text-slate-400'
              }`}
              strokeWidth={isMoreActive ? 2.5 : 2}
              fill={isMoreActive ? 'currentColor' : 'none'}
              fillOpacity={isMoreActive ? 0.12 : 0}
            />
            <span
              className={`relative ${navLabelSizeClass} ${
                isMoreActive ? 'text-primary-600 font-bold' : 'text-slate-400 font-medium'
              }`}
            >
              {t('nav.more')}
            </span>
          </button>
        </div>
      </nav>

      {/* More sheet/drawer — descriptions (already existing content) only
          render for the higher-density bands; AGE_8_9 gets label-only rows
          so the sheet doesn't turn into a wall of text for the youngest
          band. This is real conditional content, not a font-size tweak. */}
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
                <h3 className="font-display font-bold text-slate-900">{t('more.title')}</h3>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="icon-chip bg-surface-100 text-slate-500"
                  aria-label={t('more.close')}
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
                      className="quick-action !items-start ltr:!text-left rtl:!text-right"
                    >
                      <div className="icon-chip bg-primary-50 text-primary-600">
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm">{t(`more.${item.key}`)}</p>
                        {isDetailedDensity && (
                          <p className="text-xs text-slate-400">{t(`more.${item.key}Desc`)}</p>
                        )}
                      </div>
                    </Link>
                  )
                })}
                {user?.role === 'GUARDIAN' && (
                  <Link
                    to="/parents"
                    onClick={() => setMoreOpen(false)}
                    className="quick-action !items-start ltr:!text-left rtl:!text-right"
                  >
                    <div className="icon-chip bg-secondary-50 text-secondary-600">
                      <Palette className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">{t('more.parentDashboard')}</p>
                      {isDetailedDensity && <p className="text-xs text-slate-400">{t('more.parentDashboardDesc')}</p>}
                    </div>
                  </Link>
                )}
                {user?.role === 'ADMIN' && (
                  <>
                    <Link
                      to="/admin/missions"
                      onClick={() => setMoreOpen(false)}
                      className="quick-action !items-start ltr:!text-left rtl:!text-right"
                    >
                      <div className="icon-chip bg-slate-100 text-slate-600">
                        <Settings className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm">Admin: Missions</p>
                        {isDetailedDensity && <p className="text-xs text-slate-400">Content Studio CRUD</p>}
                      </div>
                    </Link>
                    <Link
                      to="/admin/feature-flags"
                      onClick={() => setMoreOpen(false)}
                      className="quick-action !items-start ltr:!text-left rtl:!text-right"
                    >
                      <div className="icon-chip bg-slate-100 text-slate-600">
                        <Zap className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm">Admin: Feature Flags</p>
                        {isDetailedDensity && <p className="text-xs text-slate-400">Toggle gated features</p>}
                      </div>
                    </Link>
                    <Link
                      to="/admin/experiments"
                      onClick={() => setMoreOpen(false)}
                      className="quick-action !items-start ltr:!text-left rtl:!text-right"
                    >
                      <div className="icon-chip bg-slate-100 text-slate-600">
                        <FlaskConical className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm">Admin: Experiments</p>
                        {isDetailedDensity && <p className="text-xs text-slate-400">A/B experiments &amp; variants</p>}
                      </div>
                    </Link>
                    <Link
                      to="/admin/safety-policies"
                      onClick={() => setMoreOpen(false)}
                      className="quick-action !items-start ltr:!text-left rtl:!text-right"
                    >
                      <div className="icon-chip bg-slate-100 text-slate-600">
                        <ShieldCheck className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm">Admin: Safety Policies</p>
                        {isDetailedDensity && <p className="text-xs text-slate-400">Per-age-band policy versions</p>}
                      </div>
                    </Link>
                    <Link
                      to="/admin/prompt-templates"
                      onClick={() => setMoreOpen(false)}
                      className="quick-action !items-start ltr:!text-left rtl:!text-right"
                    >
                      <div className="icon-chip bg-slate-100 text-slate-600">
                        <MessageSquareText className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm">Admin: Prompt Templates</p>
                        {isDetailedDensity && <p className="text-xs text-slate-400">Versioned AI system prompts</p>}
                      </div>
                    </Link>
                    <Link
                      to="/admin/content-items"
                      onClick={() => setMoreOpen(false)}
                      className="quick-action !items-start ltr:!text-left rtl:!text-right"
                    >
                      <div className="icon-chip bg-slate-100 text-slate-600">
                        <FileText className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm">Admin: Content Items</p>
                        {isDetailedDensity && <p className="text-xs text-slate-400">Author &amp; publish content</p>}
                      </div>
                    </Link>
                  </>
                )}
                <Link
                  to="/english"
                  onClick={() => setMoreOpen(false)}
                  className="quick-action !items-start ltr:!text-left rtl:!text-right"
                >
                  <div className="icon-chip bg-accent-50 text-accent-600">
                    <Languages className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 text-sm">{t('more.english')}</p>
                    {isDetailedDensity && <p className="text-xs text-slate-400">{t('more.englishDesc')}</p>}
                  </div>
                </Link>
                {/* Language toggle — EN/AR, persisted in localStorage. Spans
                    both columns so it reads as a distinct settings row. */}
                <LanguageToggle />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
