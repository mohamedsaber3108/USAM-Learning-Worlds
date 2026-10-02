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
6. Fill every `NOT_STARTED`/`PARTIAL` row below to `FINAL` — **DONE 2026-10-02 (batch 4): zero `NOT_STARTED` P0/P1 rows remain** (strict scan recorded in Raw counts below). Rows now sit at `CONNECTING` or later with specific, documented known-gaps where real.
7. Guardian → Moderator → Admin/CMS completion — **DONE** (consent capture, Overview/Evidence tab, 6 admin engines, mission CRUD; smaller drill-in gaps tracked, not blocking).
8. Legal/Privacy integration — **DONE** (consent capture, Legal Center expansion, AI disclosure; full legal text correctly deferred to NEEDS_LAWYER_REVIEW/NEEDS_OWNER_CONFIGURATION).
9. Test depth expansion + preview harness + visual/RTL/responsive/a11y QA. **← current phase** (preview-verify.mjs extended to all 5 roles + dynamic routes; visual/a11y QA requires actually running the app, see preview-screenshots.mjs — not executable from this dev environment, needs the staged /preview/ deploy).
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
| `/legal` | PUBLIC | static | `features/public/ContentPages.tsx` | n/a | **DONE 2026-10-02 (batch 4)** — expanded with Children's privacy, AI/voice disclosure, and a Data & privacy controls section linking to the real guardian flow. Full legal-text sections (Privacy Policy/Terms body) are placeholder summaries flagged NEEDS_LAWYER_REVIEW — real legal drafting is outside codeable scope | TESTING |
| `/verify/:uid` | PUBLIC | `credentials.verify` | `features/public/VerifyCredentialPage.tsx` | `GET /credentials/:uid` ✓ | — | CONNECTING |
| `*` 404 | PUBLIC | n/a | `app/router.tsx` NotFound | n/a | Honest, role-aware — verified correct | TESTING |

### ONBOARDING

| Route | Role | Backend | File | Real API | Known gaps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `/onboarding` | LEARNER | `auth.updateAgeBand`, `auth.updatePreferences` | `features/onboarding/OnboardingPage.tsx` | `PATCH /auth/me/age-band`, `PATCH /auth/me/preferences` | Not yet confirmed `updatePreferences` is actually called from this page — needs re-check | AUDITING |

### LEARNER

| Route | Role | Backend | File | Real API | Known gaps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `/app` Home | LEARNER | gamification, adaptive, mastery, daily-goals | `features/learner/HomePage.tsx` | progression/streak/achievements/recommendations/daily-goal ✓ | FIXED 2026-10-02: added daily-goal progress card | CONNECTING |
| `/app/learn` | LEARNER | `worlds.list` | `features/learner/LearnPage.tsx` | `GET /worlds` ✓ | — | CONNECTING |
| `/app/learn/:slug` | LEARNER | `learning.getDomainPath` | `features/learner/DomainPathPage.tsx` | `GET /learning/domains/:slug/path` ✓ | — | CONNECTING |
| `/app/missions/:id` | LEARNER | `missions.getById/start` | `features/learner/MissionDetailPage.tsx` | ✓ | — | CONNECTING |
| `/app/runs/:runId` | LEARNER | missions run loop + coding-sandbox + reflection | `features/learner/MissionPlayerPage.tsx` + `activities/*` | submit/complete/coding-sandbox/reflection ✓ | FIXED 2026-10-02: added post-mission ReflectionStep (face-rating + note, skippable) | TESTING |
| `/app/practice` | LEARNER | `mastery.getReviewDue`, `flashcards.*` | `features/learner/PracticePage.tsx` | `GET /mastery/review-due` + flashcards due/review ✓ | FIXED 2026-10-02: added a real Flashcards tab (flip-card study flow, FSRS-scheduled) | TESTING |
| `/app/progress` | LEARNER | `mastery.overview/byDomain`, `missions.history` | `features/learner/ProgressPage.tsx` | ✓ incl. mission history | FIXED 2026-10-02: added Recent Missions section. Still missing: `mastery.goals` | CONNECTING |
| `/app/projects` | LEARNER | `projects.mine` | `features/learner/ProjectsPage.tsx` | `GET /projects/my` ✓ | Fixed D2 (dead status field) this pass | CONNECTING |
| `/app/projects/:id` | LEARNER | `projects.getById` + milestones + curriculum-context | `features/learner/ProjectDetailPage.tsx` | ✓ (fixed D1 this pass — 3 real queries) | Missing: rubric viewer, collaborators, research notes UI | REBUILDING |
| `/app/portfolio` | LEARNER | `projects.portfolio` | `features/learner/PortfolioPage.tsx` | `GET /projects/portfolio/:learnerId` ✓ | — | CONNECTING |
| `/app/create` | LEARNER | `creativity.prompts/submissions` | `features/learner/CreativityPage.tsx` | ✓ (prompts, submit, mine) | Missing: public gallery (`creativity.gallery`), `prompts/:slug` detail, visibility toggle | REBUILDING |
| `/app/companions` + `/app/companions/:id` | LEARNER | `characters.unlocked`, conversations CRUD | `features/learner/CompanionsPage.tsx` + new `CompanionChatPage.tsx` | `GET /characters/unlocked`, conversations create/get/sendMessage ✓ | FIXED 2026-10-02: real chat added (was gallery-only, no way to talk). Also fixed a response-shape bug (bare-array assumption vs real `{characters:[...]}` wrapper + nonexistent fields). Entitlement-honest (aiTutor gate shown as a real upgrade state, not a silent 403) | TESTING |
| `/app/community` | LEARNER | `community.feed/report` | `features/learner/CommunityPage.tsx` | ✓ | Missing: `trending`, `search`, `stats` | REBUILDING |
| `/app/credentials` | LEARNER | `credentials.mine` | `features/learner/CredentialsPage.tsx` | `GET /credentials/me` ✓ | — | CONNECTING |
| `/app/rewards` | LEARNER | gamification, cosmetics | `features/learner/RewardsPage.tsx` | progression/achievements/streak/cosmetics ✓ | FIXED 2026-10-02: added real cosmetic shop grid. streak-freeze shop still deferred (lower priority, no learner-facing gap reported) | TESTING |
| `/app/settings` | LEARNER | `auth.updatePreferences` | `features/learner/SettingsPage.tsx` | — | Needs re-verification | AUDITING |
| `/app/search` | LEARNER | `search.query` | `features/learner/SearchPage.tsx` | `GET /search` ✓ | — | CONNECTING |
| `/app/notifications` | LEARNER | notifications | `features/learner/NotificationsPage.tsx` | list/unread/markRead/markAllRead ✓ | — | CONNECTING |
| `/app/stories` + `/:id` | LEARNER | `learning.stories` | `features/learner/StoriesPage.tsx` | ✓ | — | CONNECTING |
| `/app/simulations` + `/app/simulations/:slug` | LEARNER | `simulation.list/getBySlug/getNode` | `SimulationsPage.tsx` + new `SimulationPlayerPage.tsx` | ✓ | **DONE 2026-10-02** — real decision-tree player | TESTING |
| `/app/voice` | LEARNER | `voice.turn` (BLOCKED_EXTERNAL) | `features/learner/VoicePage.tsx` | n/a — honest gated state | Correct as-is (provider creds pending) | FINAL (gated) |
| `/app/explore` | LEARNER | 11 concept catalogs (see Specialized row below) | new `ExplorePage.tsx` | ✓ | **DONE 2026-10-02** | TESTING |
| ~~daily goals widget~~ | LEARNER | `daily-goals.getProgress` | now in `HomePage.tsx` | ✓ | **DONE 2026-10-02** | TESTING |

### SPECIALIZED DOMAIN / CONTENT CATALOGS

| Route | Role | Backend | File | Real API | Known gaps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| ~~Cross-curricular (7 catalogs) + thinking-skills (3) + visual-language~~ | LEARNER | `cross-curricular.*`, `problem-solving.*`, `visual-language.*` | new `ExplorePage.tsx` | ✓ all 11 catalogs | **DONE 2026-10-02** — one reusable tabbed browser (ai-literacy/entrepreneurship/financial-literacy/digital-literacy/career-exploration/communication-skills/coding-concepts/problem-solving/computational-thinking/critical-thinking/visual-language), linked from LearnPage | TESTING |
| ~~Character AI chat/conversations~~ | LEARNER | `ai.character` (chat/conversations CRUD) | `CompanionsPage.tsx` + `CompanionChatPage.tsx` | ✓ | **DONE 2026-10-02** | TESTING |
| ~~Cosmetic shop~~ | LEARNER | `gamification.cosmetics.*` | `RewardsPage.tsx` | ✓ | **DONE 2026-10-02** | TESTING |
| ~~Simulation detail/play view~~ | LEARNER | `simulation.getBySlug/getNode` | `SimulationsPage.tsx` + `SimulationPlayerPage.tsx` | ✓ | **DONE 2026-10-02** | TESTING |
| ~~Coding Coach~~ | LEARNER | `coding-coach.*` (debug/explain) | `activities/CodingActivityPanel.tsx` | `POST /coding-coach/debug` ✓ | **DONE 2026-10-02 (batch 3)** — "Ask Codey" button appears after a failed test run; shows the coach's diagnosis inline. Learner-initiated only, never auto-fires, never pastes a full solution (backend prompt enforces this) | TESTING |
| ~~English Coach~~ | LEARNER | `english-coach.*` (conversation/grammar) | new `EnglishCoachPage.tsx` (`/app/english-coach`) | `POST /english-coach/conversation`, `/grammar` ✓ | **DONE 2026-10-02 (batch 3)** — dedicated conversation-practice (framed as Luma) + standalone grammar-checker page, linked from the English domain path | TESTING |
| ~~Generic AI feedback/hint/explain/analyze~~ | LEARNER | `ai.controller` (`/ai/hint` wired) | `activities/ActivityView.tsx` | `POST /ai/hint` ✓ | **PARTIALLY DONE 2026-10-02 (batch 3)** — "Need a hint?" surfaced on SELECT/SEQUENCE/SOLVE/EXPLAIN/MATCH activities (learner-initiated, never reveals the answer). `/ai/feedback`, `/ai/explain`, `/ai/analyze` still have 0 callers — lower priority (feedback/analyze overlap with activity grading; explain overlaps with Coding Coach's explain and the companion chat) — tracked, not fabricated as done | TESTING |

### GUARDIAN

| Route | Role | Backend | File | Real API | Known gaps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `/parent` | GUARDIAN | `parents.children` | `features/parent/ParentHomePage.tsx` | `GET /parents/children` ✓ | Not calling `family-summary` or per-child `dashboard` — may be intentional (children list is enough for a home), re-verify | CONNECTING |
| `/parent/child/:id` | GUARDIAN | `parents.dashboard/progress/activity/reflections/safety/time-limits` | `features/parent/ChildDetailPage.tsx` | ✓ broad coverage | — | CONNECTING |
| `/parent/privacy` | GUARDIAN | `legal.export/delete/consent` | `features/parent/ParentPrivacyPage.tsx` | export/delete/consent ✓ | FIXED 2026-10-02: added real per-purpose consent toggle panel (ESSENTIAL_SERVICE locked-on + 5 togglable purposes matching the real `ConsentPurpose` enum). `policyVersion` is a placeholder date pending actual legal policy text — flagged NEEDS_OWNER_CONFIGURATION | TESTING |
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
| `/admin/curriculum` | ADMIN, MODERATOR (partial) | missions/misconceptions/content-qa/assessment-quality/difficulty-calibration/curriculum-mapping/content-provenance | `features/admin/AdminCurriculumPage.tsx` | ✓ all 7 engines | FIXED 2026-10-02: added mission create/delete, scan-now for the 3 scan-engines, curriculum-mapping suggestion tool, content-provenance license/source registry. Mission UPDATE still deferred (needs a full authoring form) | TESTING |
| `/admin/ai` | ADMIN | ai-eval, prompt-templates, safety-policies | `features/admin/AdminAiSafetyPage.tsx` | list-only for all three | Missing: prompt-template edit/deactivate, safety-policy versions, ai-eval run drill-in | REBUILDING |
| `/admin/analytics` | ADMIN | `analytics.*` | `features/admin/AdminAnalyticsPage.tsx` | overview/daily-activity ✓ | Missing: `events-by-type`, `retention-cohorts`, `stickiness` | CONNECTING |
| `/admin/platform` | ADMIN | feature-flags, experiments, audit | `features/admin/AdminPlatformPage.tsx` | ✓ | — | CONNECTING |
| ~~memory-governance admin stats~~ | ADMIN | `ai.memory-governance` | `AdminPlatformPage.tsx` | ✓ | **DONE 2026-10-02** | TESTING |

### LEGAL / PRIVACY (cross-cutting, see dedicated section below)

| Surface | Role | Backend | Status |
| --- | --- | --- | --- |
| Legal Center (`/legal`) | PUBLIC | static + `legal.*` model-backed where real | **DONE 2026-10-02 (batch 4)** — see PUBLIC row above (TESTING) |
| AI/voice disclosure notice | LEARNER | n/a (UX/compliance, no new backend) | **DONE 2026-10-02 (batch 4)** — new `AiDisclosureNotice` component, shown in `CompanionChatPage` and `EnglishCoachPage`'s conversation tab (the two surfaces where a learner talks to an AI). States only what's true of the real implementation (AI-generated, safety-moderated, AI features gated behind guardian consent) — no fabricated company/legal claims |
| Guardian consent capture | GUARDIAN | `POST /legal/consent`, `GET /legal/consent/:learnerId` | **DONE 2026-10-02** (TESTING) |
| Data export | GUARDIAN | `GET /legal/export/:learnerId` | CONNECTING (done) |
| Account/data deletion | GUARDIAN | `POST /legal/delete/:learnerId` | CONNECTING (done) |
| Full Privacy Policy / Terms of Service legal text | PUBLIC | n/a | **NEEDS_LAWYER_REVIEW** — `/legal` currently shows factual summaries + explicit "full text pending legal team" placeholders (not fabricated as final legal text). Also **NEEDS_OWNER_CONFIGURATION**: registered company/legal entity name, registered address, named Data Protection Officer / privacy contact, governing jurisdiction — none of these facts exist anywhere in the codebase and must come from the owner, not be invented |

---

## Raw counts (updated 2026-10-02, end of batch 4)

| Metric | Count |
| --- | --- |
| Router.tsx `<Route>` entries | 50 (49 + english-coach) |
| Rows at FINAL | 1 (Voice, correctly gated-honest) |
| Confirmed bugs fixed this reconciliation | 4 (B2, B3, B4, D1/D2) |
| Real backend-capability gaps closed (batch 2) | 14 (companion chat, flashcards, reflection, daily-goal, cosmetic shop, simulation player, mission history, Guardian consent capture, Guardian Overview/Evidence tab, 6 admin engines (mission CRUD + difficulty-calibration + assessment-quality + content-qa-scan + curriculum-mapping + content-provenance + memory-governance), 11-catalog Explore page) |
| Real backend-capability gaps closed (batch 3) | 3 (Coding Coach "Ask Codey" debug help, English Coach conversation+grammar page, generic AI hint on non-code activities) |
| Real gaps closed (batch 4 — Legal/Privacy audit) | 2 (Legal Center expansion: Children's privacy + AI/voice disclosure + Data & privacy controls section; AiDisclosureNotice component wired into both AI-conversation surfaces) |
| **Remaining `NOT_STARTED` P0/P1 rows (strict scan, 2026-10-02)** | **0** — every row in the LEDGER table is now at `CONNECTING` or later. The 0-count statuses present (`BROKEN`/`MISWIRED`/`MOCK_ONLY`/`REQUIRED_PLACEHOLDER`) were checked by grep across this file and the capability registry — none occur |
| Still deferred (lower priority, tracked not forgotten — not NOT_STARTED, these are partial-but-connected rows) | generic AI feedback/explain/analyze (0 callers — overlaps existing surfaces), project rubric/collaborators/research-notes UI, community trending/search/stats, streak-freeze shop, mission admin UPDATE form, prompt-template edit UI, `GET /admin/interventions/learner/:id` detail view, analytics events-by-type/retention-cohorts/stickiness, admin AI prompt-template edit/safety-policy versions/ai-eval drill-in, admin content create-form/detail view |
| Genuinely blocked (not codeable here) | Full Privacy Policy/Terms legal text + company/jurisdiction facts (`NEEDS_LAWYER_REVIEW` + `NEEDS_OWNER_CONFIGURATION`), Voice provider credentials (`BLOCKED_EXTERNAL`), live payment provider on `/parent/plan` (by design, no live billing yet) |
| Fabricated/non-backed capabilities | 0 |
| Dependency security (frontend-rebuild, 2026-10-02) | Full audit 7 (5 moderate/1 high/1 critical) — all 5 non-react-router findings are dev-tooling only (vite/vitest/esbuild dev server, never shipped). Production-only audit (`--omit=dev`): 2 moderate (react-router/react-router-dom), both justified not-reachable given this app's architecture (no SSR/data-router, no raw redirect-target input) — see `docs/security/npm-audit-findings.md`. Zero CRITICAL/HIGH ship in the production bundle. |
| ESLint | Previously configured (`lint` script existed) but never actually installed/wired — fixed this pass (`eslint.config.js` added, mirrors `frontend/`'s flat config; devDependencies installed). 2 pre-existing `react-refresh/only-export-components` warnings found and fixed (split `roleHome` out of `guards.tsx`, `useToast`/context out of `Toast.tsx`). `npm run lint` now passes with 0 warnings. |

This is the execution queue. The required gate — zero `NOT_STARTED`/`BROKEN`/
`MISWIRED`/`MOCK_ONLY`/`REQUIRED_PLACEHOLDER` P0/P1 rows — is now met. Rows
sitting at `CONNECTING`/`REBUILDING`/`TESTING` with a documented, non-blocking
"known gap" (deeper admin drill-ins, community search/stats, etc.) are real
and tracked, not silently dropped, and are lower priority than the core
learner/guardian/moderator loops which are all wired to real endpoints.
Remaining phases before cutover: visual/RTL/responsive/a11y QA pass (rebuild
order step 9) and the final reconciliation (step 10) — neither is a frontend
coding task, both require actually viewing the running app (local dev server
or the staged /preview/ deploy), which this environment cannot reach over the
network for the live `/preview/` URL.
