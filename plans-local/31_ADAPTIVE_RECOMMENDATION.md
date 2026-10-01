# 31 — ADAPTIVE & RECOMMENDATION (the session engine)

> Directive §28: design intelligent learning SESSIONS, not random feature
> browsing. The system decides what happens now, how long, what to review, what's
> too hard/easy, when a mentor/voice enters, when to build, when to end.

Date: 2026-09-30

---

## 1. The session engine (canonical loop — 06 §3)

`REVIEW → DISCOVERY → EXPLANATION (teach) → PRACTICE → INTERACTION (character/
voice) → CREATION → REFLECTION`. The planner picks which beats run, their order
and length, adapting live. Not every session has every beat.

## 2. Decision inputs (multi-factor — 07 §3; the WIRING GAP)

All stored in backend today; the engine must consume ALL six (currently mastery-
confidence ONLY — PG-11):
- Age (`AgeVariant`, ageBand) → beat length, scaffold, voice prominence.
- Ability/mastery (`MasteryRecord.confidence`, ZPD) → difficulty.
- Learning history (`Evidence`, `LearningEvent`, growth velocity) → pacing.
- Interests (`Learner.preferences`) → content ranking.
- Current objective (`LearningPath` node) → stay on path.
- Cognitive load/fatigue (`CognitiveLoadSignal`) → shorten/soften.

## 3. Decision function (spec)

```
nextBeat = plan({
  due:        reviewDue(masteryRecords),      // FSRS — R2
  zpd:        optimalDifficulty(confidence),  // R5
  age:        ageVariant(objective, ageBand), // 07 contract
  interests:  rankByInterest(candidates, preferences),
  load:       cognitiveLoad(signals),         // shorten if high
  objective:  activePathNode(learner),
})
```
Backend: `adaptive` (ZPDCalculator + RecommendationService) + `learner-model` +
`difficulty-calibration` + `cognitive-load` modules.

## 4. Mentor / voice / build / end decisions (directive §28)

- Mentor intervenes on repeated struggle (interventions + misconceptions).
- Specialist character appears by context (`/characters/orchestrate`).
- Voice enters when age voice-first OR speaking activity.
- "Build instead of answer" when a project/create beat fits the objective + mastery.
- Session ends on fatigue signal / daily goal met / natural stopping point.

## 5. What's-next guarantee (child-truth)

The engine ALWAYS produces a single clear next action (15 §2). No dead ends.
Home + mission stepper + recommendations render it.

## 6. Status

Adaptive/ZPD/recommendation IMPLEMENTED but keys off mastery confidence only.
**The core Gate-5 work: wire age + interests + cognitive-load + objective into the
planner, and surface the session loop in the rebuilt frontend.** A/B new planner
vs current via `experimentation` module.
