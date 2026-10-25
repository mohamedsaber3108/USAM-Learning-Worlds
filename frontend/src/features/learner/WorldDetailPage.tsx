import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Lock, ArrowRight } from 'lucide-react'
import { worldsApi, charactersApi, type WorldDetail, type WorldMission } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { CharacterStage } from '@/features/characters/CharacterStage'
import { domainIdentity } from '@/lib/labels/domainIdentity'
import { WorldPath } from './WorldPath'
import { cn } from '@/lib/utils/cn'

const MISSION_STATUS_KEY: Record<WorldMission['status'], string> = {
  COMPLETED: 'learner.missionStatusCompleted',
  IN_PROGRESS: 'learner.missionStatusInProgress',
  AVAILABLE: 'learner.missionStatusAvailable',
  LOCKED: 'learner.missionStatusLocked',
}

// Same real MissionType vocabulary as MissionDetailPage's Mission Brief —
// see endpoints.ts WorldMission comment for why this field is real but was
// previously undeclared.
const MISSION_TYPE_KEY: Record<string, string> = {
  GUIDED: 'learner.missionTypeGuided',
  EXPLORATION: 'learner.missionTypeExploration',
  CHALLENGE: 'learner.missionTypeChallenge',
  PROJECT_BASED: 'learner.missionTypeProjectBased',
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
  // Companion presence (reverse-engineering/experience directive, 2026-10-06):
  // the world/mission-sequence view — "where am I, who is helping me" per
  // the directive's journey map — had zero companion presence, the one gap
  // in an otherwise-consistent chain (Home/Practice/Mission Brief/Mission
  // Player/Projects all already carry this). Scoped by domainSlug so the
  // backend's domain-aware fallback picks the matching mentor for the world.
  const companion = useQuery({
    queryKey: ['world-companion', data?.domain?.slug],
    queryFn: async () => (await charactersApi.orchestrate({ domainSlug: data?.domain?.slug })).data,
    enabled: Boolean(data?.domain?.slug),
    retry: false,
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!data) return <EmptyState />

  const identity = domainIdentity(data.domain?.slug)
  // Real "where should I go next" wayfinding (directive §11/§12 "CURRENT
  // LOCATION"/"NEXT"), derived client-side from the backend's real
  // sequential status — first IN_PROGRESS, else first AVAILABLE.
  const nextMission =
    data.missions.find((m) => m.status === 'IN_PROGRESS') ?? data.missions.find((m) => m.status === 'AVAILABLE')
  const completedCount = data.missions.filter((m) => m.status === 'COMPLETED').length
  const totalCount = data.missions.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Atmospheric world header — an original CSS-gradient environment
          panel (per-domain accent, no painted art), with the world's
          companion staged inside it, a real completed/total progress bar,
          and the locked-state explanation when the world isn't unlocked. */}
      <header className={cn('relative overflow-hidden rounded-card bg-gradient-to-br p-6 text-white shadow-card', identity.gradient)}>
        {/* Decorative geometric atmosphere — pure CSS, aria-hidden. */}
        <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
        <div className="relative flex items-start gap-4">
          {companion.data?.character && (
            <CharacterStage characterId={companion.data.character.name} size={72} className="shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-extrabold">{data.name}</h1>
            {data.description && <p className="mt-1 max-w-prose text-sm text-white/85">{data.description}</p>}
            {!data.isUnlocked && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-black/20 px-3 py-1 text-xs font-medium">
                <Lock className="h-3.5 w-3.5" aria-hidden /> {t('learner.worldLocked')}
              </span>
            )}
          </div>
        </div>
        {totalCount > 0 && (
          <div className="relative mt-5">
            <div className="flex items-center justify-between text-xs font-medium text-white/85">
              <span>{t('learner.worldMissionCount', { count: totalCount })}</span>
              <span>{t('learner.worldProgress', { completed: completedCount, total: totalCount })}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-pill bg-white/20" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-pill bg-white transition-[width] duration-slow" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </header>

      {!data.isUnlocked && data.unlockCondition && (
        <p className="rounded-control bg-canvas-off p-3 text-sm text-ink-600">{data.unlockCondition}</p>
      )}

      {/* The ONE next action — surfaced above the path so it's obvious. */}
      {nextMission && (
        <Link
          to={`/app/missions/${nextMission.id}`}
          className="flex items-center justify-between gap-3 rounded-card border border-brand-200 bg-brand-50 p-4 transition-transform duration-fast hover:-translate-y-0.5 hover:shadow-card"
        >
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase tracking-wide text-brand-600">
              {nextMission.status === 'IN_PROGRESS' ? t('learner.continue') : t('learner.startHere')}
            </span>
            <span className="block truncate font-display font-bold text-ink-900">{nextMission.title}</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-brand-600 rtl:-scale-x-100" aria-hidden />
        </Link>
      )}

      <section>
        <h2 className="font-display text-lg font-bold text-ink-900">{t('learner.worldMissions')}</h2>
        {data.missions.length === 0 ? (
          <EmptyState />
        ) : (
          <WorldPath
            missions={data.missions}
            nextMissionId={nextMission?.id}
            accentChip={identity.chip}
            accentSolid={identity.solid}
            statusLabel={(m) => t(MISSION_STATUS_KEY[m.status])}
            statusTone={(m) => MISSION_STATUS_TONE[m.status]}
            typeLabel={(m) => (m.type && MISSION_TYPE_KEY[m.type] ? t(MISSION_TYPE_KEY[m.type]) : null)}
          />
        )}
      </section>
    </div>
  )
}
