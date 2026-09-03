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
  primary50: '#eef1ff',
  primary100: '#e0e4ff',
  primary400: '#8a86fb',
  primary600: '#4f46e5',
  primary900: '#2b2880',
  accent500: '#ff6b57',
  secondary500: '#f0921a',
  success500: '#10b981',
  success600: '#059669',
  warning500: '#f59e0b',
  error500: '#ef4444',
  slate900: '#0f172a',
  slate950: '#1e1b4b',
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
  'theme-orange': '#ea580c',
  'theme-pink': '#db2777',
} as const

/** Palette used for decorative confetti bursts — deliberately more varied
 * than the strict UI palette (celebration moments are allowed a wider,
 * playful accent range), but still anchored to real token hues rather than
 * arbitrary picks. */
export const CONFETTI_PALETTE = [
  THEME_HEX.primary600,
  THEME_HEX.warning500,
  THEME_HEX.success500,
  THEME_HEX.error500,
  '#8b5cf6', // violet-500 — celebration-only accent, not a UI token
  '#06b6d4', // cyan-500 — celebration-only accent, not a UI token
  '#ec4899', // pink-500 — celebration-only accent, not a UI token
]
