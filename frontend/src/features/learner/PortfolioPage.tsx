import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { projectsApi } from '@/lib/api/endpoints'
import { useAuthStore } from '@/lib/auth/authStore'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui'

interface PortfolioItem {
  id: string
  title: string
  description?: string
}

/** Portfolio — showcased work. Real GET /api/projects/portfolio/:learnerId. DS. */
export function PortfolioPage() {
  const { t } = useTranslation()
  const learnerId = useAuthStore((s) => s.user?.learner?.id)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['portfolio', learnerId],
    queryFn: async () => (await projectsApi.portfolio(learnerId!)).data as PortfolioItem[],
    enabled: Boolean(learnerId),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.portfolio')} />
      {!data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <Card key={item.id}>
              <h2 className="font-display font-bold text-ink-900">{item.title}</h2>
              {item.description && <p className="mt-2 text-sm text-ink-500">{item.description}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
