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
import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { runPython } from '@/components/coding/PyodideRunner';
import { SandpackMission } from '@/components/coding/SandpackMission';
import { codingSandboxAPI, type CodingSandboxMission, type CodingSandboxResult } from '@/services/api';

export interface CodeMissionRunnerProps {
  mission: CodingSandboxMission;
  /** The active MissionRun id this attempt belongs to. */
  runId: string;
}

export function CodeMissionRunner({ mission, runId }: CodeMissionRunnerProps) {
  const [code, setCode] = useState(mission.starterCode);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<{ stdout: string; stderr: string } | null>(null);
  const [gradeResult, setGradeResult] = useState<CodingSandboxResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(stdout: string, stderr: string, result: unknown, durationMs: number, timedOut: boolean) {
    setOutput({ stdout, stderr });
    try {
      const graded = await codingSandboxAPI.submitResult({
        runId,
        activityId: mission.activityId,
        code,
        language: mission.language,
        stdout,
        stderr,
        result,
        durationMs,
        timedOut,
      });
      setGradeResult(graded);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Could not submit results for grading.');
    }
  }

  async function runPyodide() {
    setRunning(true);
    setGradeResult(null);
    const { stdout, stderr, result, durationMs, timedOut } = await runPython(code);
    await submit(stdout, stderr, result, durationMs, timedOut);
    setRunning(false);
  }

  return (
    <div className="space-y-4">
      <div className="surface-panel space-y-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {mission.title}
        </p>
        <p className="text-sm text-muted-foreground">{mission.prompt}</p>
      </div>

      {mission.language === 'python' ? (
        <>
          <div className="surface-panel overflow-hidden">
            <div className="border-b border-border px-4 py-2 text-xs text-muted-foreground font-mono">
              main.py
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              aria-label="Python code editor"
              className="min-h-64 w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>

          <Button type="button" onClick={runPyodide} disabled={running} className="gap-2">
            {running ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Play className="size-4" aria-hidden />}
            {running ? 'Running…' : 'Run'}
          </Button>

          <div className="surface-panel overflow-hidden" aria-label="Output">
            <div className="border-b border-border px-4 py-2 text-xs text-muted-foreground">Output</div>
            <pre
              className={cn(
                'max-h-56 overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-xs leading-6',
              )}
            >
              {output ? (
                <>
                  {output.stdout && <div>{output.stdout}</div>}
                  {output.stderr && <div className="text-destructive">{output.stderr}</div>}
                </>
              ) : (
                <div className="text-muted-foreground">Nothing yet. Press Run.</div>
              )}
            </pre>
          </div>
        </>
      ) : (
        <SandpackMission
          starterCode={code}
          onResult={(r) => {
            void submit(r.stdout, r.stderr, r.result, 0, false);
          }}
        />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {gradeResult && (
        <div className="surface-panel space-y-2 p-4" aria-label="Grading">
          <p className="text-sm font-semibold">
            {gradeResult.passed ? 'All checks passed!' : `${Math.round(gradeResult.score * 100)}% passing`}
          </p>
          <ul className="space-y-1 text-sm">
            {gradeResult.outcomes.map((o) => (
              <li key={o.id} className={o.passed ? 'text-secondary' : 'text-destructive'}>
                {o.passed ? '✓' : '✗'} {o.description}
              </li>
            ))}
          </ul>
          {gradeResult.coachFeedback && (
            <p className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
              {gradeResult.coachFeedback}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
