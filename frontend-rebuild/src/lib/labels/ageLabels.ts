import type { AgeBand } from '@/lib/api/types'

/**
 * AGE MODEL — COMPATIBILITY MODE / MIGRATION PENDING.
 *
 * The backend persists `AGE_8_9 / AGE_10_11 / AGE_12_14`. The product presents
 * age bands as 7-9 / 10-12 / 13-15. This display layer maps enum → product band
 * so the raw enum is NEVER shown to a user. Do not "upgrade" the enum here; the
 * persistence model migration is a separate, deliberate backend change.
 */
export const AGE_BAND_LABEL: Record<AgeBand, string> = {
  AGE_8_9: '7–9',
  AGE_10_11: '10–12',
  AGE_12_14: '13–15',
}

/** Design-token knob set keyed on band (density/copy/motion), per design
 * system. A controlled set of knobs — not per-age component forks. */
export type AgePresentation = {
  band: AgeBand
  label: string
  density: 'roomy' | 'balanced' | 'compact'
  copyBudget: 'short' | 'medium' | 'full'
  motion: 'lively' | 'balanced' | 'calm'
}

export function agePresentation(band: AgeBand | null): AgePresentation {
  switch (band) {
    case 'AGE_8_9':
      return { band, label: AGE_BAND_LABEL[band], density: 'roomy', copyBudget: 'short', motion: 'lively' }
    case 'AGE_10_11':
      return { band, label: AGE_BAND_LABEL[band], density: 'balanced', copyBudget: 'medium', motion: 'balanced' }
    case 'AGE_12_14':
      return { band, label: AGE_BAND_LABEL[band], density: 'compact', copyBudget: 'full', motion: 'calm' }
    default:
      return { band: 'AGE_10_11', label: AGE_BAND_LABEL.AGE_10_11, density: 'balanced', copyBudget: 'medium', motion: 'balanced' }
  }
}
