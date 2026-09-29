/**
 * CodeMissionRunner — shared coding-mission UI shell: editor + Run button
 * + output pane, that routes to PyodideRunner (Python) or SandpackMission
 * (JS/React) based on the mission's language, then POSTs the resulting
 * *output* (never a request to execute anything) to the coding-sandbox
 * backend for grading + AI review commentary.
 *
 * Backend contract: POST /coding-sandbox/submissions with
 * { runId, activityId, code, language, stdout, stderr, result, durationMs,
 *   timedOut, testOutcomes[] } — the browser runs the mission's tests and
 * reports each test's produced `actual`; the SERVER re-validates `actual`
 * against the authoritative spec (client pass/fail is not trusted). See
 * backend/src/modules/coding-sandbox/ and plans-local/75 (trust model).
 */
import { useRef, useState } from 'react'
import { Play, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { runPython, runPythonTests, type PyTest } from './PyodideRunner'
import { SandpackMission } from './SandpackMission'
import { BlocklyWorkspace, type BlocklyWorkspaceHandle } from './BlocklyWorkspace'
import { CodingCoachPanel } from './CodingCoachPanel'
import {
  codingSandboxApi,
  type CodingSandboxMission,
  type CodingTestOutcome,
} from '@/lib/api/endpoints'

/** Build the client-runnable test list + a local expected map for immediate UI. */
function toPyTests(mission: CodingSandboxMission): {
  pyTests: PyTest[]
  expectedByTest: Record<string, { kind: PyTest['kind']; expectedOutput?: string; expectedReturn?: unknown }>
} {
  const tests = mission.tests ?? []
  const pyTests: PyTest[] = tests.map((t) => {
    const pt: PyTest = { id: t.id, kind: t.kind }
    if (t.description !== undefined) pt.description = t.description
    if (t.hidden !== undefined) pt.hidden = t.hidden
    if (t.functionName !== undefined) pt.functionName = t.functionName
    if (t.args !== undefined) pt.args = t.args
    if (t.stdin !== undefined) pt.stdin = t.stdin
    return pt
  })
  const expectedByTest: Record<string, { kind: PyTest['kind']; expectedOutput?: string; expectedReturn?: unknown }> = {}
  for (const t of tests) {
    const e: { kind: PyTest['kind']; expectedOutput?: string; expectedReturn?: unknown } = { kind: t.kind }
    if (t.expectedOutput !== undefined) e.expectedOutput = t.expectedOutput
    if (t.expectedReturn !== undefined) e.expectedReturn = t.expectedReturn
    expectedByTest[t.id] = e
  }
  return { pyTests, expectedByTest }
}

export interface CodeMissionRunnerProps {
  mission: CodingSandboxMission
  /** The active MissionRun id this attempt belongs to. */
  runId: string | number
}

interface GradeResult {
  passed: boolean
  score: number
  testsPassed?: number
  testsTotal?: number
  outcomes: Array<{ id: string; description: string; passed: boolean; hidden?: boolean }>
  coachFeedback: string | null
}

export function CodeMissionRunner({ mission, runId }: CodeMissionRunnerProps) {
  const [code, setCode] = useState(mission.starterCode)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<{ stdout: string; stderr: string } | null>(null)
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const blocklyRef = useRef<BlocklyWorkspaceHandle>(null)

  const [attempt, setAttempt] = useState(1)

  async function submit(
    stdout: string,
    stderr: string,
    result: unknown,
    durationMs: number,
    timedOut: boolean,
    submittedCode: string = code,
    testOutcomes?: CodingTestOutcome[],
  ) {
    setOutput({ stdout, stderr })
    try {
      const payload: import('@/lib/api/endpoints').CodingSandboxSubmission = {
        runId,
        activityId: mission.activityId,
        code: submittedCode,
        language: mission.language,
        stdout,
        stderr,
        result,
        durationMs,
        timedOut,
        attemptNumber: attempt,
      }
      if (testOutcomes) payload.testOutcomes = testOutcomes
      const { data } = await codingSandboxApi.submitResult(payload)
      setGradeResult(data)
      setError(null)
      setAttempt((n) => n + 1)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Could not submit results for grading.')
    }
  }

  /** Run Python `src`, running the mission's tests when defined, then submit. */
  async function runPythonAndSubmit(src: string, submittedCode: string = src) {
    const tests = mission.tests ?? []
    if (tests.length > 0) {
      const { pyTests, expectedByTest } = toPyTests(mission)
      const { stdout, stderr, outcomes, durationMs, timedOut } = await runPythonTests(src, pyTests, expectedByTest)
      await submit(stdout, stderr, undefined, durationMs, timedOut, submittedCode, outcomes)
    } else {
      const { stdout, stderr, result, durationMs, timedOut } = await runPython(src)
      await submit(stdout, stderr, result, durationMs, timedOut, submittedCode)
    }
  }

  async function runPyodide() {
    setRunning(true)
    setGradeResult(null)
    await runPythonAndSubmit(code)
    setRunning(false)
  }

  // Blockly: read the Python generated from the current blocks, then run it
  // through the identical Pyodide path + submit for grading.
  async function runBlockly() {
    const python = blocklyRef.current?.getPython() ?? ''
    setRunning(true)
    setGradeResult(null)
    await runPythonAndSubmit(python, python)
    setRunning(false)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-surface-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {mission.title}
        </p>
        <p className="text-sm text-slate-600">{mission.prompt}</p>
      </div>

      {mission.runner === 'blockly' ? (
        <>
          <BlocklyWorkspace ref={blocklyRef} initialXml={mission.starterCode} />

          <button
            type="button"
            onClick={runBlockly}
            disabled={running}
            className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          >
            {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            {running ? 'Running…' : 'Run'}
          </button>

          <div className="rounded-lg border border-surface-200 overflow-hidden" aria-label="Output">
            <div className="border-b border-surface-200 px-4 py-2 text-xs text-slate-500 bg-surface-100">
              Output
            </div>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-xs leading-6">
              {output ? (
                <>
                  {output.stdout && <div>{output.stdout}</div>}
                  {output.stderr && <div className="text-red-600">{output.stderr}</div>}
                </>
              ) : (
                <div className="text-slate-400">Drag some blocks, then press Run.</div>
              )}
            </pre>
          </div>
        </>
      ) : mission.language === 'python' ? (
        <>
          <div className="rounded-lg border border-surface-200 overflow-hidden">
            <div className="border-b border-surface-200 px-4 py-2 text-xs text-slate-500 font-mono bg-surface-100">
              main.py
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              aria-label="Python code editor"
              className="input min-h-[220px] w-full resize-y font-mono text-sm leading-6"
            />
          </div>

          <button
            type="button"
            onClick={runPyodide}
            disabled={running}
            className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          >
            {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            {running ? 'Running…' : 'Run'}
          </button>

          <div className="rounded-lg border border-surface-200 overflow-hidden" aria-label="Output">
            <div className="border-b border-surface-200 px-4 py-2 text-xs text-slate-500 bg-surface-100">
              Output
            </div>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-xs leading-6">
              {output ? (
                <>
                  {output.stdout && <div>{output.stdout}</div>}
                  {output.stderr && <div className="text-red-600">{output.stderr}</div>}
                </>
              ) : (
                <div className="text-slate-400">Nothing yet. Press Run.</div>
              )}
            </pre>
          </div>
        </>
      ) : (
        <SandpackMission
          starterCode={code}
          onResult={(r) => {
            // JS runs in the Sandpack sandbox; grade its console output against
            // the mission's stdout-* tests. function-call/result-equals tests
            // aren't supported on the JS path (those use Python). Server
            // re-validates the reported `actual`.
            const outcomes: CodingTestOutcome[] = (mission.tests ?? [])
              .filter((t) => t.kind === 'stdout-equals' || t.kind === 'stdout-contains')
              .map((t) => ({
                id: t.id,
                description: t.description,
                hidden: Boolean(t.hidden),
                passed:
                  t.kind === 'stdout-equals'
                    ? r.stdout.trim() === String(t.expectedOutput ?? '').trim()
                    : r.stdout.includes(String(t.expectedOutput ?? '')),
                actual: r.stdout,
              }))
            void submit(r.stdout, r.stderr, r.result, 0, false, code, outcomes.length ? outcomes : undefined)
          }}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {gradeResult && (
        <div className="rounded-lg border border-surface-200 p-4 space-y-2" aria-label="Grading">
          <p className="text-sm font-semibold">
            {gradeResult.passed ? 'All checks passed!' : `${Math.round(gradeResult.score * 100)}% passing`}
          </p>
          <ul className="space-y-1 text-sm">
            {gradeResult.outcomes.map((o) => (
              <li key={o.id} className={o.passed ? 'text-green-600 flex items-center gap-1.5' : 'text-red-600 flex items-center gap-1.5'}>
                {o.passed ? (
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                ) : (
                  <XCircle className="w-4 h-4" strokeWidth={2} />
                )}
                {o.description}
              </li>
            ))}
          </ul>
          {gradeResult.coachFeedback && (
            <p className="rounded-lg border border-primary-200 bg-primary-50 p-3 text-sm">
              {gradeResult.coachFeedback}
            </p>
          )}
        </div>
      )}

      {/* Ask the Coach (G-9) — surfaces the coding-coach engine so a stuck
          learner can get an explain/debug hint on their current code. AI-backed
          and self-hiding-on-failure; the mission works fully without it. Not
          shown for Blockly (visual blocks aren't text the coach reasons over). */}
      {mission.runner !== 'blockly' && (
        <CodingCoachPanel code={code} language={mission.language} />
      )}
    </div>
  )
}
