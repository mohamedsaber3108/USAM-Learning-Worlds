# 41 — MIGRATION & DELETION (to ONE app)

> End state: ONE USAM app, ONE frontend, ONE source of truth. No parallel tree,
> no `/preview`, no `/new`, no `/v2`. This defines how we migrate into the ONE
> app and safely delete the obsolete implementations.

Date: 2026-09-30

---

## 1. Target (37 §1) — LOCKED

Rebuild INSIDE **`frontend/src/`** (the deployed app per deploy.sh + CI). Root
`src/` is the LEGACY Lovable scaffold.

## 2. What gets migrated vs deleted

| Tree | Action |
|---|---|
| **`frontend/`** | THE app — reconstructed in place (verify/finish/rebuild surfaces) |
| root `src/` (Lovable scaffold) | SALVAGE good patterns/content (77) → DELETE via Lovable-safe process |
| `frontend-rebuild/` (server-only, prior era) | its work largely landed in `frontend/`; any residue = REFERENCE → DELETE |
| root `src/data/*` + `src/services/*` mocks | SALVAGE useful data (character authoring, Arabic rules) → DELETE with the scaffold |
| `src/LEGACY_DO_NOT_EDIT.md` | KEEP until the scaffold is deleted (CI guard requires it present while `src/` exists) |

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

## 5. Lovable / git-history safety (AGENTS.md + FRONTEND_CANONICAL + 77)

Root `src/` + root `package.json`/`vite.config.ts` are Lovable-managed
(`.lovable/project.json` pins `tanstack_start_ts_current`). Deleting them may
break Lovable editor sync + rewrite project history. So scaffold removal is a
DELIBERATE, separately-reviewed, owner-gated step (per FRONTEND_CANONICAL + 77) —
NOT a casual cleanup, and NOT a history rewrite. Backup tag
`pre-reconstruction-checkpoint-20260930` pushed. Do NOT force-push/rewrite pushed
history. The CI `frontend-canonical-guard` requires `src/LEGACY_DO_NOT_EDIT.md`
to exist while `src/` exists — keep it until the scaffold is removed.

## 6. Backend migration (surgical, not rebuild — 38 §3)

Replace default seeder; wire cross-curricular concepts; add usage meter; fix
memory-governance authz; verify rate-limit. Schema is largely final (enum-drift
fixes already applied). No destructive production-data migration without owner
approval (standing rule).

## 7. End-state checklist

- [ ] ONE frontend (`frontend/`), no parallel trees.
- [ ] No mock data in production paths.
- [ ] root `src/` Lovable scaffold salvaged + deleted (owner-gated, Lovable-safe).
- [ ] `frontend-rebuild/` residue (if any) deleted.
- [ ] Seed = 4 domains + 15 characters + worlds.
- [ ] All role journeys on real APIs (`frontend/src/lib/api/endpoints.ts`).
- [ ] No `/preview`, `/new`, `/v2` parallel trees.
