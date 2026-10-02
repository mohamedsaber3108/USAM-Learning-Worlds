# USAM Frontend — Rebuild (Decision A)

**Temporary isolated tree** for the clean frontend rebuild from first principles.
This is the anti-contamination workspace authorized by Decision A — it is **NOT a
permanent second frontend**. Once proven (built, connected to the real backend,
tested, visual-QA'd, regression-compared to the deployed `1ae4dcd` baseline), it
**replaces** `frontend/` as the single production frontend, and the superseded
`frontend/` implementation is removed. The root `src/` Lovable scaffold stays
quarantined separately.

## Source of truth

Backend + product model, NOT the legacy frontend. See:
- `plans-local/80_MASTER_EXECUTION_CONTROL.md` — execution control
- `docs/product/FINAL_CAPABILITY_REGISTRY.md`
- `docs/frontend/FINAL_INFORMATION_ARCHITECTURE.md`, `FINAL_USAM_DESIGN_SYSTEM.md`,
  `FINAL_ROUTE_REGISTRY.md`, `BACKEND_FRONTEND_TRACEABILITY_MATRIX.md`

## Stack

Vite 5 + React 18 + TypeScript (strict) + react-router 6 + TanStack Query +
zustand + axios (typed `/api` client with token-refresh rotation) + Tailwind
(WHITE/GREEN/BLACK tokens) + i18next (EN/AR, first-class RTL).

## Contracts (real backend)

- Global prefix `/api`, unversioned. Bearer JWT. `POST /auth/refresh` takes the
  refresh token in the **body** and rotates both tokens.
- Roles: `LEARNER` / `GUARDIAN` / `MODERATOR` / `ADMIN` (no teacher/org).
- Same-origin in prod (`VITE_API_URL=/api`); dev proxies `/api` → `:3001`.

## Dev

```bash
npm install
npm run dev        # http://localhost:5174
npm run typecheck
npm run build
```

## Status

Foundation (task 8): typed API client + auth store + role-aware router/shell +
design-system primitives + i18n EN/AR RTL + real Landing/Login. Remaining
surfaces are honest `Placeholder`s naming their backend, replaced in tasks 9–11.
No mock data ships.
