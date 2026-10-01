import {
  Home, BookOpen, Gamepad2, UserCircle2, Globe2, FolderKanban,
  Mic, Trophy, BarChart3, TrendingUp, Sparkles, ShoppingBag, Zap, Crown, Timer,
  Languages, ShieldCheck,
} from 'lucide-react'

/**
 * Age-adaptive navigation model (Phase C, Product Bible §3 + Page/Flow Inventory).
 *
 * Navigation DESTINATIONS change by band, not just icon sizes:
 *  - 7–9  (band 'young'):   minimal, iconic, voice-forward — Home · Learn · Play · Voice · Me
 *  - 10–12 (band 'mid'):    adds Worlds + Projects
 *  - 13–15 (band 'older'):  fuller set + search affordance
 *  - Parent:                a DISTINCT shell (dashboard-oriented), never the child nav
 *
 * This is the single source of truth both the desktop pill nav and the mobile
 * bottom bar render from, so the two never drift. `key` resolves to `nav.<key>`
 * in i18n; `match` decides active state.
 */
export type NavBand = 'young' | 'mid' | 'older' | 'parent'

export interface NavEntry {
  key: string
  icon: typeof Home
  to: string
  match: (path: string) => boolean
  /** Primary = bottom bar / pill; secondary = "More" drawer. */
  placement: 'primary' | 'secondary'
}

const isHome = (p: string) => p === '/' || p === '/dashboard'

// --- Child entries (superset; each band selects a subset as primary) ---
const HOME: NavEntry = { key: 'home', icon: Home, to: '/dashboard', match: isHome, placement: 'primary' }
const LEARN: NavEntry = {
  key: 'learn', icon: BookOpen, to: '/learn', placement: 'primary',
  // Highlights for the Learn hub AND the 4 domain surfaces reached from it:
  // /learn*, /learning/domains/:slug/path, and each domain's own tool route
  // (english/coding/cross-curricular for AI & Entrepreneurship).
  match: (p) =>
    p.startsWith('/learn') ||
    p.startsWith('/english') ||
    p.startsWith('/coding') ||
    p.startsWith('/cross-curricular'),
}
const PLAY: NavEntry = {
  key: 'play', icon: Gamepad2, to: '/missions', placement: 'primary',
  match: (p) => p.startsWith('/missions') || p.startsWith('/simulations') || p.startsWith('/stories'),
}
const VOICE: NavEntry = { key: 'voiceChat', icon: Mic, to: '/voice-chat', match: (p) => p.startsWith('/voice-chat'), placement: 'primary' }
const ME: NavEntry = { key: 'profile', icon: UserCircle2, to: '/profile', match: (p) => p.startsWith('/profile') || p.startsWith('/settings'), placement: 'primary' }
const WORLDS: NavEntry = { key: 'worlds', icon: Globe2, to: '/worlds', match: (p) => p.startsWith('/worlds'), placement: 'primary' }
const PROJECTS: NavEntry = { key: 'projects', icon: FolderKanban, to: '/projects', match: (p) => p.startsWith('/projects') || p.startsWith('/portfolio'), placement: 'primary' }

// --- Secondary (More drawer) child entries ---
const SECONDARY_CHILD: NavEntry[] = [
  WORLDS, PROJECTS,
  { key: 'balanced', icon: Sparkles, to: '/balanced', match: (p) => p.startsWith('/balanced'), placement: 'secondary' },
  { key: 'achievements', icon: Trophy, to: '/achievements', match: (p) => p.startsWith('/achievements'), placement: 'secondary' },
  { key: 'progress', icon: TrendingUp, to: '/progress', match: (p) => p.startsWith('/progress') || p.startsWith('/insights'), placement: 'secondary' },
  { key: 'leaderboard', icon: BarChart3, to: '/leaderboard', match: (p) => p.startsWith('/leaderboard'), placement: 'secondary' },
  { key: 'characters', icon: Sparkles, to: '/characters', match: (p) => p.startsWith('/characters'), placement: 'secondary' },
  { key: 'shop', icon: ShoppingBag, to: '/shop', match: (p) => p.startsWith('/shop'), placement: 'secondary' },
  { key: 'myJourney', icon: Zap, to: '/insights', match: (p) => p.startsWith('/insights'), placement: 'secondary' },
  { key: 'plans', icon: Crown, to: '/plans', match: (p) => p.startsWith('/plans'), placement: 'secondary' },
]

// --- Parent shell (distinct) ---
const PARENT_PRIMARY: NavEntry[] = [
  { key: 'parentDashboard', icon: Home, to: '/parents', match: (p) => p === '/parents', placement: 'primary' },
  { key: 'progress', icon: TrendingUp, to: '/parents', match: (p) => p.startsWith('/parents/children') && p.includes('progress'), placement: 'primary' },
  { key: 'plans', icon: Crown, to: '/plans', match: (p) => p.startsWith('/plans'), placement: 'primary' },
  { key: 'profile', icon: UserCircle2, to: '/settings', match: (p) => p.startsWith('/settings'), placement: 'primary' },
]
const PARENT_SECONDARY: NavEntry[] = [
  { key: 'timeLimits', icon: Timer, to: '/parents', match: (p) => p.includes('time-limits'), placement: 'secondary' },
  { key: 'safety', icon: ShieldCheck, to: '/parents', match: (p) => p.includes('privacy'), placement: 'secondary' },
  { key: 'language', icon: Languages, to: '/settings', match: () => false, placement: 'secondary' },
]

/** Map a backend AgeBand to a nav band. */
export function ageBandToNavBand(ageBand: string | undefined | null): NavBand {
  switch (ageBand) {
    case 'AGE_8_9': return 'young'
    case 'AGE_10_11': return 'mid'
    case 'AGE_12_14': return 'older'
    default: return 'mid' // sensible default when unknown
  }
}

export interface NavModel {
  primary: NavEntry[]
  secondary: NavEntry[]
  showSearch: boolean
}

/** The navigation model for a given band. Parent overrides everything. */
export function getNavModel(band: NavBand): NavModel {
  if (band === 'parent') {
    return { primary: PARENT_PRIMARY, secondary: PARENT_SECONDARY, showSearch: false }
  }
  if (band === 'young') {
    // Minimal + voice-forward, no search (reading load).
    return { primary: [HOME, LEARN, PLAY, VOICE, ME], secondary: SECONDARY_CHILD, showSearch: false }
  }
  if (band === 'mid') {
    // Adds Worlds + Projects.
    return { primary: [HOME, LEARN, PLAY, WORLDS, PROJECTS, ME], secondary: SECONDARY_CHILD, showSearch: false }
  }
  // older: fuller + search.
  return { primary: [HOME, LEARN, PLAY, WORLDS, PROJECTS, ME], secondary: SECONDARY_CHILD, showSearch: true }
}
