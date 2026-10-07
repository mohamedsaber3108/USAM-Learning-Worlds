import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AxiosError } from 'axios'
import { Rocket } from 'lucide-react'
import { missionsApi, charactersApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, Button, LockedBadge } from '@/components/ui'
import { CharacterStage } from '@/features/characters/CharacterStage'

interface Mission {
  id: string
  title: string
  description?: string
  estimatedMinutes?: number
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
        {data.estimatedMinutes ? (
          <p className="mt-2 text-sm text-ink-400">~{data.estimatedMinutes} min</p>
        ) : null}

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
