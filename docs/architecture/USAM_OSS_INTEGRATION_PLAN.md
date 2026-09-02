# USAM Open-Source Integration Plan

Status: proposed (research/planning only — no code merged by this doc)
Author: parallel research agent, 2026-09-02
Scope: concrete, prioritized "adopt THIS specific library" recommendations
for five real engine gaps, cross-referenced against
`docs/architecture/USAM_KIDS_ENGINE_INVENTORY_SOURCE.md` (Tier A-F
framework) and `docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md` (which
currently has an EMPTY License Registry — this doc seeds it).

Ground rule followed throughout: every license claim below was verified via
a live web search against the library's own LICENSE file or GitHub repo
metadata on 2026-09-02, not recalled from memory. Source URL is cited next
to each claim.

--------------------------------------------------------------------------
## 1. Coding Sandbox / Code Execution Security Engine

**Constraint that overrides everything else:** kids' code must NEVER
execute on our raw NestJS backend process or host. That rules out any
design where child-submitted code runs as a subprocess on the API server.

### Candidates evaluated

| Option | What it is | License | Where code runs |
|---|---|---|---|
| Pyodide | Full CPython compiled to WASM, runs in-browser | MPL-2.0 (verified: github.com/pyodide/pyodide/blob/main/LICENSE) | Browser sandbox (WASM), zero backend exposure |
| Sandpack (CodeSandbox) | React component toolkit for live JS/TS/React editing; browser bundler | Apache-2.0 (verified: github.com/codesandbox/sandpack, LICENSE file) | Browser (bundler-in-browser / optional Nodebox for Node runtime, which has its own restrictive EULA) |
| WebContainers (StackBlitz) | Full Node.js runtime in-browser via WASM | Core `webcontainer-core` client is MIT (github.com/stackblitz/webcontainer-core/LICENSE), **but** production/commercial use of the hosted WebContainers API requires a paid enterprise license (webcontainers.io/enterprise: "Licensing is required for production usage of the API in a commercial, for-profit setting") | Browser, but gated by StackBlitz's commercial terms |
| Judge0 | Backend sandboxed multi-language execution service (Docker/isolate) | **GPL-3.0** (verified: github.com/judge0/judge0 README "License: GNU General Public License v3.0", also confirmed via ecosyste.ms) | Backend, in isolated containers |
| Piston | Backend sandboxed multi-language execution engine (self-hosted) | MIT (verified: awesome.ecosyste.ms/projects — "License: mit"; public hosted API is now restricted to non-commercial keys per the README, but self-hosting the OSS code has no such restriction) | Backend, in isolated containers |

### Recommendation: **Pyodide as primary pick for Python; Sandpack as secondary pick for JS/React**

Rationale:
- Pyodide runs 100% client-side. There is no code path where a child's
  Python program ever touches our servers, so the "never execute on the
  raw backend" requirement is satisfied by construction, not by sandboxing
  discipline we have to get right and keep right. This is the strongest
  security posture available and it's free of any commercial-use
  friction: MPL-2.0 is a permissive-with-file-level-copyleft license —
  using Pyodide as a dependency (not modifying its own source files) does
  not require us to open-source USAM's own code. Commercial use: explicit
  **yes**. Redistribution of Pyodide's own files unmodified: yes, under
  MPL-2.0 notice-preservation terms; we are not modifying Pyodide's source,
  only consuming its published build artifacts via CDN/npm, so no
  copyleft obligation flows back onto USAM code.
- Sandpack (Apache-2.0, also fully permissive, explicit commercial-use
  yes, no restrictions for personal/private/commercial use per the
  project's own FAQ) is the right pick for JS/React coding missions aimed
  at the 12-14 age band, because it gives a live in-browser bundler +
  preview UI out of the box, which Pyodide does not (Pyodide is a Python
  runtime, not an editor/bundler UI).
- WebContainers is explicitly rejected for now: even though its client
  library is MIT, StackBlitz's own commercial terms require a paid
  enterprise license for any for-profit production use of the WebContainers
  API itself — that is a real legal/cost gate, not just an OSS license
  question, and it doesn't buy us anything Pyodide+Sandpack don't already
  cover for our current language set (Python + JS).
- Judge0 is rejected as the primary pick specifically because of its
  license: GPL-3.0 is strong copyleft. Running it as an arm's-length HTTP
  service we call over the network (not linking it into our binary) is
  legally fine and does not GPL-infect USAM's own backend code (this is
  the same "separate process over network" boundary that makes LanguageTool
  safe below), but it adds a bigger compliance surface (must preserve
  GPL notices for the Judge0 deployment itself, cannot fork-and-relicense
  it) for a use case (multi-language backend execution) we don't need yet
  because our curriculum is Python/JS-first for ages 8-14.
- Piston (MIT) is kept as the **Tier E fallback** for the day USAM needs
  backend-executed languages Pyodide can't cover (e.g. Java, C++, for a
  future advanced track) — MIT is fully permissive, no commercial
  restriction, and self-hosting the OSS repo is unaffected by the public
  API's new non-commercial key policy (that policy only applies to
  EngineerMan's *hosted* API, not to self-run instances of the OSS code).

### Tier classification
- Pyodide: **Tier A (Core)** — becomes a real, load-bearing part of the
  Coding Sandbox architecture for Python missions.
- Sandpack: **Tier A (Core)** — same status for JS/React missions.
- Piston: **Tier E (Optional)** — enable only if/when a language Pyodide
  can't cover is needed.
- WebContainers: **Tier F (Future)** — revisit only if USAM signs a
  StackBlitz commercial agreement; not worth building around today.
- Judge0: not recommended for adoption; documented here only as the
  evaluated-and-rejected alternative (license risk + unneeded scope).

### Concrete integration sketch

Backend (`backend/src/modules/`):
- New module `backend/src/modules/coding-sandbox/` (does not exist yet;
  `backend/src/modules/ai/services/coding-coach.service.ts` currently only
  gives AI code-review commentary, it does not execute anything — confirmed
  by reading the file list, there is no execution engine present today).
  - `coding-sandbox.module.ts`, `coding-sandbox.controller.ts`,
    `coding-sandbox.service.ts`.
  - The backend's ONLY job is: (a) serve the mission's starter code +
    test assertions as JSON, (b) receive the child's **output/results**
    (not raw execution) from the browser after Pyodide/Sandpack ran the
    code client-side, (c) validate those results against the mission's
    expected-output spec, (d) persist to `Submission`/`Attempt`
    Prisma models, (e) hand off to `coding-coach.service.ts` for AI
    feedback on the *code text* (static review only — the AI never
    executes code either).
  - The backend must never accept "please execute this code for me" as
    an API contract. If a future advanced track needs Piston, that would
    be a deliberately separate, heavily-isolated `coding-sandbox-piston`
    submodule with its own container, resource caps, and network
    egress-blocking — not a change to this module's trust boundary.

Frontend (`frontend/src/components/coding/`, new directory — none of this
exists yet, confirmed by directory search):
- `PyodideRunner.tsx` — loads `pyodide.js` from CDN (or self-hosted
  `/public/pyodide/`) into a Web Worker (not the main thread, so a
  runaway/infinite-loop child script can't freeze the UI), exposes
  `runPython(code): Promise<{stdout, stderr, result}>`.
- `SandpackMission.tsx` — wraps `@codesandbox/sandpack-react` with a
  locked-down template (no `iframe` navigation to arbitrary URLs, no
  network fetch allowed inside the sandbox bundle) for JS/React missions.
- `CodeMissionRunner.tsx` — the shared UI shell (editor + run button +
  output pane) that picks PyodideRunner or SandpackMission based on
  mission language, then POSTs the resulting output (not the execution
  request) to the new backend endpoint for grading/AI feedback.
- Resource safety even in-browser: enforce a wall-clock timeout in the
  Worker (e.g. 8s) and terminate the Worker on timeout, since Pyodide
  itself doesn't impose one — this is a USAM-side control, not something
  Pyodide provides.

--------------------------------------------------------------------------
## 2. English Learning — Grammar/Vocabulary (LanguageTool)

**License, verified:** LanguageTool core is **LGPL-2.1**
(github.com/languagetool-org/languagetool — repo badge "LGPL-2.1 license";
also confirmed via the Docker wrapper repo Erikvl87/docker-languagetool
which states the same LGPL-2.1 license, and the project's own
`COPYING.txt`, which frames LGPL's purpose explicitly as "to permit linking
those libraries into non-free programs").

**Commercial-use compatibility: YES, conditional.** LGPL-2.1's core
condition is about *linking*: if you statically link LGPL code into a
closed-source binary and distribute that binary, you'd owe source-
availability/relinking obligations for the LGPL component. USAM is not
doing that. LanguageTool would run as **its own separate Java service**
(self-hosted Docker container, e.g. the community `erikvl87/languagetool`
image, or LanguageTool's own official server jar), and the NestJS backend
calls it over HTTP as an independent process — there is no static or
dynamic linking of LanguageTool's code into the Node/NestJS binary at all,
just a network API call between two separately-running programs. This is
squarely the "aggregation, not linking" case LGPL is designed to allow, so
LGPL imposes no obligation on USAM's own NestJS/React code. The only
obligation is on LanguageTool itself if we ever *modify LanguageTool's own
source* and redistribute that modified version — then we'd owe those
modifications back under LGPL. We are not planning to modify LanguageTool
source, only run it as a black-box service.

**Redistribution implications:** none for USAM's own code. If USAM ships
the LanguageTool Docker image itself (rather than pointing at a hosted
instance), standard LGPL notice-preservation applies to that image's
bundled LanguageTool artifacts — trivial to satisfy by keeping the
upstream LICENSE/COPYING files in the deployed image.

**Integration path: self-hosted Docker, not the public API.** The public
LanguageTool API has strict rate limits and is not designed for production
traffic; self-hosting removes both the rate-limit risk and any question of
sending children's writing samples to a third-party endpoint (a Child
Safety Engine concern independent of licensing). Recommended stack:
`docker run -p 8010:8010 erikvl87/languagetool` (or the official
`languagetool-org` server image) behind an internal-only network route —
never exposed publicly, only reachable from the NestJS backend.

**Tier classification: Tier A (Core)** — becomes a real, load-bearing
grammar-check backend for the English Learning Engine's Grammar/Writing
sub-engines.

### Concrete integration sketch
- New service `backend/src/modules/english-learning/services/grammar-check.service.ts`
  (English coaching currently lives in
  `backend/src/modules/ai/services/english-coach.service.ts` and
  `english-coach.controller.ts`, which today is pure LLM-based feedback —
  no deterministic grammar-rule engine; LanguageTool complements, not
  replaces, that).
- `grammar-check.service.ts` calls
  `POST http://languagetool-internal:8010/v2/check` with `text` + `language`
  (`en-US`), parses the `matches[]` array (rule id, message, offset,
  length, replacements), and returns a normalized `GrammarIssue[]` DTO.
- `english-coach.service.ts` is updated to call `grammar-check.service.ts`
  first for deterministic rule-based issues (spelling, subject-verb
  agreement, punctuation), then layers the LLM's more holistic/pedagogical
  feedback on top — LanguageTool catches mechanical errors cheaply and
  reliably, the LLM handles style/clarity/age-appropriate explanation,
  each doing the part it's actually good at.
- Deploy as a new Docker Compose service alongside the existing backend
  stack on the Kids-server (16.16.128.228), internal network only, PM2 does
  not manage it directly (it's a container, not a Node process) but nginx
  routing/firewall rules must ensure port 8010 is never internet-facing.

--------------------------------------------------------------------------
## 3. Voice Pipeline (Gap Matrix row 11 — currently 100% missing)

Gap Matrix row 11 confirms: "NO ASR/TTS/VAD code found anywhere in backend
or frontend." This section proposes a minimal viable v1 — explicitly NOT
full streaming/VAD/real-time — that is achievable without heavy infra.

### ASR (speech-to-text) candidate: faster-whisper

**License, verified:** MIT (github.com/SYSTRAN/faster-whisper — repo
metadata "License: MIT License"; also confirmed via PyPI package page).
**Commercial use: explicit yes, no conditions.** Underlying model weights:
OpenAI Whisper's own model + code are also MIT
(github.com/openai/whisper/blob/main/LICENSE — verified directly), so
there's no separate model-license gotcha layered on top of faster-whisper's
own MIT license (faster-whisper is a CTranslate2-based re-implementation
that loads Whisper's published weights).

Why faster-whisper over whisper.cpp for v1: faster-whisper runs as a
Python process (easy to wrap in a small FastAPI/Flask sidecar service that
the NestJS backend calls over HTTP), and is meaningfully faster than
plain openai-whisper on CPU via CTranslate2 — good enough for a v1 "upload
a blob, get text back" flow without needing GPU infra. whisper.cpp (also
MIT, verified: github.com/ggml-org/whisper.cpp LICENSE file, "License: MIT
license") is the better pick later if USAM wants a smaller-footprint,
zero-Python-dependency binary (e.g. for a lower-resource deployment target),
but for a v1 built by a small team it adds a C++ build step for no v1
benefit — noted here as the Tier E "revisit if infra needs shrink" option.

### TTS (text-to-speech) candidate: Piper

**License, verified:** MIT (github.com/rhasspy/piper — repo badge "MIT
license"; explicitly discussed in the project's own GitHub Discussion #271,
where a maintainer confirms "the piper project itself is licensed under the
MIT license... it can be used in any other projects for any purpose, even
commercially"). **Commercial use: explicit yes, no conditions.** Piper
voice models are distributed separately (`rhasspy/piper-voices` on Hugging
Face) — need to verify per-voice license before shipping a specific voice
in production (most piper-voices are also MIT/permissive, but that is a
per-voice-file check, not a per-library check, and should be done again at
implementation time for whichever specific English voice is selected).
Piper is small, fast (real-time on CPU), and produces natural-sounding
speech — a good fit for a first version without GPU/TTS-cluster infra.

### Minimal viable v1 architecture (no VAD/streaming yet)

```
[Frontend: record audio blob via MediaRecorder API]
        |  POST multipart/form-data (webm/wav blob)
        v
[Backend: new module backend/src/modules/voice/]
        |  voice.controller.ts receives blob, saves to tmp/S3
        |  voice.service.ts calls ASR sidecar over HTTP
        v
[ASR sidecar: small FastAPI service wrapping faster-whisper]
        |  returns { text: "..." }
        v
[Backend: voice.service.ts hands text to existing conversation.service.ts /
 AI Tutor pipeline exactly like a typed message would go — no separate
 "voice" conversation logic needed, this reuses ai/services/conversation.service.ts]
        |  gets back AI text response
        v
[Backend: voice.service.ts calls TTS sidecar]
        |
        v
[TTS sidecar: small service wrapping Piper CLI/Python bindings]
        |  returns audio file (wav)
        v
[Backend: returns { transcript, aiResponseText, audioUrl } to frontend]
        |
        v
[Frontend: VoicePlayer.tsx plays audioUrl via <audio> element]
```

Explicitly deferred to a later iteration (do not build now): live
mic-streaming ASR, voice-activity-detection (VAD) for turn-taking,
WebRTC/LiveKit real-time pipes, lip-sync/animation triggering. The record
→ upload → ASR → text → AI → TTS → play round-trip above is the entire
v1 scope, and it deliberately reuses the existing text conversation engine
rather than building a parallel voice-specific AI pipeline.

**Tier classification:**
- faster-whisper (ASR): **Tier B (Embedded)** — wrapped in a small USAM-
  owned sidecar service, not modified at the library level.
- Piper (TTS): **Tier B (Embedded)** — same pattern.
- whisper.cpp: **Tier E (Optional)** — later resource-footprint upgrade
  path, not part of v1.
- Full VAD/streaming/LiveKit stack: **Tier F (Future)**.

### Concrete integration sketch
- `backend/src/modules/voice/` (new): `voice.module.ts`,
  `voice.controller.ts` (endpoint `POST /voice/turn` accepting an audio
  blob + conversationId), `voice.service.ts` (orchestrates ASR sidecar call
  → `conversation.service.ts` reuse → TTS sidecar call).
- Two small Python sidecars (`services/asr-sidecar/`, `services/tts-
  sidecar/` at repo root, each a minimal FastAPI app, each its own Docker
  container) — kept separate from the main NestJS backend process
  intentionally, same reasoning as LanguageTool: Python ML deps don't
  belong in the Node runtime, and container isolation limits blast radius.
- `frontend/src/components/voice/VoiceRecorder.tsx` (MediaRecorder capture
  + upload) and `VoicePlayer.tsx` (playback) — new directory, none of this
  exists yet.

--------------------------------------------------------------------------
## 4. Child Safety Engine — Presidio addition to moderation.service.ts

**License, verified:** MIT (github.com/microsoft/presidio LICENSE file —
"The MIT License (MIT), Copyright (c) Presidio Contributors"; also
confirmed via multiple independent mirrors/aggregators showing "MIT
License"). **Commercial use: explicit yes, no conditions.**
**Redistribution: yes**, standard MIT notice-preservation only.

Current state (read directly from
`backend/src/modules/ai/moderation.service.ts`): `moderateContent()` sends
raw text to an LLM (Bedrock) with a prompt asking it to flag, among other
things, "Contains personal information (names, addresses, phone numbers,
emails)" and returns a JSON verdict. This is **LLM-based PII detection
only** — probabilistic, prompt-dependent, no deterministic pattern-matching
backstop, and (per Microsoft's own docs, cross-checked in the search
results) even Presidio's authors explicitly warn it "does not guarantee...
all sensitive information" will be caught — so Presidio is a
complement, not a replacement, for the existing LLM check, exactly
matching the task's framing ("addition to... existing moderation").

**Concrete integration point:** add a **pre-check** step inside
`moderateContent()` in `backend/src/modules/ai/moderation.service.ts`,
before (or in parallel with) the Bedrock LLM call:

```ts
// New: backend/src/modules/ai/services/pii-detection.service.ts
// Wraps a small Python Presidio sidecar (same "separate service" pattern
// as LanguageTool/ASR/TTS above — Presidio is a Python/spaCy library,
// does not belong inlined into the Node runtime).
async detectPii(text: string): Promise<PiiEntity[]> {
  const res = await this.http.post('http://presidio-internal:5002/analyze', {
    text, language: 'en',
  });
  return res.data; // [{ entity_type: 'EMAIL_ADDRESS', start, end, score }, ...]
}
```

Then in `moderation.service.ts`:
```ts
async moderateContent(content, contentType, userId) {
  const piiHits = await this.piiDetection.detectPii(content);
  if (piiHits.length > 0) {
    // deterministic, high-confidence override: treat any detected PII
    // (child sharing phone/address/email) as an immediate HIGH-severity
    // flag, independent of what the LLM concludes — this is exactly the
    // "stronger than generic AI safety" bar the inventory doc sets for
    // the Child Safety Engine vs. the generic AI Safety Engine.
  }
  // ... existing Bedrock LLM call continues as today, its verdict is
  // combined (OR'd) with the Presidio verdict, not replaced by it.
}
```

Deployment: Presidio's own recommended stack is a Python service (its repo
lists spaCy/Kubernetes/Redis/GRPC as its tech stack) — same pattern as the
LanguageTool/voice sidecars: a small containerized Python service,
internal-network-only, called over HTTP from `ModerationService`.

**Tier classification: Tier B (Embedded)** — Presidio is wrapped as its
own sidecar service (not modified at the source level), used as a
deterministic backstop layered onto the existing LLM-based moderation, not
a replacement for it. This directly matches the inventory doc's list of
Presidio as a named Tier-B-appropriate safety candidate.

--------------------------------------------------------------------------
## 5. Coding Curriculum Content Source (ages 8-11) — Blockly

**License, verified:** Apache-2.0 (github.com/google/blockly and its
current maintainer, github.com/RaspberryPiFoundation/blockly — both show
"License: Apache License 2.0"; the project's own FAQ at blockly.com states
"Blockly's core library is free and open source under the Apache 2.0
license"). Note: Blockly's stewardship has moved from Google to the
Raspberry Pi Foundation (a UK charity) with continued Google.org support —
license stayed Apache-2.0 through that transition, confirmed by both repos.
**Commercial use: explicit yes, no conditions.** **Redistribution: yes**,
standard Apache-2.0 notice/attribution/changes-statement requirements
(trivial to satisfy — keep the NOTICE file, state that USAM customized the
block definitions).

**Tier classification: Tier B (Embedded)** — per the inventory doc's own
framing ("take the library/engine, modify it"), Blockly is meant to be
customized: USAM will define its own custom block sets (age-appropriate
vocabulary, USAM-branded block categories tied to mission objectives) on
top of the Blockly core engine, which is exactly the Tier B pattern, not a
black-box Tier A dependency.

### Concrete integration sketch
- `frontend/package.json`: add `blockly` (npm package, same Apache-2.0
  license as the GitHub repo).
- New: `frontend/src/components/coding/blockly/BlocklyMissionEditor.tsx` —
  mounts `Blockly.inject()` into a container div, loads a custom
  `usam-blocks.ts` block-definition file (age-8-11 vocabulary: "when
  game starts", "move forward", "repeat N times", "if/then" — simplified
  English, no raw language keywords).
- `frontend/src/components/coding/blockly/usam-blocks.ts` — defines USAM's
  own custom blocks via `Blockly.Blocks[...] = {...}` and generators that
  transpile blocks to either (a) a small custom JS runtime for game/mission
  actions, or (b) real Python/JS text for a "graduate to text code" toggle
  that previews what the blocks generate — a common Blockly pattern for
  smoothing the block-to-text transition, directly supporting the
  inventory doc's "Blockly/Scratch for 8-11, Python/JS for 12-14" age split.
- The generated code (JS/Python text) then flows into the **same** Pyodide/
  Sandpack execution path from Section 1 — Blockly is a front-end authoring
  layer, not a separate execution engine, so it doesn't introduce a new
  execution-security surface.
- Backend touchpoint: none required for v1 beyond what Section 1's
  coding-sandbox module already provides (Blockly-generated code is just
  another source of the same "code text" the sandbox module already
  expects).

--------------------------------------------------------------------------
## Open-Source License Registry (seed for Gap Matrix Part 3)

Per the inventory doc's mandatory rule: every adopted external
library/dataset gets an entry here BEFORE merge. All entries below are
**status = proposed** (none merged yet — this document is research/
planning only, per this task's explicit scope). Once any engineering agent
actually merges one of these, update its status here and mirror the entry
into `docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md` Part 3, which is
still empty as of this writing.

| Library | License | Commercial use Y/N | Redistribution Y/N | Tier | Purpose | Status | Source verified |
|---|---|---|---|---|---|---|---|
| Pyodide | MPL-2.0 | Y | Y (notice-preserving, no modification planned) | A | In-browser Python execution — Coding Sandbox | proposed | github.com/pyodide/pyodide/blob/main/LICENSE |
| Sandpack (@codesandbox/sandpack-react) | Apache-2.0 | Y | Y | A | In-browser JS/React execution — Coding Sandbox | proposed | github.com/codesandbox/sandpack/blob/main/LICENSE |
| Piston | MIT | Y (self-hosted; public hosted API now restricted to non-commercial keys, self-host unaffected) | Y | E | Backend fallback execution for languages Pyodide/Sandpack can't cover | proposed | awesome.ecosyste.ms/projects/github.com%2Fengineer-man%2Fpiston |
| WebContainers (webcontainer-core client) | MIT (client lib); commercial production use of hosted API requires paid StackBlitz enterprise license | Conditional — client lib Y, hosted API N without paid license | Y (client lib only) | F | Rejected for now; revisit only with a commercial StackBlitz agreement | proposed (not adopted) | github.com/stackblitz/webcontainer-core/blob/main/LICENSE; webcontainers.io/enterprise |
| Judge0 | GPL-3.0 | Y as arm's-length network service; N to link/embed/fork-relicense | Y (with GPL notice obligations on the deployed instance) | — (rejected) | Evaluated, not adopted — see Section 1 rationale | proposed (not adopted) | github.com/judge0/judge0 (v1.10.0 README, "License: GNU General Public License v3.0") |
| LanguageTool | LGPL-2.1 | Y — commercial use fine when run as a separate service, no static linking into USAM binary | Y (self-hosted image; standard LGPL notice terms if we redistribute the image) | A | Deterministic grammar/spelling rule engine for English Learning Engine | proposed | github.com/languagetool-org/languagetool (repo badge "LGPL-2.1 license"); github.com/Erikvl87/docker-languagetool |
| faster-whisper | MIT | Y | Y | B | ASR sidecar for Voice Pipeline v1 | proposed | github.com/SYSTRAN/faster-whisper (repo metadata, "License: MIT License") |
| OpenAI Whisper (model+code, underlying faster-whisper) | MIT | Y | Y | B | Underlying ASR model weights/code | proposed | github.com/openai/whisper/blob/main/LICENSE |
| whisper.cpp | MIT | Y | Y | E | Lower-footprint ASR alternative for later resource-constrained deploys | proposed | github.com/ggml-org/whisper.cpp/blob/master/LICENSE |
| Piper (TTS) | MIT | Y | Y | B | TTS sidecar for Voice Pipeline v1 | proposed | github.com/rhasspy/piper (repo badge "MIT license"; maintainer confirmation in Discussion #271) |
| Piper voices (rhasspy/piper-voices, specific voice model TBD) | Per-voice, mostly permissive — must re-verify exact voice file license before production ship | TBD per voice | TBD per voice | B | Specific English voice asset for TTS | proposed — needs per-voice re-check at implementation time | huggingface.co/rhasspy/piper-voices (index only; not a per-voice license statement) |
| Microsoft Presidio | MIT | Y | Y | B | Deterministic PII detection backstop added to `moderation.service.ts` | proposed | github.com/microsoft/presidio (mirrored LICENSE file, "The MIT License (MIT)") |
| Blockly | Apache-2.0 | Y | Y (standard Apache-2.0 notice/attribution) | B | Block-based coding editor, ages 8-11 | proposed | github.com/RaspberryPiFoundation/blockly (current steward) and github.com/google/blockly, both "License: Apache License 2.0"; blockly.com FAQ |

--------------------------------------------------------------------------
## Summary table — Tier classification by recommendation

| Tier | Meaning (per inventory doc) | Items |
|---|---|---|
| A — Core | Becomes real part of architecture | Pyodide, Sandpack, LanguageTool |
| B — Embedded | Take the library, modify/wrap it | faster-whisper, Piper, Presidio, Blockly |
| E — Optional | Enable if/when needed | Piston, whisper.cpp |
| F — Future | Revisit later, not now | WebContainers |
| Rejected | Evaluated, not adopted | Judge0 (license risk + unneeded scope) |

--------------------------------------------------------------------------
## Top 3 highest-priority integrations to start building next

1. **Pyodide + Sandpack for the Coding Sandbox (Section 1).** This is the
   only item on this list that closes a hard security requirement stated
   explicitly by the user ("kids' code must NEVER execute on the raw
   backend"). Every day this doesn't exist is a day the platform either
   has no code-execution feature at all, or (worse) someone is tempted to
   wire up a quick backend `exec()`-style shortcut under deadline pressure.
   It's also the cheapest of the five to ship a v1 of — no new backend
   infra, no new Docker services, just frontend work plus one thin backend
   grading endpoint — and it directly unblocks Blockly (item 3) as its
   downstream consumer.

2. **LanguageTool self-hosted grammar service (Section 2).** English
   Learning is called out as its own sub-platform in the inventory doc, and
   right now grammar feedback is 100% LLM-prompted with no deterministic
   backstop — meaning grammar checking is only as reliable as whatever the
   LLM happens to notice on a given call, with no consistency guarantee.
   LanguageTool is a single `docker run` away from existing, the licensing
   question is fully resolved (LGPL is a non-issue for a separate-service
   architecture we're already using elsewhere), and it makes the existing
   `english-coach.service.ts` measurably better with one integration point.

3. **Presidio as a moderation.service.ts backstop (Section 4).** This is
   the smallest lift of the three (one sidecar, one new service class, one
   `if (piiHits.length > 0)` branch) but addresses the highest-stakes gap:
   the Child Safety Engine's own stated bar is "stronger than generic AI
   safety," and right now PII detection is *entirely* delegated to an LLM
   prompt with no deterministic fallback. A child accidentally pasting a
   phone number or home address should never depend solely on whether the
   LLM's moderation call happened to catch it that particular time.
   Presidio is MIT, trivially embeddable, and directly upgrades an
   already-shipped safety-critical code path rather than building something
   new from zero.

The Voice Pipeline (Section 3) and Blockly (Section 5) are real, valuable,
correctly-scoped-for-soon work, but they are larger builds (two new sidecar
services plus a new frontend surface for voice; a full custom block-set
authoring layer for Blockly) that should follow, not precede, the three
above — Blockly in particular has a real dependency on item 1 being in
place first (it needs a code-execution target to hand its generated code
to).
