import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { worldsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'

interface World {
  id: string
  name: string
  description?: string
  domain?: { slug: string; name: string }
}

/** Learn hub — the worlds/domains the learner can enter. Each card links to the
 * generic domain path. Real GET /api/worlds; honest states. */
export function LearnPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['worlds'],
    queryFn: async () => (await worldsApi.list()).data as World[],
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!data || data.length === 0) return <EmptyState />

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-extrabold text-ink-900">{t('learner.chooseWorld')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((world) => {
          const slug = world.domain?.slug
          const card = (
            <div className="flex h-full flex-col rounded-card border border-line bg-white p-5 shadow-soft transition-colors hover:bg-canvas-off">
              <h2 className="font-display text-lg font-bold text-ink-900">{world.domain?.name ?? world.name}</h2>
              {world.description && <p className="mt-2 text-sm text-ink-500">{world.description}</p>}
            </div>
          )
          return slug ? (
            <Link key={world.id} to={`/app/learn/${slug}`}>
              {card}
            </Link>
          ) : (
            <div key={world.id}>{card}</div>
          )
        })}
      </div>
    </div>
  )
}
