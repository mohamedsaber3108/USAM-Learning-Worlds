# STATUS — USAM product-first reconstruction

> Living status. Updated after every phase. Honest: nothing marked done without
> evidence. "Plans drive code; code updates plans."

Last updated: 2026-09-30

---

## Current gate: GATE 3 next (Curriculum/Levels/Packages/Journeys/IA)

| Gate | Scope | Status |
|---|---|---|
| G1 | Forensic audit + product scope + current reality + gaps | ✅ done + committed; 1 blocking owner decision open (tree) |
| G2 | Research + learning methodology + age/adaptation + OSS | ✅ done (04/05/06/07/36), research-cited |
| G3 | Curriculum + levels + packages + pricing + content + journeys + IA | ✅ done (08-21); merged prior 47/48/66/69 + Product Bible/North Star |
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

## Next

- Gate 4: design system (22), characters (23), voice (24), domain products
  (25-28), projects (29), assessment/mastery/evidence (30), adaptive (31),
  gamification (32), portfolio (33), parent (34), safety/privacy (35), FE/BE/
  data/API contracts (37-40). Then Gate 5 (migration/rebuild/test).
- Still OPEN: owner tree decision (root src/ vs frontend/) — blocks G5 execution.
- Do not stop after planning; proceed gate by gate.
