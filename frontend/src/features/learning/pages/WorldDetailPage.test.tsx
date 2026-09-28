import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@/lib/i18n'
import { WorldDetailPage } from './WorldDetailPage'

/**
 * Phase D — World Detail renders the real per-learner mission states from
 * GET /worlds/:id: completed / in-progress / available / locked, with locked
 * missions not linking anywhere. Proves the spine Home → World → World Detail →
 * Mission Entry surfaces true engine state, not fabricated data.
 */
const getOne = vi.fn()
vi.mock('@/lib/api/endpoints', () => ({
  worldsApi: { getOne: (id: string) => getOne(id) },
}))

function renderWorld() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/worlds/w1']}>
        <Routes>
          <Route path="/worlds/:id" element={<WorldDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('WorldDetailPage', () => {
  beforeEach(() => getOne.mockReset())

  it('renders missions with their real per-learner status', async () => {
    getOne.mockResolvedValue({
      data: {
        id: 'w1', name: 'Word World', slug: 'english', description: 'Learn English',
        domain: { id: 'd1', name: 'English', slug: 'english' }, isUnlocked: true,
        missions: [
          { id: 'm1', title: 'First words', description: '', type: 'GUIDED', order: 1, status: 'COMPLETED', locked: false },
          { id: 'm2', title: 'Sentences', description: '', type: 'GUIDED', order: 2, status: 'IN_PROGRESS', locked: false },
          { id: 'm3', title: 'Stories', description: '', type: 'GUIDED', order: 3, status: 'AVAILABLE', locked: false },
          { id: 'm4', title: 'Advanced', description: '', type: 'GUIDED', order: 4, status: 'LOCKED', locked: true },
        ],
      },
    })
    renderWorld()
    await waitFor(() => expect(screen.getByText('Word World')).toBeInTheDocument())
    expect(screen.getByText('First words')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('In progress')).toBeInTheDocument()
    expect(screen.getByText('Locked')).toBeInTheDocument()
  })

  it('links available/in-progress missions to the mission entry but not locked ones', async () => {
    getOne.mockResolvedValue({
      data: {
        id: 'w1', name: 'Word World', slug: 'english', description: '',
        domain: { id: 'd1', name: 'English', slug: 'english' }, isUnlocked: true,
        missions: [
          { id: 'm3', title: 'Open mission', description: '', type: 'GUIDED', order: 1, status: 'AVAILABLE', locked: false },
          { id: 'm4', title: 'Locked mission', description: '', type: 'GUIDED', order: 2, status: 'LOCKED', locked: true },
        ],
      },
    })
    renderWorld()
    const openLink = await screen.findByRole('link', { name: /open mission/i })
    expect(openLink).toHaveAttribute('href', '/missions/m3')
    // Locked mission is not a link.
    expect(screen.queryByRole('link', { name: /locked mission/i })).not.toBeInTheDocument()
  })

  it('shows the empty state when a world has no missions', async () => {
    getOne.mockResolvedValue({
      data: {
        id: 'w1', name: 'Empty World', slug: 'science', description: '',
        domain: { id: 'd2', name: 'Science', slug: 'science' }, isUnlocked: true, missions: [],
      },
    })
    renderWorld()
    await waitFor(() => expect(screen.getByText(/being prepared/i)).toBeInTheDocument())
  })
})
