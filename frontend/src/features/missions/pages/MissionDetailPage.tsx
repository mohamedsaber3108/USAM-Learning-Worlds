import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  ArrowLeft,
  Clock,
  Zap,
  Rocket,
  CheckCircle2,
  ArrowLeftRight,
  ArrowUpDown,
  Code2,
  MessageCircle,
  Palette,
  FileText,
  ListChecks,
} from 'lucide-react'
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

  const typeColors: Record<string, string> = {
    GUIDED: 'bg-success-100 text-success-800',
    EXPLORATION: 'bg-primary-100 text-primary-800',
    CHALLENGE: 'bg-secondary-100 text-secondary-800',
    PROJECT_BASED: 'bg-accent-100 text-accent-800',
  }

  const activityIcons: Record<string, any> = {
    SELECT: CheckCircle2,
    MATCH: ArrowLeftRight,
    SEQUENCE: ArrowUpDown,
    CODE: Code2,
    EXPLAIN: MessageCircle,
    CREATE: Palette,
    SOLVE: FileText,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-slate-500">Loading mission...</p>
        </div>
      </div>
    )
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Mission not found</p>
          <Link to="/missions" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            ← Back to Missions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/missions" className="text-slate-600 hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Back to Missions
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mission Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
                {mission.title}
              </h1>
              <p className="text-slate-500">{mission.description}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                typeColors[mission.type] || 'bg-surface-100 text-slate-700'
              }`}
            >
              {mission.type?.replace('_', ' ')}
            </span>
            {mission.estimatedMinutes && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-surface-100 text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                {mission.estimatedMinutes} min
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-surface-50 rounded-control">
            <div className="text-center">
              <p className="text-2xl font-display font-extrabold text-secondary-600">
                {mission.activities?.length || 0}
              </p>
              <p className="text-sm text-slate-500">Activities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-extrabold text-success-600">
                {mission.estimatedMinutes || 0}
              </p>
              <p className="text-sm text-slate-500">Minutes</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-control text-error-700">
              {error}
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="btn btn-primary w-full py-4 text-lg disabled:opacity-50"
          >
            {startMutation.isPending ? 'Starting...' : (
              <>
                Start Mission
                <Rocket className="w-5 h-5" strokeWidth={2} />
              </>
            )}
          </button>
        </div>

        {/* Activities Preview */}
        {mission.activities && mission.activities.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary-600" strokeWidth={2} />
              Activities in this Mission
            </h2>
            <div className="space-y-3">
              {mission.activities.map((activity: any, index: number) => {
                const ActivityIcon = activityIcons[activity.type] || ListChecks
                return (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 rounded-control bg-surface-50 hover:bg-surface-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center font-semibold text-primary-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">
                        {activity.content?.question || activity.content?.problem || activity.title || 'Activity'}
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <ActivityIcon className="w-3.5 h-3.5" strokeWidth={2} />
                        {activity.type?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
