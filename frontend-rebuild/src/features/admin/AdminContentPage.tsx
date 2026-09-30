import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { PageHeader, Table, StatusPill, Button, useToast } from '@/components/ui'

interface ContentItem {
  id: string
  title: string
  status: string
  type?: string
}

// Real lifecycle transitions via PATCH /:id/status.
const NEXT_STATUS: Record<string, string | undefined> = {
  DRAFT: 'PUBLISHED',
  REVIEW: 'PUBLISHED',
  APPROVED: 'PUBLISHED',
  PUBLISHED: 'ARCHIVED',
}
const tone = (s: string): 'success' | 'neutral' | 'warning' =>
  s === 'PUBLISHED' ? 'success' : s === 'ARCHIVED' ? 'neutral' : 'warning'

/** Content CMS — list + lifecycle DRAFT→PUBLISHED→ARCHIVED via the real status
 * endpoint (no faked publishing in FE state). Shared Table. DS. */
export function AdminContentPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const toast = useToast()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-content'],
    queryFn: async () => (await adminApi.contentItems()).data as ContentItem[],
  })

  async function advance(item: ContentItem) {
    const next = NEXT_STATUS[item.status]
    if (!next) return
    await adminApi.setContentStatus(item.id, next)
    toast.show(next === 'PUBLISHED' ? t('admin.publish') : t('admin.archive'), 'success')
    await qc.invalidateQueries({ queryKey: ['admin-content'] })
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const items = data ?? []
  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.content')} />
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <Table
          headers={['Title', 'Type', t('admin.status'), '']}
          rows={items.map((item) => {
            const next = NEXT_STATUS[item.status]
            return [
              <span className="font-medium text-ink-900">{item.title}</span>,
              item.type ?? '—',
              <StatusPill tone={tone(item.status)}>{item.status}</StatusPill>,
              next ? (
                <Button size="sm" onClick={() => advance(item)}>
                  {next === 'PUBLISHED' ? t('admin.publish') : t('admin.archive')}
                </Button>
              ) : (
                ''
              ),
            ]
          })}
        />
      )}
    </div>
  )
}
