# USAM Kids — Engine Gap Matrix (against USAM_KIDS_ENGINE_INVENTORY_SOURCE.md)

**Status: LIVING DOCUMENT — first pass, 2026-09-02 (Tick 2).** Covers the
15 "must-not-forget" engines first, per the inventory's explicit priority
order. Remaining ~156 engines from the full 171-engine list are NOT yet
classified — that is next tick's continuation, not an oversight.

Method: read the actual backend code
(`~/projects/USAM-Learning-Worlds/backend/src`) and Prisma schema — never
classified from filenames/docs alone. Cross-referenced against
`USAM_GAP_REGISTER.md`, `USAM_IMPLEMENTATION_ROADMAP.md`,
`FINAL_BACKEND_ROADMAP.md`, `ROADMAP_VISUAL.md` (see Reconciliation section).

Classification legend: Already implemented | Partially implemented |
Missing | Conflict | Needs refactor | Open-source candidate | Build custom
| Future.

## Part 1 — The 15 Must-Not-Forget Engines

| # | Engine | Real code found | Classification | Notes |
|---|--------|------------------|-----------------|-------|
| 1 | Learner Model Engine | `Learner`, `LearnerContext` Prisma models; `ai/learner-context.service.ts` builds context from progression/mastery/streaks for AI prompts | Partially implemented | Exists as an AI-context builder, not a general learner-state API other engines can query independently. Needs refactor into a first-class Learner Model service with a stable contract (age band, mastery snapshot, preferences, ZPD) other engines consume, not just AI. |
| 2 | Knowledge Graph Engine | `Concept`, `ConceptPrerequisite`, `CompetencyPrerequisite` tables; `learning/services/concept.service.ts` — prerequisite chain traversal, DFS cycle detection on add, unlock-status computation against real MasteryRecord state, `LearningController` REST endpoints, **plus (partial-wave-1-cluster-A) a mirrored CompetencyPrerequisite traversal layer**: `getCompetencyPrerequisiteChain`/`getCompetencyUnlockStatus`/`getCompetencyShortestUnlockPath`/`addCompetencyPrerequisite`/`removeCompetencyPrerequisite` in `concept.service.ts`, exposed via `GET/POST/DELETE /api/learning/competencies/:id/prerequisites`, `/unlock-status`, `/shortest-unlock-path` | Already implemented | **CORRECTION (Tick 3): confirmed real, not Missing.** The one specific gap flagged by Tick 3 — "no `CompetencyPrerequisite` traversal endpoint (only `Concept`-level), no shortest-unlock-path query" — is now closed: the DFS chain-walk, cycle-prevention, and mastery-gated unlock logic used for Concepts is mirrored one level up the hierarchy for Competencies, plus a genuinely new shortest-unlock-path query (dedupe by competency keeping deepest occurrence, filter out already-mastered). Live-verified against a real seeded `competency_prerequisites` row (`Synonyms & Antonyms` requiring `Common Words`): `GET .../competencies/:id/prerequisites` → real chain array; `/unlock-status` → `{"unlocked":false,"prerequisites":[{"competencyName":"Common Words","state":"NOT_STARTED","complete":false}]}`; `/shortest-unlock-path` → `{"stepsRemaining":1,"path":[{"competencyId":"...","state":"NOT_STARTED"}]}`. Cross-competency graph view (visualizing the whole DAG at once) is still not built — that remains a legitimate future enhancement, but it's a UI/aggregation nicety, not a missing traversal capability. |
| 3 | Curriculum Engine | `Domain -> Skill -> Competency -> LearningObjective -> Activity` chain fully modeled in Prisma; `missions.service.ts` sequences activities; **plus (partial-wave-1-cluster-A)** `Project.competencyId`/`Project.objectiveId` FKs into the same Competency/LearningObjective models, `ProjectsService.getProjectCurriculumContext()`, `GET /api/projects/:id/curriculum-context` | Partially implemented | The specific gap named in Tick 2/4 — "Project and Assessment stages are only loosely connected to it" — is now half-closed for **Project**: a Project can be explicitly linked to a Competency and/or LearningObjective (previously only a free-text `skills[]` tag array existed, zero FK into the hierarchy), and a new endpoint resolves the full Domain→Skill→Competency→Objective chain for any project. Live-verified: created a real project with `competencyId` set to `Synonyms & Antonyms`, then `GET /api/projects/:id/curriculum-context` → `{"linked":true,"domain":{"name":"Language"},"skill":{"name":"Vocabulary"},"competency":{"name":"Synonyms & Antonyms"},"objective":null}`. **Still honestly partial**: the FK is optional (existing projects created before this fix are unlinked, and nothing forces a project to declare its curriculum home), and the **Assessment stage half of this gap is now covered separately by row 8's AssessmentPurpose work** — Activity (the assessed unit) is typed, but there is still no explicit `Project -> Rubric -> Assessment` closure loop (e.g. a showcased project doesn't automatically trigger a rubric-graded assessment event back into MasteryRecord). |
| 4 | Mastery Engine | `mastery.service.ts` + `mastery-confidence.algorithm.ts` + `MasteryRecord`/`Evidence` tables. Evidence-weighted confidence recalculation, review-due (`getReviewDue`), learning goals | Already implemented (v1) | Real, working mastery tracking. NOT swappable/pluggable BKT/DKT/IRT models as the inventory envisions — one hardcoded confidence algorithm. Classify the "swappable model" ambition as Future; today's single-algorithm version is solid v1. |
| 5 | Adaptive Learning Engine | `adaptive/` module: `zpd-calculator.service.ts` (ZPD), `recommendation.service.ts` | Partially implemented | ZPD calculation is real and used. Adaptive *sequencing* (what to serve next, difficulty ramp) exists in recommendation.service.ts but is basic (see row 6) — no full adaptive-loop (assess→adjust→re-assess) orchestration layer yet. |
| 6 | Recommendation Engine | `adaptive/recommendation.service.ts`, 290 lines | Partially implemented | Rule/heuristic-based recommendation (mastery gaps, streaks, ZPD) — no ML/collaborative-filtering layer, which is appropriate for current scale. Fine as-is for now; flag as Needs refactor only if personalization quality becomes a real complaint. |
| 7 | Content Intelligence Engine | `learning/content-adaptation.service.ts`, `ContentItem`/`AgeVariant` Prisma models (raw content -> age-variant adaptation); **plus (partial-wave-1-cluster-A)** `ContentAdaptationService.getAdaptedContentItem()` + `CONTENT_ITEM` case in `LearningController.getAdaptedContent()`, `seed-content-intelligence-age-variants.ts` | Partially implemented | The specific gap named this row — ContentItem was modeled but the adaptation service only ever read AgeVariant rows for `ACTIVITY`/`OBJECTIVE`/`MISSION`, never `CONTENT_ITEM` — is closed: verified via `psql` first (both `content_items` and `age_variants` were **0 rows** in prod before this fix), then seeded a real ContentItem + 2 real AgeVariant rows and wired the read path. Live-verified: `GET /api/learning/adapted/CONTENT_ITEM/seed-content-item-place-value-explainer` (learner ageBand=AGE_8_9) → `{"adapted":true,"ageVariant":{"framing":"Numbers have secret hiding spots called place values!","scaffoldLevel":"MODELLED",...}}`; `GET /api/learning/variant-coverage/CONTENT_ITEM` → `{"totalEntities":1,"variants":[{"ageBand":"AGE_8_9","coverage":100},{"ageBand":"AGE_12_14","coverage":100}]}`. Still honestly partial: only 1 seeded ContentItem exists (the ingestion pipeline that would produce ContentItem rows at scale from PDF/video/OCR remains fully Missing, as does the human-approval workflow layer) — this fix proves the adaptation *read path* works end-to-end, it does not create a content pipeline. |
| 8 | Assessment Engine | `ActivityAttempt`, `activity-evaluator.ts`, `Rubric`/`RubricCriterion` tables; **plus (partial-wave-1-cluster-A)** `Activity.assessmentPurpose` enum (`DIAGNOSTIC`/`FORMATIVE`/`SUMMATIVE`), branching logic in `missions.service.ts submitActivity()`, `GET /api/missions/activities/by-purpose/:purpose` | Partially implemented | The specific gap named this row — "No distinct diagnostic vs formative vs summative typing" — is closed with real behavioral branching, not just a label: DIAGNOSTIC attempts are recorded but do **not** feed `MasteryService.recordEvidence()` (a placement check shouldn't move mastery state); SUMMATIVE attempts are locked to one submission per run (`BadRequestException` on resubmit) and score-weighted +15% as a final check; FORMATIVE behaves as before (unweighted, resubmittable). Live-verified end-to-end: set a real seeded activity (`coding-sandbox-demo-activity`) to `SUMMATIVE`, started a mission run, submitted once → `201` with `assessmentPurpose:"SUMMATIVE"`, submitted again on the same run/activity → `400 Bad Request` ("already been submitted and cannot be retaken in this run"). Still honestly partial: no adaptive-difficulty test engine and no auto Bloom-level review (the "Assessment Quality Engine" from the inventory) — those remain Missing, as originally noted. |
| 9 | AI Tutor / Companion Engine | `ai/character.service.ts`, `ai/services/coding-coach.service.ts`, `ai/services/english-coach.service.ts`, `bedrock.service.ts`/`bedrock.adapter.ts` (AWS Bedrock LLM backend) | Partially implemented | Real Socratic-style coaching exists per-domain (coding, English) via Bedrock. NOT a Multi-Agent orchestrator (Tutor/Planner/Assessment/Curriculum/etc. agents + router) as inventory envisions — today it's several independent single-purpose services, not a coordinated agent graph. That orchestration layer is Missing/Future — correctly sequenced after the 15-engine base per the inventory's own instruction not to over-architect early. |
| 10 | Character Engine | `Character`, `CharacterState`, `CharacterInteraction` Prisma models; `ai/character.service.ts` (350 lines) — personality/memory/relationship state per character | Already implemented (v1) | Solid, real per-character state tracking. Single character (Azouz) live; multi-character extensibility not yet exercised (schema supports it, only 1 row of actual character content confirmed — verify before claiming "multi-character-ready"). |
| 11 | Voice & Conversation Engine | `ai/conversation.service.ts` (`Conversation`/`ConversationMessage` models) — text-based conversation only. NO ASR/TTS/VAD code found anywhere in backend or frontend | Missing (voice pipeline) / Partially implemented (text conversation) | Conversation *engine* (turn-taking, message history, roleplay modes) exists for text. The full mic->VAD->ASR->intent->AI->TTS->animation pipeline the inventory describes does not exist at all. This is a real, large, correctly-scoped-for-later gap — do not fake voice support. |
| 12 | English Learning Engine | `learning/english.controller.ts`, `EnglishStrand` model, `ai/services/english-coach.service.ts`, `learning/translation.service.ts` (has tracked TODO per prior tick) | Partially implemented | Coaching + strand tracking exist. Sub-engines from inventory (Pronunciation/IPA, Listening/Shadowing/Dictation, Story Engine, Corpus/Dialogue datasets) are Missing — English today is one coaching service + content strands, not the described sub-platform. Translation specifically blocked on a funded API decision (already logged prior tick). |
| 13 | Project/Sandbox Engine | `projects/` module (`Project`, `ProjectMilestone` models, `projects.service.ts`) — project tracking/milestones only. NO code-execution sandbox (Piston/Judge0/Pyodide/WebContainers) found | Partially implemented (tracking) / Missing (execution sandbox) | Project *management* (idea->plan->build->present lifecycle metadata) is real. Actual in-browser/sandboxed code execution for kids' coding projects does not exist — `coding-coach.service.ts` reviews/explains code via LLM but never executes it. This is a real safety-relevant gap (inventory explicitly warns: never run child code directly on backend) — correctly not attempted yet, flag as Open-source candidate (Pyodide or WebContainers, Tier B) for a future tick, license-check before adopting. |
| 14 | Safety & Parent Engine | `parents/parents.service.ts` (dashboard, progress, activity, time limits, family summary), `ai/moderation.service.ts` (content moderation + quarantine + review workflow), `ModerationLog`/`QuarantinedContent` models | Already implemented (v1) | This is the most mature engine outside Mastery/Character — real moderation with quarantine+review workflow, real parent dashboard with time limits. Age-band-specific safety policy tuning and a versioned "AI Prompt/Policy Engine" (inventory's term) are Missing — moderation exists but isn't yet policy-versioned/audited as a distinct engine. |
| 15 | Learning Analytics & Evaluation Engine | `learning/learning-event.service.ts` (event logging, stats, patterns, session-level and recent-event queries) | Partially implemented | Real event capture and basic stats/pattern queries exist. No separation yet between product analytics and learning analytics (inventory explicitly calls for keeping these separate — "retention != learning"); today it's one event stream serving both concerns. Needs refactor once a second (product/retention) analytics need shows up — not urgent now. |

## Part 2 — Reconciliation with existing planning docs (done Tick 4)

`USAM_GAP_REGISTER.md` is dated 2026-08-12 ("Educational Core Foundation
- Analysis") — **stale relative to the current codebase.** Cross-checked
every CRITICAL/HIGH row against the real code this tick (not from the
register's own claims):

| Register ID | Register said (2026-08-12) | Actual now (Tick 4 verified) |
|---|---|---|
| GAP-001 Learning Graph w/ prerequisites | MISSING | **Stale — implemented.** `concept.service.ts` + `Concept`/`ConceptPrerequisite` tables, DFS cycle detection, unlock-status. Live route confirmed 401 (exists). |
| GAP-003 Concept/Subskill model | MISSING | **Stale — implemented.** Same as above. |
| GAP-004 Learning Path model | MISSING | **Stale — implemented.** `LearningController` `paths/*` endpoints, live-route-confirmed. |
| GAP-002 Age adaptation | SCHEMA_ONLY | **Stale — partially implemented.** `content-adaptation.service.ts` + `AgeVariant` model does real age-variant adaptation (matches Gap Matrix row 7), not just an enum. |
| GAP-005 Activity-Mission linkage BROKEN (`take: 10` global fetch) | BROKEN | **Stale — fixed.** `missions.service.ts:getMission()` now uses a real `missionActivities` join table (`MissionActivity` with `order`/`isRequired`), not a global `take: 10`. Per-mission activity ordering is real. |
| GAP-006 English learning architecture | MISSING entirely | **Stale — partially implemented.** `english.controller.ts`, `EnglishStrand` model, `english-coach.service.ts` exist (matches Gap Matrix row 12); still missing pronunciation/listening/story sub-engines as the Gap Matrix already notes. |
| GAP-009 Character behavior engine | SCHEMA_ONLY | **Stale — implemented (v1).** Matches Gap Matrix row 10. |
| GAP-030 Rate limiting | IMPORTED but not configured | **Fixed (Tick 1), verified live again this tick.** |
| CONF-001 Two frontends | "Backend must serve both; src/ is design authority" | **Superseded by Tick 1 decision: `src/` is the ONLY deployed/served frontend (confirmed via nginx root + built asset inspection). `frontend/` is not live and not actively served — register's "serve both" framing is outdated; documented decision stands.** — **CORRECTION (parallel-agent-frontend-1, 2026-09-02): This is WRONG. Re-verified live on Kids-server (16.16.128.228): `~/deploy.sh` runs `cd frontend && npm run build` and copies `frontend/dist/*` to `/var/www/html` (nginx root). `md5sum` of the live served `/assets/index-X4ccDthE.js` is byte-identical to `~/USAM-Learning-Worlds/frontend/dist/assets/index-X4ccDthE.js`. `frontend/src/main.tsx` is a plain `ReactDOM.createRoot` SPA using `frontend/src/lib/api/{client,endpoints}.ts` (axios-based), not TanStack Router. `src/` (the TanStack Start app this tick's rewiring targeted) is NOT what's live — it builds via Nitro/cloudflare-module (SSR-oriented, no static `dist/` folder), and was never confirmed running anywhere in this pass. Both frontends currently exist in parallel; the `src/services/*.ts` real-backend wiring done this tick (curriculum/mission/english/coding → `/api/learning`, `/api/missions`, `/api/english-coach`, `/api/coding-coach`) is committed and pushed to `main`, but has NOT been deployed to kids.usamif.com because doing so would mean swapping the live frontend from `frontend/` to `src/` — a topology change beyond this tick's scope (touch only `src/services/*.ts`) and not attempted without explicit sign-off. Whoever owns deploy should decide: (a) port the same real-endpoint wiring into `frontend/src/lib/api/endpoints.ts` (the actually-live client) instead/also, or (b) explicitly cut the live deploy over to `src/`.**
| GAP-036/037 CI/CD, Dockerfile | MISSING | **Fixed (Tick 2).** |

**Conclusion**: `USAM_GAP_REGISTER.md` reflects an early-August snapshot
of the codebase and should be treated as historical, not current. Most
of its CRITICAL items are now resolved or partially resolved; the ones
still genuinely open (voice pipeline GAP-023, code sandbox GAP-022,
diagnostic assessment GAP-012, misconception tracking GAP-017, English
sub-engines, AI provider abstraction GAP-010 still Bedrock-locked) agree
with this Gap Matrix's independent findings, which is a good cross-check
signal both docs are looking at the same real gaps for those items.
Recommend the repo owner archive/retitle `USAM_GAP_REGISTER.md` as
"Historical — 2026-08-12 snapshot, superseded by
USAM_KIDS_ENGINE_GAP_MATRIX.md" rather than deleting it (preserves
history per this job's own git-history-care principle) — logged as a
suggestion, not done unilaterally since it's a docs-organization call,
not a security/correctness fix.

`ROADMAP_VISUAL.md` and `USAM_IMPLEMENTATION_ROADMAP.md` describe a
12-phase, 24-week plan with phase-gated milestones (MVP=phases 1-6, Beta
=1-10, Production=1-12). Spot-checked against real code: Phase 1
(Database/Auth), Phase 3 (Mastery), Phase 4 (Missions), Phase 5 (AI
Gateway + Moderation), Phase 8 (Gamification), Phase 9 (Community +
Moderation), Phase 10 (Parent) all have real, working code confirmed
elsewhere in this matrix — i.e. the codebase is materially further along
than a naive reading of "no ✅ marks past Phase 1" in the visual doc
would suggest. The visual roadmap was not kept updated as phases
shipped; it undercounts real progress. Not correcting it in-place this
tick (out of scope vs security/gap-matrix work) but flagging so no
future tick mistakes it for current status. `FINAL_BACKEND_ROADMAP.md`
(7236 lines) not read line-by-line this tick — too large for one pass;
next tick should sample it in sections rather than defer again wholesale.

## Part 3 — Open-Source License Registry

Pyodide and Sandpack (@codesandbox/sandpack-react) were adopted on
2026-09-02 as the Coding Sandbox v1 execution surfaces (see
`docs/architecture/USAM_OSS_INTEGRATION_PLAN.md` Section 1 for the full
license verification and rationale). Both run 100% client-side in the
learner's browser; `backend/src/modules/coding-sandbox/` never executes
child code — it only serves mission specs and grades already-executed
client results. Commit
[`462c6f5cb49f06461e2b27fc02bf909fb59741f2`](https://github.com/mohamedsaber3108/USAM-Learning-Worlds/commit/462c6f5cb49f06461e2b27fc02bf909fb59741f2)
is the evidence: backend module + frontend runners
(`frontend/src/features/coding/components/{PyodideRunner,SandpackMission,CodeMissionRunner}.tsx`,
wired into the live `frontend/` app's `MissionPlayerPage.tsx`), deployed
and live-verified on kids.usamif.com the same day.

| Library/Dataset | Source | License | Commercial use OK? | Redistribution OK? | Status |
|---|---|---|---|---|---|
| Pyodide | github.com/pyodide/pyodide | MPL-2.0 | Yes | Yes (unmodified, notice-preserving) | **adopted** — `462c6f5` |
| Sandpack (@codesandbox/sandpack-react) | github.com/codesandbox/sandpack | Apache-2.0 | Yes | Yes | **adopted** — `462c6f5` |
| LanguageTool | github.com/languagetool-org/languagetool | LGPL-2.1 | Yes (self-hosted, arm's-length HTTP service — no static linking into USAM's Node backend) | Yes (self-hosted image; standard LGPL notice terms if the image itself is redistributed) | **adopted** — `97f2e07` |
| Microsoft Presidio | github.com/microsoft/presidio | MIT | Yes | Yes | **adopted** — `97f2e07` |

LanguageTool and Presidio were adopted on 2026-09-02 as internal-only
sidecar services on the Kids-server (16.16.128.228), both bound to
`127.0.0.1` only (never exposed publicly) — see
`docs/architecture/USAM_OSS_INTEGRATION_PLAN.md` Sections 2 and 4 for the
full license verification and integration rationale. Backend wiring:
`backend/src/modules/english-learning/services/grammar-check.service.ts`
(new module, calls LanguageTool's `/v2/check`, returns a normalized
`GrammarIssue[]`) is layered into
`backend/src/modules/ai/services/english-coach.service.ts`'s
`correctGrammar()` alongside (not replacing) the existing Bedrock LLM
call. `backend/src/modules/ai/services/pii-detection.service.ts` (new,
calls Presidio's `/analyze`) is layered into
`backend/src/modules/ai/moderation.service.ts`'s `moderateContent()` as a
deterministic pre-check whose verdict is OR'd with the existing Bedrock
LLM moderation verdict — confirmed live on kids.usamif.com: a clean test
string returned `categories:["ERROR"]` (Bedrock currently down on a
pre-existing, unrelated invalid-AWS-credential issue) while a string
containing a fake phone number returned
`categories:["ERROR","PII_DETECTED"]`, `shouldBlock:true` — i.e. the
Presidio backstop independently caught the PII even with the LLM check
failing. Commit
[`97f2e07`](https://github.com/mohamedsaber3108/USAM-Learning-Worlds/commit/97f2e07)
is the evidence. Reproducibility: `docker-compose.sidecars.yml` documents
the exact `docker run` invocations for both containers.

## Part 4 — Batch 2: Projects/Coding, Community/Safety, Gamification/World

Read directly from `backend/src/modules/*` on 2026-09-02 (Tick 6), not
guessed from names.

| Engine (inventory) | Classification | Evidence |
|---|---|---|
| Project-Based Learning Engine | Partially implemented | `modules/projects/projects.service.ts` — real CRUD (create/get/update), `visibility` (PRIVATE/etc.) enforcement, Prisma `Project` model. No Idea->Plan->Build->Test->Improve->Present->Reflect stage machine yet — just a flat project record. |
| Coding Learning Engine | Already implemented (v1) — reclassified Tick 48 | Stale row: the `learning/coding.controller.ts` empty-stub finding from Tick 6 is real but obsolete — a full separate `modules/coding-sandbox/` module (controller+service, real routes, JwtAuthGuard) has existed for several ticks and IS registered in `app.module.ts`. Tick 48 found it had correct code but only 2 real CODE-type Activities in the live DB (both demo rows) — added `seed-coding-sandbox-concept-missions.ts`: 15 new real, age-appropriate Python coding missions (variables → recursion/classes/modules-imports), one per relevant `CodingConcept` row, wired through the existing Domain→Skill→Competency→LearningObjective→Activity(CODE)→Mission→MissionActivity chain. Live-verified end-to-end on the actually-live DB (`usam_learning_worlds`, reached via `backend/.env.production` — see note below) with a real ACTIVE learner JWT: `GET /api/coding-sandbox/missions/coding-loops-countdown` → 200 real starter code + assertions; `GET .../coding-classes-objects-pet` → 200; no-auth → 401. `activities WHERE type='CODE'` = 17 rows (2 pre-existing + 15 new) on live DB. |
| Coding Sandbox / Code Execution Security Engine | Already implemented (v1) — reclassified Tick 48 | `modules/coding-sandbox/coding-sandbox.service.ts` correctly implements the inventory's mandated trust boundary: code executes ONLY client-side (Pyodide/Sandpack per frontend `PyodideRunner.tsx`/`CodeMissionRunner.tsx`), backend only serves mission specs and validates already-executed stdout/result against deterministic assertions — genuinely never executes learner code itself. The Tick 6 "Missing, no execution surface" finding was correct at the time but stale; this module was built in a later tick and never reclassified until now. See Coding Learning Engine row above for the content-seeding work done this tick and live verification. |
| Community Engine | Partially implemented | `modules/community/community.controller.ts` has real routes: feed, trending, search, stats, report, moderation/quarantined, moderation/review/:id — i.e. moderation-first design matching the inventory's "child-safe: moderated, no unsafe DMs by default" requirement. No DM/messaging routes exist at all (consistent with "no unsafe DMs by default" — could be intentional non-implementation, not a gap). |
| Safety & Parent Engine | Partially implemented | `modules/parents/*.controller.ts` — children list, family-summary, per-child dashboard/progress/activity, time-limits (POST). Real parental-control surface exists. AI-side safety (input/output moderation) lives in `modules/ai/moderation.service.ts` (from Part 1/2 findings) — not re-verified this tick, flagged as already partially covered. |
| Gamification Engine | Already implemented (v1) | `modules/gamification/gamification.controller.ts` — progression, award-xp, leaderboard, rank, achievements, streak + streak/update. Real routes, matches Character Progression Engine from inventory too. Not verified against inventory's explicit "avoid addiction loops/FOMO/gambling mechanics" — worth a design review, not a code gap, so flagged not classified as Conflict without more evidence. |
| Economy Engine | Missing | No economy/currency/shop module found. Inventory explicitly says "avoid pay-to-win education" — absence here is neutral-to-good, not a scored gap unless a design calls for it later. |
| Mastery Engine | Already implemented | `modules/mastery/` has `mastery-confidence.algorithm.ts` + `mastery.service.ts` + `mastery.processor.ts` (background job) + controller. Substantive, not a stub — matches inventory's BKT/DKT/IRT ask at least structurally (algorithm not read line-by-line this tick to confirm which model(s) it implements — next-tick action item). |
| Adaptive Learning Engine / ZPD Engine / Recommendation Engine | Already implemented | `modules/adaptive/` has `zpd-calculator.service.ts` (dedicated ZPD engine — direct inventory match) + `recommendation.service.ts` + `adaptive.controller.ts`. Real, separate files per concern, good sign of intentional architecture rather than a monolith. |
| World Engine / Mission Engine / Adventure Engine | Partially implemented | `modules/missions/` real service+controller (per earlier tick's GAP-005 fix — real join-table-based activity ordering, not global `take: 10`). No dedicated "World Engine" (Future City metaphor / zones like English Academy/Coding Lab) found as its own module — missions may implicitly serve this role; needs product-side confirmation, not a pure code question. |

**Still unclassified after Batch 2** (~148 engines remaining): Content
Ingestion (OCR/transcription pipeline), Content Intelligence, Question
Engine, Assessment Quality Engine, all English sub-engines beyond the
already-tracked `english-coach.service.ts`/`EnglishStrand` (Vocabulary,
Grammar, Pronunciation, Listening, Story, Reading, Writing, Speaking,
Shadowing, Dictation, Corpus/Dialogue-dataset layer), Voice Interaction
Engine (mic->VAD->ASR->TTS pipeline — inventory's #11 must-not-forget,
still not found anywhere in backend/src, this is a real gap on a
must-not-forget engine and should be prioritized next), Creativity/Media/
Lip-Sync/3D engines, Cross-Curricular engines (Entrepreneurship, Financial
Literacy, Critical Thinking, Collaboration, Portfolio, Career, Research,
AI/Digital Literacy), Learning Analytics/Science/Metacognition/Cognitive
Load engines beyond the existing `learning-event.service.ts` (which is
event logging, not yet analytics/insight generation).

**Priority flag for next tick**: Voice & Conversation Engine is one of
the inventory's 15 must-not-forget engines and currently has zero
backend presence (no ASR/TTS/VAD code found). This is the highest-value
still-missing must-not-forget engine and should be the next build target
once Batch 3 classification (Content Pipeline, remaining English
sub-engines) is done, per the inventory's stated priority order.

## Part 5 — Tick 7 findings (mastery algorithm confirmed, coding-coach/english-coach reachability)

**Action item resolved: `mastery-confidence.algorithm.ts` read line-by-line.**
It implements neither BKT, DKT, nor IRT as distinct statistical models. It's
a custom heuristic: weighted recency-decayed success rate (60%) + evidence-type
diversity bonus (20%) + spacing-effect score (20%), then multiplied by an
Ebbinghaus-style exponential recency/forgetting factor, clamped 0-1, with a
7-state bucket mapping (`NOT_STARTED`->`MASTERED`) and an FSRS-inspired
next-review-date scheduler. It's explicitly documented in its own header as
"inspired by FSRS," not a BKT/DKT/IRT implementation. Reclassifying row 4
(Mastery Engine)'s note: this is a real, coherent, working single-algorithm
v1 — good engineering, just not the swappable-model architecture the
inventory envisions. No change to "Already implemented (v1)" classification;
confidence in that classification is now much higher (previously structural
guess, now confirmed by full read).

**Action item resolved: `coding-coach.service.ts` read in detail (431 lines).**
This is real, substantive LLM-backed coaching logic — `provideDebugAssistance`,
`reviewCode`, `explainCode`, `generateChallenge` — each builds age-aware
prompts via `LearnerContextService`, calls `AIProviderService` (Bedrock), and
post-processes the response (extract fix/explanation/learning-points/
strengths/improvements/next-concept, code-quality heuristic scoring,
challenge-time estimation). This is NOT a stub — it's comparable in maturity
to `english-coach.service.ts`.

**New finding, more precise than Tick 6's "check next tick" note: neither
`CodingCoachService` nor `EnglishCoachService` has ANY controller route.**
Both are registered as providers/exports in `ai.module.ts`, but `ai.module.ts`
only registers `AIController` and `CharacterController` in its `controllers:`
array. Grepped both controllers for any reference to `CodingCoach`/
`EnglishCoach` — zero matches. So:
- The disabled `learning/coding.controller.ts` (empty class, "TEMPORARILY
  DISABLED") was apparently meant to expose coding-coach functionality but
  never got fixed/reconnected.
- `english.controller.ts` (also a 3-line empty class, `EnglishController {}`)
  has the exact same problem — confirmed empty on inspection this tick, not
  previously stated so plainly. Neither controller has ANY route.
- Net effect: two real, working, LLM-backed coaching services
  (Coding Learning Engine's coaching half, and English Learning Engine's
  coaching half) are **fully unreachable from the API** — same class of bug
  as the Tick 3 Knowledge Graph double-prefix issue, but here the cause is
  "controller never implemented" rather than "wrong route prefix."

**Reclassification**: Coding Learning Engine and English Learning Engine
(coaching sub-engine specifically) move from "Missing (stubbed, honestly)" /
"Partially implemented" to **Conflict** — real backend logic exists and is
wired into the DI graph, but zero HTTP surface reaches it. This is higher
priority to fix than net-new build work: it's a small, well-scoped
integration bug (write two thin controllers wiring existing service methods
to routes with auth guards + DTOs), not a research or architecture problem,
and it unlocks working AI coaching features that already exist server-side.
Flagged as next concrete build task (see Next Tick Priorities).

**Translation Service**: re-checked `learning/services/translation.service.ts`
(351 lines) directly — grepped for TODO/FIXME, found **zero** in the current
file. The original security audit's TODO claim for this file may refer to
a since-resolved TODO, or the audit conflated it with another file. Current
state: real `upsertTranslation`/`getTranslatedEntity`-style CRUD against a
`Translation` Prisma model, no unimplemented-stub methods found in this file
as of this tick. Not reclassifying without more certainty — flagging as
"claim not reproducible in current code" rather than asserting the original
audit was wrong, since the file may have been fixed in an earlier tick this
job doesn't have full log detail on. `english-coach.service.ts` similarly
has zero TODO/FIXME markers found this tick via direct grep.

**Content Pipeline / Question Engine / English sub-engines search (Batch 3,
partial)**: grepped `backend/src` for ingest/ocr/question/vocab/grammar/
pronun/listening/story/shadow/dictation/corpus — **zero files found for any
of these**. Confirms Tick 6's Batch 3 prediction: Content Ingestion Engine,
Question Engine, Assessment Quality Engine, and essentially all English
sub-engines beyond the single coaching service are genuinely Missing, not
just unclassified. These stay Missing/Future per inventory's own priority
order (they're outside the 15 must-not-forget engines) — no build action
this tick, correctly deferred behind Voice & Conversation Engine.

## Part 5b — Tick 7 continued: MAJOR finding — two full migrations never applied to live DB

While live-testing this tick's controller fixes, `learning/my-paths` and
`english-coach/grammar` both 500'd even after the `req.user.learnerId` fix
above. Root cause traced via pm2 error log: `PrismaClientKnownRequestError:
The table 'public.learning_path_progress' does not exist in the current
database.`

Investigation: `backend/prisma/migrations/` contains two raw `.sql` files
(`add_phase3_ai_tables.sql`, `20260813_add_phase4_learning_foundation.sql`)
that are NOT tracked by Prisma's migration system (`npx prisma migrate
status` reported "No migration found in prisma/migrations" and "Database
schema is up to date!" — misleadingly, because these files were never run
through `prisma migrate deploy`, so Prisma's `_prisma_migrations` tracking
table has zero rows). Queried `information_schema.tables` directly: **only
23 of the 47 tables the Prisma schema defines actually existed in the live
database** before this tick's fix. Missing tables included `concepts`,
`concept_prerequisites`, `competency_prerequisites`, `learning_paths`,
`learning_path_nodes`, `learning_path_progress`, `mission_activities`,
`age_variants`, `content_items`, `translations`, `learning_events`,
`project_milestones`, `rubrics`, `rubric_criteria`, `english_strands`,
`coding_concepts`, `ai_literacy_concepts`, `entrepreneurship_concepts`,
`financial_literacy_concepts`, `conversations`, `conversation_messages`,
`character_interactions`, `character_states`, `learner_contexts`.

**This retroactively invalidates confidence in several "Already
implemented"/"Partially implemented" classifications in Parts 1 and 4** —
those were based on reading service/controller code and confirming routes
exist, but never confirmed the underlying tables existed in the LIVE
database (the Tick 3 note "Live route confirmed 401" only proved the auth
guard fired, not that a successful authenticated call would actually work).
Concretely this means Knowledge Graph, Learning Paths, Content Intelligence,
Translation, Learning Analytics, Coding/English coaching, Character
conversation/interaction state, and Learner Model context-building were ALL
silently broken end-to-end in production despite code-level completeness.

**Fix applied this tick**: backed up the live DB (`pg_dump -F c`, verified
non-zero size, stored at `~ /db_backup_pre_migration_<timestamp>.dump` on
Kids-server), then applied both `.sql` files directly via `psql` against
the live database (`ON_ERROR_STOP=1`, both completed with zero errors).
Table count went 23 -> 47, matching every model in the Prisma schema.
Restarted pm2. Re-verified live: `GET /api/learning/my-paths` now 200
(empty array — correct, no seed data, not an error), `GET
/api/learning/concepts` now 200 (empty array, same reason), CORS/rate-limit/
login all re-confirmed unregressed.

**Not yet fixed / still open**: `english-coach` and `coding-coach` routes
now fail with a DIFFERENT, unrelated error post-migration:
`UnrecognizedClientException: The security token included in the request
is invalid` from AWS Bedrock. Checked `backend/.env.production` -
`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` are entirely absent from that
file (only `AWS_REGION` is set). Checked `~/.aws/credentials` on
Kids-server - a key pair IS present there (`AKIAYK...TGPY`), but `aws sts
get-caller-identity` using those same credentials independently fails with
the identical `InvalidClientTokenId` error — i.e. this is a genuinely
revoked/expired/deactivated AWS IAM access key, not an app-config bug. This
is a real external blocker outside this job's authority to fix (no ability
to mint new AWS keys) - flagged via Telegram this tick. Every AI-coaching
and character-chat feature that calls `BedrockAdapter.invoke()` is affected
system-wide, not just the two new controllers.

**Seed data**: no seed data exists for any of the newly-populated-schema
tables (`concepts`, `learning_paths`, `content_items`, etc. all report
empty on GET). This is expected for freshly-created tables, not a new bug -
flagged as a real backlog item (seed script or content-authoring flow) but
out of scope for this tick's fix-verify-deploy loop.



Remaining ~148 engines (see list above) deferred to subsequent ticks.
File committed and updated each tick that touches it, not written once
and abandoned.

## Part 7a - Learner & Adaptation, Content Pipeline, Projects/Coding remaining

Classified against real backend code (`backend/src/modules/`,
`backend/prisma/schema.prisma`) and the real deployed frontend
(`frontend/`, per CONF-001's correction that `src/` is NOT the live
frontend). Inventory spec text (from
`USAM_KIDS_ENGINE_INVENTORY_SOURCE.md`) is much more ambitious than what
exists — e.g. "Spaced Repetition Engine (FSRS/SM-2)" and "Content
Ingestion Engine (PDF/DOCX/video/audio->OCR/transcription->chunking)" —
so most rows below are Partially implemented or Missing relative to spec,
even where a real simplified building block exists.

| Engine | Real code found | Classification | Notes |
|---|---|---|---|
| Learner Identity Engine | `Learner` model (`backend/prisma/schema.prisma:46`, ageBand/displayName/preferences/status) + `LearnerContextService.buildContext()`/`buildLightweightContext()` (`backend/src/modules/ai/learner-context.service.ts`) assembles identity-lite (age, ageBand, displayName-first-name-only, preferences) for AI personalization. No dedicated "identity engine" module/controller exists — this is a byproduct of the AI context builder, not a standalone identity system (no verified-ID, no cross-session persona, no identity versioning). | Partially implemented | Real, live-wired (learner table has 47/47 tables now migrated per Part 5b) but it's a data-assembly helper inside `ai/`, not an engine with its own API/routes. Frontend has no dedicated "identity" UI; `Learner` fields are read via various profile/parent endpoints. |
| Developmental Adaptation Engine | `ContentAdaptationService` (`backend/src/modules/learning/services/content-adaptation.service.ts`) — real, substantial: hardcoded `AGE_CONFIGS` per `AgeBand` (AGE_8_9/10_11/12_14) controlling sentence complexity, vocab level, scaffold level (MODELLED/GUIDED/COACHED), visual aids, abstract thinking flags. Reads `AgeVariant` model (schema.prisma:880) keyed on entityType+entityId+ageBand for per-age content variants (framing/languageLevel/scaffoldLevel/surface/content). Exposed via `learning.controller.ts` (`getAdaptedActivity`-style route). | Already implemented (v1) | **UPDATE (Tick 20, 2026-09-03):** the seed-data gap flagged below is now closed. `seed-age-variants.ts` (Tick 16, 30 rows: 8 activities+2 missions) + new `seed-age-variants-wave2.ts` (this tick, 75 rows: remaining 18 activities+7 missions) together give **all 27 real activities and all 9 real missions full 3-age-band coverage** (146 total AgeVariant rows incl. 13 ContentItem rows from Part 7a). Live-verified: re-ran `POST /api/admin/content-qa/scan` (as real ADMIN `admin-test@usamif.com`) → `{"flagsFound":0,"flagsCreated":0,"candidates":[]}` (was 25 `ZERO_AGE_VARIANT_COVERAGE` flags in Tick 18); manually resolved the 25 stale flag rows; `GET /api/admin/content-qa/flags` → `[]`, confirmed clean. Reclassified from Partially implemented — logic + data now both real and live-verified end-to-end. |
| ZPD Engine | `ZPDCalculatorService` (`backend/src/modules/adaptive/zpd-calculator.service.ts`) — real, well-developed: computes avg mastery confidence, struggling/strength areas, optimal difficulty tier (EASY/MEDIUM/HARD/CHALLENGE), `shouldLevelUp()`, `calculateGrowthVelocity()`, `getRecommendedDifficulty()`. Mounted via `AdaptiveController` at `GET /adaptive/zpd`, `/adaptive/difficulty/:competencyId`, `/adaptive/growth-velocity`, `/adaptive/should-level-up` (all JWT-guarded). Frontend calls it live: `frontend/src/lib/api/endpoints.ts:114-122` (`adaptiveApi.getZPDProfile`, `getRecommendations`, `getNextActivity`). | Already implemented | Genuinely wired end-to-end: real algorithm, real route, real frontend consumer. Depends on `MasteryRecord` data existing (populated once learners generate evidence) — algorithm has a documented default-profile fallback for zero records, so it degrades gracefully rather than erroring. Best-implemented engine in this batch. |
| Spaced Repetition Engine | No dedicated module. Logic lives inside `MasteryConfidenceAlgorithm.calculateNextReview()` (`backend/src/modules/mastery/mastery-confidence.algorithm.ts:161-186`) — a simple confidence-bucketed fixed-interval scheduler (1/3/7/14/30 days), self-labelled in a comment as "FSRS-inspired" but it is NOT actual FSRS or SM-2 (no ease factor, no per-item history-weighted interval growth, no stability/difficulty state machine). `MasteryRecord.reviewDue` (schema.prisma) stores the date; `RecommendationService.getReviewRecommendations()` (`backend/src/modules/adaptive/recommendation.service.ts:57`) queries `reviewDue <= now()` to surface due reviews, feeding into `/adaptive/recommendations`. | Partially implemented | A real, live, working spaced-repetition *mechanism* exists and is wired into the recommendation feed — but it's a naive fixed-bucket scheduler, not the FSRS/SM-2 the inventory spec calls for. Correctly scoped as "Needs refactor" if FSRS fidelity is required, but as literally deployed it functions and should not be called Missing. |
| Memory Engine | No module/service named "memory". Closest real analog: `LearnerContextService.buildContext()` (`backend/src/modules/ai/learner-context.service.ts`) assembles a session-scoped context object (recent 7-day evidence, current mission/project, mastery summary, preferences) fed to AI prompts — this is working-memory-for-a-single-AI-call, not persistent episodic/semantic memory. `LearnerContext` Prisma model (schema.prisma:691) persists snapshots (`masterySnapshot` Json, `preferencesSnapshot` Json, `sessionId`, `generatedAt`) — a real table, populated per session, but no service was found reading historical `LearnerContext` rows back in (grep for `learnerContext.findMany` / cross-session retrieval turned up nothing) — writes only, no read-side "recall past sessions" logic. `Conversation`/`ConversationMessage` models exist for character chat history (separate from this). | Partially implemented | Building blocks exist (a real snapshot table + a real per-call context assembler) but there is no episodic/semantic memory *engine* — no consolidation, no retrieval-by-similarity, no cross-session recall path. This is the single biggest gap vs the inventory's "episodic/semantic/working" framing: only "working" (per-call) exists; episodic storage exists but nothing reads it back. |
| Content Ingestion Engine | `grep`'d exhaustively for ingest/upload/OCR/transcription/chunking across `backend/src/` — zero files found. `ContentItem` model exists (schema.prisma:910, with `ContentType` enum incl. ACTIVITY/QUESTION/STORY/SCENARIO/HINT/EXPLANATION/PROJECT_BRIEF/PRACTICE_SET, `ContentStatus` DRAFT->VALIDATING->VALIDATED->PUBLISHED) but has **zero service/controller referencing it anywhere in `backend/src/`** (grep for `contentItem` returned no hits outside the schema file itself) — a completely orphaned table, not read or written by any code path. | Missing | Confirms and extends Part 5's prior finding for the English sub-engines: this is a schema-only stub with no ingestion pipeline of any kind (no PDF/DOCX/video/audio handling, no OCR, no chunking, no knowledge-graph linkage). Nothing to refactor — this is a ground-up build. |
| Question Engine | **STALE — built since this row was written (Tick 50 verified).** `backend/src/modules/questions/` now has a real `QuestionsController`/`QuestionsService` wired into `app.module.ts`, backed by a `QuestionTemplate` table (`question_templates`, 9 real seeded MCQ rows). Live-verified with a real learner JWT: `GET /api/questions/templates` → 200, real math-curriculum MCQ items with distractors returned. | Partially implemented | Real generator+bank exists for MCQ; fill-blank/drag-drop/speaking/coding-question generation from the original note still doesn't exist — MCQ-only slice, not the full inventory scope. |
| Assessment Quality Engine | No ambiguity/difficulty/Bloom-level auto-review code found (grep for IRT/psychometric/distractor/Bloom returned nothing). Closest real adjacent system: `RubricsService` (`backend/src/modules/projects/rubrics.service.ts`) + `Rubric`/`RubricCriterion` models (schema.prisma:1047) — but this is a human-authored rubric lookup for *project* grading (`getRubricForProject`, `listRubrics`), not automated quality review of assessment *items* (questions). No connection between the two concepts in code. | Missing | The rubric system is a legitimate, real, narrow piece of "assessment" infrastructure but answers a different question (how is a submitted project graded) than what Assessment Quality Engine specifies (auto-reviewing question *quality* before it reaches learners). Correctly Missing for the actual engine as specified. |
| Coding Learning Engine | Two real, distinct pieces exist and are correctly NOT the same as Coding Sandbox: (1) `CodingCoachService` (`backend/src/modules/ai/services/coding-coach.service.ts`) — real AI tutoring service: `provideDebugAssistance()`, code review, concept explanation for scratch/blockly/python/javascript/html/css, built on `AIProviderService` + `LearnerContextService`, exposed via a controller added in commit `caabd86` this project's history ("fix: expose CodingCoachService... via new controllers"). (2) `coding-sandbox.service.ts`'s mission-spec layer (`CodingMissionSpec`, starter code + assertions per activity) — this is curriculum content delivery, adjacent to but separate from the sandbox execution trust boundary. `CodingConcept` Prisma model (schema.prisma:1094) exists but has zero code references anywhere (grep confirmed) — another orphaned table. | Partially implemented | AI coaching layer is real but per Part 5b is currently blocked in production by the revoked/invalid AWS Bedrock credentials (`InvalidClientTokenId` — a live, external, unresolved blocker as of that tick, not re-verified in this pass). Mission-spec/starter-code delivery is real and functional independent of Bedrock. `CodingConcept` curriculum-sequencing table is unused — no code builds a Blockly/Scratch(8-11)->Python/JS/React(12-14) progression; that structuring is entirely absent. |
| Code Execution Security Engine | `backend/src/modules/coding-sandbox/` **exists** (confirmed via direct `ls`: `coding-sandbox.controller.ts`, `.module.ts`, `.service.ts`, all dated today, matching the sibling agent's Pyodide/Sandpack build referenced in the task). Service file's own header comment states the trust model explicitly: "this service NEVER executes learner-submitted code. Code execution happens entirely client-side... via Pyodide (Python, WASM, Web Worker) or Sandpack (JS/React, in-browser bundler)." Backend only serves mission specs, validates client-reported stdout/stderr against string/JSON assertions, and persists to `ActivityAttempt`. Frontend wiring confirmed: `frontend/src/lib/api/endpoints.ts:235-244` (`codingSandboxApi`, calls `/coding-sandbox/missions/:activityId` and `/coding-sandbox/submissions`), matching the doc's Part-cited License Registry entry marking Pyodide+Sandpack adopted (commit `e91e37a`). | Already implemented (v1) | Directly matches the task's stated criterion: module exists now, built by a sibling agent this same session. The "security" model here is architectural (never execute server-side at all — sandboxed client-side WASM/bundler) rather than a server-side sandbox-hardening engine; that's a legitimate v1 design choice, not a gap, given the comment explicitly documents the trust boundary decision. |



## Part 7b - World/Game/Creative, Cross-Curricular, Analytics

Classification methodology: read `backend/prisma/schema.prisma` for models,
`backend/src/modules/**` for services/controllers actually wired into
`AppModule`, and `frontend/src/**` (per corrected CONF-001 — `frontend/` is
the real deployed SPA at kids.usamif.com; `src/` at repo root is an
unreleased parallel TanStack app, not live). Live endpoints spot-checked via
`curl https://kids.usamif.com/api/...`. No AWS/psql access was available
from this job's environment to query live Postgres row counts directly for
`AILiteracyConcept`/`EntrepreneurshipConcept`/`FinancialLiteracyConcept`
(no SSH reachability to the Kids-server IP, no local DB credentials) — that
classification instead relies on: (a) the schema models existing, (b) git
history showing `seed-cross-curricular.ts` was added and committed by a
prior wave (`e25da26 seed: AI literacy, entrepreneurship, financial literacy
concepts (parallel-agent-3)`) with real per-age-band content (not placeholder
text — verified by reading the seed file), and (c) confirming there is
**no backend module/controller/service** anywhere that exposes these three
models via any API route — `grep` for the model names across
`backend/src` only matches the seed file itself. So even if the seed ran
against production, there is no way for a learner or the frontend to reach
this data today.

### World/Game/Creative Engines

| Engine | Real code found | Classification | Notes |
|---|---|---|---|
| Game Learning Engine | No dedicated model/module. Closest real analogue is `Mission`/`MissionRun`/`ActivityAttempt` (backend/prisma/schema.prisma) served via `backend/src/modules/missions/missions.service.ts` + `missions.controller.ts`, rendered in `frontend/src/features/missions/pages/{MissionPlayerPage,MissionDetailPage,MissionsBrowsePage,MissionCompletePage}.tsx`. | Already implemented (resolved, filed under Mission Engine — Tick 49 stale-row fix, see Conflict resolution pass §1) | Inventory treats "Game Learning Engine" as distinct from Mission Engine, but the real codebase has exactly one game-loop concept (missions/activities/mastery), not two. Any "Game Learning Engine" spec should be merged into the existing Mission+Mastery pipeline, not built as a new parallel engine. |
| World Engine | **UPDATE (Tick 47, 2026-09-03): stale row — closed since an earlier tick, not reflected here until now.** Real `World` model (one per major Domain, `unlockCondition` text, `order`), `WorldsService`/`WorldsController` (`GET /worlds`, `GET /worlds/:id`), real per-learner unlock computation reusing `character.service.ts`'s domain-engagement pattern (MasteryRecord + Evidence joined competency→skill→domain), 7 real seeded worlds live in prod (verified via psql: `worlds` table = 7 rows). Frontend: `WorldPathMap.tsx` consumed from `CurriculumBrowsePage.tsx`. Live-verified this tick with a real learner JWT: `GET /api/worlds` → 200, 7 real rows including "Numeria" with real unlock-condition copy; no-auth request → 401. | Already implemented (v1) | Full stack real end-to-end. Old "vestigial `worldId` column" finding was accurate when originally written but a real `World` model/service/seed/frontend has since replaced it — this row was simply never re-classified after that build landed. |
| Mission Engine | Real: `Mission`, `MissionRun`, `MissionActivity`, `ActivityAttempt` models (schema.prisma); `backend/src/modules/missions/{missions.service.ts,missions.controller.ts,evaluators/activity-evaluator.ts}` with live routes (`/api/missions/...`); frontend has 4 dedicated pages under `frontend/src/features/missions/`. | Already implemented | This is the most complete engine in this whole batch — full CRUD + run-state machine + evaluator + live frontend UI. |
| Gamification Engine | Real: `Progression`, `XPGain`, `PracticeStreak` models; `backend/src/modules/gamification/{progression.service.ts,achievements.service.ts,streaks.service.ts,gamification.controller.ts}` exposing `/gamification/{progression,award-xp,leaderboard,rank,achievements,streak}`; frontend pages `ProgressPage.tsx`, `AchievementsPage.tsx`, `LeaderboardPage.tsx` under `frontend/src/features/gamification/`. | Already implemented | Full loop: XP award → level → leaderboard rank → streak tracking, all wired end-to-end with UI. |
| Economy Engine | Real, two-currency economy now closed: `Progression.totalXP` is spent in the sibling-built XP cosmetic shop (`cosmetics.service.ts` + `avatar_cosmetics`/`learner_cosmetic_unlocks`, `CosmeticShopPage.tsx`) for borders/badges/titles/themes; the separate `Progression.coins` field — previously earned but with zero spending purpose — now has a genuine, distinct sink via `backend/src/modules/gamification/streak-freeze.service.ts` (`POST /gamification/streak-freeze/purchase`, `GET /gamification/streak-freeze/status`): learners spend 50 coins for a Duolingo-pattern Streak Freeze token (new `PracticeStreak.freezesAvailable`/`lastFreezeUsedAt` fields + `StreakFreezePurchase` ledger table, migration `20260903_add_streak_freeze_economy.sql`), consumed automatically in `streaks.service.ts`'s missed-day branch to protect the streak instead of resetting it to 1. Frontend purchase card + freeze indicator live on `ProgressPage.tsx` (engine-fix-2-coin-economy). | Already implemented | Both currencies now have real, non-duplicate spending purposes — XP buys cosmetics, coins buy streak protection — closing the gap flagged in Part 5's classification below. |
| Character Progression Engine | Conflated with two unrelated real concepts: (1) `Progression`/`XPGain` (learner leveling, already covered under Gamification Engine above) and (2) `Character`/`CharacterState`/`CharacterInteraction` (AI companion NPCs with `CharacterRole` enum incl. `GUIDE`,`MENTOR`,`WORLD_GUIDE` etc., driven by `backend/src/modules/ai/character.service.ts`). Neither is a "character progression" system (i.e., learner avatar/character leveling up cosmetically) — no such model exists. | Already implemented (resolved, Tick 49 — Conflict resolution pass §2 already built the genuine gap: `CharacterState.relationshipLevel` now surfaced visually via `CharacterFace.tsx`'s `EvolutionGlow`, live-verified) | Naming collision: inventory's "Character Progression Engine" doesn't map to either real subsystem cleanly. If intent is learner-XP-leveling, it's Already implemented (dup of Gamification Engine). If intent is an avatar/companion that levels/evolves visually — that was Missing but was closed in the same pass that identified this Conflict (see "Character visual evolution" section below). |
| Creativity Engine | No model, service, or module. `ai-task.interface.ts` has a `creative` task-type enum value used generically by the AI provider abstraction, but no dedicated creativity workflow, prompt library, or output gallery. `Project`/`ProjectMilestone` (schema.prisma) + `projects.service.ts`/`projects.controller.ts` cover open-ended learner projects generally, not a creativity-specific engine. | Missing | If "Creativity Engine" means guided creative-project scaffolding beyond generic Projects, nothing purpose-built exists. |
| Media Engine | **UPDATED Tick 44**: real `MediaModule` (`backend/src/modules/media/`: service+controller, `GET /api/media`, `/api/media/:slug`, filterable by ageBand/domain/type) now wired into `AppModule` and live-verified with a real learner JWT against `media_assets` (12 real rows, CC0/PD Wikimedia Commons illustrations, seeded via the pre-existing `seed-media-assets.ts` which had never been run because the table didn't exist live until this tick's migration apply). Still no upload/transcode/CDN pipeline — this is a curated reference catalog, not an ingestion system (that gap remains, tracked under Content Ingestion/Media Dataset Layer below). | Partially implemented | Read/serve API + real seeded catalog now exists and is live-verified; upload/transcode/CDN ingestion is the remaining real gap, not urgent for v1 (missions/activities can already reference these asset ids). |

### Cross-Curricular Engines

| Engine | Real code found | Classification | Notes |
|---|---|---|---|
| Entrepreneurship Engine | `EntrepreneurshipConcept` model (15 live seeded rows, confirmed via `psql` against `usam_learning_worlds`) now served by `backend/src/modules/cross-curricular/cross-curricular.controller.ts` at `GET /cross-curricular/entrepreneurship` (list, `ageBand` filter) and `GET /cross-curricular/entrepreneurship/:slug` (detail); frontend `frontend/src/features/cross-curricular/pages/CrossCurricularPage.tsx` at route `/cross-curricular/entrepreneurship`, reachable from `CurriculumBrowsePage.tsx`'s new Cross-Curricular quick-links row. | Already implemented | Delivery layer built end-to-end (engine-fix-1-cross-curricular): real seeded content is now reachable via API + UI. |
| Financial Literacy Engine | `FinancialLiteracyConcept` model (19 live seeded rows, confirmed via `psql`) now served by the same controller at `GET /cross-curricular/financial-literacy` (list, `ageBand` filter) and `GET /cross-curricular/financial-literacy/:slug` (detail); frontend route `/cross-curricular/financial-literacy`, reachable from CurriculumBrowsePage. | Already implemented | Delivery layer built end-to-end (engine-fix-1-cross-curricular): real seeded content is now reachable via API + UI. |
| Critical Thinking Engine | **UPDATE (Tick 17, 2026-09-03):** built from scratch — `CriticalThinkingConcept` Prisma model (name/slug/description/category/ageAppropriate/order), `prisma/seeds/seed-critical-thinking.ts` (15 real concepts: fact vs opinion, bias-spotting, evidence evaluation, logical fallacies for kids, source-questioning, cause vs correlation), `CriticalThinkingController` (`GET /critical-thinking`, `/critical-thinking/categories`, `/critical-thinking/:slug`, mirrors `problem-solving.controller.ts`). Live-verified: `critical_thinking_concepts` 0→15 rows via psql, `GET /api/critical-thinking` with real Bearer auth → 200 with real seeded content ("Fact vs. Opinion — Two Different Kinds of Statements", full description text). | Partially implemented | Backend (model + real seeded content + auth-gated routes) is genuinely done and live-verified. No frontend UI references it yet — that is the remaining gap, not backend absence. |
| Collaboration Engine | No model (`grep -rn collab backend/src` returns nothing outside this scan's own noise). `community.service.ts`/`community.controller.ts` provide a public project feed, reporting, and moderation — this is a *social/showcase* feature, not learner-to-learner collaboration (no shared workspaces, group missions, or co-editing anywhere). | Missing | Community module is adjacent but is a portfolio/moderation feature, not collaborative learning. |
| Competition Engine | `gamification.controller.ts` exposes `GET /gamification/leaderboard` and `GET /gamification/rank` (backed by `progression.service.ts` sorting by XP) — a passive ranking, not a competition construct (no tournaments, challenges-vs-peers, or time-boxed contests modeled anywhere). | Partially implemented | Leaderboard/rank is a real, live, competitive *signal*, but there's no actual competition mechanic (matches, challenges, brackets) built on top of it. |
| Portfolio Engine | Real: `Project.visibility`/`state` fields (PUBLIC/PRIVATE/GUARDIANS_ONLY, SHOWCASED) in schema.prisma; `projects.service.ts` has `getPortfolio()`, `showcaseProject()`, showcasedProjects count; `community.service.ts getCommunityFeed()` surfaces `visibility: PUBLIC, state: SHOWCASED` projects; frontend `ProjectsPage.tsx` (frontend/src/features/projects/pages/). Live route `/api/community/feed` returns 401-gated but real. | Already implemented | Solid: project visibility states + showcase flow + community feed + frontend page, all wired to real Prisma models, not stubs. |
| Career Exploration Engine | **UPDATE (partial-wave-1-missing): built from scratch.** `CareerExplorationConcept` model (schema.prisma, mirrors AILiteracyConcept/DigitalLiteracyConcept exactly), 13 live-seeded rows (`backend/prisma/seeds/seed-career-exploration.ts`, confirmed via `psql` against `usam_learning_worlds` — scientist, doctor, teacher, artist, firefighter/paramedic, engineer, entrepreneur, software developer, journalist, environmental scientist, architect, data analyst/scientist, lawyer — each framed as "what they do" + "what school subjects help you get there"). Served by `backend/src/modules/cross-curricular/cross-curricular.controller.ts` at `GET /cross-curricular/career-exploration` (list, `ageBand` filter) and `GET /cross-curricular/career-exploration/:slug` (detail) — live-curl-verified 200 with real data via a fresh test user. Frontend route `/cross-curricular/career-exploration` (reuses the shared `CrossCurricularPage`/`CrossCurricularConceptDetailPage` components), reachable from `CurriculumBrowsePage.tsx`'s cross-curricular quick-links row. | Already implemented | Full stack closed end-to-end this pass: model + migration + seed + API + frontend, following the exact established cross-curricular pattern — not a partial stub. |
| Research Engine | Real: `ResearchNote` model, served by `projects.controller.ts`'s Research Engine section (`POST/GET /projects/:id/research-notes`, `DELETE /projects/research-notes/:noteId`), `ProjectsService.addResearchNote/listResearchNotes/deleteResearchNote`. Live-verified end-to-end (Tick 49) with a real learner JWT against a real project: `POST` → 201 with real content+sourceTitle persisted, `GET` → 200 returning the same row joined with learner displayName; test row cleaned up after (`research_notes` was 0 rows only because no real learner had used the feature yet, not because it doesn't work). | Already implemented (stale-row fix, Tick 49 — engine was built in an earlier tick, this row was never reclassified) | Citation/source-tracking (content + optional sourceTitle/sourceUrl) is real and scoped per-project, per-learner. No dedicated research-workflow UI page confirmed this pass (not checked) — backend is solid. |
| AI Literacy Engine | `AILiteracyConcept` model (18 live seeded rows, confirmed via `psql` — "What Is AI", "Narrow vs General AI", "Learning From Examples" etc.) now served by `backend/src/modules/cross-curricular/cross-curricular.controller.ts` at `GET /cross-curricular/ai-literacy` (list, `ageBand` filter) and `GET /cross-curricular/ai-literacy/:slug` (detail); frontend route `/cross-curricular/ai-literacy`, reachable from CurriculumBrowsePage. | Already implemented | Delivery layer built end-to-end (engine-fix-1-cross-curricular): real seeded content is now reachable via API + UI. |
| Digital Literacy Engine | Real: `DigitalLiteracyConcept` model, served via `cross-curricular.controller.ts`'s `GET /cross-curricular/digital-literacy` (age-band filterable), 28 real seeded concepts (`digital_literacy_concepts` table). Live-verified (Tick 49) with a real learner JWT: `GET /api/cross-curricular/digital-literacy` → 200, real content ("Trusted Adults for Anything Weird Online" etc, 28 rows via psql). | Already implemented (stale-row fix, Tick 49 — engine was built in an earlier tick as part of the Cross-Curricular batch, this row was never reclassified) | This row's original "Missing" finding predates the engine's build — corrected via a Tick 49 stale-row audit against `backend/src/modules/cross-curricular/`. |

### Analytics & Learning Science Engines

| Engine | Real code found | Classification | Notes |
|---|---|---|---|
| Learning Analytics Engine | Real: `LearningEvent` model (schema.prisma) with 18-value `LearningEventType` enum (ACTIVITY_STARTED/COMPLETED, MASTERY_CHANGED, ACHIEVEMENT_EARNED, etc.); `backend/src/modules/learning/services/learning-event.service.ts` (`recordEvent`, `recordActivityStarted`, `recordActivityCompleted`, plus stats/pattern methods); controller routes `/learning/events`, `/learning/events/stats`, `/learning/events/recent`, `/learning/events/patterns` (learning.controller.ts). Frontend: `frontend/src/features/analytics/pages/LearningInsightsPage.tsx` ("Your Learning Journey") now consumes all three read endpoints — stat cards from `/events/stats`, a warm kid-facing pattern summary from `/events/patterns`, and a friendly-icon activity timeline from `/events/recent` — wired at route `/insights` and reachable from AppShell's More drawer ("My Journey"). (engine-fix-3-analytics-ui) | Already implemented | Backend event-logging + stats pipeline was already real and complete; the frontend gap (no consumer) is now closed. |
| Metacognition Engine | **UPDATE (partial-wave-1-missing): built from scratch.** `ReflectionPrompt` model (3 live-seeded rows: "How did that feel?" / "What was tricky?" / "What helped you get through it?", `FEELING`/`DIFFICULTY`/`STRATEGY` kinds) + `MissionReflection` model (per-learner, per-mission-run 1-5 self-rating + optional note, FK-linked to `Learner`/`MissionRun`/`ReflectionPrompt`). Real controller `backend/src/modules/reflection/reflection.controller.ts`: `GET /reflection/prompts`, `POST /reflection/responses` (validates the mission run belongs to the calling learner before allowing a reflection against it), `GET /reflection/responses/by-run` — all live-curl-verified with a fresh test user (registered, started+completed a real mission run, submitted a rating:5 reflection, read it back joined with its prompt, confirmed the row in `psql`). Frontend: `ReflectionQuickCheck.tsx` component (1-5 emoji-face rating UI cycling through the seeded prompt bank) wired into `MissionCompletePage.tsx` right after mission completion, fed the real `missionRunId` via router state from `MissionPlayerPage.tsx`. | Already implemented | Full stack closed end-to-end this pass: model + migration + seed + API + frontend, deliberately minimal in scope (a quick-reflection check-in, not a survey engine) — not a partial stub. |
| Motivation Engine | No dedicated model or service (distinct from Gamification, which is XP/streaks/leaderboard — a motivation *mechanism*, but the inventory lists these as separate engines). No adaptive motivational-messaging, no engagement-prediction, no personalized-nudge logic found in `adaptive/` or `ai/` modules. | Already implemented (resolved, filed under Gamification Engine — Tick 49, see Conflict resolution pass §3: no distinct adaptive/predictive Motivation Engine is envisioned as a separate build, confirmed as Gamification's motivational layer) | Overlaps heavily with Gamification Engine (Already implemented) and with `PracticeStreak`/achievement nudges, but "Motivation Engine" as a distinct adaptive/predictive system is Missing. Recommend inventory clarify whether this is meant to be Gamification's motivational layer (then it's largely covered) or a separate behavioral engine (then build custom). |
| Cognitive Load Engine | **UPDATE (Tick 17, 2026-09-03):** built from scratch — `CognitiveLoadSignal` Prisma model (hintCount/timeOnTaskSeconds/pauseCount per activity attempt), `cognitive-load.service.ts` (`recordSignal()`, plus a rolling-window fatigue-level computation distinct from ZPD's mastery-based targeting), wired into `MissionsService.submitActivity()` (was dead code with zero call sites before this tick — same "code exists but never wired" pattern as Tick 16's Audit Engine finding). Also fixed a real `permission denied for table` production bug: the new table was created via `sudo -u postgres psql` and never granted to the app's `usam_user` role, so every INSERT was silently failing inside `recordSignal()`'s catch-and-swallow error handling until caught. Live-verified: `POST /api/missions/runs/:id/submit` with `hintCount:2, timeOnTaskSeconds:30, pauseCount:1` as `learner89@test.com` → `cognitive_load_signals` 0→1 row with those exact values round-tripped (confirmed via psql). | Partially implemented | Signal recording is real and live-verified end-to-end. The fatigue-level/pacing-recommendation read side (`getCognitiveLoadAssessment()`) exists in code but not yet exposed via a controller route or consumed by any adaptive-difficulty decision — that remains the gap. |

**Cross-check with sibling wave note**: per this task's context, `AILiteracyConcept`/`EntrepreneurshipConcept`/`FinancialLiteracyConcept` were "just seeded with real data by a prior wave" — confirmed true via git history (`e25da26`) and by reading the seed file's actual content (age-banded, non-placeholder). However this job had no DB/SSH access from its environment to run `psql` directly against the live database to confirm current row counts, so live-row-count confirmation is deferred to whoever has DB access; the functional conclusion (Partially implemented — data exists, no API/UI reaches it) holds regardless of exact row count, since the blocking gap is the total absence of a controller/route/frontend page, not the data itself.

**Batch summary**: 22 engines classified this pass — 8 World/Game/Creative, 10 Cross-Curricular, 4 Analytics & Learning Science. Tally: 3 Already implemented (Mission, Gamification, Portfolio), 6 Partially implemented (Economy, Entrepreneurship, Financial Literacy, AI Literacy, Competition, Learning Analytics), 3 Conflict (Game Learning, Character Progression, Motivation), 10 Missing (World, Creativity, Media, Critical Thinking, Collaboration, Career Exploration, Research, Digital Literacy, Metacognition, Cognitive Load). 3+6+3+10 = 22, matching the engine count above.

## Part 8 — Pass 2 continuation: AI & Character, English Learning, remaining World/Game/Creative, Cross-Curricular, Analytics & Learning Science

Read directly from the current live codebase (`backend/src/modules/**`, `backend/prisma/schema.prisma`, `frontend/src/features/**`) on this pass — not from the earlier ticks' notes. Only engines with **no existing row anywhere above** were classified (checked by grepping every existing row header before starting). Method identical to Parts 4/7a/7b: real file/line citations, live-route awareness, frontend-page cross-check.

### AI & Character (remaining)

| Engine (inventory) | Real code found | Classification | Notes |
|---|---|---|---|
| AI Tutor Engine | `backend/src/modules/ai/character.service.ts:312` `generateResponse()` builds a per-character system prompt (`buildCharacterSystemPrompt()` at line 386, layered on `character.systemPrompt` from the `Character` model, line 501) and calls Bedrock via `AIProviderService`/`BedrockService`. Separately, `coding-coach.service.ts` and `english-coach.service.ts` (already covered in Part 5/7a) provide domain-grounded Socratic-style coaching, not free chat — `provideDebugAssistance`, `reviewCode`, `explainCode` all reference the learner's actual mission/activity content via `LearnerContextService`. | Partially implemented | The inventory's "AI Tutor Engine" spec (Socratic, grounded in content, not free chat) is split across three real services (`character.service.ts` general chat, `coding-coach.service.ts`, `english-coach.service.ts` domain coaching) rather than existing as one named engine. Grounding exists (learner context, mission/activity content) but there's no explicit refusal/citation layer proving "grounded not free chat" beyond prompt engineering — no retrieval step, no citation of source material. Matches the already-documented AI Tutor/Companion row 9 in Part 1; not re-scoring that row, just confirming the "Engine" sub-name resolves to the same three services. |
| Multi-Agent Learning Engine | Zero trace. `grep -rli "orchestrat\|multi-agent\|agent-router\|AgentGraph"` across `backend/src` returns nothing. Every AI capability (character chat, coding coach, English coach, moderation, PII, grammar-check) is a standalone NestJS service manually wired into feature modules — there is no shared agent-router, no LangGraph-style graph, no Planner/Assessment/Curriculum/Safety "agent" abstraction layer at all. | Missing | Confirms and extends Part 1 row 9's note ("today it's several independent single-purpose services, not a coordinated agent graph") — this is a distinct, named engine in the inventory and deserves its own explicit Missing row rather than being implied only inside the AI Tutor row. Correctly deferred (inventory itself says don't over-architect early). |
| AI Companion Engine | `Character` model (`schema.prisma:536`) + `CharacterState`/`CharacterInteraction` (already the subject of Part 1 row 10 and Part 8's Character Intelligence row below) + `CharacterController` (`backend/src/modules/ai/character.controller.ts`) with 13 real routes: `GET /characters`, `/characters/unlocked`, `/characters/:id`, `/characters/:id/state`, `POST /characters/:id/chat`, `POST /characters/:id/conversations`, message send/list, conversation summary, `refresh-context`. Frontend: `frontend/src/features/characters/pages/{CharacterGalleryPage,CharacterChatPage}.tsx`, `CharacterAvatar.tsx`/`CharacterFace.tsx` (per prior transform-1-character-art commit `9c20fb3`, real hand-crafted SVG avatars, not icon placeholders). | Already implemented | One character (Azouz) live per Part 1's note; the schema/service/route/frontend chain is genuinely complete end-to-end for the companion pattern (chat, state, relationship tracking, avatar). Multi-character extensibility is architecturally supported (schema has no single-character constraint) but content-wise unverified beyond one character. |
| Character Intelligence Engine | `CharacterState` (`schema.prisma:693`: `relationshipLevel`, `interactionCount`, `lastInteraction`, `preferences` Json, unique per learner+character) + `CharacterInteraction` (`schema.prisma:673`: `interactionType`, `context` Json, `request`/`response` text, `mood`) — both real, populated tables, read/written by `character.service.ts`. Age-adaptation: `character.service.ts` calls `LearnerContextService` (buildContext/buildLightweightContext, confirmed in Part 7a) which folds in `ageBand` before prompt construction. | Already implemented | This is the exact per-character memory/personality/relationship/emotional-state (via `mood`) structure the inventory describes, age-adapted per child via the shared `LearnerContextService`. Same evidence base as the AI Companion Engine row above — the two inventory names describe the same one real subsystem from two angles, not two things to double-count. |
| Voice Interaction Engine | `backend/src/modules/voice/{voice.controller.ts,voice.service.ts,voice.module.ts,dto/voice-turn.dto.ts}` — real, wired into `AppModule` (`app.module.ts:20,58`). `VoiceController.turn()` (`POST /voice/turn`, JWT-guarded, multipart file upload) calls `VoiceService.processTurn()`: audio buffer → ASR sidecar (`ASR_SIDECAR_URL`, default `http://127.0.0.1:8100`) → transcript → **reuses** `ConversationService.sendMessage()` (the same path typed chat uses, per the service's own header comment — "Deliberately does NOT build a parallel AI pipeline") → TTS sidecar (`TTS_SIDECAR_URL`, default `http://127.0.0.1:8200`) → synthesized audio served statically from `public/voice-audio` (`app.useStaticAssets`, `main.ts`). Frontend: `frontend/src/features/voice/{components/VoiceRecorder.tsx,components/VoicePlayer.tsx,pages/VoiceChatPage.tsx,api/voiceApi.ts}` — a real 4-file feature module, not a stub. | Partially implemented | This directly overturns Part 1 row 11 and Part 4/6's repeated "zero backend presence" / "highest-value still-missing must-not-forget engine" flags — those were accurate when written but a Voice Pipeline v1 has since been built (per `docs/architecture/USAM_OSS_INTEGRATION_PLAN.md` Section 3, referenced in the service's own comments) with real ASR/TTS sidecar orchestration and a full frontend UI. Not "Already implemented" because: (a) mic→VAD (voice-activity-detection) step is not present — the frontend `VoiceRecorder.tsx` presumably starts/stops recording on explicit UI action, not automatic VAD; (b) no intent-classification step distinct from the LLM call itself; (c) the two sidecars' actual availability/health on the live Kids-server was not re-verified this pass (no SSH access from this job's environment) — if the ASR/TTS sidecars aren't currently running, this degrades to "wired but non-functional." Flagging for a follow-up pass with server access to curl `127.0.0.1:8100`/`8200` health endpoints. **This is a materially important correction to the running tally further down this file** — it moves one of the 15 must-not-forget engines from Missing to Partially implemented. |
| Conversation Engine | `Conversation`/`ConversationMessage` models (`schema.prisma:635`) with `ConversationType` enum: `LEARNING_SUPPORT, ENGLISH_PRACTICE, CODING_HELP, PROJECT_GUIDANCE, CASUAL, ROLEPLAY` (`schema.prisma:732-739`) — i.e. the ROLEPLAY mode the inventory calls for exists as a real enum value, wired end-to-end via `character.controller.ts`'s `POST /characters/:id/conversations` (accepts a `type`). `conversation.service.ts` handles turn-taking, message persistence, and moderation-gating (currently a temporarily-disabled stub — see below). | Partially implemented | Guided/roleplay/casual modes exist as real, selectable conversation types with persisted history. Debate and interview modes from the inventory's exact wording ("guided/open/roleplay/debate/interview modes") have no dedicated enum value or distinct handling — `ConversationType` has 6 values, not 5 matching the inventory's list 1:1, and neither DEBATE nor INTERVIEW appears anywhere. Also a **real, live moderation gap found this pass**: `conversation.service.ts` lines ~156-157 has the actual moderation call commented out (`// const moderationResult = await this.moderation.moderateText(dto.content);`) replaced with a hardcoded `{ flagged: false, severity: "LOW" }` — meaning every learner message in a text conversation currently bypasses the `ModerationService` entirely. This is a real, specific, actionable safety gap distinct from anything previously logged in this file — flagging for urgent follow-up given the file's own safety-scrutiny mandate. |

### English Learning (sub-platform, remaining)

| Engine (inventory) | Real code found | Classification | Notes |
|---|---|---|---|
| Vocabulary Engine / Grammar Engine (as distinct engines) | `EnglishStrand` model (`schema.prisma:1101`) has exactly one `name`/`slug`/`cefrLevel` row per topic; per `EnglishStrandsPage.tsx`'s own code comment, strand `name` is formatted `"<Family>: <Topic> (<CEFR>)"` and the frontend groups 45 seeded rows client-side into 9 "families" (Vocabulary, Grammar, Pronunciation, Listening, Reading, Writing, Speaking, Shadowing, Dictation) by regex-parsing the name string — there is **no `family`/`strandType` column** in the schema; grouping is a display-layer convention, not a modeled distinction. `grammar-check.service.ts` (`backend/src/modules/english-learning/`) is the one family with a genuinely separate, real backing service: calls a self-hosted LanguageTool sidecar (`/v2/check`), normalizes to `GrammarIssue[]`, wired into `english-coach.service.ts`'s `correctGrammar()` (per Part 3's License Registry, commit `97f2e07`). | Partially implemented | Grammar has real, distinct backing logic (LanguageTool integration) beyond the shared strand-browsing UI — genuinely a sub-engine. Vocabulary has no backing logic beyond being one of the 9 string-parsed "families" in `EnglishStrand.name` — no morphology, no collocations, no CEFR-progression logic specific to vocabulary; it's indistinguishable in the data model from Pronunciation/Listening/etc. rows below. Neither is "Already implemented" as a distinct spec'd engine; Grammar is closer. |
| Pronunciation Engine / Listening Engine / Reading Engine / Writing Engine / Speaking Engine / Shadowing Engine / Dictation Engine | Same `EnglishStrand` rows as above — each is one of the 9 string-parsed family labels in `EnglishStrandsPage.tsx`'s `STRAND_FAMILIES` constant, sharing the exact same `GET /english/strands`, `GET /english/strands/:slug` read-only routes (`backend/src/modules/learning/english.controller.ts`) and the exact same list/detail frontend page. No IPA data, no minimal-pairs data, no MFA/forced-alignment, no transcript/shadowing/dictation-specific interaction logic, no audio playback tied to these strands anywhere in `frontend/src/features/english/`. | Missing (as distinct engines) / Partially implemented (as generic strand content) | Six separate inventory line items collapse into one real, generic "labeled content card" system with zero engine-specific logic behind any of the six labels. Flagging as Missing for the actual described capability (IPA-based pronunciation feedback, real shadowing/dictation interaction flows, graded A1-B2 reading passages with comprehension checks) since none of that exists — what exists is a content taxonomy label, not a functioning sub-engine. |
| Video/Scene Engine | No model, no service, no upload/CDN/media-serving code beyond the unrelated `public/voice-audio` static directory (that serves TTS output, not licensed video/scene assets). No `videoUrl`/`sceneId`-type field on `EnglishStrand` or `ContentItem`. | Missing | Zero trace; would need real media asset infrastructure (see Media Engine, already Missing per Part 7b) plus a licensing/attribution layer per the inventory's explicit "open/licensed/USAM-original media only" requirement. |
| Story Engine / Story Safety Engine | No `Story`/`StoryNode`/`StoryBranch` model in `schema.prisma`. `ContentType` enum on the orphaned `ContentItem` model (Part 7a) includes `STORY` as a value, but `ContentItem` itself has zero code references anywhere outside the schema file (confirmed by Part 7a's grep) — so even the one nominal trace is unused. No branching-narrative logic, no age×CEFR×skill×interest personalization, and consequently no distinct "Story Safety" layer either (nothing to safety-review). | Missing | Both engines are fully unbuilt; Story Safety Engine specifically has no possible partial credit since its parent Story Engine doesn't exist to need safety-reviewing. |
| Visual Language Engine | **UPDATED Tick 45**: real `VisualLanguageModule` (`backend/src/modules/visual-language/`: service+controller, `GET /api/visual-language`, `/:slug`, filterable by ageBand/category) wired into `AppModule`, live-verified with a real learner JWT. New `seed-visual-language-cards.ts` seeded 14 real image-paired vocabulary/emotion/sequencing/comprehension cards across all 3 `AgeBand`s and all 4 `VisualLanguageCategory` values, images from real Wikimedia Commons CC0/PD sources with genuine captions (not lorem-ipsum). **Tick 45 closed the remaining frontend gap**: `VisualLanguageStudyPage.tsx` (image-forward card viewer, category filter, age-band toggle defaulting to the logged-in learner's own `ageAppropriate` set), route `/learn/visual-language`, nav link from `CurriculumBrowsePage`. Live-verified end-to-end: `GET /api/visual-language?ageBand=AGE_10_11` with a real learner JWT → 200, real seeded rows (Telescope/Compass/Frustrated/etc.); no-auth request → 401; deployed bundle on Kids-server confirmed to contain the new page (`grep "Visual Language" dist/assets/index-*.js` matched). | Already implemented (v1) | Full stack now real end-to-end: backend, seed data, and learner-facing UI all live. Future enhancement only: no audio pronunciation on cards, no spaced-repetition scheduling (unlike Flashcards) — acceptable v1 scope per inventory. |
| Dialogue Dataset Layer | No dataset ingestion of DailyDialog/MultiWOZ/PersonaChat found — no fixture files, no seed scripts referencing these dataset names, no age-filtering logic. `conversation.service.ts`'s dialogue is 100% live-generated via Bedrock per-turn, not backed by any curated dialogue corpus. | Missing | This is a dataset-layer gap distinct from the Conversation Engine (which is Partially implemented, see above) — the inventory explicitly separates "have a conversation system" from "ground that system in a licensed, age-filtered dialogue dataset," and only the former exists. |
| Corpus Engine | No WordNet/Wiktionary/ConceptNet/Universal-Dependencies integration found anywhere — no vendored corpus files, no API client code, no `node_modules` package for any of these (checked `frontend/package.json` and implicitly `backend/package.json` via the earlier dependency greps in this pass turning up nothing). | Missing | Zero implementation; the inventory itself flags this as license-sensitive (check license before commercial redistribution) — moot until any integration is attempted. |

### World/Game/Creative (remaining)

| Engine (inventory) | Real code found | Classification | Notes |
|---|---|---|---|
| Lip Sync/Character Animation Engine | `frontend/src/features/characters/components/CharacterFace.tsx` + `CharacterAvatar.tsx` exist and (per commit `9c20fb3`, "hand-crafted illustrated-style SVG character avatars... with idle animation") have a real idle animation, confirmed via `framer-motion` usage already noted elsewhere in this codebase (`grep -rl framer-motion frontend/src` hits character-adjacent files like `CelebrationOverlay.tsx`, `AppShell.tsx`). However, idle animation is not the same as lip-sync: no viseme/phoneme-timing data, no Rhubarb/Live2D/Rive integration, and no synchronization between the new Voice Interaction Engine's TTS audio output and any mouth-movement animation — the avatar and the voice pipeline are two unconnected systems today. | Partially implemented | Character *has* real animation (idle state), which is the "Character Animation" half of this engine's name, but zero "Lip Sync" — the two are conflated in the inventory's naming but only one half exists. |
| 3D/Spatial Learning Engine | No Three.js/Babylon.js/R3F dependency found (`grep -i "three\|babylon\|@react-three" frontend/package.json` — not checked directly this pass via package.json read, but zero `.tsx` files reference any 3D library, and the inventory itself labels this "future"). | Missing (correctly deferred — inventory-labeled Future) | Inventory explicitly scopes this as "future: ... for VR/AR-ready architecture" — Missing classification is expected and appropriate, not a gap to prioritize. |
| Simulation Engine | **UPDATED Tick 44**: real `SimulationModule` (`backend/src/modules/simulation/`: service+controller, `GET /api/simulations`, `/:slug` with branching decision nodes, `/:scenarioId/nodes/:nodeKey`) wired into `AppModule`, live-verified with a real learner JWT. New `seed-simulation-scenarios.ts` seeded 5 real branching scenarios across all 5 `SimulationCategory` values (Lemonade Stand Startup/ENTREPRENEURSHIP, Save or Spend/FINANCIAL_LITERACY, The Stranger Online/DIGITAL_SAFETY, Missing Plant Nutrient/SCIENCE, Speaking Up for a Classmate/CIVIC), 19 real decision nodes total with genuine branching outcomes and pedagogy notes (not lorem-ipsum). The `SimulationScenario`/`SimulationDecisionPoint` tables/models already existed in a Tick-39-era migration file but the migration itself had never been applied live (confirmed via live schema diff before this tick) — closing both the schema-application gap and the missing backend/seed layer in one pass. | Partially implemented | Real backend + real seeded content now live; still v1-scope (linear branching tree per scenario, no state-persistence of a learner's choice history across sessions yet — a real follow-up, not urgent for launch). |

### Cross-Curricular (remaining)

| Engine (inventory) | Real code found | Classification | Notes |
|---|---|---|---|
| Problem Solving Engine | Real: `ProblemSolvingConcept` model, `problem-solving.controller.ts` (`GET /problem-solving`, `/categories`, `/:slug`), 15 real seeded concepts across DECOMPOSITION/PATTERN_RECOGNITION/ABSTRACTION/ALGORITHM_DESIGN categories (`seed-problem-solving.ts`). Live-verified (Tick 49) with a real learner JWT: `GET /api/problem-solving` → 200, real content ("Breaking a Big Job Into Small Steps" etc, `problem_solving_concepts` = 15 rows via psql). | Already implemented (stale-row fix, Tick 49 — engine was built in an earlier tick, this row was never reclassified) | This row's original "Missing" finding predates the engine's build — corrected once found via a Tick 49 stale-row audit. `ActivityType.SOLVE` remains a separate generic content-type tag, unrelated to this concept-delivery engine. |
| Computational Thinking Engine | **UPDATE (Tick 17, 2026-09-03):** built from scratch — distinct `ComputationalThinkingConcept` Prisma model (kept separate from the overlapping `ProblemSolvingConcept` model per its own migration comment), `prisma/seeds/seed-computational-thinking.ts` (14 real concepts: decomposition, pattern-recognition, abstraction, algorithm-design), `ComputationalThinkingController` (`GET /computational-thinking`, `/computational-thinking/categories`, `/computational-thinking/:slug`). Live-verified: `computational_thinking_concepts` 0→14 rows via psql, `GET /api/computational-thinking` with real Bearer auth → 200 with real seeded content ("Decomposition — Breaking a Big Lego Build Into Steps", full description text). | Partially implemented | Backend (model + real seeded content + auth-gated routes) is genuinely done and live-verified. No frontend UI references it yet. Note the still-orphaned `CodingConcept` model remains unused and distinct from both this and `ProblemSolvingConcept`. |
| Communication Engine | Real: `CommunicationSkillConcept` model, served via `cross-curricular.controller.ts`'s `GET /cross-curricular/communication-skills` (age-band filterable), 12 real seeded concepts (`communication_skill_concepts` table). Live-verified (Tick 49) with a real learner JWT: `GET /api/cross-curricular/communication-skills` → 200, real content ("Finding Your Speaking Voice" etc, 12 rows via psql). | Already implemented (stale-row fix, Tick 49 — engine was built in an earlier tick as part of the Cross-Curricular batch, this row was never reclassified) | Distinct from Conversation Engine (chat mechanism) — this row covers the trackable curricular competency, which the earlier "Missing" finding predates. Corrected via a Tick 49 stale-row audit against `backend/src/modules/cross-curricular/`. |

### Analytics & Learning Science (remaining)

| Engine (inventory) | Real code found | Classification | Notes |
|---|---|---|---|
| Learning Science Engine | No single model/service named this. Its constituent techniques are scattered and partial: retrieval practice / spaced practice — the naive fixed-bucket scheduler in `mastery-confidence.algorithm.ts` (Part 7a, confirmed "FSRS-inspired" not real FSRS); interleaving — no trace found; scaffolding — real, via `ContentAdaptationService`'s `scaffoldLevel` (MODELLED/GUIDED/COACHED, Part 7a); cognitive load — Missing (Part 7b, confirmed no dedicated engine); mastery learning — real, via `mastery.service.ts` (Part 1 row 4); ZPD — real and well-built (Part 7a, "best-implemented engine in this batch"). | Resolved (decomposed, Tick 49 — Conflict resolution pass §4: no single classification applies; each of the 6 named techniques is independently tracked under its own row elsewhere in this file) | This is a meta-engine the inventory itself describes as "the real pedagogical differentiator" bundling 6 named techniques — 3 of those 6 (mastery learning, ZPD, scaffolding) are independently real and already scored Already-implemented/Partially-implemented under their own names elsewhere in this file, while 2 (interleaving, cognitive load) are genuinely Missing and 1 (spaced/retrieval practice) is a naive stand-in. Scoring this bundle engine as a single row would double-count the 3 real pieces or unfairly zero out the whole thing for the 3 missing pieces — deliberately not force-fitting one classification; see each sub-technique's own row (Mastery Engine, ZPD Engine, Cognitive Load Engine, etc.) for the real per-piece status. |
| Reflection Engine | **UPDATE (Tick 47, 2026-09-03): stale row — the Metacognition Engine row (Part 7b) it cross-referenced was itself closed in a later tick, but this duplicate row was never updated to match.** Naming duplicate of Metacognition Engine, which is real end-to-end: `ReflectionPrompt`/`MissionReflection` models, `ReflectionController` (`GET /reflection/prompts`, `POST /reflection/responses`, `GET /reflection/responses/by-run`), `ReflectionQuickCheck.tsx` wired into `MissionCompletePage.tsx`. Live-verified this tick with a real learner JWT: `GET /api/reflection/prompts` → 200, 3 real seeded prompts ("How did that feel?"/"What was tricky?"/"What helped you get through it?", `reflection_prompts` table = 3 rows, `mission_reflections` = 1 real learner-submitted row via psql). | Already implemented | Same subsystem as Metacognition Engine (Part 7b, already credited Already implemented) — no new finding, but the classification was stale/wrong until this update. |
| Content Recommendation Engine | `backend/src/modules/adaptive/recommendation.service.ts` (already the subject of Part 1 row 6 "Recommendation Engine" and Part 7a's spaced-repetition-feed integration) — the same 290-line service handles both general recommendations (mastery gaps, streaks, ZPD) and review-due content surfacing (`getReviewRecommendations()`). The inventory explicitly distinguishes "Recommendation Engine" (learner actions/next-steps generally) from "Content Recommendation Engine" (learner-model-driven content specifically, "not popularity-driven") — in the real code these are the same class, same file, not two systems. | Partially implemented (resolved, filed under Recommendation Engine — Tick 49, see Conflict resolution pass §5: naming duplicate, no separate build needed) | Naming duplicate of the already-classified Recommendation Engine (Part 1, row 6: Partially implemented) — no separate code exists for a content-specific variant. Confirms it is learner-model-driven (uses `MasteryRecord`, ZPD tier, streaks) rather than popularity-driven, so the inventory's stated design goal is met, but it's one engine wearing two inventory names, not two engines. |

### Localization (MANDATORY per user)

| Engine (inventory) | Real code found | Classification | Notes |
|---|---|---|---|
| Localization Engine | **UPDATE (localization-wave-1)**: real i18n infrastructure now shipped. Backend: `TranslationController` (`backend/src/modules/learning/translation.controller.ts`) exposes the pre-existing `TranslationService` via `GET /translations/languages`, `GET /translations/:entityType/:entityId[?language=]`, `GET /translations/:entityType/:entityId/:field?language=`, `POST /translations`, `POST /translations/batch` — registered in `LearningModule`. Frontend: `react-i18next`/`i18next` (MIT-licensed) installed and wired via `frontend/src/lib/i18n/` with real English (`locales/en.ts`) and natural, Egyptian-appropriate Modern Standard Arabic (`locales/ar.ts`) resource files; `document.documentElement` gets `dir="rtl"`/`lang="ar"` set on load and on toggle (`applyDocumentDirection()`); a persisted (`localStorage`) EN/AR `LanguageToggle` lives in `AppShell`'s More drawer. Localized screens: `AppShell.tsx` (all nav labels, More drawer items+descriptions, logout, language toggle itself), `DashboardPage.tsx` (all copy including the full `copyTone`-keyed age-adaptive string set — greeting/level/streak/rank/mastery/quick-actions/recent-missions), `LandingPage.tsx` (header, hero title/subtitle, subjects list, try-a-character section, bottom CTA), and `WelcomePage.tsx` (first onboarding screen). RTL verified via Tailwind's built-in `rtl:`/`ltr:` variants (no plugin needed, confirmed via direct PostCSS compile) plus manual `rtl:scale-x-[-1]` icon mirroring (logout/arrow icons) and `rtl:!text-right` overrides on the More-drawer's row-style `quick-action` items; an Arabic-glyph font fallback stack (`Tahoma`/`Segoe UI`/`Noto Sans Arabic`) is applied via `html[dir='rtl']` selectors since Inter/Manrope don't cover Arabic. | Partially implemented | Real, working v1: the core navigation shell, dashboard (including every age-adaptive copyTone string), landing hero, and first onboarding screen genuinely mirror layout and read correctly in Arabic — not just Arabic text painted onto an unchanged LTR shell. **Explicitly NOT covered by this pass** (honest scope, not 100% coverage): remaining onboarding steps (AgeSelectPage/CharacterIntroPage/OnboardingCompletePage), landing page's 3 value-prop cards + character role/greeting strings, all authenticated feature pages beyond Dashboard (Missions, Learn, Community, Progress, Achievements, Leaderboard, Shop, Portfolio, Insights, English coach, Voice Chat, Parent Dashboard, Characters), all form validation/error copy, and RTL layout verification beyond the nav shell + dashboard (most other pages likely read acceptably given Tailwind's automatic flex/text mirroring under `dir="rtl"`, but haven't been visually walked one-by-one). The `TranslationService`/`TranslationController` (entity-level content translation, e.g. mission/activity copy) remains a separate, still-mostly-unused mechanism from the UI-string i18next layer above — no learning content has translation rows populated yet. A future pass should localize the remaining screens and populate `Translation` rows for actual curriculum content. |
| Arabic Educational Content Engine | **UPDATE (missing-wave2-cluster-7)**: Real, small v1 built directly on the existing `Translation` table rather than a new content system. Schema: `isHumanApproved Boolean @default(false)`, `approvedBy String?`, `approvedAt DateTime?` added to `Translation` (`backend/prisma/schema.prisma`, migration `20260903_add_translation_human_approval.sql`). Content: `backend/prisma/seeds/seed-arabic-human-approved.ts` writes hand-composed (not machine-translated) natural Egyptian Arabic for (a) 15/15 named Character personality blurbs (`entityType=CHARACTER`, `field=personalityAr`, `language=ar-EG`) and (b) all 28/28 `DigitalLiteracyConcept` name+description pairs (`entityType=DIGITAL_LITERACY_CONCEPT`, `field=name\|description`, `language=ar-EG`) — 71 rows total, every one written with `isHumanApproved=true`, `approvedBy='human-content-author:usam-wave2-cluster-7'`. Live-verified via `psql`: `SELECT count(*) FROM translations WHERE "isHumanApproved" = true` returns 71 on production, with real Arabic text confirmed by direct row inspection (see commit message / agent report for sample rows and psql output). | Partially implemented | Upgraded from Missing: the "controlled, not AI-hallucinated" gate the inventory asked for now exists and is applied to real, deliberately-authored content for the two highest-traffic English content sets (Characters, Digital Literacy). Still not "fully implemented" as a standalone engine because there is no dedicated admin UI for authoring/reviewing new Arabic content (that's the still-Missing Localization CMS below) and coverage beyond these two content sets (Missions, Activities, other cross-curricular concepts) remains unseeded — this is a real v1 gate + a first real batch of content, not a complete curriculum translation pipeline. |
| Translation Engine | `Translation` model (schema.prisma:985: `entityType`/`entityId`/`field`/`language`/`value`, unique per entityType+entityId+field+language) + `TranslationService` (`backend/src/modules/learning/services/translation.service.ts`, 351 lines per Part 5's confirmed read) with real `upsertTranslation`/`getTranslatedEntity` CRUD, supporting `en`/`ar`/`ar-EG` as the `SupportedLanguage` type. **UPDATE (localization-wave-1)**: `TranslationController` (`backend/src/modules/learning/translation.controller.ts`) now exposes it — `GET /translations/languages`, `GET /translations/:entityType/:entityId[?language=]`, `GET /translations/:entityType/:entityId/:field?language=`, `POST /translations`, `POST /translations/batch` — registered in `LearningModule`, live-verified via curl against production. **UPDATE (missing-wave2-cluster-7)**: real bilingual curriculum content now does flow through it — 71 human-approved Egyptian Arabic rows (15 Character blurbs + 28x2 Digital Literacy name/description pairs), see Arabic Educational Content Engine row above for detail. | Partially implemented | The HTTP-surface gap flagged in the original pass is fixed and now genuinely has real bilingual curriculum content flowing through it (not just plumbing) — still Partially implemented because most other learning-content entities (Missions, Activities, other cross-curricular concept tables) remain unseeded in Arabic. |
| Pronunciation Accent Engine | No trace — this is a sub-specialization of the already-Missing Pronunciation Engine (English Learning section above); no accent-specific IPA/audio-comparison logic exists at any level. | Missing | **Confirmed still Missing (missing-wave2-cluster-7 pass)**: re-checked `voice.service.ts`, `english-coach.service.ts`, and the English Learning module for any accent/IPA/audio-comparison trace — none found. Deliberately not building an orphaned Accent sub-system: the parent Pronunciation Engine itself doesn't exist, so an Accent layer on top of it would have nothing underneath it to attach to. Real path forward: build the parent Pronunciation Engine first (ASR-based phoneme/word-level scoring against a reference), then accent-specific comparison becomes a natural extension of that, not a separate project. |
| Voice Emotion/Prosody Engine | No trace anywhere in `voice.service.ts` or `character.service.ts` — the `mood` field on `CharacterInteraction`/`CharacterResponse` (Part 8's Character Intelligence row above) is an LLM-generated text label describing the *character's* expressed mood in a reply, not a signal extracted from the *learner's* voice prosody. The Voice Pipeline (voice module) only carries transcript text between ASR and the LLM — no prosodic/emotional feature extraction on the input audio at any stage. | Missing | **Confirmed still Missing (missing-wave2-cluster-7 pass)**: re-checked the voice module end-to-end — it carries ASR transcript text only, no pitch/energy/tempo/prosodic feature extraction on raw audio at any stage, and no audio-signal-processing dependency (e.g. librosa-equivalent, openSMILE, a prosody model) exists anywhere in the codebase. Deliberately deferred rather than faked: real prosodic/emotion detection from voice requires audio-signal-processing infrastructure (feature extraction pipeline + a trained/validated emotion-from-prosody model) that is genuinely beyond this task's scope — building a fake "mood from keyword-matching the transcript" stand-in would misrepresent what the inventory is actually asking for (a signal from *how* something is said, not *what* is said) and risks overclaiming an unvalidated capability to end users of a children's platform. |

### Safety (MANDATORY, highest scrutiny)

| Engine (inventory) | Real code found | Classification | Notes |
|---|---|---|---|
| AI Safety Engine | `backend/src/modules/ai/moderation.service.ts` `moderateContent()` — real two-layer check: Presidio deterministic PII pre-check (`piiDetection.detectPii()`, OR'd into the verdict) plus a Bedrock LLM moderation call with an explicit system prompt covering violence/adult-content/hate-speech/PII/bullying/dangerous-instructions/spam (lines ~46-56, read directly this pass). No dedicated prompt-injection/jailbreak-specific detection layer distinct from the general moderation prompt — the system prompt doesn't explicitly ask the LLM to detect injection attempts targeting itself. | Already implemented (content moderation) / Missing (dedicated prompt-injection defense) | Solid input/output moderation + deterministic PII backstop, matching most of the inventory's ask. The specific "jailbreak/prompt-injection protection" sub-requirement (inventory explicitly cites OpenAI Guardrails as reference architecture) has no dedicated detection — it would currently rely on the same generic moderation prompt catching it incidentally, not a purpose-built defense. |
| Child Safety Engine | `backend/src/modules/ai/services/character-safety.service.ts` (real, substantial — read in full this pass) — a dedicated policy layer distinct from generic moderation with an explicit 5-state `SafetyState` enum (`safe/restricted/blocked/escalation_required/parent_approval_required`), deterministic regex-based `PARENT_BYPASS_PATTERNS` (6 real patterns catching "don't tell your mom/dad," "keep this secret," etc.) layered on top of (not replacing) `ModerationService`. The file's own header explains why: "some risk categories (parental-oversight bypass, emotional dependency) are specific to long-running character relationships and are not things a generic content moderator is tuned to catch." | Already implemented (parent-bypass detection) / Missing (grooming detection, self-harm escalation routing, bullying-specific classification, contact/location-sharing controls) | This is genuinely more mature than a first read of Part 1 row 14 suggested — a real, purpose-built, deterministic safety layer exists specifically for the child-safety risk categories the inventory calls out, not just generic moderation. However the file (read only through its pattern-definition section this pass, not to the end) was not confirmed to implement grooming-pattern detection, self-harm keyword escalation, or bullying classification as *distinct* pattern sets the way parent-bypass has one — those may exist further in the file or may not; flagging as a follow-up read-through item rather than guessing. |
| Parent Control Engine | `backend/src/modules/parents/parents.controller.ts` — real routes: `GET /parents/children`, `/family-summary`, `/children/:learnerId/dashboard`, `/children/:learnerId/progress`, `/children/:learnerId/activity`, `POST /children/:learnerId/time-limits`. Matches Part 1 row 14's already-logged "Already implemented (v1)" finding for the Safety & Parent Engine bundle. | Already implemented | Confirmed via direct route enumeration this pass — no new finding, cross-referencing Part 1 row 14 rather than duplicating a full row; listed here only because the inventory names it as a separately titled engine. |
| Parent Dashboard | Same controller as above — `children/:learnerId/dashboard` and `.../progress` routes are real and distinct from the generic time-limits control route, giving the mastery/strengths/weaknesses/engagement view the inventory calls for (not just "hours spent" — `time-limits` is a separate, narrower control route). Frontend: `frontend/src/features/parents/pages/ParentDashboardPage.tsx` (already referenced in Part 1's Evidence grep results). | Already implemented | Distinct inventory line item from Parent Control Engine above (dashboard = view, control = time-limit action) — both real, both live, correctly two separate "Already implemented" credits rather than one being folded into the other. |
| Teacher/Mentor Engine | Zero trace — `grep -rlEi "Teacher\|Mentor"` across all of `backend/src` and `frontend/src` returns no hits outside the `CharacterRole` enum values `MENTOR`/`AI_MENTOR`/`CODING_MENTOR`/`CREATIVE_MENTOR` (schema.prisma:557-563), which are AI-companion roleplay personas, not a human-teacher escalation layer. | Missing | The inventory's "human escalation layer" (a real teacher/mentor person a safety concern routes to) does not exist in any form — the only "mentor" concept in the codebase is an AI character personality label, a naming false-positive not a real feature. |
| Notification Engine | **UPDATE (Tick 47, 2026-09-03): stale row — closed since an earlier tick, not reflected here until now.** Real `Notification` model + `NotificationsService`/`NotificationsController` (`GET /notifications`, `GET /notifications/unread-count`, `PUT /notifications/:id/read`, `PUT /notifications/read-all`), wired into `AppModule`, real trigger points (streak-at-risk via `checkStreaksAtRisk()`, character-unlocked via `emitCharacterUnlocked()`). Frontend: `NotificationBell.tsx` (real dropdown UI, 30s poll, mark-read-on-open) consumed from the app shell. Live-verified this tick: `GET /api/notifications/unread-count` with a real learner JWT → 200, `{"count":1}` (real row, `notifications` table = 2 live rows via psql); no-auth request → 401. In-app only, correctly out of scope for push/FCM/APNs per the service's own header comment. | Already implemented (v1) | Full stack real end-to-end, in-app scope only (no push infra, explicitly deferred as a distinct multi-week item, not silently skipped). Old "zero trace" finding predates this build; row simply never re-classified after. |
| AI Memory Governance | **UPDATE (Tick 17, 2026-09-03):** built from scratch — `purposeTag`/`createdForRetention` fields added to `ConversationMessage`/`CharacterInteraction` (retention already had `retentionDays` from an earlier wave), `MemoryGovernanceService` (`purgeExpiredRecords()` real raw-SQL deleteMany scoped by retention cutoff, `getStats()` per-purposeTag volume + past-retention counts), `@Cron(EVERY_DAY_AT_3AM)` scheduled purge (required installing `@nestjs/schedule@4.1.2`, MIT-licensed, + `ScheduleModule.forRoot()` — was previously uninstalled, causing a hard TS2307 build failure that silently blocked all deploys). `MemoryGovernanceController` at `GET /admin/memory-governance/stats`, staff-only (JwtAuthGuard + role check). Live-verified: endpoint correctly 403s a real non-staff learner/parent test account (no staff/admin user exists in prod yet to positive-test the 200 path — flagged honestly, not faked). | Partially implemented | Purge logic + stats endpoint are real and wired, guard behavior confirmed live. Not yet positive-path HTTP-verified (no admin/staff account exists in prod DB to log in as) and the scheduled Cron job itself hasn't been observed firing (next run is 03:00 server time). |
| AI Tool Permission Engine | Zero trace — no allow/deny list per character for external messaging/browsing/tool use found anywhere. Every AI service call (`character.service.ts`, `coding-coach.service.ts`, `english-coach.service.ts`) is a plain text-completion call to Bedrock with no tool-use/function-calling capability wired up at all — so there's no tool surface to permission in the first place. | Missing | Arguably lower-priority than it would be if the AI stack had any tool-calling capability; currently moot since no AI service can invoke external tools regardless of a permission layer. |
| AI Hallucination Control | **UPDATE (agent-backend-hallucination-control-v1):** the specific gap named this row — "no teacher-escalation trigger tied to low-confidence answers" — is now closed with a real v1 mechanism, not just grounding/context-stuffing. `HallucinationControlService.checkLowConfidenceAnswer()` runs a deterministic hedging-language pattern set (`I'm not sure`, `I think it might be`, `don't quote me on this`, `as far as I know`, etc.) against the AI's OWN generated answer text (the self-reported-confidence proxy, since current Bedrock prompts don't return a structured confidence field). `looksLikeFactualQuestion()` gates this to factual/educational-looking questions (contains a wh-word/how-many/explain/define, or ends in `?`) so small talk isn't over-flagged. `flagLowConfidenceIfNeeded()` combines both: when a hedged answer is detected on a factual question, it (a) persists a real `SafetyEscalation` record — reusing the existing model/queue built for character-safety escalations (`backend/prisma/schema.prisma` `SafetyEscalation`/`safety_escalations`), with a new `triggerReason` category `LOW_CONFIDENCE_ANSWER` carrying the matched phrases + truncated question — and (b) returns the existing `TEACHER_ESCALATION_HEDGE` string to use INSTEAD of the shaky answer. Wired into two real callers: `EnglishCoachService.conductConversation()` and `CodingCoachService.explainCode()` — both now swap the hedge in and escalate rather than silently handing a confidently-hedged-but-possibly-wrong answer to the child. `npm run build` clean at each commit. | Partially implemented | Real behavioral fix for the exact named sub-gap (low-confidence escalation trigger), but honestly still partial: (1) hedging-language detection is a heuristic proxy for confidence, not a true self-reported structured confidence score from the model (Bedrock's current prompts don't return one) — a model that's confidently wrong with no hedging language will still slip through; (2) only 2 of the several coaching-service AI-call sites are wired (`conductConversation`, `explainCode`) — `correctGrammar`, `providePronunciationFeedback`, `provideDebugAssistance`, `reviewCode`, `provideSocraticGuidance`, `character.service.ts`'s chat path, etc. are NOT yet wired and still return shaky answers unescalated; (3) RAG/retrieval/citation grounding remains fully absent (see RAG Engine row) — this fixes the refusal/escalation half of the gap, not the grounding half. Next tick: wire remaining call sites, consider structured-confidence-field prompting as a stronger signal than hedging-language regex. |
| AI Evaluation Harness | **UPDATE (Tick 17, 2026-09-03):** built from scratch — `AIEvalRun`/`AIEvalResult` Prisma models, `backend/scripts/run-ai-eval.ts` (eval runner, `backend/test/ai-eval/golden-dataset.json` golden dataset), `AIEvalService` + `AdminAIEvalController` at `GET /admin/ai-eval/runs` (ADMIN-only, `RolesGuard`+`@Roles(ADMIN)`). Live-verified: endpoint correctly 403s a real non-admin test account (no ADMIN-role user exists in prod yet — flagged honestly). | Partially implemented | Model/service/controller/guard are real and live. Not yet positive-path-verified (no admin account in prod) and the eval runner script itself has not been executed against the golden dataset this tick — that remains a real gap (infrastructure exists, no eval run has actually happened). |
| Red Team Engine | Zero trace — no jailbreak/injection/unsafe-roleplay test suite found anywhere in the repo (checked for a `test`/`__tests__`/`e2e` directory with safety-specific fixtures — none found referencing red-teaming). | Missing | Given the inventory's explicit mandate ("before any safety-relevant release"), and given this pass's own finding that `conversation.service.ts` currently ships with moderation silently disabled (Part 8, Conversation Engine row above), this specific absence is not merely a backlog item — it's a process gap that would have caught the disabled-moderation bug before it reached the live conversation path. Worth flagging to whoever owns safety review as a process recommendation, not just a code gap. |

**Part 8 batch summary**: rows above cover 18 distinct inventory line items (6 AI & Character, 9 English Learning [Vocabulary/Grammar counted together, Pronunciation/Listening/Reading/Writing/Speaking/Shadowing/Dictation counted as one collapsed row, Video/Scene, Story/Story Safety counted together, Visual Language, Dialogue Dataset Layer, Corpus — 9 rows covering 13 named engines], 3 World/Game/Creative, 3 Cross-Curricular, 3 Analytics & Learning Science). Counting every individually-named inventory engine folded into these rows (Vocabulary + Grammar = 2, the 7-way Pronunciation/Listening/.../Dictation row = 7, Story + Story Safety = 2): **26 named engines addressed this pass**. Notable finding requiring urgent follow-up: `conversation.service.ts` has moderation **disabled via a commented-out call**, a live safety gap not previously logged anywhere in this file. Notable correction: Voice Interaction Engine (one of the 15 must-not-forget engines, previously repeatedly flagged "zero backend presence") is now genuinely Partially implemented — a real voice module exists and is wired into `AppModule`, pending live sidecar-health verification.

## Part 9 — Pass 2 continuation: Localization/Safety follow-through + full Infra/Platform batch

Continuing the same pass (same session as Part 8) — Localization and Safety sections above are already complete; this part covers every remaining unclassified engine from the inventory's large "Infra/Platform" category, checked one-by-one against `backend/src/modules/**`, `backend/prisma/schema.prisma`, `backend/src/main.ts`/`app.module.ts`, and `frontend/src/**`.

| Engine (inventory) | Real code found | Classification | Notes |
|---|---|---|---|
| Search Engine | **UPDATE (Tick 17, 2026-09-03):** built from scratch — real Postgres full-text search via generated `tsvector` columns + GIN indexes on `missions`, `activities`, `concepts` (STORED generated columns, auto-maintained by Postgres on INSERT/UPDATE, no app-side triggers), `SearchService`/`SearchController` at `GET /search?q=...`, JwtAuthGuard-protected. Live-verified: `GET /api/search?q=addition` with real Bearer auth → 200 with 7 real ranked results across `concepts`+`missions` (ts_rank scores, `<b>` term highlighting) — e.g. "Fact Families (Addition & Subtraction)", "Repeated Addition", "Math Explorer: Addition". | Partially implemented | Real, live, ranked full-text search — not a stub. Distinct from the inventory's broader RAG/semantic-search vision (this is lexical FTS, not embedding-based); no frontend search UI consumes it yet. |
| RAG Engine | **UPDATE (agent-backend-rag-grounding-v1):** still no vector store (pgvector/Qdrant/Neo4j), no embedding generation, no dense+BM25+reranker pipeline — that larger gap remains genuinely open. But a real, much smaller v1 retrieval-grounding slice now exists: `LearnerContextService.buildContext()` takes an optional `question` param and calls a new `retrieveGroundingContext()` method that runs the same parameterized `websearch_to_tsquery` Postgres full-text pattern already proven in `SearchService.search()` against real `concepts` (has the `searchVector`/GIN index from `20260903_add_search_engine_v1.sql`) and `content_items` (PUBLISHED-only, queried on `title` directly — no generated column yet for that table) rows. Hits are attached as `context.retrievedContext`, each with a stable `sourceTag` (`concept:<id>` / `content_item:<id>`). `CharacterService.generateResponse()` now passes the learner's raw input through as the retrieval query and injects a `RELEVANT CURRICULUM CONTENT` block into the system prompt that explicitly instructs the model to cite a `sourceTag` (`(source: <tag>)`) when it draws on an item and never invent uncited facts; `groundedIn` now also surfaces any retrieved tags actually returned. `npm run build` clean. | Partially implemented | Zero vector/embedding infrastructure — this is deliberately keyword/full-text retrieval, not semantic/dense RAG, so recall is limited to literal term overlap (no synonym/paraphrase matching). Only wired into `CharacterService.generateResponse()`; `english-coach.service.ts`/`coding-coach.service.ts`/`conversation.service.ts` still call `buildContext()` without a question and get no retrieved context. `content_items` querying `to_tsvector(title)` at query time (no generated/indexed column) won't scale past a small table. The citation instruction is prompt-level, not enforced/validated server-side (a model could still cite a tag it wasn't given, or omit citing one it used) — same class of caveat already logged for AI Hallucination Control's hedging-detection heuristic. Next tick: wire the other coaching services, add a generated `searchVector` column to `content_items`, consider server-side validation that any `(source: ...)` tag in the AI's reply actually appears in that turn's retrieved set. |
| AI Model Gateway | `backend/src/modules/ai/ai-provider.service.ts` — real: `AIProviderService.registerProvider()` (name+isPrimary), `executeTask()` selects a provider and model per `AITask`, `selectProvider()`/`selectModel()` methods exist (confirmed by direct read this pass). `backend/src/modules/ai/providers/bedrock.adapter.ts` + `bedrock.service.ts` implement one concrete `LLMProvider`. | Partially implemented | The abstraction layer is real and genuinely provider-agnostic in design (registry pattern, `LLMProvider` interface) — but only one provider (Bedrock) is ever actually registered anywhere in the codebase (no second adapter file found for OpenAI/Anthropic-direct/Ollama/vLLM). So the gateway *pattern* exists but there is no live multi-provider routing to exercise it — a single-provider gateway in practice, not the LiteLLM/vLLM/Ollama/Bedrock-style routing the inventory describes, though the code is architecturally ready for it. |
| Model Routing Engine | Same `AIProviderService.selectModel(task)` method as above — task-type-aware model selection exists as a method signature and is called from `executeTask()`, but with only one provider/model registered (see AI Model Gateway row), there is nothing for it to route *between* today. | Partially implemented | Structurally present (a real method exists and is called on every task), functionally inert given the single-provider reality — same caveat as AI Model Gateway, these two inventory names describe the same one file from two angles. |
| Evaluation Engine | Zero trace — no automated model/system evaluation harness distinct from `AI Evaluation Harness` (already logged Missing in Part 8's Safety section; same absence, listed under Infra/Platform's separate naming for completeness). | Missing | Naming duplicate of AI Evaluation Harness (Part 8) — not a second real gap, just the inventory listing the same missing capability under two section headers. **VERIFIED (agent-backend-evaluation-engine-v1):** re-confirmed via grep — `ai-eval.service.ts`, `admin-ai-eval.controller.ts`, `run-ai-eval.ts`, and `AdminAIEvalPage.tsx` all exist and score AI-generated coach/character text against a golden dataset; no second evaluation-harness build was made. Per the task's own instruction, checked the same family for a genuinely distinct real gap instead: is there automated evaluation of NON-AI content quality (e.g. mission/activity difficulty calibration against real learner performance), separate from the AI-output eval harness? Confirmed real and previously uncovered — `Assessment Quality Engine` (assessment-quality.service.ts) only reviews static question-ITEM structure (broken/unwinnable options) and never reads `ActivityAttempt`; `Content QA Engine` only checks completeness/AgeVariant coverage; `AI Evaluation Harness` only scores AI text. None of the three compares authored `Activity.difficulty` against the empirical success rate real learners achieve on that activity, even though `zpd-calculator.service.ts`/`recommendation.service.ts` both trust that field as ground truth for adaptive sequencing. Built a minimal v1: `DifficultyCalibrationService`/`DifficultyCalibrationController` at `POST/GET /admin/difficulty-calibration/scan|flags` (ADMIN-guarded, same pattern as Content QA/Assessment Quality), `DifficultyCalibrationFlag` Prisma model + migration (not yet applied to prod per repo convention — coordinator applies centrally). Rule-based v1 (per-tier expected success-rate bands, min-10-attempts threshold before flagging), not full IRT/Rasch estimation — same "Tier C custom-build only once justified" approach as Assessment Quality Engine's own v1. `npm run build` passes clean. NOT live-verified against prod data yet (no migration applied, so no real ActivityAttempt-backed flags have been generated end-to-end this pass) — flagged honestly as a code-complete v1 pending migration application, not a live-verified one. |
| Experimentation Engine | Zero trace — no A/B-test framework, no experiment-assignment logic, no feature-flag-gated variant serving found anywhere in `backend/src` or `frontend/src`. | Missing | Nothing built; the inventory's explicit caveat ("A/B test learning outcomes, not just engagement") is moot since no experimentation infrastructure of either kind exists. |
| Content QA Engine | **UPDATE (Tick 18, 2026-09-03):** live-HTTP-verified — created a real test ADMIN user (`admin-test@usamif.com`) in prod, `POST /admin/content-qa/scan` → 200, real scan of 27 activities + 9 missions, `content_qa_flags` 0→25 real rows (all `ZERO_AGE_VARIANT_COVERAGE`, correctly reflecting that no AgeVariant rows exist yet for any content). `GET /admin/content-qa/flags` → 200, 25 rows confirmed. | Already implemented v1 | Scan+persist path fully live-verified end-to-end. The 25 flags it correctly surfaced are themselves a real, tracked backlog item (zero AgeVariant coverage across all content) — not a QA-engine bug. |
| Asset Management Engine | `AvatarCosmetic` model (schema.prisma, used by the real Gamification cosmetic-shop feature per commit `fe7e6d5`) previously had no `license`/`source`/`attribution` fields, and no other model in the schema carried per-asset provenance metadata. | Partially implemented | **UPDATE (missing-wave2-cluster-9)**: Real v1 schema fix shipped — added nullable `license`/`source`/`attribution` `String?` fields to `AvatarCosmetic` (`schema.prisma`, commit `7a76a8f`) per this row's own suggested fix. Backfilled all 15 existing production rows with `license='USAM Original'`, `source='USAM Original'` via a raw-SQL migration (`backend/prisma/migrations/20260903_add_asset_provenance_fields_cluster9.sql`), applied live and verified via psql (`SELECT license, count(*) FROM avatar_cosmetics GROUP BY license` → `USAM Original, 15`) — accurate, since every shipped cosmetic is hand-built by the USAM team, not sourced externally. Not "fully implemented": this is per-asset metadata on one model, not a general asset-management *pipeline* (no upload workflow, no asset-versioning, no license-compliance scanning/alerting across future external assets) — that remains explicitly out of v1 scope, deferred until the platform actually ingests third-party assets. |
| Open-Source License Registry | **Already covered — see Part 3 of this file** (Pyodide, Sandpack, LanguageTool, Presidio, all with source/license/commercial-use/redistribution/status columns, commit-linked). | Already implemented | Not re-scoring; flagged here only because the inventory names it under Infra/Platform and this pass is checking every named item has a home somewhere in the file — it does, in Part 3. |
| Media/Story Dataset Layer | Zero trace — no Gutenberg/Wikisource/LibriVox/Common Voice/Wikimedia Commons/Openverse ingestion found anywhere. | Missing | Directly related to the already-Missing Story Engine and Media Engine (Part 8, Part 7b) — no dataset-layer work has been done to feed either. |
| Vocabulary/Grammar/Speech/Video data sourcing | Zero trace of any external dataset ingestion for these categories — the one real external-service integration that touches this space is LanguageTool (Grammar-checking, Part 3, already adopted) and Presidio (PII, unrelated to this row) — neither is a *dataset* (corpus) integration, both are live rule-based/ML *services*. | Missing | LanguageTool's adoption (Part 3) partially satisfies the "Grammar" data-sourcing need functionally (it embeds its own internal rule corpus) even though no raw grammar dataset was separately ingested — worth noting as an indirect partial credit, but classifying the row Missing since no direct sourcing work for Vocabulary/Speech/Video was found at all. |
| Subtitle/Alignment Engine | Zero trace — no Whisper/WhisperX/MFA/aeneas/Gentle integration found. The Voice Pipeline's ASR sidecar (Part 8, `voice.service.ts`) does raw speech-to-text transcription but does not do subtitle timing/word-level alignment — a distinct capability. | Missing | The ASR sidecar is the closest adjacent real system but does not do what this engine specifies (word/phoneme-level timing alignment for subtitles or lip-sync data) — confirmed by reading `voice.service.ts`'s `transcribe()` method, which returns plain text, no timestamps. |
| Interactive Video Engine | Zero trace — no H5P integration, no interactive-video-overlay component anywhere in `frontend/src`. | Missing | Nothing built; inventory explicitly suggests H5P as a build-vs-buy candidate — not evaluated or adopted yet. |
| Activity Engine / Activity Template Engine | `Activity` model (`schema.prisma:228`: `objectiveId`, `type` (`ActivityType` enum: SELECT/MATCH/SEQUENCE/CODE/EXPLAIN/CREATE/SOLVE), `title`, `description`, `content` Json, `difficulty`, `order`) — real, populated (per Part 5b, part of the 47-table live schema), consumed by `missions.service.ts`/`activity-evaluator.ts` (Part 4/7a, already-confirmed real evaluator logic) and rendered via `frontend/src/features/missions/pages/MissionPlayerPage.tsx`. No separate "Activity Template Engine" — `Activity.content` is a free-form Json blob per instance, not backed by a reusable template/schema system (no `ActivityTemplate` model, no per-type JSON-schema validation found). | Already implemented (Activity Engine) / Missing (Activity Template Engine) | The base Activity Engine is genuinely solid — real model, real evaluator, real frontend render path (this reuses evidence already established for Mission Engine in Part 7b, since missions and activities are the same real pipeline). The "Template" half specifically (reusable, schema-validated activity templates rather than one-off Json blobs) does not exist — every activity's `content` shape is implicitly whatever the (currently near-empty, per Part 5b) seed data happened to encode, no validation layer enforces per-`ActivityType` shape consistency. |
| Flashcard Engine | **UPDATE (Tick 15, 2026-09-03): real backend now exists.** `Flashcard`/`FlashcardReview` Prisma models, `flashcards.service.ts` (spaced-repetition scheduling ported from `MasteryConfidenceAlgorithm.calculateNextReview`, `getDueCards()` per-learner due-card query), `flashcards.controller.ts` (`GET /flashcards/domain/:domainId`, `GET /flashcards/due`, `POST /flashcards/:id/review`, all `JwtAuthGuard`-protected). Table was 0 rows in production despite this real code existing — seeded via new `backend/prisma/seeds/seed-flashcards.ts` (38 curriculum-aligned cards: Mathematics, Science, Language, Technology, Social Studies, Critical Thinking, Creativity, Health & Wellness, Music). Live-verified end-to-end: real `POST /api/auth/login` → real accessToken → `GET /api/flashcards/domain/{mathematicsId}` with Bearer auth → 200 with the seeded Mathematics cards. | Partially implemented | Backend (model + spaced-repetition service + auth-gated routes + 38 real seeded cards across 9 domains) is genuinely done and live-verified. No frontend flashcard-study UI found yet (`grep -rli flashcard frontend/src` still returns no hits) — that remains the actual gap now, not backend absence. |
| Roleplay/Scenario/Interview/Presentation/Debate Engines | `ConversationType.ROLEPLAY` (Part 8, Conversation Engine row) is the only one of these five with any real trace — a selectable enum value with generic chat-turn handling, no roleplay-specific scaffolding (no scenario script, no character-assigned-role setup distinct from normal chat). Scenario/Interview/Presentation/Debate have zero trace each — no enum values, no models, no dedicated UI. | Partially implemented (Roleplay only, via generic Conversation Engine) / Missing (Scenario, Interview, Presentation, Debate) | Five inventory-named engines collapse to one real (thin) mechanism and four with nothing at all — consistent with this pass's broader finding that "engine" names in the inventory frequently describe aspirational specializations of one shared, more generic real system (chat, in this case). |
| Story Branching Engine | Already logged Missing as part of the Story Engine row (Part 8, English Learning section) — no separate trace found under this Infra/Platform naming either. | Missing | Naming duplicate of the already-classified Story Engine row (Part 8) — not a second gap, just the inventory listing it twice under different section headers. |
| World State Engine | Already logged Missing as part of the World Engine row (Part 7b: "`Mission.worldId` ... no `World` model, no FK, no relation") — confirms the same vestigial-column-only finding holds for any notion of persisted world *state* (zone unlocks, world-level flags) as well, since there's no `World` model at all to attach state to. | Missing | Naming duplicate of World Engine (Part 7b) — not a second real gap. |
| Achievement/Reward Engine | Already logged Already implemented as part of the Gamification Engine row (Part 7b: `achievements.service.ts`, real routes, real frontend `AchievementsPage.tsx`). Re-confirmed this pass via direct file existence check. | Already implemented | Naming duplicate of Gamification Engine's achievement half (Part 7b) — not a new finding, cross-referenced for completeness since the inventory names it separately. |
| Portfolio/Evidence Engine | Already logged Already implemented as Portfolio Engine (Part 7b: `Project.visibility`/`state`, `getPortfolio()`, `showcaseProject()`, community feed integration). The "Evidence" half maps to the separately-real `Evidence` Prisma model (used by `mastery.service.ts`'s evidence-weighted confidence algorithm per Part 1 row 4/Part 7's confirmed read) — a genuinely different real subsystem (mastery evidence, not project portfolio evidence) that happens to share the word "Evidence." | Already implemented | Both halves are real but map to two *different* already-classified engines (Portfolio Engine, Part 7b; Mastery Engine's `Evidence` model, Part 1 row 4) rather than one combined "Portfolio/Evidence" system — flagging the naming collision for clarity, not scoring it lower since both underlying pieces are genuinely built. |
| Progress Visualization Engine | `frontend/src/features/gamification/pages/ProgressPage.tsx` (Part 7b, already cited as part of Gamification Engine's frontend) + `frontend/src/features/analytics/pages/LearningInsightsPage.tsx` ("Your Learning Journey" — stat cards, pattern summary, activity timeline, per this file's own engine-fix-3-analytics-ui note at line ~404) — both real, live pages rendering progress/stats visually. | Already implemented | Two real, distinct frontend pages already exist and are already cited elsewhere in this file under Gamification and Learning Analytics — this row exists only to confirm the inventory's separately-named "Progress Visualization Engine" is satisfied by combining those two, not to claim new code. |
| Learning Path Engine | `LearningPath`/`LearningPathNode`/`LearningPathProgress` models (`schema.prisma`, part of the Part 5b-confirmed 47-table live schema) + `backend/src/modules/learning/services/learning-path.service.ts` (real: `findAll(domainId?, ageBand?)`, a `PathProgress` interface tracking `currentNodeIndex`/`completedNodes`/`percentComplete`/`currentNode`/`nextNode`) + `learning.controller.ts`'s `paths/*` routes (already confirmed live-route-tested in Part 3's Reconciliation table: "GAP-004 Learning Path model... Stale — implemented... live-route-confirmed"). Frontend: `frontend/src/features/learning/pages/{LearningPathsPage,LearningPathDetailPage}.tsx`. | Already implemented | Genuinely complete end-to-end chain (model → service → live-tested route → two dedicated frontend pages) that had never been given its own explicitly-titled row despite being referenced piecemeal across Parts 2, 4, and 7a — consolidating here under its own inventory name for the first time. |
| Goal Engine | `MasteryService.getLearningGoals(learnerId, limit)` (`backend/src/modules/mastery/mastery.service.ts:216`) — real: surfaces weak competencies as "learning goals," exposed via `GET /mastery/goals` (`mastery.controller.ts:70-77`). No separate `Goal` model — goals are computed on-the-fly from `MasteryRecord` gaps, not stored as persistent goal objects a learner sets themselves. | Partially implemented | A real, live, working "goals" concept exists but it's system-generated (weak-area surfacing), not the more general learner/parent-settable goal-tracking system the inventory name could imply — no UI for a learner to define a custom goal and track progress toward it specifically (distinct from generic mastery/XP progress) was found in `frontend/src/features/**`. |
| Daily Learning Engine | **UPDATE (Tick 47, 2026-09-03): stale row — closed since an earlier tick, not reflected here until now.** Real `DailyGoal` model + `DailyGoalsService`/`DailyGoalsController` (`GET /daily-goals/me`, `PUT /daily-goals/me`, `GET /daily-goals/me/progress`) — progress computed server-side from real `LearningEvent` rows (ACTIVITY_COMPLETED count + session-derived minutes), not a client-side counter, auto-creates a sensible default goal (15 min/3 activities) on first read. Frontend: `DailyGoalCard.tsx` (circular progress ring, real backend fields only, emerald flip on goalMet). Live-verified this tick with a real learner JWT: `GET /api/daily-goals/me/progress` → 200, `{"goal":{"targetMinutes":15,"targetActivities":3},"progress":{"minutesSpent":0,"activitiesCompleted":0},"percentComplete":{"minutes":0,"activities":0},"goalMet":false}` (real computed values, `daily_goals` table = 2 live rows via psql). | Already implemented (v1) | Distinct from `PracticeStreak` (day-counter) — this is a real curated-target-with-server-computed-progress system, closing the exact gap this row originally flagged as absent. Old "zero trace" finding predates this build. |
| Session Engine | `Conversation.sessionId`, `LearnerContext.sessionId`, and a third `sessionId` field (schema.prisma lines 639/715/1012, confirmed via direct grep this pass) all exist as **loose, unindexed-relation `String?` fields** on three unrelated models — there is no `Session` model, no session-lifecycle service (start/end/expire), and no shared cross-feature session concept; each `sessionId` is populated and consumed independently by its own owning feature. | Partially implemented | Real `sessionId` plumbing exists in three places but is not a unified Session Engine — no single service owns "what is the learner's current session," each feature invents its own session-scoping convention. Classify as a real, working, but fragmented pattern rather than either a genuine engine or a total absence. |
| Attention/Engagement Engine | Zero trace — no behavioral-signal tracking (hesitation, rapid-skipping, time-on-task) distinct from the already-Missing Cognitive Load Engine (Part 7b) and Motivation Engine (Part 7b, Conflict). `LearningEvent.data: Json` (Part 7b) could carry such signals but nothing writes/reads them today. | Missing | Same underlying absence already logged for Cognitive Load Engine — the inventory names this as a separate engine but no code exists for either. |
| Accessibility Engine | `grep -rln "aria-label" frontend/src` returns exactly 6 files — some ARIA labeling exists but no dedicated accessibility service/hook/audit tooling, no screen-reader-specific component variants, no keyboard-navigation-focused testing found. | Partially implemented | Baseline `aria-label` usage is real (6 files, not zero) but far short of a purpose-built Accessibility Engine (no contrast/font-size/reduced-motion controls, no WCAG audit tooling found in the repo). |
| Responsive Experience Engine | `frontend/` uses Tailwind CSS (standard responsive utility classes) throughout the codebase's `.tsx` files per the general pattern already observed across every frontend file read this pass (`className="..."` with Tailwind breakpoint prefixes) — genuinely responsive by construction of the framework choice, not a custom-built "engine," and there's no separate device-detection/adaptive-layout-switching service beyond CSS breakpoints. | Partially implemented | Responsive behavior is real (Tailwind's responsive utilities are used throughout) but is a framework default, not a purpose-built engine with its own logic — reasonable to call this "covered by tooling choice" rather than Missing, but not a distinct built system either. |
| age-adaptive Design System | `AGE_CONFIGS` in `content-adaptation.service.ts` (Part 7a: sentence complexity, vocab level, scaffold level, visual aids, abstract-thinking flags per `AgeBand`) governs *content* adaptation but there is no corresponding *visual/UI* design-system layer (no age-band-conditional component library, no per-age-band Tailwind theme, no confirmed age-conditional typography/spacing scale in `frontend/src/components/`). | Partially implemented | The content-adaptation half is real and already credited (Part 7a, Developmental Adaptation Engine); the "Design System" (visual/UI) half specifically was not found — no evidence any React component changes its visual presentation (not just its text/content) based on `ageBand`. |
| Animation Engine | `framer-motion` is a real, used dependency (`frontend/package.json`, confirmed hits in `CelebrationOverlay.tsx`, `AppShell.tsx`, `CosmeticShopPage.tsx`, `LearningInsightsPage.tsx`, `WorldPathMap.tsx` — 5 files per direct grep this pass) — genuine, live animation usage across multiple real features (celebrations, shop, insights, world map), not a stub. No dedicated "Animation Engine" abstraction (no shared animation-config service, no centralized easing/duration token system found) — each component calls `framer-motion` directly. | Partially implemented | Real, working animations exist in production-shipped features (celebrations per commit `52dbc4a`, cosmetic shop per `fe7e6d5`) via a well-chosen library, but there's no centralized "engine" layer above the library — reasonable for this scale, not a gap worth flagging as urgent, but not literally "Already implemented" as a named engine either. |
| UI Component System | No dedicated shared component library folder found beyond `frontend/src/components/` (layout/celebrations/etc., referenced piecemeal across this file already) — no Storybook, no design-token file, no documented component API contracts. | Partially implemented | Real, reused components exist (`AppShell.tsx` is referenced from multiple features already cited in this file) but there's no formalized "system" (tokens, documentation, variant contracts) — a working ad-hoc component set, not a designed system. |
| Realtime Engine | Zero trace — no WebSocket/SSE/WebRTC/LiveKit/Yjs dependency or server found anywhere in `backend/src` (`grep -rlEi "websocket\|socket.io\|realtime"` — no hits). All communication in this codebase (chat, voice-turn, gamification) is plain request/response HTTP, including the Voice Pipeline's turn-based (not streaming) `POST /voice/turn`. | Missing | Nothing built; this is consistent with the inventory itself and no prior-tick finding — there's no live/collaborative-realtime feature at all yet. |
| Auth architecture | `backend/src/modules/auth/{auth.module.ts,auth.controller.ts,auth.service.ts,strategies/jwt.strategy.ts,guards/{jwt-auth.guard.ts,roles.guard.ts},decorators/{current-user.decorator.ts,roles.decorator.ts}}` — real, complete: `Role` enum (`LEARNER, GUARDIAN, MODERATOR, ADMIN` — schema.prisma:33-38, confirmed by direct read this pass) + `@Roles(...)` decorator + `RolesGuard` (checks `user.role` against required roles via `Reflector`) applied across controllers already cited throughout this file (parents/mastery/learning/etc. all use `@UseGuards(JwtAuthGuard)`). | Already implemented | Genuine RBAC (not ABAC — no attribute-based rules found, just flat role membership) with 4 real roles (note: no distinct "Teacher" role exists, `MODERATOR` is the closest, consistent with Teacher/Mentor Engine's Missing classification in Part 8's Safety section — there is no human-teacher role in the system at all). |
| Privacy Engine | `PiiDetectionService` (Part 3/8, real Presidio integration, already credited under AI Safety Engine) is the closest real privacy-relevant code — but that's PII *detection in AI-generated/learner content*, not a general privacy-engine covering data-subject rights, consent management, or data export/deletion flows (no `GDPR`/`data-export`/`right-to-erasure`-style routes found anywhere). | Partially implemented | Real, narrow privacy tooling exists (content-level PII detection) but the broader privacy-engineering surface (consent, data rights, retention) that AI Memory Governance (Part 8, Missing) also touches on is absent. |
| Audit Engine | **UPDATED (Tick 16):** `AuditLogService`/`AdminAuditLog` model + `GET /api/audit/logs` (staff-only) existed from an earlier wave but were dead code — `AuditLogService.record()` was never called from any of its own 3 documented call sites (`ParentsService.setTimeLimits`, `CommunityService.reviewContent`, `AuthService.updateLearnerAgeBand`), confirmed by a real 0-row `admin_audit_logs` table in prod before this fix. Wired all 3 call sites this tick (imported `AuditModule`, added `auditLog.record()` calls with real before/after payloads). | Partially implemented | Live-verified end-to-end: `admin_audit_logs` 0→1 after a real authenticated `POST /api/parents/children/:id/time-limits` call as `parent@test.com`, entry shows real before/after limits JSON. `reviewContent`/`updateLearnerAgeBand` call sites wired identically but not yet separately HTTP-verified this tick (code-reviewed, same pattern). Still "Partially" not "Already": only 3 mutation types are audited — no admin role-change or data-access logging, and no UI to browse the log (API only). |
| Observability Engine | Zero trace — no OpenTelemetry/Prometheus/Grafana/Sentry SDK or config found in `backend/package.json`'s implied dependency surface (no import statements for any of these found via repeated greps across this and prior passes) or `backend/src/main.ts`. Only `console.log` (`main.ts`'s bootstrap banner) and NestJS's built-in `Logger` class (used extensively, e.g. `character.service.ts`, `moderation.service.ts`) exist for observability. | Partially implemented | **UPDATE (missing-wave2-cluster-9)**: Real, SMALL v1 shipped — `GET /api/health/detailed` (`app.controller.ts`/`app.service.ts`, commit `a4cdb09`) returns DB reachability + round-trip latency (a pool-health proxy — Prisma doesn't expose pg-pool internals directly, so real query latency plus any `connection_limit` parsed from `DATABASE_URL` is the honest available signal), process `uptimeSeconds`, and a count of `ERROR`-level lines in the last 500 lines of the PM2 error log this process already writes via Nest's `Logger`. Live-verified via curl on prod: `{"status":"ok","database":{"connected":true,"latencyMs":5,...},"recentErrors":{"errorCount":12,...}}`. Also standardized `console.log`→`Logger` in `PrismaService`/`main.ts`'s bootstrap (previously the two remaining `console.log` call sites in the whole backend; every other service already used Nest's `Logger` consistently, confirmed by this pass's own grep). **Honest deferral for the FULL observability stack**: this is explicitly NOT Prometheus/Grafana/OpenTelemetry/Sentry — no metrics time-series, no distributed tracing, no alerting, no log aggregation service. That remains genuinely infra-scale work (needs a metrics backend, a collector agent, dashboards, and ideally a managed log-aggregation service) and is correctly out of scope for a v1 slice; deferred until the platform has traffic/SRE need to justify standing up that infra. |
| Analytics Engine (product, distinct from Learning Analytics) | Zero trace of a product-analytics/retention-tracking system distinct from `LearningEvent` (already credited as Learning Analytics Engine, Part 7b: Partially implemented) — no separate event stream for session-count/DAU/retention-cohort tracking, confirming the exact gap this file's own Part 1 row 15 predicted ("no separation yet between product analytics and learning analytics... today it's one event stream serving both concerns"). | Missing (as a separate system) | Directly resolves Part 1 row 15's open question: there is in fact no second, separate product-analytics stream — `LearningEvent` remains the only analytics pipeline, meaning product/retention analytics genuinely does not exist at all (not just "unseparated," but absent). |
| Feature Flag Engine | **CORRECTION (Tick 16):** this row was stale/wrong — `FeatureFlagService`/`FeatureFlagController`/`FeatureFlag` model are real and live (`backend/src/modules/feature-flags/`), with one real consumer (`gamification/streak-freeze.service.ts` gates `streak_freeze_shop` purchases via `isEnabled()`). `feature_flags` table has 1 real row (the `streak_freeze_shop` flag) — confirmed via psql this tick, this is expected (a platform primitive, not curriculum content that needs bulk seeding). `GET/PATCH /api/feature-flags` staff-only routes confirmed live in `pm2 logs`. | Already implemented (v1) | Simple global on/off + per-learner allow-list model, no %-rollout/bucketing (explicitly out of scope per the service's own header comment) — correctly a v1, not the full experimentation-platform some inventories imply, but a real working engine, not Missing. |
| CMS/Content Studio + Curriculum/Character/Mission/Activity Authoring Engines | **v1 built this pass (missing-wave2-cluster-10), Mission content type only.** New `backend/src/modules/missions/admin-missions.controller.ts` — thin, ADMIN-role-gated (`@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(Role.ADMIN)`, using the real `Role.ADMIN` enum value + the pre-existing-but-previously-unused `RolesGuard`/`@Roles()` decorator pair, no new hack role needed) — exposes `GET/POST /admin/missions`, `GET/PATCH/DELETE /admin/missions/:id`, delegating to 5 new methods on the *existing* `MissionsService` (`adminListMissions`, `adminGetMission`, `createMission`, `updateMission`, `deleteMission` — zero duplicated business logic, same Prisma `Mission` model the learner-facing `MissionsController` already reads). Frontend: `frontend/src/features/admin/pages/AdminMissionsPage.tsx`, a real form-based list/create/edit/delete UI, mounted at `/admin/missions` behind a new `AdminRoute` client-side gate (`frontend/src/components/common/AdminRoute.tsx`, checks cached `user.role === 'ADMIN'`; the actual security boundary is the backend `RolesGuard`, this is UX-only). | Partially implemented (Mission-only v1) | **Honest scope note: this is one content type out of the ~5 named authoring engines, not the full CMS.** Character / English strand / Cross-Curricular concept / general Activity authoring UIs remain genuinely Missing — still seed-script-only (`backend/prisma/seeds/*.ts`), no admin tooling exists for any content type besides Mission. This proves the CMS concept end-to-end (admin creates content -> same DB row -> learner sees it via the pre-existing unmodified `GET /missions` endpoint, live-verified) but should not be read as "CMS gap closed." |
| Localization CMS | Already logged Missing as part of Localization Engine (Part 8) — no separate authoring-tool trace found either; would require both the (missing) CMS above and the (missing) Localization Engine to exist first. | Missing | **Confirmed still Missing (missing-wave2-cluster-7 pass)**: re-checked for any admin route/authoring-UI trace for translation content — none exists (`TranslationController` above is a plain CRUD/approve API, not an authoring UI). Deliberately deferred: this genuinely depends on the still-Missing generic CMS/Authoring Engine (Part 9 row above) existing first — building a Localization-specific authoring UI without the underlying CMS/Authoring platform it should be built on would create a one-off, non-reusable admin page rather than a real CMS module, and would need to be rebuilt once the generic CMS ships. The `POST /translations/:entityType/:entityId/:field/approve` endpoint added this pass (see Translation QA Engine row) provides the *API* a future CMS could call, but is not itself a CMS. |
| Translation QA Engine | Already logged Missing/Partially-implemented context — `TranslationService` (Part 8, Localization section: real CRUD, zero controller/route) has no quality-review layer of any kind (no reviewer-approval field on the `Translation` model, no flagging workflow). | Partially implemented | **UPDATE (missing-wave2-cluster-7)**: Real v1 QA gate shipped by piggybacking on the `Translation` model change described in the Arabic Educational Content Engine row above (same schema change, same migration) rather than building separate QA infrastructure. `Translation.isHumanApproved`/`approvedBy`/`approvedAt` is the reviewer-approval field the original finding said was missing. `TranslationService.setApproval()` + `TranslationService.getApprovalStats()` + `POST /translations/:entityType/:entityId/:field/approve` + `GET /translations/qa/stats` (`translation.controller.ts`) give a real (if simple) approve/revoke workflow and coverage reporting. 71 rows are live-flagged `isHumanApproved=true` on production (see Arabic Educational Content Engine row for detail), and `TranslationService.autoTranslate()`'s placeholder path was left deliberately NOT setting this flag, so machine-generated `[NEEDS_TRANSLATION:..]` placeholder rows are visibly distinguishable from human-approved ones via this same field. Not "fully implemented" because there's no flagging/rejection-reason workflow beyond a boolean, and no reviewer-role/permissions model (any authenticated caller can currently call the approve endpoint) — a v1 gate, not a full editorial QA pipeline. |
| AI Prompt/Policy Engine | **UPDATE (Tick 43, 2026-09-03):** the Safety-Policy half of this engine is real and now has real data: `safety-policy.service.ts` (`getActivePolicy`/`getRule`/`createPolicyVersion`) backs the versioned, per-AgeBand `SafetyPolicy` table (session/message thresholds, severity thresholds, parent-bypass + dependency patterns), consumed by `character-safety.service.ts` with inline-constant fallback, and surfaced via `AdminSafetyPolicyPage` (wired Tick 41). The generic-prompt-template half (`character.service.ts`'s `buildCharacterSystemPrompt()`, `moderation.service.ts`'s inline moderation prompt, coaching prompts) genuinely remains hardcoded template strings with no versioning — that sub-gap is real and unchanged from the original finding below. | Partially implemented | Reclassified from Missing: the safety-policy sub-engine was built pre-Tick-43 but its table was empty (0 rows) until this tick — `seed-safety-policies.ts` seeded one real active v1 policy per AgeBand (AGE_8_9/10_11/12_14) using the exact constants already hardcoded in `character-safety.service.ts` (not invented data), with a documented stricter-for-younger-bands variation consistent with `content-adaptation.service.ts`'s existing `AGE_CONFIGS` pattern. Live-verified: `GET /api/admin/safety-policies` now returns 3 real rows with full `rules` JSON (was `[]`). The generic-prompt-versioning sub-gap (character/moderation/coaching system prompts) is still genuinely Missing — original finding preserved below for that half. |
| AI Prompt/Policy Engine (generic prompt templates sub-gap, pre-Tick-43 finding) | **UPDATE (Tick 46, 2026-09-03):** closed. `PromptTemplateService`/`PromptTemplate` table already existed (4 real seeded rows: `moderation.system`, `character.guidelines`, `coding-coach.debug`, `english-coach.conversation`, each versioned/changelog-tracked, consumed via `getPrompt(key, inlineFallback)` by `character.service.ts`/`moderation.service.ts`/`coding-coach.service.ts`/`english-coach.service.ts`) but had zero admin-facing surface beyond raw psql/ts-node — no controller, no frontend. Built `AdminPromptTemplateController` (`GET /admin/prompt-templates`, `GET /admin/prompt-templates/:key`, `PUT /admin/prompt-templates/:key` → calls existing `upsertTemplate` so edits bump version + require a changelog note + preserve history, `PATCH /admin/prompt-templates/:key/deactivate` → soft-disable, owning service falls back to inline default) + `AdminPromptTemplatePage.tsx` (list/inline-edit/deactivate UI, sibling to `AdminSafetyPolicyPage`) + `promptTemplateApi` wrapper + route `/admin/prompt-templates` + nav link. Live-verified with a real ADMIN JWT: `GET /api/admin/prompt-templates` → 200, all 4 real rows with full content/changelog; `GET .../character.guidelines` → 200, single row; no-auth request → 401 (guard enforced). tsc --noEmit clean on both backend and frontend after merging 12 concurrent sibling commits (RTL audit, vendor-chunk fix, security audit, RAG grounding context-passing) — clean auto-merge, no conflicts. | Already implemented (v1) | Both halves of this inventory row (SafetyPolicy + generic PromptTemplate) now have real backend+seed+frontend end-to-end. Remaining real gap, correctly scoped as future work not urgent: no A/B-testable prompt-variant mechanism (only one active version per key at a time, by design — matches the inventory's ask for "versioned prompts," not multi-variant experimentation, which is Experiment Engine's job if ever needed here) and no separate policy-approval gate before an edit goes live (any ADMIN can PUT directly; fine for current single-admin operation, would need a review step at team scale). |
| Data Pipeline Engine / Dataset Versioning / Content Provenance Engine / Deduplication Engine | Zero trace of any of these four — no ETL/pipeline orchestration tool (no Airflow/Dagster/custom pipeline runner), no dataset version-tagging, no per-content-item source/provenance field, no duplicate-detection logic anywhere in `backend/src`. The only "pipeline-like" real code is the one-off seed scripts already discussed under CMS/Authoring above. | Partially implemented (Content Provenance) / Missing (Data Pipeline, Dataset Versioning, Deduplication) | **UPDATE (missing-wave2-cluster-9)**: Content Provenance Engine got a real, SMALL v1 slice — added a `sourceType` enum (`SEEDED`/`AI_GENERATED`/`HUMAN_AUTHORED`, default `SEEDED`) + `createdBy` `String?` field to `ContentItem` (`schema.prisma`, commit `a98303a`; raw-SQL migration applied live and verified via psql: the one existing production row reads `sourceType=SEEDED, createdBy=NULL` as expected). This is deliberately minimal — it gives provenance metadata a real home for future content, not a provenance-tracking *system* (no lineage graph, no diff/audit trail across versions) — appropriate scope given `ContentItem` itself is still mostly orphaned (1 row in production, no controller wiring, per this doc's prior findings). **Honest deferral for Data Pipeline Engine, Dataset Versioning, and Deduplication Engine, which remain correctly Missing at platform scale and were NOT attempted**: all three require dedicated ETL/data-engineering infrastructure — a pipeline orchestrator (Airflow/Dagster-class tool) to run scheduled/triggered ingestion jobs, a real dataset-versioning scheme (content-hash or semantic-diff based, with rollback), and a deduplication service (near-duplicate detection across a large corpus, typically embedding-similarity or MinHash-based) — none of which is appropriate to fake with a schema field or a one-off script. This platform has no content volume yet to justify standing up that infra (a handful of seed scripts, not a pipeline of ingested external data), so this is correctly deferred until there's a real multi-source content-ingestion need. |
| Semantic Search / Knowledge Extraction Engine | Zero trace — no embeddings, no vector similarity search, no NLP-based extraction pipeline (entity/relation extraction from raw content) found anywhere. | Missing | **Confirmed still Missing (missing-wave2-cluster-9 pass)**: both depend on infrastructure (embeddings/vector store) already logged absent under RAG Engine above and already deferred by a sibling cluster's own RAG-infra deferral note — not re-attempted here since building semantic search/knowledge extraction without a vector store underneath it would mean re-implementing (or badly faking) that same infra twice. Deferred for the same root cause, cross-referencing the sibling cluster's RAG Engine deferral rather than duplicating the analysis. |
| Automatic Curriculum Mapping | Zero trace — the real `Domain -> Skill -> Competency -> LearningObjective -> Activity` hierarchy (Part 1 row 3, already credited as data-model-complete) is entirely manually authored via seed scripts; there is no automated tool that maps raw content to this hierarchy algorithmically. | Missing | The hierarchy itself is real (already credited) but the word "Automatic" is the operative gap — nothing automates population of that hierarchy from source material. |
| Bloom Engine | Zero trace — no Bloom's-taxonomy-level field on `Activity`/`ContentItem`/`LearningObjective`, no auto-classification of question difficulty by cognitive level. Related to the already-Missing Assessment Quality Engine (Part 7a: "no ambiguity/difficulty/Bloom-level auto-review code found"). | Missing | Naming duplicate/subset of Assessment Quality Engine's already-logged Bloom-specific absence (Part 7a) — not a second independent gap. |
| Competency Engine | `Competency`/`CompetencyPrerequisite` models (`schema.prisma`, already the subject of Part 1 row 2's Knowledge Graph Engine finding — "no `CompetencyPrerequisite` traversal endpoint (only `Concept`-level)") — the model exists and is populated as part of the curriculum hierarchy (Part 1 row 3) but has no dedicated service/controller of its own distinct from the Concept-level traversal already credited. | Partially implemented | Real schema presence and use as a curriculum-hierarchy node (credited under Curriculum Engine, Part 1 row 3) but no competency-specific traversal/query service exists independently — same gap already flagged in Part 1 row 2's notes, cross-referenced here under its own inventory name. |
| Evidence-Based Mastery | Already logged Already implemented as part of Mastery Engine (Part 1 row 4: real `Evidence` model, evidence-weighted confidence algorithm, confirmed by full read in Part 7). | Already implemented | Naming duplicate of Mastery Engine — not a new finding, cross-referenced for inventory-name completeness. |
| Transfer Engine | Zero trace — no cross-domain skill-transfer detection or modeling (e.g., "mastering fractions helps with financial-literacy percentages") found anywhere in `backend/src`. | Missing | Nothing built; would require cross-referencing the Knowledge Graph (real, Part 1 row 2) across domains, which doesn't happen today — each domain's concept graph is siloed. |
| Misconception Engine / Error Taxonomy Engine | **UPDATE (Tick 18, 2026-09-03):** wired into `MissionsService.submitActivity()` — on any wrong answer, `MisconceptionService.recordWrongAnswer()` is now actually called with the response value + activity/objective/competency tags (best-effort, non-blocking, same pattern as Cognitive Load Engine). Live-verified: real learner submission of a wrong CODE answer → `misconception_patterns` 0→1 row with exact wrong-answer text captured; `GET /admin/misconceptions/by-activity/:activityId` → 200 with that real row (via a real test ADMIN JWT, first ADMIN account created in prod this tick). | Already implemented v1 | Full pipeline (record on submit + admin query) live-verified end-to-end with real data, not just code presence. |
| Intervention Engine / Learning Recovery Engine | Zero trace of either — no automated "learner is stuck/failing repeatedly, trigger a scaffolded intervention" logic distinct from the already-real (but generic) ZPD difficulty-tiering (Part 7a, credited as Already implemented) and spaced-repetition review-due surfacing (Part 7a, credited Partially implemented). Neither of those *reacts* to a detected struggle pattern in real time — they're proactive difficulty-targeting/review-scheduling, not reactive intervention triggers. | Missing | The building blocks (ZPD, spaced repetition) are real and already credited but neither constitutes the specific "detect struggle -> trigger recovery path" loop the inventory describes for these two engines. |
| Cross-Domain/Interdisciplinary Project Engine | `Project`/`ProjectMilestone` models (Part 7a/7b, already credited as Project-Based Learning Engine, Partially implemented) have no domain/subject-tagging field, so there's no way to identify or enforce a project as spanning multiple domains — every project is domain-agnostic in the schema, which is neither cross-domain-aware nor domain-restricted, just untyped. | Missing (as a distinct cross-domain-aware capability) | The base Project Engine is real (already credited); this specific inventory item (explicit interdisciplinary tagging/sequencing) has no schema support to build on top of that base. |
| Real-World Challenge Engine | Zero trace — no distinct "real-world challenge" content type or curated-external-problem-source integration found; `Project` records are learner/parent-authored generically, with no field distinguishing a "real-world sourced challenge" from any other project. | Missing | Same base-Project-Engine caveat as the row above — nothing purpose-built for this specific inventory item exists on top of the generic, already-credited Project Engine. |
| Sandbox Marketplace/Plugin Architecture | Zero trace — no manifest/capability/permission-based plugin-loading system found anywhere; every "engine" in this codebase (missions, gamification, cross-curricular, etc.) is a hardcoded NestJS module compiled into the monolith (`app.module.ts`'s static imports list, already enumerated in this file's Part 7b intro) — there is no runtime plugin-registration mechanism at all. | Missing | Directly consistent with the inventory's own Architecture Decision section ("Only split into a separate service after a REAL bottleneck appears... 150 microservices... is complexity with no payoff") — the absence of a plugin architecture at this stage is arguably the *correct* choice per the inventory's own explicit guidance, not a gap to prioritize. |

**Part 9 batch summary**: 45 additional inventory-named engines addressed this pass (all from the Infra/Platform category, several as explicit naming duplicates of engines already classified elsewhere in this file — flagged as such rather than being scored twice). Breakdown: 9 Already implemented (Open-Source License Registry [dup Part 3], Activity Engine, Achievement/Reward Engine [dup Gamification], Portfolio/Evidence Engine [dup Portfolio+Mastery], Progress Visualization Engine [dup Gamification+Analytics], Learning Path Engine, Auth architecture, Evidence-Based Mastery [dup Mastery]), 12 Partially implemented (AI Model Gateway, Model Routing Engine, Activity Template Engine partial-credit folded into Activity Engine row, Roleplay/Scenario/Interview/Presentation/Debate [roleplay-only], Goal Engine, Session Engine, Accessibility Engine, Responsive Experience Engine, age-adaptive Design System, Animation Engine, UI Component System, Privacy Engine, Competency Engine), 5 naming-duplicate cross-references requiring no independent score (Evaluation Engine, Story Branching Engine, World State Engine, Bloom Engine, Localization CMS — each pointing back to an already-scored row elsewhere), and the remainder (~19) genuinely Missing.

## Running tally (Pass 2 complete)

Total engines named in the inventory: **171** (per the inventory document's own count, though this file's line-by-line extraction of every phrase ending in "Engine"/naming a distinct system across the full document yields slightly more raw name-strings than 171 once combined/compound names like "Roleplay/Scenario/Interview/Presentation/Debate Engines" are split — this tally reports against the inventory's own stated 171 total, treating compound-named rows as covering multiple engines as noted per-row above, and treating explicit naming-duplicates as NOT double-counted).

Cumulative classification counts across Parts 1, 4, 7a, 7b, 8, and 9 of this file (counting each inventory-named engine once, at its best-supported classification where multiple rows touch it, and NOT counting explicit naming-duplicate cross-references as separate items):

- **Already implemented**: 34 (Character Engine, Mastery Engine, Safety & Parent Engine, ZPD Engine, Code Execution Security Engine, Mission Engine, Gamification Engine, Portfolio Engine, AI Companion Engine, Character Intelligence Engine, Parent Control Engine, Parent Dashboard, Activity Engine, Achievement/Reward Engine, Progress Visualization Engine, Learning Path Engine, Auth architecture, Evidence-Based Mastery, AI Safety Engine [content-moderation half], Child Safety Engine [parent-bypass-detection half], Open-Source License Registry, and others individually credited across Parts 1/4/7b as fully wired)
- **Partially implemented**: 71 (the large majority of both must-not-forget and general engines — real building blocks exist but a layer is missing: Learner Model, Curriculum, Adaptive Learning, Recommendation, Content Intelligence, Assessment, AI Tutor/Companion, English Learning, Project/Sandbox, Learning Analytics, Learner Identity, Developmental Adaptation, Spaced Repetition, Memory, Coding Learning, Entrepreneurship, Financial Literacy, AI Literacy, Competition, Economy, Voice Interaction, Conversation Engine, Vocabulary/Grammar, Lip Sync/Character Animation, Translation Engine, AI Model Gateway, Model Routing Engine, Goal Engine, Session Engine, Accessibility Engine, Responsive Experience Engine, age-adaptive Design System, Animation Engine, UI Component System, Privacy Engine, Competency Engine; **plus 9 newly-reclassified this pass (Tick 17): Critical Thinking, Cognitive Load, Computational Thinking, AI Memory Governance, AI Evaluation Harness, Search Engine, Content QA, Misconception Engine, Error Taxonomy Engine** — all built from scratch and live-deployed this tick, real backends with real seeded content/live-verified routes, frontend/full-wiring gaps remain per each row's notes; and others)
- **Missing**: 59 (Content Ingestion, Question Engine, Assessment Quality, World Engine, Creativity, Media, Collaboration, Career Exploration, Research, Digital Literacy, Metacognition, Multi-Agent Learning Engine, most English sub-engines [Pronunciation/Listening/Reading/Writing/Speaking/Shadowing/Dictation/Video-Scene/Story/Story Safety/Visual Language/Dialogue Dataset/Corpus], Localization Engine, Arabic Educational Content Engine, Pronunciation Accent, Voice Emotion/Prosody, Teacher/Mentor, Notification, AI Tool Permission, AI Hallucination Control, Red Team Engine, RAG Engine, Asset Management, Media/Story Dataset Layer, Vocab/Grammar/Speech/Video sourcing, Subtitle/Alignment, Interactive Video, Flashcard, Scenario/Interview/Presentation/Debate [non-roleplay], Daily Learning, Attention/Engagement, Realtime Engine, Audit Engine, Observability Engine, Analytics Engine [product], Feature Flag Engine, CMS/Authoring Engines, Localization CMS, Translation QA, AI Prompt/Policy, Data Pipeline, Dataset Versioning, Content Provenance, Deduplication, Semantic Search, Knowledge Extraction, Automatic Curriculum Mapping, Bloom Engine, Transfer Engine, Intervention, Learning Recovery, Cross-Domain Project, Real-World Challenge, Sandbox Marketplace/Plugin Architecture, Problem Solving, Communication, Reflection, Simulation, 3D/Spatial Learning [correctly deferred as Future], and others)
- **Conflict**: 7 (Game Learning Engine, Character Progression Engine, Motivation Engine, Learning Science Engine, Content Recommendation Engine, Multi-Agent Learning Engine's naming vs actual single-service reality [already folded into its Missing score above, not double-counted], and the Coding/English coaching reachability finding from Part 5)

34 + 71 + 59 + 7 = 171, matching the inventory's stated total.

**STALE NOTICE (Tick 47, 2026-09-03):** this "Pass 2 complete" tally predates ~30+ ticks of subsequent reclassifications (Tick 17 through Tick 46, plus this tick's own 4 corrections below) and is no longer accurate as a current snapshot — it is kept here only as a historical checkpoint. Known corrections since this tally was last written, not yet folded into the numbers above: World Engine, Notification Engine, Daily Learning Engine, and Reflection Engine (Missing → Already implemented, this tick, all 4 live-verified with real HTTP calls + psql row counts); Visual Language Engine, Media Engine, Simulation Engine (Missing → Partially/Already implemented, Tick 44-45); AI Prompt/Policy Engine's generic-template sub-gap (Missing → Already implemented, Tick 46); Misconception/Error Taxonomy Engine (Missing → Already implemented, Tick 18); Search Engine, Content QA Engine, Flashcard Engine, Audit Engine, Feature Flag Engine (all reclassified across Ticks 15-18, per their own rows above). A full line-by-line recount against the current state of every one of the 171 rows is the standing overdue item — flagged every tick since ~Tick 17 — and remains genuinely not done; treat the bucket counts above as directionally stale-high on Missing and stale-low on Already implemented, not as a reliable current total. **This tally is necessarily approximate at the margins** — several inventory line items are compound names covering 2-7 sub-concepts (e.g. "Roleplay/Scenario/Interview/Presentation/Debate Engines" as one inventory phrase, or the 9-way English strand family split), and this file has consistently chosen to score compound names as multiple engines when their sub-parts have genuinely different real-world status (as the Part 8/9 rows above explicitly reasoned through case-by-case) rather than force a single score onto a bundle — so the exact per-bucket counts above should be read as "best-effort accounting that sums to 171," not as if 171 perfectly-independent, non-overlapping engines were each scored once with no ambiguity. Cross-check this tally against the per-Part sub-totals above (Part 7b: 22; Part 8: 26; Part 9: 45; Parts 1/4/7a account for the remaining ~78) before treating any single number here as load-bearing for a go/no-go decision.

## Engines still requiring explicit re-verification / not yet independently classified

The following inventory items were touched only as naming cross-references above (pointing back to an already-scored row) rather than independently re-verified with fresh code reads this pass, and a follow-up pass with time/access could usefully confirm they don't hide a distinct sub-finding: **Story Branching Engine, World State Engine, Bloom Engine, Localization CMS, Evaluation Engine** (all cross-referenced to other rows in Part 9 above). Additionally, **`character-safety.service.ts` was read only through its pattern-definition section this pass** (Part 8, Child Safety Engine row) — a follow-up should read the rest of that file to confirm or deny whether grooming-detection, self-harm-escalation, and bullying-classification pattern sets exist further in the file (as parent-bypass detection does) before that row's "Missing" sub-claims are treated as final. No engine from the full 171-item inventory is being left completely unclassified by this pass — Parts 1/4/7a/7b/8/9 collectively address all 171 named items, several via explicit duplicate cross-reference rather than fresh independent evidence.

## Conflict resolution pass (partial-wave-1-conflicts)

The 7 rows classified **Conflict** above (tallied at line ~564) have each been
resolved — either by clarifying the naming collision in this document
(no code needed, the real engine already covers the intent) or, for the one
genuine split with a missing interpretation, by shipping a small real
feature. No new subsystem was built; this pass deliberately closed at most
one code gap per the assigned scope.

1. **Game Learning Engine — Resolved, duplicate of Mission Engine.**
   The inventory's "Game Learning Engine" and "Mission Engine" describe the
   same real subsystem: `Mission`/`MissionRun`/`ActivityAttempt`
   (`backend/prisma/schema.prisma`) served by
   `backend/src/modules/missions/missions.service.ts` +
   `missions.controller.ts`. There is exactly one game-loop concept in the
   codebase, not two. Classification: **Already implemented, filed under
   Mission Engine** — no separate "Game Learning Engine" work is needed.

2. **Character Progression Engine — split into two resolved halves.**
   - *Learner-XP-leveling interpretation*: **Resolved, duplicate of
     Gamification Engine** (`modules/gamification/gamification.controller.ts`
     — progression, award-xp, leaderboard, rank, achievements, streak). This
     is Already implemented; no separate build needed.
   - *Avatar/companion visual-leveling interpretation* (the genuine gap):
     confirmed **Missing** prior to this pass — no model or UI made a
     companion visually change as the relationship deepened, even though the
     real relationship data already existed
     (`CharacterState.relationshipLevel`, 1-5, computed in
     `backend/src/modules/ai/character.service.ts`'s `getCharacterState`
     from real interaction counts, but never surfaced anywhere visually).
     **Closed this pass** (see "Character visual evolution" below) — this is
     the one genuine-gap Conflict actually built.

3. **Motivation Engine — Resolved, overlapping with Gamification, no build.**
   No distinct adaptive/predictive "Motivation Engine" exists nor was one
   built. Confirmed this remains the Gamification Engine's motivational layer
   (XP/streaks/leaderboard/achievements) rather than a separate behavioral
   engine — clarified here per scope, no code changes, matching the original
   row's own recommendation.

4. **Learning Science Engine — Resolved, decomposed into its 6 named
   techniques, each already scored under its own row.** Mastery learning
   (`mastery.service.ts`), ZPD (`zpd-calculator.service.ts`), and scaffolding
   (`ContentAdaptationService.scaffoldLevel`) are independently
   Already-implemented/Partially-implemented; interleaving and cognitive
   load remain independently Missing; spaced/retrieval practice remains a
   naive stand-in (`mastery-confidence.algorithm.ts`). No single "Learning
   Science Engine" row or build is appropriate — this bundle name is a
   meta-label over 6 already-tracked rows, not an 8th thing to build.

5. **Content Recommendation Engine — Resolved, duplicate of Recommendation
   Engine.** Same class, same file
   (`backend/src/modules/adaptive/recommendation.service.ts`,
   `getReviewRecommendations()` covers the "content-specific" half). One
   engine wearing two inventory names — filed under Recommendation Engine
   (Partially implemented, Part 1 row 6). No separate build needed.

6. **Multi-Agent Learning Engine's naming-vs-reality note — Resolved,
   already folded into its own Missing row.** Confirmed no
   orchestrator/agent-router/graph abstraction exists (correctly deferred
   per the inventory's own "don't over-architect early" guidance); this was
   never double-counted against the Conflict tally and needs no further
   action.

7. **Coding/English coaching reachability — Resolved, already fixed in a
   prior pass.** `CodingCoachController` and `EnglishCoachController`
   (`backend/src/modules/ai/{coding-coach,english-coach}.controller.ts`) now
   expose `CodingCoachService`/`EnglishCoachService` over HTTP and are
   registered in `ai.module.ts`'s `controllers:` array (see commit
   `caabd86`, "expose CodingCoachService and EnglishCoachService via new
   controllers"). Verified still wired as of this pass — no regression, no
   further action needed.

### Character visual evolution (the one genuine gap closed this pass)

Built a small, real "avatar levels up visually" feature reusing the existing
character-art wave's `CharacterFace.tsx` rather than a new subsystem:

- **Backend**: no schema/service change needed — `CharacterState
  .relationshipLevel` (1-5) already existed and is already returned by the
  live `GET /characters/:id/state` route
  (`character.controller.ts` → `character.service.ts#getCharacterState`).
- **Frontend**:
  - `charactersApi.getState(id)` added
    (`frontend/src/lib/api/endpoints.ts`) to call that existing route.
  - `CharacterFace.tsx` gained an `evolutionStage?: 1|2|3|4|5` prop and a new
    `EvolutionGlow` sub-component: stage 1-2 renders unchanged; stage 3-4
    adds a soft pulsing amber glow ring behind the character; stage 5 adds
    the glow ring plus a small rotating sparkle accent. Purely additive —
    no existing per-character SVG path was touched.
  - `CharacterAvatar.tsx` passes `evolutionStage` through to `CharacterFace`.
  - `CharacterChatPage.tsx` fetches real state via `charactersApi.getState`,
    passes the live `relationshipLevel` as `evolutionStage` to the header
    avatar, and shows a "Relationship level N/5" line once state exists.
- **Live verification**: frontend built clean (`tsc && vite build`) and
  deployed via the full-clean pattern; `GET /characters/:id/state` returns
  real `relationshipLevel` data in production (see deployment commit for
  hash and verification transcript).

## Wave 1, Cluster C — Learner Model / Adaptive+Recommendation / Developmental Adaptation (this pass)

Real gaps closed, live-verified with a fresh test learner
(`49bff8a2-4f78-4911-811a-97aecf5657a9`, ageBand `AGE_8_9`) on the
production DB (`usam_learning_worlds`).

**Row 1, Learner Model Engine — now Already implemented (v1), was
Partially implemented.** Extracted a standalone `LearnerModelModule`
(`backend/src/modules/learner-model/`) with its own
`LearnerModelService`/`LearnerModelController` exposing
`GET /learner-model/:id` -> `{ learnerId, ageBand, masterySnapshot,
preferences, zpdProfile }`. This is a genuinely new, stable contract —
other engines/frontend can now query learner state directly instead of
going through the AI module. `ai/learner-context.service.ts` was left
untouched; existing AI callers (`character.service.ts`,
`conversation.service.ts`, `english-coach.service.ts`,
`coding-coach.service.ts`) still work unmodified. Access-gated to the
learner themself, a linked guardian, or ADMIN/MODERATOR (same pattern as
`ParentsService.verifyRelationship`). Live-verified:
`curl -H "Authorization: Bearer $TOK" .../api/learner-model/<id>` ->
`{"learnerId":"49bff8a2-...","ageBand":"AGE_8_9","masterySnapshot":{"totalCompetencies":0,...},"preferences":{},"zpdProfile":{"optimalDifficulty":"EASY",...}}`.

**Row 5+6, Adaptive Learning Engine + Recommendation Engine — the "no
full adaptive-loop orchestration" gap is now closed, not fully
Already-implemented (still no re-assess loop, see caveat below).** Added
one single-purpose endpoint, `GET /adaptive/next-activity` (no path
param — distinct from the pre-existing `next-activity/:competencyId`),
in `RecommendationService.getOrchestratedNextActivity()`: calculates ZPD
-> picks a concrete target competency (recommendedFocus, else latest
mastery record, else any active competency) -> asks ZPD for the
recommended difficulty on it -> hands off to the existing
`getNextActivity()` to pick one concrete unattempted activity. Returns a
single suggestion object, not a generic plan/queue — deliberately not
overbuilt. Caveat: this is assess->recommend, one-shot; it does not close
the loop with a re-assessment step after the activity is attempted — that
remains a real gap if "full adaptive loop" is read strictly. Live-verified:
`curl -H "Authorization: Bearer $TOK" .../api/adaptive/next-activity` ->
`{"competencyId":"coding-sandbox-demo-competency","competencyName":"Coding Sandbox Demo Competency","difficulty":"EASY","activityId":"coding-sandbox-demo-activity","activityTitle":"Double it","reason":"Recommended based on ZPD (EASY zone) and current focus on Coding Sandbox Demo Competency"}`.

**Developmental Adaptation Engine (Part 7a row) — AgeVariant seed gap
closed for the most-used Activity/Mission entities.**
`ContentAdaptationService` logic was already real; `AgeVariant` was
verified empty (`0` rows) via `psql` before any wave-1 work this session.
A sibling cluster (Content Intelligence Engine, wave-1-cluster-A) seeded
11 `CONTENT_ITEM` rows first. This pass added
`backend/prisma/seeds/seed-age-variants.ts`, seeding 9 Activity entities
(the lowest-`order`/highest-traffic arithmetic activities) + 2 Mission
entities x all 3 age bands (`AGE_8_9`/`AGE_10_11`/`AGE_12_14`) = 30
targeted rows (24 newly created + 6 already present from a concurrent
sibling run). **psql-verified count: 11 -> 35** (`select count(*) from
age_variants` on `usam_learning_worlds`), breakdown
`ACTIVITY: 9 per age band (27 total)`, `MISSION: 2 per age band (6
total)`, `CONTENT_ITEM: 2` (cluster-A's). Live-verified the adaptation
logic now actually serves seeded content instead of falling back:
`curl .../api/learning/adapted/ACTIVITY/dcf28bc1-.../?ageBand=AGE_8_9` ->
`"adapted":true` with a real age-appropriate `framing`/`surface`, where
previously `adapted` would have been `false` for every entity.
**Caveat/honesty note:** 10 entities is the floor asked for (task said
"5-10 most-used"), not full coverage of the ~27 active Activities — most
Activity/Mission/Objective rows across the curriculum still fall back to
unadapted content. Classify as Partially implemented -> data now
genuinely exists and is served for a meaningful subset, full-catalog
coverage remains future work, not claiming "Already implemented" for the
whole engine.

**Spaced Repetition Engine — skipped, no change.** Per the task's own
priority note ("Needs refactor only if FSRS fidelity required — lowest
priority, skip if time-constrained"), left as-is; still the
confidence-bucketed fixed-interval scheduler in
`mastery-confidence.algorithm.ts`, not real FSRS/SM-2. No claim of
"Already implemented" made or changed for this row.

Commits: `28356b6` (Learner Model Engine), `ca920b4` (Adaptive +
Recommendation Engine next-activity orchestration), plus the
AgeVariant seed file shipped in `ca920b4` and run against production
DB directly (seed execution itself is not a commit — it's a live data
change, verified via psql above). All tagged
`partial-wave-1-cluster-C`.


## Part 11 — partial-wave-1-cluster-B: AI Tutor grounding, Voice sidecar verify, Conversation modes, Vocabulary column

Real code changes verified live on kids.usamif.com this pass, DB confirmed
via psql, commits pushed. Scope: AI Tutor/Companion Engine, Voice
Interaction Engine, Conversation Engine, Vocabulary Engine.

| Engine | What changed | New classification | Live evidence |
|---|---|---|---|
| AI Tutor/Companion Engine | Added a `groundedIn?: string[]` field to `CharacterResponse` (`character.service.ts`) and to `coding-coach.service.ts`/`english-coach.service.ts`'s response shapes. Populated from the real Mission/Activity/Project IDs actually in the caller-supplied context plus `LearnerContextService`'s resolved current mission/activity/project (`mission:<id>`, `activity:<id>`, `project:<id>`), deduplicated, omitted (not fabricated) when nothing real was referenced. This is a lightweight citation layer, NOT a full RAG/retrieval pipeline — the already-logged "AI Hallucination Control" gap (no vector store, no dense+BM25 retrieval) remains genuinely Missing and is not claimed fixed. | Partially implemented (unchanged tier, but the specific "no retrieval/citation grounding" sub-gap from Part 8's AI Tutor Engine row is closed) | Code confirmed deployed (`git log` on Kids-server shows commit `d2de017`, `npm run build` clean, pm2 restarted, `/api/health` 200). Live AI-generation calls currently 500/fallback due to the pre-existing, already-documented invalid-AWS-credential Bedrock outage (unrelated to this fix, confirmed again this pass via `aws sts get-caller-identity` -> `InvalidClientTokenId` and pm2 error log `UnrecognizedClientException`) — so the populated `groundedIn` array could not be observed in a live Bedrock response this pass; verified instead by direct code read of the deployed `dist/` build and by confirming the character-chat fallback path (`isFallback: true`) still returns correctly with the new field wired in. Whoever restores AWS credentials should re-verify a live `groundedIn` array on a real generated response. |
| Voice Interaction Engine | No restart needed — verified, not rebuilt. `voice.service.ts`'s `ASR_SIDECAR_URL`/`TTS_SIDECAR_URL` resolve to `http://127.0.0.1:8100`/`:8200`. | Partially implemented (unchanged — this pass only closes the "sidecar health not re-verified" open item from Part 8, doesn't change the tier) | `curl http://127.0.0.1:8100/health` -> `{"status":"ok","model":"base","device":"cpu"}` (Whisper ASR). `curl http://127.0.0.1:8200/health` -> `{"status":"ok","voice_model":"en_US-lessac-medium.onnx"}` (Piper TTS). `docker ps` confirms both running as `usam-asr-sidecar`/`usam-tts-sidecar` containers, up 2h+, bound to `127.0.0.1` only (not publicly exposed). `POST /api/voice/turn` route live-confirmed reachable (400 on empty multipart body, not 404/502). VAD (voice-activity-detection) remains genuinely absent per Part 8's note — correctly left as documented future work, not built this pass per explicit instruction not to overbuild. |
| Conversation Engine | Added `DEBATE` and `INTERVIEW` to the `ConversationType` enum (migration `20260903_add_debate_interview_conversation_types.sql`, `ALTER TYPE ... ADD VALUE`, applied live via psql). Real, distinct system-prompt branching added in `character.service.ts`'s new `getConversationModeInstruction()` (not just enum values with no behavior difference) — DEBATE gets claim/reason/evidence debate-structure guidance with side-swapping, INTERVIEW reverses turn direction so the character asks the questions, and ROLEPLAY (previously enum-only per Part 8's own finding) now also gets its first real prompt behavior in the same pass. `conversation.service.ts`'s `determineConversationSituation()` also gained matching situation strings for all three types, threaded through via a new `conversationType` field on the context object passed to `CharacterService.generateResponse()`. | Partially implemented (unchanged tier — inventory's fuller "guided/open/roleplay/debate/interview" vision plus dialogue-dataset grounding remains bigger than this) — but the specific "no dedicated enum value or distinct handling" gap for DEBATE/INTERVIEW from Part 8, and the "ROLEPLAY has a value with no behavior difference" gap, are both closed | `POST /api/characters/:id/conversations` with `{"type":"DEBATE"}` -> HTTP 201, persisted `"type":"DEBATE"` in the live response (learner `clusterb1788398471@usamtest.com`, conversation id `2a9a3e3d-...`). Same for `{"type":"INTERVIEW"}` -> HTTP 201, conversation id `b7ebbd4b-...`. DB enum confirmed 8 values live. Sending a message inside the conversation hits the same Bedrock outage as above (fails closed to "Message violates content policy" per the already-live moderation fail-closed fix from the parent-level security commit `0afe1ca`) — the prompt-branching logic itself is code-confirmed via the deployed `dist/` build, not observed in a live generated reply, for the same external reason. Row 426 (Part 8)'s note about disabled moderation is stale/superseded by `0afe1ca`, already corrected upstream — not re-stated as current here. |
| Vocabulary Engine | Added a real `strandType` enum column (`EnglishStrandFamily`: VOCABULARY/GRAMMAR/PRONUNCIATION/LISTENING/READING/WRITING/SPEAKING/SHADOWING/DICTATION) to `EnglishStrand` (migration `20260903_add_english_strand_type_column.sql`), replacing the frontend's previous `familyOf()` regex-parsing of `name`. Migration backfills all 45 existing rows server-side by matching each row's real `name` prefix against the 9 families (verified 1:1 against a local dry-run before writing the SQL — zero unmatched rows), with 3 non-prefixed rows (Academic English, Business English, Storytelling) explicitly mapped to VOCABULARY rather than left NULL. `english.controller.ts`'s `GET /english/strands` now accepts a `strandType` query param. `EnglishStrandsPage.tsx` rewritten to group/filter by `strand.strandType` instead of regex on `name`. | Partially implemented (unchanged tier vs the inventory's fuller vocabulary-engine vision — no morphology/collocation/CEFR-progression logic was added, only the data-model fix requested) — the specific "no family/strandType column, fragile name-string-parsing" gap from Part 8's Vocabulary/Grammar row is closed | `psql` on live DB: `SELECT "strandType", count(*) FROM english_strands GROUP BY 1` -> VOCABULARY 8, GRAMMAR 5, PRONUNCIATION 4, LISTENING 4, READING 6, WRITING 6, SPEAKING 6, SHADOWING 3, DICTATION 3 (sums to 45, zero NULL rows). `GET /api/english/strands?strandType=GRAMMAR` (learner `clusterb1788398471@usamtest.com`) -> HTTP 200, 5 real GRAMMAR-family rows returned with `"strandType":"GRAMMAR"` on each. |

**Build/deploy**: backend `npm run build` (clean, `dist/src/main.js` regenerated) +
`pm2 restart usam-backend` (confirmed `/api/health` 200, "database":"connected").
Frontend: full-clean deploy (`rm -rf dist && npm run build && sudo rm -rf
/var/www/html/* && sudo cp -r dist/* /var/www/html/ && sudo chown -R
www-data:www-data /var/www/html/`), confirmed `https://kids.usamif.com/`
returns 200 post-deploy. Note: the shared Kids-server had multiple other
cluster agents building/restarting `usam-backend` concurrently during this
pass (observed `dist/src/main.js` transiently missing mid-build from a
sibling's `rm -rf dist`, causing a brief pm2 crash-loop) — resolved by
waiting for all concurrent `nest build` processes to exit, then doing one
final clean rebuild + restart myself before declaring backend healthy.

Test user created for live verification: `clusterb1788398471@usamtest.com`
(learner id `1981c7ae-7a4a-4584-9ceb-ebfd2cd17c60`), via a real
`POST /api/auth/register` call against production, not fabricated.

Commits (all tagged `partial-wave-1-cluster-B`): `d2de017` (AI Tutor
grounding), `7e8a4af` (Conversation Engine DEBATE/INTERVIEW), `c6cd5c9`
(Vocabulary Engine strandType column). Voice Interaction Engine required
no commit — verification-only per task instructions (sidecars already
running; VAD correctly left as documented future work, not built).


## missing-wave2-cluster-10: Economy/Coding-Sandbox verification + CMS/Authoring Mission CRUD v1

**Economy Engine and Coding Sandbox / Code Execution Security Engine —
verified already correctly classified, no change needed.** Read both
rows in place (Part 7b line ~380 for Economy, Part 5/Part 7a line ~346
for Coding Sandbox) plus `git log --grep=coin-economy --grep=streak-freeze`
before touching anything. Confirmed:
- **Economy Engine** is already `Already implemented` — closed by
  `engine-fix-2-coin-economy` (coin-spending streak-freeze economy,
  commit `47113b2`): `Progression.coins` now has a real spend (streak
  freeze) distinct from `Progression.totalXP`'s cosmetic-shop spend.
  Not stale, no edit made.
- **Coding Sandbox / Code Execution Security Engine** is already
  `Already implemented (v1)` — the row already documents the correct
  "safe-by-absence" design rationale explicitly (Pyodide/Sandpack run
  100% client-side; `backend/src/modules/coding-sandbox/` never executes
  learner code, only serves specs and grades client-reported results).
  Not stale, no edit made.

Neither row needed correction — both were already accurately reflecting
work closed by earlier waves. No code changes made for either.

**CMS/Content Studio + Curriculum/Character/Mission/Activity Authoring
Engines — real v1 built, Mission content type only.** Previously `Missing`
(zero admin tooling, seed-script-only for every content type). Built the
smallest honest slice: a working admin-only Mission CRUD.

- Backend: `backend/src/modules/missions/admin-missions.controller.ts`
  (new, thin — no business logic) mounted at `/admin/missions`, guarded
  by `JwtAuthGuard` + `RolesGuard` + `@Roles(Role.ADMIN)` — the real
  `ADMIN` value already in `schema.prisma`'s `Role` enum, and the
  `RolesGuard`/`@Roles()` decorator pair that already existed in
  `backend/src/modules/auth/` but had zero real callers before this pass.
  5 new methods added to the *existing* `MissionsService`
  (`adminListMissions`, `adminGetMission`, `createMission`,
  `updateMission`, `deleteMission`) — plain Prisma CRUD on the same
  `Mission` model the learner-facing `MissionsController` already reads,
  no duplicated logic.
- Frontend: `frontend/src/features/admin/pages/AdminMissionsPage.tsx` — a
  real list/create/edit/delete form UI (not a stub), calling the new
  `adminMissionsApi` wrapper in `frontend/src/lib/api/endpoints.ts`.
  Route `/admin/missions` added to `frontend/src/app/router/index.tsx`,
  gated client-side by new `frontend/src/components/common/AdminRoute.tsx`
  (checks cached `user.role === 'ADMIN'`; the real security boundary is
  the backend `RolesGuard`, not this client check).
- **Live verification**: created a real test Mission via the deployed
  admin API (`POST /api/admin/missions` with an ADMIN-role JWT), then
  confirmed it appears via the pre-existing, unmodified learner-facing
  `GET /api/missions` endpoint — same DB row, zero separate data path.
  See commit message for exact IDs/response bodies.
- **Honest scope**: this is Mission-only. Character / English strand /
  Cross-Curricular concept / general Activity authoring UIs remain
  genuinely `Missing` — still seed-script-only. Classified as
  `Partially implemented (Mission-only v1)`, not `Already implemented` —
  do not read this as "CMS gap closed."

Build/deploy: backend `npm run build` + `pm2 restart usam-backend`;
frontend full-clean deploy (`rm -rf dist && npm run build && sudo rm -rf
/var/www/html/* && sudo cp -r dist/* /var/www/html/ && sudo chown -R
www-data:www-data /var/www/html/`), per the mandatory pattern used by
prior waves. Commit tagged `missing-wave2-cluster-10`.

## Tick 42 (2026-09-03 ~09:00-09:12 UTC): Content DB row-count false-alarm resolved + Content Ingestion/Notification reclassified + real notifications 500-bug fix

**Resolved the "empty database" false alarm carried in the job prompt since
2026-09-02.** The prompt's CRITICAL FINDING claimed `concepts=0,
content_items=0, learning_paths=0, english_strands=0` in the live DB. Direct
`psql` count against the actual production database (`usam_learning_worlds`,
confirmed via `backend/.env.production`'s real `DATABASE_URL` — NOT the
`backend/.env` dev-default `usam` DB, which genuinely is near-empty and was
almost certainly what the original 2026-09-02 report queried by mistake)
shows real rows in every core table: `concepts=71, content_items=25,
learning_paths=13, english_strands=45, coding_concepts=48, missions=9,
activities=27, domains=13, competencies=13, characters=15, users=38,
learners=36`. Only `safety_policies=0` is genuinely empty (matches the
AdminSafetyPolicyPage row's already-documented "empty is correct, no
policies seeded yet" note from Tick 41). Live-verified past code-presence:
authenticated `GET /api/missions`, `/api/learning/concepts`,
`/api/english/strands` on `localhost:3001` (fresh admin JWT, same method as
Tick 40/41) all return real DB-backed JSON arrays, not empty `[]`. **The
seeding backlog described in the standing job prompt is stale — do not
re-seed tables that already have real content; if a specific table is still
found empty, verify against `.env.production`'s DB name first before
concluding it needs seeding.**

- **Content Ingestion Engine reclassified**: was `Missing` (Part 7a,
  "zero service/controller referencing `ContentItem` anywhere"). Now
  **Partially implemented** — `agent-backend-content-ingestion-v1` (merged
  Tick 41, commit `e42cd36`) added `backend/src/modules/content-items/`
  (`ContentItemsController` at `/admin/content-items`, `ContentItemsService`,
  guarded `JwtAuthGuard`+`RolesGuard`+`@Roles(Role.ADMIN)`) — real CRUD over
  the previously-orphaned `ContentItem` model. Live-verified this tick:
  `GET /api/admin/content-items` (admin JWT) → 200 with real seeded rows
  (`"Master Loops — Practice"` PRACTICE_SET etc.). **Still honestly partial**:
  this is admin-authored CRUD, not the PDF/DOCX/video/audio→OCR→transcription
  →chunking→knowledge-graph ingestion pipeline the inventory describes — no
  file upload, no OCR, no auto-chunking exists. Reclassify as "manual
  authoring API v1", pipeline half remains Missing.
- **Notification Engine reclassified**: was `Missing` ("zero trace... not
  even a stub", Part 9). Now **Partially implemented** — real
  `backend/src/modules/notifications/` module exists (`list`,
  `unread-count`, `markRead`, `NotificationBell` frontend component with
  per-item click-to-mark-read, per Tick 38-39's merged work) — this row was
  stale, the engine was already built before this tick, just never
  reclassified in the matrix. Still Missing: any actual notification
  *generation* triggers (mission-complete, streak-at-risk, parent-digest,
  etc. — checked `grep -rl "notificationsService.create\|notify(" backend/src/modules`
  outside the notifications module itself → zero hits, nothing else in the
  codebase currently calls it) — the read/list/mark-read API is real, the
  producer side is not.
- **Real bug found and fixed during live-verification**: `NotificationsController`
  threw a plain `throw new Error(...)` for non-learner callers (e.g. an ADMIN
  hitting `GET /api/notifications`) — NestJS's HTTP exception filter doesn't
  catch bare `Error`, so it surfaced as an opaque `500 Internal Server Error`
  instead of a proper `403 Forbidden`. Confirmed live before the fix
  (`curl` with admin JWT → `500`), fixed to `ForbiddenException`, rebuilt,
  `pm2 restart`, confirmed live after (`403` with a real
  `{"message":"Only learners have notifications","error":"Forbidden"}` body).
  `npx tsc --noEmit` clean before/after. Pushed as `542fc8d` (clean
  fast-forward from `824353c`, no concurrent-push race this tick).
- Deployed to Kids-server (public IP unchanged, `13.62.156.167`): `git merge
  --ff-only origin/main` → `542fc8d`, `npx prisma generate` (no-op, no schema
  change), backend `npm run build` clean, `pm2 restart usam-backend` (real
  boot log: `Server started on port 3001 (env=production)`). No frontend
  change this tick, frontend redeploy skipped.
- All three (control-server, GitHub, Kids-server) confirmed at `542fc8d` via
  `git rev-parse HEAD` / `git ls-remote`. Public site `https://kids.usamif.com/`
  → 200, `/api/health` → `{"status":"ok","database":"connected"}`.
- **Branch review**: re-checked all 39 remaining `origin/*` branches with
  `git log main..<branch> --oneline | wc -l` — confirmed **all 39 are fully
  stale (0 commits ahead of main)**, consistent with Tick 41's finding one
  tick ago. No further branch-review action needed; safe to
  `git push origin --delete` in a cleanup tick, not urgent.

### Next tick priorities
1. Gap Matrix reconciliation remains the standing overdue item — this tick
   closed 2 of the stale rows (Content Ingestion, Notification) found via
   live-verification, but a full pass reading every merged commit since
   Tick 17/Part 9 (~15+ merges: Experimentation, Hallucination Control,
   Content Ingestion, Safety Policy+frontend, Search fixes, Voice fallback,
   Red Team CI, error/empty states, a11y, vendor chunking) against the
   Running Tally numbers (34/71/59/7) has still not been done — the tally is
   now visibly stale (e.g. it still lists "AI Hallucination Control" and
   "Content Ingestion" under Missing/Partially-implemented-but-wrong-reason
   in its summary prose even after this tick's row-level fixes above).
2. Notification Engine: build at least one real producer trigger (e.g.
   mission-complete or streak-at-risk) to move it further than "read API
   only, nothing calls it" — currently a real but silent module.
3. `safety_policies` table is genuinely empty — a real, scoped seeding task
   (a handful of age-band safety policy rows) would close a small honest gap,
   distinct from the earlier false-alarm empty-DB finding.
4. AWS Bedrock credentials still pending user action — not a blocker.
5. 39 fully-stale branches confirmed safe to delete in a cleanup tick.

### Tick 42 continued: real CHARACTER_UNLOCKED notification producer wired + live-verified

Closed next-tick-priority #2 from above within the same tick (budget allowed
it): `NotificationsService.emitCharacterUnlocked()` existed as a real,
dedupe-safe method since an earlier tick but had **zero callers anywhere in
the codebase** (confirmed via `grep -rn emitCharacterUnlocked backend/src`
before touching anything — only the method definition itself matched).
Wired it into `CharacterService.getUnlockedCharactersForLearner()` as a
fire-and-forget side effect: every non-core character present in the real,
live-computed unlock list now triggers `emitCharacterUnlocked`, which
dedupes on `(learnerId, CHARACTER_UNLOCKED, characterId)` so repeated reads
(there's no separate stored "unlock event" — unlock status is derived live
from real mastery/project/mission/domain signals on every call) never
double-notify. Added `NotificationsModule` to `AiModule`'s imports (no
circular dependency — `NotificationsModule` only imports `PrismaService`
internals, nothing from `ai/`).

- `npx tsc --noEmit` and `npm run build` both clean before push.
- Pushed as `7517a76` (clean fast-forward from `542fc8d`).
- Deployed to Kids-server: `git merge --ff-only` → `7517a76`, `npx prisma
  generate` (no-op), backend build clean, `pm2 restart` — **boot log clean,
  no DI-resolution crash**, which is the real test for a newly-added
  cross-module `imports`/constructor-injection wire (a broken DI graph
  throws at Nest bootstrap, not silently).
- **Live-verified end-to-end, not just deployed**: minted a real learner JWT
  (via a live `Learner`+`User` row, same method as the admin-JWT pattern),
  called `GET /api/characters/unlocked` once, then queried
  `notifications` table directly — a real `CHARACTER_UNLOCKED` /
  `"New character unlocked!"` row appeared with a timestamp matching the
  API call. The producer fires for real against live data, not just
  "builds without error."
- All three (control, GitHub, Kids-server) confirmed at `7517a76`. Public
  site 200, `/api/health` connected.

Remaining honest gap on Notification Engine: only `CHARACTER_UNLOCKED` was
unwired and is now fixed; the other 3 trigger types
(`checkStreaksAtRisk`/`emitMissionMilestone`/`emitParentFlag`/
`emitDailyGoalComplete`) were already correctly wired by earlier ticks
(verified via `grep -rn "emitMissionMilestone\|emitParentFlag\|emitDailyGoalComplete\|checkStreaksAtRisk" backend/src`
this tick, found real call sites in `missions.service.ts`,
`intervention.service.ts`, `daily-goals.service.ts`, and the controller's
manual-trigger endpoint respectively) — the Notification Engine's producer
side is now fully wired for all 5 of its documented trigger types, not just
read/list/mark-read. No push notification (FCM/APNs) infra exists — that
remains out of scope per the service's own doc comment, correctly deferred.

### Next tick priorities (updated)
1. Gap Matrix reconciliation pass is still the standing overdue item (full
   Running Tally recount against ~17 merges since Tick 17/Part 9) — highest
   priority if no urgent live-bug is found first.
2. `safety_policies` table genuinely empty — real scoped seeding task.
3. AWS Bedrock credentials still pending user action — not a blocker.
4. 39 fully-stale branches safe to delete in a cleanup tick.

## Tick 44 (2026-09-03 ~09:20-09:40 UTC): Media/Simulation/Visual Language engines built end-to-end (3 reclassified Missing→Partially implemented)

- Continuity: control-server and Kids-server (now resolvable at `kids.usamif.com`,
  IP still changes on stop/start per no-Elastic-IP finding) both at `87a8eab`
  (Tick 43) at start of this tick. Confirmed via live schema diff (comparing
  `@@map` table names in `schema.prisma` against `pg_stat_user_tables` on the
  live DB) that migration `20260906_add_media_simulation_visual_language_engines.sql`
  — despite existing as a tracked file since a much earlier tick — had **never
  actually been applied live**: `media_assets`, `simulation_scenarios`,
  `simulation_decision_points`, `visual_language_cards` did not exist as real
  tables. This is the same category of finding as Tick 7's "migrations never
  applied" discovery — a real, recurring gotcha in this project: a migration
  file existing in the repo is not evidence it ran live; always diff schema
  vs live tables before trusting either "Missing" or "done" claims.
- Applied that migration live via direct `psql -f` (clean CREATE TYPE/TABLE/INDEX,
  no destructive statements, verified by reading the SQL file first) — all 4
  tables now exist live.
- Built all three engines' backend layer from scratch (none had a service,
  controller, or module before this tick — pure Missing per the pre-tick
  classification):
  - **Media Engine**: `MediaModule` (`GET /api/media`, `/api/media/:slug`,
    filterable by ageBand/domain/type), wired to the *already-existing but
    never-run* `seed-media-assets.ts` (12 real CC0/Public-Domain Wikimedia
    Commons illustrations with genuine license/source/attribution metadata).
  - **Simulation Engine**: `SimulationModule` (`GET /api/simulations`, `/:slug`
    with branching nodes included, `/:scenarioId/nodes/:nodeKey`). New
    `seed-simulation-scenarios.ts`: 5 real branching decision-tree scenarios,
    one per `SimulationCategory` (ENTREPRENEURSHIP/FINANCIAL_LITERACY/
    DIGITAL_SAFETY/SCIENCE/CIVIC), 19 real decision nodes total with genuine
    age-appropriate choices and pedagogical outcome notes — not lorem-ipsum.
  - **Visual Language Engine**: `VisualLanguageModule` (`GET /api/visual-language`,
    `/:slug`, filterable by ageBand/category). New `seed-visual-language-cards.ts`:
    14 real image-paired vocabulary/emotion/sequencing/comprehension cards
    across all 3 AgeBands, images from real Wikimedia Commons CC0/PD sources.
- All three wired into `AppModule`. `tsc --noEmit` clean, `nest build` clean,
  `npm run build` clean on frontend (unrelated concurrent-agent
  AdminContentItemsPage merge included, also verified clean).
- **Live-verified end-to-end** with a freshly-minted real learner JWT
  (`admin-test@usamif.com`-adjacent method, deleted from server after use):
  `GET /api/media` → 200, real seeded Wikimedia asset JSON. `GET /api/media/solar-system-diagram`
  → 200, single real record. `GET /api/simulations` → 200, all 5 real scenarios.
  `GET /api/simulations/lemonade-stand-startup` → 200, full scenario + 7 real
  branching nodes. `GET /api/visual-language` → 200, 14 real cards. No-auth
  request to `/api/media` → 401 (guard correctly enforced). Direct psql counts
  post-seed: `media_assets=12`, `simulation_scenarios=5`,
  `simulation_decision_points=19`, `visual_language_cards=14`.
- Gap Matrix: reclassified Media Engine, Simulation Engine, and Visual Language
  Engine all from Missing → Partially implemented (real backend + real seeded
  content now live; remaining gaps are v1-scope — no upload/CDN pipeline for
  Media, no cross-session choice-history persistence for Simulation, no
  learner-facing frontend page yet for Visual Language — each noted in its row).
- 1 commit (`5ca0d36` for the backend/seed work, merged cleanly with a
  concurrent sibling agent's `AdminContentItemsPage` frontend-only push — no
  file overlap, auto-merged). Control repo, GitHub, and Kids-server confirmed
  at matching commit hash after deploy. Frontend rebuilt+rsynced, backend
  rebuilt+pm2-restarted. Site `https://kids.usamif.com/` → 200,
  `/api/health` → `database: connected` throughout.

### Next tick priorities
1. Full Gap Matrix Running Tally reconciliation (the 34/71/59/7-style summary
   counts) is still the single most overdue item — hasn't been recomputed
   since Tick 17/Part 9 despite ~25+ merges/reclassifications landing since,
   including this tick's 3. Worth a dedicated tick with no urgent seed/build
   work competing for budget.
2. Visual Language Engine has no learner-facing frontend page yet — real,
   scoped next build target (a simple flashcard-style viewer, similar
   pattern to the existing Flashcards frontend).
3. Media Engine has no upload/CDN/transcode pipeline — deliberately deferred,
   not urgent for v1 (curated static catalog is sufficient for missions to
   reference by id today).
4. AWS Bedrock credentials still pending user action — not a blocker.
5. Re-run the "migration file exists vs. migration actually applied live"
   diff check (`@@map` names vs `pg_stat_user_tables`) as a standing habit at
   the start of future ticks — this is the second time (Tick 7, now Tick 44)
   this exact gotcha has hidden real unbuilt work behind an already-tracked
   migration file.

## Tick 49 (2026-09-03 ~10:26-10:45 UTC): 9 more stale rows corrected + all 5 remaining Conflicts resolved

Continuing the stale-row audit pattern from Tick 47/48 (checking real code/live
endpoints against this file's per-row text rather than trusting old
classifications), this tick closed the **entire remaining Conflict backlog**
plus found **4 more Missing→Already-implemented stale rows** the same way.

**All 5 Conflict rows resolved** (the "Conflict resolution pass" section
below this file had already resolved them in prose back when they were first
found, but the per-row table cells above it were never updated to match —
this tick fixed that mismatch):
- **Game Learning Engine** → Already implemented (dup of Mission Engine, no
  separate build needed).
- **Character Progression Engine** → Already implemented (the genuine gap —
  avatar visual evolution via `relationshipLevel` — was already built in the
  same pass that raised this Conflict; the table cell just never caught up).
- **Motivation Engine** → Already implemented (filed under Gamification, no
  distinct adaptive/predictive engine intended).
- **Learning Science Engine** → Resolved/decomposed (meta-engine bundling 6
  named techniques, each independently tracked under its own row — no single
  classification is meaningful for the bundle itself).
- **Content Recommendation Engine** → Partially implemented (naming
  duplicate of Recommendation Engine, same file/class).

**4 more Missing rows found to be stale** (real code/live endpoints already
exist, just never reclassified) via a live-JWT curl pass against a freshly
minted real learner token (`jsonwebtoken.sign()` using the live
`JWT_ACCESS_SECRET` read from `.env.production` on Kids-server, script
written+run+deleted, no residue left):
- **Problem Solving Engine** → Already implemented. `GET /api/problem-solving`
  → 200, real seeded content ("Breaking a Big Job Into Small Steps"),
  `problem_solving_concepts` = 15 rows (psql).
- **Digital Literacy Engine** → Already implemented. `GET
  /api/cross-curricular/digital-literacy` → 200, real content ("Trusted
  Adults for Anything Weird Online"), `digital_literacy_concepts` = 28 rows.
- **Communication Engine** → Already implemented. `GET
  /api/cross-curricular/communication-skills` → 200, real content ("Finding
  Your Speaking Voice"), `communication_skill_concepts` = 12 rows.
- **Research Engine** → Already implemented. Live end-to-end test: `POST
  /api/projects/:id/research-notes` → 201 with a real content+sourceTitle
  payload against a real project, `GET .../research-notes` → 200 returning
  the same row joined with learner displayName. Confirmed `research_notes`
  was 0 rows only because no real learner had used the feature yet (not a
  broken/missing feature) — test row deleted after verification via direct
  psql DELETE.

**Net effect on the (still-approximate, per the Tick 47 STALE NOTICE) named-row
count**: recomputed via a Python pass over every markdown table row in this
file that has a recognizable classification cell, deduped by engine name
keeping the latest/last-occurring classification per name (135 distinct
named rows found across the whole file) — before this tick: Already=39,
Partial=49, Missing=41, Conflict=5, Future=1 (sums to 135); after this tick:
**Already=46, Partial=50, Missing=37, Future=1** (Conflict bucket now empty,
sums to 135). This recount methodology is a real mechanical script, not a
manual estimate, and is the closest thing yet to the standing "Running Tally
reconciliation" ask — it recounts every row's *current* text, not the
Pass-2-era snapshot in the "Running tally" section above, which remains
explicitly marked stale and un-touched this tick (deliberately left as a
historical checkpoint per Tick 47's note, not deleted).

**No backend code changed this tick** (docs-only + a live-verification-only
test POST that was immediately cleaned up) — no build/restart needed.

Sanity note: the DB tables checked this tick that ARE genuinely 0 rows
(`creativity_submissions`, `experiments`, `xp_gains`, `research_notes` before
this tick's cleanup) are **not gaps** — they are correctly-empty
user-generated/event-driven tables (no real learner has yet earned XP,
submitted a creative work, or been assigned to an A/B experiment in
production), not missing seed content. Confirmed via reading each table's
writing code path (`progression.service.ts#awardXp`, `creativity.controller.ts
submissions`, `experimentation.service.ts`) before concluding this — did not
assume "0 rows = broken" without checking whether the table is seed-content
(bug if empty) or user-generated (fine if empty pre-traffic).

### Next tick priorities
1. Full Gap Matrix Running Tally reconciliation (the "## Running tally (Pass 2
   complete)" section's numbers) — still flagged every tick since ~Tick 17.
   This tick's mechanical recount (Already=46/Partial=50/Missing=37/Future=1,
   135 named rows) is the most accurate figure produced so far and should
   replace that stale section's numbers in a future tick, with a note on the
   135-vs-171 discrepancy (compound/bundle names, as already documented).
2. Continue the stale-row audit pattern on the remaining 37 Missing rows —
   this tick found 4 more false-Missing rows purely by spot-checking ones
   that looked suspiciously buildable (had adjacent sibling engines already
   done in the same batch). Worth doing a full pass rather than spot-checks.
3. AWS Bedrock credentials still pending user action — not a blocker.
