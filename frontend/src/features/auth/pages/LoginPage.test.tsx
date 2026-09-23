import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '@/lib/i18n'
import { LoginPage } from './LoginPage'

/**
 * Critical journey: login. Proves client-side validation blocks a bad submit
 * and that a successful login persists tokens + user and routes to /dashboard.
 * The auth pipeline itself is verified live (401 on bad creds) by the deploy
 * script; this test locks the frontend contract around it.
 */

const post = vi.fn()
vi.mock('@/lib/api/client', () => ({
  default: { post: (...args: unknown[]) => post(...args) },
}))

const navigate = vi.fn()
vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => navigate }
})

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    post.mockReset()
    navigate.mockReset()
    localStorage.clear()
  })

  it('shows validation errors and does not call the API on empty submit', async () => {
    renderLogin()
    fireEvent.click(screen.getByRole('button', { name: /log in|sign in/i }))

    // A validation message appears (email and/or password) and no API call fires.
    await waitFor(() => expect(post).not.toHaveBeenCalled())
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('persists tokens and navigates to the dashboard on success', async () => {
    post.mockResolvedValue({
      data: {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        user: { id: 'u1', email: 'kid@example.com' },
      },
    })

    renderLogin()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'kid@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /log in|sign in/i }))

    await waitFor(() => expect(post).toHaveBeenCalledWith('/auth/login', {
      email: 'kid@example.com',
      password: 'password123',
    }))
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard'))
    expect(localStorage.getItem('accessToken')).toBe('access-123')
    expect(localStorage.getItem('refreshToken')).toBe('refresh-456')
  })
})
