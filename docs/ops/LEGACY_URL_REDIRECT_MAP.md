# Legacy URL redirect map — `frontend/` (legacy) → `frontend-rebuild/` (new)

> Built for the production cutover (promoting `frontend-rebuild/` to serve
> `https://kids.usamif.com/` in place of the current `frontend/`). Every route
> below is read directly from the real routers — `frontend/src/app/router/index.tsx`
> (legacy, currently live) and `frontend-rebuild/src/app/router.tsx` (new,
> cutover candidate) — not guessed. Existing bookmarks/deep links into the
> legacy app must not break silently: each row is either a real **redirect**
> to its equivalent new route, or an **honest 404** when no equivalent exists
> yet (never a silent bounce to home, which would hide a real capability gap).
>
> Implementation note: these are **client-side SPA redirects**, added inside
> `AppRouter` in `frontend-rebuild/src/app/router.tsx` as `<Navigate>` routes,
> not nginx-level rewrites — the new app can tell `/dashboard` apart from
> `/app` without needing a server rule per path, and it keeps the redirect
> logic version-controlled alongside the router it redirects into. Add them
> as a dedicated `<Route path="/legacy-path" element={<Navigate to="/new-path" replace />} />`
> block, kept separate from the real routes so this list stays auditable.

## Legend
- **REDIRECT** → real equivalent route exists in `frontend-rebuild/`; add a
  `<Navigate>` entry.
- **404 (INTENTIONAL)** → no equivalent surface exists in `frontend-rebuild/`
  yet (tracked in `plans-local/88_NEW_FRONTEND_PAGE_REBUILD_LEDGER.md` as a
  known gap if it's lower-priority, deferred work — not fabricated as "moved").
  Falls through to the new app's honest `NotFound` (`app/router.tsx`), which
  is role-aware and offers a real way back in, not a dead end.
- **N/A — auth mechanics changed** → the path itself is obsolete because the
  new app's root/auth routing already does what the legacy path existed for.

## PUBLIC / auth

| Legacy path | New path | Type | Notes |
| --- | --- | --- | --- |
| `/login` | `/login` | same | unchanged |
| `/register` | `/signup` | REDIRECT | renamed |
| `/` (signed out) | `/` | same | both show a public landing when signed out |
| `/` (signed in) → legacy redirects to `/dashboard` | `/` → new redirects to the role home (`/app`, `/parent`, `/mod`, `/admin`) | N/A — auth mechanics changed | new app branches by role, not just "signed in" |
| `*` (unknown path, legacy bounces to `/dashboard`) | `*` (unknown path, new shows honest role-aware 404) | N/A — auth mechanics changed | intentional product change: unknown paths no longer silently bounce |

## Onboarding

Legacy ran a 6-step wizard (`language → welcome → age → interests → character → complete`);
new is a 2-step flow (`age → interests`) at a single route.

| Legacy path | New path | Type | Notes |
| --- | --- | --- | --- |
| `/onboarding/language` | `/onboarding` | REDIRECT | language select folded into Settings post-onboarding |
| `/onboarding/welcome` | `/onboarding` | REDIRECT | |
| `/onboarding/age` | `/onboarding` | REDIRECT | step 1 of the new 2-step flow |
| `/onboarding/interests` | `/onboarding` | REDIRECT | step 2 of the new 2-step flow |
| `/onboarding/character` | `/onboarding` | REDIRECT | character-intro step not carried forward (companions are introduced contextually in `/app/companions` instead) |
| `/onboarding/complete` | `/onboarding` | REDIRECT | |

## Learner — core loop

| Legacy path | New path | Type | Notes |
| --- | --- | --- | --- |
| `/dashboard` | `/app` | REDIRECT | |
| `/practice` | `/app/practice` | REDIRECT | |
| `/evidence` | `/app/progress` | REDIRECT | Evidence engine's recent-evidence view now lives inside Progress (and the Guardian Overview tab) |
| `/missions` | `/app/learn` | REDIRECT | mission browsing now flows through domain paths, not a flat catalog |
| `/missions/:id` | `/app/missions/:id` | REDIRECT | same param name, path prefix changed |
| `/missions/play/:runId` | `/app/runs/:runId` | REDIRECT | |
| `/missions/complete` | `/app/progress` | REDIRECT | the standalone "mission complete" page was folded into the mission player's own completion step + ReflectionStep |
| `/worlds` | `/app/learn` | REDIRECT | |
| `/worlds/:id` | `/app/learn/:slug` | 404 (INTENTIONAL) | legacy world detail was keyed by numeric/CUID `:id`; new domain path is keyed by `:slug` — no reliable id→slug mapping exists client-side, so this cannot be a parameterized redirect. Falls back to the new learner home with a working nav, not a broken deep link. |
| `/simulations` | `/app/simulations` | REDIRECT | |
| `/simulations/:slug` | `/app/simulations/:slug` | REDIRECT | same param, unchanged |
| `/learn` | `/app/learn` | REDIRECT | |
| `/learn/concepts/:id` | `/app/explore` | 404 (INTENTIONAL) | concept browsing is now the unified Explore page; no stable id→tab mapping exists, falls back honestly rather than guessing a tab |
| `/learn/paths` | `/app/learn` | REDIRECT | |
| `/learn/paths/:id` | `/app/learn/:slug` | 404 (INTENTIONAL) | same id→slug gap as `/worlds/:id` |
| `/learn/flashcards` | `/app/practice` | REDIRECT | Flashcards is now a tab on Practice, not its own route |
| `/learn/visual-language` | `/app/explore` | REDIRECT | Visual Language is now one tab inside Explore |
| `/learning/domains/:slug/path` | `/app/learn/:slug` | REDIRECT | same param, path shortened |
| `/projects` | `/app/projects` | REDIRECT | |
| `/projects/:id` | `/app/projects/:id` | REDIRECT | |
| `/portfolio` | `/app/portfolio` | REDIRECT | |
| `/community` | `/app/community` | REDIRECT | |
| `/achievements` | `/app/rewards` | REDIRECT | Achievements folded into the unified Rewards page |
| `/leaderboard` | — | 404 (INTENTIONAL) | **real backend capability with no `frontend-rebuild` surface yet** (`GET /gamification/leaderboard` exists and is unused — a genuine gap, not an architecture change like the id→slug ones above. Tracked as new follow-up work, not yet in ledger 88 since it wasn't in the original reconciliation's missing-surfaces list — add it there.) |
| `/progress` | `/app/progress` | REDIRECT | |
| `/balanced` | `/app/progress` | REDIRECT | Balanced-development view consumed the same `mastery.getByDomain` now shown directly on Progress |
| `/plans` | `/pricing` | REDIRECT | |

## Learner — domain tools, companions, extras

| Legacy path | New path | Type | Notes |
| --- | --- | --- | --- |
| `/english` | `/app/learn/english` | REDIRECT | |
| `/english/coach` | `/app/english-coach` | REDIRECT | |
| `/coding` | `/app/learn/coding` | REDIRECT | Coding Coach is now reached from inside the mission player ("Ask Codey"), not a standalone landing page |
| `/characters` | `/app/companions` | REDIRECT | |
| `/characters/:id/chat` | `/app/companions/:id` | REDIRECT | same param, path prefix changed |
| `/stories` | `/app/stories` | REDIRECT | |
| `/stories/:id` | `/app/stories/:id` | REDIRECT | |
| `/creativity` | `/app/create` | REDIRECT | |
| `/shop` | `/app/rewards` | REDIRECT | Cosmetic Shop folded into Rewards |
| `/insights` | — | 404 (INTENTIONAL) | **real backend capability with no `frontend-rebuild` surface yet** (`learningEventsApi` / learning-events analytics has no consumer in the new app — a genuine gap, same caveat as `/leaderboard`, add to ledger 88) |
| `/cross-curricular/:category` | `/app/explore` | REDIRECT | all cross-curricular catalogs are now tabs on Explore; category param dropped (lands on Explore's default tab, not a broken page) |
| `/cross-curricular/:category/:slug` | `/app/explore` | REDIRECT | concept detail is inline on the Explore tab, not a separate route |
| `/thinking/:engine` | `/app/explore` | REDIRECT | same consolidation as cross-curricular |
| `/thinking/:engine/:slug` | `/app/explore` | REDIRECT | |

## Guardian

| Legacy path | New path | Type | Notes |
| --- | --- | --- | --- |
| `/parents` | `/parent` | REDIRECT | |
| `/parents/children/:learnerId/time-limits` | `/parent/child/:id` | REDIRECT | Time limits is now the "Controls" tab on Child Detail, not its own route — param renamed `learnerId`→`id` to match the new route |
| `/parents/children/:learnerId/privacy` | `/parent/privacy` | REDIRECT | legacy was per-child; the new privacy page lists ALL of the guardian's linked children on one page, so the `:learnerId` param can be dropped — the destination still shows the same child's consent/export/delete controls, just alongside their siblings |

## Admin

| Legacy path | New path | Type | Notes |
| --- | --- | --- | --- |
| `/admin/missions` | `/admin/curriculum` | REDIRECT | mission CRUD now lives inside Curriculum & QA |
| `/admin/feature-flags` | `/admin/platform` | REDIRECT | |
| `/admin/question-templates` | — | 404 (INTENTIONAL) | **real backend capability (`questionsApi`) with no `frontend-rebuild` surface yet** — genuine gap, add to ledger 88 |
| `/admin/analytics` | `/admin/analytics` | same | unchanged |
| `/admin/audit-log` | `/admin/platform` | REDIRECT | Audit log is a section on Platform, not its own route |
| `/admin/safety-escalations` | `/mod/escalations` | REDIRECT | moved under the Moderator shell (ADMIN has access there too via the `allow={['MODERATOR','ADMIN']}` guard) |
| `/admin/interventions` | `/mod/interventions` | REDIRECT | same shell move as escalations |
| `/admin/misconceptions` | `/admin/curriculum` | REDIRECT | Misconceptions is a section on Curriculum & QA |
| `/admin/ai-eval` | `/admin/ai` | REDIRECT | |
| `/admin/assessment-quality` | `/admin/curriculum` | REDIRECT | now a section on Curriculum & QA |
| `/admin/content-qa` | `/admin/curriculum` | REDIRECT | now a section on Curriculum & QA |
| `/admin/memory-governance` | `/admin/platform` | REDIRECT | Memory Governance is a section on Platform |
| `/admin/experiments` | `/admin/platform` | REDIRECT | Experiments is a section on Platform |
| `/admin/safety-policies` | `/admin/ai` | REDIRECT | |
| `/admin/prompt-templates` | `/admin/ai` | REDIRECT | |
| `/admin/content-items` | `/admin/content` | REDIRECT | |

## Routes with NO legacy equivalent (new in `frontend-rebuild`, informational only)

Not part of the redirect map (nothing legacy points at these), listed so the
map is understood as complete rather than partial: `/how-it-works`,
`/for-families`, `/safety`, `/legal`, `/verify/:uid`, `/app/explore`,
`/app/english-coach`, `/app/search`, `/app/notifications`.

## Summary — genuine gaps surfaced by this exercise

Building this map surfaced **3 real backend capabilities with zero
`frontend-rebuild` consumer** that were NOT in the original ledger-88
reconciliation (that pass covered controller-by-controller reachability, not
legacy-route coverage, so these slipped through):

1. **Leaderboard** (`GET /gamification/leaderboard`) — legacy `/leaderboard`.
2. **Learning-events insights** (`learningEventsApi`) — legacy `/insights`.
3. **Question templates authoring** (`questionsApi`) — legacy `/admin/question-templates`.

These are logged here and must be added to
`plans-local/88_NEW_FRONTEND_PAGE_REBUILD_LEDGER.md` as `NOT_STARTED` rows —
genuinely new findings, not previously tracked, and the owner's "no NOT_STARTED
P0/P1 rows" gate must be re-evaluated once they're added (they are lower-
priority, non-blocking surfaces — a leaderboard, a learner-facing analytics
view, and an admin authoring tool for question templates — none of them a
core learner/guardian/moderator loop).

## Implementation checklist (for the actual `<Navigate>` routes)

1. Add every REDIRECT row above as a `<Route path="<legacy>" element={<Navigate to="<new>" replace />} />`
   inside `AppRouter` (`frontend-rebuild/src/app/router.tsx`), grouped under a
   `{/* Legacy URL redirects (see docs/ops/LEGACY_URL_REDIRECT_MAP.md) */}` comment block.
2. Routes with a path param (`:id`, `:slug`, `:runId`, etc.) must preserve the
   param in the `to=` target, e.g. `<Route path="/missions/:id" element={<Navigate to={buildLegacyRedirect(...)} replace />} />` —
   a plain string `to=` can't interpolate a param, so these need a small
   render-prop component (`<ParamRedirect from="id" to="/app/missions/:id" />`)
   rather than a bare `<Navigate>`.
3. 404 (INTENTIONAL) rows need NO new route — they already fall through to the
   existing `<Route path="*" element={<NotFound />} />` catch-all. Do not add
   anything for them; adding a redirect to a wrong/unrelated page would be
   worse than the honest 404.
4. Test with real browser refresh / direct navigation (not just in-app
   `<Link>` clicks) against the staged `/preview/` deploy once reachable —
   a client-side-only redirect still requires the server to serve
   `index.html` for the legacy path first (already true: nginx's SPA
   `try_files $uri $uri/ /index.html` fallback, per `docs/ops/NGINX_CACHE.md`,
   serves the new app's `index.html` for ANY unknown path, which is what lets
   the client-side router see the legacy path and redirect it).
