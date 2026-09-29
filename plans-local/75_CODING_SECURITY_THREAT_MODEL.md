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

## Precise trust model — CLIENT-EXECUTED, SERVER-VALIDATED (code evidence)

The server does NOT execute learner code. Terminology: coding is **CLIENT-EXECUTED**
(browser Pyodide/Sandpack) and **SERVER-VALIDATED** (the server re-checks reported
output against a spec it loads independently). It is NOT server-executed.

Answering the enumerated questions from the code
(`coding-sandbox.service.ts` `getMission` + `submitResult`, `coding-test-model.ts`
`gradeAgainstSpec`), verified by `coding-sandbox.adversarial.spec.ts` (11 tests):

| Question | Answer (code evidence) |
|---|---|
| Are hidden tests sent to the browser? | YES — the client needs id/kind/functionName/args to RUN them. |
| Are hidden tests' EXPECTED outputs sent? | **NO (fixed).** `getMission` now strips `expectedOutput`/`expectedReturn` from `hidden` tests before responding. Visible tests keep their expected (shown as worked examples). |
| Can the client fabricate `actual`? | YES — this is the honest FORMATIVE limitation. The server trusts the reported `actual` output (it can't re-run the code). |
| Can the client fabricate `testsPassed`/`testsTotal`? | NO — server recomputes from `gradeAgainstSpec`; any payload values are ignored (adversarial #2). |
| Can the client claim another `runner`? | NO — `runner` comes from the DB spec; persisted `executedBy = spec.runner` (adversarial #5). |
| Can the client modify activity/test-model version? | NO — `testModelVersion` + expected values come from the DB Activity, not the request (adversarial #3, #5). |
| Does the backend load the canonical spec independently? | YES — `parseExerciseSpec(activity.content)` loaded by `activityId` from the DB. |
| What does the backend recompute? | `passed`, `score`, `testsPassed`, `testsTotal`, and each per-test `passed` — from reported `actual` vs the DB spec's expected. |
| Which client fields are TRUSTED? | `code`, `stdout`, `stderr`, `result`, and each test's `actual`. (Stored for feedback/audit; `actual` is re-checked.) |
| Which are IGNORED/recomputed? | client `passed`, `testsPassed`/`testsTotal`, any client-sent `tests`/expected, `runner`, `testModelVersion`. |

### Adversarial results (all covered by tests)
1. passed=true + wrong actual → **FAIL** (server recomputes). ✅
2. forged testsPassed/testsTotal → **ignored**, recomputed. ✅
3. forged expected in request → **ignored**, DB spec used → fail. ✅
4. forged hidden-test result (wrong actual) → hidden **fails** on DB expected. ✅
5. forged activity/test-model version + runner → **ignored**, DB values used. ✅
6. correct output + unrelated source → **PASSES** — documented FORMATIVE limit
   (server can't prove the code produced the output; only CREDENTIAL tier can). ⚠️ honest
7. source changed after execution → code+outcomes graded as one unit; wrong
   `actual` still fails. No separate exec record exists to diverge from. ⚠️ honest
8. replay against another activity (not in run's mission) → **REJECT** (new
   MissionActivity membership check). ✅ (was a gap; fixed this pass)
9. replay against another learner's run → **REJECT** (ownership check). ✅
10. oversized submission → **REJECT** before DB (SANDBOX_LIMITS). ✅

### Honest statement of the boundary
For **FORMATIVE practice** this is sufficient and appropriate: a child gets real
execution + real per-test grading, and casual tampering (flipping `passed`, forging
counts, redefining tests, replaying across activities/runs) is defeated server-side.
It is **NOT tamper-PROOF**: a determined client can fabricate an `actual` that
matches the real expected output (cases #6/#7), because the server cannot re-run the
code. Defeating that requires the **CREDENTIAL tier** — isolated SERVER execution
against hidden tests — which is NOT built. Evidence from this path carries
`executionPolicy: FORMATIVE` so credential logic can distinguish it later. Do not
describe FORMATIVE coding evidence as credential-grade or tamper-proof.

## Follow-up hardening (tracked, not blocking)
1. CSP on the worker/runner origin to defense-in-depth block network from Pyodide.
2. Optional per-run memory hint / smaller Pyodide bundle.
3. CREDENTIAL tier: isolated server runner (container) for high-stakes/credential
   assessments — the only way to fully defeat result tampering.
4. Allowed-import list for Python if stdlib surface grows.
