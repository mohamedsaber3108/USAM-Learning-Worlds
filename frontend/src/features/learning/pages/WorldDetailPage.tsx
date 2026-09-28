import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Play, CheckCircle2, Clock } from 'lucide-react'
import { worldsApi, type WorldMissionRecord, type WorldMissionStatus } from '@/lib/api/endpoints'
import { visualFor } from '@/features/learning/lib/worldVisual'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/CharacterState'

/**
 * World Detail (Phase D) — the surface a learner lands on after tapping a world
 * on the map. Shows the world's missions as a progression PATH with REAL
 * per-learner state from GET /worlds/:id: locked / available / in-progress /
 * completed, with sequential unlocking (a mission unlocks when the previous is
 * completed). No fabricated data — status comes straight from the engine.
 *
 * States: loading (companion), error (retry), empty (no missions yet).
 * Age adaptation is inherited from the shell; this surface keeps a single
 * clear vertical path that reads at every band. RTL-safe via logical classes.
 */

const STATUS_STYLE: Record<WorldMissionStatus, { icon: typeof Play; ring: string; chip: string }> = {
  COMPLETED:   { icon: CheckCircle2, ring: 'bg-success-500 text-white', chip: 'bg-success-50 text-success-700' },
  IN_PROGRESS: { icon: Clock,        ring: 'bg-primary-500 text-white', chip: 'bg-primary-50 text-primary-700' },
  AVAILABLE:   { icon: Play,         ring: 'bg-primary-600 text-white', chip: 'bg-primary-50 text-primary-700' },
  LOCKED:      { icon: Lock,         ring: 'bg-surface-200 text-slate-400', chip: 'bg-surface-100 text-slate-400' },
}

function MissionRow({ mission, index }: { mission: WorldMissionRecord; index: number }) {
  const { t } = useTranslation()
  const s = STATUS_STYLE[mission.status]
  const Icon = s.icon
  const interactive = mission.status !== 'LOCKED'

  const body = (
    <div
      className={`flex items-center gap-4 rounded-card border-2 p-4 transition-colors ${
        interactive ? 'bg-white border-surface-200/70 hover:border-primary-300' : 'bg-surface-50 border-transparent'
      }`}
    >
      <div className={`icon-chip w-11 h-11 shrink-0 ${s.ring}`}>
        <Icon className="w-5 h-5" strokeWidth={2} fill={mission.status === 'AVAILABLE' ? 'currentColor' : 'none'} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`font-display font-semibold ${interactive ? 'text-slate-900' : 'text-slate-400'}`}>
          {mission.title}
        </p>
        {mission.description && interactive && (
          <p className="text-sm text-slate-500 line-clamp-1">{mission.description}</p>
        )}
      </div>
      <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${s.chip}`}>
        {t(`worldDetail.status.${mission.status.toLowerCase()}`)}
      </span>
    </div>
  )

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
    >
      {interactive ? (
        <Link
          to={`/missions/${mission.id}`}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-card"
        >
          {body}
        </Link>
      ) : (
        <div aria-disabled className="cursor-not-allowed" title={t('worldDetail.lockedHint')}>
          {body}
        </div>
      )}
    </motion.li>
  )
}

export function WorldDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['world', id],
    queryFn: () => worldsApi.getOne(id!).then((r) => r.data),
    enabled: !!id,
  })

  const v = visualFor(data?.domain?.slug || data?.slug)
  const WorldIcon = v.icon

  return (
    <div className="min-h-screen bg-surface-50">
      <header className={`relative overflow-hidden shadow-lift bg-gradient-to-br ${v.grad}`}>
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/worlds')}
            className="inline-flex items-center gap-1 text-white/90 hover:text-white text-sm font-semibold mb-4"
          >
            <ArrowLeft className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
            {t('worldDetail.backToMap')}
          </button>
          <div className="flex items-center gap-3">
            <div className="icon-chip bg-white/20 text-white w-12 h-12">
              <WorldIcon className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                {data?.name || t('worldDetail.loadingTitle')}
              </h1>
              {data?.description && <p className="text-white/85 text-sm mt-0.5">{data.description}</p>}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isError ? (
          <ErrorState
            character="Zein"
            title={t('worldDetail.errorTitle')}
            message={t('worldDetail.errorMessage')}
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <LoadingState character="Zein" message={t('worldDetail.loading')} />
        ) : data && Array.isArray(data.missions) && data.missions.length > 0 ? (
          <>
            {!data.isUnlocked && (
              <div className="mb-6 flex items-center gap-2 rounded-card bg-surface-100 p-4 text-sm text-slate-600">
                <Lock className="w-4 h-4 shrink-0 text-slate-400" strokeWidth={2} />
                {t('worldDetail.worldLocked')}
              </div>
            )}
            <ol className="space-y-3">
              {data.missions.map((m, i) => (
                <MissionRow key={m.id} mission={m} index={i} />
              ))}
            </ol>
          </>
        ) : (
          <EmptyState
            character="Zein"
            title={t('worldDetail.emptyTitle')}
            message={t('worldDetail.emptyMessage')}
            actionLabel={t('worldDetail.emptyAction')}
            actionTo="/worlds"
          />
        )}
      </main>
    </div>
  )
}
