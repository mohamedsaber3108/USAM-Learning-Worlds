# 04 — Backend Audit

**Baseline:** `origin/main @ 3a787c0`, backend = NestJS + Prisma. Evidence from source inspection (read-only). Paths relative to `backend/`.

## Architecture summary

38 registered modules, 54 controllers, 66 services. Clean module-per-domain separation; no severe god-objects (largest file ~370 lines). Two parallel AI call paths exist (Phase-3 `AIProviderService` + legacy `BedrockService`).

## Correctness findings (with evidence)

| ID | Severity | Finding | Evidence | Maps to |
|---|---|---|---|---|
| BE-A1 | **CRITICAL** | Public registration allows privilege escalation to ADMIN/MODERATOR | `auth/dto/register.dto.ts:11-13` unrestricted `@IsEnum(Role) role`; `auth.service.ts:34` writes `role: dto.role`; `auth.controller.ts:12-15` public, no guard; `Role` enum includes ADMIN/MODERATOR | USAM-IDN-007, USAM-IDN-008, USAM-SEC-001 |
| BE-R1 | HIGH | `/api/api/learning/...` double prefix — all LearningController routes unreachable | global prefix `main.ts:66` + `learning.controller.ts:19` `@Controller('api/learning')` | USAM-API-001, USAM-CUR-003 |
| BE-R2 | HIGH | `/api/api/characters/...` double prefix — all character/conversation routes unreachable at intended path | `character.controller.ts:24` `@Controller('api/characters')` | USAM-API-001, USAM-CHAR-002 |
| BE-U1 | HIGH | LearningController reads `req.user.learnerId` (always undefined) | `learning.controller.ts:55,101,111,117,123,129,207,216,230,239,253`; correct shape is `user.learner?.id` per `jwt.strategy.ts:22-45` | USAM-API-001, USAM-CUR-003 |
| BE-U2 | HIGH | EnglishController reads `req.user.learnerId` → "Learner not found" | `learning/english.controller.ts:45,76,103,131,148,162` | USAM-ENG-*, USAM-API-001 |
| BE-U3 | HIGH | CodingController reads `req.user.learnerId` | `learning/coding.controller.ts:73,103,132,161,186,200,210` | USAM-CODE-*, USAM-API-001 |
| BE-A2 | HIGH | Refresh-token flow broken: `/auth/refresh` guarded by access-token `JwtAuthGuard`; no refresh strategy; tokens not rotated/revocable | `auth.controller.ts:22-25`, `jwt.strategy.ts:18`, `auth.service.ts:126-133` | USAM-IDN-003, USAM-SEC-001 |
| BE-A3 | HIGH | No auth-specific throttling despite documented intent; only generic 100/60s global | `app.module.ts:60-66`; 0 `@Throttle` overrides; `main.ts:16-22` comment claims tight login/register limits | USAM-SEC-001 |
| BE-P1/B1 | HIGH | Compile break: `learner.progression.xp` referenced but Prisma field is `totalXP` | `english.controller.ts:180,182,184,195` vs `schema.prisma` Progression (`totalXP`) → TS2339 | USAM-ENG-*, USAM-DB-001 |
| BE-M1 | HIGH | Mission-run IDOR: `getMissionRun(runId)` has no ownership check, exposed directly | `missions.service.ts:97-140`, `missions.controller.ts:32-35` | USAM-MIS-001, USAM-SEC-001 |
| BE-M2 | HIGH | `submitActivity` doesn't verify the activity belongs to the run's mission → off-mission evidence injection | `missions.service.ts:145-224` (activity fetched by id only, evidence recorded L205) | USAM-MIS-001, USAM-EVID-001, USAM-MAS-001 |
| BE-M3 | MEDIUM | `completeMission` stores no outcome (no score/pass-fail/required-activity check/XP/progression) | `missions.service.ts:227-256` | USAM-MIS-001, USAM-GAM-001 |
| BE-E1 | MEDIUM | Raw `throw new Error(...)` for auth failures → HTTP 500 instead of 401/403 | `missions.controller.ts:25,44,59,69`; same pattern in gamification/mastery/ai/adaptive/projects/english/coding controllers | USAM-BE-001, USAM-API-001 |
| BE-C1 | LOW | Char-interaction logging uses raw SQL with a stale "table doesn't exist yet" comment though the table now exists | `character.service.ts` logInteraction (raw insert, swallowed catch) | USAM-CHAR-004 |
| BE-C2 | LOW | `character.controller.ts.backup` committed; stray `backend/p.$disconnect())` file | tree listing | cleanup (`16`) |

## Positives (preserve)

- Clean module separation; MasteryService correctly uses `competency`/`competencyId` relations.
- `startMission` correctly resumes an existing IN_PROGRESS run.
- Auth service itself uses proper Nest exceptions and bcrypt(js) hashing.
- `app.set('trust proxy', 1)` correctly configured for the nginx hop.

## Backend status against registry

- USAM-BE-001 (clean architecture): **PARTIALLY_IMPLEMENTED** — good separation, but contract/shape bugs + raw-error handling need refactor.
- USAM-API-001: **IMPLEMENTED_BUT_INCORRECT** — double prefixes, user-shape reads, compile error.
- USAM-IDN-003/007/008: **IMPLEMENTED_BUT_INCORRECT** — register escalation + broken refresh.
- USAM-MIS-001: **IMPLEMENTED_BUT_INCOMPLETE** — flow exists; ownership/membership/outcome gaps.


---

## ⚠️ CORRECTION (verified against the real `M:\USAM-main` worktree)

The initial backend findings above were gathered by sub-agents that read the **workspace-indexed copy** at `m:\USAM Learning Worlds\backend` (the OLD, disconnected history), not the fresh `origin/main` worktree. Re-verified directly against `M:\USAM-main\backend`:

| Original finding | Real status on `origin/main` | Evidence |
|---|---|---|
| BE-R1/R2 double `/api/api` prefix | **STALE — already FIXED** | `character.controller.ts:24` = `@Controller('characters')`; `learning.controller.ts:18` = `@Controller('learning')` |
| BE-U1 learning controller `req.user.learnerId` | **STALE — FIXED** | uses `req.user.learner?.id` (e.g. `getUnlockStatus`) |
| BE-U2 english `req.user.learnerId` + BE-P1/B1 `progression.xp` compile break + ENG-1 DTO mismatch | **STALE — GONE** | `english.controller.ts` is now a lean read-only strands controller; coach methods removed; header documents the `req.user.learnerId` bug was fixed in commit `da4f243` |
| BE-A3 no auth-specific throttle | **STALE — FIXED** | `auth.controller.ts` has `@Throttle({ limit: 20, ttl: 900000 })` on register + login |

**Findings CONFIRMED still real on `origin/main`:**
- **BE-A1 (CRITICAL):** `register.dto.ts` still declares unrestricted `@IsEnum(Role) role: Role`; `auth.service.register` still persists `dto.role`. Public register → ADMIN escalation is **real**.
- **BE-M1 (HIGH):** `missions.controller.ts` `getMissionRun(runId)` passes only `runId` to the service with no ownership check → IDOR **real**.
- **BE-M3 (MEDIUM):** `completeMission` still stores no outcome.
- **BE-E1 (MEDIUM):** raw `throw new Error('Only learners can ...')` still present in `missions.controller.ts` → HTTP 500 instead of 403.
- **BE-A2 (refresh):** `/auth/refresh` still guarded by access-token `JwtAuthGuard` and re-issues by `user.id` — design still questionable; re-verify refresh strategy.

**Lesson for remaining audit:** the grep/read index resolves to the old workspace copy; all "current baseline" claims must be verified directly against `M:\USAM-main`. The gap analysis (18) and roadmap (19) use the corrected, verified statuses.
