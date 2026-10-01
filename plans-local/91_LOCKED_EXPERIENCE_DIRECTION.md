# 91 — LOCKED EXPERIENCE DIRECTION (Phase 1 foundation)

> Phase 1 lock. The visual *language* was already decided in
> `docs/architecture/FRONTEND_DESIGN_LANGUAGE.md` (24-ref synthesis: warm
> canvas, teal anchor, one accent, flat depth, char-leads, Nunito). This doc
> locks the two decisions the current brief demands be made **deliberately**
> (directive §8 world architecture, §10 character system) and the component
> plan for the Landing + Child-Home + Navigation rebuild. It does NOT re-open
> the token system.

Date: 2026-10-01

---

## 1. §10 — Character visual system DECISION

**DECISION: KEEP `CharacterFace` (bespoke animated SVG). REJECT adding Rive /
Lottie / Pixi / R3F.**

Rationale (evidence, not preference):
- `CharacterFace` already provides 15 bespoke per-character designs, a 7-state
  emotional system (idle/listening/thinking/speaking/encouraging/celebrating/
  error), 5-stage relationship evolution, and framer-motion idle life
  (bob + breathe + staggered blink). This already satisfies §9/§10's demand for
  "body/face presence, expressions, contextual states, reactions, animation,
  voice states."
- It is SVG: resolution-independent, scales from 22px to 320px with zero asset
  cost, RTL-safe, tiny bundle footprint, already in the proven build.
- Adding a runtime (Rive/Lottie) means new `.riv`/`.json` art for 15 characters
  × 7 states, a new dependency, bundle growth, and churn against working
  engineering — violating directive §31 (keep good engineering) for no quality
  gain the SVG system doesn't already deliver.

**The real defect was USAGE, not technology**: characters were rendered at
22–88px in circular chips. Fix = compose the SAME component at hero scale
(180–320px) as a *figure* with its `state` prop wired to context (Azouz
`encouraging` on home, `speaking` when greeting, etc.), not an avatar dot.

New thin wrapper to build: `CharacterStage` — renders a `CharacterFace` at
large scale on a soft world-tinted pedestal/glow, with an optional speech
bubble and a `state` prop. One component, reused on landing hero + home hero +
domain places + onboarding.

## 2. §8 — World-representation architecture DECISION

**DECISION: "World hubs with a connecting journey path" — a responsive,
illustrated scene, NOT a card grid and NOT a heavy game-engine canvas.**

Considered and rejected:
- *Full illustrated interactive map (Pixi/canvas)* — REJECT now: heavy, slow on
  low-end mobile (our audience includes phones), high art cost, and the data
  (`worldsApi` → ordered worlds with unlock state + mission counts) doesn't need
  pixel-level interactivity. Note as a possible future upgrade, not Phase 1/2.
- *Four bigger cards* — REJECT: explicitly forbidden (§7/§8).
- *Row of small gradient rectangles* (current `WorldJourneyStrip`) — REJECT:
  the negative baseline.

**ADOPT: a CSS/SVG "journey" surface** — the 4 domain worlds laid out as
*places* on a soft connecting path (a flowing SVG trail on desktop; a vertical
snake on mobile), each place a generous rounded "portal" showing its world hue,
its mentor (`CharacterFace`), the child's mastery-band color as the place's
state, mission progress, and lock state. Azouz stands at the current place. This
reads as a map/journey a child wants to explore, costs no new runtime, is fully
responsive + RTL-mirrorable, and is driven entirely by the existing
`worldsApi` + `masteryApi` data.

Component to build: `WorldJourneyMap` (replaces `WorldJourneyStrip`), plus a
`DomainPortal` place tile.

## 3. Child-Home ARCHITECTURE (replaces the dashboard skeleton)

Order of surfaces (progressive disclosure, §17; XP secondary, §18; mastery
distinct, §19):

1. **`CharacterStage` hero** — Azouz at scale greeting the child, the ONE next
   action, and a *compact* progress ribbon (level/XP/streak as small chips).
   (Evolve `LivingWorldHero` into this — keep its data wiring, raise Azouz scale
   + wire `state`.)
2. **`WorldJourneyMap`** — the 4 domains as places on a path; mastery shown as
   each place's band color (distinct visual grammar from the XP ribbon).
3. **"Keep exploring"** — `RecommendationsSection` + `ReviewDueCard` +
   `InterestChips` (already real engines; keep, restyle to the world grammar).
4. **Quiet secondary**: recent activity + a *single* "See your progress" link to
   `/progress`. NO stat-card grid, NO level-ring hero card, NO 10-tile
   quick-action grid, NO raw mastery-count panel on home. Those move to
   `/progress` (where an analytics view is appropriate).

## 4. Landing ARCHITECTURE (replaces the SaaS skeleton)

1. **World hero** — warm canvas (not `bg-white`), Azouz at scale via
   `CharacterStage` with a speech bubble, the four domains legible as places
   behind/around him, one teal CTA + a voice cue. Communicates
   child+world+Azouz+adventure+voice **before** prose (§11).
2. **The four worlds** — as destinations (portal/scene grammar), each with its
   mentor, not a flat `.card` grid (§7).
3. **The adventure loop** — discover→learn→practice→build→prove→grow, shown as a
   path (reuse journey grammar), not 6 equal cards.
4. **Companions** — a few mentors shown at real scale (not 64px dots).
5. **For parents** — keep the value/safety panel (it's good + necessary).
6. **Plans teaser + final CTA + footer** — keep, restyle to world grammar.

## 5. Navigation (§16) — express age bands structurally

`navModel` already returns distinct primary/secondary sets per band. AppShell
must express band differences beyond icon size:
- **young (8–9)**: fewer primary tabs, larger iconic targets, labels always
  shown, a persistent "Ask Azouz" affordance.
- **older (12–14)**: compact, more tools surfaced, search prominent.
Keep the floating pill (desktop) + bottom tab bar (mobile) shells. Verify RTL.

## 6. Build order (Phase 1 then Phase 2)
1. `CharacterStage` (shared) → 2. Landing rebuild (Phase 1) → 3. `WorldJourneyMap`
+ `DomainPortal` → 4. Home rebuild (Phase 2) → 5. AppShell age-structural pass →
6. remove dead code (old `WorldJourneyStrip` once unreferenced; old landing
sections) → 7. gates + Playwright local screenshots → 8. commit/push.

## 7. Non-negotiables carried into build
- Zero data loss: every existing real query stays wired.
- EN/AR + RTL from the first commit (t(key, fallback), `rtl:` utilities,
  `me/ms`/`start/end` logical props, no hard left/right).
- Reduced-motion respected (framer-motion already gates on `animate`).
- Keep teal brand + warm canvas + flat depth (design language).
- No new heavy dependency.
