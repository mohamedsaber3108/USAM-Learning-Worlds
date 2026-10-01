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

## ALL PLANNING GATES COMPLETE (G1–G5 docs). Canonical set 00–46 + STATUS written.

The product is fully RE-DEFINED and the implementation plan is locked. The
reconstruction now moves from PLANNING to EXECUTION (44 phases A–J).

## EXECUTION precondition (one owner confirm)

Gate-5 EXECUTION (writing code in the ONE app) needs the owner to confirm the
rebuild target = **root `src/`** (recommended; evidence in 02 §A / 37 §1). This
is the single high-impact, hard-to-reverse decision (picking the wrong tree wastes
the build). Everything else proceeds.

Other owner decisions (do NOT block starting execution; resolve as reached):
(2) palette amber/teal/magenta vs white/green/black (token-value change only);
(3) final price + enabling real payment gateway (before charging real customers);
(4) legal/privacy copy review; (5) optional auth reset/verify/OAuth for v1.

## Next (execution — 44)

Phase A foundation wiring (one API client + AgePresentationProvider + real auth)
→ B correct seed (4 domains + 15 chars + worlds) → C core learning loop real →
D first-run + session engine → E companions + voice → F create/projects/portfolio
→ G entrepreneurship content → H parent/mod/admin → I commerce → J harden+QA+
cutover+delete legacy. Each phase ends green + updates 45 truth table with
evidence. Do not stop after planning.
