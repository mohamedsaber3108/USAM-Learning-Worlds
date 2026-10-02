# Canonical Frontend

> **SUPERSEDED 2026-10-02 (owner decision, final — do not revisit).**
> The final, under-construction production frontend is **`frontend-rebuild/`**.
> All new product UI work targets `frontend-rebuild/src/`. `frontend/` is now
> the **legacy functional baseline / regression oracle** — kept operational and
> deployed until cutover, used only as a reference and a behavior oracle to
> compare against, not for new work. Root `src/` remains the **quarantined
> Lovable scaffold** — preserved, non-production, do not delete, do not revisit.

## Three trees, three roles (current, authoritative)

| | `frontend-rebuild/` (NEW — canonical target) | `frontend/` (legacy baseline / oracle) | `src/` repo root (quarantined) |
|---|---|---|---|
| Role | **Under-construction final frontend.** Every new page/component/fix goes here. | Deployed production today. Stays live and deployable until cutover. Reference only. | Lovable-managed scaffold. Preserve for Lovable sync history. Non-production. |
| Package | `usam-frontend-rebuild` | `usam-learning-worlds-frontend` | `tanstack_start_ts` |
| Framework | React 18 + react-router v6 + TanStack Query + zustand | React 18 + react-router-dom v6 | React 19 + TanStack Start/Router |
| Design tokens | WHITE / GREEN / BLACK (`brand` green scale, `ink` near-black, `canvas` white/off-white) | Teal `primary` + warm cream `surface` + playful world hues | N/A (not product-styled) |
| API layer | `src/lib/api/*` typed axios client, same-origin `/api` | `frontend/src/lib/api/endpoints.ts` (~50 groups) | `src/services/*` (mostly mock) |
| Built + deployed? | Not yet (target: `/preview/` continuously, then cutover) | **YES — stays live until cutover** | NO |

## Why this changed (history, for context only — not a basis to revisit)

A `frontend-rebuild/` tree was built 2026-09-30→10-01 as a genuine first-principles
rebuild (47 routes across all 5 role surfaces, WHITE/GREEN/BLACK tokens, 0
placeholders, tsc/build/vitest green). A same-day "Gate 1 product-first reset"
superseded it in favor of patching `frontend/`'s presentation layer, out of
engineering-risk caution. On 2026-10-02 the owner reviewed both trees directly,
confirmed `frontend-rebuild/` is real/substantial/buildable (not a hollow
scaffold), and **reversed the reset**: `frontend-rebuild/` is now the official
final reconstruction workspace. This decision is final — do not re-litigate the
tree choice in future sessions.

## Rules (current)

1. New product UI work goes in `frontend-rebuild/src/` only.
2. `frontend/` must remain operational and deployable throughout construction —
   it is the safety net and the regression oracle (behavior comparison target).
   Do not break it; do not add new product work to it.
3. Cutover (replacing `frontend/` with `frontend-rebuild/` in `scripts/deploy.sh`
   + CI) happens only after the gate in `plans-local/80_MASTER_EXECUTION_CONTROL.md`
   and ledger `plans-local/88_NEW_FRONTEND_PAGE_REBUILD_LEDGER.md` are satisfied —
   not merely because `frontend-rebuild/` type-checks and builds.
4. Root `src/` stays quarantined — preserved for Lovable sync, never deleted,
   never built targeted for new work. This is settled; do not ask again.
5. After a verified, stable cutover, archive/delete the superseded `frontend/`
   implementation per the legacy-cleanup step in 80 — not before.
