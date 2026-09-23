import { describe, it, expect, vi, beforeEach } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '@/test/renderWithProviders'
import '@/lib/i18n'
import { MissionCompletePage } from '@/features/missions/pages/MissionCompletePage'
import { PlansPage } from '@/features/billing/pages/PlansPage'
import { MyPortfolioPage } from '@/features/projects/pages/MyPortfolioPage'

/**
 * Accessibility gate (G-7, mandate §45). Runs axe-core against the pages built
 * during the reconstruction. These assert there are no *automatically
 * detectable* WCAG violations (colour contrast is checked visually elsewhere,
 * since jsdom has no layout/computed style). Full WCAG conformance still
 * requires manual testing with assistive technology and expert review — this
 * catches the machine-detectable regressions and holds the line going forward.
 */

// Mock the API clients the pages call so render is deterministic and offline.
vi.mock('@/lib/api/endpoints', () => ({
  entitlementsApi: {
    listPlans: () =>
      Promise.resolve({
        data: [
          { id: '1', code: 'FREE', name: 'Free', description: 'Try it', priceCents: 0, currency: 'USD', interval: 'MONTH', features: { worlds: 'sampler', missionsPerDay: 3, maxLearners: 1, aiTutor: false, voice: false, credentials: false, portfolioExport: false, parentReports: 'basic' }, isActive: true },
          { id: '2', code: 'FAMILY', name: 'Family', description: 'Everything', priceCents: 1699, currency: 'USD', interval: 'MONTH', features: { worlds: 'all', missionsPerDay: null, maxLearners: 4, aiTutor: true, voice: true, credentials: true, portfolioExport: true, parentReports: 'full' }, isActive: true },
        ],
      }),
    getMine: () => Promise.resolve({ data: { plan: { code: 'FREE' }, features: {} } }),
    subscribe: vi.fn(),
    cancel: vi.fn(),
  },
  projectsApi: { getMy: () => Promise.resolve({ data: [] }) },
  masteryApi: { getByDomain: () => Promise.resolve({ data: [] }) },
  credentialsApi: { getMine: () => Promise.resolve({ data: [] }) },
}))

describe('accessibility (axe) — reconstruction pages', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('lang', 'en')
    document.documentElement.setAttribute('dir', 'ltr')
  })

  it('MissionCompletePage has no detectable a11y violations', async () => {
    const { container } = renderWithProviders(<MissionCompletePage />, {
      route: '/missions/complete',
      state: {
        result: { outcome: { finalScore: 90, passed: true, xp: { amount: 95, leveledUp: false } } },
        runId: 'r1',
      },
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  }, 30000)

  it('PlansPage has no detectable a11y violations', async () => {
    const { container, findByText } = renderWithProviders(<PlansPage />, { route: '/plans' })
    await findByText('Family')
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  }, 30000)

  it('MyPortfolioPage has no detectable a11y violations', async () => {
    const { container } = renderWithProviders(<MyPortfolioPage />, { route: '/portfolio' })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  }, 30000)
})
