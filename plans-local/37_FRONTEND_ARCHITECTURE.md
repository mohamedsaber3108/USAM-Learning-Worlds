# 37 — FRONTEND ARCHITECTURE

> Where and how the ONE frontend is built. Resolves the rebuild-target question
> (with an owner-decision flag) and defines the mock→real migration seam.

Date: 2026-09-30

---

## 1. Rebuild target (RECOMMENDATION; owner-confirm — 02 §A)

**Build inside root `src/`** (TanStack Start + Lovable, React 19, Vite 8).
Evidence: it is what `.output` builds, what `start-frontend.sh` runs, and what
Lovable syncs to `kids.usamif.com`. `frontend/` is a thinner legacy react-router
app; `src/LEGACY_DO_NOT_EDIT.md` is stale (references deploy.sh/CI absent here).

> OWNER DECISION (the one blocking item): confirm root `src/` is the target. If
> the owner means the server `frontend/` tree instead, 37/41 change. Everything
> else in the plan is tree-independent. **This blocks Gate 5 execution only.**

## 2. Stack (root `src/`)

TanStack Start/Router (file routes `src/routes/*`), React 19, Vite 8,
TanStack Query, Radix primitives, Tailwind v4, i18next (EN/AR), Pyodide +
Sandpack (coding), the `src/design/` system (22). Deploys as Nitro/Cloudflare
(`.output`).

## 3. The mock→real seam (the central migration lever)

`src/services/contracts.ts` already defines typed service interfaces with the
rule "Frontend ONLY talks to these interfaces — mock today, real tomorrow". Today
most `src/services/*` are mock implementations (`src/data/*` + setTimeout); only
`src/services/api.ts` calls the real backend.

**Migration = replace mock service bodies with real `/api` calls behind the SAME
contracts** — pages don't change, only the service implementation swaps. This is
the cleanest possible path and already designed-for. Prefer one TanStack Query
client + a typed API client (consolidate `api.ts` + contracts).

## 4. API base + prefix

Backend global prefix is `/api` (verified main.ts). Frontend base = `/api`
(same-origin in prod). `src/services/api.ts` base = `VITE_API_URL || .../api`.
Consolidate all groups (auth, learning, missions, mastery, adaptive, characters,
voice, projects, gamification, entitlements, parents, etc.) under one client with
token handling + refresh.

## 5. Age-adaptive rendering

Wrap the app in `AgePresentationProvider` (22 §4); components read presentation
knobs + `resolveCopy` for age-appropriate copy; never branch on age directly.

## 6. Routing / shell

One role-variant shell (18). File-routes reconciled to the IA (17): learner
surfaces, parent `/parent*`, mod `/mod*`, admin `/admin*`, public. Honest 404 for
auth+unauth; role guards with honest 403.

## 7. Rules

- No second frontend; `frontend/` + any preview deprecated after cutover (41).
- All strings i18n (EN/AR), RTL via logical properties.
- Reuse `src/design` + `src/components`; no parallel component system.
