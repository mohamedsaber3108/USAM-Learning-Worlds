/**
 * PyodideRunner — loads CPython (via Pyodide/WASM) in a Web Worker so a
 * runaway/infinite-loop learner script can never freeze the main UI
 * thread, and terminates the worker on an 8-second wall-clock timeout
 * (Pyodide itself imposes no execution limit — this is a USAM-side
 * control per docs/architecture/USAM_OSS_INTEGRATION_PLAN.md Section 1).
 *
 * Runs entirely in the learner's browser. The backend never sees the
 * code before it runs and never executes it — only the resulting
 * stdout/stderr/result gets POSTed to the coding-sandbox API afterwards,
 * by CodeMissionRunner.
 */

export interface PyodideRunResult {
  stdout: string
  stderr: string
  result: unknown
  timedOut: boolean
  durationMs: number
}

/** A test to run against the learner's Python code (mirrors backend CodingTest). */
export interface PyTest {
  id: string
  description?: string
  hidden?: boolean
  kind: 'stdout-equals' | 'stdout-contains' | 'function-call' | 'result-equals'
  functionName?: string
  args?: unknown[]
  stdin?: string
}

export interface PyTestOutcome {
  id: string
  description: string
  hidden: boolean
  passed: boolean // client's local view; server re-validates from `actual`
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

function buildWorkerSource(): string {
  return `
    let pyodideReadyPromise = null;

    async function loadPyodideOnce() {
      if (!pyodideReadyPromise) {
        importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js');
        pyodideReadyPromise = self.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
        });
      }
      return pyodideReadyPromise;
    }

    self.onmessage = async (event) => {
      const { code, id, tests } = event.data;

      // ---- Plain run (no tests): execute code, capture stdout/stderr/result.
      if (!tests) {
        let stdout = '';
        let stderr = '';
        let result;
        try {
          const pyodide = await loadPyodideOnce();
          pyodide.setStdout({ batched: (s) => { stdout += s + '\\n'; } });
          pyodide.setStderr({ batched: (s) => { stderr += s + '\\n'; } });
          result = await pyodide.runPythonAsync(code);
          if (result !== undefined && result?.toJs) {
            try { result = result.toJs({ dict_converter: Object.fromEntries }); } catch (_e) {}
          }
        } catch (err) {
          stderr += String(err && err.message ? err.message : err);
        }
        self.postMessage({ id, stdout, stderr, result });
        return;
      }

      // ---- Test run: define the learner's code once, then exercise each test.
      let runStdout = '';
      let stderr = '';
      const outcomes = [];
      try {
        const pyodide = await loadPyodideOnce();
        pyodide.setStdout({ batched: (s) => { runStdout += s + '\\n'; } });
        pyodide.setStderr({ batched: (s) => { stderr += s + '\\n'; } });

        let defineError = null;
        try {
          await pyodide.runPythonAsync(code);
        } catch (err) {
          defineError = String(err && err.message ? err.message : err);
          stderr += defineError;
        }

        for (const t of tests) {
          let actual = '';
          if (defineError) {
            actual = defineError;
          } else if (t.kind === 'function-call') {
            try {
              const argsJson = JSON.stringify(t.args || []);
              pyodide.globals.set('__usam_args_json', argsJson);
              const call =
                'import json as __json\\n' +
                '__usam_args = __json.loads(__usam_args_json)\\n' +
                '__usam_ret = ' + t.functionName + '(*__usam_args)\\n' +
                '__usam_out = __json.dumps(__usam_ret) if not isinstance(__usam_ret, str) else __usam_ret\\n';
              await pyodide.runPythonAsync(call);
              actual = pyodide.globals.get('__usam_out');
            } catch (err) {
              actual = String(err && err.message ? err.message : err);
            }
          } else {
            actual = runStdout;
          }
          outcomes.push({ id: t.id, actual: String(actual) });
        }
      } catch (err) {
        stderr += String(err && err.message ? err.message : err);
      }
      self.postMessage({ id, stdout: runStdout, stderr, outcomes, isTestRun: true });
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

/**
 * Runs `code` as Python inside a fresh Web Worker. Terminates the worker
 * (killing any infinite loop) if it doesn't respond within
 * `WORKER_TIMEOUT_MS`.
 */
export function runPython(code: string): Promise<PyodideRunResult> {
  const started = Date.now()
  return new Promise((resolve) => {
    const worker = new Worker(getWorkerUrl())
    let settled = false

    const finish = (payload: PyodideRunResult) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      worker.terminate()
      resolve(payload)
    }

    const timer = setTimeout(() => {
      finish({
        stdout: '',
        stderr: 'Execution timed out after 8 seconds (worker terminated).',
        result: undefined,
        timedOut: true,
        durationMs: Date.now() - started,
      })
    }, WORKER_TIMEOUT_MS)

    worker.onmessage = (event: MessageEvent) => {
      const { stdout, stderr, result } = event.data ?? {}
      finish({
        stdout: stdout ?? '',
        stderr: stderr ?? '',
        result,
        timedOut: false,
        durationMs: Date.now() - started,
      })
    }

    worker.onerror = (event) => {
      finish({
        stdout: '',
        stderr: event.message || 'Worker error',
        result: undefined,
        timedOut: false,
        durationMs: Date.now() - started,
      })
    }

    worker.postMessage({ code, id: 1 })
  })
}

/** Canonical string for deterministic comparison (mirrors backend `canonical`). */
function canonical(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

/**
 * Runs the learner's Python `code`, then executes each `test` against it in the
 * same fresh Worker (killed on the 8s timeout). Returns per-test outcomes with
 * the produced `actual`. The client computes a local `passed` for immediate UI
 * feedback; the BACKEND re-validates `actual` against the authoritative spec
 * (client `passed` is not trusted). `expectedByTest` holds the expected values
 * the client knows about (visible tests); hidden tests have no expected here
 * (server strips them) so their local `passed` is best-effort false until the
 * server responds.
 */
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
        stderr: 'Execution timed out after 8 seconds (worker terminated).',
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
      const byId = new Map<string, any>((outcomes ?? []).map((o: any) => [o.id, o]))
      const mapped: PyTestOutcome[] = tests.map((t) => {
        const raw = byId.get(t.id)
        const actual = raw?.actual ?? ''
        const exp = expectedByTest[t.id]
        let passed = false
        if (exp) {
          if (exp.kind === 'stdout-equals') passed = canonical(actual).trim() === canonical(exp.expectedOutput).trim()
          else if (exp.kind === 'stdout-contains') passed = canonical(actual).includes(canonical(exp.expectedOutput))
          else passed = canonical(actual) === canonical(exp.expectedReturn)
        }
        return {
          id: t.id,
          description: t.description ?? '',
          hidden: Boolean(t.hidden),
          passed,
          actual: String(actual),
        }
      })
      finish({
        stdout: stdout ?? '',
        stderr: stderr ?? '',
        outcomes: mapped,
        timedOut: false,
        durationMs: Date.now() - started,
      })
    }

    worker.onerror = (event) => {
      finish({
        stdout: '',
        stderr: event.message || 'Worker error',
        outcomes: tests.map((t) => ({
          id: t.id,
          description: t.description ?? '',
          hidden: Boolean(t.hidden),
          passed: false,
          actual: event.message || 'Worker error',
        })),
        timedOut: false,
        durationMs: Date.now() - started,
      })
    }

    worker.postMessage({ code, id: 1, tests })
  })
}
