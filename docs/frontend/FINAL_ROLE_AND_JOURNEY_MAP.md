# FINAL ROLE AND JOURNEY MAP

> Derived from the real backend + product. Only the 4 real roles exist:
> `LEARNER`, `GUARDIAN` (parent), `MODERATOR`, `ADMIN`. No teacher / org / career
> / company / freelance roles. Journeys are traced to real endpoints. This drives
> the IA, navigation, and page/flow inventory.

## Role routing (post-login)

After `POST /auth/login` → `GET /auth/me` returns `{role, learner, guardian}`.
Route by role AND profile presence:

- `LEARNER` (has `learner`) → learner experience shell.
- `GUARDIAN` (has `guardian`) → parent experience shell.
- `MODERATOR` → moderation console (safety escalations, community moderation,
  interventions). No learner/guardian profile.
- `ADMIN` → admin/CMS console. Superset of moderator visibility via admin paths.

Handle "authenticated but wrong role for this surface" explicitly (403 state).

---

## 1. PUBLIC VISITOR (unauthenticated)

- **Goals:** understand what USAM is, who it's for, how the ecosystem connects,
  where to start; sign up; verify a shared credential.
- **Entry points:** landing (`/`), pricing (`GET /entitlements/plans` — public),
  public credential verify (`GET /credentials/:uid` — public), login, register.
- **Primary journeys:**
  - Discover ecosystem → choose role → **Register** (`POST /auth/register`,
    LEARNER or GUARDIAN only) → onboarding.
  - **Login** (`POST /auth/login`) → role shell.
  - **Verify credential** (public) — no auth.
- **Navigation:** minimal public nav (identity, what/who, pricing, login, get
  started). Ecosystem presentation, not a generic SaaS template.
- **Restricted states:** everything else requires auth (401 → login).

## 2. LEARNER / CHILD

- **Goals:** learn across domains, play missions, build mastery, keep streaks,
  make projects, be guided by companions — in child language, no backend jargon.
- **Entry point:** learner home after login/onboarding.
- **Primary journeys (the learning loop):**
  1. Home → pick a **World/Domain** (`GET /worlds`, `GET /learning/domains/:slug/path`).
  2. **Mission**: start (`POST /missions/:id/start` — subject to `missionsPerDay`)
     → activities → submit (`POST /missions/runs/:runId/submit`) → complete.
     Coding missions use the sandbox (`GET /coding-sandbox/missions/:activityId`,
     `POST /coding-sandbox/submissions`).
  3. **Evidence → Mastery** (`GET /mastery/overview|by-domain`) updates.
  4. **Practice/Review** (`GET /mastery/review-due`, `GET /flashcards/due`,
     `POST /flashcards/:id/review`) — framed as "keep it strong".
  5. **Recommendation** (`GET /adaptive/recommendations`, `/next-activity`).
  6. **Reflection** (`GET /reflection/prompts`, `POST /reflection/responses`).
  7. **Projects/Portfolio** (`POST /projects`, `GET /projects/my`,
     `/portfolio/:learnerId`) — transfer.
- **Secondary journeys:** gamification (XP/streak/cosmetics/leaderboard opt-in),
  daily goals, notifications, credentials wallet, characters/companion chat,
  creativity studio, community feed/search, AI help (hint/explain/coach).
- **Navigation:** role-aware child nav — Home, Learn (worlds/domains), Practice,
  Projects, Progress, plus companion + notifications + profile. No admin/backend
  concepts. Age-band adapts presentation (COMPAT MODE).
- **Permissions:** own data only. Voice = PROVIDER-GATED. Entitlement gates on
  mission start / premium content.
- **Cross-role transitions:** none directly; a guardian views the child's
  progress through the parent shell (separate account).

## 3. GUARDIAN / PARENT

- **Goals:** understand real learning of their child(ren): progress, mastery,
  evidence, projects, time spent, plan, safety; manage consent/privacy and time
  limits; manage subscription.
- **Entry point:** parent home (children list / family summary).
- **Primary journeys:**
  1. **Children overview** (`GET /parents/children`, `/family-summary`).
  2. **Child detail** (`GET /parents/children/:learnerId/dashboard|progress|
     activity|reflections`) — mastery breakdown, recent activity, reflections.
  3. **Safety** (`GET /parents/children/:learnerId/safety`) — escalations/
     all-clear.
  4. **Controls**: time limits (`POST .../time-limits`).
  5. **Consent & privacy** (`POST /legal/consent`, `GET /export/:learnerId`,
     `POST /delete/:learnerId`).
  6. **Plan** (`GET /entitlements/me`, `/plans`, `POST /subscribe`,
     `/cancel/:id`) — activate/cancel (manual provider; no live payment today).
- **Navigation:** parent nav — Children, (per child) Progress / Activity /
  Reflections / Safety / Controls, Plan, Privacy, Account.
- **Permissions:** own children only (guardianship-enforced server-side). Cannot
  see other families or the learner's raw play surfaces.

## 4. MODERATOR

- **Goals:** keep the platform safe: triage safety escalations, moderate
  community content, action interventions.
- **Entry point:** moderation console.
- **Primary journeys:**
  1. **Safety escalations** (`GET /safety-escalations`, `/:id`, `PATCH assign`,
     `PATCH resolve`, `/stats/summary`).
  2. **Community moderation** (`GET /community/moderation/quarantined`,
     `POST /community/moderation/review/:id`).
  3. **Interventions** (`GET /admin/interventions`, by-learner, acknowledge,
     resolve — MOD+ADMIN).
  4. **Assessment quality** scan/flags (MOD+ADMIN).
- **Navigation:** moderation nav — Escalations, Community queue, Interventions.
- **Permissions:** safety/moderation scope; not full admin CMS. Staff account
  (no learner/guardian profile).

## 5. ADMIN

- **Goals:** operate the platform — author/publish content, manage curriculum,
  policies, prompts, analytics, flags, experiments, audit.
- **Entry point:** admin console.
- **Primary journeys:**
  1. **CMS**: content items authoring + lifecycle (`/admin/content-items`
     DRAFT→PUBLISHED via `PATCH /:id/status`); missions CRUD
     (`/admin/missions`).
  2. **Content governance**: provenance/licenses/sources; content QA; assessment
     quality; difficulty calibration; misconceptions; curriculum mapping;
     translations/QA.
  3. **AI ops**: prompt templates, safety policies, AI eval runs, (memory
     governance — ⚠ backend authz gap).
  4. **Analytics** (`/admin/analytics/*`), **feature flags**, **experiments**,
     **audit logs**.
- **Navigation:** admin nav — Content/CMS, Curriculum, AI & Safety, Analytics,
  Platform (flags/experiments/audit).
- **Permissions:** `@Roles(ADMIN)` on `/api/admin/*`; superset of moderator
  visibility. Cannot self-register.

---

## Journey → primary state coverage required (all)

Every journey must implement: `LOADING`, `EMPTY`, `READY`, `SUCCESS`, `ERROR`,
`UNAUTHORIZED (401→login)`, `RESTRICTED (403 wrong role)`, `ENTITLEMENT_LOCKED`,
`FIRST_USE`, plus domain-specific ones (e.g. `PARENT_APPROVAL`, `BLOCKED` for
safety, `OFFLINE/RETRYING` for network). See the page/flow inventory for
per-surface state matrices.

## Cross-role transitions (real)

- Learner ↔ Guardian: separate accounts linked by `Guardianship`. A guardian's
  view of a child is read-mostly (progress/activity/safety) + controls
  (time-limits) + consent. No shared session.
- Moderator/Admin: staff accounts; no consumer play surfaces. Admin ⊃ Moderator
  visibility via admin paths.
- No other role transitions exist (no teacher/org).
