import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/lib/api/endpoints'
import { LoadingState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui'

interface AnalyticsOverview {
  rangeDays: number
  totalEvents: number
  activeLearners: number
}

/**
 * FIX (2026-10-02): GET /admin/analytics/overview returns a typed object
 * `{ rangeDays, totalEvents, activeLearners, eventsByType, dailyActivity }`
 * (analytics.service.ts getOverview), not a flat `Record<string, number>`.
 * The previous blind `typeof v === 'number'` filter happened to work for
 * the three scalar fields but would also render `eventsByType`/
 * `dailyActivity` if they were ever numeric by accident — reading the real
 * scalar fields explicitly instead, same fix applied to AdminAnalyticsPage.
 */
export function AdminOverviewPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => (await adminApi.analyticsOverview()).data as AnalyticsOverview,
  })
  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.overview')} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-400">Range (days)</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">{data?.rangeDays ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-400">Total events</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">{data?.totalEvents ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-400">Active learners</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">{data?.activeLearners ?? 0}</p>
        </Card>
      </div>
    </div>
  )
}
