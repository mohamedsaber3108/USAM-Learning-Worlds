/** Reduced-motion helper. CSS already collapses animations globally via the
 * prefers-reduced-motion rule in index.css; this is for JS-driven motion
 * decisions (e.g. skipping scroll-reveal observers). */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}
