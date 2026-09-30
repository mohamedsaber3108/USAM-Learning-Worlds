# FINAL PAGE AND FLOW INVENTORY

> The real surface inventory for the NEW frontend, DERIVED from
> backend + roles + journeys — not a page-count target. A capability may be a
> page, section, panel, drawer, modal, workflow step, background state, or
> admin-only screen. One backend module ≠ one page. Route list lives in
> `FINAL_ROUTE_REGISTRY.md`; backend wiring in
> `BACKEND_FRONTEND_TRACEABILITY_MATRIX.md`.

## State variants vocabulary (per surface)

`FIRST_USE` · `LOADING` · `EMPTY` · `READY` · `SUCCESS` · `ERROR` · `OFFLINE` ·
`RETRYING` · `UNAUTHORIZED (401→login)` · `RESTRICTED (403 wrong role)` ·
`ENTITLEMENT_LOCKED` · `PARENT_APPROVAL` · `BLOCKED` · `EXPIRED` · `ARCHIVED`.

Each surface lists only the states that genuinely apply. Honest empty states,
never mock data.

---

## PUBLIC (unauthenticated)

| Surface | Type | Purpose / primary action | Backend | Key states |
| --- | --- | --- | --- | --- |
| Ecosystem landing | page `/` | Explain USAM + where to start → Get started / Login | none (static) | READY, FIRST_USE |
| Pricing / plans | page `/pricing` | Show plans → choose → register | `GET /entitlements/plans` | LOADING, READY, ERROR |
| Register | page `/signup` | Create LEARNER or GUARDIAN → onboarding | `POST /auth/register` | READY, ERROR(email taken/validation), SUCCESS |
| Login | page `/login` | Authenticate → role shell | `POST /auth/login` | READY, ERROR(bad creds/suspended), SUCCESS |
| Credential verify | page `/verify/:uid` | Public proof of a credential | `GET /credentials/:uid` | LOADING, READY, EMPTY(not found), ERROR |

## ONBOARDING (post-register)

| Surface | Type | Purpose | Backend | States |
| --- | --- | --- | --- | --- |
| Learner onboarding | flow | Name/age-band/preferences + first companion | `PATCH /auth/me/age-band`, `/preferences` | FIRST_USE, LOADING, SUCCESS, ERROR |
| Guardian onboarding | flow | Add child, consent | `POST /auth/register` (child), `POST /legal/consent` | FIRST_USE, PARENT_APPROVAL, SUCCESS, ERROR |

## LEARNER

| Surface | Type | Purpose / action | Backend | States |
| --- | --- | --- | --- | --- |
| Learner home | page `/app` | Orient + resume + next best action | `GET /auth/me`, `/adaptive/recommendations`, `/gamification/progression`, `/daily-goals/me/progress`, `/mastery/review-due` | FIRST_USE, LOADING, EMPTY, READY, ERROR |
| Worlds / domains | page `/app/learn` | Pick a domain/world | `GET /worlds`, domains | LOADING, EMPTY, READY |
| Domain path | page `/app/learn/:slug` | See the skill/competency path + start | `GET /learning/domains/:slug/path`, `/english/path` | LOADING, EMPTY, READY, ENTITLEMENT_LOCKED |
| Mission detail | page `/app/missions/:id` | Understand + start mission | `GET /missions/:id` | LOADING, READY, ENTITLEMENT_LOCKED(missionsPerDay), RESTRICTED |
| Mission player | page/flow `/app/runs/:runId` | Do activities → submit → complete | `POST /missions/:id/start`, `GET /runs/:runId`, `POST /runs/:runId/submit`, `/complete` | LOADING, READY, SUCCESS, ERROR, EXPIRED(summative retake blocked) |
| Coding activity | panel within player | Edit/run/submit code | `GET /coding-sandbox/missions/:activityId`, `POST /coding-sandbox/submissions` | LOADING, READY, RETRYING, SUCCESS, ERROR(timeout/tests) |
| Reflection | step/modal | Post-mission metacognition | `GET /reflection/prompts`, `POST /reflection/responses` | READY, SUCCESS |
| Practice / review | page `/app/practice` | "Keep it strong" — due reviews + flashcards | `GET /mastery/review-due`, `/flashcards/due`, `POST /flashcards/:id/review` | LOADING, EMPTY(nothing due — honest), READY, SUCCESS |
| Progress / mastery | page `/app/progress` | See mastery by domain, evidence, goals | `GET /mastery/overview`, `/by-domain`, `/goals` | LOADING, EMPTY, READY |
| Projects | page `/app/projects` | Create/manage projects + milestones | `GET /projects/my`, `POST /projects`, milestones, research-notes | LOADING, EMPTY, READY, SUCCESS |
| Portfolio | page `/app/portfolio` | Showcase completed work | `GET /projects/portfolio/:learnerId`, `POST /:id/showcase` | LOADING, EMPTY, READY |
| Creativity studio | page `/app/create` | Prompts + submissions gallery | `GET /creativity/prompts`, `POST /submissions`, `/gallery` | LOADING, EMPTY, READY, SUCCESS |
| Companion / characters | panel + page `/app/companions` | Character state + chat | `GET /characters`, `/:id/state`, `POST /:id/chat`, conversations | READY, LOADING, ERROR |
| AI help | inline | Hint/explain/coach | `POST /ai/hint`, `/explain`, coding/english coach | LOADING, READY, ERROR |
| Community | page `/app/community` | Feed/trending/search + report | `GET /community/feed`, `/trending`, `/search`, `POST /report` | LOADING, EMPTY, READY |
| Search | overlay | Global search | `GET /search` | LOADING, EMPTY, READY |
| Notifications | panel | In-app notifications | `GET /notifications`, `/unread-count`, read/read-all | LOADING, EMPTY, READY |
| Credentials wallet | page `/app/credentials` | Earned badges + share | `GET /credentials/me` | LOADING, EMPTY, READY |
| Rewards / cosmetics | page `/app/rewards` | XP/streak/cosmetics/leaderboard(opt-in) | `GET /gamification/*` | LOADING, EMPTY, READY, SUCCESS |
| Settings / account | page `/app/settings` | Profile/preferences/age-band/language | `GET /auth/me`, `PATCH /me/*` | READY, SUCCESS, ERROR |
| Voice companion | feature | Voice turn | `POST /voice/turn` | ENTITLEMENT_LOCKED / BLOCKED_EXTERNAL (PROVIDER-GATED) |

## GUARDIAN (PARENT)

| Surface | Type | Purpose | Backend | States |
| --- | --- | --- | --- | --- |
| Parent home | page `/parent` | Children + family summary | `GET /parents/children`, `/family-summary` | FIRST_USE, LOADING, EMPTY(no children), READY |
| Child dashboard | page `/parent/child/:id` | Overview of one child | `GET /parents/children/:id/dashboard` | LOADING, READY, RESTRICTED(not your child) |
| Child progress | tab | Mastery breakdown | `GET /parents/children/:id/progress` | LOADING, EMPTY, READY |
| Child activity | tab | 7-day activity log | `GET /parents/children/:id/activity?days=` | LOADING, EMPTY, READY |
| Child reflections | tab | Reflection responses | `GET /parents/children/:id/reflections` | LOADING, EMPTY, READY |
| Child safety | tab | Escalations / all-clear | `GET /parents/children/:id/safety` | LOADING, EMPTY(all-clear — healthy), READY, BLOCKED |
| Controls | section | Time limits | `POST /parents/children/:id/time-limits` | READY, SUCCESS |
| Consent & privacy | page `/parent/privacy` | Consent, data export/delete | `POST /legal/consent`, `GET /export/:id`, `POST /delete/:id` | READY, SUCCESS, PARENT_APPROVAL |
| Plan / subscription | page `/parent/plan` | View plan, activate/cancel | `GET /entitlements/me`, `/plans`, `POST /subscribe`, `/cancel/:id` | LOADING, READY, SUCCESS (manual provider; no live payment) |

## MODERATOR

| Surface | Type | Purpose | Backend | States |
| --- | --- | --- | --- | --- |
| Moderation home | page `/mod` | Queues overview + stats | `GET /safety-escalations/stats/summary` | LOADING, EMPTY, READY |
| Safety escalations | page `/mod/escalations` | Triage/assign/resolve | `GET /safety-escalations`, `/:id`, assign, resolve | LOADING, EMPTY, READY, SUCCESS |
| Community moderation | page `/mod/community` | Review quarantined | `GET /community/moderation/quarantined`, `POST /review/:id` | LOADING, EMPTY, READY, SUCCESS |
| Interventions | page `/mod/interventions` | Acknowledge/resolve | `GET /admin/interventions`, ack, resolve | LOADING, EMPTY, READY |

## ADMIN

| Surface | Type | Purpose | Backend | States |
| --- | --- | --- | --- | --- |
| Admin home | page `/admin` | Ops overview | `GET /admin/analytics/overview` | LOADING, READY |
| Content items (CMS) | page `/admin/content` | Author + lifecycle DRAFT→PUBLISHED | `/admin/content-items` CRUD + `PATCH /:id/status` | LOADING, EMPTY, READY, SUCCESS |
| Missions admin | page `/admin/missions` | Mission CRUD | `/admin/missions` CRUD | LOADING, EMPTY, READY, SUCCESS |
| Provenance | page `/admin/provenance` | Licenses/sources/compliance | `/admin/content-provenance/*` | LOADING, READY |
| Curriculum & QA | page `/admin/curriculum` | Mapping, content QA, difficulty, misconceptions, translations | multiple `/admin/*` + translations | LOADING, READY |
| AI & safety | page `/admin/ai` | Prompt templates, safety policies, AI eval | `/admin/prompt-templates`, `/admin/safety-policies`, `/admin/ai-eval` | LOADING, READY |
| Analytics | page `/admin/analytics` | Product analytics | `/admin/analytics/*` | LOADING, READY |
| Platform | page `/admin/platform` | Feature flags, experiments, audit | `/feature-flags`, `/experiments`, `/audit/logs` | LOADING, READY |

## GLOBAL / SHARED

| Surface | Type | Notes |
| --- | --- | --- |
| App shell (role-aware nav, header, notifications, language toggle) | layout | One shell, role-variant nav |
| 401 / login redirect | behavior | Silent refresh via `/auth/refresh`, then re-auth |
| 403 restricted | page/state | Wrong role for surface |
| 404 / unknown route | page | Fallback |
| Error boundary | component | Global crash recovery |
| Offline / retry | behavior | Network-aware |

## FLOW CONTRACTS (happy + failure + permission + recovery)

Each critical flow documents: START → STEPS → DECISIONS → FAILURES → RECOVERY →
SUCCESS → NEXT.

1. **Visitor → Register → Onboard → Home** (auth + age-band).
2. **Guardian → Add child → Consent** (register child + legal consent).
3. **Child → Domain → Mission → Submit → Mastery → Review** (the learning loop;
   includes `missionsPerDay` entitlement cap + summative-retake block).
4. **Coding → Run → Submit** (client-exec → server-revalidate → evidence).
5. **Project → Milestones → Showcase → Portfolio**.
6. **Guardian → Child progress/safety → Time limits**.
7. **Subscribe → Entitlement → Unlock** (manual provider; honest, no fake pay).
8. **Safety event → Escalation → Assign → Resolve** (moderator).
9. **Admin → Author content → DRAFT → PUBLISHED**.

Full per-flow contracts are maintained in `FEATURE_CHAIN_MATRIX.md`.
