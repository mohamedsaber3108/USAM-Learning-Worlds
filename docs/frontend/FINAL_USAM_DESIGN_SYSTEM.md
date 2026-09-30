# FINAL USAM DESIGN SYSTEM + MOTION SYSTEM

> ONE system for the whole product. Primary brand direction (mandated):
> **WHITE · GREEN · BLACK** plus a small set of approved supporting tokens. NO
> new rainbow palette, NO per-feature arbitrary colors. Arabic and English are
> BOTH first-class (designed, not translated afterward). Accessible primitives
> underneath (Radix/headless), but USAM owns the visual identity — the default
> shadcn/Radix look is NOT the identity.

## Brand direction & why the legacy palette is realigned

The legacy `frontend/` used teal-primary + amber accent + gold secondary +
sky/grape/coral/bubble "world" hues — a rainbow that violates the mandated
WHITE/GREEN/BLACK direction and the "no arbitrary per-feature colors" rule.
Under Decision A we realign to the brand: **green is the single dominant brand
hue, on a white canvas, with near-black ink.** The legacy deep-teal
(`#1c5a4d`/`#12403a`) is retained as a *candidate green-800/900* since it reads
as a credible academic green and is already brand-adjacent; the warm
amber/coral/grape/bubble scales are DROPPED from the core system (celebration-
only accents may reference a single restrained warm token).

## Color tokens (semantic, not decorative)

| Token | Role | Value (proposed, to finalize against brand assets) |
| --- | --- | --- |
| `brand.green.50..900` | The one dominant brand hue (nav, primary actions, focus, links) | 50 `#eef6f0` … 500 `#1f7a4d` … 700 `#12513a` … 900 `#0a2b22` |
| `ink.900` / `ink.700` | Near-black headings + brand mark | `#0b0f0e` / `#1a201e` |
| `ink.600..400` | Body / secondary / muted text | grayscale ramp |
| `canvas.white` | Primary surface | `#ffffff` |
| `canvas.off` | Page background (subtle warm-neutral off-white) | `#fbfbf9` |
| `line` | Hairline borders (depth via contrast, not heavy shadow) | `#e7e9e6` |
| `success` | Correct / mastery only | green-family emerald `#10b981` |
| `warning` | Caution only | amber `#f59e0b` (single approved warm) |
| `error` | Errors only | red `#ef4444` |
| `focus` | Focus ring | brand green @ 2px, 3:1 min contrast |

Rules: green is dominant; white is the canvas; black/ink is type. Semantic
colors (success/warning/error) are functional, not decorative. NO feature owns
its own hue. Depth comes from surface contrast + hairline borders + whisper
shadows, not heavy drop shadows or gradients-per-page. A single restrained
celebration accent is permitted for reward moments only.

## Typography (EN + AR both designed)

| Style | EN family | AR family | Use |
| --- | --- | --- | --- |
| Display | rounded, credible sans (e.g. Nunito/Manrope) | a matched Arabic display (e.g. Rubik/Tajawal/IBM Plex Sans Arabic) | Hero, H1 |
| H1–H6 | same display ramp | matched AR ramp | Headings |
| Body / Small / Label | clean UI sans (Inter) | matched AR UI face | Content, UI |
| Numbers | tabular lining | tabular | Stats, scores, timers |
| Code | monospace | monospace (LTR-embedded within RTL) | Coding surfaces |

Arabic typography gets its own line-height/letter-spacing tuning (not a Latin
face forced to render Arabic). Font strategy: preload the two display faces,
subset, `font-display: swap`. Type scale is shared; only the family swaps by
`dir`.

## Spacing / radius / elevation / grid

- **Spacing**: 4px base scale (4/8/12/16/24/32/48/64).
- **Radius**: control `12–14px`, card `16–20px`, pill `9999px`. Friendly but not
  bubbly (age 8–14, not toddler).
- **Elevation**: whisper shadows for cards; reserve real elevation for
  hero/modal. Prefer hairline borders + surface contrast.
- **Grid/breakpoints**: `sm 360`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1440+`.
  Per-experience responsive design, not desktop-shrunk-to-mobile.
- **Focus**: visible 2px brand ring on every interactive element; never removed.

## Component system (own the visual, accessible underneath)

Primitives to build (as needed, not all at once): Button, IconButton, Input,
Select, Combobox, Search, Tabs, Nav, Menu, Dropdown, Modal, Drawer, Tooltip,
Popover, Toast, Card (only where semantically a card), Table, DataList,
Timeline, Stepper, Progress, EmptyState, ErrorState, Skeleton, Avatar,
CharacterState, Badge, StatusPill, Filters, Pagination, Command palette, Charts
(only where justified). Radix/headless for behavior + a11y; USAM tokens for
appearance. Do NOT card-ify everything; do NOT ship default Radix styling as the
identity.

## Age adaptation (COMPATIBILITY MODE)

Age bands display as product bands (7-9 / 10-12 / 13-15) via a labels layer over
the `AGE_8_9/AGE_10_11/AGE_12_14` enum (do not upgrade the enum). Adaptation is
expressed through DESIGN TOKENS (density, copy budget, motion multiplier, surface
complexity) keyed on band — a controlled set of knobs, not per-age forks of every
component. (Legacy `src/design/age-presentation.ts` is a design reference for the
knob set; reproduce cleanly, don't port.)

## Child-language rule (no backend jargon)

Never surface `MasteryState`, `AgeBand` enums, `executionPolicy`, `FSRS`,
`competencyId`, confidence decimals, etc. Map to kid words (new/learning/
practicing/getting strong/mastered; "keep it strong"; companion states). This is
a hard rule enforced in components + i18n.

---

# MOTION SYSTEM

Deliberate, systematic — not decorative chaos. Every animation supports
orientation, feedback, continuity, hierarchy, delight, or understanding.

## Timings & easing (tokens)

- Durations: `xfast 120ms`, `fast 180ms`, `base 240ms`, `slow 360ms`,
  `ambient 4–14s` (loops only for ambient decor).
- Easing: standard `cubic-bezier(0.16,1,0.3,1)` (ease-out-expo) for enters;
  `ease-in-out` for ambient; spring for playful resolution (single decaying
  oscillation, not a loop).

## Motion inventory (where it happens)

| Moment | Motion | Notes |
| --- | --- | --- |
| Route transition | brief fade/slide (`base`) | Must not delay tasks or break back-button; instant where speed matters |
| Section entrance / scroll reveal | fade-in-up once | No re-trigger spam |
| Hover / press / focus | subtle scale/elevation | Feedback only |
| Loading | skeleton + companion "warming up" | Honest, branded |
| Success (answer/mastery) | one shimmer sweep / gentle pop | Same-hue, one pass |
| Error ("not quite") | single decaying wobble | Not a shake loop |
| Progress update | shimmer sweep once on value change | |
| Modal / drawer | fade + slide | |
| Character reactions | idle/listening/thinking/speaking/encouraging/celebrating/error states | Companion state machine (keep the 15-state idea from baseline) |
| Celebration | restrained confetti, brand-anchored palette | Milestones only |
| Ambient decor | slow float/drift/pulse loops | Low amplitude, background only |

## Reduced motion (hard requirement)

`prefers-reduced-motion: reduce` → disable ambient loops, celebration bursts, and
non-essential transitions; keep instant state changes + essential feedback.
Never gate comprehension or task completion on motion.

## Route-transition architecture

One consistent transition layer (not per-page hand-rolled). Define where
transitions occur vs where instant nav is preferable (e.g. within the mission
player, instant; between top-level tabs, brief). Transitions must not cause
layout shift or make the product feel slow.
