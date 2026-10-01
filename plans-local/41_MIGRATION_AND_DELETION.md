# 41 — MIGRATION & DELETION (to ONE app)

> End state: ONE USAM app, ONE frontend, ONE source of truth. No parallel tree,
> no `/preview`, no `/new`, no `/v2`. This defines how we migrate into the ONE
> app and safely delete the obsolete implementations.

Date: 2026-09-30

---

## 1. Target (37 §1)

Rebuild INSIDE root `src/` (the Lovable TanStack app that builds `.output` and
syncs to `kids.usamif.com`). [Owner-confirm before deletion steps.]

## 2. What gets migrated vs deleted

| Tree | Action |
|---|---|
| root `src/` | THE app — rebuilt in place (mock→real behind contracts, 37 §3) |
| `frontend/` (legacy react-router) | REFERENCE during rebuild → DELETE after cutover |
| `frontend-rebuild/` (server-only, prior era) | REFERENCE ONLY → DELETE after cutover |
| `src/data/*` mocks | REMOVE as each service goes real (no mock left in prod paths) |
| `src/services/*` mock bodies | REPLACED by real `/api` impls behind same contracts |
| stale `src/LEGACY_DO_NOT_EDIT.md` | UPDATE/REMOVE once target confirmed |

## 3. Migration method (reuse good work, don't rewrite blindly)

- Keep the contracts (`src/services/contracts.ts`) + design system (`src/design`)
  + routes/pages shells; swap mock service bodies for real calls (37 §3).
- Reuse rich frontend character authoring, renamed to the 15 roster (23 §2).
- Reuse good components from `frontend/`/`frontend-rebuild` as REFERENCE only —
  copy patterns, don't fork a second app.

## 4. Deletion gates (reversible via git until final)

Delete a legacy tree ONLY after: (a) its capabilities are live in the ONE app,
(b) the ONE app passes build + tests + observed QA (46), (c) cutover verified
live. Deletion is a reviewable commit; legacy stays in git history (revertable).
Order: cut over → verify live → delete `frontend/` + `frontend-rebuild/` →
remove remaining mock data/services.

## 5. Lovable / git-history safety (AGENTS.md)

Root `src/` is Lovable-managed. Do NOT force-push / rewrite pushed history
(syncs to Lovable; loses project history). Keep the connected branch working.
Deletion of legacy trees is normal commits, not history rewrites.

## 6. Backend migration (surgical, not rebuild — 38 §3)

Replace default seeder; wire cross-curricular concepts; add usage meter; fix
memory-governance authz; verify rate-limit. Schema is largely final (enum-drift
fixes already applied). No destructive production-data migration without owner
approval (standing rule).

## 7. End-state checklist

- [ ] ONE frontend (root `src/`), no parallel trees.
- [ ] No mock data in production paths.
- [ ] `frontend/` + `frontend-rebuild/` deleted.
- [ ] Seed = 4 domains + 15 characters + worlds.
- [ ] All role journeys on real APIs.
- [ ] Legacy references removed from docs (LEGACY_DO_NOT_EDIT updated).
