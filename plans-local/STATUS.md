# STATUS — USAM product-first reconstruction

> Living status. Updated after every phase. Honest: nothing marked done without
> evidence. "Plans drive code; code updates plans."

Last updated: 2026-10-02

---

## GOVERNING DECISION (2026-10-02, owner-confirmed, FINAL — do not re-litigate)

**Canonical final frontend workspace = `frontend-rebuild/`.** This supersedes
the 2026-10-01 "Gate 1 reset" that had chosen to patch `frontend/`'s
presentation layer instead. The owner reviewed both trees directly and
confirmed `frontend-rebuild/` is real, substantial, buildable, and leaner (not
a hollow scaffold) — see `docs/architecture/FRONTEND_CANONICAL.md` for the full
three-tree policy. Current roles:

- **`frontend-rebuild/`** = final new frontend UNDER CONSTRUCTION. All new UI
  work goes here. Existing pages inside it are REBUILD CANDIDATES /
  PROVISIONAL, not automatically final, until re-verified against the current
  backend + current design system + current IA + visual QA + preview
  verification.
- **`frontend/`** = CURRENT FUNCTIONAL / PRODUCTION BASELINE. Stays live and
  deployable throughout construction. Regression oracle + legacy reference
  only. The Phase 1–9 "learning world" experience work done here (landing/home/
  learn/missions/English/coding/AI/entrepreneurship/voice/projects, plus the
  P0 auth rebuild and the DiscoverRail checkpoint) is **functional evidence and
  a regression baseline**, not the final product design.
- **root `src/`** = Lovable-managed quarantined scaffold. Preserve, never
  delete, non-production. Settled, not revisited.

**No cutover until**: full backend↔frontend-rebuild reconciliation is clean,
ledger 88 has zero required rows below `FINAL`/`PREVIEW_VERIFIED`, Landing +
Navigation + all 5 role shells are explicitly approved (not just "rebuilt"),
RTL/responsive/a11y verified, and the Playwright preview harness is green
against `/preview/`.

## Current gate: FRONTEND-REBUILD RECONSTRUCTION (active)

Prior gate history (G1–G5 docs, Gate 3 "not started" line below) is retained
for context; it predates the 2026-10-02 governing decision above and is not
the current execution driver. `plans-local/80_MASTER_EXECUTION_CONTROL.md` and
`plans-local/88_NEW_FRONTEND_PAGE_REBUILD_LEDGER.md` are now the live execution
documents for the frontend-rebuild completion effort.

| Gate | Scope | Status |
|---|---|---|
| G1 | Forensic audit + product scope + current reality + gaps | ✅ done + committed; 1 blocking owner decision open (tree) |
| G2 | Research + learning methodology + age/adaptation + OSS | ✅ done (04/05/06/07/36), research-cited |
| G3 | Curriculum + levels + packages + pricing + content + journeys + IA | ✅ done (08-21); merged prior 47/48/66/69 + Product Bible/North Star |
| G4 | Design system + characters + voice + domain products + engines + FE/BE/data/API contracts | ✅ done (22-40) |
| G5 (plan) | Migration/deletion, testing, production, sequence, truth table, acceptance | ✅ docs done (41-46); EXECUTION pending owner tree-confirm |
| G3 | Curriculum + levels + packages + pricing + content + journeys + IA | ⬜ not started |
| G4 | Design system + domain products + engines + FE/BE/data/API contracts | ⬜ not started |
| G5 | Migration + rebuild inside ONE app + test + deprecate legacy | ⬜ not started |

## Done this session (Gate 1)

- Forensic audit of `M:\USAM-main` (schema, main.ts, seed, routes, services,
  package.json, docs) — evidence in 02.
- Created `plans-local/00_MASTER_PRODUCT.md`, `01_PRODUCT_SCOPE.md` (locked
  scope), `02_CURRENT_REALITY_AUDIT.md`, `03_PRODUCT_GAPS.md`, this STATUS.
- Reconciled prior `USAM_KIDS_PRODUCT_BIBLE.md` divergences (ages 7–15→8–14;
  Entrepreneurship→primary; 15-char roster).

## Blocking owner decision (1)

**Which tree is "the original project" to rebuild inside?** Code evidence →
root `src/` (Lovable TanStack app, what `.output` builds, Lovable-connected to
`kids.usamif.com`). A stale `src/LEGACY_DO_NOT_EDIT.md` claims `frontend/` is
canonical. Recommendation: root `src/`. See 02 §A. This does NOT block Gates
2–4 (all tree-independent); it blocks Gate 5 execution.

## Key verified facts (anchor for later gates) — CORRECTED

- Backend global prefix `/api` IS set (main.ts). 4 roles. **96 Prisma models,
  ~56 controllers, ~47 modules** (verified by direct enumeration).
- Monetization EXISTS: `Plan` + `Subscription` + `EntitlementsService` + payment
  abstraction (real gateway external). Explicit Package entity = G3 decision.
- Voice, Notifications, Credentials, Flashcards, Stories, Simulations, Cosmetics,
  FeatureFlags, Experiments, Audit, DailyGoals, Worlds, Reflection, Consent/
  SafetyEscalation — all EXIST as models+modules (depth to verify in G3/G4).
- Dominant REAL gaps: (1) frontend is mock-backed (only `api.ts` real); (2) seed
  data = 12 school subjects, WRONG vs locked 4 domains; (3) character roster
  mismatch (1 seeded / 10 frontend / 15 locked); (4) tree decision.
- English 14 CEFR strands + Coding 18 concepts seeded; only Math has a full slice.

> AUDIT CORRECTION: the first-pass audit under-counted the backend badly (read a
> stale 11-module app.module + grep that doesn't index backend/). 02/03 corrected
> against ground truth. Prior `47_PRICING_PACKAGING.md` was right about Plan/Sub.

## Gate 2 decisions (anchor for Gate 3+)

- Mastery = evidence/retrieval-driven (not exposure). Review scheduling = ADOPT
  `ts-fsrs` (keep confidence model for mastery-state). Session loop = REVIEW→
  DISCOVERY→EXPLAIN→PRACTICE→INTERACT→CREATE→REFLECT (adds the missing teach beat).
- Adaptation multi-factor (age+ability+mastery+interests+history+objective+load);
  wiring is the work (inputs already stored).
- Coding: KEEP Pyodide/Sandpack; map to ISTE/CSTA. AI: AI4K12 five big ideas.
  English: CEFR young-learner pre-A1→B1 descriptors. Entrepreneurship: design
  thinking (Problem→…→Pitch).
- Pricing: multi-domain premium, family-affordable (~$130/yr FAMILY anchor);
  Socratic + parent-inspectable AI = table stakes.

## Gate 3 corrections to current-reality (verified this gate)

- Backend content layer is MUCH richer than first seen: ~55 seed files + ~48
  migrations. 15-character roster ALREADY seeded in `seed-character-universe.ts`
  with the EXACT locked names (char mismatch is FRONTEND-only). ts-fsrs ALREADY
  adopted (migration 20260910). Pricing plans seeded (20260924). Credentials/
  Open-Badges, worlds, stories, simulations, flashcards, projects/rubrics,
  age-variants, learning-paths all seeded. BUT default `prisma db seed`
  (`seed.ts`) is STALE (12 school subjects + Azouz only) — real content is in
  named `seed:*` scripts.
- Dominant real gaps unchanged: mock-backed root `src/` frontend; stale default
  seeder; Entrepreneurship thinnest domain content; adaptive wiring (confidence
  only).

## Gate 4 verified realities (anchor for G5)

- Design system is MATURE in `src/design/` (semantic tokens, 3-mode age
  presentation Explorer/Creator/Pathfinder, motion presets). ADOPT it. Palette is
  amber/teal/magenta (NOT the old rebuild's white/green/black) — owner palette
  decision = token-value change only, no component rewrite.
- Voice is ALREADY provider-independent (Whisper STT + Piper TTS sidecars +
  WER scoring + `POST /voice/turn`). Gate-2 "POC voice" already implemented.
- Characters/AI backend is very rich (orchestrate/unlocked/per-age/conversation
  lifecycle/Socratic coach endpoints/moderation). 15 roster seeded.
- Auth is minimal (register/login/refresh/me + age-band/preferences) — confirms
  no reset/verify/OAuth (PG-21/22).
- Clean mock→real seam EXISTS: `src/services/contracts.ts` ("mock today, real
  tomorrow") — the central migration lever; swap service bodies, pages unchanged.

## ALL PLANNING GATES COMPLETE (G1–G5 docs). EXECUTION AUTHORIZED + STARTED.

Owner confirmed execution. Canonical frontend tree VERIFIED + LOCKED.

## CANONICAL TREE LOCKED: `frontend/` (deployment-chain verified)

Owner-authorized verification done. `scripts/deploy.sh` builds `frontend/`
(`cd "$REPO/frontend"`); CI `frontend-canonical-guard` FAILS if deploy targets
root `src/`; `docs/architecture/FRONTEND_CANONICAL.md` confirms. **CORRECTION
OWNED:** my earlier root-`src/` recommendation was WRONG (over-weighted a stale
`.output` ref, under-inventoried `frontend/`). `frontend/` is RICH: 24 feature
dirs + 61 real axios API groups + real router. Root `src/` = legacy Lovable
scaffold (CI-guarded against deploy; delete via Lovable-safe salvage process 77).
Docs 02/37/41/44 corrected. **Not revisited.**

Backup: tag `pre-reconstruction-checkpoint-20260930` created + pushed (rollback).

Owner directives applied: visual identity is research-driven & replaceable (NOT
locked to any tree's styling); let structurally-bad pages die + rebuild; no new
preview/`/v2`; EXISTENCE != COMPLETENESS (verify every engine end-to-end, update
45 continuously); pricing/legal continue without blocking; execute continuously,
stop only for irreversible owner decisions.

Owner decisions that do NOT block (resolve as reached): final price + enabling
real payment gateway (before charging); legal/privacy counsel copy; optional
auth reset/verify/OAuth.

## Execution started (tree-independent, safe-first)

- Phase B (partial): corrected the default `backend/prisma/seed.ts` to seed the 4
  LOCKED domains (English/Coding/AI Literacy/Entrepreneurship) via idempotent
  upsert + a demonstrative English vertical slice, retiring the 12 school-subject
  domains + Math-only slice. Kept the 15-character universe + cosmetics +
  reflection seeders (already wired). tsc clean. This is backend-only and correct
  under either frontend-tree outcome.
- Remaining Phase B: wire cross-curricular concept tables into the graph; seed
  worlds per the 4 domains (verify `seed-worlds.ts` targets them).

## Execution progress (frontend/ = canonical)

- Phase A baseline VERIFIED: `frontend/` tsc clean, 40/40 tests, build + home-bundle
  green. `frontend/` is a REAL app (61 axios API groups, 24 feature dirs), NOT
  mock — the first audit's "mostly mock" applied to the LEGACY root `src/`.
- Perf finding: 1.9MB vendor chunk (code-split in hardening — directive §19).
- Landing REBUILT (directive §17): was scope-wrong (old 6 school-subject
  "worlds" Math/Science/Arts); now the locked 4 domains (English/Coding/AI/
  Entrepreneurship) + journey + 15-character companions + parent + pricing teaser
  + §17 content. tsc+build+home-bundle green. All 15 CharacterFace SVGs exist.
- CharacterFace already renders all 15 locked names; characterPreference supports
  the 4 hero picks. Backend 4-domain seed already corrected (74768aa).

## LIVE CUTOVER DONE (2026-10-01) — 9ab70cc on https://kids.usamif.com/

Owner ran `scripts/deploy.sh` on the server. VERIFIED LIVE: deployed commit
9ab70cc matches source+remote; live bundle == built bundle; `/` 200; backend
health ok (db connected, env=production); nested-route `/dashboard` 200 (SPA
fallback ok); all auth-guarded endpoints 401; backend 120/120 tests + enum/
migration drift gates pass; frontend 40/40 tests + build + home-bundle pass. DB
backup confirmed working (usam_user@localhost/usam, 362K dump). The 2 "uncommitted"
server files were just QA screenshot artifacts (now gitignored).

HONEST live state: landing is reconstructed+live; the INNER app is the real,
deployed, build-green EXISTING app — good, but only landing + dashboard-quick-
actions have been reconstructed against the new 4-domain product so far. Inner-
surface reconstruction continues; owner re-runs deploy.sh per batch.

## Service-worker / cache investigation (2026-10-01) — RESOLVED (no SW exists)

Investigated "new build deployed but old UI shows". AUTHORITATIVE finding:
- NO service worker anywhere — not in frontend/, root src/, backend/, OR git
  history (git log for *sw.js/*service-worker.js/serviceWorker across --all = 0).
- Current build output = only index.html + usam-logo.png (no sw/manifest/workbox).
- So `200 /sw.js` on prod = nginx SPA `try_files .../index.html` fallback (HTML
  shell under a 200), NOT a real worker. Owner's hypothesis confirmed; my earlier
  SW suspicion was wrong — corrected before shipping any kill-switch.
- Root cause of "old UI": browser (or nginx) caching index.html, so returning
  visitors keep the old shell referencing old hashed JS.

PERMANENT FIX (committed, not a one-off):
- docs/ops/NGINX_CACHE.md: index.html = no-cache/revalidate; /assets/* immutable;
  /sw.js + /service-worker.js = explicit 404 (never SPA-fallback). + apply steps.
- scripts/verify-deployment.sh: new [C] section fails verification if /sw.js or
  /service-worker.js is served as JS or 200-SPA-fallback, or if index.html is
  long-cached. Future regression caught automatically.
- deploy.sh already rebuilds a clean dist/ each deploy (rm -rf dist before build),
  so no stale-file accumulation in the web root.
NO Clear-Site-Data (would log users out), NO SW kill-switch (no SW to kill).

## Reconstruction progress (post-cutover, batch 2)

- Dashboard quick-actions → 4 locked domains (English/Coding/AI/Entrepreneurship),
  AI/Entrepreneurship via /learning/domains/:slug/path. Dashboard was already
  REAL (not mock) — scope fix, not rebuild (directive §5: don't demolish good pages).
- Domain-path page: added Entrepreneurship (Adam) config + EN/AR i18n.
- Fixed 2 pre-existing CI-lint blockers (vitest-axe, Toast). lint now exit 0.
- gitignored qa-screenshots artifacts.
- Gate: lint 0, tsc 0, build 0, 40/40 tests. NOT yet deployed (next deploy batch).

## INNER-SURFACE RECONSTRUCTION COMPLETE (7/7 batches, 2026-10-01)

All inner surfaces audited against the locked 4-domain product + real backend
and reconstructed/verified. Dominant finding: the canonical `frontend/` tree was
already largely REAL + honest (prior rebuild landed here); defects were (a) old
school-subject scope leftovers in a few hardcoded lists, (b) a couple of
wrong-enum bugs, (c) the Entrepreneurship content gap. All fixed surgically
(§5: keep good real code, don't demolish).

Batches (all pushed; owner deploys via scripts/deploy.sh):
- 9ab70cc landing (LIVE), 5adce02 dashboard (LIVE), 5986a52 cache/SW (LIVE)
- b5b86d9 Learn hub + worlds→4 domains
- fd57a23 missions filters real
- 43af328 Progress mastery-bug fix
- 8c80ba0 Entrepreneurship vertical-slice seed
- 2156539 characters/voice audit + stale-note fixes
- 4f894f9 parent/commerce/admin audit + memory-governance false-alarm correction
- (task 7) nav active-state → 4 domains + perf investigation + acceptance doc

Perf (§19): the 1.9MB vendor chunk = coding runtime (sandpack/codemirror/blockly/
monaco), home-bundle gate PASSES (not statically imported by entry). Prior
engineer's e2e-proven note says force-splitting it regressed worse — left as the
validated tradeoff; documented in 45. Not a blind code-split.

No mocks in frontend/ production source (verified). a11y axe tests pass (full
WCAG = manual AT testing, documented). i18n EN/AR present with fallbacks.

## REMAINING = OWNER-RUN (I cannot reach the server / see pixels)
1. Deploy the 6 pushed batches: `bash scripts/deploy.sh` (+ DEPLOY_BACKEND=1 for
   the backend seed changes).
2. Seed content: `cd backend && npm run seed:entrepreneurship:vertical`.
3. Live acceptance walk (46 §7): 8/10/12/14 child personas + parent, EN/AR,
   phone/tablet/desktop, voice on real speech. Eyes-on — the only acceptance
   that counts (I have no browser on the live domain).

## Next (execution — 44)

Phase A foundation wiring (one API client + AgePresentationProvider + real auth)
→ B correct seed (4 domains + 15 chars + worlds) → C core learning loop real →
D first-run + session engine → E companions + voice → F create/projects/portfolio
→ G entrepreneurship content → H parent/mod/admin → I commerce → J harden+QA+
cutover+delete legacy. Each phase ends green + updates 45 truth table with
evidence. Do not stop after planning.
