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

## Part 4 — Not yet classified

Remaining ~156 engines from the full inventory list (Content Pipeline,
World/Game/Creative, Analytics/Observability overlap with existing DevOps
skills, CMS/Authoring, etc.) — deferred to subsequent ticks per the
inventory's own priority order (15 must-not-forget first). Will be added
incrementally; this file is committed and updated each tick that touches
it, not written once and abandoned.
