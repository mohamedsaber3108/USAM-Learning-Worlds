# 63 — Product Gap Analysis

> The prioritized register of gaps between the verified current product and the
> North Star. Each gap uses the traceability chain (mandate §2). Priority: P0 =
> blocks the core child journey; P1 = major coherence/value gap; P2 = depth.

Last updated: 2026-09-22 · HEAD `48b3bde`

---

## P0 — Core child journey

### G-1 · Missing "Learn" teaching beat in missions
- **Current:** Mission player jumps straight into practice questions; no teach/
  explain step. Backend Mission has no narrative/teaching field.
- **Requirement:** Story → **Learn** → Practice → Reward (North Star HOW).
- **Product purpose:** a child alone must be *taught* the concept before being
  tested, or the loop is just quizzing (fails child-truth audit item 1 & 5).
- **Learning purpose:** direct instruction + worked example before retrieval
  practice (research: worked examples reduce cognitive load).
- **New solution:** a lightweight, per-activity/objective teaching card
  (concept + worked example + "I'm ready") shown before the first practice
  item, sourced from existing activity `content` (context/prompt/keyPoints)
  with graceful fallback. Frontend-first; deepen with a backend teaching field
  later if content warrants.
- **API:** none new initially (reads existing activity content). Future:
  optional `teachingContent` on Activity.
- **Test:** player renders Learn step then Practice; skippable; EN+AR.
- **Status:** 📋 NEXT.

### G-2 · Thin test coverage of critical journeys
- **Current (was):** 1 vitest file (2 tests).
- **Requirement:** mandate §18, §53 — verified critical flows.
- **Decision:** integration tests with Testing Library + jsdom against mocked
  APIs (matches existing stack; no heavy Playwright/CI-browser dependency).
  A shared `src/test/renderWithProviders.tsx` harness wraps Query + Router +
  i18n so tests exercise real hooks.
- **Done so far (commit pending):** reward-loop completion page (4 tests, locks
  the outcome-shape fix), Learn-step player wiring (2 tests), teaching
  extractor (6 tests). Suite now 4 files / 14 tests, all green.
- **G-2b done:** login (validation + success stores tokens/navigates, 2 tests)
  and language/RTL (dir/lang mirror, persistence, real AR strings, 4 tests).
  Added an in-memory localStorage polyfill to `src/test/setup.ts` (jsdom had
  none). Suite now 6 files / 20 tests, all green.
- **Remaining:** onboarding step-through, recommendations/worlds/simulations
  render smoke tests. Tracked as G-2c (lower priority — those are read-only
  render paths).
- **Status:** 🟡 all critical *write/navigation* journeys covered; G-2c render
  smoke tests remain.

## P1 — Coherence & value

### G-3 · "Living world" Home depth
- **Current (was):** Home had companion + recommendations + interest chips, but
  the six-worlds "world" framing was absent from the home surface.
- **Requirement:** North Star — "a living world that adapts."
- **Done (commit pending):** `WorldJourneyStrip` on Home — a horizontal journey
  of the learner's worlds with real unlock state + mission counts from the
  Worlds engine, step-numbered, linking into the full map. Self-hides when
  unavailable. Shared `worldVisual.ts` domain→icon/gradient map extracted from
  WorldsPage so both surfaces render worlds identically (DRY). EN + AR.
- **Status:** 🟡 shipped to repo; deeper age-band-tuned world state is a future
  refinement (G-3b) but the living-world entry surface is in place.

### G-4 · Packaging / pricing product model
- **Current:** backend already has `Plan` + `Subscription` models and an
  `EntitlementsService` (`hasFeature`/`getLimit`, FREE fallback) + a payment
  provider abstraction — a solid foundation, but no plans defined, no product
  packaging decisions, no pricing, no UI.
- **Requirement:** mandate §10, §11, §36; parent-value audit item 4.
- **Spec done (commit pending):** `47_PRICING_PACKAGING.md` (four plans
  FREE/EXPLORER/FAMILY/SCHOOL with concrete `features` payloads mapped onto the
  existing `Plan.features` JSON, prices anchored to competitor research, trial,
  feature-flag key registry) + `48_BUSINESS_MODEL.md` (unit economics, AI/voice
  cost governance via voice caps, funnel, parent-value↔price mapping, risks).
- **Implementation sequenced (spec 67, 7a–7d):** seed plans → wire real gates →
  `/plans` UI → payment gateway. **No pricing UI before seed+gates** (§36).
- **Status:** ✅ spec complete; 🟡 implementation queued (backend-first).

### G-5 · Portfolio / evidence child-facing surface
- **Current (was):** `/portfolio` showed only showcased projects, hardcoded
  English, no aggregation of the other evidence the engines already produce.
- **Requirement:** North Star WHY (parent value) + §37.
- **Done (commit pending):** rebuilt `MyPortfolioPage` into a real evidence
  portfolio aggregating three live sources — mastery (GET /mastery/by-domain →
  skills mastered), credentials (GET /credentials/me, via the reused
  CredentialsSection), and showcased projects (GET /projects/my) — with an
  at-a-glance evidence summary. Fully internationalized (portfolio.* keys,
  EN + AR). Self-hiding / real empty states per source.
- **Status:** 🟡 shipped to repo; awaiting deploy.

## P2 — Depth & polish

- **G-6** Curriculum content volume per age band (spec 13/14 + content ops).
- **G-7** ✅ DONE — Accessibility pass: added skip-to-content link (WCAG 2.4.1)
  + focusable `#main-content` landmark in AppShell; installed vitest-axe and
  added an automated axe gate (3 tests) proving no detectable violations in the
  reconstruction pages. EN+AR. Full WCAG conformance still needs manual AT
  testing + expert review (noted in the test). Suite now 23 tests.
- **G-8** ✅ DONE — Orphan-engine sweep complete, see
  `66_FINAL_ENGINE_INVENTORY.md`. All 42 modules / ~55 controllers classified
  (learner/parent-facing · infra/admin-only · gap). Only one real orphan.
- **G-9** ⚠⛔ `coding-coach` engine (AI debug/review/explain/challenge) has no
  frontend. Intended home: an "Ask the coach" affordance in CodeMissionRunner.
  BLOCKED on Bedrock creds (unverifiable agent-side), same as ai-tutor/voice.

## ⛔ Blocked

- **G-B1** AI tutor/voice realtime — Bedrock credentials unavailable to agent;
  verifiable only on the server by the user.

---

## Orphan-engine sweep worksheet (G-8 seed)

For each backend module: has a real UX surface? (Y / infra-only / **orphan →
needs UX**). To be completed as part of G-8; known-surfaced ones marked:

- worlds ✅, simulation ✅, missions ✅, mastery ✅ (balanced), adaptive ✅
  (recommendations), credentials ✅, legal ✅ (privacy), gamification ✅,
  auth ✅, parents ✅, reflection ✅ (mission complete), english/coding/
  creativity/problem-solving/thinking 🟡 (varies), analytics/audit/
  feature-flags/experimentation/content-provenance/content-qa/
  difficulty-calibration/curriculum-mapping = likely infra-only (to confirm).
