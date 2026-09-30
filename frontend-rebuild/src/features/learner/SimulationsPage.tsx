import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { simulationsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui/Card'

interface Simulation {
  id: string
  slug: string
  title: string
  description?: string
}

/** Simulations catalog — real GET /api/simulations. (Player is a follow-on
 * within Learn; catalog + honest empty state ship now.) */
export function SimulationsPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['simulations'],
    queryFn: async () => (await simulationsApi.list()).data as Simulation[],
  })
  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.simulations')} />
      {!data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((s) => (
            <Card key={s.id}>
              <h2 className="font-display font-bold text-ink-900">{s.title}</h2>
              {s.description && <p className="mt-2 text-sm text-ink-500">{s.description}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
