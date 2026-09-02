/**
 * CodeMissionRunner — shared coding-mission UI shell: editor + Run button
 * + output pane, that routes to PyodideRunner (Python) or SandpackMission
 * (JS/React) based on the mission's language, then POSTs the resulting
 * *output* (never a request to execute anything) to the coding-sandbox
 * backend for grading + AI review commentary.
 *
 * Backend contract: POST /coding-sandbox/submissions with
 * { runId, activityId, code, language, stdout, stderr, result, durationMs,
 *   timedOut } — see backend/src/modules/coding-sandbox/.
 */
import { useState } from 'react'
import { Play, Loader2 } from 'lucide-react'
import { runPython } from './PyodideRunner'
import { SandpackMission } from './SandpackMission'
import { codingSandboxApi, type CodingSandboxMission } from '@/lib/api/endpoints'

export interface CodeMissionRunnerProps {
  mission: CodingSandboxMission
  /** The active MissionRun id this attempt belongs to. */
  runId: string | number
}

interface GradeResult {
  passed: boolean
  score: number
  outcomes: Array<{ id: string; description: string; passed: boolean }>
  coachFeedback: string | null
}

export function CodeMissionRunner({ mission, runId }: CodeMissionRunnerProps) {
  const [code, setCode] = useState(mission.starterCode)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<{ stdout: string; stderr: string } | null>(null)
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(
    stdout: string,
    stderr: string,
    result: unknown,
    durationMs: number,
    timedOut: boolean,
  ) {
    setOutput({ stdout, stderr })
    try {
      const { data } = await codingSandboxApi.submitResult({
        runId,
        activityId: mission.activityId,
        code,
        language: mission.language,
        stdout,
        stderr,
        result,
        durationMs,
        timedOut,
      })
      setGradeResult(data)
      setError(null)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Could not submit results for grading.')
    }
  }

  async function runPyodide() {
    setRunning(true)
    setGradeResult(null)
    const { stdout, stderr, result, durationMs, timedOut } = await runPython(code)
    await submit(stdout, stderr, result, durationMs, timedOut)
    setRunning(false)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {mission.title}
        </p>
        <p className="text-sm text-gray-600">{mission.prompt}</p>
      </div>

      {mission.language === 'python' ? (
        <>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-2 text-xs text-gray-500 font-mono bg-gray-50">
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

          <div className="rounded-lg border border-gray-200 overflow-hidden" aria-label="Output">
            <div className="border-b border-gray-200 px-4 py-2 text-xs text-gray-500 bg-gray-50">
              Output
            </div>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-xs leading-6">
              {output ? (
                <>
                  {output.stdout && <div>{output.stdout}</div>}
                  {output.stderr && <div className="text-red-600">{output.stderr}</div>}
                </>
              ) : (
                <div className="text-gray-400">Nothing yet. Press Run.</div>
              )}
            </pre>
          </div>
        </>
      ) : (
        <SandpackMission
          starterCode={code}
          onResult={(r) => {
            void submit(r.stdout, r.stderr, r.result, 0, false)
          }}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {gradeResult && (
        <div className="rounded-lg border border-gray-200 p-4 space-y-2" aria-label="Grading">
          <p className="text-sm font-semibold">
            {gradeResult.passed ? 'All checks passed!' : `${Math.round(gradeResult.score * 100)}% passing`}
          </p>
          <ul className="space-y-1 text-sm">
            {gradeResult.outcomes.map((o) => (
              <li key={o.id} className={o.passed ? 'text-green-600' : 'text-red-600'}>
                {o.passed ? '✓' : '✗'} {o.description}
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
    </div>
  )
}
