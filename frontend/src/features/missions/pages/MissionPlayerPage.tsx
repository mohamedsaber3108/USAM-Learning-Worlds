import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { missionsApi, codingSandboxApi } from '@/lib/api/endpoints'
import { CodeMissionRunner } from '@/features/coding/components/CodeMissionRunner'
import { CharacterAvatar } from '@/features/characters/components/CharacterAvatar'
import { getCharacterVisual } from '@/features/characters/lib/characterVisuals'
import {
  getMissionCompanionName,
  getCompanionLine,
} from '@/features/missions/lib/missionCompanion'

/**
 * Feedback shown right after a submit resolves. `null` while nothing has
 * been submitted yet for the current activity (e.g. right after Next).
 */
interface AnswerFeedback {
  correct: boolean
  feedback?: string
  line: string
}

export function MissionPlayerPage() {
  const { runId } = useParams<{ runId: string }>()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null)
  const [streak, setStreak] = useState(0)

  const { data: run, isLoading } = useQuery({
    queryKey: ['mission-run', runId],
    queryFn: () => missionsApi.getRun(runId!).then(res => res.data),
    enabled: !!runId,
  })

  const companionName = useMemo(() => getMissionCompanionName(run?.mission), [run?.mission])
  const companionVisual = getCharacterVisual(companionName)

  const submitMutation = useMutation({
    mutationFn: (data: any) => missionsApi.submitActivity(runId!, data),
    onSuccess: (response) => {
      const evaluation = response?.data?.evaluation
      const correct = evaluation?.correct !== false // absent => treat as pass (e.g. CODE path)
      const nextStreak = correct ? streak + 1 : 0
      setStreak(nextStreak)
      setFeedback({
        correct,
        feedback: evaluation?.feedback,
        line: getCompanionLine(
          companionName,
          !correct ? 'incorrect' : nextStreak >= 3 ? 'streak' : 'correct',
        ),
      })
      setError('')
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Submission failed')
    },
  })

  const completeMutation = useMutation({
    mutationFn: () => missionsApi.complete(runId!),
    onSuccess: (response) => {
      navigate('/missions/complete', {
        state: { result: response.data, runId },
      })
    },
  })

  const activities = run?.mission?.activities || []
  const currentActivity = activities[currentIndex]

  // Reset the per-activity feedback banner whenever the learner moves to a
  // new activity (Next/Previous), so it never lingers on the wrong question.
  useEffect(() => {
    setFeedback(null)
  }, [currentIndex])

  const handleAdvance = () => {
    setFeedback(null)
    if (currentIndex < activities.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      completeMutation.mutate()
    }
  }

  if (isLoading || !run) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentActivity) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">No activities found</p>
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    const answer = answers[currentActivity.id]
    if (!answer) {
      setError('Please provide an answer')
      return
    }

    let formattedResponse: any = answer
    const type = currentActivity.type
    if (type === 'SELECT' || type === 'multiple_choice') {
      formattedResponse = { selectedAnswers: [answer] }
    } else if (type === 'SOLVE' || type === 'fill_blank') {
      formattedResponse = { answer }
    } else if (type === 'EXPLAIN' || type === 'short_answer') {
      formattedResponse = { explanation: answer }
    } else if (type === 'CODE' || type === 'coding') {
      formattedResponse = { code: answer }
    } else if (type === 'CREATE') {
      formattedResponse = { submission: answer, description: answer }
    } else {
      formattedResponse = { answer }
    }

    submitMutation.mutate({
      activityId: currentActivity.id,
      response: formattedResponse,
    })
  }

  const stepsRemaining = activities.length - (currentIndex + 1)

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white shadow-soft sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-heading font-bold text-slate-900">
              {run.mission?.title || 'Mission'}
            </h1>
            <span className="text-sm font-medium text-slate-500">
              {stepsRemaining > 0
                ? `${stepsRemaining} step${stepsRemaining === 1 ? '' : 's'} left`
                : 'Final step'}
            </span>
          </div>
          <MissionStepper total={activities.length} current={currentIndex} />
        </div>
      </header>

      {/* Companion strip */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <CompanionBanner
          name={companionName}
          color={companionVisual.color}
          feedback={feedback}
          currentIndex={currentIndex}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          key={currentActivity.id}
          initial={{ opacity: 0, y: 8 }}
          animate={
            feedback?.correct === false
              ? { opacity: 1, y: 0, x: [0, -4, 3, -2, 1, 0] }
              : { opacity: 1, y: 0, x: 0 }
          }
          transition={{ duration: 0.2 }}
          className={`card border-2 transition-[border-color,box-shadow] duration-300 ${
            feedback?.correct === true
              ? 'border-success-300 shadow-glow-success'
              : feedback?.correct === false
              ? 'border-error-300 shadow-glow-error'
              : 'border-surface-200/70'
          }`}
        >
          {/* Activity Type Badge */}
          <div className="mb-4">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
              {currentActivity.type.replace('_', ' ')}
            </span>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              {currentActivity.content?.question || currentActivity.content?.problem || currentActivity.content?.prompt || currentActivity.title || currentActivity.question || currentActivity.prompt}
            </h2>
            {(currentActivity.content?.context || currentActivity.context) && (
              <p className="text-slate-600 mb-4">{currentActivity.content?.context || currentActivity.context}</p>
            )}
          </div>

          {/* Activity Content */}
          {(currentActivity.type === 'CODE' || currentActivity.type === 'coding') ? (
            <CodeActivity
              activityId={currentActivity.id}
              runId={runId!}
              onDone={handleAdvance}
            />
          ) : (
            <ActivityContent
              activity={currentActivity}
              answer={answers[currentActivity.id]}
              disabled={feedback !== null}
              feedback={feedback}
              onChange={(value) =>
                setAnswers({ ...answers, [currentActivity.id]: value })
              }
            />
          )}

          {/* Inline correct/incorrect feedback */}
          <AnimatePresence>
            {feedback && (
              <FeedbackBanner feedback={feedback} />
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700">
              {error}
            </div>
          )}

          {/* Submit / Continue Buttons */}
          {currentActivity.type !== 'CODE' && currentActivity.type !== 'coding' && (
            <div className="mt-6 flex justify-between items-center">
              <motion.button
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
                disabled={currentIndex === 0 || feedback !== null}
                className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 rtl:scale-x-[-1]" /> Previous
              </motion.button>

              {feedback === null ? (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {submitMutation.isPending ? 'Checking...' : 'Check'}
                </motion.button>
              ) : (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 24 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleAdvance}
                  disabled={completeMutation.isPending}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {completeMutation.isPending
                    ? 'Finishing...'
                    : currentIndex === activities.length - 1
                    ? 'Complete Mission'
                    : (
                      <span className="inline-flex items-center gap-1">
                        Next <ChevronRight className="w-4 h-4 rtl:scale-x-[-1]" />
                      </span>
                    )}
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

/**
 * Step-through progress indicator: individual pill segments (one per
 * activity, filled as completed, highlighted on the current one) rather
 * than a single generic bar/spinner — this is what actually communicates
 * "3 of 7 steps, 4 left" at a glance, Duolingo/Khan-style.
 */
function MissionStepper({ total, current }: { total: number; current: number }) {
  if (total <= 0) return null
  return (
    <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={current + 1} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'upcoming'
        return (
          <motion.div
            key={i}
            className={`h-2 flex-1 rounded-full ${
              state === 'done'
                ? 'bg-success-500'
                : state === 'active'
                ? 'bg-primary-500'
                : 'bg-surface-200'
            }`}
            initial={false}
            animate={state === 'active' ? { scaleY: [1, 1.4, 1] } : { scaleY: 1 }}
            transition={{ duration: 0.4 }}
          />
        )
      })}
    </div>
  )
}

/**
 * Persistent character companion presence for the whole mission run — not
 * just a chat-page feature. Reacts with a short line to the moment
 * (starting, just answered right/wrong, on a streak) via its existing
 * illustrated CharacterFace idle animation, so the mission always feels
 * accompanied rather than a bare form.
 */
function CompanionBanner({
  name,
  color,
  feedback,
  currentIndex,
}: {
  name: string
  color: string
  feedback: AnswerFeedback | null
  currentIndex: number
}) {
  // Re-derive a fresh idle line each time the learner moves to a new step
  // (currentIndex changes) so the companion doesn't repeat itself endlessly;
  // once real feedback exists it always takes priority over the idle line.
  const idleLine = useMemo(() => getCompanionLine(name, 'start'), [name, currentIndex])
  const line = feedback?.line ?? idleLine
  return (
    <div className="flex items-center gap-3 bg-white rounded-card shadow-soft px-4 py-3 border border-surface-200/70">
      <CharacterAvatar name={name} size="md" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          {name}
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="text-sm text-slate-700 truncate"
          >
            {line}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * Correct/incorrect feedback banner. Deliberately restrained: a single
 * spring-in icon + one-line message + a soft color wash, no confetti burst
 * or screen-wide overlay. The satisfying part is the snappy spring easing
 * on the icon and the (very short) scale pulse, mirroring Duolingo's
 * "correct" beat without being loud about it.
 */
function FeedbackBanner({ feedback }: { feedback: AnswerFeedback }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`mt-4 flex items-start gap-3 rounded-lg p-4 border ${
        feedback.correct
          ? 'bg-success-50 border-success-200 text-success-800'
          : 'bg-error-50 border-error-200 text-error-800'
      }`}
    >
      <motion.span
        initial={{ scale: 0.3, opacity: 0, rotate: feedback.correct ? -8 : 0 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 480, damping: 20, mass: 0.6 }}
        className={`flex-shrink-0 rounded-full p-1.5 ${
          feedback.correct ? 'bg-success-500' : 'bg-error-500'
        }`}
      >
        {feedback.correct ? (
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        ) : (
          <X className="w-4 h-4 text-white" strokeWidth={3} />
        )}
      </motion.span>
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08, duration: 0.22, ease: 'easeOut' }}
      >
        <p className="font-semibold text-sm">{feedback.correct ? 'Correct!' : 'Not quite'}</p>
        {feedback.feedback && <p className="text-sm opacity-90 mt-0.5">{feedback.feedback}</p>}
      </motion.div>
    </motion.div>
  )
}

// Activity Content Component
function ActivityContent({
  activity,
  answer,
  onChange,
  disabled,
  feedback,
}: {
  activity: any
  answer: any
  onChange: (value: any) => void
  disabled?: boolean
  feedback?: AnswerFeedback | null
}) {
  const type = activity.type?.toLowerCase()
  const options = activity.content?.options || activity.options || []

  switch (type) {
    case 'select':
    case 'multiple_choice':
      return (
        <div className="space-y-3">
          {options.map((option: string, index: number) => {
            const isSelected = answer === option
            const isResolved = feedback !== null && feedback !== undefined
            const resolvedCorrect = isResolved && isSelected && feedback?.correct === true
            const resolvedWrong = isResolved && isSelected && feedback?.correct === false
            return (
              <motion.label
                key={index}
                whileHover={disabled ? {} : { scale: 1.01 }}
                whileTap={disabled ? {} : { scale: 0.99 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`relative flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors duration-150 ${
                  resolvedCorrect
                    ? 'border-success-400 bg-success-50'
                    : resolvedWrong
                    ? 'border-error-400 bg-error-50'
                    : isSelected
                    ? 'border-primary-500 bg-primary-50 shadow-glow-primary'
                    : 'border-surface-200 hover:border-primary-300 hover:bg-primary-50/30'
                } ${disabled ? 'cursor-default' : ''}`}
              >
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-150 ${
                    resolvedCorrect
                      ? 'border-success-500 bg-success-500'
                      : resolvedWrong
                      ? 'border-error-500 bg-error-500'
                      : isSelected
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-surface-300'
                  }`}
                >
                  {(isSelected || resolvedCorrect || resolvedWrong) && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      className="w-2 h-2 rounded-full bg-white"
                    />
                  )}
                </span>
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={isSelected}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  className="sr-only"
                />
                <span className="text-slate-900">{option}</span>
              </motion.label>
            )
          })}
        </div>
      )

    case 'solve':
    case 'fill_blank':
      return (
        <input
          type="text"
          className={`input transition-shadow duration-200 ${
            feedback?.correct === true
              ? 'border-success-300 focus:ring-success-300'
              : feedback?.correct === false
              ? 'border-error-300 focus:ring-error-300'
              : ''
          }`}
          placeholder="Type your answer..."
          value={answer || ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case 'explain':
    case 'short_answer':
      return (
        <textarea
          className="input min-h-[150px]"
          placeholder="Type your answer..."
          value={answer || ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case 'true_false':
      return (
        <div className="grid grid-cols-2 gap-3">
          {['True', 'False'].map((option) => {
            const isSelected = answer === option
            const isResolved = feedback !== null && feedback !== undefined
            const resolvedCorrect = isResolved && isSelected && feedback?.correct === true
            const resolvedWrong = isResolved && isSelected && feedback?.correct === false
            return (
              <motion.label
                key={option}
                whileHover={disabled ? {} : { scale: 1.02 }}
                whileTap={disabled ? {} : { scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer font-medium transition-colors duration-150 ${
                  resolvedCorrect
                    ? 'border-success-400 bg-success-50 text-success-800'
                    : resolvedWrong
                    ? 'border-error-400 bg-error-50 text-error-800'
                    : isSelected
                    ? 'border-primary-500 bg-primary-50 text-primary-800 shadow-glow-primary'
                    : 'border-surface-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50/30'
                } ${disabled ? 'cursor-default' : ''}`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={isSelected}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  className="sr-only"
                />
                {option}
              </motion.label>
            )
          })}
        </div>
      )

    case 'code':
    case 'coding':
      return (
        <textarea
          className="input min-h-[300px] font-mono text-sm"
          placeholder="Write your code here..."
          value={answer || ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    default:
      return (
        <textarea
          className="input min-h-[150px]"
          placeholder="Type your answer..."
          value={answer || ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )
  }
}

/**
 * Bridges a CODE/coding mission activity to the real coding-sandbox
 * backend module: fetches the mission's starter code + assertions, then
 * renders `CodeMissionRunner`, which runs the code client-side (Pyodide
 * Worker or Sandpack) and POSTs only the already-executed result. Grading
 * happens inside CodeMissionRunner via /coding-sandbox/submissions, so
 * this wrapper just advances the mission once the learner is satisfied.
 */
function CodeActivity({
  activityId,
  runId,
  onDone,
}: {
  activityId: string
  runId: string
  onDone: () => void
}) {
  const missionQuery = useQuery({
    queryKey: ['coding-sandbox', 'mission', activityId],
    queryFn: () => codingSandboxApi.getMission(String(activityId)).then((res) => res.data),
  })

  if (missionQuery.isLoading) {
    return <p className="text-sm text-slate-500">Booting the runtime…</p>
  }
  if (missionQuery.isError || !missionQuery.data) {
    return <p className="text-sm text-error-600">Coding mission unavailable.</p>
  }

  return (
    <div className="space-y-4">
      <CodeMissionRunner mission={missionQuery.data} runId={runId} />
      <button type="button" onClick={onDone} className="btn btn-primary">
        Continue <span className="inline-block rtl:scale-x-[-1]">→</span>
      </button>
    </div>
  )
}
