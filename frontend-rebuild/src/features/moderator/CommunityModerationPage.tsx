import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { moderationApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Quarantined {
  id: string
  content?: string
  reason?: string
}

/** Community moderation queue — review quarantined content. Real
 * /community/moderation/quarantined + review/:id. */
export function CommunityModerationPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mod-quarantined'],
    queryFn: async () => (await moderationApi.quarantined()).data as Quarantined[],
  })

  async function review(id: string, decision: 'approve' | 'remove') {
    await moderationApi.review(id, { decision })
    await qc.invalidateQueries({ queryKey: ['mod-quarantined'] })
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const items = data ?? []
  return (
    <div className="space-y-6">
      <PageHeader title={t('mod.communityQueue')} />
      {items.length === 0 ? (
        <EmptyState title={t('mod.nothingToReview')} />
      ) : (
        <div className="space-y-3">
          {items.map((q) => (
            <Card key={q.id}>
              {q.content && <p className="text-ink-800">{q.content}</p>}
              {q.reason && <p className="mt-1 text-xs text-ink-400">{q.reason}</p>}
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => review(q.id, 'approve')}>
                  {t('mod.approve')}
                </Button>
                <Button size="sm" variant="danger" onClick={() => review(q.id, 'remove')}>
                  {t('mod.remove')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
