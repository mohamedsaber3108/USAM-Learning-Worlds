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

## Part 2 — Reconciliation with existing planning docs

- `USAM_GAP_REGISTER.md`, `USAM_IMPLEMENTATION_ROADMAP.md`,
  `FINAL_BACKEND_ROADMAP.md`, `ROADMAP_VISUAL.md` — **not yet
  cross-referenced line-by-line against this matrix.** These docs predate
  the 171-engine inventory and use different terminology/phase numbering.
  Next tick: read each, map their items onto the engine numbers above (or
  onto the ~156 not-yet-covered engines), and flag genuine
  contradictions (e.g. a roadmap doc claiming something is "done" that
  this code-read shows as Partially implemented) rather than silently
  picking one source as authoritative.

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
