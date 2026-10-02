import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Flag } from 'lucide-react'
import { communityApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, useToast } from '@/components/ui'

/**
 * FIX (reconciliation audit, 2026-10-02): confirmed LIVE via an authenticated
 * Playwright run against production — this page threw `a.map is not a
 * function` on real navigation (console error, blank feed). Two real
 * contract bugs, both fixed in lib/api/endpoints.ts's communityApi:
 * 1) GET /community/feed returns `{ projects, total }`, not a bare array.
 * 2) POST /community/report's real DTO wants entityType/entityId/reason
 *    (specific enum values), not targetType/targetId/lowercase reason —
 *    every report attempt was silently 400ing before this fix.
 *
 * Community feed (safe, moderated — shows showcased PUBLIC projects).
 * Real GET /community/feed + POST /community/report. DS.
 */
export function CommunityPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['community-feed'],
    queryFn: async () => (await communityApi.feed()).data,
  })

  async function report(id: string) {
    try {
      await communityApi.report({ entityType: 'PROJECT', entityId: id, reason: 'INAPPROPRIATE' })
      toast.show(t('learner.report'), 'success')
    } catch {
      toast.show(t('states.error'), 'error')
    }
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const items = data?.projects ?? []
  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.community')} />
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <p className="font-display font-bold text-ink-900">{item.title}</p>
              {item.description && <p className="mt-1 text-sm text-ink-600">{item.description}</p>}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-ink-400">{item.learner.displayName}</span>
                <button
                  onClick={() => report(item.id)}
                  className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-error-700"
                >
                  <Flag className="h-3.5 w-3.5" aria-hidden />
                  {t('learner.report')}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
