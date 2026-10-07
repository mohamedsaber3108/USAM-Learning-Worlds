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

### 2.4 English strand/path controller — RESOLVED (false positive, no gap)

- **PROOF 1**: `english.controller.ts`'s own doc comment states `GET
  /english/path` is "a back-compat shim... delegates with slug 'english'" to
  the exact same `DomainPathService` behind the generic
  `GET /learning/domains/:slug/path` that `DomainPathPage.tsx` already calls.
  Confirmed by reading `domain-path.service.ts:42-45,97-100`: it already
  decorates every English competency with `cefrLevel`/`strandType` pulled
  from the real `EnglishStrand` model (null for non-English domains, by
  design — the projection stays generic across all domains).
- **PROOF 2 (the real, smaller gap)**: `frontend/src/lib/api/learning-types.ts`'s
  `DomainPathCompetency` interface never declared `cefrLevel`/`strandType`,
  so TypeScript's structural typing silently dropped fields the backend was
  always sending. `DomainPathPage.tsx` never rendered them. Fixed: added both
  fields to the type, and render `cefrLevel` as a pill next to each English
  competency's name in `DomainPathPage.tsx` (null-safe — only shows for
  domains that actually have strand data, i.e. English).
- **PROOF 3**: `tsc --noEmit` clean, `vite build` clean (bundle
  `index-BAaQbK2W.js`), `check:home-bundle` OK, `vitest` 7/7, `eslint` 0
  warnings. Live-verification: pending owner deploy (§5).
- `GET /english/strands`, `/english/strands/:slug` (a raw strand browser,
  distinct from the path projection) remain unwired — confirmed no page
  needs a standalone strand list (the path view is the real product surface
  for this content); classified **NOT_REQUIRED**, not missing.

### 2.5 Media Engine (`media.controller.ts`, `MediaAsset` model) — OBSOLETE

- **PROOF 1**: Read the full seed file (`seed-media-assets.ts`, 12 real
  CC0/public-domain illustration assets from Wikimedia Commons). Every asset
  is tagged with a `domainSlug` from the RETIRED 12-school-subject domain set
  (`science`, `mathematics`, `social-studies`, `technology`, `arts`) — the
  exact same pre-pivot domain naming bug already found and fixed twice this
  project (stories: commit `70a80df`'s `STORY_DOMAIN_SLUG` remap; flashcards:
  same commit's domain remap to `english/coding/ai-literacy/entrepreneurship`).
  Confirmed via `seed-worlds.ts` that the only 4 real domain slugs in the
  current product are `english`, `coding`, `ai-literacy`, `entrepreneurship`.
- **PROOF 2 (why this one is OBSOLETE, not a 3rd instance of the same fix)**:
  Unlike stories/flashcards, this seed function (`seedMediaAssets`) is **not
  called from any seed orchestration script** (`prisma/seed.ts` has zero
  reference; `package.json` has no `seed:media` script) — confirmed via
  grep, zero matches. No mission/activity seed content anywhere references
  any of these 12 asset slugs (`solar-system-diagram`, `water-cycle-diagram`,
  etc. — grep for the slugs outside the seed file itself: zero matches). No
  product doc (00-99) names a "Media Gallery" or asset-browser as a required
  learner/admin surface. This is pre-pivot content for a product shape (12
  school subjects) that no longer exists, sitting disconnected from
  everything — not live, seeded, or referenced content that got orphaned by
  a frontend rebuild.
- **DISPOSITION**: `OBSOLETE`. Building a UI for it would mean inventing a
  feature with no real requirement and remapping 12 assets to domains they
  were never designed for (unlike stories/flashcards, which had clean,
  obvious 1:1 remaps — "water cycle" doesn't map cleanly to English/Coding/
  AI-Literacy/Entrepreneurship). Correct action is leaving the dead code as
  isolated technical debt (not currently causing harm — it's never invoked)
  rather than fabricating a page for it. Not deleting the controller/service/
  seed file this pass (out of scope — deletion review belongs with whoever
  owns the Phase-20-era content-engine backlog, per directive §42's
  zero-garbage rule balanced against not making unreviewed deletions).

### 2.6 Content item authoring (create) — real backend, zero UI caller

- **PROOF 1**: `POST /admin/content-items` (`content-items.controller.ts
  create`, ADMIN-gated) is real. `adminApi.createContentItem` existed in
  `endpoints.ts` with zero callers (confirmed in round 1's audit, deferred
  at the time as "a real content-authoring workflow... out of scope for
  this gap-closing batch"). `AdminContentPage.tsx` was list-and-advance-
  status-only.
- **PROOF 2**: added a `NewContentItemDialog` to `AdminContentPage.tsx`
  (title, type enum select matching the real `ContentType` enum, optional
  ageBand/difficulty, and a raw JSON textarea for the `content` field —
  honest about it being free-form JSON since the backend's `ContentItem.content`
  column has no fixed per-type shape in the schema, so a fabricated
  structured editor would imply a validation contract that doesn't exist).
- **PROOF 3**: `tsc --noEmit` clean, `vite build` clean, `vitest` 7/7,
  `eslint` 0 warnings. Live-verification: pending owner deploy.

### 2.7 Mission UPDATE (edit) — real backend, zero UI caller

- **PROOF 1**: `PATCH /admin/missions/:id` (`admin-missions.controller.ts`)
  is real. `adminApi.updateMission` existed with zero callers.
  `MissionsSection` (inside `AdminCurriculumPage.tsx`) could create and
  delete missions but had no edit path — a typo required delete+recreate.
- **PROOF 2**: reused the existing create dialog for both modes (pre-filled
  when editing an existing mission, matching the "one dialog, two modes"
  pattern already used elsewhere in this admin area rather than building a
  near-duplicate second dialog). Added a real `admin.edit` i18n key (EN+AR)
  instead of deriving the label from an unrelated string comparison.
- **PROOF 3**: `tsc --noEmit` clean, `vite build` clean, `vitest` 7/7,
  `eslint` 0 warnings. Live-verification: pending owner deploy.

### 2.8 Companion presence gap: Mission Brief + World Detail

- **PROOF 1 (requirement)**: a 61-section "full product rebuild" directive
  (2026-10-06) requires characters to be integrated platform-wide (§19),
  explicitly listing "Mission start" among the required integration points.
  Separately, every other core learning surface already carries this real
  pattern via `charactersApi.orchestrate()` (confirmed by grep:
  `HomePage.tsx`, `PracticePage.tsx`, `MissionPlayerPage.tsx`,
  `ProjectDetailPage.tsx`, `CompanionsPage.tsx`, `CompanionChatPage.tsx`,
  `EnglishCoachPage.tsx` all already call it) — `MissionDetailPage.tsx`
  (the mission brief, shown before `MissionPlayerPage`) and
  `WorldDetailPage.tsx` (the per-world mission sequence) were the two real
  gaps in that otherwise-consistent chain.
- **PROOF 2**: added the same real pattern to both — `MissionDetailPage.tsx`
  calls `orchestrate({ missionId })` (matching `MissionPlayerPage`'s own
  scoping), `WorldDetailPage.tsx` calls `orchestrate({ domainSlug })`
  (matching `PracticePage`'s pattern of scoping to context). Both null-safe
  (fall back to the pre-existing icon/plain header when no companion
  resolves), no fabricated dialogue.
- **PROOF 3**: `tsc --noEmit` clean, `vite build` clean (bundle
  `index-C6eDDljY.js`), `check:home-bundle` OK, `vitest` 7/7, `eslint` 0
  warnings. Live-verification: pending owner deploy.

### 2.10 Product crawler/screenshot harness — built and run against production

Per the 2026-10-07 follow-up directive §6 ("build a real product crawler...
do not use mocked APIs... automate as much as the available environment
supports") and §1 ("verify companion presence using a real route, not a
placeholder").

- **Built**: `frontend/scripts/product-crawler.mjs` (new). Extends the
  existing `live-verify.mjs` pattern (same auth flow, same real-production-
  only policy) with what that script does not do: (a) a DOM-level assertion
  that a real `CharacterStage`/`CharacterFace` SVG actually rendered on a
  given route — not just "page has some content" — and (b) full-page
  screenshot capture at mobile (390×844) and desktop (1280×800) viewports,
  in both EN and AR, stored under `frontend/qa-screenshots/product-crawl/`
  (already gitignored, confirmed before writing anything there).
- **Real IDs resolved from the live API**, not invented: logged in as the
  existing proof learner account, called `GET /worlds` and
  `GET /worlds/:id` directly against production, got a real unlocked world
  (`Wordhaven`, id `510ccb09-da71-43e0-9831-2d046bd2d6fb`) and a real
  `AVAILABLE` mission (`english-mission-everyday-words`) to drive the crawl
  — this is the "real World ID/route" the directive required instead of
  the placeholder `/app/worlds/placeholder` used in an earlier message.
- **Run against production, twice**: first run found a real bug *in the
  crawler itself* (`page.locator('button').first()` matched AppShell's
  header search icon, not the mission brief's Start button — the script
  silently navigated to `/app/search` instead of starting the mission).
  Diagnosed with a standalone debug script against the live site (confirmed
  via `page.url()` after the click), fixed by scoping the locator to
  `main button` (excludes header/nav chrome), re-ran clean.
- **Final result, 17/17 PASS**, confirming on real production routes:
  companion presence on Home, Practice, World Detail (`/app/worlds/510ccb09-
  da71-43e0-9831-2d046bd2d6fb`), Mission Brief
  (`/app/missions/english-mission-everyday-words`), and the real Mission
  Player reached via an actual `POST /missions/:id/start` — each checked in
  both EN and AR, both viewports. This is the exact companion-presence
  verification requested, done on real reachable production routes.
- **Visual QA finding** (from reviewing the captured screenshots, not just
  the pass/fail signal): the companion render on World Detail and Mission
  Player is small relative to the page — present and functionally correct,
  but visually underweighted compared to how it reads on Home/Practice/
  Mission Brief. Logged as a real finding for a future visual-polish batch,
  not silently fixed in this one (scope: this batch is verification
  infrastructure + confirmation, not a new visual change).

### 2.11 Learn/Worlds curriculum-depth signal (first real step on P0-6)

Per the 2026-10-07 directive's explicit priority order, P0-6 (Learn/Worlds/
curriculum discovery) is next. Before designing a new IA, pulled the real
backend data directly (authenticated calls against production, not
assumptions) to know what depth actually exists:

- `GET /learning/domains/english/path`: **9 real skill strands**
  (Vocabulary, Grammar, Reading, Listening, Writing, Pronunciation,
  Speaking, Dictation, Shadowing), each CEFR-tagged (A1/A2), each 1:1 with
  a real mission.
- `GET /learning/domains/coding/path`: 3 skill groups with uneven depth
  (Programming Fundamentals: 4 competencies, Computational Thinking: 1,
  Problem Solving & Debugging: 2) — confirms Coding's content is real but
  thinner than English's, consistent with prior sessions' own audits.
- `GET /worlds`: each world already returns a real `missionCount` (Wordhaven
  11, Circuit City 8, Mindspring 9, Launch Bay 1) that the frontend type
  never declared — the exact "backend has the depth signal, frontend hides
  it" pattern this ledger has found repeatedly (cefrLevel §2.4, rubric
  §2.2).

**This batch (bounded, not the full IA rebuild)**: surfaced the depth that
already exists, as real data, on the two pages that most need it per the
directive's §12 ("the learner should be able to see what exists... what is
next... what they can practice"):
- `LearnPage.tsx`: typed `missionCount` onto the `World` interface and
  render it per world card ("11 missions" etc.) — previously every world
  card showed zero signal of how much curriculum was inside it.
- `DomainPathPage.tsx`: added a per-skill-group mastered-count summary
  (e.g. "0/1", "2/4") next to each skill's heading, computed from the
  mastery states already being fetched (no new API call) — previously a
  learner/parent had to count rows by eye to see progress depth.
- i18n: added `learner.worldMissionCount` (EN+AR), following this
  codebase's existing established pattern for count strings (plain
  interpolation, e.g. `reviewNudge`'s `'skill(s)'`) rather than introducing
  an unproven i18next `_plural` suffix convention nothing else in the
  project uses — checked via grep before adding it, found no precedent, so
  matched the existing pattern instead of a new one.

This is explicitly a FIRST STEP, not the full P0-6 rebuild — the directive's
bigger ask (a genuine Domain → Track → Skill-group → Skill → Mission
hierarchy browser, IXL-depth discoverability) is a larger design+build effort
tracked as the next P0-6 increment, not claimed done here.

### 2.12 Companion presence, systemic pass 2: Progress, Creativity, Stories

Per the 2026-10-07 directive's explicit instruction to "continue
systemically" (§10) rather than stop after the Mission Brief/World Detail
patch, and its explicit roadmap naming Progress (P0-8), Creativity (P1-12),
and Stories (P1-17) as areas to audit.

- **Progress** (`ProgressPage.tsx`): directive §10 names "Progress"
  explicitly in the required companion-integration list; the earlier
  no-CharacterStage grep confirmed it was the one P0 learning surface still
  missing it. Added unscoped `orchestrate()` (Progress is cross-domain by
  nature, matching Home's own unscoped call).
- **Creativity** (`CreativityPage.tsx`): named in both §10 and §27; Mira is
  the creativity-domain companion per the existing character roster, but
  the page had never called `orchestrate()` at all. Added it (unscoped —
  creativity prompts aren't domain-tagged on the backend, so no scope
  parameter would resolve to anything real).
- **Stories** (`StoriesPage.tsx`): directive §17 explicitly says "Stories
  should not exist as an isolated forgotten page" — it had zero companion
  presence. Scoped to `domainSlug: 'english'`, consistent with this
  project's own prior `STORY_DOMAIN_SLUG` decision (stories are framed as
  an English/Wordhaven reading-comprehension mechanic, confirmed in an
  earlier session's seed-fix work, not an arbitrary choice made here).

All three follow the identical, already-proven pattern (null-safe,
`charactersApi.orchestrate()`, `CharacterStage` next to `PageHeader`) used
on every other learner surface this session — no new component, no
fabricated dialogue.

### 2.13 Mission Player objective display (first real step on P0-7)

Per the directive's priority order, P0-7 (Mission Detail + Mission Player)
is next after P0-6. §12/§15 specifically ask Mission Player to "clearly
show mission purpose, what the learner will learn" per activity, not just
per mission.

- **PROOF 1**: pulled the real `MissionRun` shape directly from production
  (`GET /missions/runs/:runId` against a real run created by actually
  starting `english-mission-everyday-words`) — confirmed
  `run.mission.activities[i].objective.{name, description}` is real,
  present data (sourced from the real `LearningObjective` model, e.g.
  "Recognise & match everyday words"), not something that needs a new
  backend field.
- **PROOF 2**: `ActivitySummary`'s frontend type never declared `objective`
  — same silently-dropped-field pattern found repeatedly this session
  (cefrLevel §2.4, missionCount §2.11). Typed it, and render it as a short
  line above each activity in `MissionPlayerPage.tsx` — answers "what will
  I learn right now" at the exact moment it matters, not buried in a
  separate curriculum page.
- **PROOF 3**: `tsc --noEmit` clean, `vite build` clean (bundle
  `index-Bl_XaHYW.js`), `check:home-bundle` OK, `vitest` 7/7, `eslint` 0
  warnings. Live-verification: pending push + owner deploy.

This is a first, bounded increment on P0-7 — the directive's bigger ask
(evidence/mastery/reward display inline in the player, a real voice-
integration seam) is tracked as the next P0-7 step, not claimed done here.

### 2.14 Guardian audit (clean) + Moderator learner-context drill-in (P2-19/20)

Per the directive's roadmap, after P0/P1 learner work, audited Guardian
(P2-19) and Moderator (P2-20) for the same pattern found repeatedly in
learner surfaces.

- **Guardian — audited, found genuinely clean.** Read `ParentHomePage.tsx`,
  `ChildDetailPage.tsx` (all 6 tabs) in full, then did a direct 1:1
  comparison: every `@Get`/`@Post` route in `parents.controller.ts` (8
  routes) has exactly one frontend wrapper in `parentsApi`, and every
  wrapper has exactly one real caller. **No gap found.** This is a real
  negative result worth recording, not a skipped audit — a prior session's
  ledger-88 task 10 work here holds up under independent re-verification.
- **Moderator — found and closed one real gap.** `GET
  /admin/interventions/learner/:learnerId` (`admin-interventions.
  controller.ts`, correctly `@Roles(ADMIN, MODERATOR)`-gated) had zero
  frontend wrapper. This matters specifically because directive §44 defines
  the moderator flow as "Queue → Case → **Context** → Decision → Resolution"
  — without this, a moderator reviewing one intervention had no way to see
  whether that learner has a pattern (directly relevant to the escalate-vs-
  resolve judgment call). Added `moderationApi.interventionsForLearner()`
  and an inline expand-per-card drill-in on `InterventionsPage.tsx` (not a
  separate route/page — a full navigation for a context lookup would slow
  the queue down, contradicting the directive's own "optimize for speed"
  standard for this role).
- `EscalationsPage.tsx` also read in full and re-verified: already
  correctly contract-matched (a prior session's real 400-bug fix holds up).

### 2.15 Admin prompt-template authoring (P2-21)

Per directive §45: "Admin must operate the learning product. Not just
inspect lists." Audited all 6 `admin-*.controller.ts` files for the
list-only pattern already found twice this session (content-items,
missions). Found the clearest case: `admin-prompt-template.controller.ts`'s
own doc comment explicitly states admins previously had no way to fix a
bad AI prompt "without a raw psql/ts-node script" — `GET/PUT/PATCH
/admin/prompt-templates/:key` are real, ADMIN-gated, versioned (every edit
bumps version + requires a changelog note, never destructive), but
`AdminAiSafetyPage.tsx` only ever called the list endpoint.

- **PROOF 1**: read `admin-prompt-template.controller.ts` in full — real
  edit semantics confirmed (delegates to `PromptTemplateService.
  upsertTemplate`, which the controller's own comment says "bumps version,
  appends changelog, never deletes history").
- **PROOF 2**: added `getPromptTemplate`/`updatePromptTemplate`/
  `deactivatePromptTemplate` wrappers to `endpoints.ts`, and a new
  `PromptTemplatesSection` in `AdminAiSafetyPage.tsx` with a real edit
  dialog that requires both content and a changelog note before saving
  (matches the backend's actual required-field contract, not faked
  client-side), plus a deactivate action (re-enable intentionally not
  exposed as a separate action — the real backend behavior is that a new
  PUT with content re-activates it, so a "re-enable" button would need to
  either resend old content or be a lie; left honestly absent).
- **PROOF 3**: `tsc --noEmit` clean, `vite build` clean (bundle
  `index-CUhaVZee.js`), `check:home-bundle` OK, `vitest` 7/7, `eslint` 0
  warnings. Live-verification: pending push + owner deploy.

Did NOT act on `admin-safety-policy.controller.ts` (confirmed via its own
doc comment to be deliberately read-only — "this controller does not
create/edit policy versions... same history-viewer scope as admin-ai-eval")
or `admin-ai-eval.controller.ts` (same deliberate read-only scope) — adding
write UI for either would mean building against a backend contract that
explicitly doesn't support it, which is exactly the "don't fabricate
capabilities" rule this project has enforced all session.

### 2.9 Scope response to the 2026-10-06 "full product rebuild" directive

A 61-section directive arrived requesting a complete ground-up rebuild:
new information architecture, world-as-map navigation, voice integrated
platform-wide, AI embedded throughout every domain, a rebuilt design
system, rebuilt onboarding/missions/English/coding/projects/portfolio/
gamification, mobile-first + Arabic-first passes, browser-crawl-based
audit, and screenshot-based visual QA — all continuously deployed.

Recorded here, not silently absorbed, because several parts of it conflict
with standing, owner-approved decisions already on record in this project:

1. **World-as-map navigation (§11)** was already built once (`90/91/92`:
   `WorldJourneyMap`, `DomainPortal`) and the owner explicitly chose a
   *different* rebuild over it (`85_FRONTEND_SWITCH_RUNBOOK.md`, "Decision A
   cutover", commit `550f154`) — see §0 of this ledger. Rebuilding map
   navigation again would reverse that decision silently. Flagging instead
   of acting on it unilaterally.
2. **Platform-wide voice (§21-22)** requires a real speech provider.
   `VoicePage.tsx` is `BLOCKED_EXTERNAL` by standing decision (ledger 88/99)
   — no provider credentials exist in this environment. Cannot be
   implemented, only designed-for, until that changes.
3. **Browser-crawl audit (§2) and screenshot-based visual QA (§56-57)**
   require a browser-automation tool this agent does not have. Playwright
   scripts can be written and run via shell (as prior sessions already did
   — `forensic-screenshot.mjs`, `live-verify.mjs`), but that is not the same
   capability as interactive crawling.
4. **A full design-system/IA/navigation rebuild** is a multi-week effort.
   Claiming it complete in one continuous pass without the verification
   rigor this ledger has used throughout (triple-proof per item) would
   repeat the exact "fabricated completeness" failure mode this project's
   own history has flagged and corrected multiple times (see docs 88/99's
   own self-correction notes).

**Disposition**: continuing this ledger's established method — real,
bounded, evidence-based batches, each triple-verified and independently
live-confirmed — applied to this directive's achievable, non-conflicting
priorities. §19 (character integration) is the first batch (§2.8 above)
because `CharacterStage` already exists, the pattern is proven, and the
remaining gaps were small and real. Not treating this as license to redo
the whole product in one unverified sweep.

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

| `english.controller.ts` (`/english/path`, `/strands`) | RESOLVED this session — see §2.4 | Was flagged open in the previous pass; investigated and resolved below. |
| `voiceApi.turn` / `VoicePage` | BLOCKED_EXTERNAL (unchanged) | Confirmed still correctly gated-honest (`VoicePage.tsx` shows a real "provider-gated" state, not a fake voice UI). Matches the standing decision in ledger 88/99. No voice provider credentials exist in this environment to change this. |
| `media.controller.ts` (`GET /media`, `/media/:slug`) | RESOLVED this session — OBSOLETE, see §2.5 | Was flagged low-confidence/deferred in the previous pass; investigated and resolved below. |
| ~28 other "zero-caller" wrapper functions (admin content-provenance writes, prompt-template edit, analytics events-by-type/retention/stickiness, etc.) | PARTIAL, already tracked | Still accurate: real content-authoring/analytics-depth workflows, additive inside already-functional admin areas, not missing required routes. Two items previously in this bucket — content-item CREATE and mission UPDATE — were promoted and closed this session; see §2.6/§2.7. |

## 4. Verification evidence

**Round 1** (gaps 2.1-2.3, commit `b331509`, deployed + independently live-
verified — bundle hashes matched, real code markers for all 3 fixes found by
downloading and grepping the actual production JS):

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS — bundle `index-mZL8Yu0K.js` / `index-DSZWGX51.css` |
| `npm run check:home-bundle` | PASS |
| `npx vitest run` | PASS — 7/7 |
| `npm run lint` | PASS — 0 warnings |
| Live deploy | `b331509` confirmed live on kids.usamif.com, deploy-meta matches, bundle hash matches, 3 fix markers found in downloaded production bundle |

Files: `AdminCurriculumPage.tsx`, `ProjectDetailPage.tsx` (rubric), `endpoints.ts`
(community wrappers), `CommunityPage.tsx`, `community-page.test.tsx`.

**Round 2** (gap 2.4, CEFR/strandType fix — not yet committed/deployed as of
this edit):

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS — bundle `index-BAaQbK2W.js` (unchanged CSS hash) |
| `npm run check:home-bundle` | PASS |
| `npx vitest run` | PASS — 7/7 |
| `npm run lint` | PASS — 0 warnings |
| Live deploy | Pending — see §5 |

Files: `frontend/src/lib/api/learning-types.ts` (typed `cefrLevel`/
`strandType` onto `DomainPathCompetency`), `frontend/src/features/learner/
DomainPathPage.tsx` (render the CEFR pill).

**Round 3** (gaps 2.6-2.7, content-item create + mission edit — not yet
committed/deployed as of this edit):

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS — bundle `index-DRMr6l7r.js` (CSS hash unchanged) |
| `npm run check:home-bundle` | PASS |
| `npx vitest run` | PASS — 7/7 |
| `npm run lint` | PASS — 0 warnings |
| Live deploy | Pending — see §5 |

Files: `frontend/src/features/admin/AdminContentPage.tsx` (new-content-item
dialog), `frontend/src/features/admin/AdminCurriculumPage.tsx` (mission
edit), `frontend/src/lib/i18n/locales/{en,ar}.ts` (`admin.edit` key).

**Round 4** (gap 2.8, companion presence on Mission Brief + World Detail —
not yet committed/deployed as of this edit):

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS — bundle `index-C6eDDljY.js` |
| `npm run check:home-bundle` | PASS |
| `npx vitest run` | PASS — 7/7 |
| `npm run lint` | PASS — 0 warnings |
| Live deploy | Pending — see §5 |

Files: `frontend/src/features/learner/MissionDetailPage.tsx`,
`frontend/src/features/learner/WorldDetailPage.tsx`.

## 5. Deployment status (honest — per directive §38, code-only ≠ done)

Round 1 (gaps 2.1-2.3): **DEPLOYED + LIVE-VERIFIED** (commit `b331509`,
2026-10-06, independently confirmed from this machine by downloading the
production bundle and finding real code markers for all 3 fixes).

Round 2 (gap 2.4): **DEPLOYED + LIVE-VERIFIED** (commit `94c50fb`,
2026-10-06, independently confirmed from this machine — downloaded the
production bundle and found the real `cefrLevel` property access).

Round 3 (gaps 2.6-2.7): **DEPLOYED + LIVE-VERIFIED** (commit `1d5565a`,
2026-10-06).

Round 4 (gap 2.8): **DEPLOYED + LIVE-VERIFIED** (commit `9997b63`,
2026-10-07, independently confirmed — bundle hash matched, and the real
`mission-brief-companion`/`world-companion` query-key strings were found in
the downloaded production bundle).

Round 5 (product crawler, §2.10 below): tool-only, no production frontend
change — see §5 for what was run and found.

Round 6 (§2.11, Learn/curriculum-depth signal): **PUSHED** (commit
`b5e61fc`) — deploy block given to owner, not yet confirmed deployed as of
this edit.

Round 7 (§2.12, companion presence on Progress/Creativity/Stories):
**PUSHED** (commit `a271e82`) — deploy block given to owner, not yet
confirmed deployed as of this edit.

Round 8 (§2.13, Mission Player objective display): **PUSHED** (commit
`06762d1`) — deploy block given to owner, not yet confirmed deployed.

Round 9 (§2.14, Guardian audit + Moderator learner-context drill-in):
**DEPLOYED + LIVE-VERIFIED** (commit `f650934`, 2026-10-07 — owner ran the
deploy chain through all 4 pending batches sequentially; independently
re-confirmed by downloading the final bundle, finding every real code
marker from rounds 6-9, AND re-running the full product-crawler against
the newly deployed site: 17/17 PASS, no regressions).

Round 10 (§2.15 below, Admin prompt-template authoring): **committed
locally, not yet pushed/deployed** as of this edit.

## 7. Master vertical tracker (2026-10-06 directive §18)

Per-vertical status using the directive's required vocabulary (NOT_STARTED /
AUDITING / RESEARCHED / DESIGNING / BUILDING / LOCAL_VERIFIED / DEPLOYED /
LIVE_VERIFIED / FINAL / BLOCKED_EXTERNAL). `FINAL` is never used from code
existence alone — it requires the full chain (code→API→data→flow→browser→
visual→deployed) actually having been walked, which this ledger has not yet
done for any full vertical (only targeted gaps within verticals so far).

| # | Vertical | Status | Evidence this session |
| --- | --- | --- | --- |
| P0-1 | Full capability/route audit | AUDITING (substantial, ongoing) | §2.1-2.8 this doc, plus the sub-agent cross-reference in rounds 1-2 and docs 83/84/88/99 from prior sessions. Not claimed FINAL — admin-authoring depth and a few analytics drill-ins remain genuinely unaudited in full detail. |
| P0-2 | Learner IA/navigation | DESIGNING | `/app/more` hub (prior session) + this session's companion-presence pass are real but partial IA work. §2.9 explicitly defers the world-map re-evaluation the new directive authorizes — not yet started. |
| P0-3 | Design-system gaps | NOT_STARTED (this session) | No dedicated design-system audit run yet this session; existing DS primitives (`components/ui/*`) reused as-is in every batch so far. |
| P0-4 | Onboarding | AUDITING | Read in full this session (§ companion-presence audit); already has real companion presence (step 0) from a prior session. Not yet re-evaluated against the new directive's richer flow (diagnostic interaction, goals) — no backend support currently exists for a diagnostic quiz, confirmed in a prior session's audit, so that specific sub-item is correctly not fabricated. |
| P0-5 | Learner Home | LIVE_VERIFIED (companion presence only) | Already had companion presence before this session; not the subject of new work this round. |
| P0-6 | Learn/Worlds/curriculum discovery | BUILDING | `LearnPage.tsx`/`WorldDetailPage.tsx`/`DomainPathPage.tsx` all read in full. World Detail gained companion presence (LIVE_VERIFIED). Real curriculum depth pulled from the live API (English 9 strands, Coding 3 groups) and partially surfaced (mission counts on Learn, per-skill mastery counts on DomainPath — §2.11). The directive's bigger ask — a full Domain→Track→Skill-group→Skill→Mission hierarchy browser — NOT yet built; this is a real first increment, not the finished vertical. |
| P0-7 | Mission Detail + Mission Player | BUILDING | Mission Detail gained companion presence (LIVE_VERIFIED). Mission Player already had companion presence; gained real per-activity objective display this round (§2.13), not yet deployed. Bigger ask (evidence/mastery/reward inline, voice-seam) NOT yet built. |
| P0-8 | Practice/mastery/progress | BUILDING | Practice already had companion presence; `ProgressPage.tsx` gained it this round (§2.12) — not yet deployed. |
| P1-9..17 | English/Coding/AI/Creativity/Projects/Portfolio/Characters/Rewards/Stories | PARTIAL | Individual gaps closed this session (project rubric §2.2, CEFR §2.4, Creativity+Stories companion presence §2.12) are real but partial. No full-vertical rebuild attempted yet. |
| P2-19 | Guardian | AUDITING (clean) | Full 1:1 route↔wrapper↔caller audit done — zero gaps found (§2.14). Not `FINAL`: visual/RTL/mobile pass not done this session. |
| P2-20 | Moderator | BUILDING | Learner-context drill-in on Interventions added (§2.14), not yet deployed. Escalations re-verified clean. |
| P2-21 | Admin/CMS | BUILDING | Gained content-item create (§2.6), mission edit (§2.7), prompt-template authoring (§2.15) — 3 real capabilities this session. Not yet deployed for round 10. Safety-policy/AI-eval confirmed deliberately read-only by backend design, correctly not built as write UIs. |
| P2-18,22-25 | Voice/Search-Notif-Settings/Legal/Responsive-RTL-a11y-perf/Full-E2E | NOT_STARTED | Voice confirmed `BLOCKED_EXTERNAL` for provider-dependent runtime; provider-independent architecture work (§9) NOT yet started. Others untouched this session. |

This table will be updated every batch going forward, not just appended to.

## 6. Honest residual (per directive §40 — "I don't know" is not an acceptable final answer, but IS acceptable as a tracked open item)

- §2.4 and §2.5 (English strand/path overlap, Media Engine) were open
  questions at the end of the previous session's pass — both investigated
  and resolved this session (one real small gap fixed, one correctly
  classified OBSOLETE with evidence).
- Full visual/RTL/responsive/a11y QA (ledger 88 step 9) still requires a real
  browser against the live site — not newly re-opened by this session, just
  not newly closed either; unchanged from doc 99's residual list.
- This ledger is **not** a claim of "zero valid feature loss" across the
  entire 45-section directive's scope — it is a claim of: every item listed
  above was independently checked against real code/backend evidence, and
  every fix made was triple-verified per directive §18's definition. Items in
  §3 marked INTERNAL_ONLY/PARTIAL/BLOCKED_EXTERNAL are explicit dispositions,
  not silent omissions.
