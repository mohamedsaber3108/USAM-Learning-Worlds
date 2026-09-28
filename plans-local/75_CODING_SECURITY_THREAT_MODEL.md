# 75 — Coding Execution Security Threat Model

> Scope: the coding execution path (Pyodide/Sandpack browser runners + the
> coding-sandbox backend). Grounded in the code audited in 74. Core invariant:
>
> **UNTRUSTED CHILD CODE NEVER EXECUTES IN THE NESTJS PROCESS.**
> All execution is client-side (learner's browser); the backend only serves the
> exercise spec and grades already-executed results. This is enforced by
> architecture, not policy — the backend has no code-execution capability.

## Trust tiers (from 74, enforced in coding-test-model)
- **FORMATIVE** (current): browser execution + client-run tests + server
  re-validation of the reported `actual` output vs the spec. NOT tamper-proof;
  acceptable for practice + formative mastery. Recorded as
  `Evidence.context.executionPolicy = 'FORMATIVE'`.
- **CREDENTIAL** (future, NOT built): isolated server-side execution against
  hidden tests. Formative evidence must never be treated as credential-grade.

## Threats × mitigations

| Threat | Mitigation (implemented) | Residual / follow-up |
|---|---|---|
| **Infinite loop / runaway CPU** | Pyodide runs in a **Web Worker**; an 8s wall-clock timer `worker.terminate()`s it (kills the loop) and returns a timed-out result. Backend marks a timed-out submission failed regardless of reported outcomes. | Worker CPU is the tab's; a tight loop is killed at 8s. Acceptable. |
| **Main-thread / UI freeze** | Execution is off the main thread (Worker). A frozen worker never freezes the app; it's terminated on timeout. | — |
| **Memory exhaustion** | Worker heap is bounded by the browser tab; a runaway allocation crashes only the worker, which is terminated. | No explicit per-run memory cap (browser-dependent). Documented; low risk for child exercises. |
| **Malicious JS (Sandpack)** | Sandpack runs in its **sandboxed preview iframe**; `externalResources: []`, `showNavigator={false}`, `showOpenInCodeSandbox={false}`, single locked file, no router. No app-context `eval`. | iframe sandbox is the boundary; keep Sandpack updated. |
| **Network calls from learner code** | Pyodide worker has no app network handles wired in; Sandpack externalResources empty + sandboxed iframe. Backend endpoint never fetches on the code's behalf. | Pyodide can `pyfetch` only if code imports it AND network allowed — not wired; note as a hardening check (CSP on the worker origin). |
| **Filesystem access** | No server FS exposed (code never runs server-side). Pyodide's virtual FS is in-worker and discarded on terminate. | — |
| **Package / import abuse** | Pyodide loads only what the worker's bundled distribution provides; no arbitrary `pip`. Sandpack template is `vanilla`, single file. | Consider an allowed-import list for Python if richer stdlib exposure is added later. |
| **DOM abuse / XSS via output** | Output is rendered as text in a `<pre>` (React escapes it); assertion outcomes render `description` (author-controlled) + boolean. Learner stdout is never `dangerouslySetInnerHTML`. | Keep output rendering text-only. |
| **iframe escape (Sandpack)** | Sandpack preview iframe is sandboxed; navigator/open-in-codesandbox disabled. | Relies on Sandpack's iframe sandbox attributes. |
| **Oversized submissions (DB/DoS)** | `SANDBOX_LIMITS`: code 200k / stdout 100k / stderr 50k / result 50k chars, rejected **before any DB access**. Endpoint throttled 60/min/JWT. Test model caps ≤50 tests. | — |
| **Result tampering (client fakes a pass)** | Server `gradeAgainstSpec` **recomputes** pass/fail from the reported `actual` vs the spec — client `passed` is ignored. A client that fabricates BOTH `actual` and the pass is only stoppable by CREDENTIAL-tier server execution. | Documented trust boundary; FORMATIVE evidence labeled as such. |
| **Auth / cross-learner writes** | Endpoint is JWT-guarded; `submitResult` verifies the `runId` belongs to the authenticated learner (`run.learnerId !== learnerId` → 404). | — |

## Enforced limits (summary)
- Wall-clock: **8s** per run (Pyodide worker terminate).
- Submission size: code 200k / stdout 100k / stderr 50k / result 50k chars.
- Tests per exercise: ≤ 50.
- Rate: 60 submissions / minute / JWT.
- Network: none wired into the runners.
- Server execution: **none** (hard architectural invariant).

## Follow-up hardening (tracked, not blocking)
1. CSP on the worker/runner origin to defense-in-depth block network from Pyodide.
2. Optional per-run memory hint / smaller Pyodide bundle.
3. CREDENTIAL tier: isolated server runner (container) for high-stakes/credential
   assessments — the only way to fully defeat result tampering.
4. Allowed-import list for Python if stdlib surface grows.
