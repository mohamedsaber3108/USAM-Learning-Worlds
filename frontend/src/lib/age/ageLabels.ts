/**
 * Product-facing age band labels (task #14).
 *
 * The backend `AgeBand` enum values — `AGE_8_9`, `AGE_10_11`, `AGE_12_14` — are
 * STABLE INTERNAL IDENTIFIERS. Per plans-local/01_PRODUCT_NORTH_STAR.md they map
 * to the product-facing developmental bands the Bible defines:
 *
 *   AGE_8_9   → 7–9   (early readers)
 *   AGE_10_11 → 10–12 (building independence)
 *   AGE_12_14 → 13–15 (self-directed)
 *
 * Renaming the enum would be a catastrophic breaking migration (Postgres enum +
 * every learner record + ~400 seed/DTO references). Instead this is the single
 * translation point from enum → the range shown to children and parents. NEVER
 * render the raw enum's own numbers (8-9/10-11/12-14) to a user.
 */

/** The three canonical age-band enum values. */
export const AGE_BANDS = ['AGE_8_9', 'AGE_10_11', 'AGE_12_14'] as const
export type AgeBandValue = (typeof AGE_BANDS)[number]

/** Product-facing numeric range per enum value (no "Age"/"Ages" prefix). */
const RANGE: Record<string, string> = {
  AGE_8_9: '7-9',
  AGE_10_11: '10-12',
  AGE_12_14: '13-15',
}

/** The bare product-facing range, e.g. "7-9". Falls back to the raw value. */
export function ageRange(band: string | null | undefined): string {
  if (!band) return ''
  return RANGE[band] ?? band
}

/**
 * A localized "Ages 7-9" style label. Pass an i18n `t` and a key prefix that
 * resolves to a template with `{{range}}` (e.g. `t('age.label', { range })`),
 * or use `ageRange` directly for the bare range.
 */
export function isAgeBand(value: unknown): value is AgeBandValue {
  return value === 'AGE_8_9' || value === 'AGE_10_11' || value === 'AGE_12_14'
}
