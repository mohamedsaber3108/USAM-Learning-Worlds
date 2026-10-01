# 00 — MASTER PRODUCT (canonical index)

> Canonical source of truth for the USAM for Kids product reconstruction
> (Owner Decision: **Option A — full product-first reset**, this session).
> Everything here is grounded in code actually read this session. Where a claim
> is NOT yet verified in code, it is marked **[UNVERIFIED]** or **[GREENFIELD]**.
> No fake completeness.

Date opened: 2026-09-30 · Branch: `fix/p0-p1-remediation` · Dev checkout: `M:\USAM-main`

---

## 0. What this reconstruction is

Rebuild the PRODUCT from first principles, then rebuild it **inside the ONE
original application** — not as a parallel preview, not as `/new` or `/v2`.
End state: ONE USAM for Kids product, ONE frontend, ONE backend, ONE source of
truth, real content/entitlement architecture, no legacy tree left beside it.

Sequence (gated; plans drive code, code updates plans):
`AUDIT → RESEARCH → PRODUCT DEF → LEARNING DEF → PACKAGING → ARCHITECTURE →
MIGRATION PLAN → IMPLEMENT → TEST → VISUAL QA → PRODUCT QA → FIX → REPEAT`

---

## 1. Locked scope (owner, this session) — see 01_PRODUCT_SCOPE.md

- **Primary domains (4):** English · Coding/Computational Thinking · AI
  Literacy & Creation · Entrepreneurship/Young Business Building.
- **Supporting/cross-domain:** Creativity & Design, Critical Thinking, Problem
  Solving, Communication, Collaboration, Digital Literacy, Digital Safety,
  Financial/Life Skills, Research, Media Literacy, Project Skills, Future Skills.
- **NOT primary:** Science, Math, Social Studies, Geography, traditional school
  subjects (contextual only; adding one needs explicit product justification).
- **Voice:** core cross-platform capability, provider-independent.
- **Characters:** 15-name roster in scope, Azouz = main companion, progressive
  reveal. Rami supports contextual STEM but does NOT make Science primary.
- **Ages:** 8–14, bands 8–9 / 10–11 / 12–14; adaptation uses
  age + ability + mastery + interests + history + current objective.
- **Packages/pricing:** configurable; owner sign-off required only before
  charging real customers.

## 2. The canonical document set (this folder)

Gate 1 (DONE this session): 00, 01, 02, 03, STATUS.
Gate 2: 04 Research, 05 Competitors, 06 Learning methodology, 07 Age/adaptation, 36 OSS.
Gate 3: 08 Curriculum, 09 Levels, 10 Packages/entitlements, 11 Pricing, 12 Content
inventory, 13 Content gaps, 14–16 Journeys, 17 IA, 18 Nav, 19 Page map, 20 Feature
map, 21 Engine map.
Gate 4: 22 Design system, 23 Characters, 24 Voice, 25–28 Domain products, 29
Projects, 30 Assessment/Mastery/Evidence, 31 Adaptive, 32 Gamification, 33
Portfolio, 34 Parent, 35 Safety/Privacy, 37–40 FE/BE/Data/API.
Gate 5: 41 Migration/Deletion, 42 Testing, 43 Production, 44 Implementation
sequence, 45 Feature truth table, 46 Final acceptance.

## 3. Merge, don't duplicate — prior work being folded in

Valid prior product work exists and is MERGED (not re-invented):
- `docs/product/USAM_KIDS_PRODUCT_BIBLE.md` — strong product model; mostly
  aligns. Divergences reconciled in 01 (ages 7–15→**8–14**; Entrepreneurship
  cross-cutting→**primary**).
- `docs/product/FINAL_CAPABILITY_REGISTRY.md`, `FINAL_ENTITLEMENT_MATRIX.md`.
- `docs/architecture/USAM_GAP_REGISTER.md` — enumerated GAP-001..037; folded
  into 03_PRODUCT_GAPS.md.
- `docs/architecture/USAM_{MASTER_BACKEND_ARCHITECTURE,DATA_MODEL_PLAN,API_BOUNDARIES,ENGINE_MAP,IMPLEMENTATION_ROADMAP,OPEN_SOURCE_EVALUATION}.md`.
- Prior `plans-local/*` (80–99 ledgers etc.) from the frontend-rebuild era —
  superseded by this product-first reset but retained as history.

## 3b. Backend reality (verified) — the mature foundation

The backend is far more complete than a first-pass audit suggested: **96 Prisma
models, ~56 controllers, ~47 modules**, including entitlements (Plan/Subscription
+ payment abstraction), voice, notifications, credentials, flashcards, stories,
simulations, cosmetics, feature-flags, experiments, audit, worlds, reflection,
consent/safety (COPPA/GDPR primitives), and all four domains + cross-curricular
concept tables. The reconstruction's dominant work is therefore NOT "build the
backend" — it is: (1) wire the real frontend (root `src/` is mock-backed) to this
backend; (2) fix the SEED/content to the locked 4 domains + 15 characters;
(3) add the explicit packaging/levels product layer on top of existing plans;
(4) verify depth/wiring of each module honestly in the 45 truth table.

## 4. Open high-impact decision (owner) — see 02 §A

**Which tree is "the original project" to rebuild inside?** Code evidence in this
`M:\USAM-main` checkout points at root `src/` (TanStack Start + Lovable; the
`.output/` build + `start-frontend.sh` use it; `.lovable/project.json` + the
`kids.usamif.com` Lovable connection). BUT `src/LEGACY_DO_NOT_EDIT.md` (committed
in the prior frontend-rebuild era) says `frontend/` is canonical and `src/` is a
dead scaffold. These contradict. This is tracked as the single blocking
architecture decision; everything tree-independent proceeds now. Details + a
recommendation in 02 §A and 37_FRONTEND_ARCHITECTURE.md.

## 5. Honesty constraints (standing)

- No capability is claimed PRODUCTION_READY without evidence (45 truth table).
- Visual/live QA is only "passed" if actually observed in a browser; otherwise
  the limitation is documented + a manual acceptance checklist produced (46).
- Content is classified IMPLEMENTED / GENERATED / LICENSED / NEEDS-EXPERT-REVIEW
  / MISSING — never faked (12/13).
