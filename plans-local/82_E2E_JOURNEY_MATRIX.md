# 82 — E2E Journey Matrix (new frontend)

> Critical journeys, their automation status, and production-verification state.
> This workspace has NO live backend, so full E2E (real API round-trips) is
> owner-run on the server. Component/route-render smoke + design-system + i18n
> RTL are automated here (vitest, 5 tests passing). The proven backend journeys
> (from the 1ae4dcd baseline) are the regression targets the new FE must match.

## Journeys

| Journey | Role | Automated here | Backend proven (baseline) | Prod-verified (new FE) |
| --- | --- | --- | --- | --- |
| Visitor → Landing → Signup → Onboarding → Home | Public→Learner | render smoke (landing/login) | yes (auth flow) | pending owner |
| Login → role redirect | All | render smoke (login form) | yes | pending owner |
| Session refresh (401 → silent refresh) | All | unit (client interceptor logic) | yes (token rotation) | pending owner |
| Domain → Mission → Submit → Mastery → Review | Learner | — (needs live data) | yes (English/Coding/AI-lit live) | pending owner |
| Coding → run (Pyodide) → submit → server re-validate | Learner | bundle-gate (runtime isolation) | yes (trust loop live) | pending owner |
| missionsPerDay cap → entitlement locked state | Learner | — | yes (403 enforced) | pending owner |
| Project → milestones → portfolio | Learner | — | backend supports | pending owner |
| Guardian → child progress/safety → time limits | Guardian | — | yes (parents endpoints) | pending owner |
| Subscribe → entitlement (manual provider) | Guardian | — | yes (manual activate) | pending owner |
| Safety escalation → assign → resolve | Moderator | — | backend supports | pending owner |
| Admin → content DRAFT → PUBLISHED | Admin | — | yes (status endpoint) | pending owner |
| Feature flag toggle | Admin | — | yes | pending owner |

## Automated suite (this workspace)

- `vitest run` — 5 tests: public render (landing, login form), DS primitives
  (Button loading/disabled, Empty/Error states), i18n RTL direction flip. GREEN.
- `tsc -b --noEmit` — clean.
- `vite build` — clean.
- `check:home-bundle` — coding runtime absent from entry chunk. GREEN.

## Owner-run E2E (server + browser)

Full journey E2E with real API round-trips runs where the live backend exists.
When the new FE is staged (task 13), the owner runs each journey above against
the staged build and compares to the 1ae4dcd baseline behavior (regression
oracle). Results recorded in 81 (visual QA) + here.
