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
| 2 | Knowledge Graph Engine | `Concept`, `ConceptPrerequisite`, `CompetencyPrerequisite` tables; `learning/services/concept.service.ts` (296 lines) — prerequisite chain traversal, DFS cycle detection on add, unlock-status computation against real MasteryRecord state, `LearningController` REST endpoints (`GET /api/learning/concepts/:id/prerequisites`, `/unlock-status`, `POST .../prerequisites`, etc.) | **CORRECTION (Tick 3): Already implemented (v1), not Missing as stated in Tick 2.** Tick 2's classification was wrong — it read the schema and searched by name but missed `concept.service.ts`, which is a real, working traversal service (BFS/DFS chain walk, cycle prevention, mastery-gated unlock checks). **However, it was 100% unreachable in production until Tick 3**: `LearningController` was decorated `@Controller('api/learning')` on top of the global `api` prefix, producing the live route `/api/api/learning/...` while the frontend called `/api/learning/...` — a pure routing bug, fixed and deployed this tick (see Tick 3 log). Remaining real gaps: no `CompetencyPrerequisite` traversal endpoint (only `Concept`-level), no shortest-unlock-path query, no cross-competency graph view. |
| 3 | Curriculum Engine | `Domain -> Skill -> Competency -> LearningObjective -> Activity` chain fully modeled in Prisma; `missions.service.ts` sequences activities | Partially implemented | Data model matches the inventory's exact intended hierarchy (Domain→Competency→Skill→Concept→Objective→Activity→Practice→Project→Assessment→Mastery) reasonably well, but Project and Assessment stages are only loosely connected to it (see rows 8, 13). |
| 4 | Mastery Engine | `mastery.service.ts` + `mastery-confidence.algorithm.ts` + `MasteryRecord`/`Evidence` tables. Evidence-weighted confidence recalculation, review-due (`getReviewDue`), learning goals | Already implemented (v1) | Real, working mastery tracking. NOT swappable/pluggable BKT/DKT/IRT models as the inventory envisions — one hardcoded confidence algorithm. Classify the "swappable model" ambition as Future; today's single-algorithm version is solid v1. |
| 5 | Adaptive Learning Engine | `adaptive/` module: `zpd-calculator.service.ts` (ZPD), `recommendation.service.ts` | Partially implemented | ZPD calculation is real and used. Adaptive *sequencing* (what to serve next, difficulty ramp) exists in recommendation.service.ts but is basic (see row 6) — no full adaptive-loop (assess→adjust→re-assess) orchestration layer yet. |
| 6 | Recommendation Engine | `adaptive/recommendation.service.ts`, 290 lines | Partially implemented | Rule/heuristic-based recommendation (mastery gaps, streaks, ZPD) — no ML/collaborative-filtering layer, which is appropriate for current scale. Fine as-is for now; flag as Needs refactor only if personalization quality becomes a real complaint. |
| 7 | Content Intelligence Engine | `learning/content-adaptation.service.ts`, `ContentItem`/`AgeVariant` Prisma models (raw content -> age-variant adaptation) | Partially implemented | Age-variant adaptation exists; no ingestion pipeline (PDF/video/OCR -> structured content) and no human-approval workflow layer — those pieces are Missing. |
| 8 | Assessment Engine | `ActivityAttempt`, `activity-evaluator.ts`, `Rubric`/`RubricCriterion` tables | Partially implemented | Activity-level evaluation and rubrics exist. No distinct "diagnostic vs formative vs summative" typing, no adaptive-difficulty test engine, no auto Bloom-level review (Assessment Quality Engine from inventory) — that layer is Missing. |
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
| CONF-001 Two frontends | "Backend must serve both; src/ is design authority" | **Superseded by Tick 1 decision: `src/` is the ONLY deployed/served frontend (confirmed via nginx root + built asset inspection). `frontend/` is not live and not actively served — register's "serve both" framing is outdated; documented decision stands.** |
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

No external library/dataset from the inventory's candidate list has been
adopted into the codebase yet. This section stays empty until something is
actually merged — per the task's own rule, every adoption gets an entry
here BEFORE merge, no exceptions. First real candidates likely to come up
soon based on Part 1 gaps: Pyodide/WebContainers (Project/Sandbox execution,
Tier B), Whisper or similar (Voice Engine ASR, Tier B/C), LanguageTool
(English grammar, Tier A candidate — LGPL, needs commercial-use
verification before adoption).

| Library/Dataset | Source | License | Commercial use OK? | Redistribution OK? | Status |
|---|---|---|---|---|---|
| _(none adopted yet)_ | | | | | |

## Part 4 — Batch 2: Projects/Coding, Community/Safety, Gamification/World

Read directly from `backend/src/modules/*` on 2026-09-02 (Tick 6), not
guessed from names.

| Engine (inventory) | Classification | Evidence |
|---|---|---|
| Project-Based Learning Engine | Partially implemented | `modules/projects/projects.service.ts` — real CRUD (create/get/update), `visibility` (PRIVATE/etc.) enforcement, Prisma `Project` model. No Idea->Plan->Build->Test->Improve->Present->Reflect stage machine yet — just a flat project record. |
| Coding Learning Engine | Missing (stubbed, honestly) | `modules/learning/coding.controller.ts` is a literal empty class with comment "TEMPORARILY DISABLED — API signature mismatches need fixing." Still imported and listed in `learning.module.ts`'s imports but NOT in that module's `controllers:` array — so it registers zero routes, no dead-code risk, just inert. `coding-coach.service.ts` (under `ai/services/`) exists separately and may have real logic — not yet read in detail; check next tick before assuming Coding Learning Engine is 0%. |
| Coding Sandbox / Code Execution Security Engine | Missing | No Pyodide/Piston/Judge0/WebContainers integration found anywhere in backend/src. Matches inventory's explicit warning to NEVER run child code directly on backend — currently there is no code-execution surface at all, which is safe-by-absence but means the feature doesn't exist. |
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
