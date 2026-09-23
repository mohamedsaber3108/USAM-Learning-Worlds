import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Check, Sparkles, Crown, Users, Rocket, School } from 'lucide-react'
import { entitlementsApi, type PlanRecord } from '@/lib/api/endpoints'
import { LoadingState, ErrorState } from '@/components/common/CharacterState'

/**
 * Plans / pricing (G-4 step 7c). Reads the REAL seeded plans from the
 * Entitlements engine (GET /entitlements/plans) and the learner/guardian's
 * current plan (GET /entitlements/me), and lets them switch via
 * POST /entitlements/subscribe. With the manual payment provider a switch
 * activates immediately; a real gateway would return a checkoutUrl we'd
 * redirect to. No fake data, no hard-coded prices — everything comes from the
 * plans seeded per plans-local/47_PRICING_PACKAGING.md.
 */

const PLAN_ICON: Record<string, typeof Sparkles> = {
  FREE: Sparkles,
  EXPLORER: Rocket,
  FAMILY: Users,
  SCHOOL: School,
}

// The feature keys worth showing on a card, in display order. Booleans render
// as included/excluded; the two limit keys render with their value.
const DISPLAY_FEATURES: string[] = [
  'worlds',
  'missionsPerDay',
  'maxLearners',
  'aiTutor',
  'voice',
  'credentials',
  'portfolioExport',
  'parentReports',
]

function formatPrice(plan: PlanRecord, t: (k: string, o?: any) => string): string {
  if (plan.priceCents === 0) {
    // SCHOOL is $0 in the row but is really "custom / contact us".
    return plan.code === 'SCHOOL' ? t('plans.custom') : t('plans.free')
  }
  const amount = (plan.priceCents / 100).toFixed(2).replace(/\.00$/, '')
  const per = plan.interval === 'YEAR' ? t('plans.perYear') : t('plans.perMonth')
  return `${plan.currency === 'USD' ? '$' : ''}${amount} ${per}`
}

function featureLabel(key: string, value: unknown, t: (k: string, o?: any) => string): { text: string; included: boolean } {
  switch (key) {
    case 'worlds':
      return { text: value === 'all' ? t('plans.feat.worldsAll') : t('plans.feat.worldsSampler'), included: true }
    case 'missionsPerDay':
      return value === null || value === undefined
        ? { text: t('plans.feat.missionsUnlimited'), included: true }
        : { text: t('plans.feat.missionsPerDay', { count: value as number }), included: true }
    case 'maxLearners':
      return value === null || value === undefined
        ? { text: t('plans.feat.learnersSeat'), included: true }
        : { text: t('plans.feat.learners', { count: value as number }), included: true }
    case 'aiTutor':
      return { text: t('plans.feat.aiTutor'), included: value === true }
    case 'voice':
      return { text: t('plans.feat.voice'), included: value === true }
    case 'credentials':
      return { text: t('plans.feat.credentials'), included: value === true }
    case 'portfolioExport':
      return { text: t('plans.feat.portfolioExport'), included: value === true }
    case 'parentReports':
      return { text: value === 'full' ? t('plans.feat.reportsFull') : t('plans.feat.reportsBasic'), included: true }
    default:
      return { text: key, included: value === true }
  }
}

export function PlansPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [pendingCode, setPendingCode] = useState<string | null>(null)

  const { data: plans, isLoading, isError, refetch } = useQuery({
    queryKey: ['entitlement-plans'],
    queryFn: () => entitlementsApi.listPlans().then((r) => r.data),
  })

  const { data: mine } = useQuery({
    queryKey: ['entitlements-me'],
    queryFn: () => entitlementsApi.getMine().then((r) => r.data),
    retry: 1,
  })

  const currentCode = mine?.plan?.code ?? 'FREE'

  const subscribe = useMutation({
    mutationFn: (planCode: string) => {
      setPendingCode(planCode)
      return entitlementsApi.subscribe(planCode).then((r) => r.data)
    },
    onSuccess: (data: any) => {
      // Real gateway path: redirect to checkout. Manual provider activates
      // immediately, so just refresh the current-plan state.
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      queryClient.invalidateQueries({ queryKey: ['entitlements-me'] })
    },
    onSettled: () => setPendingCode(null),
  })

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-brand-hero relative overflow-hidden shadow-lift">
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div aria-hidden className="absolute -top-10 -end-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="icon-chip bg-white/15 text-white w-12 h-12"><Crown className="w-6 h-6" strokeWidth={2} /></div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">{t('plans.title')}</h1>
              <p className="text-white/80 text-sm mt-0.5">{t('plans.subtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isError ? (
          <ErrorState
            character="Azouz"
            title={t('plans.errorTitle')}
            message={t('plans.errorMessage')}
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <LoadingState character="Zein" message={t('plans.loading')} />
        ) : Array.isArray(plans) && plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan, i) => {
              const Icon = PLAN_ICON[plan.code] ?? Sparkles
              const isCurrent = plan.code === currentCode
              const isFamily = plan.code === 'FAMILY'
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={`card flex flex-col relative ${
                    isFamily ? 'border-2 border-primary-300 shadow-lift' : ''
                  }`}
                >
                  {isFamily && (
                    <span className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t('plans.popular')}
                    </span>
                  )}
                  <div className="icon-chip bg-primary-50 text-primary-600 w-12 h-12 mb-3">
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <h2 className="text-xl font-display font-bold text-slate-900">{plan.name}</h2>
                  <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">
                    {formatPrice(plan, t)}
                  </p>
                  {plan.description && (
                    <p className="text-sm text-slate-500 mt-2 mb-4">{plan.description}</p>
                  )}

                  <ul className="space-y-2 mb-6 flex-1">
                    {DISPLAY_FEATURES.map((key) => {
                      const { text, included } = featureLabel(key, plan.features?.[key], t)
                      return (
                        <li
                          key={key}
                          className={`flex items-start gap-2 text-sm ${included ? 'text-slate-700' : 'text-slate-400 line-through'}`}
                        >
                          <Check
                            className={`w-4 h-4 mt-0.5 shrink-0 ${included ? 'text-success-500' : 'text-slate-300'}`}
                            strokeWidth={2.5}
                          />
                          <span>{text}</span>
                        </li>
                      )
                    })}
                  </ul>

                  {isCurrent ? (
                    <div className="btn btn-outline w-full opacity-70 cursor-default text-center" aria-disabled>
                      {t('plans.currentPlan')}
                    </div>
                  ) : plan.code === 'SCHOOL' ? (
                    <a href="mailto:hello@usamif.com?subject=USAM%20for%20Schools" className="btn btn-outline w-full text-center">
                      {t('plans.contactSales')}
                    </a>
                  ) : (
                    <button
                      onClick={() => subscribe.mutate(plan.code)}
                      disabled={subscribe.isPending}
                      className="btn btn-primary w-full disabled:opacity-50"
                    >
                      {pendingCode === plan.code ? t('plans.switching') : t('plans.choosePlan')}
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        ) : null}

        <p className="text-xs text-slate-400 mt-8 text-center max-w-2xl mx-auto">
          {t('plans.footnote')}
        </p>
      </main>
    </div>
  )
}
