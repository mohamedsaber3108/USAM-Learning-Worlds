import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { parentsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui/Card'
import { AGE_BAND_LABEL } from '@/lib/labels/ageLabels'
import type { AgeBand } from '@/lib/api/types'

interface ChildLink {
  relationshipId: string
  learner: { id: string; displayName: string; ageBand: AgeBand | null; avatarUrl?: string | null }
}

/** Parent home — children list. Real GET /api/parents/children (guardian-scoped
 * server-side). */
export function ParentHomePage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent-children'],
    queryFn: async () => (await parentsApi.children()).data as ChildLink[],
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader title={t('parent.children')} />
      {!data || data.length === 0 ? (
        <EmptyState title={t('parent.noChildren')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <Link key={c.relationshipId} to={`/parent/child/${c.learner.id}`}>
              <Card className="h-full transition-colors hover:bg-canvas-off">
                <h2 className="font-display text-lg font-bold text-ink-900">{c.learner.displayName}</h2>
                {c.learner.ageBand && (
                  <p className="mt-1 text-sm text-ink-500">{AGE_BAND_LABEL[c.learner.ageBand]}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
