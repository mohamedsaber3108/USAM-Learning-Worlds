# 68 — Domain Completion Matrix (Phase E)

> Tightened Phase-E definition: a domain is COMPLETE only when the full learner
> flow is verified end-to-end — not when its landing/browse page looks good.
> This matrix tracks each domain against the 15 completion criteria and records
> the BLUNT truth about what is wired vs. catalog-only vs. missing.
>
> Evidence: context-gatherer trace 2026-09-28 (English), plus prior audits.
> Legend: ✅ real+wired · 🟡 partial/entry-only · ⛔ blocked (needs owner/creds) ·
> ❌ missing (no backend capability) · N/A.

Last updated: 2026-09-28 · HEAD `312be65`

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
parent/recommendation surfaces, and generalize `/english/path` → `/domains/:slug/path`.

---

## CODING — status: 🟡 ENTRY + SANDBOX exist; flow partially real via Missions
| # | Criterion | State | Evidence |
| --- | --- | --- | --- |
| 1 | Entry | ✅ | `CodingPage` /coding (E2, pushed 312be65): real CodingConcept progression |
| 2 | Learning flow | 🟡 | Concept catalog → mission entry. Concepts are catalog (like English) but coding **does** have a runnable path via Missions (below). |
| 3 | Practice | ✅ | Coding runs through the **Mission player** (`CodeMissionRunner`: Pyodide/Sandpack/Blockly) — real in-browser execution + grading (`/coding-sandbox/submissions`). |
| 4 | Assessment | ✅ | Mission activity evaluation + coding-sandbox grading. |
| 5 | Mastery | ✅ | Mission submit → `recordEvidence` (via missions.service). |
| 6 | Recommendation | 🟡 | Generic adaptive recommendations include missions. |
| 7 | Evidence | ✅ | Via mission mastery + credentials. |
| 8 | Character | ✅ | Codey coach panel in the mission runner (`CodingCoachPanel`, ⛔ AI runtime Bedrock). |
| 9 | Voice | N/A | not core to coding |
| 10 | Parent/progress | 🟡 | Via generic mastery/portfolio, not coding-specific |
| 11–13 | Responsive/RTL/a11y | ✅ | E2 |
| 14 | Tests | ✅ | CodingPage (3) + teaching/mission tests |
| 15 | Deploy verified | 🟡 | /coding pushed, awaiting deploy |

**Gap:** the /coding concept catalog isn't linked to specific coding missions
(same catalog-island issue as English, but coding is rescued by the generic
Mission engine already running real coding activities). Verifying the
concept→mission link is the remaining coding work.

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
