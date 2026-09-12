# 15 — Git & Repository State

**Audit date:** 2026-09-10. **Method:** `git fetch --prune`, branch/commit/merge inspection on the real repo.

## Source-of-truth resolution

There are three distinct code lines that must not be confused:

1. **`origin/main @ 3a787c0`** — the real, current product (NestJS backend + Prisma + React-Router `frontend/`). **This is the authoritative baseline.** 358 commits of real feature work ("Gap Matrix Tick 1–57").
2. **Old local workspace `M:\USAM Learning Worlds`** — an obsolete, **unrelated Git history** (no merge base with current `origin/main`; ~20 local-only commits, 358 behind). Must NOT be merged into the product. Kept only as legacy evidence.
3. **Deprecated root `src/` TanStack mock app** — lives inside the repo, documented deprecated, mock-heavy, not deployed. Legacy.

## Working state (this audit)

- Redesign worktree: `M:\USAM-main` on branch `redesign/ux-overhaul`, tracking `origin/main`.
- `redesign/ux-overhaul` is **2 commits ahead** of `origin/main`:
  - `a3bd454` feat(frontend): USAM deep-teal brand redesign + logo integration
  - `aa8c938` fix(frontend): clear pre-existing lint errors blocking CI gate
- Build + lint verified green on this branch. **Not pushed, not merged** (per git-safety: no push without explicit request).

## Branch inventory

- **51 remote `agent-*` branches** exist. All but one have been merged into `origin/main` (their work is already in the product baseline).
- **Only unmerged branch:** `origin/agent-frontend-rtl-audit-v1` — 2 RTL polish commits (logical-property margins, icon flips) across 9 root-`src/` UI files. Because it targets the **deprecated root app**, its value is low; the RTL work that matters already landed in `frontend/`.
- Fetched refs also exposed `refs/pull/1/head` and `refs/pull/2/head`; live PR open/closed status was **not** verified (GitHub CLI unavailable in this environment). → `17_RESEARCH_BACKLOG`.

## Divergent / abandoned / duplicated work

| Finding | Evidence | Classification |
|---|---|---|
| Old local history disconnected from product | No merge base; `merge-tree` refuses "unrelated histories" | LEGACY — do not merge |
| Root `src/` TanStack app duplicates learner UI conceptually | Two frontends; `FRONTEND_ARCHITECTURE_DECISION.md` marks `frontend/` authoritative | DEPRECATED — plan removal (see `16_CLEANUP`) |
| `agent-frontend-rtl-audit-v1` unmerged | `git branch -r --no-merged origin/main` | DECISION — likely REJECT (targets dead tree) |
| `backend/p.$disconnect())` stray file | Present in tree from earlier session artifact | DELETE candidate (verify) |
| `character.controller.ts.backup` | Backup file committed | DELETE candidate (verify) |

## Recommendations (not yet executed — audit only)

1. Treat `origin/main` as the only product baseline; never merge the old local history.
2. Decide the fate of `redesign/ux-overhaul`: review in browser, then push as a new branch / PR into `origin/main`.
3. Formally reject `agent-frontend-rtl-audit-v1` unless the root app is revived (it should not be).
4. Add the root `src/` removal to the cleanup list once CI is confirmed to build only `frontend/`.
5. Remove stray artifacts (`backend/p.$disconnect())`, `*.backup`) after dependency check.
