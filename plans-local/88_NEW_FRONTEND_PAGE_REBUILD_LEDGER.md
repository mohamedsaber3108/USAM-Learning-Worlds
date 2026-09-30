# 88 — New Frontend Page Rebuild Ledger

> Every current + required page tracked against the REBUILD-FROM-BLANK standard.
> All `frontend-rebuild/src` pages have been **rebuilt from blank** on the
> finalized WHITE/GREEN/BLACK design system with new IA, real (shape-verified)
> APIs, EN/AR + RTL, responsive layout, a11y, and reduced-motion-aware motion.
> The only remaining gate is **live preview verification**, which runs on the
> server (the dev workspace has no production network path). A page is not
> "final-final" for cutover until the owner-run preview harness passes; every
> page is otherwise complete in code.
>
> Status vocab: `NOT_STARTED` · `AUDITING` · `DESIGNING` · `REBUILDING` ·
> `CONNECTING` · `TESTING` · `VISUAL_QA` · `PREVIEW_VERIFIED` · `FINAL`.
> `REBUILT` below = rebuilt-from-blank on the DS + real API + EN/AR/RTL +
> responsive + a11y + motion, tsc/build/tests/home-bundle gates green.
> `PREVIEW_VERIFIED` is set only after the owner-run harness confirms it live.

## Rebuild order (per directive §27) — ALL COMPLETE

1. ✅ Research (docs/research/FINAL_FRONTEND_REFERENCE_STUDY.md)
2. ✅ Design-system primitives IN CODE (WHITE/GREEN/BLACK, no Radix/default shadcn)
3. ✅ Landing (from blank) + new public nav/footer
4. ✅ Auth + onboarding + public pages
5. ✅ Learner shell + Home (living world) + Learn hub
6. ✅ All learner page families (English/Coding/AI/Creativity specialization)
7. ✅ Guardian → Moderator → Admin/CMS
8. ✅ Reconcile + cleanup + verify + final audit (this pass)

## Gate status (repo-wide, this pass)

- `npx tsc -b --noEmit` → **PASS**
- `npm run build` → **PASS** (CodingActivityPanel is a separate lazy chunk; coding runtime absent from entry chunk)
- `npm run test` (vitest smoke) → **PASS** (5/5)
- `npm run check:home-bundle` → **PASS**
- Placeholders / mocks / TODOs in `frontend-rebuild/src` → **0** (grep clean)
- Unreferenced source files in `frontend-rebuild/src` → **0** (import-graph scan)
- Preview harness (`npm run verify:preview`) → **owner-run on server** (pending)

## Ledger

Columns: Route · File · Rebuilt-from-blank · Real API (shape-verified) · Status.

### Public
| Route | File | Rebuilt-from-blank | Real API | Status |
| --- | --- | --- | --- | --- |
| `/` Landing | public/LandingPage.tsx | YES (rebuilt from zero; ecosystem narrative, not SaaS funnel) | static | REBUILT |
| `/pricing` | public/PricingPage.tsx | YES | entitlements/plans | REBUILT |
| `/login` | auth/LoginPage.tsx | YES | auth/login | REBUILT |
| `/signup` | auth/SignupPage.tsx | YES | auth/register | REBUILT |
| `/verify/:uid` | public/VerifyCredentialPage.tsx | YES (Card/Badge/States, valid/invalid) | credentials/verify | REBUILT |
| `/how-it-works` | public/ContentPages.tsx | YES | static | REBUILT |
| `/for-families` | public/ContentPages.tsx | YES | static | REBUILT |
| `/safety` | public/ContentPages.tsx | YES | static | REBUILT |
| `/legal` privacy center | public/ContentPages.tsx | YES | static copy | REBUILT |
| `*` 404 | router NotFound | YES (honest, role-aware back, renders for auth AND unauth) | — | REBUILT |

### Onboarding
| Route | File | Rebuilt-from-blank | Real API | Status |
| --- | --- | --- | --- | --- |
| `/onboarding` | onboarding/OnboardingPage.tsx | YES (Stepper/Card) | age-band/preferences | REBUILT |

### Learner (shell + families)
| Route | File | Rebuilt-from-blank | Status |
| --- | --- | --- | --- |
| shell | components/layout/AppShell.tsx | YES (icon nav + search + notifications badge + lang + profile; mobile tab bar; role-variant) | REBUILT |
| `/app` Home | learner/HomePage.tsx | YES (living-world home) | REBUILT |
| `/app/learn` | learner/LearnPage.tsx | YES | REBUILT |
| `/app/learn/:slug` | learner/DomainPathPage.tsx | YES (skills→competencies, mastery states, CEFR/strand) | REBUILT |
| `/app/missions/:id` | learner/MissionDetailPage.tsx | YES | REBUILT |
| `/app/runs/:runId` | learner/MissionPlayerPage.tsx + activities/* | YES (run.mission.activities; submit → evaluation.correct/score/feedback) | REBUILT |
| `/app/practice` | learner/PracticePage.tsx | YES (flashcards/adaptive/review-due) | REBUILT |
| `/app/progress` | learner/ProgressPage.tsx | YES (mastery overview + by-domain) | REBUILT |
| `/app/projects` (+`/:id`) | learner/ProjectsPage.tsx, ProjectDetailPage.tsx | YES (workspace/milestones/feedback/submit) | REBUILT |
| `/app/portfolio` | learner/PortfolioPage.tsx | YES | REBUILT |
| `/app/create` | learner/CreativityPage.tsx | YES (brief/create/improve/gallery/Mira) | REBUILT |
| `/app/companions` | learner/CompanionsPage.tsx | YES (gallery + interaction) | REBUILT |
| `/app/community` | learner/CommunityPage.tsx | YES | REBUILT |
| `/app/credentials` | learner/CredentialsPage.tsx | YES | REBUILT |
| `/app/rewards` | learner/RewardsPage.tsx | YES (gamification/rewards/daily goals) | REBUILT |
| `/app/settings` | learner/SettingsPage.tsx | YES (profile/preferences/a11y/language) | REBUILT |
| `/app/search` | learner/SearchPage.tsx | YES | REBUILT |
| `/app/notifications` | learner/NotificationsPage.tsx | YES | REBUILT |
| `/app/stories` (+`/:id`) | learner/StoriesPage.tsx | YES (list + reader) | REBUILT |
| `/app/simulations` | learner/SimulationsPage.tsx | YES | REBUILT |
| `/app/voice` | learner/VoicePage.tsx | YES (provider-gated) | REBUILT |

### Guardian
| Route | File | Rebuilt-from-blank | Status |
| --- | --- | --- | --- |
| `/parent` | parent/ParentHomePage.tsx | YES | REBUILT |
| `/parent/child/:id` | parent/ChildDetailPage.tsx | YES (progress/activity/safety) | REBUILT |
| `/parent/privacy` | parent/ParentPrivacyPage.tsx | YES | REBUILT |
| `/parent/plan` | parent/ParentPlanPage.tsx | YES | REBUILT |

### Moderator (task-oriented, NOT an admin clone)
| Route | File | Rebuilt-from-blank | Status |
| --- | --- | --- | --- |
| `/mod` | moderator/ModerationHomePage.tsx | YES | REBUILT |
| `/mod/escalations` | moderator/EscalationsPage.tsx | YES | REBUILT |
| `/mod/community` | moderator/CommunityModerationPage.tsx | YES | REBUILT |
| `/mod/interventions` | moderator/InterventionsPage.tsx | YES | REBUILT |

### Admin (task-oriented, not one giant table)
| Route | File | Rebuilt-from-blank | Status |
| --- | --- | --- | --- |
| `/admin` | admin/AdminOverviewPage.tsx | YES | REBUILT |
| `/admin/content` | admin/AdminContentPage.tsx | YES | REBUILT |
| `/admin/curriculum` | admin/AdminCurriculumPage.tsx | YES | REBUILT |
| `/admin/ai` | admin/AdminAiSafetyPage.tsx | YES | REBUILT |
| `/admin/analytics` | admin/AdminAnalyticsPage.tsx | YES | REBUILT |
| `/admin/platform` | admin/AdminPlatformPage.tsx | YES | REBUILT |

## Raw counts (end of rebuild-from-zero phase)

- REQUIRED PAGES: 47 route surfaces (Public 10, Onboarding 1, Learner 22 + shell, Guardian 4, Moderator 4, Admin 6)
- REBUILT FROM ZERO: 47 / 47 (**100%**)
- NOT STARTED: 0
- PLACEHOLDER SURFACES: 0
- SUPERSEDED PROVISIONAL FILES: replaced in place (no `V2`/`Old`/`New` sprawl; router `Placeholder.tsx` deleted)
- UNREFERENCED / DEAD SOURCE FILES: 0
- PREVIEW_VERIFIED (owner-run harness): 0 (pending single server run; gate is QA, not a code gap)

## Definition of "FINAL" for cutover

A route reaches `FINAL` only after the owner-run preview harness
(`BASE=https://kids.usamif.com/preview npm run verify:preview`) passes against
the staged `/preview/` build. Until then every page is `REBUILT` (complete in
code, all local gates green). Cutover follows runbook 85.
