import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { missionsApi } from '@/lib/api/endpoints'

export function MissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const { data: mission, isLoading } = useQuery({
    queryKey: ['mission', id],
    queryFn: () => missionsApi.getById(Number(id)).then(res => res.data),
    enabled: !!id,
  })

  const startMutation = useMutation({
    mutationFn: () => missionsApi.start(Number(id)),
    onSuccess: (response) => {
      const runId = response.data.id
      navigate(`/missions/play/${runId}`)
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to start mission')
    },
  })

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800',
    expert: 'bg-red-100 text-red-800',
  }

  const activityIcons: Record<string, string> = {
    multiple_choice: '✓',
    fill_blank: '📝',
    ordering: '↕️',
    matching: '⇄',
    true_false: '✓✗',
    short_answer: '💬',
    coding: '💻',
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading mission...</p>
        </div>
      </div>
    )
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Mission not found</p>
          <Link to="/missions" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            ← Back to Missions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/missions" className="text-gray-600 hover:text-gray-900">
            ← Back to Missions
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mission Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {mission.title}
              </h1>
              <p className="text-gray-600">{mission.description}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                difficultyColors[mission.difficulty] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {mission.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {mission.domain?.name || 'General'}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {mission.xpReward || 0}
              </p>
              <p className="text-sm text-gray-600">XP Reward</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-600">
                {mission.activities?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Activities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {mission.estimatedMinutes || 0}
              </p>
              <p className="text-sm text-gray-600">Minutes</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="btn btn-primary w-full py-4 text-lg disabled:opacity-50"
          >
            {startMutation.isPending ? 'Starting...' : 'Start Mission 🚀'}
          </button>
        </div>

        {/* Activities Preview */}
        {mission.activities && mission.activities.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Activities in this Mission</h2>
            <div className="space-y-3">
              {mission.activities.map((activity: any, index: number) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center font-semibold text-primary-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {activity.question || activity.prompt || 'Activity'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {activityIcons[activity.type] || '📋'} {activity.type.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {activity.points || 10} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
