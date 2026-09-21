# 03 — Live vs Repository Reconciliation

Compares LOCAL working tree ↔ GIT (current branch) ↔ REMOTE ↔ DEPLOYED
production. Verified via git + the user's deploy logs + live screenshots.

## Sync state (verified)

| Layer | State |
|---|---|
| LOCAL working tree (`M:\USAM-main`) | **Clean** — no uncommitted changes. |
| CURRENT BRANCH `fix/p0-p1-remediation` | HEAD `5c95774`. |
| Ahead of remote (committed, unpushed) | **None.** |
| Behind remote (pushed, unpulled) | **None.** LOCAL == REMOTE. |
| REMOTE `origin/fix/p0-p1-remediation` | `5c95774` (matches local). |
| DEPLOYED (kids.usamif.com) | Built from `index-BnjZKQCy.js` / `index-DdFR7rbb.css` = commit `474e25c` code (floating pill nav). HEAD is 2 commits newer but both are **docs-only** (`abf49a9`, `5c95774`) → **deployed CODE == remote code.** No stale code deploy. |

**Conclusion:** LOCAL = GIT = REMOTE = DEPLOYED (code). No divergence, no
unpushed code, no stale/wrong-branch deploy on the working line.

## The one real divergence (documented, not touched)

- **Orphaned `main` in the OTHER worktree** `M:\USAM Learning Worlds`: no common
  ancestor with `origin/main` (merge-base = ∅). Local `main` = 21 ahead / 358
  behind an UNRELATED history. Contains 6 legitimate backend compile-fixes
  (import paths, `findAllCharacters`, `masterySummary` typo) committed as
  `1100efb`, preserved under tag `backend-fixes-orphan-main`.
  **Action: never push orphan `main`. Cherry-pick those 6 fixes onto
  `fix/p0-p1-remediation` when convenient** (they are backend correctness fixes).

## Live-vs-repo visual findings (from screenshots)

| Observation (live) | Repo cause | Status |
|---|---|---|
| Redesign IS live (bright hero, warm canvas, char stage, world tiles, pill nav) | `474e25c` deployed | ✅ confirmed reaching users |
| Header wordmark shows garbled `1؏m`/`USAm` | `usam-logo.png` distorts (RTL/scaling) | BUG → Slice 0 |
| Arabic mode still shows English blocks (hero title, section headings, feature cards, CTA, footer) | ~13 hardcoded strings in `LandingPage.tsx` (lines 38-43, 100, 168, 218, 240, 263-264, 284) | BUG → Slice 0 |
| Login/onboarding fully Arabic | wired to i18n correctly | ✅ |

## Environment / config (to verify on server, not from repo)

Cannot verify from repo alone (documented as open items, not assumed OK):
- `VITE_API_URL` on the built frontend (should point to `/api` via same origin).
- Backend `ALLOWED_ORIGINS`/`CORS_ORIGIN` includes `https://kids.usamif.com` (was fixed earlier, commit `3ba7170`).
- Bedrock AI creds present in prod `.env` (gates features #21/23/26).
- DB migrations applied + seed/content present (mastery/missions need real content rows).
These belong in `16_PRODUCTION_CHECKLIST.md`.

## No action taken

Per instruction: discrepancies documented, nothing modified/deleted on
assumption. The only pending recommended change is the orphan-`main`
cherry-pick, which awaits explicit go-ahead.
