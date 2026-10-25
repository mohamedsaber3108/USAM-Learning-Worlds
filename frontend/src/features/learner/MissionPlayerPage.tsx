import { lazy, Suspense, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, XCircle } from 'lucide-react'
import { missionsApi, reflectionApi, charactersApi, masteryApi } from '@/lib/api/endpoints'
import type { MissionRun, ActivitySummary, SubmitActivityResult, MasteryRecord } from '@/lib/api/learning-types'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, Button, Textarea, StatusPill } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { ActivityView } from './activities/ActivityView'
import { CharacterStage } from '@/features/characters/CharacterStage'
import type { CharacterState } from '@/features/characters/CharacterFace'
import { masteryLabel } from '@/lib/labels/masteryLabels'

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

interface CompletionOutcome {
  finalScore: number
  passed: boolean
  requiredActivities: number
  activitiesAttempted: number
  xp:
    | { awarded: false; alreadyAwarded?: boolean; error?: boolean }
    | { awarded: true; amount: number; leveledUp: boolean; newLevel: number }
}

/**
 * Mission completion summary — real outcome from POST
 * /missions/runs/:runId/complete (missions.service.ts completeMission),
 * shown before reflection.
 *
 * FIX (reverse-engineering/experience directive, 2026-10-07, §15): the
 * backend already computes a rich real outcome on completion (final score,
 * pass/fail against the mastery threshold, how many required activities
 * were attempted, and the real XP award with level-up detection) — none of
 * it was ever shown; the player discarded the response and jumped straight
 * to reflection. A child finishing a mission saw no evidence their work
 * counted. This screen shows exactly what's real, nothing fabricated: no
 * "evidence created" claim beyond what completeMission computes, no fake
 * "unlocked" badge unless this was a genuine level-up.
 */
function CompletionSummary({
  outcome,
  masteryImpact,
  onContinue,
}: {
  outcome: CompletionOutcome
  masteryImpact: MasteryRecord[]
  onContinue: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      {/* Celebration header — gradient environment keyed to pass/fail,
          original CSS, no painted art. */}
      <header
        className={cn(
          'relative overflow-hidden rounded-card bg-gradient-to-br p-6 text-center text-white shadow-card',
          outcome.passed ? 'from-emerald-500 to-emerald-700' : 'from-amber-500 to-amber-700',
        )}
      >
        <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
        <p className="relative font-display text-3xl font-extrabold">
          {outcome.passed ? t('learner.missionComplete') : t('learner.missionNotPassed')}
        </p>
        <p className="relative mt-1 text-sm text-white/85">
          {t('learner.missionScore', { score: outcome.finalScore })} ·{' '}
          {t('learner.missionActivitiesDone', { done: outcome.activitiesAttempted, total: outcome.requiredActivities })}
        </p>
        {outcome.xp.awarded && (
          <div className="relative mt-4 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-pill bg-white/20 px-3 py-1 text-sm font-bold">
              +{outcome.xp.amount} XP
            </span>
            {outcome.xp.leveledUp && (
              <span className="inline-flex items-center gap-1 rounded-pill bg-white/90 px-3 py-1 text-sm font-bold text-ink-900">
                {t('learner.levelUp', { level: outcome.xp.newLevel })}
              </span>
            )}
          </div>
        )}
      </header>

      {/* Mastery impact — real GET /mastery/overview filtered to this
          mission's own touched competencies (not a fabricated delta). Only
          shown when real records exist. */}
      {masteryImpact.length > 0 && (
        <section className="rounded-card border border-line bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t('learner.masteryBy')}</p>
          <div className="mt-2 space-y-1.5">
            {masteryImpact.map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <span className="min-w-0 truncate text-sm text-ink-700">{m.competency?.name ?? m.competencyId}</span>
                <StatusPill tone="brand">{masteryLabel(m.state)}</StatusPill>
              </div>
            ))}
          </div>
        </section>
      )}

      <Button className="w-full" size="lg" onClick={onContinue}>
        {t('common.next')}
      </Button>
    </div>
  )
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
  const [outcome, setOutcome] = useState<CompletionOutcome | null>(null)
  const [showReflection, setShowReflection] = useState(false)
  const [reflectionDone, setReflectionDone] = useState(false)

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
  // FIX (mega-directive Batch 5, "Mission Player is the core experience" —
  // interaction quality): the real CharacterFace state machine already has a
  // dedicated `thinking` state (slow tilt + animated thought dots), built
  // for exactly this moment, but it was never wired here — the companion sat
  // in `idle` while an answer was being graded, then jumped straight to
  // celebrating/encouraging. No new state added; just using the one that
  // already exists for the real `submitting` moment.
  const companionState: CharacterState = submitting
    ? 'thinking'
    : result
      ? result.correct
        ? 'celebrating'
        : 'encouraging'
      : 'idle'
  // Mastery impact on completion — real GET /mastery/overview, filtered
  // client-side to this mission's own competencies (see CompletionSummary's
  // doc comment above for why this is real data, not a new endpoint).
  // Only fetched once the mission is actually complete.
  const masteryOverview = useQuery({
    queryKey: ['mastery-overview', 'mission-complete', runId],
    queryFn: async () => (await masteryApi.getOverview()).data as MasteryRecord[],
    enabled: Boolean(outcome),
    retry: false,
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!run) return <EmptyState />

  const activities = run.mission?.activities ?? []
  const missionCompetencyIds = new Set(
    activities.map((a) => a.objective?.competencyId).filter((id): id is string => Boolean(id)),
  )
  const masteryImpact = (masteryOverview.data ?? []).filter((m) => missionCompetencyIds.has(m.competencyId))
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
        const res = await missionsApi.complete(runId)
        setOutcome(res.data.outcome)
      } finally {
        setCompleting(false)
      }
    } else {
      setIndex((i) => i + 1)
    }
  }

  if (outcome && !showReflection) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        {companion.data?.character && (
          <div className="flex justify-center">
            <CharacterStage characterId={companion.data.character.name} size={88} state={outcome.passed ? 'celebrating' : 'encouraging'} />
          </div>
        )}
        <CompletionSummary outcome={outcome} masteryImpact={masteryImpact} onContinue={() => setShowReflection(true)} />
      </div>
    )
  }

  if (showReflection) {
    const nextHref = run.mission.worldId ? `/app/worlds/${run.mission.worldId}` : '/app/learn'
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        {companion.data?.character && (
          <div className="flex justify-center">
            <CharacterStage characterId={companion.data.character.name} size={88} state="encouraging" />
          </div>
        )}
        <ReflectionStep
          missionRunId={runId}
          onDone={() => setReflectionDone(true)}
        />
        {/* No dead end: after reflection (done or skipped) a real next
            action is always offered — back into the world's path (where
            the next mission's unlock state is now updated) or the Learn
            hub. Only shown once reflection is resolved so it doesn't
            compete with the reflection prompt. */}
        {reflectionDone && (
          <Button className="w-full" size="lg" onClick={() => navigate(nextHref, { replace: true })}>
            {run.mission.worldId ? t('learner.backToWorld') : t('nav.learn')}
          </Button>
        )}
      </div>
    )
  }

  const activityNumber = Math.min(index + 1, activities.length)
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Mission header environment — gradient band matching Mission Detail,
          with the companion staged (live state: thinking/celebrating/
          encouraging), the mission title, and a real step counter + segmented
          progress bar. Original CSS; no painted art. */}
      <header className="relative overflow-hidden rounded-card bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-card">
        <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          {companion.data?.character && (
            <CharacterStage characterId={companion.data.character.name} size={56} state={companionState} animate className="shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
              {t('learner.missionActivityStep', { current: activityNumber, total: activities.length })}
            </p>
            <h1 className="truncate font-display text-xl font-extrabold">{run.mission.title}</h1>
          </div>
        </div>
        {/* Segmented progress trail — real per-activity position. */}
        <div className="relative mt-4 flex items-center gap-1.5" role="progressbar" aria-valuenow={index} aria-valuemin={0} aria-valuemax={activities.length}>
          {activities.map((a, i) => (
            <span
              key={a.id}
              aria-hidden
              className={cn('h-1.5 flex-1 rounded-pill', i < index ? 'bg-white' : i === index ? 'bg-white/60' : 'bg-white/20')}
            />
          ))}
        </div>
      </header>

      {/* Per-activity learning objective — real data (run.mission.
          activities[i].objective), answering "what will I learn right now"
          at the moment it matters. */}
      {activity?.objective && (
        <p className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden />
          {activity.objective.name}
        </p>
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
