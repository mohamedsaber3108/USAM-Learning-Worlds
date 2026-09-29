/**
 * Child-friendly mastery vocabulary (phase task #10).
 *
 * The backend MasteryState enum + raw confidence decimals (e.g. 0.72499997)
 * must NEVER be shown to a child. This is the single translation point from
 * backend state → child-facing language + visual band. Parents may see finer
 * detail elsewhere; children see these four friendly stages.
 *
 * Backend MasteryState: NOT_STARTED | INTRODUCED | EXPLORING | PRACTICING |
 * DEVELOPING | PROFICIENT | MASTERED  (see prisma schema).
 */
export type MasteryBand = 'new' | 'learning' | 'practicing' | 'strong' | 'mastered'

export interface MasteryLabel {
  band: MasteryBand
  /** i18n key under `mastery.band.*` for the child-facing word. */
  labelKey: string
  /** Fallback English word if i18n is unavailable. */
  fallback: string
  /** Tailwind tint classes for a chip/badge. */
  tint: string
  /** 0..100 progress hint for a bar/ring (coarse, never a raw decimal). */
  progress: number
}

const BY_STATE: Record<string, MasteryLabel> = {
  NOT_STARTED: { band: 'new', labelKey: 'mastery.band.new', fallback: 'Not started', tint: 'bg-slate-100 text-slate-600', progress: 0 },
  INTRODUCED: { band: 'learning', labelKey: 'mastery.band.learning', fallback: 'Learning', tint: 'bg-sky-50 text-sky-600', progress: 20 },
  EXPLORING: { band: 'learning', labelKey: 'mastery.band.learning', fallback: 'Learning', tint: 'bg-sky-50 text-sky-600', progress: 35 },
  PRACTICING: { band: 'practicing', labelKey: 'mastery.band.practicing', fallback: 'Practicing', tint: 'bg-primary-50 text-primary-600', progress: 55 },
  DEVELOPING: { band: 'practicing', labelKey: 'mastery.band.practicing', fallback: 'Practicing', tint: 'bg-primary-50 text-primary-600', progress: 65 },
  PROFICIENT: { band: 'strong', labelKey: 'mastery.band.strong', fallback: 'Getting strong', tint: 'bg-accent-50 text-accent-600', progress: 85 },
  MASTERED: { band: 'mastered', labelKey: 'mastery.band.mastered', fallback: 'Mastered', tint: 'bg-success-50 text-success-600', progress: 100 },
}

const DEFAULT: MasteryLabel = {
  band: 'new',
  labelKey: 'mastery.band.new',
  fallback: 'Not started',
  tint: 'bg-slate-100 text-slate-600',
  progress: 0,
}

/** Map a backend MasteryState string to the child-facing label. Never exposes decimals. */
export function masteryLabel(state: string | null | undefined): MasteryLabel {
  if (!state) return DEFAULT
  return BY_STATE[state] ?? DEFAULT
}
