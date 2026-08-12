import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { gamificationApi, masteryApi, missionsApi } from '@/lib/api/endpoints'

export function ProgressPage() {
  const { data: progression } = useQuery({
    queryKey: ['progression'],
    queryFn: () => gamificationApi.getProgression().then(res => res.data),
  })

  const { data: streak } = useQuery({
    queryKey: ['streak'],
    queryFn: () => gamificationApi.getStreak().then(res => res.data),
  })

  const { data: achievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => gamificationApi.getAchievements().then(res => res.data),
  })

  const { data: mastery } = useQuery({
    queryKey: ['mastery-overview'],
    queryFn: () => masteryApi.getOverview().then(res => res.data),
  })

  const { data: recentMissions } = useQuery({
    queryKey: ['recent-missions'],
    queryFn: () => missionsApi.getHistory().then(res => res.data),
  })

  const unlockedAchievements = achievements?.filter((a: any) => a.unlockedAt) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Level & XP */}
        <div className="card mb-8 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/80 mb-1">Current Level</p>
              <p className="text-5xl font-bold">{progression?.level || 1}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 mb-1">Total XP</p>
              <p className="text-4xl font-bold">
                {progression?.totalXp?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* XP Progress */}
          <div>
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Progress to Level {(progression?.level || 1) + 1}</span>
              <span>
                {progression?.xp || 0} / {progression?.xpToNextLevel || 100} XP
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4">
              <div
                className="bg-white h-4 rounded-full transition-all"
                style={{
                  width: `${progression?.xpProgress || 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Streak */}
          <div className="card text-center">
            <div className="text-5xl mb-2">🔥</div>
            <p className="text-3xl font-bold text-orange-600">
              {streak?.currentStreak || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Day Streak</p>
            <p className="text-xs text-gray-500 mt-1">
              Best: {streak?.longestStreak || 0}
            </p>
          </div>

          {/* Achievements */}
          <div className="card text-center">
            <div className="text-5xl mb-2">🏆</div>
            <p className="text-3xl font-bold text-yellow-600">
              {unlockedAchievements.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Achievements</p>
            <Link
              to="/achievements"
              className="text-xs text-primary-600 hover:text-primary-700 mt-1 inline-block"
            >
              View All →
            </Link>
          </div>

          {/* Mastery */}
          <div className="card text-center">
            <div className="text-5xl mb-2">🎯</div>
            <p className="text-3xl font-bold text-green-600">
              {mastery?.masteredCount || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Mastered</p>
            <p className="text-xs text-gray-500 mt-1">
              {mastery?.learningCount || 0} learning
            </p>
          </div>

          {/* Missions */}
          <div className="card text-center">
            <div className="text-5xl mb-2">✅</div>
            <p className="text-3xl font-bold text-blue-600">
              {recentMissions?.filter((m: any) => m.status === 'completed').length || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Completed</p>
            <Link
              to="/missions"
              className="text-xs text-primary-600 hover:text-primary-700 mt-1 inline-block"
            >
              Browse →
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Achievements */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Achievements</h2>
              <Link
                to="/achievements"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View All →
              </Link>
            </div>

            {unlockedAchievements.length > 0 ? (
              <div className="space-y-3">
                {unlockedAchievements.slice(0, 5).map((achievement: any) => (
                  <div
                    key={achievement.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl">
                      🏆
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {achievement.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No achievements yet. Keep learning!
              </p>
            )}
          </div>

          {/* Recent Missions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Missions</h2>
              <Link
                to="/missions"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View All →
              </Link>
            </div>

            {recentMissions && recentMissions.length > 0 ? (
              <div className="space-y-3">
                {recentMissions.slice(0, 5).map((run: any) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {run.mission?.title || 'Mission'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(run.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {run.status === 'completed' ? (
                        <>
                          <p className="text-sm font-semibold text-green-600">
                            {run.finalScore}%
                          </p>
                          <p className="text-xs text-gray-500">
                            +{run.xpEarned} XP
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">In Progress</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No missions yet. Start your first mission!
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
