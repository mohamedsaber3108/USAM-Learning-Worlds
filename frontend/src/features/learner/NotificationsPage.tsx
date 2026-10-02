import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { notificationsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, Button } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

interface Notification {
  id: string
  title?: string
  body?: string
  read?: boolean
  createdAt?: string
}

/** Notification center — real endpoints; unread/read + mark-all-read. DS. */
export function NotificationsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await notificationsApi.list()).data as Notification[],
  })

  async function markAll() {
    await notificationsApi.markAllRead()
    await qc.invalidateQueries({ queryKey: ['notifications'] })
    await qc.invalidateQueries({ queryKey: ['unread-count'] })
  }
  async function markOne(id: string) {
    await notificationsApi.markRead(id)
    await qc.invalidateQueries({ queryKey: ['notifications'] })
    await qc.invalidateQueries({ queryKey: ['unread-count'] })
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const items = data ?? []
  const hasUnread = items.some((n) => !n.read)

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('learner.notifications')}
        action={hasUnread ? <Button size="sm" variant="secondary" onClick={markAll}>{t('learner.markAllRead')}</Button> : undefined}
      />
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card key={n.id} className={cn(!n.read && 'border-brand-200 bg-brand-50/40')}>
              <button className="w-full text-start" onClick={() => !n.read && markOne(n.id)}>
                {n.title && <p className="font-medium text-ink-900">{n.title}</p>}
                {n.body && <p className="text-sm text-ink-600">{n.body}</p>}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
