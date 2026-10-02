import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { entitlementsApi } from '@/lib/api/endpoints'
import { Button, Card } from '@/components/ui'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { PublicPage } from './PublicPage'

interface Plan {
  id: string
  code: string
  name: string
  priceCents: number
  currency?: string
}

/** Pricing — real GET /api/entitlements/plans, rebuilt on the design system +
 * public shell. Prices are DATA, never hardcoded. */
export function PricingPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => (await entitlementsApi.listPlans()).data as Plan[],
  })

  return (
    <PublicPage title={t('public.pricing')}>
      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {data && data.length === 0 && <EmptyState />}
      {data && data.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <h2 className="font-display text-xl font-bold">{plan.name}</h2>
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
            </Card>
          ))}
        </div>
      )}
    </PublicPage>
  )
}
