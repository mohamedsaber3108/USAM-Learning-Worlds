/**
 * Pyodide runner — CPython (WASM) in a Web Worker, CDN-loaded, with an 8s
 * wall-clock timeout so a runaway learner script can never freeze the UI or run
 * unbounded. Runs ENTIRELY in the browser; the backend never executes the code
 * — only the resulting stdout/outcomes are POSTed and SERVER-RE-VALIDATED
 * (FORMATIVE trust tier, per docs/architecture/USAM_OSS_INTEGRATION_PLAN.md and
 * the coding-test-model contract). Ported cleanly from the proven legacy runner
 * (pure infra, no legacy-design coupling; no npm pyodide dep — importScripts).
 */

export interface PyTest {
  id: string
  description?: string
  hidden?: boolean
  kind: 'stdout-equals' | 'stdout-contains' | 'function-call' | 'result-equals'
  functionName?: string
  args?: unknown[]
}

export interface PyTestOutcome {
  id: string
  description: string
  hidden: boolean
  passed: boolean // local view; server re-validates from `actual`
  actual?: string
}

export interface PyodideTestRunResult {
  stdout: string
  stderr: string
  outcomes: PyTestOutcome[]
  timedOut: boolean
  durationMs: number
}

const WORKER_TIMEOUT_MS = 8000
const PYODIDE_VERSION = 'v0.26.2'

function buildWorkerSource(): string {
  return `
    let ready = null;
    async function loadOnce() {
      if (!ready) {
        importScripts('https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/pyodide.js');
        ready = self.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/' });
      }
      return ready;
    }
    self.onmessage = async (event) => {
      const { code, id, tests } = event.data;
      let runStdout = '';
      let stderr = '';
      const outcomes = [];
      try {
        const pyodide = await loadOnce();
        pyodide.setStdout({ batched: (s) => { runStdout += s + '\\n'; } });
        pyodide.setStderr({ batched: (s) => { stderr += s + '\\n'; } });
        let defineError = null;
        try { await pyodide.runPythonAsync(code); }
        catch (err) { defineError = String(err && err.message ? err.message : err); stderr += defineError; }
        for (const t of (tests || [])) {
          let actual = '';
          if (defineError) { actual = defineError; }
          else if (t.kind === 'function-call') {
            try {
              pyodide.globals.set('__usam_args_json', JSON.stringify(t.args || []));
              await pyodide.runPythonAsync(
                'import json as __json\\n' +
                '__usam_args = __json.loads(__usam_args_json)\\n' +
                '__usam_ret = ' + t.functionName + '(*__usam_args)\\n' +
                '__usam_out = __json.dumps(__usam_ret) if not isinstance(__usam_ret, str) else __usam_ret\\n'
              );
              actual = pyodide.globals.get('__usam_out');
            } catch (err) { actual = String(err && err.message ? err.message : err); }
          } else { actual = runStdout; }
          outcomes.push({ id: t.id, actual: String(actual) });
        }
      } catch (err) { stderr += String(err && err.message ? err.message : err); }
      self.postMessage({ id, stdout: runStdout, stderr, outcomes });
    };
  `
}

let cachedWorkerUrl: string | null = null
function getWorkerUrl(): string {
  if (!cachedWorkerUrl) {
    const blob = new Blob([buildWorkerSource()], { type: 'application/javascript' })
    cachedWorkerUrl = URL.createObjectURL(blob)
  }
  return cachedWorkerUrl
}

function canonical(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function runPythonTests(
  code: string,
  tests: PyTest[],
  expectedByTest: Record<string, { kind: PyTest['kind']; expectedOutput?: string; expectedReturn?: unknown }>,
): Promise<PyodideTestRunResult> {
  const started = Date.now()
  return new Promise((resolve) => {
    const worker = new Worker(getWorkerUrl())
    let settled = false
    const finish = (payload: PyodideTestRunResult) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      worker.terminate()
      resolve(payload)
    }
    const timer = setTimeout(() => {
      finish({
        stdout: '',
        stderr: 'Timed out after 8 seconds.',
        outcomes: tests.map((t) => ({
          id: t.id,
          description: t.description ?? '',
          hidden: Boolean(t.hidden),
          passed: false,
          actual: 'timed out',
        })),
        timedOut: true,
        durationMs: Date.now() - started,
      })
    }, WORKER_TIMEOUT_MS)

    worker.onmessage = (event: MessageEvent) => {
      const { stdout, stderr, outcomes } = event.data ?? {}
      const byId = new Map<string, { actual?: string }>((outcomes ?? []).map((o: { id: string }) => [o.id, o]))
      const mapped: PyTestOutcome[] = tests.map((t) => {
        const actual = byId.get(t.id)?.actual ?? ''
        const exp = expectedByTest[t.id]
        let passed = false
        if (exp) {
          if (exp.kind === 'stdout-equals') passed = canonical(actual).trim() === canonical(exp.expectedOutput).trim()
          else if (exp.kind === 'stdout-contains') passed = canonical(actual).includes(canonical(exp.expectedOutput))
          else passed = canonical(actual) === canonical(exp.expectedReturn)
        }
        return { id: t.id, description: t.description ?? '', hidden: Boolean(t.hidden), passed, actual: String(actual) }
      })
      finish({ stdout: stdout ?? '', stderr: stderr ?? '', outcomes: mapped, timedOut: false, durationMs: Date.now() - started })
    }

    worker.onerror = (event) => {
      finish({
        stdout: '',
        stderr: event.message || 'Worker error',
        outcomes: tests.map((t) => ({ id: t.id, description: t.description ?? '', hidden: Boolean(t.hidden), passed: false, actual: event.message })),
        timedOut: false,
        durationMs: Date.now() - started,
      })
    }

    worker.postMessage({ code, id: 1, tests })
  })
}
