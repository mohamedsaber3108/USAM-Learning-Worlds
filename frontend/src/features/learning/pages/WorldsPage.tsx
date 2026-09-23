import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Globe2, Lock, ArrowRight, Sparkles,
} from 'lucide-react'
import { worldsApi, type WorldRecord } from '@/lib/api/endpoints'
import { visualFor } from '@/features/learning/lib/worldVisual'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/CharacterState'

/**
 * Worlds — the learner-facing map of the backend Worlds engine
 * (GET /worlds), which was fully built (per-learner unlock signals,
 * mission counts, domain mapping) but had NO frontend route at all
 * (traceability #34). This is the "living world" entry surface the
 * reconstruction plan calls for: each world is a domain the learner can
 * explore, with real unlock state and mission counts from the engine.
 *
 * No fake data — everything rendered comes from worldsApi.list().
 * Domain → icon/gradient mapping is shared via ../lib/worldVisual so the
 * Home world-journey strip renders worlds identically.
 */

export function WorldsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['worlds'],
    queryFn: () => worldsApi.list().then((r) => r.data as WorldRecord[]),
  })

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Branded hero header — consistent with every other learner page. */}
      <header className="bg-brand-hero relative overflow-hidden shadow-lift">
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div aria-hidden className="absolute -top-10 -end-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="icon-chip bg-white/15 text-white w-12 h-12"><Globe2 className="w-6 h-6" strokeWidth={2} /></div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                {t('worlds.title', 'Learning Worlds')}
              </h1>
              <p className="text-white/80 text-sm mt-0.5">
                {t('worlds.subtitle', 'Explore worlds, unlock new ones as you learn.')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isError ? (
          <ErrorState
            character="Azouz"
            title={t('worlds.errorTitle', "Couldn't load your worlds")}
            message={t('worlds.errorMessage', "No worries — let's try that again.")}
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <LoadingState character="Zein" message={t('worlds.loading', 'Mapping your worlds...')} />
        ) : Array.isArray(data) && data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.map((world, i) => {
              const v = visualFor(world.domain?.slug || world.slug)
              const Icon = v.icon
              const locked = !world.isUnlocked
              return (
                <motion.button
                  key={world.id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  {...(locked ? {} : { whileHover: { y: -4 } })}
                  disabled={locked}
                  onClick={() => !locked && navigate(`/learn?domain=${world.domain?.slug || ''}`)}
                  aria-label={world.name}
                  className={`world-tile bg-gradient-to-br ${v.grad} min-h-[11rem] flex flex-col justify-between text-start ${
                    locked ? 'opacity-70 grayscale cursor-not-allowed' : ''
                  }`}
                >
                  <div aria-hidden className="dots-layer opacity-20" />
                  <div className="relative flex items-start justify-between">
                    <div className="icon-chip bg-white/20 text-white w-12 h-12">
                      <Icon className="w-6 h-6" strokeWidth={2} />
                    </div>
                    {locked ? (
                      <span className="inline-flex items-center gap-1 rounded-pill bg-black/25 text-white/90 text-[11px] font-semibold px-2.5 py-1">
                        <Lock className="w-3 h-3" strokeWidth={2.5} />
                        {t('worlds.locked', 'Locked')}
                      </span>
                    ) : (
                      <Sparkles className="w-4 h-4 text-white/80" />
                    )}
                  </div>
                  <div className="relative">
                    <p className="font-display font-extrabold text-lg text-white leading-snug">{world.name}</p>
                    {world.description ? (
                      <p className="text-white/80 text-xs mt-1 line-clamp-2">{world.description}</p>
                    ) : null}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-white/90 text-xs font-semibold">
                        {t('worlds.missions', { count: world.missionCount, defaultValue: '{{count}} missions' })}
                      </span>
                      {!locked && (
                        <ArrowRight className="w-5 h-5 text-white rtl:scale-x-[-1]" strokeWidth={2.5} />
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        ) : (
          <EmptyState
            character="Zein"
            title={t('worlds.emptyTitle', 'Your worlds are being prepared')}
            message={t('worlds.emptyMessage', 'Start a mission and your first world will open up!')}
            actionLabel={t('worlds.emptyAction', 'Browse missions')}
            actionTo="/missions"
          />
        )}
      </main>
    </div>
  )
}
