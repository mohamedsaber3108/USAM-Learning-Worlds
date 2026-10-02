import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Activity, Clock, Flame, TrendingUp } from 'lucide-react'
import { learningEventsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader } from '@/components/ui'

const HOUR_LABEL = (h: number) => {
  const period = h < 12 ? 'AM' : 'PM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}${period}`
}

/**
 * My Journey — real GET /learning/events/stats + /patterns.
 *
 * NEW (ledger 88 batch 5): surfaced building the legacy URL redirect map —
 * legacy `/insights` had a real backend consumer (the learning-events
 * module: event-type stats + detected activity patterns) with zero
 * `frontend-rebuild` representation. Shows activity-type breakdown and
 * learning-pattern stats (active days, consistency, peak hour) in plain
 * language — no raw event JSON surfaced to the learner.
 */
export function InsightsPage() {
  const { t } = useTranslation()
  const stats = useQuery({
    queryKey: ['learning-events-stats'],
    queryFn: async () => (await learningEventsApi.getStats()).data,
    retry: false,
  })
  const patterns = useQuery({
    queryKey: ['learning-events-patterns'],
    queryFn: async () => (await learningEventsApi.getPatterns(30)).data,
    retry: false,
  })

  if (stats.isLoading) return <LoadingState />
  if (stats.isError) return <ErrorState onRetry={() => void stats.refetch()} />

  const statItems = stats.data ?? []
  const p = patterns.data

  const stat = (icon: React.ReactNode, label: string, value: number | string) => (
    <Card>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-control bg-brand-50 text-brand-600">{icon}</span>
      <p className="mt-2 text-xs uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">{value}</p>
    </Card>
  )

  return (
    <div className="space-y-8">
      <PageHeader title={t('learner.insightsTitle')} subtitle={t('learner.insightsSubtitle')} />

      {p && (
        <section>
          <SectionHeader title={t('learner.insightsPatterns')} />
          <div className="grid gap-4 sm:grid-cols-4">
            {stat(<Flame className="h-5 w-5" aria-hidden />, t('learner.insightsActiveDays'), p.activeDays)}
            {stat(<TrendingUp className="h-5 w-5" aria-hidden />, t('learner.insightsConsistency'), `${Math.round(p.consistency * 100)}%`)}
            {stat(<Activity className="h-5 w-5" aria-hidden />, t('learner.insightsAvgPerDay'), p.avgActivitiesPerDay.toFixed(1))}
            {stat(<Clock className="h-5 w-5" aria-hidden />, t('learner.insightsPeakHour'), HOUR_LABEL(p.peakLearningHour))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title={t('learner.insightsActivity')} />
        {statItems.length === 0 ? (
          <EmptyState title={t('learner.insightsEmpty')} />
        ) : (
          <div className="space-y-2">
            {statItems.map((s) => (
              <Card key={s.eventType} className="flex items-center justify-between">
                <span className="font-medium text-ink-900">{s.eventType.replace(/_/g, ' ').toLowerCase()}</span>
                <span className="font-display font-bold text-brand-700">{s.count}</span>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
