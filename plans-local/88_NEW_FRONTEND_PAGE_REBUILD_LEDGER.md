# 88 — New Frontend Page Rebuild Ledger

> Every current + required page tracked against the REBUILD-FROM-BLANK standard.
> Current `frontend-rebuild/src` pages are **PROVISIONAL** — none is FINAL until
> rebuilt from blank on the finalized design system + new IA + real API + AR/EN
> + RTL + responsive + a11y + motion + preview-verified, with the superseded
> implementation deleted. A page is not FINAL just because it renders.
>
> Status vocab: `NOT_STARTED` · `AUDITING` · `DESIGNING` · `REBUILDING` ·
> `CONNECTING` · `TESTING` · `VISUAL_QA` · `PREVIEW_VERIFIED` · `FINAL`.
> FINAL requires `Rebuilt-from-blank = YES` for every provisional page.

## Rebuild order (per directive §27)

1. Research ✅ (docs/research/FINAL_FRONTEND_REFERENCE_STUDY.md)
2. Design-system primitives IN CODE
3. Landing (from blank) + new public nav
4. Auth + onboarding + public pages
5. Learner shell + Home + Learn hub
6. All learner page families (specialized English/Coding/AI/Creativity)
7. Guardian → Moderator → Admin/CMS
8. Reconcile + cleanup + verify + final audit

## Ledger

Columns: Route · Role · Backend · Provisional file · Rebuilt-from-blank · Real API (shape-verified) · AR/EN · RTL · Responsive · A11y · Motion · Preview-verified · Old deleted · Status.

### Public
| Route | Provisional file | Rebuilt-from-blank | Real API | Status |
| --- | --- | --- | --- | --- |
| `/` Landing | public/LandingPage.tsx | **YES — rebuilt from blank** | static | REBUILT (preview-verify pending owner) |
| `/pricing` | public/PricingPage.tsx | YES — rebuilt on DS + public shell | plans (verified) | REBUILT |
| `/login` | auth/LoginPage.tsx | YES — rebuilt on Field/Card/AuthShell | auth/login (verified) | REBUILT |
| `/signup` | auth/SignupPage.tsx | YES — rebuilt on Field/Card/AuthShell | auth/register (verified) | REBUILT |
| `/verify/:uid` | public/VerifyCredentialPage.tsx | NO | credentials/:uid | AUDITING |
| `/how-it-works` | public/ContentPages.tsx | YES — built | static | REBUILT |
| `/for-families` | public/ContentPages.tsx | YES — built | static | REBUILT |
| `/safety` | public/ContentPages.tsx | YES — built | static | REBUILT |
| `/legal` privacy center | public/ContentPages.tsx | YES — built | legal (static copy) | REBUILT |
| `*` 404 | router NotFound | NO | — | AUDITING |

### Onboarding
| `/onboarding` | onboarding/OnboardingPage.tsx | YES — rebuilt on Stepper/Card/AuthShell | age-band/preferences (verified) | REBUILT |

### Learner (shell + families)
| Route | Provisional file | Status |
| --- | --- | --- |
| shell | components/layout/AppShell.tsx | AUDITING (rebuild as role shell) |
| `/app` Home | learner/HomePage.tsx | AUDITING |
| `/app/learn` | learner/LearnPage.tsx | AUDITING |
| `/app/learn/:slug` | learner/DomainPathPage.tsx | AUDITING (add specialized English/Coding/AI/Creativity UX) |
| `/app/missions/:id` | learner/MissionDetailPage.tsx | AUDITING |
| `/app/runs/:runId` | learner/MissionPlayerPage.tsx + activities/* | AUDITING (shapes fixed; redesign UX) |
| `/app/practice` | learner/PracticePage.tsx | AUDITING |
| `/app/progress` | learner/ProgressPage.tsx | AUDITING |
| `/app/projects` (+`/:id`) | learner/ProjectsPage.tsx, ProjectDetailPage.tsx | AUDITING (add workspace/milestones/feedback/submit/reflection) |
| `/app/portfolio` | learner/PortfolioPage.tsx | AUDITING |
| `/app/create` | learner/CreativityPage.tsx | AUDITING (brief/create/improve/gallery/Mira) |
| `/app/companions` | learner/CompanionsPage.tsx | AUDITING (gallery + interaction) |
| `/app/community` | learner/CommunityPage.tsx | AUDITING |
| `/app/credentials` | learner/CredentialsPage.tsx | AUDITING |
| `/app/rewards` | learner/RewardsPage.tsx | AUDITING |
| `/app/settings` | learner/SettingsPage.tsx | AUDITING (profile/preferences/a11y/language) |
| `/app/search` | learner/SearchPage.tsx | AUDITING |
| `/app/notifications` | learner/NotificationsPage.tsx | AUDITING |
| `/app/stories` (+`/:id`) | learner/StoriesPage.tsx | AUDITING |
| `/app/simulations` | learner/SimulationsPage.tsx | AUDITING (+ player) |
| `/app/voice` | learner/VoicePage.tsx | AUDITING (gated) |
| evidence | (fold into progress) | NOT_STARTED |
| worlds / world-detail / journey | (none) | required — BUILD |

### Guardian
| Route | Provisional file | Status |
| --- | --- | --- |
| `/parent` | parent/ParentHomePage.tsx | AUDITING |
| `/parent/child/:id` | parent/ChildDetailPage.tsx | AUDITING |
| `/parent/privacy` | parent/ParentPrivacyPage.tsx | AUDITING |
| `/parent/plan` | parent/ParentPlanPage.tsx | AUDITING |

### Moderator
| `/mod` | moderator/ModerationHomePage.tsx | AUDITING |
| `/mod/escalations` | moderator/EscalationsPage.tsx | AUDITING |
| `/mod/community` | moderator/CommunityModerationPage.tsx | AUDITING |
| `/mod/interventions` | moderator/InterventionsPage.tsx | AUDITING |

### Admin
| `/admin` | admin/AdminOverviewPage.tsx | AUDITING |
| `/admin/content` | admin/AdminContentPage.tsx | AUDITING |
| `/admin/curriculum` | admin/AdminCurriculumPage.tsx | AUDITING |
| `/admin/ai` | admin/AdminAiSafetyPage.tsx | AUDITING |
| `/admin/analytics` | admin/AdminAnalyticsPage.tsx | AUDITING |
| `/admin/platform` | admin/AdminPlatformPage.tsx | AUDITING |

## Raw counts (checkpoint — start of rebuild-from-zero phase)

- REQUIRED FINAL PAGES: ~50 (route surfaces + required-new)
- REBUILT FROM ZERO: 0
- FINAL: 0
- UNDER CONSTRUCTION: 1 (Landing, next)
- NOT STARTED (required-new): how-it-works, for-families, safety, legal center, worlds/world-detail/journey, simulation player, project workspace stages
- PROVISIONAL (rebuild candidates): 44 files
- SUPERSEDED FILES DELETED: 0
- Per role provisional: Public 3, Learner 22, Guardian 4, Moderator 4, Admin 7, shared/activities 4

Updated continuously as each page reaches FINAL (rebuilt-from-blank).
