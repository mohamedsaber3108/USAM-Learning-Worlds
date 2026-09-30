# FINAL ROLE ACCESS MATRIX

> Frontend hiding is NOT security. Backend authorization is the enforcement
> point. This matrix documents what each real role may do; the FE mirrors it for
> UX, the backend enforces it. Roles (Prisma `enum Role`): `LEARNER`,
> `GUARDIAN`, `MODERATOR`, `ADMIN`. There is NO teacher/org/company role.

## Enforcement mechanics (code-traced)

- Auth is **per-controller** via `@UseGuards(JwtAuthGuard)`. The only global
  guard is `ThrottlerGuard`. There is no global auth guard and no `@Public()`
  decorator — an endpoint is public simply by omitting the guard.
- Role gating: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)`.
  `RolesGuard` checks `requiredRoles.includes(user.role)`.
- **Guardian access is NOT RolesGuard-based.** Parent endpoints use only
  `JwtAuthGuard`, then each handler checks `user.guardian?.id` and verifies the
  guardianship link to the target learner in the service. Cross-child access is
  blocked at the service layer (guardianship check).
- Admin surface = `/api/admin/*` with `@Roles(ADMIN)` (some also `MODERATOR`).
  Moderator non-admin path = `/api/safety-escalations` (`@Roles(MODERATOR, ADMIN)`).

## Access matrix (VIEW / CREATE / EDIT / DELETE / APPROVE / PUBLISH / MANAGE / NONE)

| Capability | LEARNER | GUARDIAN | MODERATOR | ADMIN |
| --- | --- | --- | --- | --- |
| Own profile / preferences / age-band | VIEW/EDIT | VIEW/EDIT (own) | VIEW/EDIT (own) | VIEW/EDIT (own) |
| Own learning (worlds/paths/missions/activities) | VIEW/CREATE(attempts) | NONE (views via parent) | — | MANAGE (via admin) |
| Own mastery / evidence / review | VIEW/CREATE | VIEW (child, via parent) | — | VIEW (via analytics) |
| Coding sandbox submissions | CREATE (own) | NONE | — | MANAGE (via admin missions) |
| Projects / portfolio | VIEW/CREATE/EDIT/DELETE (own) | VIEW (child) | — | VIEW |
| Gamification (xp/streak/cosmetics/leaderboard) | VIEW/MANAGE (own; leaderboard opt-in) | VIEW (child) | — | — |
| Notifications | VIEW/EDIT (own) | VIEW/EDIT (own) | VIEW/EDIT (own) | VIEW/EDIT (own) |
| Credentials (own) | VIEW | VIEW (child) | — | — |
| Credential public verify `/credentials/:uid` | VIEW (public) | VIEW (public) | VIEW | VIEW |
| Community feed / search | VIEW | — | VIEW | VIEW |
| Report content | CREATE | — | — | — |
| Community moderation queue | NONE | NONE | VIEW/APPROVE(review) | VIEW/APPROVE |
| Safety escalations | NONE | NONE | VIEW/MANAGE(assign/resolve) | VIEW/MANAGE |
| Interventions | NONE | NONE | VIEW/EDIT(ack/resolve) | VIEW/EDIT |
| Children (parent oversight) | NONE | VIEW (own children only) | NONE | NONE |
| Child dashboard/progress/activity/reflections/safety | NONE | VIEW (own children) | NONE | NONE (via analytics aggregate) |
| Time limits | NONE | MANAGE (own children) | NONE | NONE |
| Consent / data export / deletion | NONE | CREATE/VIEW/MANAGE (own children) | NONE | NONE |
| Entitlement plans (catalog) | VIEW (public) | VIEW (public) | VIEW | VIEW |
| My entitlements | VIEW (own) | VIEW (own) | VIEW | VIEW |
| Subscribe / cancel | NONE | CREATE/DELETE (own) | NONE | NONE |
| Admin content items (CMS) | NONE | NONE | NONE | CREATE/EDIT/PUBLISH/MANAGE |
| Admin missions CRUD | NONE | NONE | NONE | CREATE/EDIT/DELETE/MANAGE |
| Content provenance / licenses / sources | NONE | NONE | NONE | VIEW/CREATE/MANAGE |
| Prompt templates / safety policies / AI eval | NONE | NONE | NONE | VIEW/EDIT/MANAGE |
| Content QA / assessment quality / difficulty calibration | NONE | NONE | VIEW (assessment-quality also MOD) | MANAGE |
| Misconceptions / curriculum mapping / translations | NONE | NONE | NONE | MANAGE |
| Analytics dashboards | NONE | NONE | NONE | VIEW |
| Feature flags / experiments | NONE | NONE | NONE | MANAGE |
| Audit logs | NONE | NONE | VIEW | VIEW |
| Memory governance stats | ⚠ VIEW (bug: only JwtAuthGuard) | ⚠ VIEW | ⚠ VIEW | VIEW |

⚠ `GET /api/admin/memory-governance/stats` lacks `RolesGuard` — a backend
authorization gap (any authenticated user can call it). Flagged in the capability
registry; must be fixed on the backend before an admin FE exposes it. The FE
must NOT rely on hiding to protect it.

## Cross-role notes

- A single `User` has at most one of `learner`/`guardian`. MODERATOR/ADMIN are
  staff users (no learner/guardian profile); they cannot self-register (public
  registration allowlist = LEARNER/GUARDIAN only).
- The FE must route by `user.role` AND presence of `user.learner`/`user.guardian`
  after `GET /auth/me`, and must handle the "authenticated but wrong role for
  this surface" state (403) explicitly.
