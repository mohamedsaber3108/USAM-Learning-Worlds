import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/lib/api/endpoints'
import { LoadingState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui'

/** Admin operations overview — real /admin/analytics/overview. DS. */
export function AdminOverviewPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => (await adminApi.analyticsOverview()).data as Record<string, number>,
  })
  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const entries = Object.entries(data ?? {}).filter(([, v]) => typeof v === 'number')
  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.overview')} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map(([key, value]) => (
          <Card key={key}>
            <p className="text-xs uppercase tracking-wide text-ink-400">{key}</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">{value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
