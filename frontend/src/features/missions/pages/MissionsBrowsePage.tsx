import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { missionsApi } from '@/lib/api/endpoints'

export function MissionsBrowsePage() {
  const [filters, setFilters] = useState({
    difficulty: '',
    domainId: '',
    search: '',
  })

  const { data: missions, isLoading } = useQuery({
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
    GUIDED: 'bg-green-100 text-green-800',
    EXPLORATION: 'bg-blue-100 text-blue-800',
    CHALLENGE: 'bg-purple-100 text-purple-800',
    PROJECT_BASED: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-500 to-secondary-500 shadow-pop">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-white/90 hover:text-white transition-colors">
                ← Back
              </Link>
              <h1 className="text-2xl font-heading font-bold text-white">🎯 Missions</h1>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading missions...</p>
          </div>
        ) : missions && missions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission: any) => (
              <Link
                key={mission.id}
                to={`/missions/${mission.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                {/* Mission Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                      {mission.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {mission.description}
                  </p>
                </div>

                {/* Mission Meta */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      typeColors[mission.type] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {mission.type?.replace('_', ' ')}
                  </span>
                  {mission.estimatedMinutes && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      ⏱️ {mission.estimatedMinutes} min
                    </span>
                  )}
                </div>

                {/* Mission Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
                  <div className="flex items-center space-x-4">
                    <span>🎯 {mission.type}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No missions found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}
      </main>
    </div>
  )
}
