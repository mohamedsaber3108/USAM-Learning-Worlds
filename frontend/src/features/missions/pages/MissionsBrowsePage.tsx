import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Target, Clock } from 'lucide-react'
import { missionsApi } from '@/lib/api/endpoints'
import { EmptyState, ErrorState } from '@/components/common/CharacterState'
import { CardGridSkeleton } from '@/components/common/Skeleton'

// Mission types match the backend MissionType enum (GUIDED/EXPLORATION/
// CHALLENGE/PROJECT_BASED). The learner `/missions` endpoint returns the full
// list with NO server-side filtering, so filtering is done client-side on the
// fetched list — every control here operates on real data (no params the
// backend silently ignores). The old domain dropdown sent numeric ids 1-5 for
// Math/Science/History/etc. — wrong domains AND a type the backend never
// supported (real domain ids are UUIDs); removed.
const MISSION_TYPES = ['GUIDED', 'EXPLORATION', 'CHALLENGE', 'PROJECT_BASED'] as const

export function MissionsBrowsePage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState({
    type: '',
    search: '',
  })

  const { data: allMissions, isLoading, isError, refetch } = useQuery({
    queryKey: ['missions'],
    queryFn: () => missionsApi.browse().then(res => res.data as any[]),
  })

  // Real client-side filtering over the fetched list.
  const missions = Array.isArray(allMissions)
    ? allMissions.filter((m: any) => {
        if (filters.type && m.type !== filters.type) return false
        if (filters.search) {
          const q = filters.search.toLowerCase()
          const hay = `${m.title ?? ''} ${m.description ?? ''}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
    : allMissions

  const typeColors: Record<string, string> = {
    GUIDED: 'bg-success-100 text-success-800',
    EXPLORATION: 'bg-primary-100 text-primary-800',
    CHALLENGE: 'bg-secondary-100 text-secondary-800',
    PROJECT_BASED: 'bg-accent-100 text-accent-800',
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header — one solid brand color, no rainbow gradient */}
      <header className="bg-primary-600 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-white/90 hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
                {t('missionsBrowse.back')}
              </Link>
              <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Target className="w-6 h-6" strokeWidth={2} />
                {t('missionsBrowse.title')}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters — search + mission type, both real (client-side over the
            fetched list; the backend returns all missions unfiltered). */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('missionsBrowse.searchLabel')}
              </label>
              <input
                type="text"
                className="input"
                placeholder={t('missionsBrowse.searchPlaceholder')}
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('missionsBrowse.typeLabel', 'Mission type')}
              </label>
              <select
                className="input"
                value={filters.type}
                onChange={e => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">{t('missionsBrowse.allTypes', 'All types')}</option>
                {MISSION_TYPES.map((tp) => (
                  <option key={tp} value={tp}>
                    {t(`missionsBrowse.type.${tp}`, tp.replace('_', ' '))}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mission Grid — a card-grid-shaped skeleton instead of a centered
            LoadingState blob: the previous blob was ~5rem tall vs. the real
            multi-row card grid, so it caused a visible page jump on every
            filter change/first load of this page (one of the top-traffic
            surfaces in the app). */}
        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : isError ? (
          <ErrorState
            character="Azouz"
            title={t('missionsBrowse.errorTitle')}
            message={t('missionsBrowse.errorMessage')}
            onRetry={() => refetch()}
          />
        ) : missions && missions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center md:justify-items-stretch">
            {missions.map((mission: any, index: number) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
              >
                <Link
                  to={`/missions/${mission.id}`}
                  className="card block hover:shadow-soft-hover hover:-translate-y-0.5"
                >
                  {/* Mission Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-display font-semibold text-lg text-slate-900 line-clamp-2">
                        {mission.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-3">
                      {mission.description}
                    </p>
                  </div>

                  {/* Mission Meta */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        typeColors[mission.type] || 'bg-surface-100 text-slate-700'
                      }`}
                    >
                      {mission.type?.replace('_', ' ')}
                    </span>
                    {mission.estimatedMinutes && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-surface-100 text-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" strokeWidth={2} />
                        {t('missionsBrowse.minutesSuffix', { count: mission.estimatedMinutes })}
                      </span>
                    )}
                  </div>

                  {/* Mission Stats */}
                  <div className="flex items-center justify-between text-sm text-slate-500 border-t border-surface-200 pt-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary-600" strokeWidth={2} />
                      <span>{mission.type}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            character="Zein"
            title={t('missionsBrowse.emptyTitle')}
            message={t('missionsBrowse.emptyMessage')}
            actionLabel={t('missionsBrowse.clearFilters')}
            onAction={() => setFilters({ type: '', search: '' })}
          />
        )}
      </main>
    </div>
  )
}
