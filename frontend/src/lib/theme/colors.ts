/**
 * Hex mirrors of tailwind.config.js design tokens, for the handful of
 * consumers that can't take Tailwind classes (react-circular-progressbar's
 * inline `styles` prop, framer-motion confetti particle colors, etc).
 *
 * IMPORTANT: keep these values in lockstep with tailwind.config.js `theme.
 * extend.colors`. Do not hand-roll new hex literals in feature code — import
 * from here instead so a token change only has one other place to update.
 */
export const THEME_HEX = {
  primary50: '#eef5f3',
  primary100: '#d4e7e2',
  primary400: '#458d7e',
  primary600: '#1c5a4d',
  primary900: '#0a2926',
  accent500: '#d96a2c',
  secondary500: '#cf9316',
  success500: '#10b981',
  success600: '#059669',
  warning500: '#f59e0b',
  error500: '#ef4444',
  slate900: '#0b0f0e',
  slate950: '#0a2926',
} as const

/** Cosmetic-shop equipped avatar-border theme accents — deliberately a
 * separate small palette (orange/pink) from the brand accent/secondary
 * above, since these represent purchasable cosmetic variety rather than
 * core brand color. Values match Tailwind's default orange-600/pink-600
 * so the `bg-orange-*`/`text-pink-*` utility classes used alongside these
 * inline hex values (react-circular-progressbar etc.) stay visually
 * identical. */
export const COSMETIC_THEME_HEX = {
  'theme-indigo': THEME_HEX.primary600,
  'theme-orange': '#c05622',
  'theme-pink': '#db2777',
} as const

/** Palette used for decorative confetti bursts — deliberately more varied
 * than the strict UI palette (celebration moments are allowed a wider,
 * playful accent range), but still anchored to real token hues rather than
 * arbitrary picks. */
export const CONFETTI_PALETTE = [
  THEME_HEX.primary600,
  THEME_HEX.secondary500,
  THEME_HEX.accent500,
  THEME_HEX.success500,
  '#2b7061', // teal-500 — brand-anchored celebration accent
  '#06b6d4', // cyan-500 — celebration-only accent, not a UI token
  '#e3ab30', // gold-400 — celebration-only accent, not a UI token
]
