# 02 — CURRENT REALITY AUDIT (forensic, evidence-based)

> What ACTUALLY exists in `M:\USAM-main` as of 2026-09-30, from code read this
> session (schema.prisma, main.ts, seed.ts, src/* , package.json, routes,
> services, docs). Claims carry file evidence. This is the baseline the
> reconstruction builds on — not aspiration.

---

## A. BLOCKING DECISION — which tree is "the original project"?

There are **two** frontend trees in this checkout (not three; `frontend-rebuild/`
is NOT here — it lived on the server in the prior era):

| Tree | Stack | Evidence it is / isn't "the app" |
|---|---|---|
| **root `src/`** | TanStack Start + Lovable, React 19, Vite 8, Pyodide, Sandpack, Radix, i18next | `.lovable/project.json` (`template: tanstack_start_ts_current`); root `package.json` name `tanstack_start_ts`; `vite.config.ts` uses `@lovable.dev/vite-tanstack-config`; **`.output/` build artifact chunk names map 1:1 to `src/routes/*`**; `scripts/start-frontend.sh` runs the repo-root app; 40+ file-based routes; AGENTS.md says the project is Lovable-connected (`kids.usamif.com`) |
| **`frontend/`** | React 18 + react-router-dom v6, Vite 5, zustand, axios, framer-motion | smaller feature set; `src/LEGACY_DO_NOT_EDIT.md` claims THIS is canonical/deployed via `scripts/deploy.sh` + `.github/workflows/ci.yml` — **but neither file exists in this checkout** |

**The contradiction:** `src/LEGACY_DO_NOT_EDIT.md` (committed during the earlier
frontend-rebuild era) says root `src/` is a dead Lovable scaffold and `frontend/`
is the deployed app. The build evidence in THIS checkout says the opposite — the
Lovable toolchain builds root `src/`, and that is what `.output/` contains.

**Most-likely truth:** the `LEGACY_DO_NOT_EDIT.md` note is stale, from when the
plan was to migrate into `frontend/`/`frontend-rebuild/` on the server. The
live Lovable product at `kids.usamif.com` is built from **root `src/`**. The
server checkout and this dev checkout diverged.

**Recommendation (for owner confirmation):** treat **root `src/` (the Lovable
TanStack app) as "the original project"** to rebuild inside, because (a) it is
what Lovable builds and syncs, (b) it is the richest existing surface, (c) the
AGENTS.md Lovable-sync rule applies to it. If instead the owner means the server
`frontend/` tree, the rebuild target changes and 37/41 must be rewritten.

This is the ONE high-impact, hard-to-reverse decision. Everything below and the
entire product/learning/packaging definition is **tree-independent** and
proceeds now regardless of the answer.

---

## B. Backend reality (the real source of truth) — `backend/`

> CORRECTION (verified by direct PowerShell enumeration of schema.prisma and
> `src/modules`): an earlier pass in this session badly UNDER-reported the
> backend (it read a stale/partial `app.module.ts` listing 11 modules and relied
> on grep, which does not index `backend/` in this workspace). The real backend
> is **96 Prisma models and ~56 controllers across ~47 modules** — a mature,
> largely feature-complete backend. The prior `plans-local/47_PRICING_PACKAGING.md`
> was CORRECT that Plan/Subscription/EntitlementsService exist. Treat THIS
> section as authoritative; the "greenfield/missing" claims below were revised.

NestJS + Prisma + PostgreSQL. Global prefix **`/api`** IS set
(`backend/src/main.ts` → `app.setGlobalPrefix('api')`). **96 models**, ~56
controllers. Modules (verified `src/modules`): adaptive, ai, analytics,
assessment-quality, audit, auth, coding-sandbox, community, content-items,
content-provenance, content-qa, creativity, credentials, cross-curricular,
curriculum-mapping, daily-goals, difficulty-calibration, english-learning,
entitlements, experimentation, feature-flags, flashcards, gamification,
interventions, learner-model, learning, legal, mastery, media, misconceptions,
missions, notifications, parents, problem-solving, projects, questions,
reflection, search, simulation, visual-language, voice, worlds.

### Models that EXIST (schema.prisma, ~985 lines)
- **Identity/roles:** `User` + `Role { LEARNER, GUARDIAN, MODERATOR, ADMIN }`,
  `Learner` (ageBand, preferences JSON), `Guardian`, `Guardianship`.
- **Curriculum graph:** `Domain → Skill → Competency → Concept → LearningObjective
  → Activity`, plus `ConceptPrerequisite`, `CompetencyPrerequisite`,
  `LearningPath` (+`LearningPathNode`, `LearningPathProgress`). ✅ strong.
- **Age adaptation (data only):** `AgeBand` enum, `AgeVariant` (per-entity
  framing/languageLevel/`ScaffoldLevel`), `ContentItem.ageBand`.
- **Missions:** `Mission`, `Activity`, `MissionRun`, `ActivityAttempt`,
  `MissionActivity` link table.
- **Mastery/Evidence:** `MasteryRecord` (7-state `MasteryState`, confidence,
  reviewDue), `Evidence` (8 `EvidenceType`s). Algorithm = **FSRS-INSPIRED custom
  heuristic** (`mastery-confidence.algorithm.ts`), not the real FSRS library.
- **Characters/AI:** `Character` (name, `CharacterRole` 14-value enum,
  personality JSON, systemPrompt), `Conversation`, `ConversationMessage`,
  `CharacterInteraction`, `CharacterState`, `LearnerContext`.
- **Projects:** `Project`, `ProjectMilestone`, `Rubric`, `RubricCriterion`.
- **Gamification (partial):** `Progression` (level/XP/coins), `XPGain`,
  `PracticeStreak`.
- **Content/CMS:** `ContentItem` (`ContentStatus` DRAFT→PUBLISHED workflow,
  generatedBy/validatedBy), `Translation` (EN + ar + ar-EG), `LearningEvent`
  (`LearningEventType`).
- **Cross-curricular (flat, disconnected):** `AILiteracyConcept`,
  `EntrepreneurshipConcept`, `FinancialLiteracyConcept` — standalone lists, NOT
  wired into Domain→Skill→Competency, no controllers.
- **Safety:** `ModerationLog`, `QuarantinedContent`, `AIUsageLog`.
- **English:** `EnglishStrand` (cefrLevel), seeded 14 strands.
- **Coding:** `CodingConcept`, seeded 18 concepts.

### Monetization / packaging — EXISTS (corrected)
- `Plan` (code, name, priceCents, currency, interval, features JSON, isActive),
  `Subscription` (ownerUserId, planId, status, provider, currentPeriodEnd,
  cancelAtPeriodEnd). `entitlements` module: `EntitlementsService`
  (getActivePlan/hasFeature/getLimit/subscribe/cancel), `entitlements.controller`,
  payment abstraction (`payment-provider.interface.ts` + `manual-payment.provider.ts`).
  Spec: prior `47_PRICING_PACKAGING.md`. **Real payment gateway = still external.**
- NOTE: a distinct "Package" layer (bundling domains) is NOT a separate model —
  packaging is expressed via `Plan.features` JSON today. Whether to add an
  explicit `Package` entity is a Gate-3 decision (10), not a missing-model fact.

### Other models that EXIST (corrected — all verified in schema, 96 total)
- **Voice:** `voice` module + controller (provider-independent). Verify depth in G4.
- **Notifications:** `Notification` + module. **Credentials:** `Credential`,
  `CredentialDefinition` + module. **Flashcards:** `Flashcard`, `FlashcardReview`
  + module. **Stories:** `Story`, `StoryPage` + controller. **Simulations:**
  `SimulationScenario`, `SimulationDecisionPoint` + module. **Cosmetics:**
  `AvatarCosmetic`, `LearnerCosmeticUnlock`, `StreakFreezePurchase`.
  **Feature flags/experiments:** `FeatureFlag`, `Experiment`, `ExperimentAssignment`.
  **Audit:** `AdminAuditLog` + module. **Daily goals:** `DailyGoal`.
  **Worlds:** `World` + module. **Reflection:** `ReflectionPrompt`,
  `MissionReflection`. **Safety/consent:** `ConsentRecord`, `DataSubjectRequest`,
  `SafetyEscalation`, `SafetyPolicy` (COPPA/GDPR primitives present).
- **Cross-curricular concept tables (many):** AILiteracy, Entrepreneurship,
  Financial, Digital, CriticalThinking, ProblemSolving, Communication,
  ComputationalThinking, Creativity, Career, Research — standalone concept
  lists; integration into the Domain→Skill→Competency graph still to confirm (G3).
- **Content governance:** `ContentItem`, `ContentSource`, `ContentLicense`,
  `ContentQAFlag`, `AssessmentQualityFlag`, `MisconceptionPattern`,
  `DifficultyCalibrationFlag`, `CognitiveLoadSignal`, `PromptTemplate`,
  `QuestionTemplate`, `AIEvalRun`, `AIEvalResult`.

### What is STILL genuinely thin / to verify (not "greenfield")
- Explicit `Package` bundling entity (vs features-JSON) — Gate-3 product decision.
- Diagnostic/placement ASSESSMENT flow — model primitives exist (questions,
  difficulty-calibration); the end-to-end diagnostic journey needs verification.
- Whether cross-curricular concepts are WIRED into the mastery graph (G3).
- Auth depth: confirm reset/verify/OAuth/refresh-rotation (G4).

### Controllers (route prefixes, all under `/api`, ~56 — verified)
adaptive · admin/{ai-eval,analytics,assessment-quality,content-items,
content-provenance,content-qa,curriculum-mapping,difficulty-calibration,
interventions,memory-governance,misconceptions,missions,prompt-templates,
safety-policies} · ai · audit · auth · characters · coding-coach · coding-sandbox
· community · computational-thinking · creativity · credentials ·
critical-thinking · cross-curricular · daily-goals · english · english-coach ·
entitlements · experiments · feature-flags · flashcards · gamification ·
learner-model · learning · learning/domains · legal · mastery · media · missions
· notifications · parents · problem-solving · projects · questions · reflection ·
rubrics · safety-escalations · search · simulations · stories · translations ·
visual-language · voice · worlds. (Auth depth to confirm in G4.)

---

## C. What is actually SEEDED (seed.ts, seeds/*)

- **Domains (12, WRONG for the product):** Mathematics, Science, Engineering,
  Technology, Arts, Language, Social Studies, Health & Wellness, Music, Physical
  Education, Critical Thinking, Creativity. Only ONE real vertical slice exists
  (Math → Number Sense → Place Value → 1 objective → 1 activity → 1 mission).
  The four LOCKED primary domains are **not** the seeded domains. Entrepreneurship
  is NOT a seeded domain (only a cross-curricular concept table + character role).
- **Characters (1):** only **Azouz** (role GUIDE), with EN + Egyptian-Arabic
  system prompts. The locked 15-roster is unseeded.
- **English:** 14 CEFR strands (A1→B2) ✅.
- **Coding:** 18 concepts across BASICS/LOGIC/DATA/ALGORITHMS/DESIGN ✅.
- **Arabic:** translations for domains + Azouz; sample activities flagged
  "needs translation".

---

## D. Frontend reality — root `src/`

- 40+ TanStack file-routes: `index, world, onboarding, learn.$domainId,
  missions.$missionId, english.$venueId, code.$labId, ai.$playgroundId,
  venture.$labId, create.$studioId, boss.$bossId, characters, stories,
  simulations, challenges, achievements, curriculum, practice, progress,
  portfolio, projects, parents, safety, profile, community, design-system`.
- **Mostly MOCK-BACKED:** `src/services/*` (curriculum, english, coding,
  ai-literacy, venture, studio, careers, robotics, financial-literacy,
  digital-citizenship, presentation, research, home, onboarding, mission) use
  local `src/data/*` + artificial `setTimeout`. Only `src/services/api.ts`
  makes real `fetch` calls to the backend.
- **10-character hardcoded cast** in `src/data/characters.ts` (Azouz, Lina,
  Koda, Nova, Mira, Sable, Omar, Fable, Sol, Rune) — rich lore, pronouns, age
  adaptation — but names/roles do NOT match the locked 15-roster.
- Services present for domains the scope does NOT make primary: `careers.ts`,
  `robotics.ts`, `digital-citizenship.ts`, `research.ts`, `presentation.ts` —
  candidates to fold into supporting competencies or drop.

## E. Frontend reality — `frontend/` (legacy)

React 18 + react-router SPA; features `{auth, dashboard, gamification,
missions, projects}` only. Much thinner than root `src/`. Real axios client.

---

## F. Prior planning docs to MERGE (not duplicate)

- `docs/product/USAM_KIDS_PRODUCT_BIBLE.md` — strong product model (merged into
  01; divergences reconciled).
- `docs/product/FINAL_CAPABILITY_REGISTRY.md`, `FINAL_ENTITLEMENT_MATRIX.md`.
- `docs/architecture/USAM_GAP_REGISTER.md` — GAP-001..037 (folded into 03).
- `docs/architecture/USAM_{MASTER_BACKEND_ARCHITECTURE, DATA_MODEL_PLAN,
  API_BOUNDARIES, ENGINE_MAP, IMPLEMENTATION_ROADMAP, OPEN_SOURCE_EVALUATION}.md`.
- `docs/audit/`, `docs/reconstruction/`, `docs/research/`, `docs/security/`,
  `docs/legal/`, `docs/platform-audit/` — to be mined in later gates.
- Prior `plans-local/80–99` ledgers (frontend-rebuild era) — SUPERSEDED by this
  reset; retained as history, not authority.

## G. Top contradictions the code reveals (full gap list in 03)

1. **Tree ambiguity** (§A) — blocking owner decision.
2. **UI vs backend is BETTER than first thought:** backend DOES have Story,
   Simulation, Credential, Cosmetic, Worlds models — so stories/simulations/
   achievements routes CAN be backed. The real gap is the FRONTEND being
   mock-wired, not the backend missing. (Boss battles have no model — confirm if
   in scope.)
3. **Seeded domains ≠ product domains** (12 school subjects vs locked 4). The
   SCHEMA supports the right graph; the SEED DATA is wrong.
4. **Character roster mismatch is FRONTEND-ONLY.** Backend
   `seed-character-universe.ts` ALREADY seeds all 15 locked names exactly. The
   10-name cast is only in frontend `src/data/characters.ts`. Fix = reconcile the
   frontend to the seeded 15 + wire to backend. (NOTE: default `prisma db seed`
   = `seed.ts` still seeds Azouz-only + 12 wrong domains; the real content comes
   from the named `seed:*` scripts — the default seeder is stale.)
5. **Monetization EXISTS** (Plan/Subscription/EntitlementsService + payment
   abstraction). Real payment gateway is the external dep. Explicit Package
   bundling entity is a Gate-3 product decision, not a missing capability.
6. **Adaptation under-wired:** age (AgeVariant) + interests (preferences) modeled
   but the ZPD/recommendation engine keys off mastery confidence ONLY (re-verify
   now that `learner-model` + `difficulty-calibration` modules exist).
7. **Mostly mock-backed frontend:** the real integration gap — only `api.ts` is
   real in root `src/`; the mature backend is largely unconsumed by that tree.
8. **Auth depth unconfirmed:** verify reset/verify/OAuth/refresh-rotation (G4).
9. **Stale canonical note:** `src/LEGACY_DO_NOT_EDIT.md` references deploy.sh/CI
   not in this checkout.

> LESSON (recorded): grep_search does NOT index `backend/` in this workspace,
> and a single `app.module.ts` read under-counts modules. All backend reality
> claims in these docs are now verified by direct PowerShell file enumeration.
