import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { charactersApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, Avatar, StatusPill, LockedBadge } from '@/components/ui'

interface Character {
  id: string
  name: string
  description?: string
  unlocked?: boolean
  relationshipState?: string
}

/** Companions gallery — real GET /api/characters; unlock + relationship state
 * in child language. DS + Avatar. */
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
            <Card key={c.id} className={c.unlocked === false ? 'opacity-70' : ''}>
              <div className="flex items-center gap-3">
                <Avatar name={c.name} size={44} />
                <div className="min-w-0">
                  <h2 className="truncate font-display font-bold text-ink-900">{c.name}</h2>
                  {c.unlocked === false ? (
                    <LockedBadge label="Locked" />
                  ) : c.relationshipState ? (
                    <StatusPill tone="brand">{c.relationshipState}</StatusPill>
                  ) : null}
                </div>
              </div>
              {c.description && <p className="mt-3 text-sm text-ink-500">{c.description}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
