import { lazy, Suspense, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, XCircle } from 'lucide-react'
import { missionsApi, reflectionApi, charactersApi } from '@/lib/api/endpoints'
import type { MissionRun, ActivitySummary, SubmitActivityResult } from '@/lib/api/learning-types'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, Button, Textarea } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { ActivityView } from './activities/ActivityView'
import { CharacterStage } from '@/features/characters/CharacterStage'
import type { CharacterState } from '@/features/characters/CharacterFace'

const FACES = ['😣', '😕', '😐', '🙂', '😄'] as const
const RATING_KEYS = [
  'learner.reflectionRating1',
  'learner.reflectionRating2',
  'learner.reflectionRating3',
  'learner.reflectionRating4',
  'learner.reflectionRating5',
] as const

/**
 * Post-mission reflection — a real quick check-in shown after completion.
 *
 * NEW (2026-10-02, ledger 88 task 9): the backend's Metacognition Engine
 * (`reflection.controller.ts`: prompts + responses) had zero frontend trace
 * anywhere, despite its own doc comment pointing at a `MissionCompletePage`
 * that doesn't exist in this tree. Added inline in MissionPlayerPage as the
 * final step before navigating away — a short prompt, a 1-5 face-rating
 * scale (never a raw number — matches the design system's child-language
 * rule), and an optional note. Skippable; never blocks progress.
 */
function ReflectionStep({ missionRunId, onDone }: { missionRunId: string; onDone: () => void }) {
  const { t } = useTranslation()
  const [rating, setRating] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: prompts } = useQuery({
    queryKey: ['reflection-prompts'],
    queryFn: async () => (await reflectionApi.prompts()).data,
  })
  const prompt = prompts?.[0]

  async function submit() {
    if (!prompt || rating === null) return onDone()
    setSubmitting(true)
    try {
      await reflectionApi.respond({ missionRunId, promptId: prompt.id, rating, note: note.trim() || undefined })
    } finally {
      onDone()
    }
  }

  if (!prompt) {
    // No active prompts configured — don't block mission completion on it.
    onDone()
    return null
  }

  return (
    <Card>
      <h2 className="font-display font-bold text-ink-900">{t('learner.reflectionTitle')}</h2>
      <p className="mt-1 text-sm text-ink-600">{prompt.text}</p>
      <div className="mt-4 flex justify-between gap-2">
        {FACES.map((face, i) => (
          <button
            key={face}
            type="button"
            aria-label={t(RATING_KEYS[i])}
            aria-pressed={rating === i + 1}
            onClick={() => setRating(i + 1)}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-transform',
              rating === i + 1 ? 'scale-110 bg-brand-100 ring-2 ring-brand-400' : 'hover:scale-105 hover:bg-canvas-off',
            )}
          >
            {face}
          </button>
        ))}
      </div>
      <Textarea
        className="mt-4"
        placeholder={t('learner.reflectionNotePlaceholder')}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
      />
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone} disabled={submitting}>
          {t('learner.reflectionSkip')}
        </Button>
        <Button onClick={() => void submit()} disabled={submitting || rating === null} loading={submitting}>
          {t('learner.reflectionSubmit')}
        </Button>
      </div>
    </Card>
  )
}

// Coding runtime loads only when a CODE activity mounts (perf gate).
const CodingActivityPanel = lazy(() =>
  import('./activities/CodingActivityPanel').then((m) => ({ default: m.CodingActivityPanel })),
)

interface GradeView {
  correct: boolean
  feedback?: string | null
}

/** Mission player — walks activities, submits, completes. Design system + real
 * backend shapes (run.mission.activities; submit → evaluation.correct/feedback;
 * coding via lazy sandbox panel). */
export function MissionPlayerPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { runId = '' } = useParams<{ runId: string }>()

  const [index, setIndex] = useState(0)
  const [result, setResult] = useState<GradeView | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [showReflection, setShowReflection] = useState(false)

  const { data: run, isLoading, isError, refetch } = useQuery({
    queryKey: ['run', runId],
    queryFn: async () => (await missionsApi.getRun(runId)).data as MissionRun,
    enabled: Boolean(runId),
  })
  // Companion presence (owner directive: companions must appear inside the
  // mission player, not just the gallery+chat). Real GET /characters/
  // orchestrate, scoped to this mission so the backend's domain-aware
  // fallback picks the right mentor for the subject being played.
  const companion = useQuery({
    queryKey: ['mission-companion', run?.missionId],
    queryFn: async () => (await charactersApi.orchestrate({ missionId: run?.missionId })).data,
    enabled: Boolean(run?.missionId),
    retry: false,
  })
  const companionState: CharacterState = result ? (result.correct ? 'celebrating' : 'encouraging') : 'idle'

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!run) return <EmptyState />

  const activities = run.mission?.activities ?? []
  const activity: ActivitySummary | undefined = activities[index]
  const isLast = index >= activities.length - 1

  async function handleSubmit(response: Record<string, unknown>) {
    if (!activity) return
    setSubmitting(true)
    try {
      const res = (await missionsApi.submit(runId, { activityId: activity.id, response })).data as SubmitActivityResult
      setResult({ correct: res.evaluation?.correct ?? false, feedback: res.evaluation?.feedback })
    } catch {
      setResult({ correct: false, feedback: t('states.error') })
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
        setShowReflection(true)
      } finally {
        setCompleting(false)
      }
    } else {
      setIndex((i) => i + 1)
    }
  }

  if (showReflection) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        {companion.data?.character && (
          <div className="flex justify-center">
            <CharacterStage characterId={companion.data.character.name} size={88} state="encouraging" />
          </div>
        )}
        <ReflectionStep missionRunId={runId} onDone={() => navigate('/app/progress', { replace: true })} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Progress dots */}
      <div className="flex items-center gap-1.5" aria-hidden>
        {activities.map((a, i) => (
          <span
            key={a.id}
            className={cn('h-1.5 flex-1 rounded-pill', i < index ? 'bg-brand-500' : i === index ? 'bg-brand-300' : 'bg-line')}
          />
        ))}
      </div>
      <div className="flex items-center gap-3">
        {companion.data?.character && (
          <CharacterStage characterId={companion.data.character.name} size={56} state={companionState} animate />
        )}
        <h1 className="font-display text-xl font-bold text-ink-900">{run.mission.title}</h1>
      </div>

      {/* FIX (reverse-engineering/experience directive, 2026-10-07, §12/§15):
          per-activity learning objective — real data (run.mission.activities[i].
          objective), previously fetched but never shown. Answers "what will
          I learn right now" at the exact moment it matters, not buried in a
          separate curriculum page. */}
      {activity?.objective && (
        <p className="text-sm font-medium text-brand-600">{activity.objective.name}</p>
      )}

      {activity ? (
        activity.type === 'CODE' ? (
          <Suspense fallback={<LoadingState />}>
            <CodingActivityPanel
              runId={runId}
              activityId={activity.id}
              onGraded={(r) => setResult({ correct: Boolean(r.success), feedback: r.feedback })}
            />
          </Suspense>
        ) : (
          <ActivityView activity={activity} disabled={submitting || !!result} onSubmit={handleSubmit} />
        )
      ) : (
        <EmptyState />
      )}

      {result && (
        <Card
          className={cn(
            'border-2',
            result.correct ? 'border-success-500 bg-success-100' : 'border-warning-500 bg-warning-100',
          )}
        >
          <p className="inline-flex items-center gap-2 font-display font-bold text-ink-900">
            {result.correct ? (
              <CheckCircle2 className="h-5 w-5 text-success-700" aria-hidden />
            ) : (
              <XCircle className="h-5 w-5 text-warning-700" aria-hidden />
            )}
            {result.correct ? t('learner.correct') : t('learner.tryAgain')}
          </p>
          {result.feedback && <p className="mt-1 text-sm text-ink-600">{result.feedback}</p>}
          <Button className="mt-3" onClick={next} loading={completing}>
            {isLast ? t('learner.missionComplete') : t('common.next')}
          </Button>
        </Card>
      )}
    </div>
  )
}
