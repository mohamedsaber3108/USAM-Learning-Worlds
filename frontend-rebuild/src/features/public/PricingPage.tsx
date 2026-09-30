import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { entitlementsApi } from '@/lib/api/endpoints'
import { Button } from '@/components/ui/Button'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'

interface Plan {
  id: string
  code: string
  name: string
  priceCents: number
  currency?: string
  features?: Record<string, unknown>
}

/** Public plans catalog from GET /api/entitlements/plans (no auth). Prices are
 * DATA — rendered from the live catalog, never hardcoded. */
export function PricingPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => (await entitlementsApi.listPlans()).data as Plan[],
  })

  return (
    <div className="min-h-screen bg-canvas-white">
      <header className="mx-auto flex h-16 max-w-6xl items-center px-4">
        <Link to="/" className="font-display text-xl font-extrabold text-brand-700">
          USAM
        </Link>
        <Link to="/login" className="ms-auto rounded-control px-3 py-2 text-sm font-medium text-ink-700 hover:bg-canvas-off">
          {t('public.logIn')}
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-center font-display text-3xl font-extrabold text-ink-900">{t('public.pricing')}</h1>

        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={() => void refetch()} />}
        {data && data.length === 0 && <EmptyState />}
        {data && data.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((plan) => (
              <div key={plan.id} className="flex flex-col rounded-card border border-line bg-white p-6 shadow-soft">
                <h2 className="font-display text-xl font-bold text-ink-900">{plan.name}</h2>
                <p className="mt-2 font-display text-3xl font-extrabold text-brand-700">
                  {plan.priceCents === 0
                    ? 'Free'
                    : new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: plan.currency || 'USD',
                      }).format(plan.priceCents / 100)}
                </p>
                <div className="mt-auto pt-6">
                  <Link to="/signup">
                    <Button className="w-full">{t('public.getStarted')}</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
