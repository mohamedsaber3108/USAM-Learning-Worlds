# 03 — Frontend Audit

**Baseline:** `origin/main @ 3a787c0`, `frontend/` = React 18 + Vite 5 + react-router-dom 6 + TanStack Query 5 + axios + react-hook-form/zod + framer-motion + i18next. Read-only evidence. (Redesign brand overhaul lives on `redesign/ux-overhaul`.)

## Architecture

- Real UI→service split via `lib/api/client.ts` (single axios instance, request/response interceptors) + `lib/api/endpoints.ts` (46 API groups, 1380 lines, well-commented). **No repository/state layer.**
- **Typing is mixed:** newer groups strongly typed (`apiClient.get<T>`); the highest-traffic core groups (`missionsApi`, `gamificationApi`, `masteryApi`, `curriculumApi`) return `AxiosResponse<any>`; `submitActivity`/`projectsApi.create/update` take `any`.

## Findings

| ID | Severity | Finding | Evidence | Maps to |
|---|---|---|---|---|
| FE-1 | **HIGH** | All `charactersApi` + `learningApi` (incl. `learningEventsApi` analytics) calls 404 — they correctly call `/characters`,`/learning` but the backend double-declares `/api/api/...` (BE-R1/R2) | `endpoints.ts` groups vs backend `@Controller('api/characters'|'api/learning')` | USAM-API-001 |
| FE-2 | **HIGH** | Token refresh is non-functional: interceptor posts `{refreshToken}` (bare axios, no auth header) to `/auth/refresh`, but backend guards it with the access-token `JwtAuthGuard` → 401 in exactly the expiry case → forced logout | `client.ts:36-40` vs `auth.controller.ts:22-25` | USAM-API-001, USAM-IDN-003 |
| FE-3 | MEDIUM | UUID-string IDs mistyped as `number` (`missionsApi.browse domainId:number`, `adaptiveApi.getNextActivity competencyId:number`) — latent trap | `endpoints.ts:88,179` | USAM-API-001 |
| FE-4 | **HIGH** | Flagship `DashboardPage` ignores the existing `DashboardSkeleton`/`ErrorState`/`EmptyState` primitives: destructures only `data`, renders with `?? fallback`, assumes fields backend may not return (`xpInCurrentLevel`, `finalScore`, mastery array) | `DashboardPage.tsx` | USAM-FE-001, USAM-FE-002 |
| FE-5 | MEDIUM | **No ErrorBoundary anywhere** — a lazy-page exception = white screen | 0 matches for ErrorBoundary/componentDidCatch | USAM-FE-002 |
| FE-6 | MEDIUM | Zustand declared but **unused**; auth/user state is raw `localStorage`, non-reactive; `User.userType` type is stale vs backend `role` | 0 zustand imports; `types/index.ts` | USAM-FE-003 |
| FE-7 | MEDIUM | Auth gating is localStorage-token-**presence** only; no expiry/`/auth/me` check; `/parents` (guardian-only) has no client role-gate | `ProtectedRoute.tsx`, `AdminRoute.tsx`, router | USAM-IDN-006, USAM-SEC-001 |
| FE-8 | MEDIUM | i18n string externalization incomplete — many feature/admin pages have hardcoded English despite en/ar near-parity locales | `useTranslation` in 17/59 pages | USAM-LOC-002 |
| FE-9 | MEDIUM | A11y partial: solid aria/landmarks/focus-visible/RTL, but no dialog focus-trap and incomplete `prefers-reduced-motion` gating despite pervasive framer-motion | AppShell + ~27 aria files; 3 reduced-motion files | USAM-A11Y-001 |
| FE-10 | **HIGH** | **Zero frontend tests** — no runner, no `*.test/spec`, no test script | package.json | USAM-TEST-001 |

## Positives (preserve)

- Excellent shared state primitives exist (`CharacterState.tsx` Loading/Empty/Error with `aria-live`; `Skeleton.tsx` content-shaped) — just apply them consistently (esp. Dashboard).
- Genuine i18n + RTL: `applyDocumentDirection()` sets `<html dir/lang>` on load + toggle; en/ar ~parity (363/362 lines).
- Clean centralized router with `ProtectedRoute`/`AdminRoute`, lazy-loading of 5 heaviest pages, single `<AppShell>` wrap.
- No "coming soon"/mock strings found in the `frontend/` feature pages (contrast with the deprecated root `src/` app which is mock-heavy).

## Status against registry

- USAM-FE-001: **PARTIALLY_IMPLEMENTED**. USAM-FE-002: **PARTIAL/FAIL** (Dashboard + no ErrorBoundary). USAM-FE-003: **FAIL vs intent** (Zustand unused, non-reactive auth).
- USAM-API-001: **IMPLEMENTED_BUT_INCORRECT** (double-prefix 404s, broken refresh, UUID-as-number).
- USAM-A11Y-001: **PARTIALLY_IMPLEMENTED**. USAM-LOC-001: **CONFIRMED_COMPLETE** (wiring). USAM-LOC-002: **PASS with gap**. USAM-TEST-001: **FAIL** (0 frontend tests).
