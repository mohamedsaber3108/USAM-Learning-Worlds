# 20 — FEATURE MAP

> Every product feature → its backend module(s) → its learner/parent-facing
> surface → status. The detailed per-feature truth table (with evidence + the
> PRODUCTION_READY/PARTIAL/… status) is 45; this is the organizing map.
> Cross-references prior `66_FINAL_ENGINE_INVENTORY.md` (engine↔surface sweep).

Date: 2026-09-30

---

## 1. Feature families (locked scope)

| Feature family | Backend module(s) | Surface (17/19) | Note |
|---|---|---|---|
| Learning loop | missions, learning, mastery, adaptive, questions | Learn/mission player/practice/progress | the core |
| English domain | english, english-coach, learning | English surfaces + missions | CEFR spine |
| Coding domain | coding-sandbox, coding-coach, computational-thinking | Coding surfaces + sandbox | Pyodide/Sandpack |
| AI domain | ai, cross-curricular | AI surfaces + missions | AI4K12 |
| Entrepreneurship domain | cross-curricular, simulation, projects | venture/entrepreneurship surfaces | thinnest content (13) |
| Supporting competencies | critical-thinking, problem-solving, communication, creativity, digital-literacy, research, career | missions + Balanced Development | cross-domain |
| Characters/companions | ai (characters) | Companions + in-mission + voice | 15 roster seeded; Azouz primary |
| Voice | voice | woven (mic affordance) | provider-independent (24) |
| Practice/review | flashcards, mastery (review-due) | Practice | FSRS (ts-fsrs already) |
| Projects/portfolio | projects, rubrics | Create/Projects/Portfolio | evidence output |
| Mastery/evidence | mastery, learner-model | Progress/Balanced Development | evidence-driven |
| Credentials | credentials | Progress/Verify | Open Badges |
| Gamification | gamification, cosmetics, daily-goals | Home/Rewards | reward ≠ mastery (06 R9) |
| Stories | stories | Stories | narrative |
| Simulations | simulation, media | Simulations | branching |
| Adaptive/recommendations | adaptive, difficulty-calibration, learner-model, cognitive-load | Home/next-action | multi-factor (07) |
| Entitlements/packaging | entitlements | Pricing/Plan | Plan=Package (10) |
| Parent | parents, legal | Parent surfaces | consent/controls (16) |
| Safety/moderation | safety-escalations, moderation, safety-policies | Moderator + behind-scenes | COPPA/GDPR |
| Search / Notifications | search, notifications | shell | cross-cutting |
| Admin/content/QA | content-items, content-qa, content-provenance, curriculum-mapping, assessment-quality, misconceptions, ai-eval, prompt-templates, question-templates | Admin areas | task-oriented |
| Platform | feature-flags, experiments, audit, analytics | Admin platform | infra/ops |
| Reflection/metacognition | reflection | mission end | 06 R7 |

## 2. Orphan / gap sweep

Prior `66_FINAL_ENGINE_INVENTORY.md` reconciled engines↔surfaces (✅ has UX / 🛠
infra-only / ⚠ gap). Carry it forward; the dominant ⚠ is that root `src/`
surfaces are MOCK-backed (not that engines are missing). No backend engine is an
accidental orphan; infra-only modules (media, audit, feature-flags, experiments,
learner-model, translations, rubrics) correctly have no learner page.

## 3. Features NOT in scope (confirm/trim)

Root `src/` has services for `careers`, `robotics`, `digital-citizenship`,
`presentation`, `research`, plus a `boss` route with NO backend model. Per locked
scope these are either supporting competencies (fold in) or out of scope (trim).
Decision deferred to 44 implementation sequence; boss battles need a scope call.
