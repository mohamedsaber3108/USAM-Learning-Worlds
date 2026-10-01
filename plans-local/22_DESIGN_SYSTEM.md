# 22 — DESIGN SYSTEM

> The design system is NOT greenfield. Root `src/design/` already defines a
> mature, semantic, age-adaptive system. This doc ADOPTS and documents it as the
> authority. One design system, three age presentations.

Date: 2026-09-30

---

## 1. Authority: `src/design/` (adopt, don't reinvent)

- `src/design/tokens.ts` — typed index of CSS-custom-property tokens (the values
  live in `src/styles.css` so themes/age modes/locales override without rebuild).
- `src/design/age-presentation.ts` — the three-mode presentation contract.
- `src/design/AgePresentationProvider.tsx` — runtime provider.
- `src/design/character.ts` — character visual tokens.

**Core rule (enforced): components NEVER hardcode a raw colour, shadow, size, or
duration — they reference a semantic token.**

## 2. Semantic tokens (from tokens.ts)

- **Colour (role, not hue):** `--background --foreground --surface
  --surface-raised --primary(warm amber: action/progress) --secondary(teal:
  knowledge/calm) --accent(magenta: creativity/celebration) --muted-foreground
  --success --warning --destructive --border --ring(focus, never removed)`.
- **Type:** Outfit (display) + Figtree (reading); size tokens `--type-display-1/2
  --type-heading --type-body-lg`; `--ui-scale` global multiplier per age mode.
- **Spacing/radius:** 4px grid; `--radius`; `--content-density` (1.15→0.9).
- **Motion:** durations instant/fast/base/slow; eases entrance/spring;
  `--motion-intensity` (1.25/1/0.65); disabled under prefers-reduced-motion.
  Named presets (enter/float/breathe/think/listen/celebrate/sparkle/confused/
  idle/shimmer) referenced by INTENT.
- **Elevation:** 0–3 + `--elevation-glow` (reserved for live AI / active mission).

## 3. PALETTE DECISION (owner-visible)

The existing system is **amber / teal / magenta** (semantic). The superseded
frontend-rebuild era used WHITE/GREEN/BLACK. Since this is a product-first reset
and root `src/` is the likely target (02 §A), the existing amber/teal/magenta
semantic palette is the DEFAULT authority. **If the owner wants WHITE/GREEN/BLACK,
it is a token-value change in `styles.css` only** (semantic names stay) — no
component rewrite. Flagged as an owner palette decision, not silently changed.

## 4. Age presentation = ONE system, THREE modes (age-presentation.ts)

Components read NAMED KNOBS from the presentation contract — never branch on age
directly. Modes:

| Mode | Band | Density | Companion | Coding surface | Voice-first | Gamification |
|---|---|---|---|---|---|---|
| Explorer (A) | 8–9 | airy, 2-col, hierarchy 1, copy ≤90 | hero, full-body | visual-blocks | yes | prominent |
| Creator (B) | 10–11 | balanced, 2-col, hierarchy 2, copy ≤160 | sidekick, bust | blocks+script | yes | supportive |
| Pathfinder (C) | 12–14 | compact, 3-col, hierarchy 3, copy ≤320 | ambient, avatar | code-editor | no | minimal |

Plus per-mode: title/body classes, motion multiplier, saturation, nav complexity
(`maxPrimaryNavItems` 5/7/9), interaction complexity, show streaks/points.
`resolveCopy(variants, mode)` picks age-appropriate copy. This directly
implements the 07 age contract — reuse it.

## 5. Accessibility (baseline)

Focus ring token never removed; reduced-motion fully disables motion; semantic
colour supports contrast theming; tap-target scale per mode. Full WCAG validation
needs manual AT testing (documented limitation — 46).

## 6. Component library

Root `src/` uses Radix primitives + a `src/components` set + a `/design-system`
route (living catalogue). Rebuild reuses these; no second component system. The
superseded frontend-rebuild's hand-rolled primitives are REFERENCE ONLY.

## 7. Rules for the rebuild

- Use `src/design` tokens + `AgePresentationProvider`; never hardcode.
- Every surface declares 3 copy variants (or a default) for the age modes.
- EN/AR + RTL via logical properties; i18n all strings.
- Motion by preset + intent; respect reduced-motion.
