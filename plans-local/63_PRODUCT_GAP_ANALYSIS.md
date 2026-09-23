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

### G-2 · No end-to-end tests for critical journeys
- **Current:** 1 vitest file (2 tests).
- **Requirement:** mandate §18, §53 — verified critical flows.
- **New solution:** E2E (Playwright or vitest+RTL flows) for: register →
  onboarding → first mission → reward; login; language/RTL toggle;
  recommendations; worlds; simulations player; privacy consent.
- **Status:** 📋 P0 after G-1.

## P1 — Coherence & value

### G-3 · "Living world" Home depth
- **Current:** Home has companion + recommendations + interest chips, but the
  "world" framing is light.
- **Requirement:** North Star — "a living world that adapts."
- **New solution:** world/character presence on Home tied to progress + age band.
- **Status:** 📋 P1.

### G-4 · Packaging / pricing product model absent
- **Current:** `entitlements` module exists; no Product→Plan→Package→Entitlement
  model, no pricing, no UI.
- **Requirement:** mandate §10, §11, §36; parent-value audit item 4.
- **New solution:** define the packaging model spec (47/48) FIRST, then domain
  model, then entitlement checks, then UI. **No pricing UI before the model
  exists** (mandate §36).
- **Status:** 📋 P1, spec-first.

### G-5 · Portfolio / evidence child-facing surface
- **Current:** `projects` + `credentials` engines live; portfolio UX partial.
- **Requirement:** North Star WHY (parent) + §37.
- **New solution:** a child portfolio surface aggregating project artifacts +
  credentials + mastery evidence.
- **Status:** 📋 P1.

## P2 — Depth & polish

- **G-6** Curriculum content volume per age band (spec 13/14 + content ops).
- **G-7** Accessibility audit pass (WCAG) across shipped pages (§45, §19).
- **G-8** Orphan-engine sweep: confirm each of the 42 modules has a child- or
  parent-facing surface OR is documented as infra-only (mandate §23, §30).

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
