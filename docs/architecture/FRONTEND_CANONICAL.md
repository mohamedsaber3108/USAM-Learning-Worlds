# Canonical Frontend

> **The production frontend is `frontend/`.** All product UI work — routes,
> components, tests, API integrations, design-system work — targets
> `frontend/src/`. Do **not** implement new product work in the repository-root
> `src/` tree.

## Why this document exists

The repository contains **two** frontend source trees. This has caused real
lost work (coding test-model logic was implemented in the non-deployed tree and
had to be re-ported). This document is the single source of truth for which is
which, so it does not happen again.

## The two trees

| | Canonical (production) | Legacy (Lovable scaffold) |
|---|---|---|
| Path | `frontend/src/` | `src/` (repo root) |
| Package | `usam-learning-worlds-frontend` | `tanstack_start_ts` |
| Framework | React 18 + `react-router-dom` v6 | React 19 + TanStack Start/Router |
| API layer | `frontend/src/lib/api/endpoints.ts` (axios, ~50 groups) | `src/services/*` (mostly **mock** over `src/data/*`) |
| Router | `frontend/src/app/router/index.tsx` | `src/routes/*` (file-based) + `routeTree.gen.ts` |
| Tests | `vitest` (`npm test` in `frontend/`) | none |
| Built + deployed? | **YES** | **NO** |

### Evidence that `frontend/` is canonical

- `scripts/deploy.sh` runs its dependency install, `tsc --noEmit`, test, and
  `vite build` steps in **`$REPO/frontend`**, and verifies `dist/index.html`
  there. It never touches the root tree.
- `.github/workflows/ci.yml` has a `frontend` job whose `working-directory` is
  **`frontend`**, and its own comment states the root `src/` (tanstack_start_ts)
  is the Lovable scaffold and is intentionally not built or deployed.

### Why the legacy tree still exists (and is NOT deleted yet)

`.lovable/project.json` pins `"template": "tanstack_start_ts_current"`. The
root `src/` (plus root `package.json`, `vite.config.ts`) is the **Lovable-managed
scaffold**. Deleting it, or the root package/config, may break Lovable editor
sync and rewrite/lose the project's Lovable history (see the Lovable note in
`AGENTS.md`). Removal is therefore a deliberate, separately-reviewed step, not a
casual cleanup — see `plans-local/77_LEGACY_FRONTEND_MIGRATION_LEDGER.md` for the
salvage-before-delete plan.

## Rules

1. New product UI work goes in `frontend/src/` only.
2. Before deleting anything from the legacy `src/` tree, consult the migration
   ledger (`plans-local/77_LEGACY_FRONTEND_MIGRATION_LEDGER.md`) — some UX
   patterns, authored content, and Arabic pluralization rules are worth
   harvesting first.
3. Deletion of the Lovable scaffold must be confirmed against Lovable-sync
   impact and committed separately with a clear "legacy frontend removal"
   message.
