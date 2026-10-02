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

/**
 * FIX (2026-10-02): two real contract-mismatch bugs confirmed by reading
 * content-items.service.ts directly.
 *
 * 1) GET /admin/content-items returns `{ items, total, take, skip }`, not a
 *    bare array — this page previously cast the whole wrapped response to
 *    `ContentItem[]` and called `.map`/`.length` on it directly, which
 *    throws at runtime the moment any content item exists. Unwrapped below.
 * 2) The real `ContentStatus` enum lifecycle (FORWARD_TRANSITIONS in
 *    content-items.service.ts) is DRAFT -> VALIDATING -> VALIDATED ->
 *    PUBLISHED -> DEPRECATED. There is no REVIEW/APPROVED/ARCHIVED status,
 *    and DRAFT can never jump straight to PUBLISHED — the backend 400s on
 *    any transition not in FORWARD_TRANSITIONS. The previous NEXT_STATUS
 *    map used fictional statuses and an impossible shortcut, so the
 *    publish/archive buttons always failed against the real backend.
 *    Corrected to the real one-step-at-a-time lifecycle.
 */
const NEXT_STATUS: Record<string, string | undefined> = {
  DRAFT: 'VALIDATING',
  VALIDATING: 'VALIDATED',
  VALIDATED: 'PUBLISHED',
  PUBLISHED: 'DEPRECATED',
}
const NEXT_LABEL_KEY: Record<string, string | undefined> = {
  DRAFT: 'admin.contentAdvanceToValidating',
  VALIDATING: 'admin.contentAdvanceToValidated',
  VALIDATED: 'admin.publish',
  PUBLISHED: 'admin.archive',
}
const tone = (s: string): 'success' | 'neutral' | 'warning' =>
  s === 'PUBLISHED' ? 'success' : s === 'DEPRECATED' || s === 'REJECTED' ? 'neutral' : 'warning'

/** Content CMS — list + the real one-step-at-a-time lifecycle via the real
 * status endpoint (no faked publishing in FE state). Shared Table. DS. */
export function AdminContentPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const toast = useToast()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-content'],
    queryFn: async () => (await adminApi.contentItems()).data as { items: ContentItem[]; total: number },
  })

  async function advance(item: ContentItem) {
    const next = NEXT_STATUS[item.status]
    if (!next) return
    await adminApi.setContentStatus(item.id, next)
    toast.show(t(NEXT_LABEL_KEY[item.status] ?? 'admin.publish'), 'success')
    await qc.invalidateQueries({ queryKey: ['admin-content'] })
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const items = data?.items ?? []
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
                  {t(NEXT_LABEL_KEY[item.status] ?? 'admin.publish')}
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
