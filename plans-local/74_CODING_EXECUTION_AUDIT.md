# 74 — Coding Execution Audit (before hardening)

> Mandate: document exactly how coding execution works today, classify each
> piece KEEP/HARDEN/REPLACE/DELETE, and do NOT build a parallel system.
>
> **Headline: the real isolated-execution architecture ALREADY EXISTS and is
> sound.** A prior audit note (session summary) claimed "no CodeMissionRunner /
> Pyodide / sandbox exist" — that was WRONG (it searched a stale worktree). This
> audit is grounded in direct reads of `M:\USAM-main`. The work here is
> HARDEN + INTEGRATE + PROVE, not build-from-scratch.

## What actually exists (verified by direct file reads)

### Frontend (`src/`)
- `components/coding/PyodideRunner.tsx` — CPython via **Pyodide/WASM in a Web
  Worker**; **8s wall-clock timeout terminates the worker** (infinite-loop
  protection). Runs 100% client-side; backend never sees code before it runs.
  Loads Pyodide from jsDelivr CDN inside the worker.
- `components/coding/SandpackMission.tsx` — JS/React execution via
  `@codesandbox/sandpack-react` (in-browser bundler).
- `components/coding/CodeMissionRunner.tsx` — editor + Run + output; routes
  Python→Pyodide, JS→Sandpack; POSTs only `{runId, activityId, code, language,
  stdout, stderr, result, durationMs, timedOut}` to the sandbox API. Renders
  per-assertion pass/fail + coach feedback.
- `components/mission/ActivityRunner.tsx` — the shared mission player. `kind:
  "coding"` → `CodingActivitySurface` → fetches `codingSandboxAPI.getMission()`
  → `CodeMissionRunner` with the real `runId`. **Already integrated into the
  mission engine.**
- Also a second, older coding surface: `routes/code.*` (Workbench, PathwayMap,
  labs) + `routes/coding-learning.tsx` (`CodingLearning`, the concept browser).
- Deps: `pyodide@^314`, `@codesandbox/sandpack-react@^2.20`. No Blockly/Monaco/
  CodeMirror deps (editor is a plain textarea today).

### Backend (`backend/src/modules/coding-sandbox/`)
- `coding-sandbox.service.ts` — **explicit trust boundary: NEVER executes code.**
  `getMission()` reads `Activity.content` (starterCode + `assertions`);
  `submitResult()` validates client results against assertions
  (`stdout-equals` / `stdout-contains` / `result-equals`), enforces
  `SANDBOX_LIMITS` (code 200k / stdout 100k / stderr 50k / result 50k chars),
  persists `ActivityAttempt` (rich response incl. assertionOutcomes + runner),
  calls `masteryService.recordEvidence(competencyId, 'CREATION', passed, score,
  {...}, attemptId)`, and attaches best-effort AI review. Registered in
  `app.module.ts` (`CodingSandboxModule`).
- `coding-sandbox.controller.ts` — `GET /coding-sandbox/missions/:activityId`,
  `POST /coding-sandbox/submissions` (JWT-guarded, throttled 60/min). Never
  accepts "execute this".
- `coding-sandbox.limits.spec.ts` — 5 tests: rejects oversized code/stdout/
  stderr/result + missing learner id.

## Classification

| Component | Verdict | Notes |
|---|---|---|
| PyodideRunner (Worker + 8s timeout) | **KEEP + HARDEN** | Real, safe. Harden: run visible+hidden TESTS (not just raw run), memory guard, and don't trust client-reported pass — re-validate server-side against the assertion spec (already partly done). Pin Pyodide version / consider self-hosting vs CDN. |
| SandpackMission (JS) | **KEEP** | Safe in-browser. Extend to run JS test assertions. |
| CodeMissionRunner | **KEEP + HARDEN** | Add per-test UI, hints-used + attempt tracking, age-appropriate error mapping (no raw tracebacks). |
| ActivityRunner coding bridge | **KEEP** | Already routes CODE → sandbox path with runId. |
| coding-sandbox.service (trust boundary + assertions + limits + evidence) | **KEEP + HARDEN** | This is the correct grader. Harden: richer test model (input/functionName/args/expectedReturn + hidden tests), richer Evidence.context, age-appropriate feedback. |
| coding-sandbox.controller | **KEEP** | JWT + throttle already present. |
| CodingCoachService.reviewCode | **KEEP** | Static text review, never executes. Wire real failing-test context (task #7). Bedrock runtime stays externally gated. |
| Backend generic `evaluateCode` (missions ActivityEvaluator, keyword check) | **REPLACE (route away)** | The weaker path. CODE activities should grade via the coding-sandbox assertion path, NOT keyword matching. Keep the function for now (other callers/tests) but stop routing real coding activities through it. |
| `code.*` routes / Workbench / PathwayMap (older lab surface) | **KEEP (evaluate later)** | Separate concept-lab UI; not the mission-graded path. Don't delete; assess whether it should also feed the sandbox path. Out of scope for this batch. |

## The real gaps to close this batch (NOT missing capability — integration)
1. **My seeded slice uses the WRONG grader.** `coding-mission-first-loops`
   activities (`coding-act-loops-*`) carry `requiredKeywords` and are graded by
   the keyword `evaluateCode` via `/missions/runs/:runId/submit`. They must
   instead carry `assertions` (+ new test model) and grade via the
   coding-sandbox path. **This is why "keyword grading" was live — the strong
   path existed but the seed didn't use it.**
2. **Test model is stdout/string-only.** Extend `Activity.content.assertions`
   to a versionable test spec: `input` / `expectedOutput` / `functionName` /
   `args` / `expectedReturn` / `visibleTests` / `hiddenTests` / `timeout` /
   `executionPolicy`. Validate the shape.
3. **Trust model undocumented.** Browser results are tamper-able. Define
   FORMATIVE (browser exec + client tests + server re-validation of reported
   output vs assertion spec) vs credential-grade (needs isolated SERVER
   execution service — a documented later phase). Never claim browser results
   tamper-proof.
4. **Evidence.context is thin** (runner only). Add testsPassed/testsTotal,
   attempt#, hints, errors, execTime, language, activity version.
5. **Coach lacks failing-test context** (task #7).
6. **Lazy-loading** (task #9) — RESOLVED. Findings + fix:
   - Pyodide is ALREADY lazy: `PyodideRunner` loads it via `importScripts(CDN)`
     inside a Worker built from a Blob string, so the `pyodide` npm package is
     NOT in the frontend bundle graph at all — fetched at run time only.
   - Sandpack WAS eagerly pulled into the missions route: `missions.$missionId`
     → `ActivityRunner` → (static) `CodeMissionRunner` → `SandpackMission` →
     `@codesandbox/sandpack-react`. So English/other non-coding missions loaded
     the heavy Sandpack dep. FIXED: `ActivityRunner` now `React.lazy()`-imports
     `CodeMissionRunner` and renders it under `<Suspense>` — the coding chunk
     (Sandpack + editor) loads ONLY when a `kind:"coding"` activity opens.
   - Verification: confirmed by import-graph analysis; the exact chunk split is
     confirmed by `vite build` in the deploy pipeline (frontend node_modules is
     not present in this worktree, so a local `vite build` couldn't be run here).
7. **No automated test of the sandbox grading path** beyond size limits — add
   pass/fail/partial/syntax/runtime coverage + canonical-loop (task #10).

## Trust model (documented per mandate)
- **Infrastructure safety: solved.** Code executes only in the learner's
  browser (Pyodide Worker / Sandpack). The NestJS process never executes learner
  code. This is a hard architecture rule and remains satisfied.
- **Result integrity: NOT solved by browser execution alone.** A determined
  client can POST fabricated stdout/result. Therefore:
  - **FORMATIVE practice** (this slice): browser execution + client-run tests +
    **server-side re-validation of the reported output against the assertion
    spec**. Good enough for practice + formative mastery. Accepts that a
    motivated child could spoof a pass — acceptable for non-credential learning.
  - **Credential / high-stakes**: requires **isolated server-side execution**
    (containerized runner that actually runs the code against hidden tests).
    Documented as a FUTURE phase; NOT built now. Evidence produced by the
    formative path must NOT be labeled credential-grade.
- This distinction will be recorded on the Evidence (`context.executionPolicy`)
  so mastery/credential logic can treat them differently later.

## JS execution (task #4) — status
Sandpack (`SandpackMission`, `@codesandbox/sandpack-react`) is KEPT — it runs JS
in its sandboxed preview iframe (no app-context `eval`; `externalResources: []`,
navigator/open-in-codesandbox disabled). `CodeMissionRunner` now builds
`testOutcomes` from the captured console stdout for `stdout-equals`/`stdout-contains`
tests and POSTs them to the same server-graded path (server re-validates). So JS
stdout exercises grade through the identical spine as Python. `function-call` /
`result-equals` tests are NOT yet supported on the JS path (those exercises use
Python today) — documented limitation, not a broken path.

## Blockly (task #5) — status: architecture wired, block-editor UI deferred
Blockly is designed as a **content flag, not a separate engine**: an Activity sets
`content.runner = 'blockly'`, the backend `getMission`/`parseExerciseSpec` returns
`runner: 'blockly'`, and blocks are meant to generate Python that runs through the
EXACT same Pyodide worker + test-model + Evidence path. No parallel grading/mastery.
However, **no Blockly dependency is installed** (`package.json` has no `blockly`),
so the visual block-editor UI does not exist yet. Adding it is a dependency +
UI task (generate Python from blocks, feed `runPythonTests`) — deferred and
documented rather than fabricated. The spine is ready to receive it with zero
backend/evidence changes.

## Plan for this batch (tasks 2–13)
Harden the existing stack, re-point the seeded slice to the sandbox assertion
path with a real test model, enrich Evidence, wire coach context, add tests +
canonical-loop coverage, verify lazy-loading, wire deploy guards, prove live.
No new execution engine.
