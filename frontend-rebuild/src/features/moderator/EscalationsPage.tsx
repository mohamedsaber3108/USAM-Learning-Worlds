import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { moderationApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface Escalation {
  id: string
  reason?: string
  status?: string
  severity?: string
  createdAt?: string
}

/** Safety escalations queue — assign/resolve. Real safety-escalations endpoints
 * (@Roles MODERATOR, ADMIN). */
export function EscalationsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['escalations'],
    queryFn: async () => (await moderationApi.escalations()).data as Escalation[],
  })

  async function assign(id: string) {
    await moderationApi.assign(id)
    await qc.invalidateQueries({ queryKey: ['escalations'] })
  }
  async function resolve(id: string) {
    await moderationApi.resolve(id, { resolution: 'reviewed' })
    await qc.invalidateQueries({ queryKey: ['escalations'] })
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const items = data ?? []
  return (
    <div className="space-y-6">
      <PageHeader title={t('mod.escalations')} />
      {items.length === 0 ? (
        <EmptyState title={t('mod.nothingToReview')} />
      ) : (
        <div className="space-y-3">
          {items.map((e) => (
            <Card key={e.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block font-medium text-ink-900">{e.reason ?? 'Escalation'}</span>
                  <span className="mt-1 flex gap-2">
                    {e.severity && <Badge tone="warning">{e.severity}</Badge>}
                    {e.status && <Badge tone={e.status === 'RESOLVED' ? 'success' : 'neutral'}>{e.status}</Badge>}
                  </span>
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => assign(e.id)}>
                    {t('mod.assign')}
                  </Button>
                  <Button size="sm" onClick={() => resolve(e.id)}>
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
