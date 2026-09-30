import { lazy, Suspense, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { missionsApi } from '@/lib/api/endpoints'
import type { MissionRun, ActivitySummary } from '@/lib/api/learning-types'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Button } from '@/components/ui/Button'
import { ActivityView } from './activities/ActivityView'

// Coding runtime is dynamically imported ONLY when a CODE activity mounts, so
// the heavy sandbox never loads on non-coding missions (perf gate).
const CodingActivityPanel = lazy(() =>
  import('./activities/CodingActivityPanel').then((m) => ({ default: m.CodingActivityPanel })),
)

interface SubmitResult {
  success: boolean | null
  score: number | null
  feedback?: string | null
}

/** Mission player: walks activities, submits each, then completes. Real
 * missions run/submit/complete + coding-sandbox for CODE. */
export function MissionPlayerPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { runId = '' } = useParams<{ runId: string }>()

  const [index, setIndex] = useState(0)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)

  const { data: run, isLoading, isError, refetch } = useQuery({
    queryKey: ['run', runId],
    queryFn: async () => (await missionsApi.getRun(runId)).data as MissionRun,
    enabled: Boolean(runId),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!run) return <EmptyState />

  const activities = run.activities ?? []
  const activity: ActivitySummary | undefined = activities[index]
  const isLast = index >= activities.length - 1

  async function handleSubmit(response: Record<string, unknown>) {
    if (!activity) return
    setSubmitting(true)
    try {
      const res = (await missionsApi.submit(runId, { activityId: activity.id, response })).data as SubmitResult
      setResult(res)
    } catch {
      setResult({ success: false, score: 0, feedback: t('states.error') })
    } finally {
      setSubmitting(false)
    }
  }

  async function next() {
    setResult(null)
    if (isLast) {
      setCompleting(true)
      try {
        await missionsApi.complete(runId)
        navigate('/app/progress', { replace: true })
      } finally {
        setCompleting(false)
      }
    } else {
      setIndex((i) => i + 1)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-2" aria-hidden>
        {activities.map((a, i) => (
          <span
            key={a.id}
            className={`h-1.5 flex-1 rounded-pill ${i < index ? 'bg-brand-500' : i === index ? 'bg-brand-300' : 'bg-line'}`}
          />
        ))}
      </div>
      <h1 className="font-display text-xl font-bold text-ink-900">{run.mission.title}</h1>

      {activity ? (
        activity.type === 'CODE' ? (
          <Suspense fallback={<LoadingState />}>
            <CodingActivityPanel
              runId={runId}
              activityId={activity.id}
              onGraded={(r) => setResult(r)}
            />
          </Suspense>
        ) : (
          <ActivityView activity={activity} disabled={submitting || !!result} onSubmit={handleSubmit} />
        )
      ) : (
        <EmptyState />
      )}

      {result && (
        <div
          role="status"
          className={`rounded-card border p-4 ${result.success ? 'border-success-500 bg-success-100' : 'border-warning-500 bg-warning-100'}`}
        >
          <p className="font-medium text-ink-900">
            {result.success ? t('learner.correct') : t('learner.tryAgain')}
          </p>
          {result.feedback && <p className="mt-1 text-sm text-ink-600">{result.feedback}</p>}
          <Button className="mt-3" onClick={next} loading={completing}>
            {isLast ? t('learner.missionComplete') : t('common.next')}
          </Button>
        </div>
      )}
    </div>
  )
}
