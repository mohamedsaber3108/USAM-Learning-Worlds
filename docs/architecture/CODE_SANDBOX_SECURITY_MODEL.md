# Code Sandbox Security Model (audit T-P1-14)

This document is the authoritative description of how learner-written code is
executed and contained in USAM Learning Worlds, and why the chosen model is
safe for a children's product going live.

## TL;DR

**Learner code is never executed on our servers.** It runs entirely in the
learner's own browser, inside a sandboxed WebAssembly runtime in a Web Worker.
The backend only ever (a) serves mission specs and (b) receives the *results*
of a client-side run and validates them by plain string/JSON comparison.

## Why not server-side execution?

We evaluated server-side JS/Python execution sandboxes and **rejected them**:

- **`vm2`** — discontinued by its maintainer after repeated sandbox-escape
  CVEs. Not safe to build on.
- **`isolated-vm`** — more robust, but had a critical escape reported in 2026,
  and running arbitrary child-authored code server-side still concentrates
  risk (a single escape = access to our infrastructure and other children's
  data).

For a product used by children, the blast radius of a server-side escape is
unacceptable. Moving execution to the client removes that entire class of risk
from our servers: an escape in the browser sandbox compromises only the
learner's own browser tab, not our systems or other users.

Content was rephrased for compliance with licensing restrictions.

## The execution model

| Layer | Where | What runs | Isolation |
| --- | --- | --- | --- |
| Python missions | Learner browser | Pyodide (CPython compiled to WASM) in a Web Worker | WASM memory sandbox + Worker thread isolation + browser same-origin policy |
| JS/React missions | Learner browser | Sandpack in-browser bundler | Iframe + browser sandboxing |
| Validation & grading | Backend | No code — pure string/JSON comparison of client-reported output vs. mission assertions | N/A (no execution) |
| AI code review | Backend → Bedrock | The code is passed as **text** to the model for commentary; it is never executed | N/A (no execution) |

### Client-side containment properties

- **CPU/time**: the Web Worker running Pyodide is cancellable; the client
  enforces an execution timeout and reports `timedOut: true`. A timed-out run
  is graded as a failure server-side (`validate()` returns score 0).
- **Memory**: WASM linear memory is bounded by the browser; a runaway
  allocation crashes only the Worker, not the page or our servers.
- **No ambient authority**: code in the Worker has no filesystem, no network
  credentials, and no access to the parent page's DOM or the user's auth token.

## Backend responsibilities & hardening

Even though the backend never executes code, it accepts learner-supplied
**text** (source code + captured stdout/stderr/result) and persists it. That
input is bounded and rate-limited:

### Submission size limits — `SANDBOX_LIMITS` in `coding-sandbox.service.ts`

| Field | Limit |
| --- | --- |
| `code` | 200,000 chars |
| `stdout` | 100,000 chars |
| `stderr` | 50,000 chars |
| serialized `result` | 50,000 chars |

Over-limit submissions are **rejected** (`400`) before any DB write, in
`enforceSubmissionLimits()`. Legitimate child programs never approach these
sizes, so exceeding them indicates a bug or abuse.

### Rate limiting

`POST /coding-sandbox/submissions` is throttled to **60 submissions/minute**
per client (`@Throttle`), far above genuine human pace but enough to stop
scripted flooding of the AI-review + DB-write path.

### Trust boundary invariants (must stay true)

1. No backend code path executes, `eval`s, spawns, or shells out learner code.
2. The `submitResult` path only compares strings/JSON and stores text.
3. AI review receives code as an opaque string argument only.

If any future change would violate one of these, it must be reviewed against
this document first.

## Residual risks & mitigations

- **Client under-reports / fakes results** → the learner can only cheat *their
  own* mastery score; there is no privileged action gated on sandbox output, so
  the impact is limited to that learner's own progress data. Assertion-based
  grading (`stdout-equals`, `result-equals`) makes trivially-faked passes
  detectable if we later add server-recomputation of expected outputs.
- **Large/abusive payloads** → bounded by `SANDBOX_LIMITS` + rate limiting
  above.
- **Malicious code trying to escape the browser sandbox** → contained to the
  learner's own browser; no server or cross-user exposure.
