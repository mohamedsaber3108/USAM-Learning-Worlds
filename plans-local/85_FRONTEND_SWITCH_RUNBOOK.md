# 85 — Frontend Switch Runbook (task 13, OWNER-RUN)

> The controlled cutover from the legacy `frontend/` (`1ae4dcd`) to the rebuilt
> `frontend-rebuild/`. This is the highest-blast-radius, hardest-to-reverse step
> in the whole rebuild, so it is a deliberate OWNER-RUN runbook, not an
> auto-executing script. Production stays on the legacy build until the final
> flip. Every step is reversible via git until the legacy tree is deleted.
>
> Prerequisite: `plans-local/99_FINAL_SYSTEM_COMPLETENESS_AUDIT.md` code-side
> gate MET (it is) AND the staging verification below passes.

## Phase 1 — STAGE (no cutover; production unchanged)

On the server (`~/USAM-Learning-Worlds`):

```bash
bash scripts/stage-rebuild.sh
```

This syncs source, then runs npm ci + tsc + tests + build + home-bundle gate
against `frontend-rebuild/` and produces `frontend-rebuild/dist`. It does NOT
touch the live `frontend/` build. If any gate fails, it aborts and nothing
changes.

## Phase 2 — VERIFY the staged build (owner, browser)

Serve the staged build without cutting over. Either:

- `cd frontend-rebuild && npm run preview` (local to the server), or
- point a temporary nginx location (e.g. `/preview`) at `frontend-rebuild/dist`
  with `/api` still proxied to the backend.

Then run the acceptance pass (record in ledgers 81/82):

1. Log in as the proof learner; walk the learning loop (domain → mission →
   submit → mastery → review), including a coding activity (Pyodide runs,
   server re-validates). Confirm it matches the `1ae4dcd` baseline behavior.
2. Log in as a guardian; check child progress/activity/safety + time limits +
   plan activate/cancel + privacy export.
3. Log in as a moderator; triage an escalation, review community, an
   intervention.
4. Log in as an admin; content DRAFT→PUBLISHED, toggle a feature flag, view
   analytics + audit.
5. EN and AR (RTL) on phone / tablet / desktop for the main surfaces.
6. Confirm 401→login, 403 wrong-role, honest 404, entitlement-locked
   (missionsPerDay), and honest empty states.

If anything regresses vs the baseline, STOP and report — do not cut over.

## Phase 3 — CUT OVER (reversible via git)

Only after Phase 2 passes. The live `scripts/deploy.sh` builds `frontend/`, so
the cutover replaces the `frontend/` app source with the rebuilt app, in a
single reviewable commit (legacy remains in git history → revertable).

Recommended mechanics (run in a clean working tree, on the branch):

```bash
# from repo root, on fix/p0-p1-remediation
git rm -r frontend/src frontend/index.html frontend/package.json \
          frontend/tailwind.config.js frontend/postcss.config.js \
          frontend/tsconfig*.json frontend/vite.config.ts

# move the rebuilt app into the frontend/ path the pipeline builds
git mv frontend-rebuild/src frontend/src
git mv frontend-rebuild/index.html frontend/index.html
git mv frontend-rebuild/package.json frontend/package.json
git mv frontend-rebuild/package-lock.json frontend/package-lock.json
git mv frontend-rebuild/tailwind.config.js frontend/tailwind.config.js
git mv frontend-rebuild/postcss.config.js frontend/postcss.config.js
git mv frontend-rebuild/tsconfig.json frontend/tsconfig.json
git mv frontend-rebuild/vite.config.ts frontend/vite.config.ts
git mv frontend-rebuild/scripts/check-home-bundle.mjs frontend/scripts/check-home-bundle.mjs
# keep frontend/.env (git-tracked, skip-worktree, VITE_API_URL=/api) as-is

git commit -m "chore(frontend): switch production to the rebuilt frontend (Decision A cutover)"
git push
```

Note the rebuild's `build` script is `tsc -b && vite build` and it has its own
`check:home-bundle`; confirm `frontend/package.json` (now the rebuild's) keeps a
`build` + `check:home-bundle` script so `deploy.sh` steps 4/6 still pass. The
deploy script's Radix `npm ls` verification (step 3) references the OLD deps —
update that check in deploy.sh to the rebuild's dependency set (react-router/
react-query/zustand/i18next) OR relax it, in the same cutover commit, so step 3
doesn't false-fail.

## Phase 4 — DEPLOY + LIVE VERIFY

```bash
DEPLOY_BACKEND=0 RUN_TESTS=1 bash scripts/deploy.sh
```

Runs the 7-stage gated pipeline against the now-rebuilt `frontend/`. Confirm all
gates green + `verify-deployment.sh` passes + `deploy-meta.json` shows the new
commit. Then smoke the live site (landing, login, a learner journey, a parent
view, an admin view) per §43 of the master protocol.

## Phase 5 — DELETE superseded implementation

After live verification passes:

```bash
git rm -r frontend-rebuild   # now empty of app source (moved into frontend/)
git commit -m "chore(cleanup): remove staged rebuild tree after production cutover"
git push
```

Root `src/` (Lovable scaffold) STAYS quarantined — do NOT delete it (separate
concern, ledger 77).

## Rollback (if live verify fails)

`git revert` the cutover commit and re-run `deploy.sh`. Because the legacy
`frontend/` is preserved in git history until Phase 5, rollback is a revert, not
a rebuild. Do not delete `frontend-rebuild/` (Phase 5) until live verification
is solid.

## Why this is owner-run

This dev workspace has no network path to the server (DNS to host/github flaky,
no SSH/pm2/nginx/DATABASE_URL). The staging + cutover + deploy + live verify all
require the server. The runbook makes each step explicit, gated, and reversible.
