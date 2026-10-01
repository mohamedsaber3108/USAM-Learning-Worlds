# 23 — CHARACTER SYSTEM

> The 15-character universe. Backend `seed-character-universe.ts` ALREADY seeds
> all 15 locked names; the FRONTEND `src/data/characters.ts` has a stale 10-name
> cast. This doc defines the roster, Azouz's orchestration role, guardrails, and
> the frontend→backend reconciliation.

Date: 2026-09-30

---

## 1. Roster (LOCKED 15 — already seeded in backend)

| # | Name | Role | Domain focus |
|---|---|---|---|
| 1 | **Azouz** | Main companion / orchestrator | all (meta) |
| 2 | Zein | Explorer / discovery | cross |
| 3 | Luma | English coach | English |
| 4 | Codey | Coding mentor | Coding |
| 5 | Nova | AI mentor | AI |
| 6 | Mira | Creativity & Design | Creativity |
| 7 | Rami | STEM/Science explorer (contextual only) | contextual STEM |
| 8 | Faris | Critical Thinking / Problem Solving | supporting |
| 9 | Tala | Communication / Confidence | supporting |
| 10 | Adam | Entrepreneurship | Entrepreneurship |
| 11 | Byte | Digital Skills / Safety | supporting |
| 12 | Nour | Life / Financial Skills | supporting |
| 13 | Rex | Friendly Challenger | challenge |
| 14 | Zara | Storyteller | narrative |
| 15 | Atlas | World / Progression guide | navigation |

Backend `Character` model + `CharacterRole` enum + per-age active versions
(`GET /characters/:ageBand/active`, `/versions/:version`) + orchestration
(`GET /characters/orchestrate`) + unlock (`GET /characters/unlocked`).

## 2. Frontend→backend reconciliation (the real gap)

`src/data/characters.ts` uses OLD names: Azouz, Lina, Koda, Nova, Mira, Sable,
Omar, Fable, Sol, Rune (10). Map to the seeded 15:

| Frontend (old) | → Backend (locked) |
|---|---|
| Azouz | Azouz |
| Lina (english) | Luma |
| Koda (coding) | Codey |
| Nova | Nova |
| Mira | Mira |
| Sable (science) | Rami |
| Omar (entrepreneur) | Adam |
| Fable (story) | Zara |
| Sol (reviewer) | (fold into Faris/Mira review role) |
| Rune (challenge) | Rex |
| (missing) | Zein, Tala, Byte, Nour, Atlas — ADD |

**Decision:** the FRONTEND reconciles to the BACKEND-seeded 15 (backend is the
source of truth). The rich frontend personality/age-adaptation authoring in
`src/data/characters.ts` is REUSED but renamed/extended to the 15. No new backend
seed needed (it's already correct).

## 3. Azouz = the main relationship (directive §31)

Azouz owns: onboarding continuity, orientation, mission intros, explanation,
questioning, hints, encouragement, reflection, celebrating real progress, world
navigation, introducing specialists, remembering appropriate learning history,
age-adapted tone. Backend conversation lifecycle + memory/context
(`/conversations/*`, `refresh-context`, memory-governance) supports this.

**Guardrails (hard, enforced in prompt + moderation):** Azouz NEVER creates
emotional dependency, asks for secrecy, replaces parents, manipulates, or
pressures emotionally. Socratic (hints before answers). Parent-inspectable
(16 §3). Age-adapted tone (playful/protective → encouraging → peer-mentor).

## 4. Specialist orchestration

Azouz introduces specialists when educationally relevant (not as popups).
`GET /characters/orchestrate` decides which character appears for the current
context. Progressive unlock (`/unlocked`) + contextual appearance + domain
relevance + age adaptation. Architecture supports the full 15 while a learner
sees the appropriate subset (directive §30).

## 5. Coach endpoints (verified) → domain mentors

Backend already exposes Socratic coaching: `hint`, `explain`, `review`,
`challenge`, `grammar`, `pronunciation`, `vocabulary`, `reading`. Map to mentors:
Luma (grammar/vocabulary/reading/pronunciation), Codey (debug/explain), Nova
(AI), Adam (entrepreneurship), Rex (challenge), Faris (review/critical thinking).

## 6. Visual presentation (age-adaptive — 22 §4)

`companionProminence`: hero (8–9, full-body) → sidekick (10–11, bust) → ambient
(12–14, avatar). `characterScale` per mode. `--elevation-glow` signals "AI
present". Character visual tokens in `src/design/character.ts`.
