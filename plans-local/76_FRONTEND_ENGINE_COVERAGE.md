# 76 — Frontend Engine Coverage Ledger (execution queue)

> Traces every real backend engine to its user-facing representation in the
> DEPLOYED frontend. This ledger IS the execution queue for the frontend
> reconciliation phase. Grounded in a full inventory of `M:\USAM-main\frontend`
> (2026-09-29), not assumptions.

## ‼️ CRITICAL FINDING — dual frontend; my earlier coding-execution edits landed in the DEAD tree

There are **two frontends** in the repo:
| Tree | package | Router | Deployed? |
|---|---|---|---|
| `frontend/src` | `usam-learning-worlds-frontend` | react-router-dom v6, `src/app/router/index.tsx`, `features/*/pages` | ✅ **YES — `scripts/deploy.sh` builds `$REPO/frontend`** |
| root `src/` | `tanstack_start_ts` | TanStack Start file routes, `src/routes/*` | ❌ NOT deployed (legacy scaffold) |

**Consequence:** the coding real-execution frontend work (runPythonTests, testOutcomes,
CodingTest types, lazy ActivityRunner) I did earlier landed in root `src/` — the
**non-deployed** tree. The live coding UX (`frontend/src/features/coding/*`) still uses
the OLD contract: it runs code client-side and POSTs `stdout/result` only (no
`testOutcomes[]`), and `endpoints.ts` `CodingSandboxMission` still has `assertions[]`,
not `tests[]`. The live coding loop still WORKS (the hardened backend upconverts legacy
`assertions` and grades server-side), but the browser doesn't run the richer
function-call tests or report per-test outcomes. **This is the #1 fix.** Root `src/` is
LEGACY → DELETE candidate (task #15/#22).

The good news from the inventory: the deployed `frontend/` is a real, single, non-mock
app — ~50 API groups wired to real endpoints, age adaptation (AGE_8_9/AGE_10_11/AGE_12_14,
matches backend), full en+ar i18n with RTL mirroring, one page per feature, **zero
mock/fake/TODO/legacy markers found**, graceful Loading/Empty/Error states. So this phase
is targeted fixes + a few gaps, NOT a rebuild.

## Legend
Action: KEEP · REWORK · REPLACE · MERGE · BUILD · DELETE
Status: PRODUCTION_READY · COMPLETE · PARTIAL · BROKEN · MISWIRED · MOCK_ONLY ·
BACKEND_ONLY · FRONTEND_ONLY · MISSING · LEGACY · BLOCKED

## Engine → surface ledger (deployed frontend)

| Engine / capability | Backend | Frontend surface (frontend/src) | API wired | Real data | Action | Status |
|---|---|---|---|---|---|---|
| Auth / login / register | auth | auth/pages/{Login,Register}Page | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Onboarding + age select | auth (ageBand) | onboarding/pages/* (language/welcome/age/interests/character/complete) | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Home / Living World | gamification+mastery+missions | dashboard/pages/DashboardPage (LivingWorldHero, WorldJourneyStrip, Recommendations, DailyGoal) | ✅ | ✅ | REWORK | PARTIAL (task #4 — demote stat grids, one clear Next Action, add Review-due) |
| Worlds + World detail | worlds/world-state | worlds/pages/{Worlds,WorldDetail}Page | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Domain path (generic) | learning/domains/:slug/path | CurriculumBrowsePage + learning/paths pages | 🟡 uses learningApi.getConceptsForDomain, NOT the new generic /learning/domains/:slug/path | ✅ | REWORK | PARTIAL (task #5 — wire the generic domain-path endpoint) |
| Missions + player + activity | missions | missions/pages/{MissionsBrowse,MissionDetail,MissionPlayer,MissionComplete} | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Evidence | mastery/evidence | implicit in mission submit + credentials; no dedicated surface | 🟡 | ✅ | BUILD | MISSING (task #10 — child "what did I prove" surface) |
| Mastery / progress | mastery | gamification/pages/ProgressPage, BalancedDevelopmentPage, Dashboard | ✅ | ✅ | REWORK | PARTIAL (task #10 — child-friendly states, no raw decimals) |
| Review / FSRS / Practice | mastery.review-due + flashcards FSRS | **NONE** — masteryApi.getReviewDue + getGoals have ZERO consumers | ❌ | — | BUILD | MISSING (task #10 — the clearly-orphaned capability) |
| Recommendations | adaptive | dashboard RecommendationsSection (adaptiveApi.getRecommendations) | ✅ | ✅ | KEEP | PRODUCTION_READY |
| English | english (strands + /english/path) | english/pages/{EnglishStrands,EnglishCoach} | ✅ | ✅ | REWORK | PARTIAL (task #6 — primary = "what next" path, not just 9 cards) |
| Coding execution | coding-sandbox (NEW test model) | features/coding/components/{CodeMissionRunner,PyodideRunner,SandpackMission} inside MissionPlayer | 🟡 OLD stdout/assertions contract | ✅ | REWORK | PARTIAL → **#1 FIX** (task #7 — port test-model/testOutcomes to deployed tree) |
| Coding browse | coding concepts | coding/pages/CodingPage | ✅ | ✅ | KEEP | PRODUCTION_READY |
| AI Literacy | cross-curricular (ai-literacy) + new ai-mission spine | CrossCurricularPage/DetailPage; new ai-mission via MissionPlayer | 🟡 catalog wired; new mission slice not surfaced as a path | ✅ | REWORK | PARTIAL (task #8) |
| Creativity | creativity + new creativity-mission spine | creativity/pages/CreativityGalleryPage; new mission via MissionPlayer | 🟡 gallery wired; CREATE loop not surfaced as path | ✅ | REWORK | PARTIAL (task #9) |
| Critical Thinking | critical-thinking concepts | thinking/pages/ThinkingSkillsPage/Detail | ✅ | ✅ | KEEP (audit only, do NOT build slice) | PARTIAL |
| Flashcards (FSRS) | flashcards | learn/pages/FlashcardsStudyPage | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Stories | stories | stories/pages/{StoriesList,StoryReader} | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Simulations | simulations | simulations/pages/{Simulations,SimulationPlayer} | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Projects | projects | projects/pages/{Projects,ProjectDetail} | ✅ | ✅ | KEEP/REWORK | PARTIAL (task #11 — full brief→build→submit→portfolio→evidence chain) |
| Portfolio | projects+credentials | projects/pages/MyPortfolioPage | ✅ | ✅ | REWORK | PARTIAL (task #11 — connect Project→Evidence→Competency→Mastery) |
| Credentials | credentials | gamification CredentialsSection + MyPortfolio | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Characters | characters | characters/pages/{CharacterGallery,CharacterChat} + onboarding CharacterIntro | ✅ | ✅ | REWORK | PARTIAL (task #12 — deliberate roles + states, ≥1 animated) |
| Voice | voice (Bedrock-gated) | voice/pages/VoiceChatPage + voiceApi | ✅ | 🟡 runtime Bedrock-gated | REWORK | PARTIAL/BLOCKED (task #12 — full state machine, provider blocked) |
| Gamification (XP/coins/achievements/streak) | gamification | AchievementsPage, LeaderboardPage, ProgressPage, CosmeticShopPage, DailyGoalCard | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Search | search | layout SearchBar (searchApi) | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Notifications | notifications | layout NotificationBell | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Safety / Moderation | safety-escalation/policy | admin AdminSafetyEscalations/Policy pages | ✅ | ✅ | KEEP | PRODUCTION_READY (admin) |
| Consent / GDPR | legal | parents/pages/ParentPrivacyPage (legalApi consent/export/delete) | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Parent dashboard | parents | parents/pages/ParentDashboardPage | ✅ | ✅ | REWORK | PARTIAL (task #13 — surface real evidence/mastery/next/entitlements) |
| Time limits | parents | parents/pages/ParentTimeLimitsPage | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Subscriptions / Plans / Entitlements | entitlements | PlansPage (entitlementsApi) | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Reflection / metacognition | reflection | missions ReflectionQuickCheck | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Cross-curricular (AI/entrepreneurship/digital/career/comms) | cross-curricular | CrossCurricularPage/Detail | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Analytics / insights | analytics/learning-events | LearningInsightsPage | ✅ | ✅ | KEEP | PRODUCTION_READY |
| Admin / CMS (17 pages) | many | admin/pages/* (missions/feature-flags/analytics/audit/safety/interventions/misconceptions/ai-eval/qa/memory/experiments/prompts/content) | ✅ | ✅ | KEEP | PRODUCTION_READY (admin) |
| Content provenance / licensing | content-provenance | admin content-items/qa pages | ✅ | ✅ | KEEP | PRODUCTION_READY (admin) |
| Legacy root frontend | — | root `src/` (tanstack_start_ts) | — | — | DELETE | LEGACY (task #15/#22) |

## Prioritized execution queue (maps to phase tasks)
1. **Coding execution → deployed tree** (task #7): port test-model + testOutcomes +
   CodingTest types + lazy-load from root `src/` into `frontend/src/features/coding/*`
   + `frontend/src/lib/api/endpoints.ts`. Highest priority — the marquee upgrade isn't live.
2. **Review/Practice center** (task #10): the one orphaned capability — build a
   `/practice` surface consuming `masteryApi.getReviewDue`.
3. **Home rework** (task #4), **Domain path generic wiring** (task #5), **English "what next"**
   (task #6), **AI/Creativity mission paths** (tasks #8/#9), **Evidence + child mastery UX**
   (task #10), **Projects→Portfolio→Evidence chain** (task #11), **Characters/Voice** (task #12),
   **Parent real data** (task #13).
4. **Age/Arabic/responsive/a11y QA** (task #14), **delete legacy root `src/`** (task #15),
   **E2E + perf + gates** (task #16), **deploy + acceptance report** (task #17).

## Honest coverage summary (initial)
- Backend engines represented in deployed frontend: **~46 / ~50** have a real wired surface.
- Genuinely MISSING surfaces: **Review/Practice** (orphaned), **dedicated Evidence** view.
- MISWIRED/stale: **Coding execution** (old contract in deployed tree), **generic domain path**
  (uses older concepts endpoint).
- Mock-only surfaces: **0** found in the deployed tree.
- Legacy to delete: the entire root `src/` frontend.

---

## Route inventory + mock sweep (task #15)

Extracted directly from `frontend/src/app/router/index.tsx` (the canonical
react-router-dom v6 router). 44 `<Route>` entries. Classification:

### Public (no shell)
- `/login`, `/register` — FINAL.
- `/` — RootRoute (signed-in → /dashboard, else LandingPage). FINAL.
- `*` — catch-all → /dashboard. FINAL.

### Onboarding (ProtectedRoute, no tab-bar shell)
- `/onboarding/{language,welcome,age,interests,character,complete}` — FINAL (guided wizard).

### Child-facing app (AppShell + ProtectedRoute)
- `/dashboard` (Home), `/practice`, `/evidence` — FINAL.
- `/missions`, `/missions/:id`, `/missions/play/:runId` (lazy), `/missions/complete` — FINAL.
- `/worlds`, `/worlds/:id`, `/simulations`, `/simulations/:slug` — FINAL.
- `/learn`, `/learn/concepts/:id`, `/learn/paths`, `/learn/paths/:id`, `/learn/flashcards`, `/learn/visual-language` — FINAL.
- `/learning/domains/:slug/path` — FINAL (generic domain path, task #5).
- `/projects`, `/projects/:id`, `/portfolio` — FINAL.
- `/plans` — FINAL. `/community` — FINAL.
- `/achievements`, `/leaderboard`, `/progress`, `/balanced` — FINAL (gamification).
- `/english`, `/english/coach`, `/coding` — FINAL (domain landings).
- `/stories`, `/stories/:id`, `/creativity` — FINAL.
- `/characters` (lazy gallery), `/characters/:id/chat` — FINAL.
- `/shop` (lazy cosmetics) — FINAL. `/insights` — FINAL.
- `/cross-curricular/:category`, `/cross-curricular/:category/:slug` — FINAL.
- `/thinking/:engine`, `/thinking/:engine/:slug` — FINAL.
- `/voice-chat` (lazy) — FINAL (provider-gated runtime).

### Parent-only (guardian endpoints)
- `/parents` (lazy dashboard), `/parents/children/:learnerId/time-limits`, `/parents/children/:learnerId/privacy` — FINAL.

### Admin-only (AdminRoute-gated, both client + server RolesGuard)
- `/admin/{missions,feature-flags,question-templates,analytics,audit-log,safety-escalations,interventions,misconceptions,ai-eval,assessment-quality,content-qa,memory-governance,experiments,safety-policies,prompt-templates,content-items}` — FINAL (staff CMS/governance).

### Verdicts
- **DELETE routes: none.** No `Old*/New*/V2*/Legacy*/Temp*/Prototype*/Copy*/Backup*`
  route or page files exist in `frontend/src` (the two "Template" filename hits —
  AdminPromptTemplatePage, AdminQuestionTemplatesPage — are real admin pages).
- **MERGE: none identified** — no duplicate routes.
- **Mock sweep: ZERO** mock/fake/placeholder/dummy/Lorem occurrences in
  `frontend/src` (grep clean). Empty states are honest CharacterState components.

The ONLY legacy frontend is the repo-root `src/` (Lovable scaffold) — its removal
is tracked separately (task #20, owner-gated) in `plans-local/77`.

---

## Completion-bar rigor (task #6 — do NOT treat "API consumed" as done)

Every engine row is scored against an 8-stage bar. "A component imports the API"
is only stage 2 — NOT production-ready.

| Stage | Meaning |
| --- | --- |
| 1 API EXISTS | backend endpoint present |
| 2 API CONSUMED | a frontend surface calls it |
| 3 UX EXISTS | a real page/section renders it |
| 4 UX COMPLETE | child-friendly, i18n EN+AR, loading/empty/error, no jargon |
| 5 VISUAL QA | reviewed in a browser (EN+AR, ages, devices) |
| 6 E2E | automated end-to-end journey |
| 7 DEPLOYED | shipped to prod via deploy.sh |
| 8 LIVE VERIFIED | exercised against prod with real data |

### Honest current standing (this reconciliation phase)

- **Stages 1–4 reached** for every engine surface touched this phase (Home,
  domain path, English, Coding, AI-Literacy, Creativity, Practice/Review,
  Evidence, Projects/Portfolio, Characters, Voice, Parent, Mastery, Age labels):
  real endpoints, real UX, EN+AR, honest states, no jargon. Verified by tsc +
  40 vitest + the home-bundle perf gate.
- **Stage 5 (visual QA):** PARTIAL — Playwright harness scaffolded (opt-in,
  `frontend/e2e`), one automated Home journey written (renders + no-coding-runtime
  + Arabic RTL). Full human QA across 7-9/10-12/13-15 × phone/tablet/desktop ×
  EN/AR is PENDING a real environment.
- **Stage 6 (E2E):** PARTIAL — harness + first spec exist; not yet a broad suite,
  and not a deploy gate (needs browser binaries; would change the npm ci lockfile).
- **Stage 7 (deployed):** PENDING — owner runs `scripts/deploy.sh` (now includes
  the enum/migration/test/home-bundle gates).
- **Stage 8 (live verified):** PENDING — needs server access + (for voice) Bedrock
  creds. The 4 domains were proven live end-to-end in a PRIOR phase on prod DB;
  the surfaces added this phase need a fresh live pass after deploy.

No row is marked PRODUCTION_READY on code inspection alone. Stages 5–8 are the
owner-run remainder tracked in `plans-local/78_FRONTEND_ACCEPTANCE_REPORT.md`.

### Per-engine 8-stage standing (honest, this phase)

Legend: ✅ done · ⏳ pending (needs live env) · ▲ partial. Columns:
API=api exists · CON=api consumed · UX=ux exists · CMP=ux complete (i18n/states/
no-jargon) · TST=unit/component tested · VQA=visual QA · DEP=deployed · LIVE=live-verified.

| Engine / surface | API | CON | UX | CMP | TST | VQA | DEP | LIVE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home (living world) | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| Domain path (generic) | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| English | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| Coding (execution + coach) | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| AI Literacy | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| Creativity (CREATE loop) | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| Practice / Review (FSRS) | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| Evidence (child) | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| Mastery (child bands) | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| Projects / Portfolio | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| Characters (states) | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| Voice (state machine) | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ (Bedrock-gated) |
| Parent (dashboard + plan) | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| Entitlements / plan | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| Safety (parent-facing) | ⏳ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ (no parent-safe backend projection yet) |

VQA/DEP/LIVE are the owner-run remainder (no network path to prod from the dev
workspace). Nothing is PRODUCTION_READY until its LIVE column is ✅.
