import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { RotateCcw, Target, Rocket, RefreshCw, Palette, Flame, CheckCircle2 } from 'lucide-react'
import { adaptiveApi, masteryApi, dailyGoalsApi } from '@/lib/api/endpoints'
import { CharacterFace } from '@/features/characters/components/CharacterFace'

/**
 * DiscoverRail — replaces the stacked-card "widgets" pattern (ReviewDueCard +
 * RecommendationsSection + DailyGoalCard as four independent full-width
 * sections) with ONE horizontally-scrolling rail of same-shaped quest tiles,
 * under a single Azouz-voiced heading.
 *
 * This is the fix for the standing critique that Home still reads as
 * NAVBAR → HERO → WIDGETS below the fold: four stacked cards with four
 * separate headings is a dashboard pattern no matter how each card is
 * individually styled. A rail of quest tiles (same grammar as the world
 * portals above it) reads as "things to do in your world", not "widgets".
 *
 * Still zero fake data — every tile comes from a real engine:
 *   - review-due    (GET /mastery/review-due)
 *   - recommended   (GET /adaptive/recommendations)
 *   - today's goal  (GET /daily-goals/progress)
 * The rail self-hides entirely when there is nothing to show.
 */

interface Recommendation {
  type: 'MISSION' | 'ACTIVITY' | 'REVIEW' | 'PROJECT'
  entityId: string
  title: string
  reason: string
  priority: number
  estimatedMinutes?: number
}

interface DailyGoalProgress {
  goal: { targetMinutes: number; targetActivities: number }
  progress: { minutesSpent: number; activitiesCompleted: number }
  percentComplete: { minutes: number; activities: number }
  goalMet: boolean
}

const REC_META: Record<Recommendation['type'], { icon: typeof Target; tint: string; to: (r: Recommendation) => string }> = {
  MISSION: { icon: Target, tint: 'from-accent-400 to-accent-600', to: (r) => `/missions/${r.entityId}` },
  ACTIVITY: { icon: Rocket, tint: 'from-primary-400 to-primary-600', to: () => '/missions' },
  REVIEW: { icon: RefreshCw, tint: 'from-secondary-400 to-secondary-600', to: () => '/learn/flashcards' },
  PROJECT: { icon: Palette, tint: 'from-grape-400 to-grape-600', to: (r) => `/projects/${r.entityId}` },
}

/** A single fixed-width tile — the one shape every item in the rail shares. */
function Tile({
  to,
  grad,
  icon: Icon,
  kicker,
  title,
  index,
}: {
  to: string
  grad: string
  icon: typeof Target
  kicker: string
  title: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="snap-start shrink-0 w-56"
    >
      <Link
        to={to}
        className={`relative overflow-hidden rounded-blob p-4 h-32 flex flex-col justify-between text-white shadow-soft-md hover:-translate-y-0.5 hover:shadow-lift transition-all bg-gradient-to-br ${grad} focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50`}
      >
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <Icon className="relative w-5 h-5" strokeWidth={2.5} />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/80">{kicker}</p>
          <p className="font-display font-bold text-sm leading-snug line-clamp-2">{title}</p>
        </div>
      </Link>
    </motion.div>
  )
}

export function DiscoverRail() {
  const { t } = useTranslation()

  const { data: reviewDue } = useQuery({
    queryKey: ['review-due', 'home'],
    queryFn: () => masteryApi.getReviewDue().then((res) => res.data as unknown[]),
    retry: false,
  })
  const reviewCount = Array.isArray(reviewDue) ? reviewDue.length : 0

  const { data: recs } = useQuery({
    queryKey: ['adaptive-recommendations', 'home'],
    queryFn: () => adaptiveApi.getRecommendations().then((res) => res.data as Recommendation[]),
    retry: 1,
  })
  const recItems = Array.isArray(recs) ? recs.slice(0, 4) : []

  const { data: dailyGoal } = useQuery({
    queryKey: ['daily-goal-progress', 'home'],
    queryFn: () => dailyGoalsApi.getProgress().then((res) => res.data as DailyGoalProgress),
  })
  const goalValid = !!dailyGoal?.goal && !!dailyGoal?.progress && !!dailyGoal?.percentComplete
  const goalRing = goalValid ? Math.round(Math.max(dailyGoal!.percentComplete.minutes, dailyGoal!.percentComplete.activities)) : 0

  const hasAnything = reviewCount > 0 || recItems.length > 0 || goalValid
  if (!hasAnything) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="mb-10"
      aria-labelledby="discover-rail-heading"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <CharacterFace characterId="Azouz" size={32} animate={false} />
        <h2 id="discover-rail-heading" className="font-display font-bold text-ink text-lg">
          {t('home.discoverRailTitle', 'A few things worth doing today')}
        </h2>
      </div>

      <div className="flex gap-3.5 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {reviewCount > 0 && (
          <Tile
            to="/practice"
            grad="from-sky-400 to-sky-600"
            icon={RotateCcw}
            index={0}
            kicker={t('home.reviewDueKicker', 'Keep it strong')}
            title={t('home.reviewDueTitle', { count: reviewCount, defaultValue: '{{count}} skill ready to practice' })}
          />
        )}

        {recItems.map((rec, i) => {
          const meta = REC_META[rec.type] ?? REC_META.ACTIVITY
          return (
            <Tile
              key={`${rec.type}-${rec.entityId}-${i}`}
              to={meta.to(rec)}
              grad={meta.tint}
              icon={meta.icon}
              index={i + 1}
              kicker={t(`dashboard.recTypes.${rec.type}`, rec.type)}
              title={rec.title}
            />
          )
        })}

        {goalValid && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (recItems.length + 1) * 0.05 }}
            className="snap-start shrink-0 w-44"
          >
            <Link
              to="/progress"
              className="relative overflow-hidden rounded-blob p-4 h-32 flex flex-col items-center justify-center gap-1.5 bg-white border border-surface-200 shadow-soft-md hover:-translate-y-0.5 hover:shadow-lift transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              {dailyGoal?.goalMet ? (
                <CheckCircle2 className="w-7 h-7 text-success-500" strokeWidth={2} />
              ) : (
                <div className="relative w-10 h-10 rounded-full flex items-center justify-center">
                  <Flame className="w-5 h-5 text-accent-500" strokeWidth={2} />
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="17" fill="none" stroke="#e9e4da" strokeWidth="3" />
                    <circle
                      cx="20" cy="20" r="17" fill="none" stroke="#d96a2c" strokeWidth="3"
                      strokeDasharray={`${(goalRing / 100) * 106.8} 106.8`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}
              <p className="text-xs font-bold text-ink">{t('dailyGoal.title', "Today's goal")}</p>
              <p className="text-[11px] text-slate-500">
                {dailyGoal?.goalMet
                  ? t('dailyGoal.goalComplete', 'Done for today!')
                  : t('home.goalPercent', { percent: goalRing, defaultValue: '{{percent}}% there' })}
              </p>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}
