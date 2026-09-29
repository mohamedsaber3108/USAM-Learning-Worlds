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
