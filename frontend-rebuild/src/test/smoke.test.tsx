import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Routes, Route } from 'react-router-dom'
import '@/lib/i18n'
import { setLanguage, isRtl, applyDocumentDirection } from '@/lib/i18n'
import { LandingPage } from '@/features/public/LandingPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState } from '@/components/common/States'

// Mocks are allowed in TESTS ONLY (never production).
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

describe('public surfaces render', () => {
  beforeEach(() => setLanguage('en'))

  it('landing shows the ecosystem hero + CTAs', () => {
    wrap(<LandingPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getAllByText(/get started/i).length).toBeGreaterThan(0)
  })

  it('login renders a real form with email + password + submit', () => {
    wrap(
      <Routes>
        <Route path="/" element={<LoginPage />} />
      </Routes>,
    )
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })
})

describe('design-system primitives', () => {
  it('button renders and disables while loading', () => {
    const { rerender } = render(<Button>Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' })).toBeEnabled()
    rerender(<Button loading>Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' })).toBeDisabled()
  })

  it('honest states render (empty + error with retry)', () => {
    const onRetry = vi.fn()
    const { rerender } = render(<EmptyState title="Nothing" />)
    expect(screen.getByText('Nothing')).toBeInTheDocument()
    rerender(<ErrorState message="Broke" onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Broke')
  })
})

describe('i18n + RTL', () => {
  it('flips document dir to rtl for Arabic and back for English', async () => {
    applyDocumentDirection('ar')
    expect(isRtl('ar')).toBe(true)
    expect(document.documentElement.dir).toBe('rtl')
    applyDocumentDirection('en')
    await waitFor(() => expect(document.documentElement.dir).toBe('ltr'))
  })
})
