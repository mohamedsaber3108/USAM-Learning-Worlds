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
| 8 | Clean new frontend foundation (isolated tree) | E | P0 | TESTING | frontend-rebuild/ scaffolded; tsc clean + vite build 182 modules OK. Typed client+auth store+role router/shell+DS primitives+i18n EN/AR RTL. Real Landing/Login; rest honest placeholders |
| 9 | Landing + auth + onboarding (new FE) | H/I/J | P1 | VISUAL_QA | Landing/Pricing/Login/Signup/Onboarding built on real APIs w/ states+EN/AR+responsive+a11y; tsc+build green (186 modules). Live browser QA + 1ae4dcd regression-compare = owner-run (tracked in 81) |
| 10 | Learner experience + learning loop (new FE) | K/L/M/N/O | P1 | VISUAL_QA | FULL learner universe on real APIs: Home, Learn, DomainPath, Mission detail+player (all activity types + coding trust loop lazy chunk), Practice, Progress, Projects+detail, Portfolio, Creativity, Companions, Community, Credentials, Rewards, Settings, Search, Notifications, Stories+reader, Simulations, Voice(gated). tsc+build green. ZERO placeholders. Owner-run live QA pending |
| 11 | Parent → moderator → admin surfaces (new FE) | Q/W/X | P1 | VISUAL_QA | Guardian: ParentHome, ChildDetail(progress/activity/reflections/safety/controls tabs), Privacy(export/delete), Plan(activate/cancel, honest no-payment). Moderator: console, escalations(assign/resolve), community moderation(approve/remove), interventions(ack/resolve). Admin 6 task areas: Overview, Content(CMS DRAFT→PUBLISHED→ARCHIVED via real status endpoint), Curriculum&QA, AI&Safety, Analytics(+daily chart), Platform(feature-flag toggle/experiments/audit). tsc+build green. Owner-run live QA pending |
| 12 | Cross-cutting gates + coverage matrices (81–84) | Z/AA/AB/AC/AE/AF | P1 | TESTING | vitest harness (5 tests green: render/DS/i18n-RTL), home-bundle perf gate (coding runtime isolated), tsc+build green. Coverage matrices 83 (API→FE, MISSING_FRONTEND=0 for required) + 84 (module→FE, all 42 classified, none forgotten) + 82 (E2E journeys). a11y baseline in components (focus-visible, roles, reduced-motion); full browser a11y/RTL/responsive = owner-run (81) |
| 13 | Switch to new FE, delete legacy, deploy, verify, final audit | AI/AG/AH | P0 | BLOCKED_EXTERNAL | 99 audit DONE (code-side switch-ready: 41 routes, 0 placeholders, tests+build+bundle-gate green, reconciliation clean). Remaining = OWNER-RUN: stage deploy + browser QA + E2E vs 1ae4dcd + traffic switch + delete legacy frontend/. No live backend in this workspace |
| 14 | AI Literacy breadth verify (curriculum, non-blocking) | L | P2 | LIVE_VERIFYING | committed `7b3d818`; owner seed+verify pending |

## PHASE CHECKPOINT LOG

- **2026-09-30 — Decision A recorded.** Rebuild phase opened. Backend inventoried
  (code-traced): 42 modules, ~59 controllers, 4 roles. Master Execution Control +
  registries being stood up. Curriculum breadth (English waves 1-2, Coding wave 1)
  remains PRODUCTION VERIFIED as historical spine evidence; AI-literacy wave 1
  committed and pending live verify (tracked as item 14, non-blocking).
