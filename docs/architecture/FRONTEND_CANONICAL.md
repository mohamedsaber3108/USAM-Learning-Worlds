# Canonical Frontend (audit T-P2-4)

This repository contains **two** directories with frontend code. This document
is the authoritative statement of which one is production.

## The production frontend is `frontend/`

- **Path**: `frontend/`
- **Stack**: React 18 + Vite + react-router-dom + TanStack Query
- **Evidence it is production**: ~247 backend-API integration points across its
  source, the complete USAM for Kids feature set (missions, coding, english,
  characters, voice, parents, admin, gamification, ...), and it is the ONLY
  frontend built and linted in CI (`.github/workflows/ci.yml`, `frontend` job).
- All frontend work — features, UI/UX, fixes — happens here.

## The root `src/` (`tanstack_start_ts`) is the Lovable scaffold — do NOT treat as production

- **Path**: repository root `src/` + root `package.json`/`vite.config.ts`.
- **Stack**: TanStack Start + React 19 (`@lovable.dev/vite-tanstack-config`).
- **What it is**: the scaffold generated and maintained by the connected
  **Lovable** project (`.lovable/project.json` → `template: tanstack_start_ts_current`).
- **Why it still exists**: per the repo's `AGENTS.md`, this project is connected
  to Lovable and commits sync back to it. The root scaffold is part of that
  Lovable integration. **Deleting it would break the Lovable editor sync and
  the user's project history**, so it is intentionally retained.
- It has minimal backend wiring (~9 API references, 2 pages) and must **not** be
  developed as, deployed as, or confused with the production app.

## Enforcement

- CI builds/tests **only** `frontend/` and `backend/`. The root scaffold is not
  part of the production build or deploy pipeline.
- Deployment (see `docs/backend/DEPLOYMENT_GUIDE.md`) serves the `frontend/`
  build output. The root app is never deployed to production.

## If you are asked to "remove the root src/"

Do **not** delete it while the project remains connected to Lovable. The safe
equivalent — already in place — is: keep it as the Lovable scaffold, and ensure
the production pipeline (CI + deploy) references only `frontend/`. Revisit
physical removal only if/when the project is disconnected from Lovable.
