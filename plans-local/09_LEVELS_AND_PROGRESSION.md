# 09 — LEVELS & PROGRESSION

> Per directive §21: progression is NOT age-only, and levels must have MEASURABLE
> educational meaning (no empty "Level 1/2/3"). Defines stages, entry/exit, and
> what advancement means. Builds on the verified spine (08) + adaptation (07).

Date: 2026-09-30

---

## 1. Two distinct "level" concepts (do not conflate)

1. **XP level** — `Progression.level` (exists): a motivational number from XP.
   Cosmetic/gamification only. NOT educational progression. Keep, but never gate
   learning on it.
2. **Learning stage** — the REAL progression: demonstrated mastery across a
   domain's competencies within an age/CEFR band. This is what "level" must mean
   educationally. Modeled via `MasteryRecord` states + `LearningPath` ordering,
   NOT a vanity integer.

## 2. Stage model (meaningful, measurable)

A **Stage** = (Domain × Age/ability band × ordered competency set). For each
stage define (directive §21):

| Field | Source |
|---|---|
| Entry requirements | prerequisite competencies MASTERED (`CompetencyPrerequisite`) |
| Diagnostic | light placement sets starting confidence (07 §4) |
| Learning outcomes (per domain) | the stage's `LearningObjective`s |
| Missions / Projects / Practice / Review | `Mission`, `Project`, FSRS review items |
| Assessment | retrieval activities → `Evidence` |
| Mastery requirements | % of stage competencies at ≥ PROFICIENT |
| Portfolio evidence | ≥1 project artifact for the stage |
| Completion requirements | mastery threshold + project + reflection |
| Next-stage requirements | completion unlocks next `LearningPath` node |

## 3. Progression rules

- **Advance by demonstrated mastery, not seat time** (06 R1).
- A competency progresses NOT_STARTED → INTRODUCED → EXPLORING → PRACTICING →
  DEVELOPING → PROFICIENT → MASTERED on logged `Evidence` + confidence.
- A stage completes when: (a) ≥ X% of its competencies ≥ PROFICIENT, (b) ≥1
  portfolio artifact, (c) reflection done. Thresholds configurable (not hardcoded).
- Unlocks are prerequisite-driven (`CompetencyPrerequisite`, `ConceptPrerequisite`,
  `LearningPathNode`) — the learner always has a clear next node.
- Age band sets DEFAULT difficulty/scaffold but ability can place a learner
  above/below their age default (07) — age is a starting hint, not a ceiling.

## 4. Cross-domain progression ("Balanced Development")

A learner progresses per domain independently (could be A2 English + early
Coding). A balanced-development view shows all four + supporting competencies, so
neither child nor parent sees a single misleading "level N". The product shows
**mastery by domain**, not one global level.

## 5. Measurable meaning (anti "empty level")

Every stage names: "can now DO X" (the outcome), evidenced by Y (the artifacts/
attempts). A stage label without a measurable can-do statement + evidence
requirement is a defect. Example (English, 8–9): "Stage A1-Foundations — can
recognise & use ~150 everyday words and form simple sentences; evidenced by
vocab retrieval mastery + one short spoken/written piece."

## 6. Routing to implementation

- Stages are expressed as `LearningPath` + `LearningPathNode` ordered sets per
  domain/band (model exists) — seed in Gate 5.
- Completion thresholds live in config (feature-flag/settings), not code.
- The home + progress surfaces read stage state from mastery, never from XP level.
