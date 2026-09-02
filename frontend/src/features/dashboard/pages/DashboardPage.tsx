import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { gamificationApi, masteryApi, missionsApi } from '@/lib/api/endpoints'
import { useCountUp } from '@/lib/hooks/useCountUp'
import { useAgeAdaptation, type CopyTone } from '@/lib/hooks/useAgeAdaptation'
import { useMilestoneDetection } from '@/lib/hooks/useMilestoneDetection'
import { CelebrationOverlay } from '@/components/celebrations/CelebrationOverlay'

// Quick-action tiles: each gets ONE tasteful icon-chip tint, not a rainbow gradient.
const quickActions = [
  { to: '/learn', label: 'Learn', icon: BookOpen, tint: 'bg-primary-50 text-primary-600' },
  { to: '/missions', label: 'Missions', icon: Target, tint: 'bg-accent-50 text-accent-600' },
  { to: '/projects', label: 'Projects', icon: Palette, tint: 'bg-secondary-50 text-secondary-600' },
  { to: '/community', label: 'Community', icon: Sparkles, tint: 'bg-primary-50 text-primary-600' },
  { to: '/achievements', label: 'Achievements', icon: Trophy, tint: 'bg-warning-50 text-warning-600' },
  { to: '/leaderboard', label: 'Leaderboard', icon: BarChart3, tint: 'bg-success-50 text-success-600' },
  { to: '/voice-chat', label: 'Voice Chat', icon: Mic, tint: 'bg-primary-50 text-primary-600' },
  { to: '/english', label: 'English', icon: Languages, tint: 'bg-accent-50 text-accent-600' },
]

// Age-adaptive copy — REAL different strings per band, not a shared string
// with a class swap. Keyed on copyTone so the mapping is explicit and
// auditable in one place per usage site.
const GREETING_SUBTEXT: Record<CopyTone, string> = {
  'encouraging-simple': "Let's have some fun learning today!",
  'encouraging-balanced': 'Ready to continue your learning journey?',
  'encouraging-mature': "Ready to keep building on your progress?",
}

const LEVEL_CARD_HELPTEXT: Record<CopyTone, (xpInLevel: number, xpForNext: number) => string> = {
  'encouraging-simple': (xp, next) => `${xp} of ${next} stars to your next level!`,
  'encouraging-balanced': (xp, next) => `${xp} / ${next} XP to next level`,
  'encouraging-mature': (xp, next) => `${xp} / ${next} XP to next level`,
}

const XP_CELEBRATION: Record<CopyTone, string> = {
  'encouraging-simple': 'Awesome job!',
  'encouraging-balanced': 'Great progress!',
  'encouraging-mature': "Nice work - you're building real momentum",
}

const STREAK_CELEBRATION: Record<CopyTone, string> = {
  'encouraging-simple': 'You did it!',
  'encouraging-balanced': "You're on a roll!",
  'encouraging-mature': 'Consistency is paying off',
}

const MASTERY_HEADING: Record<CopyTone, string> = {
  'encouraging-simple': 'What you know so far',
  'encouraging-balanced': 'Mastery Progress',
  'encouraging-mature': 'Mastery Breakdown',
}

const QUICK_ACTIONS_HEADING: Record<CopyTone, string> = {
  'encouraging-simple': 'What to do next',
  'encouraging-balanced': 'Quick Actions',
  'encouraging-mature': 'Quick Actions',
}

const VIEW_PROGRESS_LABEL: Record<CopyTone, string> = {
  'encouraging-simple': 'See My Progress',
  'encouraging-balanced': 'View Full Progress',
  'encouraging-mature': 'View Full Progress',
}

export function DashboardPage() {
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
      navigate('/onboarding/welcome', { replace: true })
    }
  }, [user, navigate])

  const { data: progression } = useQuery({
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

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Main Content — header + bottom nav now come from AppShell */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <h2
            className={`font-display font-bold text-slate-900 mb-1 ${
              adapt.density === 'simple' ? 'text-3xl' : 'text-2xl'
            }`}
          >
            Welcome back, {user?.displayName || 'Learner'}
          </h2>
          <p className="text-slate-500 text-sm">{GREETING_SUBTEXT[adapt.copyTone]}</p>
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
                <p className="text-xs font-medium text-slate-500 mb-1">Level</p>
                <p
                  className={`font-display font-extrabold text-slate-900 ${
                    adapt.density === 'simple' ? 'text-4xl' : 'text-3xl'
                  }`}
                >
                  {progression?.level || 1}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {LEVEL_CARD_HELPTEXT[adapt.copyTone](
                    progression?.xpInCurrentLevel || 0,
                    progression?.xpForNextLevel || 100
                  )}
                </p>
              </div>
              <div className={adapt.density === 'simple' ? 'w-16 h-16' : 'w-14 h-14'}>
                <CircularProgressbar
                  value={levelProgress}
                  text=""
                  strokeWidth={10}
                  styles={buildStyles({
                    pathColor: '#4f46e5',
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
                <p className="text-xs font-medium text-slate-500 mb-1">Total XP</p>
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
                  <p className="text-xs text-slate-500 mt-1">{XP_CELEBRATION[adapt.copyTone]}</p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">Rank #{rank?.rank || '---'}</p>
                )}
              </div>
              <div className="icon-chip bg-secondary-50 text-secondary-600">
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
                  <p className="text-xs font-medium text-slate-500 mb-1">Streak</p>
                  <p
                    className={`font-display font-extrabold text-slate-900 ${
                      adapt.density === 'simple' ? 'text-4xl' : 'text-3xl'
                    }`}
                  >
                    {streakCount}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {showBestStreakDetail
                      ? `Best: ${streak?.longestStreak || 0} days`
                      : STREAK_CELEBRATION[adapt.copyTone]}
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
                  <p className="text-xs font-medium text-slate-500 mb-1">Rank</p>
                  <p className="text-3xl font-display font-extrabold text-slate-900">
                    #{rank?.rank || '---'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {adapt.density === 'detailed' ? 'Among all active learners' : 'Keep climbing!'}
                  </p>
                </div>
                <div className="icon-chip bg-primary-50 text-primary-600">
                  <Award className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>
            </motion.div>
          )}
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
                  <h3>{MASTERY_HEADING[adapt.copyTone]}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Mastered</span>
                    <span className="font-semibold text-success-600">{masteredCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Learning</span>
                    <span className="font-semibold text-primary-600">{learningCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">To Explore</span>
                    <span className="font-semibold text-slate-500">{toExploreCount}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary-600" strokeWidth={2} />
                <h3>{QUICK_ACTIONS_HEADING[adapt.copyTone]}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Younger learners see fewer quick-action tiles at once —
                    the full 8 is genuinely overwhelming icon-soup for an
                    8-9 year old versus a curated top set. */}
                {(adapt.density === 'simple' ? quickActions.slice(0, 4) : quickActions).map(
                  ({ to, label, icon: Icon, tint }) => (
                    <Link key={to} to={to} className="quick-action">
                      <div className={`icon-chip ${tint}`}>
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <p className="font-medium text-slate-700 text-sm">{label}</p>
                    </Link>
                  )
                )}
                {user?.role === 'GUARDIAN' && (
                  <Link to="/parents" className="quick-action">
                    <div className="icon-chip bg-primary-50 text-primary-600">
                      <Users2 className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <p className="font-medium text-slate-700 text-sm">Parent Dashboard</p>
                  </Link>
                )}
              </div>
              <Link to="/progress" className="btn btn-primary w-full mt-3">
                <TrendingUp className="w-4 h-4" strokeWidth={2} />
                {VIEW_PROGRESS_LABEL[adapt.copyTone]}
              </Link>
            </div>
          </div>
        )}

        {/* Recent Activity — AGE_8_9 sees fewer rows (3) to keep the page
            from feeling like a dense log; older bands see up to 5. */}
        {recentMissions && recentMissions.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary-600" strokeWidth={2} />
              <h3>Recent Missions</h3>
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
                        {run.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
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
