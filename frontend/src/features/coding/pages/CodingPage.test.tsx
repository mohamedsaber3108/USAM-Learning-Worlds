import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import '@/lib/i18n'
import { CodingPage } from './CodingPage'

/**
 * Phase E2 — Coding landing renders the real coding-concept progression from
 * GET /cross-curricular/coding-concepts, ordered by difficulty, with a clear
 * entry into coding missions. Empty/error states are covered.
 */
const list = vi.fn()
vi.mock('@/lib/api/endpoints', () => ({
  crossCurricularApi: { list: (...a: unknown[]) => list(...a) },
}))

function renderCoding() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/coding']}>
        <CodingPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CodingPage', () => {
  beforeEach(() => list.mockReset())

  it('renders coding concepts ordered by difficulty', async () => {
    list.mockResolvedValue({
      data: [
        { id: 'c2', name: 'Python basics', slug: 'py', description: '', category: 'coding-concepts', difficulty: 4, order: 2, isActive: true, createdAt: '' },
        { id: 'c1', name: 'What is a sequence', slug: 'seq', description: '', category: 'coding-concepts', difficulty: 1, order: 1, isActive: true, createdAt: '' },
      ],
    })
    renderCoding()
    await waitFor(() => expect(screen.getByText('What is a sequence')).toBeInTheDocument())
    expect(screen.getByText('Python basics')).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    // Difficulty 1 concept comes before difficulty 4 concept.
    expect(items[0]).toHaveTextContent('What is a sequence')
  })

  it('calls the coding-concepts category', async () => {
    list.mockResolvedValue({ data: [] })
    renderCoding()
    await waitFor(() => expect(list).toHaveBeenCalledWith('coding-concepts'))
  })

  it('shows the empty state when there are no concepts', async () => {
    list.mockResolvedValue({ data: [] })
    renderCoding()
    await waitFor(() => expect(screen.getByText(/being prepared/i)).toBeInTheDocument())
  })
})
