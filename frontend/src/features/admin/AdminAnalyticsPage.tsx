import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader } from '@/components/ui'

interface DailyPoint { date: string; count: number }

/** Analytics — overview metrics + daily activity bar chart (real
 * /admin/analytics/*). DS. */
export function AdminAnalyticsPage() {
  const { t } = useTranslation()
  const overview = useQuery({
    queryKey: ['admin-analytics-overview'],
    queryFn: async () => (await adminApi.analyticsOverview()).data as Record<string, number>,
  })
  const daily = useQuery({
    queryKey: ['admin-analytics-daily'],
    queryFn: async () => (await adminApi.analyticsDaily()).data as DailyPoint[],
    retry: false,
  })

  if (overview.isLoading) return <LoadingState />
  if (overview.isError) return <ErrorState onRetry={() => void overview.refetch()} />

  const entries = Object.entries(overview.data ?? {}).filter(([, v]) => typeof v === 'number')
  const points = daily.data ?? []
  const max = Math.max(1, ...points.map((p) => p.count))

  return (
    <div className="space-y-8">
      <PageHeader title={t('admin.analytics')} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map(([k, v]) => (
          <Card key={k}>
            <p className="text-xs uppercase tracking-wide text-ink-400">{k}</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">{v}</p>
          </Card>
        ))}
      </div>

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
                  title={`${p.date}: ${p.count}`}
                  className="flex-1 rounded-t bg-brand-400"
                  style={{ height: `${(p.count / max) * 100}%` }}
                />
              ))}
            </div>
          </Card>
        )}
      </section>
    </div>
  )
}
