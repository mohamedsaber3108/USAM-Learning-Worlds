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
interface RetentionCohort {
  cohortWeek: string
  cohortSize: number
  retention: number[]
}
interface StickinessPoint {
  date: string
  dau: number
  mau: number
  stickiness: number
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
  // FIX (reverse-engineering/experience directive, 2026-10-07, §45 +
  // directive's own documented gap list): GET /admin/analytics/
  // retention-cohorts and /stickiness are real, ADMIN-gated, computed over
  // the real LearningEvent table (confirmed by reading analytics.service.ts
  // directly — these are genuine weekly-cohort and DAU/MAU engagement
  // metrics, not placeholders) but had zero frontend wrapper/caller.
  const retention = useQuery({
    queryKey: ['admin-analytics-retention'],
    queryFn: async () => (await adminApi.analyticsRetentionCohorts()).data as RetentionCohort[],
    retry: false,
  })
  const stickiness = useQuery({
    queryKey: ['admin-analytics-stickiness'],
    queryFn: async () => (await adminApi.analyticsStickiness()).data as StickinessPoint[],
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

      <section>
        <SectionHeader title="Stickiness (DAU/MAU)" />
        {!stickiness.data || stickiness.data.length === 0 ? (
          <EmptyState />
        ) : (
          <Card>
            <div className="flex items-end gap-1" aria-hidden style={{ height: 100 }}>
              {stickiness.data.map((p) => (
                <div
                  key={p.date}
                  title={`${p.date}: ${(p.stickiness * 100).toFixed(1)}% (DAU ${p.dau} / MAU ${p.mau})`}
                  className="flex-1 rounded-t bg-success-400"
                  style={{ height: `${Math.max(2, p.stickiness * 100)}%` }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-400">
              Latest: {((stickiness.data[stickiness.data.length - 1]?.stickiness ?? 0) * 100).toFixed(1)}% of monthly
              active learners were active today.
            </p>
          </Card>
        )}
      </section>

      <section>
        <SectionHeader title="Weekly retention cohorts" />
        {!retention.data || retention.data.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="pb-2 pe-4">Cohort week</th>
                  <th className="pb-2 pe-4">Size</th>
                  {retention.data[0]?.retention.map((_, i) => (
                    <th key={i} className="pb-2 pe-4">
                      Wk {i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {retention.data.map((c) => (
                  <tr key={c.cohortWeek} className="border-t border-line">
                    <td className="py-2 pe-4 font-medium text-ink-900">{c.cohortWeek}</td>
                    <td className="py-2 pe-4 text-ink-600">{c.cohortSize}</td>
                    {c.retention.map((r, i) => (
                      <td key={i} className="py-2 pe-4 text-ink-600">
                        {(r * 100).toFixed(0)}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
