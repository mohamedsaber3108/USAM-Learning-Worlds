import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { masteryApi } from '@/lib/api/endpoints'
import type { MasteryRecord } from '@/lib/api/learning-types'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { REVIEW_FRAMING, masteryLabel } from '@/lib/labels/masteryLabels'

/** Practice / review — "keep it strong". Real GET /api/mastery/review-due. An
 * empty list is the honest "all caught up" state, NOT a fake count. */
export function PracticePage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['review-due', 'practice'],
    queryFn: async () => (await masteryApi.getReviewDue()).data as MasteryRecord[],
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const due = data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">{REVIEW_FRAMING.title}</h1>
        <p className="mt-1 text-sm text-ink-500">{REVIEW_FRAMING.subtitle}</p>
      </div>

      {due.length === 0 ? (
        <EmptyState title={t('learner.nothingDue')} />
      ) : (
        <div className="space-y-2">
          {due.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-control border border-line bg-white px-4 py-3">
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink-900">
                  {r.competency?.name ?? r.competencyId}
                </span>
                <span className="block text-xs text-ink-400">{masteryLabel(r.state)}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
