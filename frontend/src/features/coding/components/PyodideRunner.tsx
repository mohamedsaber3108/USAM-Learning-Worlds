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
      const { code, id } = event.data;
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
