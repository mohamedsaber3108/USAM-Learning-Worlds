# 90 — EXPERIENCE DEFECT REGISTER (Landing + Child Home) + REFERENCE MATRIX

> Phase 0 output. Negative baseline = the LIVE `ae9dcec` build the owner
> reviewed on https://kids.usamif.com. This register is evidence-based: every
> row cites the actual source file/construct in `M:\USAM-main\frontend`, read
> during Phase 0, not a screenshot guess. It is the contract the Phase 1/2
> rebuild must satisfy.

Date: 2026-10-01
Branch: fix/p0-p1-remediation
Baseline SHA: ae9dcec

---

## 0. Root-cause (why the prior pass still reads as SaaS)

The prior reconstruction added **world-themed components on top of a dashboard
skeleton**. It did not change the underlying page *architecture*. Evidence:

- `DashboardPage.tsx` renders `LivingWorldHero` + `WorldJourneyStrip` first,
  then **falls straight back into a literal analytics dashboard**: a
  `stat-card-hero` + `stat-card-secondary` grid, a `CircularProgressbar` level
  ring, a mastery-count breakdown, a 2-column grid of up to 10 `quick-action`
  tiles, and a "recent missions" log list.
- The owner's own research (`COMPETITOR_UX_RESEARCH.md`) already said: "Home is
  a living world with a world-journey map (**shipped as a strip; rebuild →
  fuller map**)." The fuller-map rebuild was deferred. That deferral is the
  defect.

Conclusion (directive §3): do **not** polish these structures. Replace the page
architecture. Keep the real data layer, queries, tokens, and `CharacterFace`.

---

## 1. LANDING defects (`features/landing/pages/LandingPage.tsx`)

| # | Defect (evidence in source) | Why it fails the bar (directive) | Rebuild implication |
|---|---|---|---|
| L1 | **SaaS marketing skeleton**: sticky white nav → hero → 4 domain cards → 6 journey cards → avatar row → 6 feature cards → parent panel → 3 pricing cards → CTA → footer. | §1 "feels like a SaaS landing page… feature cards… generic product marketing hierarchy." | Replace with a world-first above-the-fold that shows child + world + Azouz + adventure + voice in ONE visual, before any marketing prose. |
| L2 | **Characters rendered tiny**: `CharacterFace size={88}` in the hero picker, `size={64}` in the companion row, `size={22}` inline. Shown as circular icons in `rounded-full` chips. | §9 "characters mostly as small circular icons… insufficient… need body/face presence." §10 "static circles are not the final character experience." | Azouz at hero scale (200px+) with a real emotional `state` prop (not idle-only), present as a figure, not an avatar chip. |
| L3 | **White background, marketing whitespace** (`bg-white`, centered `text-center` sections, large empty bands between cards). | §2/§15 "large white empty areas ≠ premium… the child experience needs controlled visual richness." | Warm `surface`/world-gradient canvas with world scenery depth, not empty white. (Design language already mandates warm canvas — landing ignores it with `bg-white`.) |
| L4 | **Domains as 4 flat rectangular cards** (`.card` grid, icon-chip + text). | §7 "should NOT simply be four rectangular cards." §8 "do NOT turn cards into larger cards." | Four domains as **destinations** in a world (scene/portal with mentor present), not a card grid. |
| L5 | **Visitor must read to understand the product** — the first screen is a headline + sub-paragraph + trust row + a character *picker* (an interaction, not a story). | §11 "communicate child + world + Azouz + adventure + AI/voice + creation without reading multiple marketing paragraphs… visual storytelling." | Lead with a single wordless-legible world scene; prose supports, not carries. |

## 2. CHILD HOME defects (`features/dashboard/pages/DashboardPage.tsx`)

| # | Defect (evidence in source) | Why it fails the bar | Rebuild implication |
|---|---|---|---|
| H1 | **Dashboard-with-child-colors**: after the hero, a `grid-cols-3` stat grid (`stat-card-hero`/`stat-card-secondary`), `CircularProgressbar` level ring, mastery breakdown panel, recent-missions log. | §2 "structurally a DASHBOARD WITH CHILD COLORS, not a CHILD LEARNING WORLD." §17 "do not show everything at once." | Remove the stat-grid/log architecture. Home = world + one next action + exploration. Stats become a quiet, secondary, opt-in surface. |
| H2 | **10 equal quick-action tiles** in a 2-col grid (english/coding/ai/entrepreneurship/practice/projects/voice/balanced/evidence/community). | §17 "exposes too many equal choices… never ask which of 12 boxes to press." Progressive disclosure. | ONE primary next action (already in `LivingWorldHero` — keep), 4 domain destinations, then secondary tools behind exploration — not a flat 10-up grid. |
| H3 | **XP / Level / Streak given primary visual weight**: the biggest card on the page is `stat-card-hero` = the level ring + total-XP number. | §18 "XP/Streak/Level must be SECONDARY… learning comes first." | Progress ribbon stays (compact, in hero). Kill the giant level-ring stat card as the page's visual anchor. |
| H4 | **Mastery shown as 3 raw counts** ("Mastered / Learning / To explore" numbers) in the same panel grammar as XP. | §19 "mastery must be visualized DIFFERENTLY from XP… do not combine into one progress concept." | Mastery = per-domain growth shown *in the world/domain destinations* (band color on each domain), visually distinct from the XP ribbon. |
| H5 | **`WorldJourneyStrip` is a row of small gradient rectangles** (`w-40 h-28`, icon + lock + step number). | §7/§8 "not simply four rectangular cards… deliberate world architecture (map/path/scene)." | Rebuild into a genuine journey/map surface with the 4 domains as places, Azouz positioned in it, progress shown spatially. |

## 3. NAVIGATION defects (`components/layout/AppShell.tsx`)

| # | Defect (evidence in source) | Why it fails the bar | Rebuild implication |
|---|---|---|---|
| N1 | **One enterprise navbar for all ages** — `getNavModel(ageBandToNavBand(...))` changes labels/items, but AppShell only scales icon/label **size** (`w-5↔w-6`, `text-xs↔text-sm`) by density. | §16 "do NOT make one enterprise navbar serve ages 8–14 identically." | Younger band: more visual/iconic, larger targets, companion-guided. Older: compact, more tools. Structural, not size-only. (navModel already supports distinct bands — AppShell must express them.) |
| N2 | Desktop floating pill nav + mobile bottom tab bar are solid patterns (design-language-approved) — **keep**, deepen age expression. | — (strength, not defect) | Preserve; add age-structural variation + ensure RTL mirroring verified. |

## 4. STRENGTHS TO PRESERVE (directive §31 — do not demolish)

- **Design tokens** (`tailwind.config.js`): teal brand, warm `surface`, world
  hues, flat shadows, radii, motion — mature and reference-grounded. KEEP.
- **`CharacterFace`**: 15 bespoke animated SVG designs, 7 emotional states,
  5-stage relationship evolution, framer-motion idle life. This answers §10 —
  **no new animation runtime (Rive/Lottie/Pixi) needed.** KEEP + use at scale.
- **Real data layer**: react-query to gamification/mastery/missions/cosmetics/
  dailyGoals/worlds; `useAgeAdaptation`; `masteryLabels` single-source bands.
  KEEP — rebuild composes these, loses zero data.
- **`LivingWorldHero`** bones (companion + ONE next action + progress ribbon)
  are RIGHT per §6/§7 — keep the component, elevate it visually to the page's
  true center and remove the dashboard that follows it.
- **Floating pill nav + bottom tab bar** — design-language approved. KEEP.

---

## 5. REFERENCE MATRIX (directive §13 — reference → strong → weak → USAM → rejected)

Synthesized from the in-repo corpus (`USAM_KIDS_REFERENCE_BIBLE.md`,
`FRONTEND_DESIGN_LANGUAGE.md` 24-ref log, `COMPETITOR_UX_RESEARCH.md` 28-product
audit). Learn patterns, do not clone.

| Reference | STRONG idea | WEAK / reject | USAM application (this rebuild) |
|---|---|---|---|
| Prodigy (Island + zones) | World/journey map AS the home; lessons live inside places | Open-world with no learning spine; grind economy | Home = living world; 4 domains as places; missions inside, not a flat list |
| ClassDojo (Dojo Islands) | Spatial progress, character presence | Points-as-identity | Progress shown spatially in the world; mastery as place-state |
| Duolingo | Single clear path/next action; tactile pill buttons; rounded display | Guilt/FOMO streak shaming; green owl brand | ONE next action (keep); kind streaks (no shame); keep teal brand |
| Khan Academy Kids | Zero-reading nav for young; warm character guide (Kodi) | — | Age 8–9 iconic/voice-forward nav; Azouz guides |
| CodeSpark | 100% word-free young UX; characters tied to roles | — | Younger band structural icon-first nav; Codey=coding etc. |
| Scratch / Code.org | Creation-first; blocks lower the floor | Scratch copyleft/trademark caution | Coding domain = build+run (existing Blockly/Sandpack); not landing-relevant |
| MindMarket (design ref) | Warm cream canvas, storybook character illustration, single accent, big rounded cards, floating pill nav, flat depth | Inter-only 140px display | The exact landing/home visual recipe — warm canvas + Azouz illustration + teal accent + pill nav |
| Slush (design ref) | Pastel sticker universe, fully-rounded pills, playful multi-color | 640px crushed type, black outlines everywhere | World-hue decoration on domain places; rounded pills |
| Brilliant | Interactive-first, "do to learn" | Adult register | Teach→do adjacency (missions), not landing |
| Lingokids / PBS Kids | Playful, safe, discovery browse | — | Discovery where a library exists (stories/sims later phases) |
| Reading Eggs (Golden Egg map) | Progress as a visible, motivating map artifact | Pure reward economy | Mastery-by-domain visible as growth, not just points |

### Locked decisions coming out of the matrix
1. **Home = world map, not stats dashboard** (every ref + owner research agree).
2. **Characters lead at scale** with emotional state — reuse `CharacterFace`,
   **reject** adding Rive/Lottie/Pixi (working SVG system already meets §10).
3. **One accent (teal), warm canvas, flat depth** — already locked in the
   design language; landing must stop using `bg-white` + marketing whitespace.
4. **Progressive disclosure** — one next action + 4 places + exploration;
   **reject** the 10-tile grid and the stat-grid architecture.
5. **XP secondary, mastery distinct** — ribbon for XP; place-state for mastery.
6. **Age structural, not size-only** — express navModel bands in AppShell.
7. **Kind motivation** — no FOMO/guilt (reject Duolingo's shaming).
