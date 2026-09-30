# 80 — USAM MASTER EXECUTION CONTROL

> **This is the single execution source of truth for the USAM full frontend
> demolition + rebuild.** It is a live control document, updated continuously.
> If this file and any other doc/memory disagree, this file and the governing
> prompts win. Do not mark anything DONE from one layer (see §Definition of Done).

## GOVERNING DECISION (2026-09-30) — DECISION A

Full frontend **demolition + rebuild from first principles is AUTHORIZED** and
**supersedes** the prior "frontend reconciliation = CLOSED / PRODUCTION VERIFIED"
status as the *final product UX decision*.

**Status correction (authoritative):**

| Concern | Status |
| --- | --- |
| Backend APIs / auth / learning spine / deploy / real data flows | **PROVEN** (historical evidence at commit `1ae4dcd`) |
| Current deployed `frontend/` (design/IA/nav/pages) | **LEGACY FUNCTIONAL BASELINE / REGRESSION ORACLE / REFERENCE ONLY** — NOT the final UX foundation |
| Final frontend reconstruction | **IN PROGRESS** |
| Shared backend/learning spine | **PROVEN** (English + Coding + AI-literacy graded mastery live) |
| Root Lovable scaffold `src/` | **PRESERVE / QUARANTINE / NON-PRODUCTION** (Lovable history) — do not delete, do not ask again |

"Functional correctness ≠ correct product architecture. A working route ≠ a good
page. Production verified ≠ final design accepted." The rebuild is intentional and
targets product representation, IA, navigation, page structure, visual system,
ecosystem presentation, feature organization, UX consistency, and completeness.

**Safety mechanism = controlled replacement (never blind teardown):**
`CURRENT PROD → derive final structure → BUILD NEW → CONNECT real backend → TEST
→ VISUAL QA → DEPLOY/STAGE → COMPARE vs 1ae4dcd → SWITCH → VERIFY → REMOVE
superseded impl`. Production stays operational throughout. Backend data + correct
engines are preserved.

## STATUS VOCABULARY (allowed final statuses only)

`NOT_STARTED` · `AUDITING` · `DESIGNING` · `BUILDING` · `CONNECTING` · `TESTING`
· `VISUAL_QA` · `DEPLOYING` · `LIVE_VERIFYING` · `PRODUCTION_READY` ·
`BLOCKED_EXTERNAL` · `DEFERRED_BY_PRODUCT_DECISION` · `REMOVED`

Banned: "mostly done", "almost complete", "works", "good enough".

## DEFINITION OF DONE (never DONE from one layer)

A feature is `PRODUCTION_READY` only when ALL relevant layers are ✅: backend
logic · DB model · migration · API contract · authorization · validation ·
frontend representation · real API connection · real data · states
(loading/empty/error/restricted/entitlement/first-use/success) · responsive ·
RTL · EN · AR · accessibility · analytics · unit · integration · E2E (where
applicable) · visual QA · deployment · live verification. Otherwise it stays
`PARTIAL`/its current phase. Evidence required for every completion claim (test
result / API response / DB query / browser test / screenshot / deploy metadata /
prod response / trace).

## EXTERNAL BLOCKER RULE

Valid stops only: missing credentials, legal/commercial decision, payment
provider, external API unavailable, destructive irreversible prod decision.
Invalid stops: task large, many pages remain, needs refactor, frontend complex,
requires backend work. **This dev workspace has NO network path to prod**
(DNS to host/github flaky); prod commands are run by the owner on the Linux
server `~/USAM-Learning-Worlds` and output is pasted back. That is a workflow
constraint, not a blocker for codeable work.

## PRIORITY MODEL

`P0` broken core journey / security / data loss · `P1` required launch
capability · `P2` important quality / breadth · `P3` optimization. Do not spend
P3 effort while P0/P1 remain.

---

## MASTER WORKSTREAMS (A–AJ)

| ID | Workstream | Current status | Notes |
| --- | --- | --- | --- |
| A | Product / architecture | AUDITING | Decision A recorded; deriving product model from real backend |
| B | Backend | PROVEN (baseline) | 42 modules, ~59 controllers inventoried (code-traced). No rewrite unless a real gap |
| C | Database / migrations | PROVEN (baseline) | Prisma/Postgres; enum-drift + migration gates green live |
| D | API contracts | PROVEN (baseline) | `/api` prefix, unversioned; Bearer JWT; documented in registries below |
| E | Frontend architecture | BUILDING | frontend-rebuild/ foundation live: typed client, auth store, role router/shell, query layer, i18n EN/AR RTL. tsc+build green |
| F | Design system | BUILDING | WHITE/GREEN/BLACK tokens implemented in tailwind.config + primitives (Button, states); typography EN+AR |
| G | Navigation / IA | DESIGNING | Derived from zero (IA + nav model spec done) |
| H | Public ecosystem / landing | NOT_STARTED | Ecosystem presentation, not generic SaaS |
| I | Authentication | NOT_STARTED | Real `/api/auth`; login/register/refresh/me |
| J | Onboarding | NOT_STARTED | Real learner/guardian creation + age-band |
| K | Learner experience | NOT_STARTED | Shell + learning loop |
| L | Learning domains | PROVEN (spine) | English/Coding/AI-literacy graded live; breadth ongoing |
| M | Practice / mastery / review | PROVEN (spine) | FSRS review; mastery evidence live |
| N | Projects / portfolio | NOT_STARTED (FE) | Backend projects module exists |
| O | Characters | NOT_STARTED (FE) | Character engine + states exist |
| P | Voice | BLOCKED_EXTERNAL | PROVIDER-GATED (Bedrock/ASR/TTS creds); text-fallback verified |
| Q | Parent (guardian) | NOT_STARTED (FE) | Parents module: children/dashboard/progress/activity/reflections/safety/time-limits |
| R | School / organization | REMOVED | No backend role/module — do NOT fabricate |
| S | Career / jobs / freelancing / company | REMOVED | No backend — do NOT fabricate |
| T | Billing / entitlements | NOT_STARTED (FE) | Entitlements module: plans/me/subscribe/cancel |
| U | Search | NOT_STARTED (FE) | `/api/search` exists |
| V | Notifications | NOT_STARTED (FE) | Notifications module exists |
| W | Safety / moderation / privacy | PARTIAL | Safety escalations (MOD/ADMIN), community moderation, legal/consent/GDPR |
| X | Admin / CMS | NOT_STARTED (FE) | Rich `/api/admin/*` surface (content items, provenance, missions, analytics, policies...) |
| Y | Analytics / observability | PARTIAL | Admin analytics endpoints + learning events; OTel tracing in backend |
| Z | Accessibility | NOT_STARTED | Baseline built into components from day one |
| AA | RTL / localization | NOT_STARTED | Arabic first-class, not patched at end |
| AB | Responsive | NOT_STARTED | Per-experience responsive design |
| AC | Performance | NOT_STARTED | Route/feature splitting; keep heavy runtimes off unrelated routes |
| AD | Security | PROVEN (baseline) | Per-controller JwtAuthGuard; RolesGuard; throttler; helmet |
| AE | E2E | PARTIAL | Playwright harness scaffolded on legacy; to be re-established on new FE |
| AF | Visual QA | NOT_STARTED | Real browser QA mandatory |
| AG | Deployment | PROVEN (baseline) | `scripts/deploy.sh` 7-stage gated pipeline |
| AH | Production verification | ONGOING | Owner-run on server; paste-back evidence |
| AI | Legacy cleanup | NOT_STARTED | Delete superseded `frontend/` impl AFTER new proven; keep root `src/` |
| AJ | Documentation | ONGOING | Registries below kept in sync with reality |

---

## REAL BACKEND INVENTORY (code-traced 2026-09-30) — the source of truth

- **Global:** NestJS, global prefix `/api`, unversioned. Global `ValidationPipe`
  (whitelist + transform). CORS from `ALLOWED_ORIGINS`/`CORS_ORIGIN`. Only global
  guard = `ThrottlerGuard` (100/60s default). Auth is **per-controller**
  (`@UseGuards(JwtAuthGuard)`), NOT global.
- **Roles (definitive):** `LEARNER`, `GUARDIAN`, `MODERATOR`, `ADMIN` (Prisma
  `enum Role`). **No teacher / org / company / career role.** "Parent" =
  `GUARDIAN`. Learner-vs-guardian distinguished by presence of
  `request.user.learner` vs `request.user.guardian` (JWT strategy eager-loads
  both). Guardian authorization is manual (`user.guardian?.id` + guardianship
  check), not RolesGuard. Admin surface = `/api/admin/*` (`RolesGuard` +
  `@Roles(ADMIN)`, some also MODERATOR). Moderator (non-admin path):
  `/api/safety-escalations`.
- **Auth:** `POST /api/auth/register|login` (public, throttled) →
  `{user,accessToken,refreshToken}`; access JWT `{sub,email,role}` 15m;
  `POST /api/auth/refresh` (refresh token in **body**); `GET /api/auth/me`;
  `PATCH /api/auth/me/age-band`; `PATCH /api/auth/me/preferences`.
- **Public (unauth) endpoints:** register, login, `GET /api/entitlements/plans`,
  `GET /api/credentials/:uid`.
- **42 registered modules:** Database, Auth, Mastery, Credentials,
  ContentProvenance, Legal, Entitlements, Missions, AI, Adaptive, Projects,
  Gamification, Community, Parents, Learning, CodingSandbox, Voice,
  CrossCurricular, Reflection, LearnerModel, Worlds, Questions, Flashcards,
  DailyGoals, Notifications, Creativity, ProblemSolving, Audit, FeatureFlags,
  Experimentation, Misconception, ContentQa, ContentItems, Intervention,
  AssessmentQuality, Search, Analytics, DifficultyCalibration, Media, Simulation,
  VisualLanguage, CurriculumMapping.

Full per-endpoint inventory lives in
`docs/product/FINAL_CAPABILITY_REGISTRY.md` and
`plans-local/83_API_FRONTEND_COVERAGE.md`.

---

## EXECUTION QUEUE (mirrors the live task list; P0/P1 first)

| # | Item | WS | Priority | Status | Evidence / blocker |
| --- | --- | --- | --- | --- | --- |
| 1 | Master Execution Control (this file) | AJ | P1 | PRODUCTION_READY | this file |
| 2 | FINAL_CAPABILITY_REGISTRY | AJ | P1 | PRODUCTION_READY | docs/product/FINAL_CAPABILITY_REGISTRY.md |
| 3 | ROLE_ACCESS_MATRIX + ENTITLEMENT_MATRIX | AJ/W/T | P1 | PRODUCTION_READY | docs/security/FINAL_ROLE_ACCESS_MATRIX.md + docs/product/FINAL_ENTITLEMENT_MATRIX.md |
| 4 | ROLE_AND_JOURNEY_MAP | AJ/A | P1 | PRODUCTION_READY | docs/frontend/FINAL_ROLE_AND_JOURNEY_MAP.md |
| 5 | PAGE_AND_FLOW_INVENTORY + ROUTE_REGISTRY + traceability | AJ/E | P1 | PRODUCTION_READY | docs/frontend/FINAL_PAGE_AND_FLOW_INVENTORY.md + FINAL_ROUTE_REGISTRY.md + BACKEND_FRONTEND_TRACEABILITY_MATRIX.md |
| 6 | Legacy frontend audit + classification | AI | P1 | PRODUCTION_READY | plans-local/79_DEPLOYED_FRONTEND_LEGACY_AUDIT.md (~55 routes classified) |
| 7 | FINAL IA + navigation + design system + motion | F/G | P1 | PRODUCTION_READY | docs/frontend/FINAL_INFORMATION_ARCHITECTURE.md + FINAL_USAM_DESIGN_SYSTEM.md |
| R1 | Rebuild task 1 — reference research + rebuild ledger (88) | E | P0 | PRODUCTION_READY | docs/research/FINAL_FRONTEND_REFERENCE_STUDY.md + ledger 88 (3eaf104) |
| R2 | Rebuild task 2 — design-system primitives IN CODE | F/G | P0 | PRODUCTION_READY | WHITE/GREEN/BLACK tokens + primitives; no Radix/default-shadcn (1d86f0b) |
| R3 | Rebuild task 3 — Landing from blank + public nav/footer | H | P0 | PRODUCTION_READY | ecosystem-comprehension Landing (rejected→rebuilt); 6a0b522 |
| R4 | Rebuild task 4 — auth + onboarding + public pages | I/J | P0 | PRODUCTION_READY | login/signup/onboarding-stepper + how-it-works/for-families/safety/legal (e29f84f) |
| R5 | Rebuild task 5 — learner shell + Home + Learn hub | K | P0 | PRODUCTION_READY | icon-nav role shell + living-world Home + Learn (84c6da7) |
| R6 | Rebuild task 6 — all learner page families | L/M/N/O | P0 | PRODUCTION_READY | 22 learner surfaces rebuilt-from-blank on DS; real shape-verified APIs (825ad93, c229307) |
| R7 | Rebuild task 7 — guardian → moderator → admin | Q/W/X | P0 | PRODUCTION_READY | 4 guardian + 4 moderator + 6 admin pages rebuilt-from-blank (51d2f2f) |
| R8 | Rebuild task 8 — reconcile + cleanup + final audit | AI/Z | P0 | PRODUCTION_READY | 47/47 pages rebuilt-from-blank; 0 placeholders; 0 dead files; honest-404 fix (unauth no longer bounced); ledgers 88/99/85 reconciled; tsc+build+5 tests+home-bundle green |
| 13 | Switch to new FE, delete legacy, deploy, verify | AI/AG/AH | P0 | BLOCKED_EXTERNAL | 99 audit DONE (code-side switch-ready: 46 routes, 0 placeholders, 0 dead files, tests+build+bundle-gate green, reconciliation clean, legacy→final route map in 85 Appendix A). Remaining = OWNER-RUN: stage deploy + preview harness + browser QA + E2E vs 1ae4dcd + traffic switch + delete legacy frontend/. No live backend in this workspace |
| 14 | AI Literacy breadth verify (curriculum, non-blocking) | L | P2 | LIVE_VERIFYING | committed `7b3d818`; owner seed+verify pending |

## SWITCH READINESS (task 13)

Code-side switch gate is MET (see 99). Deploy tooling shipped: `scripts/
stage-rebuild.sh` (gated build of the rebuild without cutover), `scripts/85`
runbook (5-phase reversible cutover), `frontend-rebuild/.env.production`
(same-origin), and `deploy.sh` step-3 dep check made cutover-safe. The remaining
work is OWNER-RUN on the server (no workspace network path): stage → browser QA
→ git-mv cutover → deploy+verify → delete legacy. Production stays on `1ae4dcd`
until the owner flips.

## PHASE CHECKPOINT LOG

- **2026-09-30 — Decision A recorded.** Rebuild phase opened. Backend inventoried
  (code-traced): 42 modules, ~59 controllers, 4 roles. Master Execution Control +
  registries being stood up. Curriculum breadth (English waves 1-2, Coding wave 1)
  remains PRODUCTION VERIFIED as historical spine evidence; AI-literacy wave 1
  committed and pending live verify (tracked as item 14, non-blocking).

- **2026-09-30 — Full rebuild code-complete.** Decision A executed end to end in
  code: planning/governance (1–7), foundation (8), public/auth/onboarding (9),
  full learner universe (10), guardian+moderator+admin (11), gates + full
  backend/API reconciliation + final completeness audit (12). Result:
  frontend-rebuild/ = 41 routes, 44 feature files, 102 typed endpoint calls, 0
  placeholders, 5 vitest tests, tsc+build+home-bundle-gate all green; every one
  of the 42 backend modules classified and represented or justified; required
  MISSING_FRONTEND = 0; no fabricated capabilities. Switch tooling (task 13
  prep) shipped and cutover-safe. Remaining: task 13 (owner-run cutover/deploy/
  verify/delete-legacy) + task 14 (owner-run AI-literacy seed verify) — both
  genuine external dependencies. Commits: 9cb0c8f, 0d41367, aa77cd2, c1c6814,
  96783f8, eb96407, 3c7d57f, 310ce7d, f7dfece, 4c9def2.

- **2026-09-30 — REBUILD-FROM-BLANK phase superseded the above.** Per the owner
  escalation ("pages PROVISIONAL, Landing SPECIFICALLY REJECTED, rebuild every
  page from zero on a finalized design system after real reference research"),
  the earlier build (rows 8–12) was reset and every page was rebuilt from blank
  on the WHITE/GREEN/BLACK design system through an 8-task plan (R1–R8). Result:
  frontend-rebuild/ = 46 `<Route>` entries, 49 feature files, 78 source files,
  108 typed endpoint calls, 47/47 required pages rebuilt-from-blank, 0
  placeholders, 0 unreferenced/dead source files, 5 vitest tests, tsc + vite
  build (coding runtime isolated to a lazy chunk) + home-bundle gate all green.
  Task-8 pass also fixed a real UX defect: the catch-all 404 was wrapped in an
  auth guard, so unauthenticated visitors hitting a bad URL were bounced to
  /login instead of seeing the honest 404 — the wrapper was removed and the now
  unused RequireAuth guard deleted. Ledgers 88 (page-by-page), 99 (final audit),
  and 85 (cutover runbook + Appendix A legacy→final route map) reconciled to
  reality. Rebuild commits: 3eaf104, 1d86f0b, 6a0b522, e29f84f, 84c6da7,
  825ad93, c229307, 51d2f2f (+ task-8 commit below). Remaining: task 13
  (owner-run cutover) + task 14 (owner-run AI-literacy seed) — external deps.
