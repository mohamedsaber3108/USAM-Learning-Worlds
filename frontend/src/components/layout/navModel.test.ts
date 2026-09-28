import { describe, it, expect } from 'vitest'
import { ageBandToNavBand, getNavModel } from './navModel'

/**
 * Phase C — proves navigation is genuinely age-adaptive (destinations change by
 * band), not just icon sizing, and that the parent shell is distinct. This is
 * the behavioral contract the AppShell renders from.
 */
describe('navModel (age-adaptive navigation)', () => {
  it('maps backend age bands to nav bands', () => {
    expect(ageBandToNavBand('AGE_8_9')).toBe('young')
    expect(ageBandToNavBand('AGE_10_11')).toBe('mid')
    expect(ageBandToNavBand('AGE_12_14')).toBe('older')
    expect(ageBandToNavBand(undefined)).toBe('mid')
  })

  it('young band is minimal, voice-forward, no search', () => {
    const m = getNavModel('young')
    const keys = m.primary.map((e) => e.key)
    expect(keys).toEqual(['home', 'learn', 'play', 'voiceChat', 'profile'])
    expect(keys).not.toContain('worlds') // worlds is in the More drawer for young
    expect(m.showSearch).toBe(false)
  })

  it('mid band adds worlds + projects to the primary bar', () => {
    const keys = getNavModel('mid').primary.map((e) => e.key)
    expect(keys).toContain('worlds')
    expect(keys).toContain('projects')
    expect(getNavModel('mid').showSearch).toBe(false)
  })

  it('older band is fuller and enables search', () => {
    const m = getNavModel('older')
    expect(m.primary.map((e) => e.key)).toContain('worlds')
    expect(m.showSearch).toBe(true)
  })

  it('parent shell is distinct from any child shell', () => {
    const parent = getNavModel('parent')
    const parentKeys = parent.primary.map((e) => e.key)
    expect(parentKeys).toContain('parentDashboard')
    // Parent nav must NOT expose child play/learn destinations.
    expect(parentKeys).not.toContain('play')
    expect(parentKeys).not.toContain('learn')
  })

  it('active-match works for the home route', () => {
    const home = getNavModel('mid').primary.find((e) => e.key === 'home')!
    expect(home.match('/dashboard')).toBe(true)
    expect(home.match('/')).toBe(true)
    expect(home.match('/missions')).toBe(false)
  })
})
