# FINAL PRODUCT CAPABILITY REGISTRY

> Every real product capability listed ONCE, derived from the code-traced backend
> (42 NestJS modules, ~59 controllers, all under `/api`). This prevents duplicate
> features, duplicate naming, duplicate pages, orphan backend engines, and fake
> frontend features. Roles: `LEARNER`, `GUARDIAN` (=parent), `MODERATOR`,
> `ADMIN`. Source: code trace 2026-09-30. Frontend status is for the NEW rebuild.

Legend — FE representation status: `NONE` (not yet in new FE) · `PLANNED` ·
`BUILDING` · `CONNECTED` · `PRODUCTION_READY`. "Proven (legacy)" = worked in the
`1ae4dcd` baseline and is a regression target.

## NON-EXISTENT CAPABILITIES (do NOT fabricate)

The following are **not in the backend** and must NOT be built in the frontend:
**School / organization admin, Teacher role, Career, Jobs, Freelancing,
Company/employer flows, Billing payment provider integration** (only entitlement
records + plan catalog exist; no live payment processor is wired). Roles are only
the 4 above.

---

## A. IDENTITY & ACCESS

| Capability | Roles | Module | Key endpoints | FE representation | Entitlement | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Register (learner/guardian) | Public→LEARNER/GUARDIAN | auth | `POST /auth/register` | Signup flow | Free | NONE (legacy proven) |
| Login | Public | auth | `POST /auth/login` | Login page | Free | NONE (legacy proven) |
| Session refresh | All | auth | `POST /auth/refresh` (token in body) | Silent token refresh in API client | — | NONE |
| Current profile | All | auth | `GET /auth/me` | Header/account | — | NONE (legacy proven) |
| Age band set/update | LEARNER | auth | `PATCH /auth/me/age-band` | Onboarding + settings | Free | NONE |
| Preferences | LEARNER | auth | `PATCH /auth/me/preferences` | Settings | Free | NONE |

Age model: enum `AGE_8_9/AGE_10_11/AGE_12_14` = **COMPATIBILITY MODE / MIGRATION
PENDING**; display as product bands via an age-labels layer. Do not silently
upgrade the enum.

## B. LEARNING SPINE (the core loop)

| Capability | Roles | Module | Key endpoints | FE representation | Status |
| --- | --- | --- | --- | --- | --- |
| Worlds catalog | LEARNER | worlds | `GET /worlds`, `/worlds/:id` | World map / domain entry | NONE (legacy proven) |
| Domain path (generic) | LEARNER | learning (domain-path) | `GET /learning/domains/:slug/path` | Domain path view | NONE (legacy proven) |
| Concepts & prerequisites | LEARNER | learning | `GET /learning/concepts...`, unlock-status, prereqs | Concept graph / gating | NONE |
| Competency prereqs & unlock path | LEARNER | learning | `GET /learning/competencies/:id/...` | Path gating | NONE |
| Learning paths + progress | LEARNER | learning | `GET /learning/paths`, `/paths/:id/progress`, `POST advance/reset` | Path progress | NONE |
| Age-adapted content | LEARNER | learning | `GET /learning/adapted/...`, `/age-config/...` | Content adaptation (COMPAT MODE) | NONE |
| Learning events (telemetry) | LEARNER | learning | `POST /learning/events`, `GET stats/recent/patterns` | Background analytics | NONE |
| English path & strands | LEARNER | learning (english) | `GET /english/path`, `/strands`, `/strands/:slug` | English domain | Proven (spine) |
| Missions catalog | LEARNER | missions | `GET /missions`, `/:id`, by-purpose, by-bloom | Mission list/detail | NONE (legacy proven) |
| Mission run + submit + complete | LEARNER | missions | `POST /missions/:id/start`, `POST /runs/:runId/submit`, `/complete`, `GET /runs/:runId`, `/history/me` | Mission player | Proven (spine) |
| Coding sandbox (client-exec, server-revalidate) | LEARNER | coding-sandbox | `GET /coding-sandbox/missions/:activityId`, `POST /coding-sandbox/submissions` | Code editor + runner (Pyodide/Sandpack) | Proven (spine) |
| Mastery evidence & overview | LEARNER | mastery | `POST /mastery/evidence`, `GET /overview`, `/by-domain`, `/review-due`, `/goals` | Mastery view | Proven (spine) |
| Adaptive signals & recommendations | LEARNER | adaptive | `GET /adaptive/recommendations`, `/next-activity`, `/zpd`, `/difficulty/:id`, ... | Recommendation surfacing | NONE |
| Flashcards (spaced repetition) | LEARNER | flashcards | `GET /flashcards/due`, `POST /:id/review`, `/stats` | Practice/review | NONE |
| Reflection (metacognition) | LEARNER | reflection | `GET /reflection/prompts`, `POST /responses` | Post-mission reflection | NONE |
| Questions & generation | LEARNER | questions | `GET /questions/templates`, `POST /generate` | Activity content | NONE |
| Learner model | LEARNER | learner-model | `GET /learner-model/:id` | Internal / adaptive | NONE (internal) |

## C. DOMAIN CONTENT LIBRARIES

| Capability | Module | Endpoints | FE representation | Status |
| --- | --- | --- | --- | --- |
| Cross-curricular (AI-lit, entrepreneurship, financial, digital, career-exploration, communication, coding-concepts) | cross-curricular | `GET /cross-curricular/:category`, `/:category/:slug` | Topic content | NONE |
| Problem solving | problem-solving | `GET /problem-solving`, `/categories`, `/:slug` | Content | NONE |
| Computational thinking | problem-solving | `GET /computational-thinking...` | Content | NONE |
| Critical thinking | problem-solving | `GET /critical-thinking...` | Content | NONE |
| Stories | learning (stories) | `GET /stories`, `/:id` | Story reader | NONE |
| Simulations | simulation | `GET /simulations`, `/:slug`, nodes | Interactive scenario | NONE |
| Visual language | visual-language | `GET /visual-language`, `/:slug` | Block/visual content | NONE |
| Media assets | media | `GET /media`, `/:slug` | Asset delivery | NONE |
| Creativity prompts & gallery | creativity | `GET /creativity/prompts`, `POST /submissions`, `/gallery`, visibility | Creativity studio | Partial (prompts live, no mastery by design) |

## D. ENGAGEMENT & PROGRESSION

| Capability | Roles | Module | Endpoints | FE representation | Status |
| --- | --- | --- | --- | --- | --- |
| XP / levels / progression | LEARNER | gamification | `GET /gamification/progression`, `POST /award-xp` | Progress header | NONE (legacy proven) |
| Leaderboard & rank | LEARNER | gamification | `GET /leaderboard`, `/rank` | Leaderboard (opt-in) | NONE |
| Achievements | LEARNER | gamification | `GET /achievements` | Achievements | NONE |
| Streaks + freeze | LEARNER | gamification | `GET /streak`, `POST /streak/update`, streak-freeze | Streak widget | NONE |
| Cosmetics (unlock/equip) | LEARNER | gamification | `GET /cosmetics`, `POST /:id/unlock`, `/equip` | Avatar customization | NONE |
| Daily goals | LEARNER | daily-goals | `GET /daily-goals/me`, `PUT /me`, `/me/progress` | Daily goal widget | NONE |
| Notifications | LEARNER | notifications | `GET /notifications`, `/unread-count`, `POST /:id/read`, `/read-all` | Notification center | NONE |
| Credentials / badges (+ public verify) | LEARNER + Public verify | credentials | `GET /credentials/me`, `GET /credentials/:uid` (public) | Credential wallet + public verify page | NONE |

## E. CHARACTERS & VOICE

| Capability | Roles | Module | Endpoints | FE representation | Status |
| --- | --- | --- | --- | --- | --- |
| Characters catalog & state | LEARNER | ai (character) | `GET /characters`, `/:id/state`, `/orchestrate`, unlocked | Companion display + state machine | NONE (legacy proven) |
| Character conversations | LEARNER | ai (character) | `POST /characters/:id/chat`, conversations CRUD, messages, pause/resume/end/summary | Chat/companion | NONE |
| AI tutoring (feedback/hint/explain/analyze) | LEARNER | ai | `POST /ai/feedback`, `/hint`, `/explain`, `/analyze` | Inline AI help | NONE |
| AI moderation | LEARNER (write) / MOD (read) | ai | `POST /ai/moderate`, `GET /ai/moderation/*` | Background safety | Partial |
| Coding coach | LEARNER | ai (coding-coach) | `POST /coding-coach/debug|review|explain|challenge` | Coding help | NONE |
| English coach | LEARNER | ai (english-coach) | `POST /english-coach/conversation|grammar|pronunciation|vocabulary|reading` | English help | NONE |
| Voice pipeline | LEARNER | voice | `POST /voice/turn` (+ static audio) | Voice companion | **BLOCKED_EXTERNAL** (PROVIDER-GATED) |

## F. PROJECTS & PORTFOLIO

| Capability | Roles | Module | Endpoints | FE representation | Status |
| --- | --- | --- | --- | --- | --- |
| Projects CRUD + milestones | LEARNER | projects | `POST /projects`, `GET /my`, `/:id`, `PUT/DELETE`, milestones | Projects workspace | NONE (legacy proven) |
| Collaborators | LEARNER | projects | `POST/GET/DELETE /:id/collaborators` | Collaboration | NONE |
| Research notes | LEARNER | projects | `POST/GET/DELETE research-notes` | Notes | NONE |
| Portfolio / showcase | LEARNER | projects | `GET /portfolio/:learnerId`, `POST /:id/showcase`, `/browse` | Portfolio | NONE |
| Real-world / cross-domain challenges | LEARNER | projects | `GET /real-world-challenges/list`, `/cross-domain/list` | Challenge browser | NONE |
| Rubrics | LEARNER | projects (rubrics) | `GET /rubrics`, `GET /projects/:id/rubric` | Rubric display | NONE |
| Project → curriculum context | LEARNER | projects | `GET /:id/curriculum-context` | Project↔competency link | NONE |

## G. GUARDIAN (PARENT)

| Capability | Roles | Module | Endpoints | FE representation | Status |
| --- | --- | --- | --- | --- | --- |
| Children list & family summary | GUARDIAN | parents | `GET /parents/children`, `/family-summary` | Parent home | NONE (legacy proven) |
| Child dashboard / progress / activity | GUARDIAN | parents | `GET /parents/children/:learnerId/dashboard|progress|activity` | Child detail | NONE (legacy proven) |
| Child reflections | GUARDIAN | parents | `GET /parents/children/:learnerId/reflections` | Reflections view | NONE |
| Child safety | GUARDIAN | parents | `GET /parents/children/:learnerId/safety` | Safety panel | NONE (legacy proven) |
| Time limits | GUARDIAN | parents | `POST /parents/children/:learnerId/time-limits` | Controls | NONE |
| Consent (COPPA/GDPR-K) | GUARDIAN | legal | `POST /legal/consent`, `GET /consent/:learnerId` | Consent flow | NONE |
| Data export / deletion (GDPR) | GUARDIAN | legal | `GET /export/:learnerId`, `POST /delete/:learnerId` | Privacy controls | NONE |

## H. COMMUNITY & SEARCH

| Capability | Roles | Module | Endpoints | FE representation | Status |
| --- | --- | --- | --- | --- | --- |
| Community feed / trending / search / stats | LEARNER | community | `GET /community/feed`, `/trending`, `/search`, `/stats` | Community | NONE |
| Report content | LEARNER | community | `POST /community/report` | Report action | NONE |
| Global search | LEARNER | search | `GET /search` | Search | NONE |

## I. BILLING / ENTITLEMENTS

| Capability | Roles | Module | Endpoints | FE representation | Status |
| --- | --- | --- | --- | --- | --- |
| Plan catalog (public) | Public | entitlements | `GET /entitlements/plans` | Pricing | NONE |
| My entitlements | LEARNER/GUARDIAN | entitlements | `GET /entitlements/me` | Plan panel / gating source | NONE (legacy proven) |
| Subscribe / cancel | GUARDIAN | entitlements | `POST /subscribe`, `POST /cancel/:id` | Subscription mgmt | NONE (no live payment provider) |

## J. SAFETY / MODERATION (MODERATOR/ADMIN)

| Capability | Roles | Module | Endpoints | FE representation | Status |
| --- | --- | --- | --- | --- | --- |
| Safety escalations | MODERATOR/ADMIN | ai (safety-escalation) | `GET /safety-escalations`, `/:id`, assign, resolve, stats | Moderation queue | NONE |
| Community moderation | LEARNER(report)/MOD | community | `GET /moderation/quarantined`, `POST /moderation/review/:id` | Moderation | NONE |
| Interventions | ADMIN/MODERATOR | interventions | `GET /admin/interventions`, by-learner, acknowledge, resolve | Intervention queue | NONE |

## K. ADMIN / CMS (ADMIN, some MODERATOR)

| Capability | Module | Endpoints (base `/api/admin/...`) | FE representation | Status |
| --- | --- | --- | --- | --- |
| Content items authoring + lifecycle | content-items | `POST /content-items`, list, `/:id`, `PATCH /:id/status` | CMS editor (DRAFT→PUBLISHED) | NONE |
| Content provenance / licenses / sources | content-provenance | licenses, sources, compliance | Provenance admin | NONE |
| Missions admin CRUD | missions (admin) | `GET/POST/PATCH/DELETE /admin/missions` | Mission authoring | NONE |
| Prompt templates | ai (admin) | `/admin/prompt-templates` CRUD | Prompt admin | NONE |
| Safety policies | ai (admin) | `/admin/safety-policies` | Policy admin | NONE |
| AI eval runs | ai (admin) | `/admin/ai-eval/runs` | AI eval dashboard | NONE |
| Analytics | analytics | `/admin/analytics/overview`, events-by-type, daily-activity, retention, stickiness | Analytics dashboard | NONE |
| Content QA / assessment quality / difficulty calibration | content-qa / assessment-quality / difficulty-calibration | scan + flags | QA dashboards | NONE |
| Misconceptions library | misconceptions | `/admin/misconceptions...` | Misconception admin | NONE |
| Curriculum mapping (standards) | curriculum-mapping | suggest / apply | Mapping admin | NONE |
| Translations / QA | learning (translation) | languages, qa/stats, approve | Localization admin | NONE |
| Feature flags | feature-flags | `GET /feature-flags`, `PATCH /:key` | Flag admin | NONE |
| Experiments (A/B) | experimentation | experiments CRUD, assignment | Experiment admin | NONE |
| Audit logs | audit | `GET /audit/logs` | Audit viewer | NONE |
| Memory governance stats | ai (admin) | `/admin/memory-governance/stats` | Admin (⚠ missing RolesGuard — flagged) | NONE |

## FLAGGED BACKEND GAPS (classify, do not fake)

1. `GET /api/admin/memory-governance/stats` is under an admin path but guarded
   only by `JwtAuthGuard` (no `RolesGuard`). **BACKEND CONTRACT GAP** — any
   authenticated user can hit it. Fix on the backend before exposing in admin FE.
2. No parent-facing per-evidence timeline endpoint; no live payment provider.
   Represent honestly (no fabricated data).
