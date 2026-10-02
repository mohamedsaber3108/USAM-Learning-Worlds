import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Circle, Lock, ArrowRight } from 'lucide-react'
import { worldsApi, type WorldDetail, type WorldMission } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, StatusPill } from '@/components/ui'

const MISSION_STATUS_KEY: Record<WorldMission['status'], string> = {
  COMPLETED: 'learner.missionStatusCompleted',
  IN_PROGRESS: 'learner.missionStatusInProgress',
  AVAILABLE: 'learner.missionStatusAvailable',
  LOCKED: 'learner.missionStatusLocked',
}

/**
 * World Detail — real GET /worlds/:id (worlds.service.ts getWorld). Named
 * explicitly as a required surface ("World Details") that was previously
 * entirely missing: the app only ever showed the flat world list
 * (LearnPage) and jumped straight to a mission by id, skipping the real
 * per-world sequential-unlock view the backend already computes (each
 * mission's COMPLETED/IN_PROGRESS/AVAILABLE/LOCKED status, gated on the
 * previous mission being completed, plus the world's own unlock signal).
 */
const MISSION_STATUS_TONE: Record<WorldMission['status'], 'success' | 'brand' | 'neutral'> = {
  COMPLETED: 'success',
  IN_PROGRESS: 'brand',
  AVAILABLE: 'neutral',
  LOCKED: 'neutral',
}

export function WorldDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['world', id],
    queryFn: async () => (await worldsApi.getById(id)).data as WorldDetail,
    enabled: Boolean(id),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!data) return <EmptyState />

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.name}
        subtitle={data.description ?? undefined}
        action={
          !data.isUnlocked ? (
            <StatusPill tone="neutral">
              <Lock className="h-3.5 w-3.5" aria-hidden /> {t('learner.worldLocked')}
            </StatusPill>
          ) : undefined
        }
      />

      <section>
        <h2 className="font-display text-lg font-bold text-ink-900">{t('learner.worldMissions')}</h2>
        {data.missions.length === 0 ? (
          <EmptyState />
        ) : (
          <ol className="mt-3 space-y-2">
            {data.missions.map((m) => {
              const locked = m.status === 'LOCKED'
              const done = m.status === 'COMPLETED'
              const content = (
                <Card
                  className={`flex items-center gap-3 ${locked ? 'opacity-60' : 'transition-transform duration-fast hover:-translate-y-0.5 hover:shadow-card'}`}
                >
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success-500" aria-hidden />
                  ) : locked ? (
                    <Lock className="h-5 w-5 shrink-0 text-ink-400" aria-hidden />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-brand-400" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink-900">{m.title}</span>
                    {locked && <span className="block text-xs text-ink-400">{t('learner.missionLockedHint')}</span>}
                  </span>
                  <StatusPill tone={MISSION_STATUS_TONE[m.status]}>{t(MISSION_STATUS_KEY[m.status])}</StatusPill>
                  {!locked && <ArrowRight className="h-4 w-4 shrink-0 text-brand-600 rtl:-scale-x-100" aria-hidden />}
                </Card>
              )
              return (
                <li key={m.id}>
                  {locked ? content : <Link to={`/app/missions/${m.id}`}>{content}</Link>}
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}
