import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Gamepad2, Rocket, Coins, ShieldCheck, FlaskConical, Landmark, ArrowRight,
} from 'lucide-react'
import { simulationsApi } from '@/lib/api/endpoints'
import { useAgeAdaptation } from '@/lib/hooks/useAgeAdaptation'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/CharacterState'

/**
 * Simulations — learner-facing browse of the backend Simulation engine
 * (GET /simulations), a branching decision-scenario system that was fully
 * built server-side but had NO frontend route (traceability #38).
 *
 * This pass surfaces the real scenario list (filtered by the learner's age
 * band) so the engine is discoverable and reachable. Each scenario links to
 * its detail/player route (/simulations/:slug), the interactive node-walking
 * player being the next increment.
 *
 * No fake data — everything comes from simulationsApi.list().
 */

interface SimulationScenario {
  id: string
  slug: string
  title: string
  description?: string | null
  category?: string | null
  ageAppropriate?: string | null
  order?: number
}

// SimulationCategory enum → icon + tint (entrepreneurship, financial literacy,
// digital safety, science, civic).
const CATEGORY_VISUAL: Record<string, { icon: typeof Rocket; tint: string }> = {
  ENTREPRENEURSHIP: { icon: Rocket, tint: 'bg-accent-50 text-accent-600' },
  FINANCIAL_LITERACY: { icon: Coins, tint: 'bg-secondary-50 text-secondary-600' },
  DIGITAL_SAFETY: { icon: ShieldCheck, tint: 'bg-primary-50 text-primary-600' },
  SCIENCE: { icon: FlaskConical, tint: 'bg-success-50 text-success-600' },
  CIVIC: { icon: Landmark, tint: 'bg-grape-50 text-grape-600' },
}

export function SimulationsPage() {
  const { t } = useTranslation()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const adapt = useAgeAdaptation(user?.learner?.ageBand)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['simulations', adapt.band],
    queryFn: () =>
      simulationsApi.list({ ageBand: adapt.band }).then((r) => r.data as SimulationScenario[]),
  })

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-brand-hero relative overflow-hidden shadow-lift">
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div aria-hidden className="absolute -top-10 -end-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="icon-chip bg-white/15 text-white w-12 h-12"><Gamepad2 className="w-6 h-6" strokeWidth={2} /></div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                {t('simulations.title', 'Simulations')}
              </h1>
              <p className="text-white/80 text-sm mt-0.5">
                {t('simulations.subtitle', 'Make choices, see what happens, and learn by doing.')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isError ? (
          <ErrorState
            character="Codey"
            title={t('simulations.errorTitle', "Couldn't load simulations")}
            message={t('simulations.errorMessage', "No worries — let's try again.")}
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <LoadingState character="Codey" message={t('simulations.loading', 'Setting up your scenarios...')} />
        ) : Array.isArray(data) && data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.map((sim, i) => {
              const v = CATEGORY_VISUAL[sim.category ?? ''] ?? { icon: Gamepad2, tint: 'bg-primary-50 text-primary-600' }
              const Icon = v.icon
              return (
                <motion.div
                  key={sim.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                <Link
                  to={`/simulations/${sim.slug}`}
                  className="card group flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                >
                  <div className={`icon-chip ${v.tint} w-12 h-12 mb-3 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <p className="font-display font-bold text-ink leading-snug">{sim.title}</p>
                  {sim.description ? (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-3 flex-1">{sim.description}</p>
                  ) : <div className="flex-1" />}
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600">
                    {t('simulations.start', 'Start scenario')}
                    <ArrowRight className="w-3.5 h-3.5 rtl:scale-x-[-1]" strokeWidth={2.5} />
                  </span>
                </Link>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            character="Codey"
            title={t('simulations.emptyTitle', 'No simulations yet')}
            message={t('simulations.emptyMessage', 'New decision scenarios are on the way — check back soon!')}
            actionLabel={t('simulations.emptyAction', 'Explore missions')}
            actionTo="/missions"
          />
        )}
      </main>
    </div>
  )
}
