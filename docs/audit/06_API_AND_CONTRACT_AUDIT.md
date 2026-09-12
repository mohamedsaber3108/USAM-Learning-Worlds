# 06 — API & Contract Audit

**Baseline:** `origin/main @ 3a787c0`. Traces UI model ↔ API DTO ↔ domain ↔ DB per the spec's contract requirement. Read-only evidence.

## Confirmed contract breaks

| ID | Severity | Break | Frontend side | Backend side | Fix owner |
|---|---|---|---|---|---|
| API-1 | **HIGH** | `/api/api/characters/*` double prefix → all character/conversation calls 404 | `charactersApi` calls `/characters` (correct) | `character.controller.ts` `@Controller('api/characters')` (wrong) + global `api` prefix | **Backend** |
| API-2 | **HIGH** | `/api/api/learning/*` double prefix → concepts, learning paths, `learningEventsApi` analytics all 404 | `learningApi`/`learningEventsApi` call `/learning/*` (correct) | `learning.controller.ts` `@Controller('api/learning')` (wrong) | **Backend** |
| API-3 | **HIGH** | Refresh token flow can never succeed | interceptor posts `{refreshToken}` no auth header | refresh guarded by access-token `JwtAuthGuard`, ignores body token | **Both** (redesign refresh strategy) |
| API-4 | **HIGH** | English controller↔service DTO mismatch → endpoints never worked end-to-end | — | controller passes `{message, context}` / `{targetText, spokenTranscription}`; `english-coach.service` expects `{userMessage}` / `{word, transcript}` | **Backend** |
| API-5 | HIGH | `progression.xp` referenced but model field is `totalXP` (compile break) | dashboard also reads `xpInCurrentLevel`/`xpForNextLevel` that backend doesn't return | `english.controller.ts` + Progression model | **Backend + FE** |
| API-6 | MEDIUM | UUID string IDs typed as `number` (`domainId`, `competencyId`) | `endpoints.ts:88,179` | all IDs are `String @default(uuid())` | **Frontend** |
| API-7 | MEDIUM | `req.user.learnerId` undefined in learning/english/coding controllers | — | correct shape `user.learner?.id` | **Backend** |
| API-8 | LOW | `User.userType` frontend type stale vs backend `role` | `types/index.ts` | `{id,email,role,learner,guardian}` | **Frontend** |

## Contract-integrity method applied

For sampled features the chain was traced: **Missions** (UI→missionsApi→`/missions`→MissionsController→MissionsService→Prisma) — connected but `any`-typed + IDOR (BE-M1). **Characters** — broken at routing (API-1). **English** — broken at DTO (API-4) + compile (API-5). **Auth** — refresh broken (API-3), register escalation (BE-A1).

## Status

USAM-API-001: **IMPLEMENTED_BUT_INCORRECT** — the contract layer exists and is mostly well-organized, but has 4 HIGH breaks (2 routing, 1 refresh, 1 DTO) plus type mismatches. These are concentrated and fixable without rebuild.


---

## ⚠️ CORRECTION (verified against real `M:\USAM-main` worktree)

API-1 (`/api/api/characters`), API-2 (`/api/api/learning`), API-4 (English DTO mismatch), API-5 (`progression.xp`), and API-7 (`req.user.learnerId` in learning/english) were derived from the **stale workspace-indexed copy**, not current `origin/main`. Verified fixed on the real baseline:
- `@Controller('characters')` and `@Controller('learning')` — no double prefix.
- Learning controller uses `req.user.learner?.id`.
- English controller is read-only strands; the coach DTO mismatch no longer exists.

**Still real:** API-3 (refresh flow guarded by access-token) needs design confirmation; API-6 (UUID-as-number typing on some frontend groups) should be re-checked on the current `frontend/` (the frontend was audited from the same tree, so re-verify). The contract layer on current `origin/main` is materially healthier than the stale copy suggested.
