/**
 * Design token catalogue.
 *
 * The tokens themselves live in `src/styles.css` as CSS custom properties so
 * that theming, age modes and future locales can override them without a
 * rebuild. This module is the *typed index* of those tokens: it is what the
 * documentation surface renders, and what product code should reference when
 * it needs a token name at runtime (charts, canvas, inline SVG).
 *
 * Rule: never hardcode a raw colour, shadow or duration in a component.
 */

export interface TokenEntry {
  /** CSS custom property name, e.g. `--primary`. */
  name: string;
  /** Tailwind utility example, e.g. `bg-primary`. */
  usage: string;
  description: string;
}

export interface TokenGroup {
  id: string;
  title: string;
  description: string;
  tokens: TokenEntry[];
}

export const COLOR_TOKENS: TokenGroup = {
  id: "color",
  title: "Semantic colour",
  description:
    "Every colour is semantic. Components never name a hue — they name a role, so age modes, light/dark and future themes can re-map the palette safely.",
  tokens: [
    { name: "--background", usage: "bg-background", description: "App canvas." },
    { name: "--foreground", usage: "text-foreground", description: "Primary reading colour." },
    { name: "--surface", usage: "bg-surface", description: "Panels and cards." },
    { name: "--surface-raised", usage: "bg-surface-raised", description: "Nested/hovered surface." },
    { name: "--primary", usage: "bg-primary", description: "Warm amber — action and progress." },
    { name: "--secondary", usage: "bg-secondary", description: "Teal — knowledge and calm." },
    { name: "--accent", usage: "bg-accent", description: "Magenta — creativity and celebration." },
    { name: "--muted-foreground", usage: "text-muted-foreground", description: "Secondary copy." },
    { name: "--success", usage: "bg-success", description: "Mastery achieved, safe state." },
    { name: "--warning", usage: "bg-warning", description: "Needs attention, watch signal." },
    { name: "--destructive", usage: "bg-destructive", description: "Blocking error or stop." },
    { name: "--border", usage: "border-border", description: "Hairline separation." },
    { name: "--ring", usage: "outline-ring", description: "Focus indicator — never removed." },
  ],
};

export const TYPOGRAPHY_TOKENS: TokenGroup = {
  id: "typography",
  title: "Typography",
  description:
    "Outfit for display, Figtree for reading. Sizes are tokens so each age mode can shift the whole scale at once instead of components choosing sizes.",
  tokens: [
    { name: "--font-display", usage: "font-display", description: "Outfit — titles, characters." },
    { name: "--font-sans", usage: "font-sans", description: "Figtree — body and UI." },
    { name: "--type-display-1", usage: "text-display-1", description: "Page hero title." },
    { name: "--type-display-2", usage: "text-display-2", description: "Section hero." },
    { name: "--type-heading", usage: "text-heading", description: "Card and panel headings." },
    { name: "--type-body-lg", usage: "text-body-lg", description: "Primary reading size." },
    { name: "--ui-scale", usage: "—", description: "Global root size multiplier per age mode." },
  ],
};

export const SPACING_TOKENS: TokenGroup = {
  id: "spacing",
  title: "Spacing & radius",
  description:
    "A 4px base grid with a density multiplier. Younger modes breathe more; older modes pack more information into the same frame.",
  tokens: [
    { name: "--radius", usage: "rounded-lg", description: "Base corner radius per age mode." },
    { name: "--content-density", usage: "—", description: "Density multiplier (1.15 → 0.9)." },
    { name: "space-1 … space-16", usage: "p-4 gap-6", description: "4px-based spacing scale." },
  ],
};

export const MOTION_TOKENS: TokenGroup = {
  id: "motion",
  title: "Motion",
  description:
    "Motion communicates state and progress — never decoration for its own sake. Intensity is scaled per age mode and fully disabled under prefers-reduced-motion.",
  tokens: [
    { name: "--duration-instant", usage: "90ms", description: "Press feedback." },
    { name: "--duration-fast", usage: "160ms", description: "Hover, focus, toggles." },
    { name: "--duration-base", usage: "260ms", description: "Entrance, card reveal." },
    { name: "--duration-slow", usage: "480ms", description: "Celebration, world transitions." },
    { name: "--ease-entrance", usage: "ease", description: "Decelerating entrance curve." },
    { name: "--ease-spring", usage: "ease", description: "Overshoot for celebration." },
    { name: "--motion-intensity", usage: "—", description: "Age multiplier: 1.25 / 1 / 0.65." },
  ],
};

export const ELEVATION_TOKENS: TokenGroup = {
  id: "elevation",
  title: "Elevation",
  description:
    "Four steps of depth plus a glow used only for the AI companion and live states, so 'the AI is present' reads instantly.",
  tokens: [
    { name: "--elevation-0", usage: "elevation-0", description: "Flat, inline with the canvas." },
    { name: "--elevation-1", usage: "elevation-1", description: "Subtle lift — list rows." },
    { name: "--elevation-2", usage: "elevation-2", description: "Panels and cards." },
    { name: "--elevation-3", usage: "elevation-3", description: "Overlays, dialogs, palette." },
    { name: "--elevation-glow", usage: "elevation-glow", description: "Live AI / active mission." },
  ],
};

export const TOKEN_GROUPS: TokenGroup[] = [
  COLOR_TOKENS,
  TYPOGRAPHY_TOKENS,
  SPACING_TOKENS,
  MOTION_TOKENS,
  ELEVATION_TOKENS,
];

/** Named motion presets components can reference by intent, not by keyframe. */
export const MOTION_PRESETS = {
  enter: "animate-rise",
  float: "animate-float",
  breathe: "animate-breathe",
  think: "animate-think",
  listen: "animate-pulse-ring",
  celebrate: "animate-bounce-soft",
  sparkle: "animate-sparkle",
  confused: "animate-wobble",
  idle: "animate-sway",
  shimmer: "animate-shimmer",
} as const;

export type MotionPreset = keyof typeof MOTION_PRESETS;
