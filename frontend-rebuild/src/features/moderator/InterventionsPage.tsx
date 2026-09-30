import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { moderationApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface Intervention {
  id: string
  learnerId?: string
  recommendation?: string
  status?: string
}

/** Interventions queue — acknowledge/resolve. Real /admin/interventions
 * (@Roles ADMIN, MODERATOR). */
export function InterventionsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['interventions'],
    queryFn: async () => (await moderationApi.interventions()).data as Intervention[],
  })

  async function ack(id: string) {
    await moderationApi.ackIntervention(id)
    await qc.invalidateQueries({ queryKey: ['interventions'] })
  }
  async function resolve(id: string) {
    await moderationApi.resolveIntervention(id)
    await qc.invalidateQueries({ queryKey: ['interventions'] })
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const items = data ?? []
  return (
    <div className="space-y-6">
      <PageHeader title={t('mod.interventions')} />
      {items.length === 0 ? (
        <EmptyState title={t('mod.nothingToReview')} />
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <Card key={it.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block font-medium text-ink-900">{it.recommendation ?? 'Intervention'}</span>
                  {it.status && <Badge tone="neutral">{it.status}</Badge>}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => ack(it.id)}>
                    {t('mod.acknowledge')}
                  </Button>
                  <Button size="sm" onClick={() => resolve(it.id)}>
                    {t('mod.resolve')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
