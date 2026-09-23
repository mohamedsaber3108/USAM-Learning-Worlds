import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import '@/lib/i18n' // initialise i18next (en default) for useTranslation()

/**
 * Shared test harness: wraps a component in the same providers the app uses
 * (React Query + Router + i18n) so integration tests exercise real hooks.
 * A fresh QueryClient per render keeps tests isolated, and retries are off so
 * unmocked queries fail fast (and stay in the loading state) instead of
 * retrying for seconds.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: { route?: string; state?: unknown },
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  const initialEntries = [
    options?.state !== undefined
      ? { pathname: options?.route ?? '/', state: options.state }
      : (options?.route ?? '/'),
  ]

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper })
}
