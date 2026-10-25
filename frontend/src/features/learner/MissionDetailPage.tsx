import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AxiosError } from 'axios'
import { Rocket, ListChecks, Target, Clock, Layers } from 'lucide-react'
import { missionsApi, charactersApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Button, LockedBadge, StatusPill } from '@/components/ui'
import { CharacterStage } from '@/features/characters/CharacterStage'
import { cn } from '@/lib/utils/cn'

// FIX (mega-directive Batch 2, "Mission Brief" §18 — learning objective,
// skills, activities): GET /missions/:id (missions.service.ts getMission)
// already returns the mission's real `type` (MissionType enum) and a real
// `activities[]` array (each with its real objective + competency),
// confirmed via a direct authenticated API call against production — but
// the frontend's Mission type only ever declared id/title/description/
// estimatedMinutes, so the Brief told the learner nothing about what the
// mission actually covers before they started it. No new backend contract
// needed; this data was already being fetched and discarded.
interface MissionActivitySummary {
  id: string
  objective?: { name: string; competency?: { name: string } | null } | null
}
interface Mission {
  id: string
  title: string
  description?: string
  estimatedMinutes?: number
  type?: 'GUIDED' | 'EXPLORATION' | 'CHALLENGE' | 'PROJECT_BASED'
  activities?: MissionActivitySummary[]
}

const MISSION_TYPE_KEY: Record<string, string> = {
  GUIDED: 'learner.missionTypeGuided',
  EXPLORATION: 'learner.missionTypeExploration',
  CHALLENGE: 'learner.missionTypeChallenge',
  PROJECT_BASED: 'learner.missionTypeProjectBased',
}

/**
 * Mission brief → start. Entitlement cap (403 missionsPerDay) renders as an
 * honest locked state, not a crash. On the design system.
 *
 * FIX (reverse-engineering/experience directive, 2026-10-06): this is the
 * mission BRIEF — the moment the directive asks "what will the learner
 * learn, who is helping them" — and it had zero companion presence (every
 * other core learning surface — Home, Practice, Mission Player, Projects —
 * already carries the real GET /characters/orchestrate pick; this page was
 * the one gap in that chain). Added the same pattern: scoped to this
 * mission so the backend's domain-aware fallback picks the matching mentor,
 * speaking a short real framing line (not a fabricated script — reuses the
 * existing `learner.startMission`/mission data already on the page).
 */
export function MissionDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const [starting, setStarting] = useState(false)
  const [capped, setCapped] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mission', id],
    queryFn: async () => (await missionsApi.getById(id)).data as Mission,
    enabled: Boolean(id),
  })
  const companion = useQuery({
    queryKey: ['mission-brief-companion', id],
    queryFn: async () => (await charactersApi.orchestrate({ missionId: id })).data,
    enabled: Boolean(id),
    retry: false,
  })

  async function start() {
    setStarting(true)
    setCapped(null)
    try {
      const run = (await missionsApi.start(id)).data as { id: string }
      navigate(`/app/runs/${run.id}`)
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 403) {
        setCapped((err.response.data as { message?: string })?.message ?? t('learner.lockedUpgrade'))
      } else {
        setCapped(t('states.error'))
      }
    } finally {
      setStarting(false)
    }
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!data) return <EmptyState />

  const activityCount = data.activities?.length ?? 0
  const skills = Array.from(
    new Set((data.activities ?? []).map((a) => a.objective?.competency?.name).filter((n): n is string => Boolean(n))),
  )
  // Distinct learning objectives named by this mission's real activities.
  const objectives = Array.from(
    new Set((data.activities ?? []).map((a) => a.objective?.name).filter((n): n is string => Boolean(n))),
  )

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Mission-brief scene header — original CSS-gradient environment
          with the companion staged as the mission guide. No painted art. */}
      <header className="relative overflow-hidden rounded-card bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-card">
        <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-black/10 blur-2xl" />
        <div className="relative flex items-start gap-4">
          {companion.data?.character ? (
            <CharacterStage characterId={companion.data.character.name} size={72} state="encouraging" className="shrink-0" />
          ) : (
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-control bg-white/15">
              <Rocket className="h-7 w-7" aria-hidden />
            </span>
          )}
          <div className="min-w-0 flex-1">
            {data.type && MISSION_TYPE_KEY[data.type] && (
              <span className="inline-block rounded-pill bg-white/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide">
                {t(MISSION_TYPE_KEY[data.type])}
              </span>
            )}
            <h1 className="mt-2 font-display text-2xl font-extrabold">{data.title}</h1>
            {data.description && <p className="mt-1 max-w-prose text-sm text-white/85">{data.description}</p>}
          </div>
        </div>
      </header>

      {/* At-a-glance brief stats — real mission metadata. */}
      <div className="grid gap-3 sm:grid-cols-3">
        <BriefStat icon={<Layers className="h-4 w-4" aria-hidden />} label={t('learner.missionActivityCount', { count: activityCount })} />
        {data.estimatedMinutes ? (
          <BriefStat icon={<Clock className="h-4 w-4" aria-hidden />} label={`~${data.estimatedMinutes} min`} />
        ) : null}
        {skills.length > 0 && (
          <BriefStat icon={<Target className="h-4 w-4" aria-hidden />} label={t('learner.missionSkillCount', { count: skills.length })} />
        )}
      </div>

      {/* Objectives — what you'll learn (real activity objective names). */}
      {objectives.length > 0 && (
        <section className="rounded-card border border-line bg-white p-5 shadow-soft">
          <h2 className="inline-flex items-center gap-1.5 font-display font-bold text-ink-900">
            <Target className="h-4 w-4 text-brand-500" aria-hidden />
            {t('learner.missionObjectives')}
          </h2>
          <ul className="mt-3 space-y-2">
            {objectives.map((o) => (
              <li key={o} className="flex items-start gap-2 text-sm text-ink-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden />
                {o}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Skills you'll practice — real competency names. */}
      {skills.length > 0 && (
        <section className="rounded-card border border-line bg-white p-5 shadow-soft">
          <h2 className="inline-flex items-center gap-1.5 font-display font-bold text-ink-900">
            <ListChecks className="h-4 w-4 text-brand-500" aria-hidden />
            {t('learner.missionSkillsLabel')}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((s) => (
              <StatusPill key={s} tone="neutral">{s}</StatusPill>
            ))}
          </div>
        </section>
      )}

      <Button className={cn('w-full', 'sticky bottom-4')} size="lg" loading={starting} onClick={start}>
        {t('learner.startMission')}
      </Button>

      {capped && (
        <div className="rounded-control bg-warning-100 p-3 text-sm text-warning-700">
          <LockedBadge label={t('learner.lockedUpgrade')} />
          <p className="mt-2">{capped}</p>
        </div>
      )}
    </div>
  )
}

/** Small at-a-glance brief stat chip for the mission header row. */
function BriefStat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-control border border-line bg-white p-3 text-sm font-medium text-ink-700 shadow-soft">
      <span className="text-brand-500">{icon}</span>
      <span className="min-w-0 truncate">{label}</span>
    </div>
  )
}
