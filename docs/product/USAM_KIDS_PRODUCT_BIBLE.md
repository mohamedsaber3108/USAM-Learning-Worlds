# USAM for Kids — Product Bible (final product model)

> The source of truth for *what the product is* — the target the frontend rebuild
> is derived from (Reference Bible §0/§34). Reconciles `plans-local/01_PRODUCT_NORTH_STAR.md`
> and the competitor/learning-science research. This is the "correct final
> experience" the rebuild must realize before any code is deleted.

Date: 2026-09-23 · HEAD `aa2cd67`

---

## 1. North star
**USAM for Kids is an Arabic-first, AI-native learning universe for ages 7–15** where
a child can enter alone, be understood, and be guided by characters and adaptive
learning through **English, coding, AI literacy, and future-skills**, producing
**visible, verifiable evidence of growth** parents trust. It must feel like a
**world you return to**, not a website of courses.

## 2. Target users
- **Children 7–15**, three bands (see §3).
- **Parents/guardians** — buyers + monitors; involved by choice, not required for the child to operate.
- **Schools** (B2B, future — SCHOOL plan exists).

## 3. Age bands — the core adaptation axis (Bible §3)
Age adaptation is a **first-class engine**, not styling. A 7-year-old and a 14-year-old
must not get the same UI, density, language, activity length, navigation depth,
difficulty, or autonomy. Backend enum: `AGE_8_9 · AGE_10_11 · AGE_12_14`; product bands:

| Band | 7–9 (early) | 10–12 (building) | 13–15 (independent) |
| --- | --- | --- | --- |
| Reading load | minimal; **voice-forward** | moderate | full text ok |
| Tap targets | largest | large | standard |
| Nav depth | 1 level, iconic | 2 levels | full |
| Activity length | short | medium | longer/project |
| Autonomy | high scaffolding | guided | self-directed |
| Character tone | playful, protective | encouraging companion | mentor/peer |
| Difficulty | concrete | applied | abstract/ethics |

Driven by `useAgeAdaptation(ageBand)` → `{density, copyTone, maxVisibleCards, ...}`.
The learner model refines from onboarding diagnostic + ongoing performance.

## 4. Learning philosophy (why each mechanic exists — Bible §6)
Every mechanic maps to research (detail in `docs/research/LEARNING_SCIENCE_REFERENCES.md`):
- **Mastery-based progression** — advance by demonstrated mastery, not seat time.
- **Story → Learn → Practice → Reward** loop — worked example/teaching before retrieval (worked-examples effect; the Learn step is live).
- **Retrieval + spaced practice + interleaving** — practice + FSRS review.
- **Scaffolding + ZPD** — adaptive difficulty within reach; interventions on struggle.
- **Formative feedback, immediate + specific** — per-activity evaluation.
- **Metacognition** — post-mission reflection (live).
- **Project-based learning + transfer** — projects/portfolio as evidence.
- **Motivation without manipulation** — rewards ≠ mastery; no FOMO/guilt/toxic leaderboards (Bible §20).

## 5. Domains (deliberate identity — Bible §10/§11, not "all school subjects")
Core: **English**, **Coding**, **AI literacy**. Cross-cutting future-skills:
critical thinking, problem solving, creativity, communication, entrepreneurship,
digital & financial literacy — surfaced via **Balanced Development**.

Learning hierarchy: `Domain → Skill → Competency → Concept → Objective → Activity →
Practice → Mission → Project → Assessment → Mastery → Evidence → Recommendation`.

## 6. The child experience (what "a world" means)
- **Home = a living world**, not a dashboard: companion greeting, world-journey map, one clear next action, adaptive recommendations.
- **Characters as guides** woven into missions/feedback/voice (roster in Bible §14), never static popups.
- **Voice** as a first-class modality where age-appropriate (EG-Arabic child speech is the hard benchmark — `VOICE_BENCHMARK.md`).
- **Every action answers "what do I do next?"** (child-truth audit).

## 7. Parent value (why they pay — Bible §36 parent loop)
`Learner → progress/evidence → parent report → safety/privacy → controls/approvals`.
Visible: mastery by domain, portfolio of real work, verifiable credentials, safety
(COPPA/GDPR consent live). Every paid feature maps to a parent-visible outcome.

## 8. Commercial model (Bible §32; spec in `plans-local/47/48`)
`Product → Package → Plan → Entitlement → Subscription → Child Access`. Plans
FREE/EXPLORER/FAMILY/SCHOOL are seeded and gated (missions/voice/aiTutor). Real
payment gateway is the one external blocker (processor + keys).

## 9. Non-negotiable safety (Bible §21)
Child-first from the ground up: consent/privacy (COPPA/GDPR live), moderation,
AI guardrails, no child-to-child risk, characters never encourage secrecy/
dependency/isolation. Legal jurisdiction matrix = lawyer-review artifact.

## 10. Child-truth & parent-truth acceptance (every rebuilt surface must pass)
Child: understand what to do without an adult · navigate + recover from confusion ·
see progress · choose meaningfully · interact with AI safely · create something ·
always know what's next. Parent: see what the child learns/makes · how progress is
measured · that it's safe · that price maps to outcomes.
