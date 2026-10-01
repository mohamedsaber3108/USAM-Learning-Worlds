# 21 — ENGINE MAP

> The backend "engines" that power the product + how they connect. Reconciles
> with prior `66_FINAL_ENGINE_INVENTORY.md` and `docs/architecture/USAM_ENGINE_MAP.md`.
> Verified against schema (96 models) + modules (~47) this session.

Date: 2026-09-30

---

## 1. Core learning engines (the spine)

| Engine | Module | Responsibility |
|---|---|---|
| Curriculum graph | learning | Domain→Skill→Competency→Concept→Objective→Activity + paths/prereqs |
| Missions | missions | Mission/Activity/Run/Attempt orchestration |
| Mastery | mastery | MasteryRecord state (confidence model) + Evidence |
| Review scheduler | flashcards + mastery | **ts-fsrs** (adopted; migration 20260910) for review timing |
| Adaptive/recommendation | adaptive + learner-model + difficulty-calibration + cognitive-load | what's next (multi-factor target — 07) |
| Assessment | questions + assessment-quality | items + quality flags |
| Projects/evidence | projects + rubrics | artifacts → Evidence → portfolio |
| Credentials | credentials | Open Badges from mastery/projects |

## 2. Experience engines

| Engine | Module | Responsibility |
|---|---|---|
| Characters/AI | ai | 15-char roster, conversation lifecycle, Socratic behavior, memory/context |
| Voice | voice | STT/TTS, provider-independent (24) |
| Worlds | worlds | domain-scoped worlds, unlock conditions, mission grouping |
| Stories | stories | narrative content |
| Simulations | simulation + media | branching decision scenarios |
| Gamification | gamification + cosmetics + daily-goals | XP/streak/achievements/shop (decoupled from mastery) |
| Creativity | creativity | prompts/submissions |
| Reflection | reflection | metacognition beats |

## 3. Governance / platform engines (infra/admin)

| Engine | Module | Responsibility |
|---|---|---|
| Entitlements | entitlements | Plan/Subscription/features + payment abstraction |
| Content governance | content-items/content-qa/content-provenance/curriculum-mapping/misconceptions/difficulty-calibration | authoring, QA, provenance/licensing, mapping |
| AI safety | ai-eval + safety-policies + moderation + prompt-templates | eval harness, policies, moderation, prompts |
| Safety/consent | safety-escalations + legal | COPPA/GDPR consent, data requests, escalations |
| Platform | feature-flags + experiments + audit + analytics | flags, A/B, audit log, metrics |
| i18n | translations | EN/AR + human-approval pipeline |
| Learner model | learner-model | internal learner state (read by adaptive/mastery) |
| Media/search/notifications | media + search + notifications | cross-cutting |

## 4. Data flow (the loop, end-to-end)

```
Learner acts → Activity submit → ActivityAttempt → recordEvidence(Evidence)
 → MasteryRecord update (confidence) → reviewDue set (ts-fsrs)
 → LearningEvent telemetry → adaptive recomputes recommendation
 → next beat/mission → project artifact → portfolio/credential
 → parent report. Gamification runs ALONGSIDE (XP/streak), never gating mastery.
```

## 5. Known engine wiring gaps (to fix in G5)

- Adaptive engine reads mastery confidence only; must consume age + interests +
  cognitive-load (07, PG-11).
- Cross-curricular concept tables not yet wired into the curriculum graph (08 §6).
- Frontend (root `src/`) consumes almost none of these engines (mock-backed) —
  the central integration work.
