import { useQuery } from '@tanstack/react-query'
import { RotateCcw } from 'lucide-react'
import { masteryApi } from '@/lib/api/endpoints'
import type { MasteryRecord } from '@/lib/api/learning-types'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, StatusPill } from '@/components/ui'
import { REVIEW_FRAMING, masteryLabel } from '@/lib/labels/masteryLabels'

/** Practice / review — "keep it strong". Real GET /api/mastery/review-due; an
 * empty list is the honest all-caught-up state. Design system. */
export function PracticePage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['review-due', 'practice'],
    queryFn: async () => (await masteryApi.getReviewDue()).data as MasteryRecord[],
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const due = data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title={REVIEW_FRAMING.title} subtitle={REVIEW_FRAMING.subtitle} />
      {due.length === 0 ? (
        <EmptyState title={REVIEW_FRAMING.emptyAllCaughtUp} />
      ) : (
        <div className="space-y-2">
          {due.map((r) => (
            <Card key={r.id} className="flex items-center justify-between">
              <span className="inline-flex min-w-0 items-center gap-3">
                <RotateCcw className="h-5 w-5 shrink-0 text-brand-500" aria-hidden />
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink-900">{r.competency?.name ?? r.competencyId}</span>
                  {r.competency?.skill?.name && <span className="block text-xs text-ink-400">{r.competency.skill.name}</span>}
                </span>
              </span>
              <StatusPill tone="brand">{masteryLabel(r.state)}</StatusPill>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
