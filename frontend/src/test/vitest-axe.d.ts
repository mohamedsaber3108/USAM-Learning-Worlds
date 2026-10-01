import 'vitest'
import type { AxeMatchers } from 'vitest-axe/matchers'

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- module augmentation: these interfaces intentionally only extend AxeMatchers
  interface Assertion extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- module augmentation: these interfaces intentionally only extend AxeMatchers
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
