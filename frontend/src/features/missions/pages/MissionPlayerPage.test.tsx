import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@/lib/i18n'
import { MissionPlayerPage } from './MissionPlayerPage'

/**
 * Locks in the Learn-step slice (G-1, commit 46c0cc1): a mission activity with
 * teachable content shows the Learn card BEFORE practice, and "I'm ready"
 * reveals the practice question. Also proves the self-hiding contract: an
 * activity with nothing to teach goes straight to practice.
 */

// Mock the API client used by the player so no network is hit.
const getRun = vi.fn()
vi.mock('@/lib/api/endpoints', () => ({
  missionsApi: {
    getRun: (runId: string) => getRun(runId),
    submitActivity: vi.fn(),
    complete: vi.fn(),
  },
  codingSandboxApi: { getMission: vi.fn() },
}))

function runWith(activity: any) {
  return {
    data: {
      id: 'run-1',
      mission: { title: 'Verbs 101', activities: [activity] },
    },
  }
}

function renderPlayer() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/missions/play/run-1']}>
        <Routes>
          <Route path="/missions/play/:runId" element={<MissionPlayerPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MissionPlayerPage — Learn step', () => {
  beforeEach(() => {
    getRun.mockReset()
  })

  it('shows the Learn card before practice when the activity has teaching content', async () => {
    getRun.mockResolvedValue(
      runWith({
        id: 101,
        type: 'SELECT',
        title: 'Pick the verb',
        content: {
          question: 'Which word is a verb?',
          options: ['cat', 'run', 'blue'],
          correctAnswers: ['run'],
          context: 'A verb is an action word — something you can do.',
          keyPoints: ['Verbs describe actions', 'Example: run, jump, eat'],
        },
      }),
    )

    renderPlayer()

    // Learn beat appears first.
    await waitFor(() => expect(screen.getByText('Learn')).toBeInTheDocument())
    expect(screen.getByText(/a verb is an action word/i)).toBeInTheDocument()
    expect(screen.getByText('Verbs describe actions')).toBeInTheDocument()

    // The practice options are not shown yet.
    expect(screen.queryByText('cat')).not.toBeInTheDocument()

    // Pressing "I'm ready" reveals the practice question + options.
    fireEvent.click(screen.getByRole('button', { name: /i'm ready/i }))
    await waitFor(() => expect(screen.getByText('cat')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /check/i })).toBeInTheDocument()
  })

  it('skips straight to practice when the activity has nothing to teach', async () => {
    getRun.mockResolvedValue(
      runWith({
        id: 102,
        type: 'SELECT',
        title: 'Recall',
        content: {
          question: 'What is 2 + 2?',
          options: ['3', '4', '5'],
          correctAnswers: ['4'],
        },
      }),
    )

    renderPlayer()

    // No Learn beat — the practice question shows immediately.
    await waitFor(() => expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument())
    expect(screen.queryByText('Learn')).not.toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })
})
