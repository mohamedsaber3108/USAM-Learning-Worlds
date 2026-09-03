import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Target, Clock } from 'lucide-react'
import { missionsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/CharacterState'

export function MissionsBrowsePage() {
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
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-white/90 hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                Back
              </Link>
              <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Target className="w-6 h-6" strokeWidth={2} />
                Missions
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
                Search
              </label>
              <input
                type="text"
                className="input"
                placeholder="Search missions..."
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Difficulty
              </label>
              <select
                className="input"
                value={filters.difficulty}
                onChange={e => setFilters({ ...filters, difficulty: e.target.value })}
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Domain
              </label>
              <select
                className="input"
                value={filters.domainId}
                onChange={e => setFilters({ ...filters, domainId: e.target.value })}
              >
                <option value="">All Domains</option>
                <option value="1">Math</option>
                <option value="2">Science</option>
                <option value="3">Language Arts</option>
                <option value="4">History</option>
                <option value="5">Programming</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mission Grid */}
        {isLoading ? (
          <LoadingState character="Zein" message="Zein is scouting out missions for you..." />
        ) : isError ? (
          <ErrorState
            character="Azouz"
            title="Couldn't fetch the missions"
            message="No worries — this happens sometimes. Let's give it another try."
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
                        {mission.estimatedMinutes} min
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
            title="No missions match yet"
            message="Try a different search or clear your filters to see everything Zein has scouted out."
            actionLabel="Clear filters"
            onAction={() => setFilters({ difficulty: '', domainId: '', search: '' })}
          />
        )}
      </main>
    </div>
  )
}
