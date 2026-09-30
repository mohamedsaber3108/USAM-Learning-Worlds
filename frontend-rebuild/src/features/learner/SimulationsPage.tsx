import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Boxes } from 'lucide-react'
import { simulationsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui'

interface Simulation {
  id: string
  slug: string
  title: string
  description?: string
}

/** Simulations catalog — real GET /api/simulations. DS. */
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
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                <Boxes className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-3 font-display font-bold text-ink-900">{s.title}</h2>
              {s.description && <p className="mt-1 text-sm text-ink-500">{s.description}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
