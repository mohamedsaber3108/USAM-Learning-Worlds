# 69 — English Domain Reconstruction (Option A: plug into the canonical spine)

> Decision: **Option A is canonical.** English plugs into the shared Learning
> Spine — it does NOT get its own attempts/evidence/assessment/mastery/review
> engine. `EnglishStrand` becomes taxonomy metadata mapped onto `Competency`.
> Option C is the temporary UX label only.

Last updated: 2026-09-28 · HEAD `23117ed`

---

## 0. The canonical spine (verified in schema.prisma — reuse, do not duplicate)
```
Domain → Skill → Competency → {Concept, LearningObjective} → Activity
  → MissionActivity → Mission → MissionRun → ActivityAttempt
  → Evidence → MasteryRecord → (reviewDue / FSRS) → Recommendation → Project → Portfolio
```
Confirmed generic + already runnable end-to-end (Coding uses it: coding missions
= Missions of Activities under Objectives under Competencies; submit →
`recordEvidence` → MasteryRecord). English will do exactly the same.

## 1. Taxonomy model — VALIDATED against the real seed data (2026-09-28)

Evidence from `seed-english-strands.ts`: strand rows are **(family × CEFR)
curriculum units** — "Reading Comprehension" (A1), "Fluency Development" (A2),
"Business English" (B2). So:

- **A. What is an EnglishStrand?** A **CEFR-specific curriculum grouping**
  (family via `strandType` enum × level via its own `cefrLevel` column). It is
  NOT just a broad family, and NOT a competency.
- **C. Where does CEFR live?** **On `EnglishStrand` (already there).** A
  competency derives its CEFR from its strand. → **DECISION: do NOT add
  `cefrLevel` to `Competency`** (that would duplicate the source of truth).
  Dropped from the migration.
- **B. Many-to-many strand↔competency?** Atomic competencies (e.g. "Everyday
  words") have ONE primary strand. Genuinely cross-strand competencies (e.g.
  "Have a short everyday conversation" → Speaking+Listening+Vocab+Grammar) will
  exist in the full curriculum. **DECISION: `Competency.strandId` (single
  optional FK) = the competency's PRIMARY/home strand now.** It covers all
  atomic competencies + the first slice. When cross-strand competencies are
  authored, add a `CompetencyStrand` join for the "also-touches" links —
  purely ADDITIVE (strandId stays as "primary"), no rework. We do NOT add the
  join now (premature abstraction for a 1-competency slice, per §1.B guidance).

**Final minimum clean change:** `Competency.strandId String?` (FK →
EnglishStrand, `onDelete: SetNull`) ONLY. No `cefrLevel` on Competency.
EnglishStrand gains back-relation `competencies Competency[]`. No English-only
attempt/evidence/mastery tables. No `missionId` on catalog rows. Missions attach
via the existing `MissionActivity` join under English `LearningObjective`s. CEFR
surfaced in DTOs is read from the competency's strand, not stored twice.

**Seed mechanism:** follow the PROVEN pattern — a TypeScript seed using
`prisma.upsert` (as `seed-coding-sandbox-concept-missions.ts` does), NOT a
hand-written raw-SQL insert migration. Idempotent by design, matches the repo.

## 2. Activity types (§5: shared shell + specialized evaluator, no new persistence)
First slice reuses existing `ActivityType`:
- Vocabulary/grammar multiple-choice, listen-and-choose → **SELECT** (`{question, options, correctAnswers}`)
- Vocab match / word-meaning pairs → **MATCH** (`{pairs}`)
- Short written/spoken explanation → **EXPLAIN** (`{question, keyPoints}`)

Specialized English activity types (PRONUNCIATION, DICTATION, SHADOWING,
SPEAKING_RESPONSE, CLOZE, READING_COMPREHENSION, WRITING_RESPONSE, ROLEPLAY) are
**deferred**: they need a new `ActivityType` enum value + a specialized
evaluator/renderer, and speaking/pronunciation additionally need STT (Bedrock/
sidecar — ⛔ blocked). The shared `Activity.content` JSON + `ActivityEvaluator`
switch is the extension point; adding a type = one enum value + one evaluator
case + one renderer, no new persistence. Documented for the next slices.

## 3. English curriculum (the real structure — not random rows)
Domain **English** → Skills (the strand families as skills) → Competencies
(CEFR-banded) → Objectives → Missions.

Sub-domains (Bible §9) mapped to strands/skills:
Vocabulary · Grammar · Phonics · Spelling · Pronunciation · Listening · Speaking ·
Reading · Writing · Comprehension · Conversation · Dictation · Shadowing · Stories ·
Roleplay · Real-life English.

Age ↔ CEFR anchor:
| Band | CEFR focus |
| --- | --- |
| 7–9 (AGE_8_9) | Pre-A1 / A1 — phonics, core vocabulary, simple sentences |
| 10–12 (AGE_10_11) | A1 / A2 — grammar patterns, reading, short writing |
| 13–15 (AGE_12_14) | A2 / B1 — comprehension, conversation, writing, real-life English |

## 4. THE VERTICAL SLICE (first required proof — this batch)
One complete English objective, real persisted data, end to end:
```
Domain: English
 └ Skill: Vocabulary
    └ Competency: "Everyday words (A1)"  [strand=VOCABULARY, cefr=A1]
       └ Objective: "Recognise & match everyday words"
          └ Activities: SELECT ×2 (pick the word) + MATCH ×1 (word→meaning)
          └ Mission: "Everyday Words" (guided) → the 3 activities
```
Learner flow (all real, all existing engines):
`/english → competency → Mission (Learn→Practice) → submit (ActivityAttempt) →
Evidence → MasteryRecord(update) → reviewDue set → recommendation → /balanced + portfolio`.

Delivered via: a seed migration (English domain/skill/competency/objective/
activities/mission) + the `Competency.strandId/cefrLevel` schema change + wiring
the English entry page to launch the real mission. **No new engine.**

## 5. Content quantity (§10 — initial production target, evidence-based)
Anchored to ~10–15 min sessions, ~3 sessions/week, spaced review:
- **Per age band, launch minimum:** 3 skills × ~3 competencies × ~2 objectives ×
  ~4 activities ≈ **~72 activities/band**, grouped into ~18 missions/band, plus
  review items (vocab/grammar) feeding FSRS. Three bands ≈ **~54 missions /
  ~216 activities** for a coherent sellable English v1.
- This batch delivers **1 competency / 1 mission / 3 activities** as the proven
  slice; the number above is the scale target the same seed structure repeats to.
- Content authoring (writing the real items) is the ongoing work; the
  architecture + slice make it pure data entry against a working engine.

## 6. Voice (§11 — architecture now, runtime blocked)
Speaking/pronunciation/dictation/shadowing get **activity contracts + evaluator
interface + evidence schema + mic/record/playback/retry UX + provider
abstraction + graceful fallback** built without model creds. Runtime scoring
stays ⛔ on Bedrock/STT. Not in the first slice (which is text-based vocab).

## 7. Definition of done for English → COMPLETE (Domain Matrix)
Only when: real missions/activities exist across the curriculum, the flow
produces persisted Evidence→Mastery→Review→Recommendation, it's surfaced in the
English UI + /balanced + portfolio, age-adaptive, i18n, states, a11y, tested,
deployed + live-verified. This batch moves English from ENTRY-ONLY → **first
vertical slice COMPLETE**; full-domain COMPLETE follows content scale.
