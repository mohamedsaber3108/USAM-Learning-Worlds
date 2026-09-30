import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { entitlementsApi, entitlementsMgmtApi } from '@/lib/api/endpoints'
import { LoadingState, ErrorState, EmptyState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface Plan { id: string; code: string; name: string; priceCents: number; currency?: string }
interface MyEntitlement { plan?: { code: string; name: string }; subscription?: { id: string; status: string } | null }

/** Plan / subscription. Real entitlements. Honest: activation goes through the
 * manual provider (no live payment gateway) — no fake checkout UI. */
export function ParentPlanPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const mine = useQuery({
    queryKey: ['entitlements-me'],
    queryFn: async () => (await entitlementsApi.getMine()).data as MyEntitlement,
  })
  const plans = useQuery({
    queryKey: ['plans'],
    queryFn: async () => (await entitlementsApi.listPlans()).data as Plan[],
  })

  async function activate(code: string) {
    await entitlementsMgmtApi.subscribe(code)
    await qc.invalidateQueries({ queryKey: ['entitlements-me'] })
  }
  async function cancel(id: string) {
    await entitlementsMgmtApi.cancel(id)
    await qc.invalidateQueries({ queryKey: ['entitlements-me'] })
  }

  if (mine.isLoading || plans.isLoading) return <LoadingState />
  if (mine.isError) return <ErrorState onRetry={() => void mine.refetch()} />

  const currentCode = mine.data?.plan?.code
  const sub = mine.data?.subscription

  return (
    <div className="space-y-6">
      <PageHeader title={t('parent.plan')} />

      <Card>
        <p className="text-xs uppercase tracking-wide text-ink-400">{t('parent.currentPlan')}</p>
        <div className="mt-1 flex items-center gap-3">
          <p className="font-display text-xl font-bold text-ink-900">{mine.data?.plan?.name ?? 'Free'}</p>
          {sub?.status && <Badge tone="brand">{sub.status}</Badge>}
        </div>
        {sub?.id && (
          <Button className="mt-3" size="sm" variant="ghost" onClick={() => cancel(sub.id)}>
            {t('parent.cancelPlan')}
          </Button>
        )}
      </Card>

      <section>
        <SectionHeader title={t('parent.manageBilling')} />
        <p className="mb-3 text-xs text-ink-400">{t('parent.noPaymentNote')}</p>
        {!plans.data || plans.data.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.data.map((p) => (
              <Card key={p.id}>
                <h3 className="font-display font-bold text-ink-900">{p.name}</h3>
                <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">
                  {p.priceCents === 0
                    ? 'Free'
                    : new Intl.NumberFormat(undefined, { style: 'currency', currency: p.currency || 'USD' }).format(p.priceCents / 100)}
                </p>
                <Button
                  className="mt-3 w-full"
                  size="sm"
                  disabled={p.code === currentCode}
                  onClick={() => activate(p.code)}
                >
                  {p.code === currentCode ? '✓' : t('parent.activatePlan')}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
