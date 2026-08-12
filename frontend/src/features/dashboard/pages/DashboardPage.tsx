import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { gamificationApi, masteryApi, missionsApi } from '@/lib/api/endpoints'

export function DashboardPage() {
  const navigate = useNavigate()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  // Fetch real data from backend
  const { data: progression } = useQuery({
    queryKey: ['progression'],
    queryFn: () => gamificationApi.getProgression().then(res => res.data),
  })

  const { data: mastery } = useQuery({
    queryKey: ['mastery-overview'],
    queryFn: () => masteryApi.getOverview().then(res => res.data),
  })

  const { data: recentMissions } = useQuery({
    queryKey: ['recent-missions'],
    queryFn: () => missionsApi.getHistory().then(res => res.data),
  })

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">USAM Learning Worlds</h1>
          <button
            onClick={handleLogout}
            className="btn btn-outline"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName || 'Learner'}! 👋
          </h2>
          <p className="text-gray-600">Ready to continue your learning journey?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Level</p>
                <p className="text-3xl font-bold text-primary-600">
                  {progression?.level || 1}
                </p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{progression?.xp || 0} XP</span>
                    <span>{progression?.xpToNextLevel || 100} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${progression?.xpProgress || 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total XP</p>
                <p className="text-3xl font-bold text-secondary-600">
                  {progression?.totalXp?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Rank #{progression?.rank || '---'}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Streak</p>
                <p className="text-3xl font-bold text-orange-600">
                  {progression?.currentStreak || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Best: {progression?.longestStreak || 0} days
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mastery Overview */}
        {mastery && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">📊 Mastery Progress</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Mastered</span>
                    <span className="font-semibold text-green-600">
                      {mastery.masteredCount || 0}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Learning</span>
                    <span className="font-semibold text-blue-600">
                      {mastery.learningCount || 0}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">To Explore</span>
                    <span className="font-semibold text-gray-600">
                      {mastery.notStartedCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">🎯 Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/missions"
                  className="p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors text-center"
                >
                  <div className="text-2xl mb-1">🎯</div>
                  <p className="font-semibold text-primary-900 text-sm">Missions</p>
                </Link>
                <Link
                  to="/projects"
                  className="p-3 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors text-center"
                >
                  <div className="text-2xl mb-1">🎨</div>
                  <p className="font-semibold text-secondary-900 text-sm">Projects</p>
                </Link>
                <Link
                  to="/achievements"
                  className="p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-center"
                >
                  <div className="text-2xl mb-1">🏆</div>
                  <p className="font-semibold text-yellow-900 text-sm">Achievements</p>
                </Link>
                <Link
                  to="/leaderboard"
                  className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center"
                >
                  <div className="text-2xl mb-1">📊</div>
                  <p className="font-semibold text-green-900 text-sm">Leaderboard</p>
                </Link>
              </div>
              <Link
                to="/progress"
                className="block mt-3 p-3 bg-gradient-to-r from-primary-50 to-secondary-50 hover:from-primary-100 hover:to-secondary-100 rounded-lg transition-colors text-center"
              >
                <p className="font-semibold text-gray-900 text-sm">
                  📈 View Full Progress
                </p>
              </Link>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentMissions && recentMissions.length > 0 && (
          <div className="card mb-8">
            <h3 className="text-xl font-semibold mb-4">📚 Recent Missions</h3>
            <div className="space-y-3">
              {recentMissions.slice(0, 5).map((run: any) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{run.mission?.title || 'Mission'}</h4>
                    <p className="text-sm text-gray-600">
                      {run.status === 'completed' ? '✅ Completed' : '⏳ In Progress'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-600">
                      {run.finalScore ? `${run.finalScore}%` : '---'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(run.startedAt).toLocaleDateString()}
                    </p>
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
