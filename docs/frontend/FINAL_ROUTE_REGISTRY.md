# FINAL ROUTE REGISTRY

> Every production route in the NEW frontend, once. No undocumented routes, no
> phantom routes. `Replaces` references the legacy `1ae4dcd` route where a
> regression comparison applies. `Final?` = intended final route. `Live?` =
> shipped to prod on the new frontend (all `no` until the switch).

## Route table

| Route | Role | Purpose | Backend deps | Replaces (legacy) | Final? | Live? |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | Public | Ecosystem landing | — | `/` | yes | no |
| `/pricing` | Public | Plans catalog | `GET /entitlements/plans` | pricing/plans | yes | no |
| `/login` | Public | Login | `POST /auth/login` | `/login` | yes | no |
| `/signup` | Public | Register (LEARNER/GUARDIAN) | `POST /auth/register` | `/signup` | yes | no |
| `/verify/:uid` | Public | Credential verification | `GET /credentials/:uid` | (new) | yes | no |
| `/onboarding` | LEARNER/GUARDIAN | Post-register onboarding | `PATCH /auth/me/age-band`,`/preferences`,`POST /legal/consent` | onboarding | yes | no |
| `/app` | LEARNER | Learner home | recommendations/progression/goals/review-due | dashboard | yes | no |
| `/app/learn` | LEARNER | Worlds/domains | `GET /worlds`, domains | worlds | yes | no |
| `/app/learn/:slug` | LEARNER | Domain path | `GET /learning/domains/:slug/path` | domain path | yes | no |
| `/app/missions/:id` | LEARNER | Mission detail | `GET /missions/:id` | mission | yes | no |
| `/app/runs/:runId` | LEARNER | Mission player | missions runs/submit/complete + coding-sandbox | mission run | yes | no |
| `/app/practice` | LEARNER | Practice/review | mastery/review-due + flashcards | practice | yes | no |
| `/app/progress` | LEARNER | Mastery/progress | mastery overview/by-domain/goals | progress | yes | no |
| `/app/projects` | LEARNER | Projects | projects/my + milestones | projects | yes | no |
| `/app/projects/:id` | LEARNER | Project detail | `GET /projects/:id` (+curriculum-context, rubric) | project detail | yes | no |
| `/app/portfolio` | LEARNER | Portfolio | `GET /projects/portfolio/:learnerId` | portfolio | yes | no |
| `/app/create` | LEARNER | Creativity studio | creativity prompts/submissions/gallery | creativity | yes | no |
| `/app/companions` | LEARNER | Characters/companion | characters + conversations | characters | yes | no |
| `/app/community` | LEARNER | Community | community feed/trending/search/report | community | yes | no |
| `/app/credentials` | LEARNER | Credentials wallet | `GET /credentials/me` | credentials | yes | no |
| `/app/rewards` | LEARNER | XP/streak/cosmetics/leaderboard | gamification/* | rewards | yes | no |
| `/app/settings` | LEARNER | Settings/account | `GET /auth/me`,`PATCH /me/*` | settings | yes | no |
| `/parent` | GUARDIAN | Parent home | parents children/family-summary | parent dashboard | yes | no |
| `/parent/child/:id` | GUARDIAN | Child dashboard (tabs: progress/activity/reflections/safety/controls) | parents children/:id/* | child detail | yes | no |
| `/parent/privacy` | GUARDIAN | Consent & privacy | legal consent/export/delete | (new/partial) | yes | no |
| `/parent/plan` | GUARDIAN | Plan/subscription | entitlements me/plans/subscribe/cancel | plan | yes | no |
| `/mod` | MODERATOR | Moderation home | safety-escalations stats | (new) | yes | no |
| `/mod/escalations` | MODERATOR | Safety escalations | safety-escalations CRUD | (new) | yes | no |
| `/mod/community` | MODERATOR | Community moderation | community moderation | (new) | yes | no |
| `/mod/interventions` | MOD/ADMIN | Interventions | admin/interventions | (new) | yes | no |
| `/admin` | ADMIN | Admin home | admin/analytics/overview | admin | yes | no |
| `/admin/content` | ADMIN | Content items CMS | admin/content-items | (new) | yes | no |
| `/admin/missions` | ADMIN | Missions admin | admin/missions | (new) | yes | no |
| `/admin/provenance` | ADMIN | Provenance | admin/content-provenance | (new) | yes | no |
| `/admin/curriculum` | ADMIN | Curriculum & QA | admin/curriculum-mapping + QA + translations | (new) | yes | no |
| `/admin/ai` | ADMIN | AI & safety | admin/prompt-templates + safety-policies + ai-eval | (new) | yes | no |
| `/admin/analytics` | ADMIN | Analytics | admin/analytics/* | (new) | yes | no |
| `/admin/platform` | ADMIN | Flags/experiments/audit | feature-flags/experiments/audit | (new) | yes | no |
| `*` | All | 404 fallback | — | 404 | yes | no |

## Implementation status (2026-09-30, new frontend)

Every route in the table above is **IMPLEMENTED** as a real surface on real
backend APIs in `frontend-rebuild/` (tsc + vite build + vitest green; zero
placeholders — grep-clean). `Live? = no` for all because production still runs
the legacy `1ae4dcd` frontend until the controlled switch (task 13). Two
intentional deviations: `/app/voice` renders an honest PROVIDER-GATED state
(BLOCKED_EXTERNAL); `/admin/memory-governance` is NOT exposed (backend authz gap
documented in the capability registry). `/verify/:uid` is implemented (public
credential verification). Additional learner routes added during build:
`/app/search`, `/app/notifications`, `/app/stories(/:id)`, `/app/simulations`,
`/app/voice`, `/app/projects/:id`.

## Notes

- Voice is a feature within learner surfaces, not a route; PROVIDER-GATED.
- Admin sub-areas may consolidate several `/api/admin/*` modules per page
  (module ≠ page) — e.g. `/admin/curriculum` covers curriculum-mapping,
  content-qa, difficulty-calibration, misconceptions, translations.
- Route depth/segmentation is provisional and will be finalized with the IA doc
  (task 7); no route ships without a row here.
