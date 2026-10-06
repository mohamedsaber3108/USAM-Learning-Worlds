# 89 — Complete History Reconciliation Ledger

> Produced in response to a 45-section "absolute prior-work reconciliation"
> directive (2026-10-06). **Scope honesty note, stated up front**: this ledger
> does not re-derive project history from scratch — it uses the real artifacts
> that already exist (git log, `plans-local/` docs 80-99 written by prior
> sessions, direct code reads of the current `backend/` and `frontend/` trees)
> and adds a NEW, independently-verified cross-reference pass on top. Where a
> prior doc's claim could be checked against current code, it was checked, not
> assumed. Where something could not be checked from this environment (live
> browser rendering, server state, things requiring the owner's eyes), that is
> stated as such, not silently marked done.
>
> This is not a from-zero rebuild of docs 83/84/88/99 (API→FE coverage,
> backend module coverage, page rebuild ledger, final completeness audit) —
> those are real, detailed, and still largely accurate. This ledger
> **supersedes their open items** with a fresh verification pass and records
> what changed as a result.

## 0. Prior reconciliation lineage (verified, not re-litigated)

Two frontend rebuild lineages existed in this project's history:

1. **`frontend/` "World Journey" rebuild** (docs 90, 91, 92; commits around
   `ae9dcec`→`92`): rebuilt Landing + Child Home around `CharacterStage`,
   `WorldJourneyMap`, `DomainPortal`. Owner-reviewed and locked (`91`).
2. **`frontend-rebuild/` full rebuild** (docs 80-88, 99; commits `0d41367`
   through `550f154`): a separate, more complete ground-up rebuild (53 real
   routes, 5 role shells, reconciled against the live backend).

**Verified fact**: the owner explicitly chose lineage 2 over lineage 1
("Decision A cutover", `plans-local/85_FRONTEND_SWITCH_RUNBOOK.md`, executed
in commit `550f154`). `frontend-rebuild/`'s source was moved into `frontend/`
(replacing it), then `frontend-rebuild/` itself was deleted (commit
`3138d04`, briefly reverted then re-applied — confirmed via `git log
--oneline -- frontend-rebuild`). This is a **tracked, deliberate, owner-
approved architectural decision**, not an accidental loss. `WorldJourneyMap`/
`DomainPortal` do not exist in the current tree (confirmed: `Get-ChildItem
frontend/src -Recurse | Select-String WorldJourneyMap` → no matches) because
lineage 2 solved the same product problems (world-first home, character
presence, journey-style progress) with a different, independently-reconciled
implementation (`HomePage.tsx`'s companion+next-action+worlds grid,
`LearnPage.tsx`'s world cards, `WorldDetailPage.tsx`'s sequential mission
path). `CharacterStage.tsx`/`CharacterFace.tsx` DID carry over (both exist at
`frontend/src/features/characters/`) because lineage 2 separately ported them
on their own merits (commit `1dd4f8e`).

**Disposition: NOT_REQUIRED to re-migrate `WorldJourneyMap`/`DomainPortal`** —
superseded by an equivalent, already-reconciled, owner-approved
implementation. Re-introducing them would be reviving an abandoned
architecture, which the original 45-section directive (§24) explicitly warns
against ("Use old trees to discover missing valid work. Do not revive
obsolete architecture").

## 1. What this session verified vs. what prior docs already covered

| Area | Prior doc of record | This session's action |
| --- | --- | --- |
| Backend module/controller inventory | `84_BACKEND_MODULE_COVERAGE.md` | Spot-verified via direct controller reads (learning, projects, community) — accurate |
| API → frontend wrapper coverage | `83_API_FRONTEND_COVERAGE.md` | Re-ran a fresh independent cross-reference (sub-agent + manual verification) — found 3 additional real gaps not in doc 83/88's deferred list (see §2) |
| Page-by-page rebuild status | `88_NEW_FRONTEND_PAGE_REBUILD_LEDGER.md` | Confirmed still largely accurate; the "known gaps" column already honestly listed most of what this pass acted on (rubric viewer, community trending/search/stats) as deferred-not-forgotten |
| Final completeness claims | `99_FINAL_SYSTEM_COMPLETENESS_AUDIT.md` | Confirmed its self-correction note (batch counts) still holds; no new contradiction found |
| Learner nav reachability | (new this conversation, prior turn) | `/app/more` hub fix (commit `bfa449f`) already deployed+verified live before this directive arrived |

## 2. NEW gaps found and fixed this session (triple-verified)

Each row: PROOF 1 (requirement/backend reality) → PROOF 2 (current code) →
PROOF 3 (build/test verification; live-deploy verification pending owner run,
tracked in §5).

### 2.1 `/admin/question-templates` — zero nav/link reachability

- **PROOF 1**: `backend/src/modules/questions/questions.controller.ts` has a
  real `GET /questions/templates` list endpoint with real seeded content.
  `frontend/src/features/admin/AdminQuestionTemplatesPage.tsx` already existed
  and already called it correctly (confirmed by reading the file — it was
  built in ledger-88 batch 5). The route is registered in `router.tsx:213`.
- **PROOF 2 (gap)**: `AppShell.tsx`'s `NAV_BY_ROLE.ADMIN` lists exactly 6
  items (`/admin`, `/content`, `/curriculum`, `/ai`, `/analytics`,
  `/platform`) — `/admin/question-templates` is not among them, and no other
  admin page linked to it (confirmed via grep across `frontend/src`). Same
  orphan-route pattern as the learner `/app/more` fix from the prior turn.
- **FIX**: added a header-action link from `AdminCurriculumPage.tsx` (the
  curriculum/QA/assessment-content area, the correct home for this content
  type) to `/admin/question-templates`. No new nav icon added (consistent
  with the "don't nav-stuff" decision already made for the learner shell).
- **PROOF 3**: `tsc --noEmit` clean, `vite build` clean, `vitest` 7/7, `eslint`
  0 warnings (this session, see §4). Live-verification: pending owner deploy
  (§5).

### 2.2 Project rubric viewer — real backend engine, zero frontend surface

- **PROOF 1**: `backend/src/modules/projects/rubrics.controller.ts`
  (`ProjectRubricController`, `GET /projects/:id/rubric`) +
  `rubrics.service.ts` (`getRubricForProject`). Seed file
  `backend/prisma/seeds/seed-projects-rubrics.ts` carries an explicit
  in-code comment recording it was verified live in production: "seeded 10
  Projects / 50 ProjectMilestones / 8 Rubrics / 30 RubricCriterion rows... 
  confirmed via authenticated GET /api/projects/my and GET /api/projects/:id".
  This is real, seeded, previously-verified-live content.
  `frontend/src/lib/api/endpoints.ts` already had a wrapper
  (`projectsApi.getRubric`) — confirmed via grep it had **zero callers**
  anywhere in `frontend/src` before this session (matches the "known gap:
  missing rubric viewer" line already honestly tracked in ledger 88's
  `/app/projects/:id` row).
- **PROOF 2**: added a `useQuery` call + a new rendered section to
  `frontend/src/features/learner/ProjectDetailPage.tsx` showing each
  `RubricCriterion`'s name/description and its 4-band `levels` JSON
  (beginning/developing/proficient/exemplary), matching the exact shape the
  seed file writes. Honestly empty (`rubric && rubric.criteria.length > 0`
  guard) for the projects that have no rubric attached — no fabricated
  content for projects without one.
- **PROOF 3**: `tsc --noEmit` clean, `vite build` clean, `vitest` 7/7,
  `eslint` 0 warnings. Live-verification: pending owner deploy (§5).

### 2.3 Community trending/search/stats — real backend routes, missing/unused wrappers

- **PROOF 1**: `backend/src/modules/community/community.controller.ts` has
  `GET /community/trending`, `GET /community/search`, `GET /community/stats`
  — all real, all learner-accessible (class-level `JwtAuthGuard` only, no
  extra role gate), all backed by real Prisma queries against
  `visibility: 'PUBLIC', state: 'SHOWCASED'` projects (`community.service.ts`).
  `communityApi.trending` existed in `endpoints.ts` but had zero callers;
  `search`/`stats` had no wrapper at all.
- **PROOF 2**: added properly-typed `trending(limit?)`, `search(q, params?)`,
  `stats()` wrappers to `endpoints.ts` (matching the real response shapes —
  `trending`/`search` reuse `CommunityFeedItem[]`/`{results, total}`, `stats`
  is a flat `{totalProjects, totalLearners, recentProjects}`). Rebuilt
  `CommunityPage.tsx` to show a 3-stat strip, a real search box (debounced via
  `enabled: query.trim().length > 0`, not fired on every keystroke's render),
  and a Trending section above the main feed — all additive, the original
  feed + report flow unchanged.
- **PROOF 3**: `tsc --noEmit` clean, `vite build` clean, `vitest` 7/7 (updated
  `community-page.test.tsx` to dispatch its mock by URL path instead of call
  order, since the page now fires 3 queries on mount — this makes the
  regression test more robust, not just passing), `eslint` 0 warnings.
  Live-verification: pending owner deploy (§5).

## 3. Investigated and classified NOT_REQUIRED / INTERNAL_ONLY (not fixed, with reasoning)

A sub-agent cross-reference pass (backend controllers ↔ `endpoints.ts` ↔
actual call sites ↔ router reachability) surfaced a long list of candidate
gaps. Each was checked by hand; most are correctly internal or already
honestly tracked as deferred in ledger 88, not newly discovered real losses.
Recording the disposition here per directive §21 ("no vague statuses") —
these are **not** silently dropped, they are explicitly classified:

| Item | Disposition | Reasoning (verified) |
| --- | --- | --- |
| `learning.controller.ts` concept/prerequisite/LearningPath/age-variant graph (~30 routes) | INTERNAL_ONLY | Confirmed `DomainPathPage.tsx` (the real learner-facing path UI) calls a **different** controller (`domain-path.controller.ts`), not this one. This controller is the underlying curriculum-authoring/unlock-graph engine other services call into; it is not meant to be a learner-facing page by itself. ADMIN-mutation routes on it are already correctly `RolesGuard`+`@Roles(ADMIN)`-gated (fixed in an earlier session, commit `c97e621`). |
| `adaptive.controller.ts`'s 10 non-`recommendations` routes (`engagement`, `cognitive-load`, `zpd`, `next-activity`, etc.) | INTERNAL_ONLY | These are internal signals the adaptive engine itself consumes to compute the one real learner-facing output, `GET /adaptive/recommendations` (which IS wired, powers Home's "next step"). No evidence any of these were ever intended as standalone learner/staff UI. |
| `learner-model.controller.ts` | INTERNAL_ONLY | Backing model for personalization; no UI requirement found in any prior doc (00-48, 63-99) naming a "Learner Model" page/view. |
| `translation.controller.ts` admin engine | PARTIAL, already tracked | Ledger 88 already lists "translations admin" as deferred depth, not fabricated as done. Confirmed still accurate; not re-promised here. |
| `media.controller.ts` (`GET /media`, `/media/:slug`) | MISSING_FRONTEND, low-confidence, deferred | Real backend routes exist; no prior doc identifies what learner/admin surface should consume generic "media" (ambiguous content type, not clearly mapped to any of the 20 product domains in `13_PRODUCT_DOMAINS`). Flagging rather than guessing a UI for it. |
| `english.controller.ts` (`/english/path`, `/strands`) | PARTIAL, needs owner clarification | A content-library controller distinct from `english-coach.controller.ts` (which IS wired, powers `EnglishCoachPage`). Whether this strand/path library duplicates or supplements `DomainPathPage`'s English content needs a backend-service-level comparison this session did not have time to do with full confidence — **flagging as open, not claiming done**. |
| `voiceApi.turn` / `VoicePage` | BLOCKED_EXTERNAL (unchanged) | Confirmed still correctly gated-honest (`VoicePage.tsx` shows a real "provider-gated" state, not a fake voice UI). Matches the standing decision in ledger 88/99. No voice provider credentials exist in this environment to change this. |
| ~30 other "zero-caller" wrapper functions (admin content-provenance writes, prompt-template edit, mission UPDATE form, analytics events-by-type/retention/stickiness, etc.) | PARTIAL, already tracked | All of these are already explicitly listed in ledger 88's "Still deferred (lower priority, tracked not forgotten)" row with the same honest reasoning repeated here: real content-authoring workflows, additive depth inside an already-functional admin area, not missing required routes. Re-confirmed accurate, not newly discovered, not fixed this pass (scope decision: this pass prioritized LEARNER + cross-role-reachability gaps, which have the highest user-facing impact, over ADMIN content-authoring depth). |

## 4. Verification evidence (this session's changes)

Build gates run from `M:\USAM-main\frontend` after all 5 file changes:

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS (clean) |
| `npm run build` (tsc -b && vite build) | PASS — new bundle `index-B-TMUu5t.js` / `index-DSZWGX51.css` |
| `npm run check:home-bundle` (perf gate) | PASS — "no coding runtime in the entry chunk" |
| `npx vitest run` | PASS — 2 files, 7/7 tests |
| `npm run lint` (eslint --max-warnings 0) | PASS — 0 warnings |

Files changed this session:
- `frontend/src/features/admin/AdminCurriculumPage.tsx` (question-templates link)
- `frontend/src/features/learner/ProjectDetailPage.tsx` (rubric viewer section)
- `frontend/src/lib/api/endpoints.ts` (community trending/search/stats wrappers)
- `frontend/src/features/learner/CommunityPage.tsx` (stats + search + trending UI)
- `frontend/src/test/community-page.test.tsx` (robustified regression test)

## 5. Deployment status (honest — per directive §38, code-only ≠ done)

As of this document: **committed locally, not yet pushed, not yet deployed,
not yet live-verified.** Per standing project constraint, this environment has
no SSH access to the production server — deployment requires the owner to run
an exact command block, which will be provided after commit+push. Live
verification (independent `curl`/bundle-hash check from this machine, as done
for the previous `/app/more` deploy) will follow once the owner confirms the
deploy ran.

## 6. Honest residual (per directive §40 — "I don't know" is not an acceptable final answer, but IS acceptable as a tracked open item)

- The `english.controller.ts` vs `domain-path.controller.ts` content-library
  overlap (§3) needs a dedicated follow-up to resolve with confidence.
- `media.controller.ts`'s intended product surface is unclear from available
  docs — needs an owner decision on what "Media" means in-product before any
  UI is built (building a guessed UI for an ambiguous backend concept would
  violate the "no fabricated capabilities" rule already established in this
  project's prior sessions).
- Full visual/RTL/responsive/a11y QA (ledger 88 step 9) still requires a real
  browser against the live site — not newly re-opened by this session, just
  not newly closed either; unchanged from doc 99's residual list.
- This ledger is **not** a claim of "zero valid feature loss" across the
  entire 45-section directive's scope — it is a claim of: every item listed
  above was independently checked against real code/backend evidence, and
  every fix made was triple-verified per directive §18's definition. Items in
  §3 marked INTERNAL_ONLY/PARTIAL/BLOCKED_EXTERNAL are explicit dispositions,
  not silent omissions.
