import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Target, Clock } from 'lucide-react'
import { missionsApi } from '@/lib/api/endpoints'
import { EmptyState, ErrorState } from '@/components/common/CharacterState'
import { CardGridSkeleton } from '@/components/common/Skeleton'

export function MissionsBrowsePage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState({
    difficulty: '',
    domainId: '',
    search: '',
  })

  const { data: missions, isLoading, isError, refetch } = useQuery({
    queryKey: ['missions', filters],
    queryFn: () => {
      const params: { difficulty?: string; domainId?: number; search?: string } = {}
      if (filters.difficulty) params.difficulty = filters.difficulty
      if (filters.domainId) params.domainId = Number(filters.domainId)
      if (filters.search) params.search = filters.search
      return missionsApi.browse(params).then(res => res.data)
    },
  })

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
        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {t('missionsBrowse.difficultyLabel')}
              </label>
              <select
                className="input"
                value={filters.difficulty}
                onChange={e => setFilters({ ...filters, difficulty: e.target.value })}
              >
                <option value="">{t('missionsBrowse.allLevels')}</option>
                <option value="beginner">{t('missionsBrowse.beginner')}</option>
                <option value="intermediate">{t('missionsBrowse.intermediate')}</option>
                <option value="advanced">{t('missionsBrowse.advanced')}</option>
                <option value="expert">{t('missionsBrowse.expert')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('missionsBrowse.domainLabel')}
              </label>
              <select
                className="input"
                value={filters.domainId}
                onChange={e => setFilters({ ...filters, domainId: e.target.value })}
              >
                <option value="">{t('missionsBrowse.allDomains')}</option>
                <option value="1">{t('missionsBrowse.domainMath')}</option>
                <option value="2">{t('missionsBrowse.domainScience')}</option>
                <option value="3">{t('missionsBrowse.domainLanguageArts')}</option>
                <option value="4">{t('missionsBrowse.domainHistory')}</option>
                <option value="5">{t('missionsBrowse.domainProgramming')}</option>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
            onAction={() => setFilters({ difficulty: '', domainId: '', search: '' })}
          />
        )}
      </main>
    </div>
  )
}
