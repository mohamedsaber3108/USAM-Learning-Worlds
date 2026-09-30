# 79 — Deployed Frontend Legacy Audit (Decision A regression oracle)

> Under **Decision A**, the DEPLOYED `frontend/` (React + Vite + react-router v6,
> `usam-learning-worlds-frontend`, live at `1ae4dcd`) is reclassified from
> "canonical" to **LEGACY FUNCTIONAL BASELINE / REGRESSION ORACLE / REFERENCE
> ONLY**. It is NOT the design/IA/nav foundation of the new frontend. This audit
> classifies every deployed route/surface so the new build (a) loses no valid
> behavior it proves, and (b) does not inherit its architecture.
>
> Distinct from ledger 77 (which covers the ROOT `src/` Lovable scaffold — that
> stays quarantined, do not delete, do not ask again).

## Verdict legend

- `REFERENCE` — keep as regression/behavior reference; the new FE must match or
  improve the proven behavior, not the visuals.
- `SALVAGE IDEA` — a UX/pedagogy/content idea worth reproducing cleanly in the
  new system.
- `REBUILD` — surface is needed; rebuild from the new IA/design (do not port
  components).
- `MERGE` — consolidate with another surface in the new IA.
- `DELETE` — not needed in the final product (superseded/duplicate/legacy-only).
- `OBSOLETE` — served no real product purpose.

The deployed frontend has REAL backend wiring (axios `lib/api/endpoints.ts`, ~50
groups) — that wiring is the **contract reference** for the new typed client. No
production mocks (grep-clean per ledger 78). So every route below is a genuine
regression data point.

## Route-by-route classification

### Public / auth / onboarding

| Legacy route | New target | Verdict | Notes |
| --- | --- | --- | --- |
| `/` RootRoute (branch on token) → LandingPage | `/` ecosystem landing | REBUILD | New landing = ecosystem presentation, not token-branch bounce. Keep "public value before wall" idea. |
| `/login` | `/login` | REBUILD | Same real `POST /auth/login`; new design/states. |
| `/register` | `/signup` | REBUILD | Rename to `/signup`; real `POST /auth/register`. |
| `/onboarding/language` | `/onboarding` (step) | MERGE | 5 separate onboarding routes → one guided flow with steps. |
| `/onboarding/welcome` | `/onboarding` (step) | MERGE | |
| `/onboarding/age` | `/onboarding` (step) | MERGE | Real `PATCH /auth/me/age-band`. |
| `/onboarding/interests` | `/onboarding` (step) | MERGE | Real `PATCH /auth/me/preferences`. |
| `/onboarding/character` | `/onboarding` (step) | MERGE | Companion intro. |
| `/onboarding/complete` | `/onboarding` (step) | MERGE | |
| (missing) guardian onboarding / add-child | `/onboarding` (guardian) | REBUILD | Legacy lacked a clear guardian onboarding; new build adds it (register child + `POST /legal/consent`). |

### Learner surfaces

| Legacy route | New target | Verdict | Notes |
| --- | --- | --- | --- |
| `/dashboard` DashboardPage | `/app` learner home | REBUILD | New home = orient + resume + ONE next action (recommendations/progress/goals/review). |
| `/practice` PracticePage | `/app/practice` | REBUILD | Real `mastery/review-due` + flashcards. Proven consumer of FSRS — keep. |
| `/evidence` EvidencePage | fold into `/app/progress` | MERGE | Evidence + mastery unified as "progress". |
| `/missions` MissionsBrowsePage | `/app/learn` + `/app/missions/:id` | MERGE | Mission discovery flows from domain path. |
| `/missions/:id` MissionDetailPage | `/app/missions/:id` | REBUILD | Real `GET /missions/:id`; entitlement cap state. |
| `/missions/play/:runId` MissionPlayerPage (lazy) | `/app/runs/:runId` | REBUILD | Core player; keep lazy-load of coding runtime. Real submit/complete. |
| `/missions/complete` MissionCompletePage | player success state | MERGE | |
| `/worlds`, `/worlds/:id` | `/app/learn`, `/app/learn/:slug` | MERGE | Worlds + domains unified into Learn. |
| `/simulations`, `/simulations/:slug` | within Learn | REBUILD | Simulation engine surface. |
| `/learn` CurriculumBrowsePage | `/app/learn` | MERGE | |
| `/learn/concepts/:id` ConceptDetailPage | within domain path | MERGE | |
| `/learn/paths`, `/learn/paths/:id` | within Learn | MERGE | |
| `/learn/flashcards` FlashcardsStudyPage | `/app/practice` | MERGE | |
| `/learn/visual-language` | within Learn | MERGE | |
| `/learning/domains/:slug/path` DomainPathPage | `/app/learn/:slug` | REFERENCE+REBUILD | The proven generic domain-path pattern (english/coding/ai-literacy) — keep the ONE-shared-page idea; rebuild UI. |
| `/projects`, `/projects/:id` | `/app/projects`, `/app/projects/:id` | REBUILD | Real projects module. |
| `/portfolio` MyPortfolioPage | `/app/portfolio` | REBUILD | |
| `/plans` PlansPage | `/pricing` (public) + `/parent/plan` | MERGE | Public catalog + parent subscription. |
| `/community` CommunityPage | `/app/community` | REBUILD | |
| `/achievements`, `/leaderboard`, `/progress`, `/balanced` | `/app/rewards` + `/app/progress` | MERGE | 4 gamification pages → consolidated rewards + progress. |
| `/english`, `/english/coach` | within Learn (english domain) + inline coach | MERGE | |
| `/coding` CodingPage | within Learn (coding domain) | MERGE | Legacy was flat/mock-ish list; new uses domain path. |
| `/characters` gallery (lazy), `/characters/:id/chat` | `/app/companions` | REBUILD | Character engine + state machine — keep the 15 companion states idea. |
| `/stories`, `/stories/:id` | within Learn | REBUILD | Story reader. |
| `/creativity` CreativityGalleryPage | `/app/create` | REBUILD | Real creativity prompts/submissions (no mastery by design). |
| `/shop` CosmeticShopPage (lazy) | `/app/rewards` | MERGE | Cosmetic economy folds into rewards. |
| `/insights` LearningInsightsPage | fold into `/app/progress` | MERGE | Learner-facing analytics view. |
| `/cross-curricular/:category`, `/:slug` | within Learn | REBUILD | Real cross-curricular content. |
| `/thinking/:engine`, `/:slug` | within Learn | REBUILD | Problem/computational/critical thinking. |
| `/voice-chat` VoiceChatPage (lazy) | learner feature | REFERENCE | PROVIDER-GATED; keep behavior reference, honest gated state. |
| (missing) credentials wallet, search overlay, notifications center, settings | `/app/credentials`, search, panel, `/app/settings` | REBUILD | Legacy under-served these; backend supports them. |

### Parent (guardian)

| Legacy route | New target | Verdict | Notes |
| --- | --- | --- | --- |
| `/parents` ParentDashboardPage (lazy) | `/parent` | REBUILD | ⚠ Legacy had NO client role-gate on parent routes ("no client role-gate yet — see followup"). New build MUST gate by role + guardian profile. |
| `/parents/children/:learnerId/time-limits` | `/parent/child/:id` controls | MERGE | |
| `/parents/children/:learnerId/privacy` | `/parent/privacy` | REBUILD | Consent + GDPR export/delete. |
| (missing) child dashboard/progress/activity/reflections/safety as first-class | `/parent/child/:id` tabs | REBUILD | Backend has all; legacy under-exposed. |

### Admin (17 pages) — all `AdminRoute`-gated

| Legacy routes | New target | Verdict | Notes |
| --- | --- | --- | --- |
| `/admin/missions` | `/admin/missions` | REBUILD | Real admin missions CRUD. |
| `/admin/content-items` | `/admin/content` | REBUILD | CMS + lifecycle DRAFT→PUBLISHED. |
| `/admin/feature-flags`, `/admin/experiments`, `/admin/audit-log` | `/admin/platform` | MERGE | Platform ops consolidated. |
| `/admin/question-templates`, `/admin/misconceptions`, `/admin/content-qa`, `/admin/assessment-quality` | `/admin/curriculum` | MERGE | Curriculum & QA consolidated. |
| `/admin/analytics` | `/admin/analytics` | REBUILD | |
| `/admin/safety-escalations`, `/admin/interventions` | `/mod/*` (moderator) + admin view | REBUILD | These are moderator-scoped (`@Roles(MODERATOR,ADMIN)`); new build gives moderators their own console. |
| `/admin/ai-eval`, `/admin/prompt-templates`, `/admin/safety-policies` | `/admin/ai` | MERGE | AI & safety ops consolidated. |
| `/admin/memory-governance` | `/admin/platform` (guarded) | REBUILD + ⚠ | Backend endpoint lacks RolesGuard — FE must NOT expose until backend fixed. |

### Fallbacks

| Legacy | New target | Verdict | Notes |
| --- | --- | --- | --- |
| `*` → Navigate `/dashboard` | `*` → honest 404 | REBUILD | New build uses a real 404 + role-aware redirect, not a silent bounce. |

## Key regressions the new FE MUST preserve (from the proven baseline)

1. **Coding trust loop** — client-exec (Pyodide) + server re-validation with
   hidden tests; runtime lazy-loaded off unrelated routes. (Proven live.)
2. **Learning loop** — mission → submit → evidence → mastery → review;
   `missionsPerDay` cap; summative-retake block. (Proven live.)
3. **Generic domain-path pattern** — one page for every domain via slug.
4. **Home bundle perf gate** — coding/AI/chart runtimes must not load on Home.
5. **Child-language framing** — no backend jargon; mastery/age/review in kid
   words; 15 companion states.
6. **Real API contracts** — `lib/api/endpoints.ts` is the contract reference for
   the new typed client (login `{user,accessToken,refreshToken}`, Bearer, refresh
   in body, `/api` prefix).

## Structural problems the new FE MUST fix (why the rebuild is justified)

1. **~55 flat routes, no role-aware IA** — learner/parent/admin all under one
   `AppShell`; parent routes had NO client role gate.
2. **Feature-per-route sprawl** — 4 gamification pages, scattered learn/*
   routes, evidence vs progress split — fragmented mental model.
3. **Admin = 17 sibling pages** — no CMS IA; module-mirroring, not task-oriented.
4. **Unknown route → silent `/dashboard` bounce** — no honest 404.
5. **Landing = token-branch bounce**, not an ecosystem presentation.
6. **No first-class credentials/search/notifications/settings** despite backend
   support.

These are product-architecture problems (IA/nav/organization/design), exactly
what Decision A authorizes rebuilding — while keeping the proven functional
behaviors above as regression targets.
