# 07 — AGE & ADAPTATION

> Age adaptation is a FIRST-CLASS ENGINE, not styling (directive §21). Adaptation
> keys off **age + ability + mastery + interests + learning history + current
> objective** — age is NOT the only axis. Grounds the frontend `useAgeAdaptation`
> contract and the backend session/recommendation engines.

Date: 2026-09-30

---

## 1. Bands (LOCKED 8–14; backend `AgeBand`)

| Backend enum | Product band | Developmental read |
|---|---|---|
| `AGE_8_9` | 8–9 (early) | concrete; voice-forward; short attention; needs heavy scaffolding; reading load light |
| `AGE_10_11` | 10–11 (building) | applied; growing independence; real projects/early coding & AI |
| `AGE_12_14` | 12–14 (independent) | abstract/ethics; self-directed; deeper projects, real programming, business models |

## 2. Age → UX contract (what differs by band)

| Dimension | 8–9 | 10–11 | 12–14 |
|---|---|---|---|
| Reading load | minimal, voice-forward | moderate | full text ok |
| Tap targets | largest | large | standard |
| Nav depth | 1 level, iconic | 2 levels | full |
| Activity length | short | medium | longer / project |
| Autonomy / scaffold | high (MODELLED/GUIDED) | guided (GUIDED/COACHED) | self-directed (COACHED/INDEPENDENT) |
| Character tone | playful, protective | encouraging companion | mentor / peer |
| Difficulty framing | concrete | applied | abstract / ethics |
| Voice role | primary modality | supportive | optional |

Delivered via a single `useAgeAdaptation(ageBand)` →
`{density, copyTone, maxVisibleCards, tapTargetScale, navDepth, defaultScaffold,
voiceProminence}`. Backend `AgeVariant` supplies per-entity framing/languageLevel/
scaffoldLevel. **Rule:** no page hardcodes age behavior; all read the hook/variant.

## 3. The full adaptation model (beyond age)

Inputs (all already have storage in the backend):
- **Age** — `Learner.ageBand`, `AgeVariant`.
- **Ability/Mastery** — `MasteryRecord.confidence`, ZPD profile.
- **Learning history** — `Evidence`, `LearningEvent`, growth velocity.
- **Interests** — `Learner.preferences`, `LearnerContext.preferencesSnapshot`.
- **Current objective** — active `LearningPath` node / mission.
- **Cognitive load / fatigue** — `CognitiveLoadSignal`.

Gap (from 02/03, PG-11): the ZPD/recommendation engine currently keys off mastery
confidence ONLY; age, interests, and cognitive-load inputs are stored but not
consumed. **Rule for the rebuild:** the session planner (31) must read all six.

Decision function (spec):
```
next(session) =
  pickBeat(          // which loop beat (06 §3)
    due   = reviewDue(masteryRecords),              // R2 spacing
    zpd   = optimalDifficulty(confidence),          // R5 ZPD
    age   = ageVariant(objective, ageBand),         // §2 contract
    taste = rankByInterest(candidates, preferences),// interest weighting
    load  = cognitiveLoad(signals),                 // shorten/soften if high
    objective = activePathNode(learner)             // keep on the path
  )
```

## 4. Diagnostic / placement (PG-14)

First-run and per-domain-entry **light diagnostic** sets the starting level
(not just age). Short, game-framed, adaptive; writes initial `MasteryRecord`
confidence + a learning profile. Never feels like a test (directive §26). Uses
existing `questions` + `difficulty-calibration` modules — verify end-to-end in G4.

## 5. Measurable adaptation outcomes

- % of recommendations that use ≥3 of the 6 inputs (target: all).
- Time-in-ZPD (not too easy / too hard) per learner.
- Interest-match rate of recommended content.
- Drop in "too hard" / "too easy" learner signals over first 2 weeks.
