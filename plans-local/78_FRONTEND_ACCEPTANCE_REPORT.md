# 78 — Frontend Reconciliation: Final Acceptance Report

## ✅ FRONTEND RECONCILIATION = PRODUCTION VERIFIED (2026-09-30)

Deployed + live-verified from commit **`1ae4dcd`** on production
(`https://kids.usamif.com`, server `~/USAM-Learning-Worlds`, Kids-server
i-00b9e230cc89349a3). Evidence captured from the live server this date:

| Gate | Live evidence |
| --- | --- |
| DEPLOYED ✅ | `deploy-meta` commit `1ae4dcd` == source; live bundle `index-D9OQiNSF.js` == built; deploy.sh all 7 stages green; DEPLOY_EXIT=0 |
| Deploy gates ✅ | enum-drift (45/45), migrations (all tables/cols present), backend 120/120, frontend tsc clean, frontend 40/40, **home-bundle perf gate ✔ in the prod build** (coding runtime absent from index.html + entry), nginx reloaded |
| PM2 / nginx ✅ | `usam-backend` online; `nginx -t` OK; backend health 200 |
| LIVE API ✅ | login works; every learner endpoint 401 unauth; auth guards verified |
| LIVE DATA ✅ | 12 learners, 10 evidence rows, 6 mastery records (DEVELOPING×4/PROFICIENT×1/PRACTICING×1); all 4 domains return real skill→competency→mission; 5 recommendations; 5 missions |
| CODING JOURNEY ✅ | Live run `7d26808d` attempts prove the full CLIENT-EXECUTED/SERVER-VALIDATED loop: `print(999)`→server graded fail(0); `for i in range(1,4): print(i)`→server graded pass(1) **including the hidden `print123-contains-2` test the server re-applied**. Attempts persisted with `executedBy:"pyodide"`, real `actual` output → Evidence → Mastery (Loops PRACTICING, confidence 0.512, evidenceCount 4, reviewDue scheduled) |
| Hidden-test strip ✅ | coding-sandbox API response omits hidden test `expectedOutput` while the DB spec retains `"2"` — the trust-model fix proven live |
| Practice/Review ✅ | `/mastery/review-due` returns real data; 0 due today is **correct** (all 6 reviewDue dates are future: Oct 6–13) — honest empty state, not a fake count |
| Parent Safety ✅ | endpoint live; learner→403 (authorization enforced); 0 escalations = healthy all-clear state the panel renders |
| Age model | enum `AGE_8_9`/`AGE_10_11`/`AGE_12_14` confirmed live = COMPATIBILITY MODE / MIGRATION PENDING (as documented in AGE_MODEL.md) |
| Architecture | ONE canonical frontend `frontend/`; root `src/` = PRESERVE/QUARANTINE (Lovable, CI-guarded) |

### The 3 acceptance questions — final answers
1. **One canonical production frontend?** YES — `frontend/`, deployed at `1ae4dcd`. Root `src/` quarantined. ✅
2. **Child experiences every engine coherently, no backend jargon?** YES — routes browser-render-verified (16 Playwright tests), coding journey proven live, mastery/age/review shown in child language. ✅
3. **Parent understands progress/mastery/evidence/projects/entitlements/safety?** YES — all from real endpoints incl. the new live Safety projection. ✅

### Honest residual (non-blocking, tracked)
- **Creativity prompts = 0 in prod** — the creativity domain has a path/mission, but the prompt library isn't seeded; the Studio correctly shows its empty state. Seed to populate.
- **Human multi-device / RTL visual QA** across 7-9/10-12/13-15 × phone/tablet/desktop — automated route-render + RTL is proven (Playwright); a manual human visual pass remains recommended.
- **Voice runtime** — Bedrock/ASR/TTS provider-gated; text-fallback path verified, live voice round-trip needs creds.
- **Age model** — COMPATIBILITY MODE / MIGRATION PENDING (display layer; persistence unmigrated by design).

Ledger 76 per-engine 8-stage table updated to reflect DEPLOYED + LIVE VERIFIED where proven.

---

## ✅ CURRICULUM BREADTH PHASE — English (2026-09-30, PRODUCTION VERIFIED)

Post-reconciliation product phase: authoring real gradeable content on the
already-proven shared learning spine (NOT new engines/slices). Status guards
unchanged: Voice = PROVIDER-GATED, Age = COMPATIBILITY MODE, frontend
architecture phase remains PRODUCTION VERIFIED at `1ae4dcd` (docs closure
`8841d91`) — NOT reopened.

### Creativity prompt library — commit `f501f23`
Seeded 10 CreativityPrompt rows live; Studio submission loop works (submission
`7491c586` persisted, mySubmissions=1). No Evidence/Mastery write by design
(standalone creativity submission engine does not write mastery — not
fabricated). Prompts left `domain: None` (cross-domain; seed slugs don't map to
prod's 5 domains — documented decision).

### English breadth WAVE 1 — commit `3c13565` (`seed-english-breadth-a1.ts`)
4 A1 competencies / 12 activities: Grammar / Reading / Listening / Writing.
Self-sufficient idempotent strand upserts (fixes the strandType gap). Live
verified: English path grew to 5 skills / 5 competencies; grammar SELECT graded
live → "Basic sentences (A1)" DEVELOPING, confidence 0.725, evidenceCount 1,
reviewDue 2026-10-14 (attempt `80eaf0c4`). Correct submit route confirmed:
`POST /api/missions/runs/:runId/submit` body `{activityId, response}`.

### English breadth WAVE 2 — commit `9584bfe` (`seed-english-breadth-a2.ts`)
5 competencies / 14 activities: Pronunciation A1, Speaking & Conversation A1,
Dictation A1, Shadowing A1 (all honest TEXT-PROXY — no faked microphone
grading, real audio scoring stays with the PROVIDER-GATED Voice pipeline) +
Writing PROJECT A2 (plan SEQUENCE + CREATE capstone). Live verified 2026-09-30:
- Seed ran clean: `competencies=5, activities=14`.
- English path grew to **9 skills / 10 competencies** (all wave-2 strands lit).
- Live SOLVE dictation grade: `success:true, score:1, "Correct! Well done!"`
  (attempt `29de5e16`) on `english-act-dict-write`.
- Mastery landed: "Write words correctly (A1)" DEVELOPING, confidence 0.725,
  evidenceCount 1, reviewDue 2026-10-14 (skill=English Dictation, strandId set).
- `mastery/by-domain`: English now aggregates 3 competencies with records.
- SUMMATIVE guard confirmed working (retake of a summative in the same run is
  correctly rejected with 400).

English priority strands now covered on the spine: Vocabulary, Grammar,
Reading, Listening, Writing (A1+A2 project), Pronunciation, Speaking/
Conversation, Dictation, Shadowing.

## ✅ CURRICULUM BREADTH PHASE — Coding (2026-09-30, PRODUCTION VERIFIED)

Scaled the CANONICAL `coding` domain (the one the mastery graph +
`/coding/learner/progress` use) beyond the single proven "Loops (intro)"
vertical slice — real gradeable content on the same shared spine + the proven
coding-sandbox test-model v1 contract (browser Pyodide execution, SERVER
re-validation). NOT a new engine/slice.

### Coding breadth WAVE 1 — commit `2318ef8` (`seed-coding-breadth-a1.ts`)
6 competencies / 17 activities across 3 skills:
- Computational Thinking (reasoning, no syntax): Think in steps — SEQUENCE + SELECT
- Programming Fundamentals: Variables & output, Making decisions (if/else),
  Functions — CODE (Python/Pyodide)
- Problem Solving & Debugging: Debugging (fix broken code), Mini project
  (sum-to-n capstone) — CODE (Python/Pyodide)

CODE activities carry coding-test-model v1 (`testModelVersion:1`, stdout-equals
/ function-call / stdout-contains, visible + hidden tests). FORMATIVE trust
tier recorded on evidence. Reasoning activities graded by the shared
ActivityEvaluator. Live verified 2026-09-30:
- Seed ran clean: `competencies=6, activities=17`.
- Coding path: **3 skills / 7 competencies** (Loops intro + all 6 new).
- `GET /coding-sandbox/missions/coding-act-debug-fix-sum` served the spec with
  the hidden test `add-10-1` expected value STRIPPED (trust model intact live).
- Live CODE submit on `coding-act-debug-fix-sum` (fixed `add(a,b)`):
  `passed:true, score:1, testsPassed:2, testsTotal:2` — server re-validated the
  client-reported `actual` (`"5"`, `"11"`) via gradeAgainstSpec; both a visible
  AND a hidden test passed through the trust boundary.
- Mastery landed: `coding-competency-debugging` DEVELOPING, confidence 0.725,
  evidenceCount 1, reviewDue 2026-10-14 (CREATION evidence).

Coding priority strands now on the canonical spine: computational thinking,
variables/output, conditionals, functions, loops, debugging, mini-project.
Next: AI Literacy breadth. (Blockly + JS-web/sandpack runners are supported by
the test-model but not yet authored as content — a later coding wave.)

---

## (Original report — pre-deploy code+browser verification)

> Phase: full frontend reconciliation with the real backend platform. This
> report answers the three acceptance questions, summarizes coverage, routes,
> mocks, and blockers, and is honest about what is code-verified vs what needs a
> live environment.

Branch: `fix/p0-p1-remediation` · Canonical frontend: `frontend/` · HEAD at report time: `ca8a79a`.

## Verification status legend

- ✅ **code-verified** — built/typechecked/tested here (tsc clean, 40 vitest, home-bundle gate).
- 🟡 **pending live** — correct in code, needs deploy + browser/human QA in a real environment (server + Bedrock + devices) which is the owner's to run.
- ⛔ **blocked** — needs an owner decision (Lovable) or a backend endpoint that does not exist yet.

## The three acceptance questions

### 1. Can a child experience every engine without knowing backend engines exist?
**Substantially yes (code-verified), live QA pending.** Every learner-facing
surface speaks child language, never backend jargon:
- Coding hides `executionPolicy`/`testModelVersion`/`runner` (used only for
  branching); shows Run/Output/Results/"All checks passed!". ✅
- Mastery is shown as child bands (new/learning/practicing/getting strong/
  mastered) via `lib/mastery/masteryLabels.ts` — never the raw `MasteryState`
  enum or a confidence decimal. ✅
- Age is shown as product bands 7-9 / 10-12 / 13-15 via `lib/age/ageLabels.ts`
  — never the internal `AGE_8_9`/`AGE_10_11`/`AGE_12_14` enum. ✅
- Review/FSRS is framed as "keep it strong", not "FSRS scheduled item". ✅
- Companions (15 bespoke animated SVGs) carry idle/listening/thinking/speaking/
  encouraging/celebrating/error states. ✅

### 2. Can a parent understand real learning, evidence, mastery, projects, next?
**Yes for learning/evidence/mastery/projects/time/plan (code-verified); safety pending a backend endpoint.**
The parent dashboard uses only real endpoints (getChildren / getChildDashboard /
getChildActivity / entitlements.getMine): mastery breakdown incl. by-domain avg
confidence ("what can they do"), recent evidence activity, 7-day missions/
projects log, and a real "Your plan" panel ("what am I paying for"). No mock
analytics. ✅ · **Gap:** no parent-facing *safety* endpoint exists on the
parents controller — a safety panel was intentionally NOT invented. ⛔(backend)

### 3. Does every major backend capability have a deliberate frontend representation?
**Yes** — see the coverage ledger (`76_FRONTEND_ENGINE_COVERAGE.md`). Notable
gaps closed this phase: Practice/Review (`/practice`, the FSRS engine had zero
consumers), Evidence (`/evidence`), generic domain path (`/learning/domains/
:slug/path`), AI-Literacy path CTA, Creativity CREATE loop, coding test-model,
project→competency link, parent plan panel.

## What was built/fixed this phase (all shipped + pushed)

| Area | Result | Commit |
|---|---|---|
| Coding trust model + 11 adversarial tests + threat model doc | ✅ | e70e6b6 |
| Engine coverage ledger (76) | ✅ | 8960e68 |
| Coding test-model ported to canonical frontend | ✅ | 47df73d |
| Home IA + review-due + mastery-count bug fix | ✅ | 7f9008d, 051bbb1 |
| Shared domain-path pattern (`/learning/domains/:slug/path`) | ✅ | 1c182fc |
| Coding UX localized (jargon-free) | ✅ | 9ffe3d5 |
| AI-Literacy mission-path CTA | ✅ | a4a64f1 |
| **Architecture: frontend/ canonical + migration ledger (77)** | ✅ | 3d36cfa |
| Creativity CREATE→CREATION loop | ✅ | 670adef |
| Evidence child view (`/evidence`) | ✅ | 69efcf3 |
| Projects: Project→Competency link + localize detail | ✅ | 2ecf694 |
| Characters state machine + Voice companion/localize | ✅ | 996b8a1 |
| Parent "Your plan" (entitlements) panel | ✅ | ba04334 |
| Age model: product-facing 7-9/10-12/13-15 labels + doc | ✅ | 069982d |
| Route inventory + mock sweep (in 76) | ✅ | 89d53c0 |
| Perf: coding runtime off Home + gate + E2E scaffold | ✅ | ca8a79a |

## Coverage snapshot

- **Routes:** 44, all classified FINAL (public/onboarding/child/parent/admin) — no DELETE/MERGE/duplicate routes. See 76.
- **Mocks in `frontend/src`:** **0** (grep clean). Empty states are honest CharacterState components.
- **i18n:** every new/changed surface localized EN + AR (RTL); `ar` is type-checked against `en`'s shape.
- **Tests:** backend 120 / 21 suites; frontend 40 / 11 files; frontend tsc clean; home-bundle perf gate passing.
- **Perf evidence:** ✅ **Browser-verified** — Home fetches NO coding runtime (sandpack/codemirror/pyodide). A real Playwright network trace (`e2e/home.spec.ts`) caught that the static index.html check alone MISSED a leak (Vite hoisted its preload helper into the sandpack chunk, which the entry statically imported); fixed by not manual-chunking the coding runtime. Gated in deploy.sh + CI via the upgraded `check-home-bundle.mjs` (now asserts the entry chunk, not just index.html).
- **E2E (browser-verified this workspace):** ✅ 16 Playwright tests pass in chromium against the production build — `home.spec.ts` (2: Home render + no-coding-runtime + Arabic RTL) and `routes.spec.ts` (14: every canonical child route mounts with no uncaught errors, unknown-route fallback, Arabic RTL). API boundary mocked (no live USAM backend in dev workspace); real-data round-trips are the owner's live pass.

## Architecture resolution (dual frontend)

- `frontend/` declared **canonical** with evidence (deploy.sh + CI build it); documented in `docs/architecture/FRONTEND_CANONICAL.md` + AGENTS.md; enforced by CI job `frontend-canonical-guard` + `src/LEGACY_DO_NOT_EDIT.md` marker.
- Root `src/` (Lovable scaffold, `.lovable` template): **PRESERVE / QUARANTINE — NON-PRODUCTION** (owner decision — NOT to be deleted; Lovable-managed, kept unless the project later migrates away from Lovable). Frozen for product work, marked + CI-guarded. It has NO unique backend wiring; its only unique code-value (design-reference UX + Arabic plural strings) is preserved in `77`.

## Age model status — COMPATIBILITY MODE / MIGRATION PENDING

**NOT fully resolved.** Canonical product bands are 7–9 / 10–12 / 13–15; the
persisted `AgeBand` enum is `AGE_8_9`/`AGE_10_11`/`AGE_12_14` and does not cleanly
represent age 7 or 15. A **display compatibility layer** (`lib/age/ageLabels.ts`)
maps enum→product band; the persistence model is unmigrated. Non-destructive
migration plan documented in `docs/architecture/AGE_MODEL.md`. Launch is not
blocked on it, but it stays MIGRATION PENDING until the backend model is migrated.

## Deploy-gate rehearsal (LOCAL, real runs — not the prod deploy)

Every deploy gate that does NOT require the live prod DB/server was executed
locally and passed (real evidence, this workspace):

| Gate | Result |
| --- | --- |
| backend build (`nest build`) | ✅ exit 0 |
| backend tests (`jest --runInBand`) | ✅ 120 passed / 21 suites |
| frontend typecheck (`tsc --noEmit`) | ✅ clean |
| frontend build (`vite build`) | ✅ built in ~8s |
| frontend tests (`vitest run`) | ✅ 40 passed / 11 files |
| home-bundle perf guard | ✅ no coding runtime on Home (8 eager JS refs checked) |
| `check:enum-drift`, `check:migrations` | ⏳ server-only (need live `DATABASE_URL`) |
| critical smoke (real DB over HTTP) | ⏳ server-only (CI `smoke` job / prod) |

So the deploy is expected to pass its code gates; the two DB-drift gates + smoke
run on the server where the prod `DATABASE_URL` exists.

## Blockers / pending (honest)

- ✅ **Legacy `src/`: PRESERVE / QUARANTINE — NON-PRODUCTION** (owner decision; NOT deleted, NOT a blocker). Marked + CI-guarded.
- ⛔ **Live deploy + verification (task #17 remainder):** THIS WORKSPACE HAS NO NETWORK PATH TO THE PROD SERVER — DNS resolution to `kids.usamif.com`/github fails intermittently, there is no SSH host config for `~/USAM-Learning-Worlds`, and `scripts/deploy.sh` requires the server's pm2/nginx/`DATABASE_URL`. The deploy + live browser verification MUST be run by the owner on the server. I did not fabricate deploy/live output.
- 🟡 **Multi-device / age / language human browser QA (tasks #14/#16 remainder):** Playwright harness is scaffolded (opt-in); full human visual pass across 7-9/10-12/13-15 × phone/tablet/desktop × EN/AR needs a real environment.
- 🟡 **Voice runtime:** ASR/TTS/Bedrock sidecar is provider-gated; text-fallback path is code-verified, live voice round-trip needs creds.
- ⛔ **Backend gaps (noted, not faked):** no `GET /mastery/evidence` per-evidence timeline; no parent-facing safety endpoint. Current surfaces are honest without them.

## Recommended next steps for the owner

1. Confirm whether the Lovable scaffold (root `src/`) can be removed; if yes, I execute the salvage-then-delete plan in `77` as a separate commit.
2. Run `DEPLOY_BACKEND=1 RUN_TESTS=1 bash scripts/deploy.sh` on the server; the new home-bundle gate + existing enum/migration/test gates must pass.
3. Run the opt-in Playwright suite (`e2e/README.md`) + a human QA pass on the three age bands and Arabic RTL on phone/tablet/desktop.
4. If a per-evidence timeline and a parent safety panel are wanted, add the two backend read endpoints; the frontend surfaces are ready to consume them.
