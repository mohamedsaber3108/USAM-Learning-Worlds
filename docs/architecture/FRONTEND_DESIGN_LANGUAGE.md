# USAM for Kids — Frontend Design Language

Single source of truth for the USAM for Kids visual system. Produced by studying
**24 design-reference briefs** across two libraries and synthesizing their
*convergent craft principles* into a coherent, kid-appropriate USAM identity —
not by copying any one product.

> Guiding principle: **synthesize convergent craft into a USAM identity, keep the
> teal brand.** Deep-teal `primary` stays the dominant, credible brand color for
> an academic "learning worlds" product for ages 8–14. Playful energy layers
> around that anchor.

---

## The two reference libraries

**`designs/` (14 refs) — mostly adult / editorial / SaaS.** Apple, Linear,
Ciridae, Hyperstudio, Subframe, Increase, Wispr Flow, Caldera, Dayos, SVZ,
Agence Foudre, Dylanbrouwer, plus MindMarket. Dark or monochrome canvases,
brutalist/condensed display type, crypto/fintech/agency surfaces. **Not adopted
wholesale** (wrong register for kids) — mined for *craft*.

**`kiddddds/` (10 refs) — kid-appropriate.** Duolingo, Playdate, Playful, Aaply,
MotherDuck, Obviously/Zams, Karl. Playful, rounded, character-led.

**Directly kid-relevant across both:** MindMarket (cream canvas, storybook
character illustration, single green accent, big 50px rounded cards, floating
pill nav — explicitly Duolingo/Headspace-adjacent) and Slush (pastel sticker
universe, fully-rounded pills, playful multi-color, hand-cut outline feel).

## What ~all 24 references agree on (the convergent principles we adopt)

1. **Flat depth via surface-color contrast + hairline borders — NOT heavy drop
   shadows.** Apple, Linear, Ciridae, Hyperstudio, Subframe, Increase, MindMarket,
   Wispr, Caldera, Slush, Dayos all state this explicitly. → We lightened all
   everyday shadows to a whisper and lean on a crisp hairline card border + a
   warm canvas/white contrast. Real elevation (`hero`/`lift`) is reserved for the
   one or two flagship surfaces per screen.
2. **ONE strong accent, used sparingly as a signal — never as wallpaper.** →
   Teal `primary` for brand/actions; amber `accent` as the single warm
   counterpoint (streaks, one CTA). World hues are decoration only.
3. **Generous, consistent radii.** → `card` 20px, `control` 14px, `blob` 28px,
   `pill` full. No sharp corners on interactive elements.
4. **Type hierarchy through scale, not weight-chaos.** → Nunito display + Inter
   body + Cairo Arabic; a disciplined scale carries hierarchy.
5. **Tactile / pill controls.** → Fully-rounded tactile 3D buttons.

## What the kid-relevant refs add (adopted)

- **Warm off-white / cream canvas — never clinical cool gray.** MindMarket
  `#f5f1e4`, Wispr `#ffffeb`, Subframe `#fafafa`. → USAM `surface` scale nudged
  warm (`#fbfaf7 / #f5f2ec / #e9e4da / #d8d2c5`) so white cards sit on a soft,
  sunlit page instead of a clinical gray one.
- **Character illustration leads.** The CharacterFace mascots are the hero of
  onboarding, landing, dashboard, and empty/error states.
- **Big friendly rounded cards + floating pill nav.**
- **Playful multi-color as decoration** (sky / grape / coral / bubble world
  hues), never competing with teal for the brand role.

## What we reject (per-reference)

- Dark/void canvases (Linear `#08090a`, Ciridae, Hyperstudio, SVZ) — wrong for a
  bright kids' product.
- Brutalist/condensed monument display (Dayos 130px, Caldera 189px, Slush 640px,
  Agence Foudre Beni 900, Dylanbrouwer ABC Gravity) — too aggressive for 8–14.
- Monospace or serif as the primary voice (MotherDuck, Increase mono; Zams,
  Wispr Garamond, Subframe Instrument Serif) — wrong for kids.
- Heavy tinted drop shadows (our own earlier build) — contradicted by every ref.
- Any single product copied wholesale.

---

## The USAM identity in one paragraph

A warm, sunlit off-white canvas; deep-teal brand anchor; one amber accent used
sparingly; a small set of playful per-world hues; crisp hairline borders and
whisper-light shadows (flat depth, per every reference); generously rounded
cards; tactile 3D pill buttons; a rounded friendly display voice (Nunito); and
character mascots leading every key surface. Premium and joyful, not clinical,
not a toy, not a SaaS dashboard.

## Tokens (where it lives)

- `frontend/index.html` — Google Fonts: Inter + Nunito + Cairo.
- `frontend/tailwind.config.js` — teal `primary`; amber `accent`; honey
  `secondary`; world hues sky/grape/coral/bubble; **warm `surface` scale**;
  radii (`card` 20, `control` 14, `blob` 28, `pill`); gradients
  (`brand-hero`, `brand-soft`, `sunrise`, `aurora`); dot-grid; **flattened
  `soft*` shadows** + reserved `hero`/`lift`; motion; Nunito `font-display` /
  `font-heading`.
- `frontend/src/styles/index.css` — tactile `.btn*` / `.btn-hero*`; `.card`
  (hairline-border-led) / `.stat-card*`; `.world-tile`; `.card-playful`;
  `.chip-glass`; `.dots-layer`; `.display-xl/lg`; Arabic type rules;
  focus-visible safety net.

Because the language lives at the token + CSS-primitive layer, every page
inherits it automatically — the identity transforms all screens at once.

## Per-reference decision log (24)

| Reference | Library | Adopt (craft) | Reject |
|---|---|---|---|
| Duolingo ×2 | kiddddds | Tactile 3D pills, rounded display, big cards, single accent | Green brand/owl |
| Playdate | kiddddds | Textured characterful canvas (dot-grid) | Illustration-only sparse layout |
| Playful | kiddddds | One accent + restrained set, playful cards | Rainbow everywhere |
| Aaply | kiddddds | Tactile buttons, generous radii, premium calm | Its palette |
| MotherDuck | kiddddds | Clarity, restraint | Mono display voice |
| Obviously/Zams | kiddddds | Editorial confidence, whitespace | Serif display voice |
| Karl | kiddddds | Bold hero moments | Art-only minimal chrome |
| MindMarket | designs | **Warm cream canvas, char illustration, single accent, big rounded cards, floating pill nav, flat depth** | Inter-only 140px display |
| Slush | designs | Fully-rounded pills, playful multi-color, flat depth | 640px crushed type, black outlines everywhere |
| Apple | designs | Restraint, one accent, flat (no card shadow), pill buttons, type tracking | Mono-blue system, sparse photography model |
| Linear | designs | Flat depth via hairline borders, single accent signal, disciplined type | Dark void canvas, acid-lime |
| Ciridae | designs | Flat via tonal contrast, pill controls | Dark void, uppercase-condensed, ghost-only |
| Hyperstudio | designs | Hairline-border structure, no shadows | Obsidian canvas, weight-400 monument |
| Subframe | designs | **Warm `#fafafa` canvas, hairline dividers, flat cards, soft radii** | Zero-color monochrome, serif punctuation |
| Increase | designs | Single accent as signal, warm off-white, restraint | Navy institutional tone, mono |
| Wispr Flow | designs | **Cream canvas, flat border-driven cards, single accent** | Serif display, dark chambers |
| Caldera | designs | Flat (no shadow), generous radii, one accent | Volcanic orange, 189px condensed |
| Dayos | designs | Warm canvas, big radii, flat | Brutalist uppercase, mint/yellow |
| SVZ | designs | Type-led hierarchy, single accent punctuation | Dark void, red, ornamental serif |
| Agence Foudre | designs | Whitespace, one accent | Magenta, 230px Beni display |
| Dylanbrouwer | designs | Weighted motion easings, single accent dot | Dark hero, ABC Gravity monument |
