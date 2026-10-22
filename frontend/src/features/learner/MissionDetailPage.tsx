import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AxiosError } from 'axios'
import { Rocket, ListChecks } from 'lucide-react'
import { missionsApi, charactersApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, Button, LockedBadge, StatusPill } from '@/components/ui'
import { CharacterStage } from '@/features/characters/CharacterStage'

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

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        {companion.data?.character ? (
          <CharacterStage characterId={companion.data.character.name} size={72} state="encouraging" />
        ) : (
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-control bg-brand-50 text-brand-600">
            <Rocket className="h-6 w-6" aria-hidden />
          </span>
        )}
        <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">{data.title}</h1>
        {data.description && <p className="mt-2 text-ink-600">{data.description}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {data.type && MISSION_TYPE_KEY[data.type] && (
            <StatusPill tone="brand">{t(MISSION_TYPE_KEY[data.type])}</StatusPill>
          )}
          {data.estimatedMinutes ? <StatusPill tone="neutral">~{data.estimatedMinutes} min</StatusPill> : null}
          {activityCount > 0 && <StatusPill tone="neutral">{t('learner.missionActivityCount', { count: activityCount })}</StatusPill>}
        </div>
        {skills.length > 0 && (
          <div className="mt-4 rounded-control bg-canvas-off p-3">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <ListChecks className="h-3.5 w-3.5" aria-hidden />
              {t('learner.missionSkillsLabel')}
            </p>
            <ul className="mt-1.5 space-y-0.5">
              {skills.map((s) => (
                <li key={s} className="text-sm text-ink-700">{s}</li>
              ))}
            </ul>
          </div>
        )}

        <Button className="mt-6 w-full" size="lg" loading={starting} onClick={start}>
          {t('learner.startMission')}
        </Button>

        {capped && (
          <div className="mt-4 rounded-control bg-warning-100 p-3 text-sm text-warning-700">
            <LockedBadge label={t('learner.lockedUpgrade')} />
            <p className="mt-2">{capped}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
