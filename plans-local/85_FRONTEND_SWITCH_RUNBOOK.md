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

> **UPDATED 2026-10-02** — the `git mv` list below was re-verified file-by-file
> against the actual current `frontend-rebuild/` tree (not from memory) during
> the final pre-cutover reconciliation pass. The original list in this runbook
> was missing `public/` (logo+favicon), `.env.production`/`.env.example`
> (same-origin `/api` config, already correct for root deploy — no change
> needed at cutover), `eslint.config.js` (added this pass; `frontend/` already
> has an equivalent), and the two preview scripts (`preview-verify.mjs`,
> `preview-screenshots.mjs`) added this pass. The list below is complete.
> Also confirmed: `deploy.sh`'s `npm ls react react-dom react-router-dom
> @tanstack/react-query` check (step 3) ALREADY matches the rebuild's real
> deps — the "update this check" TODO in the original runbook text below is
> already done; no `deploy.sh` edit is needed at cutover.

Recommended mechanics (run in a clean working tree, on the branch):

```bash
# from repo root, on fix/p0-p1-remediation
git rm -r frontend/src frontend/index.html frontend/package.json \
          frontend/package-lock.json frontend/tailwind.config.js \
          frontend/postcss.config.js frontend/tsconfig.json \
          frontend/tsconfig.node.json frontend/vite.config.ts \
          frontend/vitest.config.ts frontend/playwright.config.ts \
          frontend/eslint.config.js frontend/public frontend/.env \
          frontend/scripts/check-home-bundle.mjs frontend/README.md \
          frontend/e2e

# move the rebuilt app into the frontend/ path the pipeline builds
git mv frontend-rebuild/src frontend/src
git mv frontend-rebuild/index.html frontend/index.html
git mv frontend-rebuild/package.json frontend/package.json
git mv frontend-rebuild/package-lock.json frontend/package-lock.json
git mv frontend-rebuild/tailwind.config.js frontend/tailwind.config.js
git mv frontend-rebuild/postcss.config.js frontend/postcss.config.js
git mv frontend-rebuild/tsconfig.json frontend/tsconfig.json
git mv frontend-rebuild/vite.config.ts frontend/vite.config.ts
git mv frontend-rebuild/eslint.config.js frontend/eslint.config.js
git mv frontend-rebuild/public frontend/public
git mv frontend-rebuild/.env.production frontend/.env.production
git mv frontend-rebuild/.env.example frontend/.env.example
git mv frontend-rebuild/README.md frontend/README.md
git mv frontend-rebuild/scripts/check-home-bundle.mjs frontend/scripts/check-home-bundle.mjs
git mv frontend-rebuild/scripts/preview-verify.mjs frontend/scripts/preview-verify.mjs
git mv frontend-rebuild/scripts/preview-screenshots.mjs frontend/scripts/preview-screenshots.mjs
# frontend-rebuild/.gitignore has no legacy-tree equivalent worth preserving
# separately — frontend/.gitignore already covers node_modules/dist/.env*;
# no action needed.

git commit -m "chore(frontend): switch production to the rebuilt frontend (Decision A cutover)"
git push
```

`frontend/package.json` (now the rebuild's) already has `build`,
`check:home-bundle`, `lint`, and `test` scripts under those exact names —
re-verified 2026-10-02 — so `deploy.sh` and `.github/workflows/ci.yml`'s
`frontend` job both work unmodified after this commit. The CI
`frontend-canonical-guard` job (greps `deploy.sh` for the literal string
`cd "$REPO/frontend"`) also keeps passing — this cutover changes `frontend/`'s
*contents*, not the path `deploy.sh` builds, so the grep still matches.

`frontend-rebuild/` has no `tsconfig.node.json`, `vitest.config.ts`, or
`playwright.config.ts` equivalents — the rebuild's `vite.config.ts` already
contains the vitest `test` block inline (see its header comment: `/// <reference
types="vitest/config" />`) and there is no Playwright/E2E suite in the rebuild
yet (tracked separately, not a cutover blocker — CI's `frontend` job never
calls `npm run e2e`). These legacy files are correctly `git rm`'d with no
rebuild replacement.

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

## Appendix A — Legacy → Final route mapping (URL-change audit)

The rebuild intentionally restructured the URL space: learner surfaces now live
under `/app/*`, and guardian/moderator/admin have dedicated `/parent`, `/mod`,
`/admin` shells. That means **many legacy URLs change** at cutover. Anyone with
a bookmark or deep link to a legacy path will hit the honest 404 unless
redirects are added. Decide per row below whether a redirect is warranted; the
learner set is the one that matters most for real users.

Source of truth: legacy `frontend/src/app/router/index.tsx` (`1ae4dcd`) →
rebuilt `frontend-rebuild/src/app/router.tsx`.

### Public / auth / onboarding
| Legacy path | Final path | Change |
| --- | --- | --- |
| `/` | `/` | same (role-aware landing/redirect) |
| `/login` | `/login` | same |
| `/register` | `/signup` | RENAMED |
| `/onboarding/language|welcome|age|interests|character|complete` (6 pages) | `/onboarding` (single stepper) | CONSOLIDATED |
| (none) | `/pricing`, `/how-it-works`, `/for-families`, `/safety`, `/legal`, `/verify/:uid` | NEW public surfaces |

### Learner (legacy top-level → `/app/*`)
| Legacy path | Final path | Change |
| --- | --- | --- |
| `/dashboard` | `/app` | MOVED |
| `/missions` | `/app/learn` (+ mission detail) | MOVED/reframed |
| `/missions/:id` | `/app/missions/:id` | MOVED |
| `/missions/play/:runId` | `/app/runs/:runId` | MOVED/renamed |
| `/missions/complete` | (folded into player result state) | REMOVED as route |
| `/practice` | `/app/practice` | MOVED |
| `/evidence` | (folded into `/app/progress`) | MERGED |
| `/worlds`, `/worlds/:id` | `/app/learn` + `/app/learn/:slug` | MERGED into domain path |
| `/simulations`, `/simulations/:slug` | `/app/simulations` | MOVED (player = follow-on depth) |
| `/learn`, `/learn/concepts/:id`, `/learn/paths`, `/learn/paths/:id` | `/app/learn`, `/app/learn/:slug` | CONSOLIDATED into domain path |
| `/learn/flashcards`, `/learn/visual-language` | `/app/practice` | MERGED |
| `/learning/domains/:slug/path` | `/app/learn/:slug` | MOVED/renamed |
| `/projects`, `/projects/:id`, `/portfolio` | `/app/projects`, `/app/projects/:id`, `/app/portfolio` | MOVED |
| `/plans` | `/pricing` (public) + `/parent/plan` (manage) | SPLIT by role |
| `/community` | `/app/community` | MOVED |
| `/achievements`, `/balanced`, `/shop` | `/app/rewards` | MERGED |
| `/leaderboard` | `/app/leaderboard` | MOVED (real page added ledger-88 batch 5, linked from Rewards — was briefly a gap, now closed) |
| `/progress` | `/app/progress` | MOVED |
| `/insights` | `/app/insights` | MOVED (real page added ledger-88 batch 5, linked from Progress — was briefly a gap, now closed) |
| `/voice-chat` | `/app/voice` | MOVED/renamed |
| `/english`, `/english/coach`, `/coding` | `/app/learn/:slug` (domain path) | MERGED |
| `/characters`, `/characters/:id/chat` | `/app/companions` | MERGED |
| `/stories`, `/stories/:id` | `/app/stories`, `/app/stories/:id` | MOVED |
| `/creativity` | `/app/create` | MOVED/renamed |
| `/cross-curricular/:category(/:slug)`, `/thinking/:engine(/:slug)` | `/app/learn/:slug` (domain path) | MERGED |
| (none) | `/app/search`, `/app/notifications`, `/app/credentials`, `/app/settings` | NEW learner surfaces |

### Guardian (legacy mixed into learner tree → dedicated `/parent`)
| Legacy path | Final path | Change |
| --- | --- | --- |
| `/parents` | `/parent` | RENAMED (+ role shell) |
| `/parents/children/:id/time-limits` | `/parent/child/:id` (controls tab) | MERGED into child detail |
| `/parents/children/:id/privacy` | `/parent/privacy` + child detail | RESTRUCTURED |
| (none) | `/parent/plan` | NEW (plan activate/cancel) |

### Moderator (legacy had NONE — folded under admin)
| Legacy path | Final path | Change |
| --- | --- | --- |
| `/admin/safety-escalations` | `/mod/escalations` (+ admin still sees) | NEW moderator role split |
| `/admin/interventions` | `/mod/interventions` | NEW moderator role split |
| (none) | `/mod`, `/mod/community` | NEW moderator surfaces |

### Admin (many granular pages → 6 task-oriented areas)
| Legacy path | Final area | Change |
| --- | --- | --- |
| `/admin/missions`, `/admin/content-items`, `/admin/prompt-templates` | `/admin/content` / `/admin/curriculum` / `/admin/ai` | CONSOLIDATED (missions→curriculum, content-items→content, prompt-templates→ai) |
| `/admin/question-templates` | `/admin/question-templates` | MOVED (real page added ledger-88 batch 5 — read-side only; was briefly a gap, now closed) | |
| `/admin/content-qa`, `/admin/assessment-quality`, `/admin/misconceptions` | `/admin/curriculum` | CONSOLIDATED |
| `/admin/ai-eval`, `/admin/safety-policies` | `/admin/ai` | CONSOLIDATED |
| `/admin/analytics` | `/admin/analytics` | same area |
| `/admin/feature-flags`, `/admin/experiments`, `/admin/audit-log` | `/admin/platform` | CONSOLIDATED |
| `/admin/memory-governance` | `/admin/platform` (MemoryGovernanceSection) | MERGED — the "withheld, authz gap" note below this table was WRONG (see superseding note at the top of this file); it's shipped, confirmed |
| (none) | `/admin` overview | NEW |

### Cutover redirect decision — SUPERSEDED, already implemented

> The "owner decision" framing below is now moot: ledger-88 batch 5
> (2026-10-02) implemented the FULL legacy→final redirect map as real routes
> in `frontend-rebuild/src/app/router.tsx` (~60 `<Navigate>`/`ParamRedirect`
> routes), not just the 5 "minimum" ones originally suggested here. Full
> rationale per route: `docs/ops/LEGACY_URL_REDIRECT_MAP.md`. The catch-all
> still renders an honest 404 for the small set of legacy paths with no real
> equivalent (e.g. `/worlds/:id` — no id→slug mapping exists client-side).
> These redirects move to `frontend/src/app/router.tsx` automatically as part
> of the `git mv frontend-rebuild/src frontend/src` step above — no separate
> action needed.

~~Catch-all now renders an honest 404... Recommended minimum redirects...~~
(historical — see note above; fully superseded by the real implementation)
