import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface ContentItem {
  id: string
  title: string
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED' | string
  type?: string
}

// Real lifecycle transitions the backend supports via PATCH /:id/status.
const NEXT_STATUS: Record<string, string | undefined> = {
  DRAFT: 'PUBLISHED',
  REVIEW: 'PUBLISHED',
  APPROVED: 'PUBLISHED',
  PUBLISHED: 'ARCHIVED',
}
const statusTone = (s: string) =>
  s === 'PUBLISHED' ? 'success' : s === 'ARCHIVED' ? 'neutral' : 'warning'

/** Content CMS — list + lifecycle DRAFT→PUBLISHED→ARCHIVED via the real status
 * endpoint. No faked publishing in FE state; the transition is a server call. */
export function AdminContentPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-content'],
    queryFn: async () => (await adminApi.contentItems()).data as ContentItem[],
  })

  async function advance(item: ContentItem) {
    const next = NEXT_STATUS[item.status]
    if (!next) return
    await adminApi.setContentStatus(item.id, next)
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
        <div className="space-y-2">
          {items.map((item) => {
            const next = NEXT_STATUS[item.status]
            return (
              <Card key={item.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink-900">{item.title}</span>
                    {item.type && <span className="text-xs text-ink-400">{item.type}</span>}
                  </span>
                  <div className="flex items-center gap-3">
                    <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                    {next && (
                      <Button size="sm" onClick={() => advance(item)}>
                        {next === 'PUBLISHED' ? t('admin.publish') : t('admin.archive')}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
