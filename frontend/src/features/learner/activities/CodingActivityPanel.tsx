import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { codingSandboxApi, codingCoachApi } from '@/lib/api/endpoints'
import { Button } from '@/components/ui/Button'
import { LoadingState, ErrorState } from '@/components/common/States'
import { runPythonTests, type PyTest } from './pyodideRunner'

interface MissionSpec {
  activityId: string
  title: string
  language: string
  runner: string
  prompt: string
  starterCode: string
  timeoutMs: number
  tests: Array<PyTest & { expectedOutput?: string; expectedReturn?: unknown }>
}

interface GradeResult {
  success: boolean | null
  score: number | null
  feedback?: string | null
}

/**
 * CODE activity — the proven client-exec / server-revalidate trust loop:
 * 1) GET the mission spec (hidden test expected values are stripped server-side).
 * 2) Learner edits + RUNS code in-browser (Pyodide Web Worker, 8s cap).
 * 3) POST code + stdout + per-test outcomes; the SERVER re-validates `actual`
 *    against the authoritative spec and writes CREATION evidence → mastery.
 * The client `passed` is only for immediate feedback; the server is the truth.
 */
export function CodingActivityPanel({
  runId,
  activityId,
  onGraded,
}: {
  runId: string
  activityId: string
  onGraded: (result: GradeResult) => void
}) {
  const { t } = useTranslation()
  const [spec, setSpec] = useState<MissionSpec | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [code, setCode] = useState('')
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<string | null>(null)
  const [attemptCount, setAttemptCount] = useState(0)
  const [askingCoach, setAskingCoach] = useState(false)
  const [coachDiagnosis, setCoachDiagnosis] = useState<string | null>(null)
  const [lastFailed, setLastFailed] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [review, setReview] = useState<{ feedback: string; strengths: string[]; improvements: string[] } | null>(null)
  const [lastOutcomes, setLastOutcomes] = useState<Array<{ description?: string; actual?: string; passed: boolean }>>([])

  useEffect(() => {
    let alive = true
    codingSandboxApi
      .getMission(activityId)
      .then((res) => {
        if (!alive) return
        const s = res.data as MissionSpec
        setSpec(s)
        setCode(s.starterCode ?? '')
      })
      .catch(() => alive && setLoadError(true))
    return () => {
      alive = false
    }
  }, [activityId])

  if (loadError) return <ErrorState />
  if (!spec) return <LoadingState />

  async function runAndSubmit() {
    if (!spec) return
    setRunning(true)
    setOutput(null)
    try {
      const expectedByTest: Record<string, { kind: PyTest['kind']; expectedOutput?: string; expectedReturn?: unknown }> = {}
      for (const test of spec.tests) {
        expectedByTest[test.id] = { kind: test.kind, expectedOutput: test.expectedOutput, expectedReturn: test.expectedReturn }
      }
      const run = await runPythonTests(code, spec.tests, expectedByTest)
      setOutput(run.stdout || run.stderr || '(no output)')
      setLastFailed(run.outcomes.some((o) => !o.passed))
      setCoachDiagnosis(null)
      setReview(null)
      setLastOutcomes(run.outcomes)
      setAttemptCount((n) => n + 1)

      const res = (
        await codingSandboxApi.submit({
          runId,
          activityId,
          code,
          language: spec.language || 'python',
          stdout: run.stdout,
          stderr: run.stderr,
          testOutcomes: run.outcomes.map((o) => ({
            id: o.id,
            description: o.description,
            hidden: o.hidden,
            passed: o.passed,
            actual: o.actual,
          })),
        })
      ).data as { passed: boolean; score: number; coachFeedback?: string | null }

      onGraded({ success: res.passed, score: res.score, feedback: res.coachFeedback ?? null })
    } catch {
      onGraded({ success: false, score: 0, feedback: t('states.error') })
    } finally {
      setRunning(false)
    }
  }

  /**
   * "Ask Codey" — real POST /coding-coach/debug (ledger 88: Coding Coach had
   * zero frontend callers). Learner-initiated only, shown after a failed run.
   * The backend prompt coaches toward self-correction and never hands back a
   * full solution, so this is safe to surface directly as the diagnosis text.
   */
  async function askCoach() {
    if (!spec) return
    setAskingCoach(true)
    try {
      const res = await codingCoachApi.debug({
        code,
        language: (spec.language as 'python' | 'javascript' | 'html' | 'css' | 'scratch' | 'blockly') || 'python',
        error: output ?? undefined,
        expectedBehavior: spec.prompt,
      })
      setCoachDiagnosis(res.data.diagnosis)
    } catch {
      setCoachDiagnosis(t('states.error'))
    } finally {
      setAskingCoach(false)
    }
  }

  /**
   * "Review my code" — real POST /coding-coach/review. Learner-initiated,
   * available after any run (pass or fail) so a learner can ask for
   * strengths/next-steps even on a working solution, not just a broken
   * one. Passes the real failing-test descriptions from the last run so
   * Codey can guide toward the specific gap instead of reviewing blind.
   */
  async function requestReview() {
    if (!spec) return
    setReviewing(true)
    try {
      const failingTests = lastOutcomes.filter((o) => !o.passed).map((o) => ({ description: o.description ?? '', actual: o.actual }))
      const res = await codingCoachApi.review({
        code,
        language: spec.language || 'python',
        taskPrompt: spec.prompt,
        failingTests: failingTests.length ? failingTests : undefined,
        attemptNumber: attemptCount,
      })
      setReview({ feedback: res.data.feedback, strengths: res.data.strengths, improvements: res.data.improvements })
    } catch {
      setReview({ feedback: t('states.error'), strengths: [], improvements: [] })
    } finally {
      setReviewing(false)
    }
  }

  return (
    <div className="rounded-card border border-line bg-white p-6 shadow-soft">
      <p className="font-display text-lg font-bold text-ink-900">{spec.title}</p>
      <p className="mt-2 text-sm text-ink-600">{spec.prompt}</p>

      <label htmlFor="code" className="sr-only">
        Code editor
      </label>
      <textarea
        id="code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        dir="ltr"
        rows={10}
        className="mt-4 w-full rounded-control border border-line bg-ink-900 p-3 font-mono text-sm text-white"
      />

      {output !== null && (
        <pre dir="ltr" className="mt-3 max-h-40 overflow-auto rounded-control bg-canvas-off p-3 font-mono text-xs text-ink-800">
          {output}
        </pre>
      )}

      {lastFailed && (
        <div className="mt-3">
          {!coachDiagnosis ? (
            <Button variant="secondary" onClick={() => void askCoach()} loading={askingCoach}>
              {t('learner.askCodey')}
            </Button>
          ) : (
            <div className="rounded-control border border-brand-200 bg-brand-50 p-3 text-sm text-ink-700">
              <p className="font-display font-bold text-brand-700">{t('learner.codeyDiagnosis')}</p>
              <p className="mt-1 whitespace-pre-wrap">{coachDiagnosis}</p>
            </div>
          )}
        </div>
      )}

      {output !== null && (
        <div className="mt-3">
          {!review ? (
            <Button variant="secondary" onClick={() => void requestReview()} loading={reviewing}>
              {t('learner.askCodeyReview')}
            </Button>
          ) : (
            <div className="rounded-control border border-brand-200 bg-brand-50 p-3 text-sm text-ink-700">
              <p className="font-display font-bold text-brand-700">{t('learner.codeyReviewTitle')}</p>
              <p className="mt-1 whitespace-pre-wrap">{review.feedback}</p>
              {review.strengths.length > 0 && (
                <ul className="mt-2 list-inside list-disc text-ink-600">
                  {review.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      <Button className="mt-4" onClick={runAndSubmit} loading={running}>
        {t('learner.submit')}
      </Button>
    </div>
  )
}
