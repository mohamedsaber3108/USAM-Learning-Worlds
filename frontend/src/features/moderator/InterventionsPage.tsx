import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { moderationApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, StatusPill, Button, useToast } from '@/components/ui'

interface Intervention {
  id: string
  learnerId?: string
  recommendation?: string
  status?: string
}

/** Interventions queue — acknowledge/resolve. Real /admin/interventions
 * (@Roles ADMIN, MODERATOR). DS. */
export function InterventionsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const toast = useToast()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['interventions'],
    queryFn: async () => (await moderationApi.interventions()).data as Intervention[],
  })

  async function ack(id: string) {
    await moderationApi.ackIntervention(id)
    toast.show(t('mod.acknowledge'), 'success')
    await qc.invalidateQueries({ queryKey: ['interventions'] })
  }
  async function resolve(id: string) {
    await moderationApi.resolveIntervention(id)
    toast.show(t('mod.resolve'), 'success')
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
            <Card key={it.id} className="flex flex-wrap items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block font-medium text-ink-900">{it.recommendation ?? 'Intervention'}</span>
                {it.status && <StatusPill tone="neutral">{it.status}</StatusPill>}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => ack(it.id)}>
                  {t('mod.acknowledge')}
                </Button>
                <Button size="sm" onClick={() => resolve(it.id)}>
                  {t('mod.resolve')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
