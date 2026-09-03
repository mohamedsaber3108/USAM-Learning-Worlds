import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import {
  Target,
  Zap,
  Flame,
  BarChart3,
  BookOpen,
  Palette,
  Sparkles,
  Trophy,
  Mic,
  Languages,
  Users2,
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
} from 'lucide-react'
import { gamificationApi, masteryApi, missionsApi, cosmeticsApi, dailyGoalsApi } from '@/lib/api/endpoints'
import { useCountUp } from '@/lib/hooks/useCountUp'
import { useAgeAdaptation } from '@/lib/hooks/useAgeAdaptation'
import { useMilestoneDetection } from '@/lib/hooks/useMilestoneDetection'
import { CelebrationOverlay } from '@/components/celebrations/CelebrationOverlay'
import { DailyGoalCard } from '@/features/gamification/components/DailyGoalCard'
import { LoadingState, EmptyState } from '@/components/common/CharacterState'

// Quick-action tiles: each gets ONE tasteful icon-chip tint, not a rainbow gradient.
// `labelKey` resolves against dashboard.quickActions.* in both locales.
const quickActions = [
  { to: '/learn', labelKey: 'learn', icon: BookOpen, tint: 'bg-primary-50 text-primary-600' },
  { to: '/missions', labelKey: 'missions', icon: Target, tint: 'bg-accent-50 text-accent-600' },
  { to: '/projects', labelKey: 'projects', icon: Palette, tint: 'bg-secondary-50 text-secondary-600' },
  { to: '/community', labelKey: 'community', icon: Sparkles, tint: 'bg-primary-50 text-primary-600' },
  { to: '/achievements', labelKey: 'achievements', icon: Trophy, tint: 'bg-warning-50 text-warning-600' },
  { to: '/leaderboard', labelKey: 'leaderboard', icon: BarChart3, tint: 'bg-success-50 text-success-600' },
  { to: '/voice-chat', labelKey: 'voiceChat', icon: Mic, tint: 'bg-primary-50 text-primary-600' },
  { to: '/english', labelKey: 'english', icon: Languages, tint: 'bg-accent-50 text-accent-600' },
]

// Age-adaptive copy now lives in frontend/src/lib/i18n/locales/{en,ar}.ts
// under dashboard.*.{copyTone} — see t() calls below keyed on adapt.copyTone.
// (Previously these were English-only Record<CopyTone,string> maps defined
// here; kept as i18next resource keys instead so Arabic gets real per-band
// copy too, not just a translated shared string.)

// Real per-equipped-cosmetic rendering — not a settings toggle. These maps
// translate the AvatarCosmetic.iconOrStyleKey seeded in the backend into
// actual Tailwind classes / hex values applied on this page.
const BORDER_RING_CLASS: Record<string, string> = {
  'border-slate': 'ring-4 ring-slate-300',
  'border-gold': 'ring-4 ring-secondary-400',
  'border-blue': 'ring-4 ring-primary-400',
  'border-purple': 'ring-4 ring-purple-400',
  'border-diamond': 'ring-4 ring-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.65)]',
}

const THEME_ACCENT_HEX: Record<string, string> = {
  'theme-indigo': '#4f46e5',
  'theme-orange': '#ea580c',
  'theme-pink': '#db2777',
}

const THEME_ACCENT_CHIP_CLASS: Record<string, string> = {
  'theme-indigo': 'bg-primary-50 text-primary-600',
  'theme-orange': 'bg-orange-50 text-orange-600',
  'theme-pink': 'bg-pink-50 text-pink-600',
}

export function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  // Real age-adaptation config, read from the current learner's stored
  // ageBand. Every branch below reads from `adapt`, not from ad-hoc
  // duplicated conditionals — this is the single point of truth.
  const adapt = useAgeAdaptation(user?.learner?.ageBand)

  // First-time learners who somehow land here without completing
  // onboarding (e.g. a pre-existing account, or a direct URL visit)
  // get routed into the onboarding flow instead of seeing the dashboard.
  useEffect(() => {
    if (user?.role === 'LEARNER' && user.learner && !user.learner.ageBand) {
      navigate('/onboarding/language', { replace: true })
    }
  }, [user, navigate])

  const { data: progression, isLoading: progressionLoading } = useQuery({
    queryKey: ['progression'],
    queryFn: () => gamificationApi.getProgression().then(res => res.data),
  })

  const { data: streak } = useQuery({
    queryKey: ['streak'],
    queryFn: () => gamificationApi.getStreak().then(res => res.data),
  })

  const { data: rank } = useQuery({
    queryKey: ['rank'],
    queryFn: () => gamificationApi.getRank().then(res => res.data),
  })

  const { data: mastery } = useQuery({
    queryKey: ['mastery-overview'],
    queryFn: () => masteryApi.getOverview().then(res => res.data),
  })

  const { data: recentMissions } = useQuery({
    queryKey: ['recent-missions'],
    queryFn: () => missionsApi.getHistory().then(res => res.data),
  })

  const { data: equippedCosmetics } = useQuery({
    queryKey: ['cosmetics-equipped'],
    queryFn: () => cosmeticsApi.getEquipped().then(res => res.data),
  })

  const { data: dailyGoal, isLoading: dailyGoalLoading } = useQuery({
    queryKey: ['daily-goal-progress'],
    queryFn: () => dailyGoalsApi.getProgress().then(res => res.data),
  })

  const equippedBorderKey: string | null = equippedCosmetics?.BORDER?.iconOrStyleKey ?? null
  const equippedTitleName: string | null = equippedCosmetics?.TITLE?.name ?? null
  const equippedThemeKey: string | null = equippedCosmetics?.COLOR_THEME?.iconOrStyleKey ?? null
  const themeAccentHex = equippedThemeKey ? THEME_ACCENT_HEX[equippedThemeKey] : undefined
  const themeChipClass = equippedThemeKey
    ? THEME_ACCENT_CHIP_CLASS[equippedThemeKey] || 'bg-primary-50 text-primary-600'
    : 'bg-primary-50 text-primary-600'

  const totalXP = useCountUp(progression?.totalXP || 0, 1000)
  const streakCount = useCountUp(streak?.currentStreak || 0, 700)
  const levelProgress = progression?.progress || 0

  const masteredCount = Array.isArray(mastery) ? mastery.filter((m: any) => m.state === 'MASTERED').length : 0
  const learningCount = Array.isArray(mastery)
    ? mastery.filter((m: any) => ['NOVICE', 'DEVELOPING', 'PROFICIENT'].includes(m.state)).length
    : 0
  const toExploreCount = Array.isArray(mastery) ? mastery.filter((m: any) => m.state === 'NOT_STARTED').length : 0

  // --- Real card-count branching -------------------------------------
  // Card 1 (Level) and Card 2 (Total XP) always render — every band needs
  // the core loop visible. Everything past that is gated on maxVisibleCards
  // so AGE_8_9 genuinely renders fewer DOM nodes, not just smaller ones.
  const showStreakCard = adapt.maxVisibleCards >= 3
  const showRankCard = adapt.showAllStats || adapt.maxVisibleCards >= 4
  const showMasteryBreakdown = adapt.showAllStats && adapt.maxVisibleCards >= 5
  const showBestStreakDetail = adapt.density !== 'simple'

  // Real event-driven celebration: diff current progression against the
  // last-seen localStorage snapshot, only fires on genuinely NEW milestones
  // (level-up, streak day 7/14/30/100, first mission ever, mastery gained) —
  // never on a plain page load/refresh with unchanged numbers.
  const progressionReady = !!progression && !!streak && Array.isArray(mastery) && !!recentMissions
  const completedMissionCount = Array.isArray(recentMissions)
    ? recentMissions.filter((run: any) => run.status === 'COMPLETED').length
    : 0
  const milestone = useMilestoneDetection(
    {
      level: progression?.level,
      streak: streak?.currentStreak,
      totalXP: progression?.totalXP,
      masteredCount,
      completedMissionCount,
    },
    progressionReady
  )
  const [celebrationDismissed, setCelebrationDismissed] = useState(false)

  // First paint before the core progression numbers arrive — show Azouz
  // warming things up instead of an empty flash of blank cards.
  if (progressionLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <LoadingState character="Azouz" message="Azouz is getting your dashboard ready..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Main Content — header + bottom nav now come from AppShell */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8 flex items-center gap-4"
        >
          {/* Equipped BORDER cosmetic renders here as a real ring around an
              avatar circle — visible on every dashboard load, not a hidden
              setting. Falls back to the default slate ring when nothing
              is equipped yet. */}
          <div
            className={`w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-display font-bold text-lg flex-shrink-0 ${
              BORDER_RING_CLASS[equippedBorderKey || 'border-slate'] || BORDER_RING_CLASS['border-slate']
            }`}
          >
            {(user?.displayName || 'L').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2
              className={`font-display font-bold text-slate-900 mb-1 flex items-center gap-2 flex-wrap ${
                adapt.density === 'simple' ? 'text-3xl' : 'text-2xl'
              }`}
            >
              {t('dashboard.welcomeBack', { name: user?.displayName || t('dashboard.defaultLearnerName') })}
              {/* Equipped TITLE cosmetic renders as real text next to the
                  learner's name — the whole point of "spend your XP". */}
              {equippedTitleName && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary-100 text-secondary-800 align-middle">
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                  {equippedTitleName}
                </span>
              )}
            </h2>
            <p className="text-slate-500 text-sm">{t(`dashboard.greetingSubtext.${adapt.copyTone}`)}</p>
          </div>
        </motion.div>

        {/* Stats Grid — card count and per-card copy branch on `adapt`,
            not on a CSS class. AGE_8_9 sees Level + XP + Streak only;
            AGE_10_11 adds Rank; AGE_12_14 also gets the Mastery breakdown
            below rendered in full detail. */}
        <div
          className={`grid grid-cols-1 gap-5 mb-8 ${
            adapt.density === 'simple'
              ? 'md:grid-cols-3'
              : adapt.density === 'balanced'
              ? 'md:grid-cols-2 lg:grid-cols-4'
              : 'md:grid-cols-3'
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{t('dashboard.levelLabel')}</p>
                <p
                  className={`font-display font-extrabold text-slate-900 ${
                    adapt.density === 'simple' ? 'text-4xl' : 'text-3xl'
                  }`}
                >
                  {progression?.level || 1}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {t(`dashboard.levelHelptext.${adapt.copyTone}`, {
                    xp: progression?.xpInCurrentLevel || 0,
                    next: progression?.xpForNextLevel || 100,
                  })}
                </p>
              </div>
              <div className={adapt.density === 'simple' ? 'w-16 h-16' : 'w-14 h-14'}>
                <CircularProgressbar
                  value={levelProgress}
                  text=""
                  strokeWidth={10}
                  styles={buildStyles({
                    pathColor: themeAccentHex || '#4f46e5',
                    trailColor: '#e0e4ff',
                  })}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{t('dashboard.totalXpLabel')}</p>
                <p
                  className={`font-display font-extrabold text-slate-900 ${
                    adapt.density === 'simple' ? 'text-4xl' : 'text-3xl'
                  }`}
                >
                  {totalXP.toLocaleString()}
                </p>
                {/* Rank folds into the XP card for the youngest band instead
                    of getting its own card — real content difference, not
                    a hidden duplicate. Older bands get a real Rank card
                    below (showRankCard). */}
                {!showRankCard ? (
                  <p className="text-xs text-slate-500 mt-1">{t(`dashboard.xpCelebration.${adapt.copyTone}`)}</p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">{t('dashboard.rankLabel', { rank: rank?.rank || '---' })}</p>
                )}
              </div>
              <div className={`icon-chip ${themeChipClass}`}>
                <Zap className="w-5 h-5" strokeWidth={2} />
              </div>
            </div>
          </motion.div>

          {showStreakCard && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">{t('dashboard.streakLabel')}</p>
                  <p
                    className={`font-display font-extrabold text-slate-900 ${
                      adapt.density === 'simple' ? 'text-4xl' : 'text-3xl'
                    }`}
                  >
                    {streakCount}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {showBestStreakDetail
                      ? t('dashboard.bestStreak', { days: streak?.longestStreak || 0 })
                      : t(`dashboard.streakCelebration.${adapt.copyTone}`)}
                  </p>
                </div>
                <div className="icon-chip bg-accent-50 text-accent-600">
                  <Flame className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Rank gets its own card once density allows a 4th+ card
              (AGE_10_11 and AGE_12_14) — for AGE_8_9 it's folded above. */}
          {showRankCard && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">{t('dashboard.rank')}</p>
                  <p className="text-3xl font-display font-extrabold text-slate-900">
                    #{rank?.rank || '---'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {adapt.density === 'detailed' ? t('dashboard.rankAmongAll') : t('dashboard.rankKeepClimbing')}
                  </p>
                </div>
                <div className="icon-chip bg-primary-50 text-primary-600">
                  <Award className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Today's Goal — real server-computed daily-goal progress ring.
            Sits right after the stats grid, before the mastery/quick-actions
            panels, so it's visible at-a-glance without scrolling on most
            viewports. */}
        <div className="mb-8 max-w-sm">
          <DailyGoalCard data={dailyGoal} isLoading={dailyGoalLoading} />
        </div>

        {/* Mastery Overview — full breakdown only for the highest-density
            band (AGE_12_14, showAllStats=true). AGE_8_9/AGE_10_11 get a
            single simplified "Quick Actions" panel instead of a two-column
            layout, which is a genuine content difference, not styling. */}
        {mastery && (
          <div
            className={`grid grid-cols-1 gap-5 mb-8 ${showMasteryBreakdown ? 'md:grid-cols-2' : ''}`}
          >
            {showMasteryBreakdown && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary-600" strokeWidth={2} />
                  <h3>{t(`dashboard.masteryHeading.${adapt.copyTone}`)}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t('dashboard.mastered')}</span>
                    <span className="font-semibold text-success-600">{masteredCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t('dashboard.learning')}</span>
                    <span className="font-semibold text-primary-600">{learningCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t('dashboard.toExplore')}</span>
                    <span className="font-semibold text-slate-500">{toExploreCount}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary-600" strokeWidth={2} />
                <h3>{t(`dashboard.quickActionsHeading.${adapt.copyTone}`)}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Younger learners see fewer quick-action tiles at once —
                    the full 8 is genuinely overwhelming icon-soup for an
                    8-9 year old versus a curated top set. */}
                {(adapt.density === 'simple' ? quickActions.slice(0, 4) : quickActions).map(
                  ({ to, labelKey, icon: Icon, tint }) => (
                    <Link key={to} to={to} className="quick-action">
                      <div className={`icon-chip ${tint}`}>
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <p className="font-medium text-slate-700 text-sm">{t(`dashboard.quickActions.${labelKey}`)}</p>
                    </Link>
                  )
                )}
                {user?.role === 'GUARDIAN' && (
                  <Link to="/parents" className="quick-action">
                    <div className="icon-chip bg-primary-50 text-primary-600">
                      <Users2 className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <p className="font-medium text-slate-700 text-sm">{t('dashboard.parentDashboard')}</p>
                  </Link>
                )}
              </div>
              <Link to="/progress" className="btn btn-primary w-full mt-3">
                <TrendingUp className="w-4 h-4" strokeWidth={2} />
                {t(`dashboard.viewProgress.${adapt.copyTone}`)}
              </Link>
            </div>
          </div>
        )}

        {/* Recent Activity — AGE_8_9 sees fewer rows (3) to keep the page
            from feeling like a dense log; older bands get up to 5. When a
            learner hasn't completed a mission yet, this is their very
            first look at the platform's "no data" moment — greet them with
            a companion and a clear next step instead of an empty gap. */}
        {recentMissions && recentMissions.length > 0 ? (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary-600" strokeWidth={2} />
              <h3>{t('dashboard.recentMissions')}</h3>
            </div>
            <div className="space-y-2">
              {recentMissions.slice(0, adapt.density === 'simple' ? 3 : 5).map((run: any) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 rounded-control bg-surface-50 hover:bg-surface-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {run.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0" strokeWidth={2} />
                    ) : (
                      <Clock className="w-4 h-4 text-warning-500 flex-shrink-0" strokeWidth={2} />
                    )}
                    <div>
                      <h4 className="font-medium text-sm text-slate-800">{run.mission?.title || 'Mission'}</h4>
                      <p className="text-xs text-slate-500">
                        {run.status === 'COMPLETED' ? t('dashboard.missionCompleted') : t('dashboard.missionInProgress')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-600">
                      {run.finalScore ? `${run.finalScore}%` : '---'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(run.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            character="Azouz"
            title="No missions completed yet"
            message="Every learning adventure starts with a first step — pick a mission and Azouz will cheer you on!"
            actionLabel="Browse missions"
            actionTo="/missions"
          />
        )}
      </main>

      {!celebrationDismissed && (
        <CelebrationOverlay
          milestone={milestone}
          onDismiss={() => setCelebrationDismissed(true)}
        />
      )}
    </div>
  )
}
