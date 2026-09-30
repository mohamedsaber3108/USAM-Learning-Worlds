import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { masteryApi, gamificationApi } from '@/lib/api/endpoints'
import { useAuthStore } from '@/lib/auth/authStore'
import { LoadingState } from '@/components/common/States'
import { Button } from '@/components/ui/Button'

/** Learner home: orient + resume + next best action + review nudge. Real APIs;
 * honest empty states. */
export function HomePage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const name = user?.learner?.displayName || user?.learner?.firstName || ''

  const { data: reviewDue } = useQuery({
    queryKey: ['review-due'],
    queryFn: async () => (await masteryApi.getReviewDue()).data as unknown[],
    retry: false,
  })
  const { data: progression, isLoading } = useQuery({
    queryKey: ['progression'],
    queryFn: async () => (await gamificationApi.getProgression()).data as { level?: number; totalXP?: number },
    retry: false,
  })

  const reviewCount = Array.isArray(reviewDue) ? reviewDue.length : 0

  if (isLoading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">
          {t('learner.homeGreeting', { name })}
        </h1>
        {progression && (
          <p className="mt-1 text-sm text-ink-500">
            Level {progression.level ?? 1} · {progression.totalXP ?? 0} XP
          </p>
        )}
      </div>

      <section className="rounded-card border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{t('learner.nextStep')}</p>
        <p className="mt-1 text-ink-700">{t('learner.chooseWorld')}</p>
        <Link to="/app/learn" className="mt-4 inline-block">
          <Button>{t('nav.learn')}</Button>
        </Link>
      </section>

      {reviewCount > 0 && (
        <Link
          to="/app/practice"
          className="flex items-center justify-between rounded-card border border-line bg-white p-5 shadow-soft transition-colors hover:bg-canvas-off"
        >
          <span className="font-medium text-ink-800">{t('learner.reviewNudge', { count: reviewCount })}</span>
          <span aria-hidden className="text-brand-600 rtl:-scale-x-100">→</span>
        </Link>
      )}
    </div>
  )
}
