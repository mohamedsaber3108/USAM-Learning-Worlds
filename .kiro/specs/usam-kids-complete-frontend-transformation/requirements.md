# USAM Kids — Complete Frontend Transformation: Requirements

## Source

This spec formalizes the "Master Execution Directive" / "Full Frontend Rebuild"
instructions given across this engagement, filtered through what was verified
against the real repository (`M:\USAM-main`) and two explicit scope
boundaries agreed with the owner (see §0).

## 0. Scope boundaries (agreed, not open for silent reinterpretation)

1. **No scraped-reference implementation input.** The owner supplied a
   competitor site-reconstruction dataset
   (`C:\Users\moham\Documents\SiteReconData\Prodigy-Full`, scraped from
   prodigygame.com). That dataset is NOT opened, parsed, or used as literal
   implementation input (no copying layout geometry, DOM structure, CSS
   values, or asset maps from it). Generic, category-wide gamified-learning
   UX concepts (world→mission→mastery→reward loops, companion presence,
   locked/unlock messaging, mission-brief structure) are drawn from general
   product knowledge, not from the scrape. This boundary was explicitly
   negotiated with the owner (2026-10-14/15 session) and stands unless
   explicitly revisited.
2. **No bespoke illustration/animation asset production.** This is a coding
   agent. Original hand-drawn character art, full emotion sprite sheets, and
   painted world-map illustrations are graphic-design/illustration
   production, not code. What IS deliverable: the existing bespoke SVG
   character system (`CharacterFace.tsx`/`CharacterStage.tsx` — 15 real
   characters, already hand-coded as distinct SVG designs, not a shared
   shape recolored), CSS/SVG-driven visual composition, and a real motion
   system.
3. **Decision A (design-system direction) is retained by default.** The
   existing, deliberately documented design system
   (`docs/frontend/FINAL_USAM_DESIGN_SYSTEM.md`) mandates WHITE/GREEN/BLACK
   as the one dominant brand direction and explicitly rejects a
   "per-feature rainbow" (a prior legacy direction it replaced on purpose).
   The new directive's ask for distinct per-domain "visual environments"
   (English = language world, Coding = tech lab, etc.) is honored through
   **composition, motion, iconography, and character presence** — not
   through giving each domain its own hue family. This reconciles both
   asks without silently reversing a documented architectural decision. If
   the owner wants literal per-domain color theming instead, that is an
   explicit reversal of Decision A and needs to be said plainly, not
   inferred.

## 1. Non-negotiable objective

Close every real, verifiable gap between what the USAM Kids backend already
supports and what the frontend currently exposes, while raising the
frontend's visual/interaction/motion quality to original, production-grade
USAM standards — without regressing any existing capability, role,
authorization rule, or data contract.

## 2. Functional requirements (by product area)

Derived from the directive's batch list (§46 of the directive), re-scoped
against real audited capability:

- **Design system**: tokens (color/type/spacing/radius/shadow/motion)
  already exist and are deliberate; extend (don't replace) with a depth
  scale, a documented motion-token set, and closing any component-state
  gaps (loading/empty/error/locked/restricted), per
  `FINAL_USAM_DESIGN_SYSTEM.md`.
- **App shell/navigation**: real, role-aware, already implemented
  (`AppShell.tsx`). Audit for any remaining unreachable real pages (method
  already proven in ledger 89 — the `/app/more` hub fix).
- **Character system**: real, already implemented (15 characters, 7
  interaction states: idle/listening/thinking/speaking/encouraging/
  celebrating/error). Requirement: audit platform-wide contextual presence
  (which real learner surfaces still lack a wired companion) and close
  gaps using the *existing* state machine — do not invent new states
  without a concrete real trigger to wire them to.
- **Learner verticals** (Home, Learn/Worlds, Mission Detail/Player,
  Practice, Progress/Mastery, Rewards, English, Coding, AI Literacy,
  Creativity, Thinking, Stories, Simulations, Projects, Portfolio, Voice,
  Search/Notifications/Settings): continue the proven method from ledger 89
  — for each surface, diff real backend capability (controllers/DTOs/real
  API responses) against what the frontend actually renders, close real
  gaps with real data, never fabricate.
- **Guardian / Moderator / Admin**: same method, role-appropriate
  presentation (Guardian: answer-the-5-questions framing; Moderator:
  queue→case→decision→audit; Admin: operational, not gamified).
- **Capability preservation matrix**: every backend controller gets a
  disposition (VISIBLE_PRODUCT_SURFACE / CONTEXTUAL_PRODUCT_ACTION /
  ADMIN_OPERATION / MODERATOR_OPERATION / BACKGROUND_ENGINE / INTERNAL_ONLY
  / BACK_COMPAT / BLOCKED_EXTERNAL / OBSOLETE). Tracked in
  `docs/reconstruction/FEATURE_BACKEND_MATRIX.md`, continuing the
  per-round disposition pattern already used in
  `plans-local/89_COMPLETE_HISTORY_RECONCILIATION_LEDGER.md`.

## 3. Non-functional requirements

- Real data only; honest empty/loading/error/locked states everywhere.
- Arabic is first-class (RTL, real Arabic typography, mirrored icons/motion
  direction) — already partially true (`font-arabic`, `dir`-aware CSS);
  audit for regressions as new surfaces are built.
- `prefers-reduced-motion: reduce` must disable ambient/celebration motion
  (already enforced globally in `src/styles/index.css`); every new motion
  addition must respect it.
- Accessibility: keyboard, focus-visible, contrast, touch targets, semantic
  labels — audited per surface, not assumed.
- Performance: no new always-loaded runtime weight (coding sandbox, voice
  runtime stay lazy/deferred — enforced today by
  `scripts/check-home-bundle.mjs`; must stay green).
- Every batch: implement → `tsc --noEmit` → `eslint --max-warnings 0` →
  `vitest run` → `vite build` → `check:home-bundle` → commit → push → owner
  deploys → independent live bundle-marker verification. No step skipped,
  no step claimed without its actual output.

## 4. Explicit non-goals (for now)

- Pixel-fidelity reproduction of any specific competitor page.
- New bespoke illustrated character artwork beyond the existing SVG system.
- Literal per-domain color-family theming (unless Decision A is explicitly
  reopened by the owner).
- Full Playwright visual-regression harness against the scraped reference
  (would require loading that dataset — out of scope per §0.1). A
  same-origin Playwright smoke/E2E suite against the live USAM app remains
  in scope and has precedent (`frontend/scripts/product-crawler.mjs`).
