# USAM for Kids — Frontend Design Language

This document records the synthesized visual design language for the USAM for
Kids frontend and the reasoning behind it. It is the single source of truth for
"why does the UI look this way." It was produced by studying ten design
reference briefs and deciding, per reference, what to **adopt**, **adapt**, or
**reject** — then folding the chosen ideas into a coherent USAM identity rather
than copying any one product.

> Guiding principle: **synthesize into a USAM identity, keep the teal brand.**
> The deep-teal `primary` scale stays the dominant, credible brand color of an
> academic "learning worlds" product for ages 8–14. Everything playful is
> layered *around* that anchor, never replacing it.

---

## The USAM identity in one paragraph

A calm, premium, deep-teal brand canvas, warmed up with a rounded, friendly
display voice (Nunito), one strong accent used sparingly (amber), a small set of
per-world playful hues (sky / grape / coral / bubble), tactile 3D pill buttons
that feel physically pressable, generously rounded cards, and gentle, purposeful
motion. Not a generic SaaS dashboard, not a toy — a character-driven learning
universe that a child enjoys and a parent trusts.

---

## Type

- **Display / headings: Nunito** (weights 600–900). A warm, rounded sans that
  reads friendly-but-credible. Wired as `font-display` and the legacy
  `font-heading` alias, and applied to `h1–h3` globally so every page inherits
  it. Chosen as the readily-available substitute for Duolingo's rounded display
  faces (Feather / din-round).
- **Body / UI: Inter** (400–700). Clean and legible; doesn't read babyish for a
  14-year-old.
- **Arabic: Cairo** (400–800). A real Arabic UI webfont for both body and
  headings under `dir="rtl"`, with Latin negative tracking removed and slightly
  looser line-height (1.7) for legibility.

*Rejected:* a monospace display voice (MotherDuck) and a serif display voice
(Zams/Obviously) — both wrong for a kids' product.

## Color

- **Primary — deep teal** (`primary.50–900`, anchor `#12403a`). The one
  dominant brand color: nav, primary buttons, focus rings, hero surfaces.
- **Accent — warm amber** (`accent.*`). The single warm counterpoint, used
  sparingly: streaks, one CTA, one highlight per view.
- **Secondary — honey gold** (`secondary.*`). Reserved for XP / rewards so
  "reward currency" reads distinct from generic progress.
- **World hues — sky / grape / coral / bubble.** Additive playful palette, one
  hue per learning world (English, creativity/stories, playful CTA warmth,
  cosmetics/celebration). They pair cleanly with teal and never compete with it
  for the brand role.
- **Surfaces** are cool-neutral off-whites so white cards sit on a calm canvas.

*Adopted from* Playful / Aaply: **one strong accent + a restrained supporting
set**, not a rainbow. *Rejected:* letting any world hue become the brand color.

## Buttons — tactile 3D pills

The signature interaction. Every `.btn-*` (and the marketing `.btn-hero*`) is a
**fully rounded pill** with a **solid fill** and a **darker solid bottom
border** that reads as physical depth — **no drop shadow**. On `:active` the
button **sinks**: it translates down a couple of pixels while the bottom border
shrinks, so it feels like a real key press.

- `.btn-primary` — teal fill, darker-teal depth edge.
- `.btn-accent` — amber fill, darker-amber depth edge (sparing use).
- `.btn-secondary` — white surface, gray depth edge.
- `.btn-outline` — quiet, transparent depth edge to keep footprint aligned.
- `.btn-hero` / `.btn-hero-accent` — larger flagship CTAs, deeper edge.

Because these are defined once at the CSS-primitive layer, the whole app
inherits the new feel without editing individual pages.

*Adopted from* Duolingo / Aaply: the tactile bottom-border press effect.
*Rejected:* drop-shadow "floating" buttons (less physical, more generic SaaS).

## Cards & radii

- Card radius bumped to **20px** (`rounded-card`) and controls to **14px**
  (`rounded-control`) so every card and input across the app reads softer at
  once. Marketing/world surfaces use the larger **`rounded-blob` (28px)** and
  **`rounded-pill`** for hero chrome.
- Cards use layered, **teal-tinted soft shadows** (not neutral black) so depth
  harmonizes with the brand. Flagship surfaces use `shadow-hero` / `shadow-lift`.

*Adopted from* Playful / Aaply / Duolingo: **big, friendly rounded cards.**

## Canvas & texture

- A subtle **dot-grid** (`bg-dot-grid`, low opacity via `.dots-layer`) adds
  playful texture to hero/section backdrops without noise. Calm brand gradients
  (`brand-hero`, `brand-soft`, `sunrise`, `aurora`) give depth in a single hue
  family rather than a rainbow wash.

*Adopted from* Playdate / Playful: **textured but calm canvas.** *Rejected:*
Playdate / Karl full-bleed illustration-only layouts — too sparse for an app
with this much functionality.

## Motion

Purposeful and gentle: `float-soft`, `bob` (hero mascots), `drift`
(background blobs), `pulse-soft` (ambient glow), `pop-in` (cards entering),
`shimmer-sweep` (one reward sweep across XP/streak bars), `wobble-once`
(a single decaying "not quite" nudge). No looping cartoon shakes, no rainbow
gradient animation.

---

## Per-reference decision log

| Reference | Adopt | Adapt | Reject |
|---|---|---|---|
| **Duolingo** (×2 dup) | Tactile 3D pill buttons; rounded display voice; big rounded cards; strong single accent | Rounded font → Nunito (Feather unavailable) | Copying its green brand / owl wholesale |
| **Playdate** | Textured, characterful canvas | Dot-grid as subtle texture | Full-bleed illustration-only, sparse layout |
| **Playful** | One strong accent + restrained set; big rounded cards; playful energy | World-hue supporting palette | Over-saturated rainbow everywhere |
| **Aaply** | Tactile buttons; generous card radii; premium calm | Teal-tinted soft shadows | Its specific palette |
| **Obviously / Zams** | Editorial confidence, whitespace | — | Serif display voice (wrong for kids) |
| **MotherDuck** | Clarity, restraint | — | Monospace display voice (wrong for kids) |
| **Karl** | Bold hero moments | Hero gradients + display-xl scale | Full-bleed art-only, minimal chrome |

## Where it's implemented

- `frontend/index.html` — Google Fonts (Inter + Nunito + Cairo).
- `frontend/tailwind.config.js` — color scales, world hues, radii (`card` 20px,
  `control` 14px, `blob`, `pill`), gradients, dot-grid, shadows, motion,
  `font-display` / `font-heading` → Nunito.
- `frontend/src/styles/index.css` — `.btn*` tactile buttons, `.btn-hero*`,
  `.card` / `.stat-card*`, `.world-tile`, `.card-playful`, `.chip-glass`,
  `.dots-layer`, `.display-xl/lg`, Arabic type rules, focus-visible safety net.

Because the language lives at the token + CSS-primitive layer, page-level markup
inherits it automatically — the identity transforms every screen at once.
