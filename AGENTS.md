<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Canonical frontend (READ BEFORE ANY UI WORK)

> **The production frontend is `frontend/`.** All product UI work — routes,
> components, tests, API integrations, design-system work — MUST target
> `frontend/src/`. Do **not** implement product work in the repository-root
> `src/` tree.

The repository has two frontend trees:

- `frontend/` (`usam-learning-worlds-frontend`, React 18 + react-router-dom) —
  **canonical and deployed**. `scripts/deploy.sh` and `.github/workflows/ci.yml`
  build this tree.
- root `src/` (`tanstack_start_ts`, React 19 + TanStack Start) — the
  **Lovable scaffold**, pinned by `.lovable/project.json`. **Not deployed.**
  Frozen for product work; scheduled for removal after salvage (do NOT delete
  it casually — it is Lovable-managed and deletion may affect Lovable sync /
  history).

See `docs/architecture/FRONTEND_CANONICAL.md` and
`plans-local/77_LEGACY_FRONTEND_MIGRATION_LEDGER.md`.
