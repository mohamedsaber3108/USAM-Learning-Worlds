import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Compass, Lock } from 'lucide-react'
import { worldsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { PageHeader } from '@/components/ui'
import { domainIdentity } from '@/lib/labels/domainIdentity'
import { cn } from '@/lib/utils/cn'

interface World {
  id: string
  name: string
  description?: string
  domain?: { slug: string; name: string }
  isUnlocked?: boolean
  // FIX (reverse-engineering/experience directive, 2026-10-07): the real
  // GET /worlds response already includes missionCount (confirmed via a
  // direct authenticated API call against production — Wordhaven: 11,
  // Circuit City: 8, Mindspring: 9, Launch Bay: 1) but the frontend type
  // never declared it, so it was silently dropped and the Learn hub gave
  // zero signal of how much is actually inside each world — exactly the
  // "curriculum depth is hidden" gap the directive calls out (§12).
  missionCount?: number
  // FIX (locked-state requirement, 2026-10-07/11): same real
  // unlockCondition string as WorldDetail — confirmed present on GET
  // /worlds too, not just /worlds/:id. A locked world card previously gave
  // zero explanation of what would unlock it.
  unlockCondition?: string | null
}

/** Learn hub — the learning worlds, each a themed entry to its domain path.
 * Per-domain icon + accent chip come from the shared `domainIdentity` map
 * so Home's world cards and this hub read identically (loosened Decision A:
 * one restrained accent tint per domain for wayfinding). */
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
      <PageHeader
        title={t('learner.chooseWorld')}
        action={
          <Link to="/app/explore" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
            <Compass className="h-4 w-4" aria-hidden />
            {t('learner.explore')}
          </Link>
        }
      />
      {/* World discovery — each world is an atmospheric gradient portal
          carrying the same per-domain identity + path language as World
          Detail, so Learn → World reads as one flow. Locked worlds are
          dimmed with their real unlock explanation; unlocked worlds show
          real mission depth and an obvious enter action. Original
          CSS-gradient environments, no painted art. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((world) => {
          const slug = world.domain?.slug
          const { icon: Icon, gradient } = domainIdentity(slug)
          const locked = world.isUnlocked === false
          const card = (
            <article
              className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-card border border-line shadow-soft transition-transform duration-fast',
                locked ? 'opacity-75' : 'hover:-translate-y-0.5 hover:shadow-card',
              )}
            >
              {/* Gradient atmosphere band with the domain icon + geometry. */}
              <div className={cn('relative h-24 bg-gradient-to-br', gradient)}>
                <span aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-xl" />
                <span aria-hidden className="pointer-events-none absolute -bottom-8 left-4 h-20 w-20 rounded-full bg-black/10 blur-xl" />
                <span className="absolute bottom-3 left-4 inline-flex h-12 w-12 items-center justify-center rounded-control bg-white/90 text-ink-900 shadow-soft">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                {locked && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-pill bg-black/25 px-2.5 py-1 text-xs font-medium text-white">
                    <Lock className="h-3.5 w-3.5" aria-hidden /> {t('learner.worldLocked')}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="font-display text-lg font-bold text-ink-900">{world.domain?.name ?? world.name}</h2>
                {world.name && world.domain?.name && world.name !== world.domain.name && (
                  <p className="text-xs font-medium text-ink-400">{world.name}</p>
                )}
                {world.description && <p className="mt-1 text-sm text-ink-500">{world.description}</p>}
                {typeof world.missionCount === 'number' && !locked && (
                  <p className="mt-2 text-xs font-medium text-ink-400">
                    {t('learner.worldMissionCount', { count: world.missionCount })}
                  </p>
                )}
                {locked && world.unlockCondition ? (
                  <p className="mt-2 text-xs text-ink-400">{world.unlockCondition}</p>
                ) : (
                  <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-brand-600">
                    {t('learner.enterWorld')} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
                  </span>
                )}
              </div>
            </article>
          )
          // World Detail (real sequential per-world mission order with lock
          // status) is the entry point; DomainPathPage remains reachable
          // from inside it. Locked worlds are non-navigable (no dead link).
          return locked ? (
            <div key={world.id}>{card}</div>
          ) : (
            <Link key={world.id} to={`/app/worlds/${world.id}`}>
              {card}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
