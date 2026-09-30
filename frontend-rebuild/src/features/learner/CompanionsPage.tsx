import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { charactersApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface Character {
  id: string
  name: string
  description?: string
  unlocked?: boolean
  relationshipState?: string
}

/** Companions gallery — real GET /api/characters, with unlock + relationship
 * state shown in child language. */
export function CompanionsPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['characters'],
    queryFn: async () => (await charactersApi.list()).data as Character[],
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.companions')} />
      {!data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <Card key={c.id}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display font-bold text-ink-900">{c.name}</h2>
                {c.unlocked === false ? <Badge tone="neutral">🔒</Badge> : c.relationshipState ? <Badge tone="brand">{c.relationshipState}</Badge> : null}
              </div>
              {c.description && <p className="mt-2 text-sm text-ink-500">{c.description}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
