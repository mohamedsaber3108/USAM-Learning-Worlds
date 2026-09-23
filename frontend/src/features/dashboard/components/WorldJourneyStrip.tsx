import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, MapPin } from 'lucide-react'
import { worldsApi, type WorldRecord } from '@/lib/api/endpoints'
import { visualFor } from '@/features/learning/lib/worldVisual'

/**
 * The "living world" strip on Home — a compact, horizontal journey across the
 * learner's worlds (the six-worlds North Star), so entering Home feels like
 * standing at the edge of a map with your guide, not reading a stats
 * dashboard. Each world shows real unlock state and mission count from the
 * Worlds engine (GET /worlds) and links into the full map.
 *
 * Self-hiding: renders nothing while loading, on error, or when the engine
 * returns no worlds — Home never shows a broken or empty strip. Shares the
 * ['worlds'] query cache with WorldsPage so navigating between them is instant.
 */
export function WorldJourneyStrip() {
  const { t } = useTranslation()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['worlds'],
    queryFn: () => worldsApi.list().then((r) => r.data as WorldRecord[]),
  })

  if (isLoading || isError || !Array.isArray(data) || data.length === 0) {
    return null
  }

  const worlds = [...data].sort((a, b) => a.order - b.order)

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-8"
      aria-labelledby="world-journey-heading"
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          id="world-journey-heading"
          className="text-lg font-display font-bold text-slate-900 inline-flex items-center gap-2"
        >
          <MapPin className="w-5 h-5 text-primary-500" strokeWidth={2} />
          {t('worldJourney.title')}
        </h3>
        <Link
          to="/worlds"
          className="text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
        >
          {t('worldJourney.viewMap')}
          <ArrowRight className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
        </Link>
      </div>

      {/* Horizontal, scrollable journey — a path of worlds. */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {worlds.map((world, i) => {
          const v = visualFor(world.domain?.slug || world.slug)
          const Icon = v.icon
          const locked = !world.isUnlocked
          return (
            <Link
              key={world.id}
              to="/worlds"
              className="snap-start shrink-0 w-40 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-card"
              aria-label={world.name}
            >
              <div
                className={`relative h-28 rounded-card overflow-hidden bg-gradient-to-br ${v.grad} ${
                  locked ? 'opacity-60 grayscale' : ''
                } transition-transform group-hover:scale-[1.02] shadow-soft`}
              >
                <div aria-hidden className="absolute inset-0 dots-layer opacity-[0.15]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {locked ? (
                    <Lock className="w-8 h-8 text-white/90" strokeWidth={2} />
                  ) : (
                    <Icon className="w-9 h-9 text-white" strokeWidth={2} />
                  )}
                </div>
                {/* Step number badge — reinforces the "journey" ordering. */}
                <div className="absolute top-2 start-2 w-6 h-6 rounded-full bg-white/25 text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
              </div>
              <div className="mt-2 px-0.5">
                <p className="font-display font-semibold text-slate-900 text-sm truncate">
                  {world.name}
                </p>
                <p className="text-xs text-slate-500">
                  {locked
                    ? t('worldJourney.locked')
                    : t('worldJourney.missionCount', { count: world.missionCount })}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </motion.section>
  )
}
