import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@/lib/i18n'
import { setLanguage } from '@/lib/i18n'
import { CommunityPage } from '@/features/learner/CommunityPage'
import { apiClient } from '@/lib/api/client'

/**
 * Regression test for a real production bug found via authenticated live
 * E2E (frontend/scripts/live-verify.mjs against https://kids.usamif.com/):
 * CommunityPage threw `TypeError: a.map is not a function` because
 * GET /community/feed returns a wrapped `{ projects, total }` object
 * (community.service.ts getCommunityFeed), not a bare array. This test
 * mocks the real wrapped shape and asserts the page renders the project
 * titles without throwing — pinning the fix so a future change can't
 * silently reintroduce the bare-array assumption.
 */
vi.mock('@/lib/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
  tokenStore: { get access() { return null }, get refresh() { return null }, set: vi.fn(), clear: vi.fn() },
  setOnAuthExpired: vi.fn(),
}))

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CommunityPage — real wrapped-response contract (regression)', () => {
  beforeEach(() => {
    setLanguage('en')
    vi.mocked(apiClient.get).mockReset()
  })

  it('renders project titles from the real { projects, total } shape without throwing', async () => {
    // FIX (2026-10-02, round 2): CommunityPage now also fires /trending and
    // /stats queries on mount (real gap-closing, see component header).
    // Dispatch the mock by URL path rather than relying on call order, so
    // this stays robust regardless of which query's effect fires first.
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/community/feed') {
        return Promise.resolve({
          data: {
            projects: [
              {
                id: 'p1',
                title: 'My Robot Pet',
                description: 'A friendly robot simulator',
                skills: ['coding'],
                learner: { id: 'l1', displayName: 'Kid One' },
              },
            ],
            total: 1,
          },
        })
      }
      if (url === '/community/stats') {
        return Promise.resolve({ data: { totalProjects: 1, totalLearners: 1, recentProjects: 0 } })
      }
      if (url === '/community/trending') {
        return Promise.resolve({ data: [] })
      }
      return Promise.resolve({ data: null })
    })

    wrap(<CommunityPage />)

    await waitFor(() => expect(screen.getByText('My Robot Pet')).toBeInTheDocument())
    expect(screen.getByText('Kid One')).toBeInTheDocument()
  })

  it('renders an honest empty state when there are zero showcased projects', async () => {
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/community/feed') return Promise.resolve({ data: { projects: [], total: 0 } })
      return Promise.resolve({ data: null })
    })

    wrap(<CommunityPage />)

    await waitFor(() => expect(screen.getByText(/nothing|empty|no /i)).toBeInTheDocument())
  })
})
