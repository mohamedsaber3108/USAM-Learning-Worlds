import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader } from '@/components/ui'

interface EventTypeCount {
  type: string
  count: number
}
interface DailyActiveLearners {
  date: string
  activeLearners: number
  totalEvents: number
}
interface AnalyticsOverview {
  rangeDays: number
  totalEvents: number
  activeLearners: number
  eventsByType: EventTypeCount[]
  dailyActivity: DailyActiveLearners[]
}

/**
 * FIX (2026-10-02): two real contract-mismatch bugs confirmed by reading
 * analytics.service.ts directly.
 *
 * 1) GET /admin/analytics/overview returns a typed
 *    `{ rangeDays, totalEvents, activeLearners, eventsByType, dailyActivity }`
 *    object, not a flat `Record<string, number>`. The previous blind
 *    `typeof v === 'number'` filter silently dropped `eventsByType` (an
 *    array) and `dailyActivity` (an array) — real data the backend already
 *    computes was fetched and thrown away. Now reads the real top-level
 *    scalars explicitly and renders the real `eventsByType` breakdown too.
 * 2) GET /admin/analytics/daily-activity returns
 *    `{ date, activeLearners, totalEvents }[]`, not `{ date, count }[]`.
 *    `p.count` was always undefined, so every bar's height computed as
 *    `undefined / max = NaN%` — the chart silently rendered nothing
 *    useful regardless of real daily activity. Switched to the real
 *    `totalEvents` field.
 */
export function AdminAnalyticsPage() {
  const { t } = useTranslation()
  const overview = useQuery({
    queryKey: ['admin-analytics-overview'],
    queryFn: async () => (await adminApi.analyticsOverview()).data as AnalyticsOverview,
  })
  const daily = useQuery({
    queryKey: ['admin-analytics-daily'],
    queryFn: async () => (await adminApi.analyticsDaily()).data as DailyActiveLearners[],
    retry: false,
  })

  if (overview.isLoading) return <LoadingState />
  if (overview.isError) return <ErrorState onRetry={() => void overview.refetch()} />

  const o = overview.data
  const points = daily.data ?? []
  const max = Math.max(1, ...points.map((p) => p.totalEvents))

  return (
    <div className="space-y-8">
      <PageHeader title={t('admin.analytics')} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-400">Range (days)</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">{o?.rangeDays ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-400">Total events</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">{o?.totalEvents ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-400">Active learners</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">{o?.activeLearners ?? 0}</p>
        </Card>
      </div>

      {o && o.eventsByType.length > 0 && (
        <section>
          <SectionHeader title="Events by type" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {o.eventsByType.map((e) => (
              <Card key={e.type}>
                <p className="text-xs uppercase tracking-wide text-ink-400">{e.type}</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">{e.count}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Daily activity" />
        {points.length === 0 ? (
          <EmptyState />
        ) : (
          <Card>
            <div className="flex items-end gap-1" aria-hidden style={{ height: 120 }}>
              {points.map((p) => (
                <div
                  key={p.date}
                  title={`${p.date}: ${p.totalEvents} events, ${p.activeLearners} active`}
                  className="flex-1 rounded-t bg-brand-400"
                  style={{ height: `${(p.totalEvents / max) * 100}%` }}
                />
              ))}
            </div>
          </Card>
        )}
      </section>
    </div>
  )
}
