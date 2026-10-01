# 30 — ASSESSMENT, MASTERY & EVIDENCE

> The evidence engine as first-class (directive §29). Mastery is evidence-driven,
> never exposure-driven (06 R1). Backend: `MasteryRecord`, `Evidence`,
> `MasteryState`, `questions`, `assessment-quality`, `difficulty-calibration`,
> `misconceptions`, FSRS review.

Date: 2026-09-30

---

## 1. Evidence (first-class, multi-source — directive §29)

`Evidence` types (8): KNOWLEDGE · APPLICATION · CREATION · EXPLANATION ·
CONVERSATION · PROBLEM_SOLVING · TRANSFER · REFLECTION. Sources: practice,
assessment, voice conversation, English speaking, writing, coding, debugging,
projects, presentations, challenges, AI projects, entrepreneurship sims,
reflection. Every meaningful act that demonstrates competence writes Evidence.

Chain: `EVIDENCE → SKILL/COMPETENCY → MASTERY → PROGRESS → PORTFOLIO →
RECOMMENDATION`. A child is NOT "proficient" for clicking through content —
only for logged, successful retrieval/creation evidence.

## 2. Mastery

`MasteryRecord` per (learner × competency): 7-state `MasteryState`
(NOT_STARTED→INTRODUCED→EXPLORING→PRACTICING→DEVELOPING→PROFICIENT→MASTERED),
confidence (FSRS-inspired custom algorithm), evidenceCount, reviewDue.
State decision = confidence model; review-timing = ts-fsrs (already adopted).

## 3. Assessment types

- **Diagnostic/placement** (07 §4): sets starting confidence per domain; game-
  framed; uses `questions` + `difficulty-calibration`.
- **Formative** (in-mission): every activity submit → `{correct,score,feedback}`
  → Evidence (06 R6).
- **Review** (spaced): FSRS-scheduled retrieval of due competencies/cards.
- **Project/creative**: rubric-scored (29) → CREATION Evidence.
Quality guarded by `assessment-quality` + `content-qa`; misconceptions tracked
(`MisconceptionPattern`) → targeted remediation (interventions module).

## 4. Review scheduling (FSRS — adopted)

`ts-fsrs` on `FlashcardReview` (stability/difficulty/fsrsState/reps/lapses cols
exist) + competency `reviewDue`. Due items surface on Home + Practice (R2).

## 5. Mastery → recommendation

Every mastery change recomputes recommendations (adaptive, 31). Struggle (low
confidence / misconception) triggers intervention + mentor support; strength
triggers challenge/advance. This closes the loop (directive §29: mastery update
must affect recommendations).

## 6. Status

Engine IMPLEMENTED (mastery/evidence/questions/assessment-quality/difficulty-
calibration/misconceptions/FSRS). Diagnostic end-to-end journey = verify in G5.
Frontend progress surfaces MOCK-backed → wire.
