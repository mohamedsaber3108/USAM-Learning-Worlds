import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowRight, RotateCcw, Flame, Star } from 'lucide-react'
import { masteryApi, gamificationApi, adaptiveApi, worldsApi } from '@/lib/api/endpoints'
import { useAuthStore } from '@/lib/auth/authStore'
import { Card, Button, Progress } from '@/components/ui'
import { Skeleton } from '@/components/ui'

interface World {
  id: string
  name: string
  domain?: { slug: string; name: string }
}
interface Recommendation {
  missionId?: string
  competencyName?: string
  reason?: string
}

/**
 * Learner Home — a "living world" hub, not a card dump. Orients (greeting +
 * level/streak), surfaces the ONE next best action, a self-hiding review nudge,
 * and quick entry to the learning worlds. Real adaptive/gamification/mastery/
 * worlds APIs; honest states.
 */
export function HomePage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const name = user?.learner?.displayName || user?.learner?.firstName || ''

  const progression = useQuery({
    queryKey: ['progression'],
    queryFn: async () => (await gamificationApi.getProgression()).data as { level?: number; totalXP?: number },
    retry: false,
  })
  const streak = useQuery({
    queryKey: ['streak'],
    queryFn: async () => (await gamificationApi.getStreak()).data as { current?: number },
    retry: false,
  })
  const reviewDue = useQuery({
    queryKey: ['review-due'],
    queryFn: async () => (await masteryApi.getReviewDue()).data as unknown[],
    retry: false,
  })
  const recs = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => (await adaptiveApi.getRecommendations()).data as Recommendation[],
    retry: false,
  })
  const worlds = useQuery({
    queryKey: ['worlds'],
    queryFn: async () => (await worldsApi.list()).data as World[],
    retry: false,
  })

  const reviewCount = Array.isArray(reviewDue.data) ? reviewDue.data.length : 0
  const nextRec = Array.isArray(recs.data) ? recs.data.find((r) => r.missionId) : undefined
  const level = progression.data?.level ?? 1
  const xp = progression.data?.totalXP ?? 0
  const xpIntoLevel = xp % 100

  return (
    <div className="space-y-6">
      {/* Greeting + stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">{t('learner.homeGreeting', { name })}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-ink-600">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 text-brand-500" aria-hidden /> {t('learner.level')} {level}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-brand-500" aria-hidden /> {streak.data?.current ?? 0}
            </span>
          </div>
        </div>
        <div className="w-40">
          <Progress value={xpIntoLevel} label={`${xp} XP`} />
          <p className="mt-1 text-end text-xs text-ink-400">{xp} XP</p>
        </div>
      </div>

      {/* Next best action */}
      <Card className="bg-brand-700 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{t('learner.nextStep')}</p>
        {recs.isLoading ? (
          <Skeleton className="mt-2 h-6 w-2/3 bg-white/20" />
        ) : nextRec?.missionId ? (
          <>
            <p className="mt-1 font-display text-xl font-bold">{nextRec.competencyName ?? t('learner.startHere')}</p>
            <Link to={`/app/missions/${nextRec.missionId}`} className="mt-4 inline-block">
              <Button variant="secondary">
                {t('learner.startHere')} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
              </Button>
            </Link>
          </>
        ) : (
          <>
            <p className="mt-1 text-white/90">{t('learner.chooseWorld')}</p>
            <Link to="/app/learn" className="mt-4 inline-block">
              <Button variant="secondary">{t('nav.learn')}</Button>
            </Link>
          </>
        )}
      </Card>

      {/* Review nudge (self-hiding) */}
      {reviewCount > 0 && (
        <Link
          to="/app/practice"
          className="flex items-center justify-between rounded-card border border-line bg-white p-4 shadow-soft transition-colors hover:bg-canvas-off"
        >
          <span className="inline-flex items-center gap-2 font-medium text-ink-800">
            <RotateCcw className="h-5 w-5 text-brand-500" aria-hidden />
            {t('learner.reviewNudge', { count: reviewCount })}
          </span>
          <ArrowRight className="h-4 w-4 text-brand-600 rtl:-scale-x-100" aria-hidden />
        </Link>
      )}

      {/* Worlds quick access */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900">{t('learner.chooseWorld')}</h2>
          <Link to="/app/learn" className="text-sm font-medium text-brand-600 hover:underline">
            {t('nav.learn')}
          </Link>
        </div>
        {worlds.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : worlds.data && worlds.data.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {worlds.data.slice(0, 6).map((w) => {
              const slug = w.domain?.slug
              const inner = (
                <Card className="h-full transition-transform duration-fast hover:-translate-y-0.5">
                  <h3 className="font-display font-bold text-ink-900">{w.domain?.name ?? w.name}</h3>
                </Card>
              )
              return slug ? (
                <Link key={w.id} to={`/app/learn/${slug}`}>
                  {inner}
                </Link>
              ) : (
                <div key={w.id}>{inner}</div>
              )
            })}
          </div>
        ) : null}
      </section>
    </div>
  )
}
