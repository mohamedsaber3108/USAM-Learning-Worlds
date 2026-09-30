import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { communityApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui/Card'

interface FeedItem {
  id: string
  title?: string
  body?: string
  authorDisplayName?: string
}

/** Community feed (safe, moderated). Real GET /api/community/feed. Each item
 * offers a Report affordance (POST /community/report). */
export function CommunityPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['community-feed'],
    queryFn: async () => (await communityApi.feed()).data as FeedItem[],
  })

  async function report(id: string) {
    await communityApi.report({ targetType: 'post', targetId: id, reason: 'inappropriate' })
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.community')} />
      {!data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <Card key={item.id}>
              {item.title && <p className="font-display font-bold text-ink-900">{item.title}</p>}
              {item.body && <p className="mt-1 text-sm text-ink-600">{item.body}</p>}
              <div className="mt-2 flex items-center justify-between">
                {item.authorDisplayName && <span className="text-xs text-ink-400">{item.authorDisplayName}</span>}
                <button onClick={() => report(item.id)} className="text-xs text-ink-400 hover:text-error-700">
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
