# 68 — Domain Completion Matrix (Phase E)

> Tightened Phase-E definition: a domain is COMPLETE only when the full learner
> flow is verified end-to-end — not when its landing/browse page looks good.
> This matrix tracks each domain against the 15 completion criteria and records
> the BLUNT truth about what is wired vs. catalog-only vs. missing.
>
> Evidence: context-gatherer trace 2026-09-28 (English), plus prior audits.
> Legend: ✅ real+wired · 🟡 partial/entry-only · ⛔ blocked (needs owner/creds) ·
> ❌ missing (no backend capability) · N/A.

Last updated: 2026-09-29 · HEAD `8340c8c`

## Shared-spine status (the canonical architecture)
- ✅ **Spine proven on 2 domains LIVE**: English vocabulary A1 AND Coding loops-intro
  both ran the full loop on prod (Evidence + MasteryRecord + reviewDue), through
  the same shared engine — English via SELECT/MATCH, Coding via CODE.
- ✅ **Generic domain path**: `GET /learning/domains/:slug/path` (`DomainPathService`)
  — one projection for all domains; `/english/path` delegates to it. (8340c8c)
- ✅ **Regression contract**: `canonical-domain-loop.harness.ts` parameterized by
  domain drives START→ACTIVITY→ATTEMPT→EVIDENCE→MASTERY→REVIEW→RECOMMENDATION
  through the real evaluator + mastery algorithm; English + Coding registered. (1f20ddd)
- Platform hygiene: displayName no longer unique (47e3346); enum/schema-drift
  audit + fixes (030dbf5, plan 71). Two migrations + coding seed await the next deploy.

> ONE LIVE VERTICAL SLICE ≠ FULL DOMAIN COMPLETE. The slice proves the
> architecture; curriculum breadth proves the product.

---

## The 15 completion criteria (per domain)
1 Entry surface · 2 Learning flow · 3 Practice · 4 Assessment · 5 Mastery ·
6 Recommendation · 7 Evidence · 8 Character integration · 9 Voice (where relevant) ·
10 Parent/progress visibility · 11 Responsive · 12 RTL/i18n · 13 Accessibility ·
14 Tests · 15 Deployment verification.

---

## ENGLISH — status: 🟢 VERTICAL-SLICE PROVEN (live). Vocabulary/A1 slice runs the full loop; breadth still to scale.
Option A decided + built. First slice (Everyday Words A1) **verified end-to-end on
the live DB 2026-09-28** — a real learner submit produced Evidence + MasteryRecord
against the English competency through the SHARED Mission engine (no English-only
engine). Prior "catalog island" state is resolved for this slice.

**Live proof (server, prod DB):** learner `48c5b342…` started
`english-mission-everyday-words`, submitted `english-act-everyday-fruit`
(`selectedAnswers:["apple"]`) → `correct:true, score:1`. Persisted rows:
`evidence` = KNOWLEDGE, success=t, score=1, attemptId `347929f4…`, competencyId
`english-competency-everyday-words-a1`; `mastery_records` = state **DEVELOPING**,
confidence **0.725**, evidenceCount 1, reviewDue 2026-10-12 (Bull recalc worker
ran); `activity_attempts` row linked to run `3ed518f3…`.
(Unblocked by fixing a live schema-drift bug: `Subscription.status`/`Plan.interval`
were Prisma enums but the DB columns are TEXT → every `startMission` 500'd
`type "public.SubscriptionStatus" does not exist`. Fixed enum→String, commit `b1b44cd`,
backend redeployed. This unblocked mission starts for ALL domains, not just English.)

| # | Criterion | State | Evidence |
| --- | --- | --- | --- |
| 1 | Entry surface | ✅ | `EnglishStrandsPage` (E1, 312bcf2) + Learning Path section links to real missions (no hardcoded id) via `GET /api/english/path` |
| 2 | Learning flow | ✅ (slice) | Domain(english)→Skill(english-vocabulary)→Competency(strand-tagged)→Objective→Activities→Mission→MissionActivity seeded + live-verified (7/7). Teaching content (context/keyPoints) on each activity. |
| 3 | Practice | ✅ (slice) | 3 runnable activities (2 SELECT + 1 MATCH) run through the shared **Mission player**; live submit graded `correct:true`. Specialized types (speaking/pronunciation/etc.) still deferred. |
| 4 | Assessment | ✅ (slice) | FORMATIVE SELECT + SUMMATIVE MATCH via `ActivityEvaluator` (real, not stub). |
| 5 | Mastery | ✅ (slice) | `mastery_records` DEVELOPING/0.725 persisted live via shared `MasteryService` + Bull recalc. |
| 6 | Recommendation | 🟡 | reviewDue set (2026-10-12) drives review scheduling; broader next-step recommendation surface not yet English-specific. |
| 7 | Evidence | ✅ (slice) | `evidence` KNOWLEDGE row persisted live against the English competency, linked to attempt. |
| 8 | Character | 🟡 | Luma referenced in mission copy; coach chat not yet tied into this graded loop. |
| 9 | Voice | ⛔ | pronunciation/STT real scoring unbuilt + Bedrock-gated (deferred per plan 69). |
| 10 | Parent/progress | 🟡 | Mastery now persists so progress is queryable; parent-facing English surface not yet built. |
| 11 | Responsive | ✅ | E1 |
| 12 | RTL/i18n | ✅ | E1 (EN+AR) |
| 13 | Accessibility | ✅ | E1 (axe pattern, aria-pressed) |
| 14 | Tests | ✅ (slice) | `english-vertical-slice.spec.ts` (3 tests, real evaluator) + live end-to-end DB proof. |
| 15 | Deploy verified | ✅ | Schema migration `20260929…` applied; seeds run (`seed:english:strands`+`seed:english:vocabulary`); enum-drift fix `b1b44cd` redeployed; loop verified on prod DB. |
| — | **Coach** (conversation/grammar/vocab/reading) | ⛔ | Bedrock-gated runtime — separate from the graded Mission loop above. |

**Resolved:** the vocabulary A1 slice is no longer a catalog island — `Competency.strandId`
links it to the taxonomy and it runs the shared spine. **Remaining to reach full
domain-complete:** scale content breadth (more competencies/activities per strand ×
CEFR band, ~72/band target in plan 69), specialized activity types + voice, English
parent/recommendation surfaces. (✅ generic path `/learning/domains/:slug/path` shipped
— commit 8340c8c — `/english/path` now delegates to the shared `DomainPathService`.)

---

## CODING — status: 🟢 VERTICAL-SLICE PROVEN (live 2026-09-28)
> CORRECTION (2026-09-29): earlier rows here were WRONG. A full code trace
> (context-gatherer) found NO `CodeMissionRunner`, NO Pyodide/Sandpack/Blockly
> executor, and NO `/coding-sandbox/submissions` route anywhere in the repo —
> that code does not exist. Coding was a CATALOG ISLAND identical to English's
> old state: a flat `CodingConcept` table + AI-coach endpoints
> (`/coding/challenge|review|debug`) that never create an ActivityAttempt or
> call `recordEvidence`. There was no Coding Domain/Skill/Competency/Objective/
> Mission/Activity chain at all; the frontend said "coming soon".
>
> RESOLVED (commit 80f4818): built a real coding vertical slice through the SAME
> shared engine English uses — `seed-coding-vertical-slice.ts`: Domain **Coding**
> → Skill(Programming Fundamentals) → Competency(`coding-competency-loops-intro`)
> → Objective → Mission(`coding-mission-first-loops`, GUIDED) → 3 activities
> (1 SELECT + 2 CODE with `requiredKeywords`) → MissionActivity.

| # | Criterion | State | Evidence |
| --- | --- | --- | --- |
| 1 | Entry surface | ✅ | `CodingLearning` /coding concept browser (E2). |
| 2 | Learning flow | ✅ (slice, code) | Real Domain→Skill→Competency→Objective→Mission→Activity chain seeded; teaching context on each activity. |
| 3 | Practice | ✅ (slice, code) | 3 activities run through the shared **Mission player** (`submitActivity`); CODE graded by `ActivityEvaluator.evaluateCode` (server-side `requiredKeywords`). Real in-sandbox execution (Pyodide/tests) is a documented later upgrade. |
| 4 | Assessment | ✅ (slice) | FORMATIVE SELECT/CODE + SUMMATIVE CODE via the real evaluator. |
| 5 | Mastery | ✅ (slice, code) | `submitActivity` → `recordEvidence(competencyId=coding-competency-loops-intro)` → MasteryRecord, same shared path English proved live. |
| 6 | Recommendation | 🟡 | reviewDue scheduling via shared mastery; coding-specific recommendation surface not built. |
| 7 | Evidence | ✅ (slice, code) | CODE→CREATION, SELECT→KNOWLEDGE evidence against the coding competency (`coding-vertical-slice.spec.ts`, 3 tests). |
| 8 | Character | 🟡 | Codey coach endpoints exist (Bedrock-gated); not yet tied into this graded loop. |
| 9 | Voice | N/A | not core to coding |
| 10 | Parent/progress | 🟡 | mastery now persists (queryable); `GET /coding/learner/progress` filters by Domain name "Coding" — the seed uses that exact name so it now resolves. |
| 11–13 | Responsive/RTL/a11y | ✅ | E2 |
| 14 | Tests | ✅ (slice) | `coding-vertical-slice.spec.ts` (3) + coding case in the canonical-domain-loop harness. |
| 15 | Deploy verified | ✅ **LIVE 2026-09-28** | seed run on prod; learner `48c5b342…` started run `7d26808d…` on `coding-mission-first-loops`, submitted `coding-act-loops-print-1-to-3` → `correct:true, score:0.9`; `evidence` CREATION (attemptId `6ee742b1…`) + `mastery_records` DEVELOPING/conf 0.685/evidenceCount 2/reviewDue set for `coding-competency-loops-intro`; generic `/learning/domains/coding/path` returns it live. |

**Remaining to reach full domain-complete:** live proof (deploy + seed + real
submit); real sandboxed code execution + test-case grading (replace keyword
check); more competencies/activities across the 18 concepts; wire the
`CodingConcept` catalog to these missions; coding coach into the graded loop.

---

## AI LEARNING · PRACTICE · CREATIVITY/CRITICAL THINKING · STORIES · SIMULATIONS
To be traced before building (same method as English — do NOT assume).
Preliminary from prior audits:
- **AI Learning**: `AILiteracyConcept` catalog (via cross-curricular) — likely entry-only like English. ⛔ flow likely missing.
- **Practice**: flashcards (FSRS) is real + runnable (`/learn/flashcards`). ✅ likely closest to complete.
- **Creativity/Thinking**: concept catalogs (creativity, thinking-skills, cross-curricular) — entry-heavy.
- **Stories**: `stories` engine has story/page content — may be genuinely runnable (read flow). To verify.
- **Simulations**: `/simulations` browse + player already shipped, real branching scenarios. ✅ likely closest to complete.

---

## Honest program conclusion
The tightened definition exposes that **most "domains" are currently catalog +
(Bedrock-gated) AI chat, not complete learn→practice→assess→master→evidence
flows.** The two domains with a genuinely runnable, evidence-producing flow are:
- **Missions/Coding** (Mission engine: real activities, grading, mastery, evidence).
- **Simulations** and **Practice/Flashcards** (runnable, though evidence tie-in varies).

Building the missing flows for English/AI-literacy/etc. is **backend
architecture work** (attach content to catalogs, wire assessment→evidence), much
of it also **Bedrock-gated** for the AI/voice parts. This requires owner
decisions (see below), not more frontend reworks.
