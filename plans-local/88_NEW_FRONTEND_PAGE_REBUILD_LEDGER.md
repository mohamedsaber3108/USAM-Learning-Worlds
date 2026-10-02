# 88 — New Frontend Page Rebuild Ledger

> **RESET 2026-10-02 (owner-confirmed governing decision).** The prior version
> of this ledger (dated 2026-09-30) marked all 47 routes `REBUILT` and implied
> near-FINAL acceptance. That status is **retracted as a completeness claim**.
> "Rebuilt from blank" proved true structurally (confirmed: real routes, real
> design tokens, no placeholders, builds/type-checks/tests pass) but did NOT
> mean contract-correct, feature-complete, or visually approved. A full
> controller-by-controller reconciliation against the CURRENT backend
> (2026-10-02) found real functional bugs (now fixed — see below) and a long
> list of backend capabilities with zero frontend representation. This ledger
> now reflects that ground truth and drives the remaining work.
>
> Workspace: `M:\USAM-main\frontend-rebuild\` is the canonical final frontend
> under construction. `frontend/` is the legacy functional baseline / regression
> oracle — stays live, not touched by this ledger. Root `src/` is quarantined.
>
> Status vocab (per surface): `NOT_STARTED` · `AUDITING` · `DESIGNING` ·
> `REBUILDING` · `CONNECTING` · `TESTING` · `VISUAL_QA` · `PREVIEW_VERIFIED` ·
> `FINAL`. A row at `FINAL` means: real API wired + contract-verified against
> current backend, all required states covered (loading/empty/error/auth/
> entitlement), EN+AR+RTL, responsive, a11y baseline, tested, visually
> reviewed, and preview-verified. Nothing below is marked `FINAL` in this reset
> pass — rows are set to their honest current state.

## Reconciliation findings baked into this reset (2026-10-02)

Full detail in `docs/product/FINAL_CAPABILITY_REGISTRY.md` "RECONCILIATION
PASS" section. Summary:

**Real bugs found and FIXED this pass:**
- B2: `EscalationsPage` resolve() sent the wrong body shape (400 every time) → fixed with a real resolve dialog + corrected `moderationApi.resolve` typing.
- B3: `CommunityModerationPage` sent `decision: 'approve'/'remove'` instead of `'APPROVED'/'REJECTED'` (silent data corruption — reviewed items never left the pending queue) → fixed.
- B4: backend `community.controller.ts` + `ai.controller.ts` moderation routes gated on `user.educator`/`user.parent`, properties that don't exist on any authenticated user → always 403'd, including for ADMIN. Fixed on the backend with proper `RolesGuard` + `@Roles()`.
- D1: `ProjectDetailPage` rendered `data.milestones`/`data.curriculumContext` fields `GET /projects/:id` never returns (separate endpoints) → fixed with 3 real queries + `projectsApi` expanded (create/update/remove/showcase/milestones/curriculum-context/rubric/collaborators/research-notes).
- D2: dead `p.status` fallback (field doesn't exist on `Project`, only `state`) → removed.

**Missing surfaces** carried into the ledger below as `NOT_STARTED` rows that
did not exist as rows before: character chat, coding/English AI coach, generic
AI feedback/hint/explain, reflection, daily goals, flashcards, cross-curricular
catalogs, thinking-skills catalogs, visual-language, cosmetic/streak-freeze
shop, mission history, project rubric viewer, guardian consent capture, admin
mission CRUD controls, admin curriculum-mapping/content-provenance/difficulty-
calibration/assessment-quality, memory-governance admin stats.

## Rebuild order (unchanged intent, re-executing with corrected gates)

1. Reconciliation against current backend — **DONE** (2026-10-02, commit 7f9e095).
2. Research validation — **DONE** (2026-10-02, addendum appended to the reference study, commit 1dd4f8e).
3. Design-system completeness audit — **DONE** (2026-10-02): foundation verified coherent, kept; additive gaps noted (Tooltip, Pagination, Timeline, DataList primitives — build when a surface needs them, not blocking).
4. Landing re-audit against the full explanation bar — **DONE** (2026-10-02, commit 1dd4f8e): character-presence gap found + fixed (CharacterFace/CharacterStage ported, hero + companions rebuilt). Visually verified.
5. Navigation audit — **DONE** (2026-10-02, commit 367eb8d): structurally sound (role-variant model, RTL-safe logical properties, responsive patterns) — kept, not rebuilt. Real logo + favicon wired in (was text-only). Visually verified LTR/RTL/mobile.
6. Fill every `NOT_STARTED`/`PARTIAL` row below to `FINAL`. **← current phase.**
7. Guardian → Moderator → Admin/CMS completion.
8. Legal/Privacy integration.
9. Test depth expansion + preview harness + visual/RTL/responsive/a11y QA.
10. Final reconciliation before cutover prep (no cutover yet).

### NAVIGATION (cross-cutting, audited 2026-10-02)

| Surface | Role | File | Status |
| --- | --- | --- | --- |
| Public nav (desktop + mobile sheet) | PUBLIC | `features/public/PublicNav.tsx` | VISUAL_QA (logo wired, RTL verified) |
| Role shell nav (desktop + bottom tab bar) | LEARNER/GUARDIAN/MODERATOR/ADMIN | `components/layout/AppShell.tsx` | VISUAL_QA (logo wired, role-variant model confirmed correct) |
| Public footer | PUBLIC | `features/public/PublicFooter.tsx` | CONNECTING (text-only identity, acceptable) |

---

## LEDGER

Columns: Route · Role · Backend capability · Current file · Real API (verified) · Known gaps · Status.

### PUBLIC

| Route | Role | Backend | File | Real API | Known gaps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `/` Landing | PUBLIC | static + role redirect | `features/public/LandingPage.tsx` | n/a (static) | FIXED 2026-10-02: hero + companions section had zero character presence (lucide icon standing in for companions). Ported CharacterFace/CharacterStage SVG system from legacy `frontend/` (real asset, 15 characters matching backend seed exactly); Azouz now leads hero, 5 mentors shown as real characters. Research-validated (docs/research/.../section D). Visually verified. | VISUAL_QA |
| `/pricing` | PUBLIC | `entitlements.plans` | `features/public/PricingPage.tsx` | `GET /entitlements/plans` ✓ | — | CONNECTING |
| `/login` | PUBLIC | `auth.login` | `features/auth/LoginPage.tsx` | `POST /auth/login` ✓ | — | CONNECTING |
| `/signup` | PUBLIC | `auth.register` | `features/auth/SignupPage.tsx` | `POST /auth/register` ✓ | — | CONNECTING |
| `/how-it-works` | PUBLIC | static | `features/public/ContentPages.tsx` | n/a | — | CONNECTING |
| `/for-families` | PUBLIC | static | `features/public/ContentPages.tsx` | n/a | — | CONNECTING |
| `/safety` | PUBLIC | static | `features/public/ContentPages.tsx` | n/a | — | CONNECTING |
| `/legal` | PUBLIC | static | `features/public/ContentPages.tsx` | n/a | Needs Legal Center expansion (see Legal/Privacy section below) | NOT_STARTED |
| `/verify/:uid` | PUBLIC | `credentials.verify` | `features/public/VerifyCredentialPage.tsx` | `GET /credentials/:uid` ✓ | — | CONNECTING |
| `*` 404 | PUBLIC | n/a | `app/router.tsx` NotFound | n/a | Honest, role-aware — verified correct | TESTING |

### ONBOARDING

| Route | Role | Backend | File | Real API | Known gaps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `/onboarding` | LEARNER | `auth.updateAgeBand`, `auth.updatePreferences` | `features/onboarding/OnboardingPage.tsx` | `PATCH /auth/me/age-band`, `PATCH /auth/me/preferences` | Not yet confirmed `updatePreferences` is actually called from this page — needs re-check | AUDITING |

### LEARNER

| Route | Role | Backend | File | Real API | Known gaps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `/app` Home | LEARNER | gamification, adaptive, mastery | `features/learner/HomePage.tsx` | progression/streak/achievements/recommendations ✓ | Missing: daily-goals widget, mission-history teaser | CONNECTING |
| `/app/learn` | LEARNER | `worlds.list` | `features/learner/LearnPage.tsx` | `GET /worlds` ✓ | — | CONNECTING |
| `/app/learn/:slug` | LEARNER | `learning.getDomainPath` | `features/learner/DomainPathPage.tsx` | `GET /learning/domains/:slug/path` ✓ | — | CONNECTING |
| `/app/missions/:id` | LEARNER | `missions.getById/start` | `features/learner/MissionDetailPage.tsx` | ✓ | — | CONNECTING |
| `/app/runs/:runId` | LEARNER | missions run loop + coding-sandbox | `features/learner/MissionPlayerPage.tsx` + `activities/*` | submit/complete/coding-sandbox ✓ | **Missing: post-mission reflection step** (`reflection.prompts`/`respond` defined, never called) | REBUILDING |
| `/app/practice` | LEARNER | `mastery.getReviewDue` | `features/learner/PracticePage.tsx` | `GET /mastery/review-due` ✓ | **No flashcards surface at all** (`flashcardsApi` defined, zero route/UI) | REBUILDING |
| `/app/progress` | LEARNER | `mastery.overview/byDomain` | `features/learner/ProgressPage.tsx` | ✓ | Missing: `mastery.goals`, mission-history (`GET /missions/history/me`) | CONNECTING |
| `/app/projects` | LEARNER | `projects.mine` | `features/learner/ProjectsPage.tsx` | `GET /projects/my` ✓ | Fixed D2 (dead status field) this pass | CONNECTING |
| `/app/projects/:id` | LEARNER | `projects.getById` + milestones + curriculum-context | `features/learner/ProjectDetailPage.tsx` | ✓ (fixed D1 this pass — 3 real queries) | Missing: rubric viewer, collaborators, research notes UI | REBUILDING |
| `/app/portfolio` | LEARNER | `projects.portfolio` | `features/learner/PortfolioPage.tsx` | `GET /projects/portfolio/:learnerId` ✓ | — | CONNECTING |
| `/app/create` | LEARNER | `creativity.prompts/submissions` | `features/learner/CreativityPage.tsx` | ✓ (prompts, submit, mine) | Missing: public gallery (`creativity.gallery`), `prompts/:slug` detail, visibility toggle | REBUILDING |
| `/app/companions` | LEARNER | `characters.list` | `features/learner/CompanionsPage.tsx` | `GET /characters` ✓ | **Companion gallery exists but you cannot chat** — character chat/conversations entirely unwired despite rich backend support | REBUILDING |
| `/app/community` | LEARNER | `community.feed/report` | `features/learner/CommunityPage.tsx` | ✓ | Missing: `trending`, `search`, `stats` | REBUILDING |
| `/app/credentials` | LEARNER | `credentials.mine` | `features/learner/CredentialsPage.tsx` | `GET /credentials/me` ✓ | — | CONNECTING |
| `/app/rewards` | LEARNER | gamification | `features/learner/RewardsPage.tsx` | progression/achievements/streak ✓ | **Missing: cosmetic shop + streak-freeze shop** (unlock/equip/leaderboard all defined, unused) | REBUILDING |
| `/app/settings` | LEARNER | `auth.updatePreferences` | `features/learner/SettingsPage.tsx` | — | Needs re-verification | AUDITING |
| `/app/search` | LEARNER | `search.query` | `features/learner/SearchPage.tsx` | `GET /search` ✓ | — | CONNECTING |
| `/app/notifications` | LEARNER | notifications | `features/learner/NotificationsPage.tsx` | list/unread/markRead/markAllRead ✓ | — | CONNECTING |
| `/app/stories` + `/:id` | LEARNER | `learning.stories` | `features/learner/StoriesPage.tsx` | ✓ | — | CONNECTING |
| `/app/simulations` | LEARNER | `simulation.list` | `features/learner/SimulationsPage.tsx` | `GET /simulations` ✓ | **No detail/play view** — `:slug` + decision-node endpoints unused, catalog-only | REBUILDING |
| `/app/voice` | LEARNER | `voice.turn` (BLOCKED_EXTERNAL) | `features/learner/VoicePage.tsx` | n/a — honest gated state | Correct as-is (provider creds pending) | FINAL (gated) |
| **MISSING** `/app/practice/flashcards` or equivalent | LEARNER | `flashcards.getDue/review` | — | `flashcardsApi` defined, 0 callers | No route exists at all | NOT_STARTED |
| **MISSING** mission history view | LEARNER | `missions.history/me` | — | not in endpoints.ts | No surface | NOT_STARTED |
| **MISSING** daily goals widget | LEARNER | `daily-goals.getProgress` | — | defined, 0 callers | No surface | NOT_STARTED |

### SPECIALIZED DOMAIN / CONTENT CATALOGS

| Route | Role | Backend | File | Real API | Known gaps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| **MISSING** Cross-curricular (AI-literacy/entrepreneurship/financial/digital/career/communication/coding-concepts) | LEARNER | `cross-curricular.*` | — | `crossCurricularApi` defined, 0 callers | No routes in router.tsx at all | NOT_STARTED |
| **MISSING** Problem-solving / computational-thinking / critical-thinking catalogs | LEARNER | `problem-solving.*` | — | `thinkingApi` defined, 0 callers | No routes | NOT_STARTED |
| **MISSING** Visual-language cards | LEARNER | `visual-language.*` | — | `visualLanguageApi` defined, 0 callers | No routes | NOT_STARTED |
| **MISSING** Character AI chat/conversations | LEARNER | `ai.character` (chat/conversations CRUD) | `CompanionsPage.tsx` (list only) | 0 callers for chat endpoints | Companion gallery is a dead end — can't talk to a companion | NOT_STARTED |
| **MISSING** Coding Coach | LEARNER | `ai.coding-coach` | — | 0 callers | No inline coding help surfaced in mission player | NOT_STARTED |
| **MISSING** English Coach | LEARNER | `ai.english-coach` | — | 0 callers | No inline English help | NOT_STARTED |
| **MISSING** Generic AI feedback/hint/explain/analyze | LEARNER | `ai.controller` | — | 0 callers | No inline AI tutoring anywhere | NOT_STARTED |

### GUARDIAN

| Route | Role | Backend | File | Real API | Known gaps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `/parent` | GUARDIAN | `parents.children` | `features/parent/ParentHomePage.tsx` | `GET /parents/children` ✓ | Not calling `family-summary` or per-child `dashboard` — may be intentional (children list is enough for a home), re-verify | CONNECTING |
| `/parent/child/:id` | GUARDIAN | `parents.dashboard/progress/activity/reflections/safety/time-limits` | `features/parent/ChildDetailPage.tsx` | ✓ broad coverage | — | CONNECTING |
| `/parent/privacy` | GUARDIAN | `legal.export/delete` | `features/parent/ParentPrivacyPage.tsx` | `GET /legal/export/:id`, `POST /legal/delete/:id` ✓ | **Missing: consent capture entirely** (`POST /legal/consent`, `GET /legal/consent/:id` — core COPPA/GDPR UI, not export/delete) | REBUILDING |
| `/parent/plan` | GUARDIAN | `entitlements.subscribe/cancel` | `features/parent/ParentPlanPage.tsx` | ✓ | No live payment provider (honest, by design) | CONNECTING |

### MODERATOR

| Route | Role | Backend | File | Real API | Known gaps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `/mod` | MODERATOR, ADMIN | — | `features/moderator/ModerationHomePage.tsx` | — | — | AUDITING |
| `/mod/escalations` | MODERATOR, ADMIN | `safety-escalations.*` | `features/moderator/EscalationsPage.tsx` | list/assign/resolve/stats ✓ | **B2 FIXED this pass** (resolve dialog + correct shape) | TESTING |
| `/mod/community` | MODERATOR, ADMIN | `community.moderation.*` | `features/moderator/CommunityModerationPage.tsx` | quarantined/review ✓ | **B3 FIXED** (decision values) + **B4 FIXED on backend** (role-guard bug that always 403'd) | TESTING |
| `/mod/interventions` | MODERATOR, ADMIN | `admin-interventions.*` | `features/moderator/InterventionsPage.tsx` | list/ack/resolve ✓ | Missing: `GET /admin/interventions/learner/:learnerId` detail view | CONNECTING |

### ADMIN / CMS

| Route | Role | Backend | File | Real API | Known gaps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `/admin` | ADMIN | analytics overview | `features/admin/AdminOverviewPage.tsx` | ✓ | — | CONNECTING |
| `/admin/content` | ADMIN | `content-items.*` | `features/admin/AdminContentPage.tsx` | list/create-status ✓ | Missing: `POST` create full form, `GET /:id` detail | REBUILDING |
| `/admin/curriculum` | ADMIN, MODERATOR (partial) | `admin-missions`, `admin-misconceptions`, `content-qa` | `features/admin/AdminCurriculumPage.tsx` | list-only for all three | **Missing: mission create/update/delete controls** (endpoints exist, no UI); **missing entirely: curriculum-mapping, content-provenance, difficulty-calibration, assessment-quality admin UI** | REBUILDING |
| `/admin/ai` | ADMIN | ai-eval, prompt-templates, safety-policies | `features/admin/AdminAiSafetyPage.tsx` | list-only for all three | Missing: prompt-template edit/deactivate, safety-policy versions, ai-eval run drill-in | REBUILDING |
| `/admin/analytics` | ADMIN | `analytics.*` | `features/admin/AdminAnalyticsPage.tsx` | overview/daily-activity ✓ | Missing: `events-by-type`, `retention-cohorts`, `stickiness` | CONNECTING |
| `/admin/platform` | ADMIN | feature-flags, experiments, audit | `features/admin/AdminPlatformPage.tsx` | ✓ | — | CONNECTING |
| **MISSING** memory-governance admin stats | ADMIN | `ai.memory-governance` | — | 0 callers (backend guard confirmed correct) | No admin surface at all | NOT_STARTED |

### LEGAL / PRIVACY (cross-cutting, see dedicated section below)

| Surface | Role | Backend | Status |
| --- | --- | --- | --- |
| Legal Center (`/legal`) | PUBLIC | static + `legal.*` model-backed where real | NOT_STARTED (expansion) |
| Guardian consent capture | GUARDIAN | `POST /legal/consent`, `GET /legal/consent/:learnerId` | NOT_STARTED |
| Data export | GUARDIAN | `GET /legal/export/:learnerId` | CONNECTING (done) |
| Account/data deletion | GUARDIAN | `POST /legal/delete/:learnerId` | CONNECTING (done) |

---

## Raw counts (honest, 2026-10-02 reset)

| Metric | Count |
| --- | --- |
| Router.tsx `<Route>` entries | 46 |
| Rows at FINAL | 1 (Voice, correctly gated-honest) |
| Rows with a confirmed, fixed bug this pass | 4 (B2, B3, B4, D1/D2) |
| Rows with partial API coverage (some endpoints unused) | ~20 |
| Required surfaces with ZERO frontend representation | 17 (flashcards, mission history, daily goals, cross-curricular ×7 collapsed to 1 row, thinking-skills ×3 collapsed to 1 row, visual-language, character chat, coding coach, english coach, generic AI tutor, consent capture, memory-governance admin, 4 admin engines collapsed to 1 row) |
| Fabricated/non-backed capabilities | 0 |

This is the execution queue. Work proceeds row by row until every required row
is `FINAL`. No cutover prep begins until this ledger has zero rows below
`PREVIEW_VERIFIED`/`FINAL` for all P0/P1 surfaces.
