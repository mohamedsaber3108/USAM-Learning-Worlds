import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
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

  const { data: streak } = useQuery({
    queryKey: ['streak'],
    queryFn: () => gamificationApi.getStreak().then(res => res.data),
  })

  const { data: rank } = useQuery({
    queryKey: ['rank'],
    queryFn: () => gamificationApi.getRank().then(res => res.data),
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 shadow-pop">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-heading font-extrabold text-white drop-shadow-sm">
            🚀 USAM Learning Worlds
          </h1>
          <button
            onClick={handleLogout}
            className="btn bg-white/90 text-primary-700 hover:bg-white shadow-none"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName || 'Learner'}! 👋
          </h2>
          <p className="text-gray-600">Ready to continue your learning journey?</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            whileHover={{ y: -4 }}
            className="card-colorful bg-gradient-to-br from-primary-500 to-primary-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80 mb-1">Level</p>
                <p className="text-3xl font-heading font-extrabold">
                  {progression?.level || 1}
                </p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-white/80 mb-1">
                    <span>{progression?.xpInCurrentLevel || 0} XP</span>
                    <span>{progression?.xpForNextLevel || 100} XP</span>
                  </div>
                  <div className="w-full bg-white/25 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className="bg-white h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progression?.progress || 0}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-bounce-soft">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            whileHover={{ y: -4 }}
            className="card-colorful bg-gradient-to-br from-secondary-500 to-secondary-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80 mb-1">Total XP</p>
                <p className="text-3xl font-heading font-extrabold">
                  {progression?.totalXP?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-white/80 mt-1">
                  Rank #{rank?.rank || '---'}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-bounce-soft">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.19 }}
            whileHover={{ y: -4 }}
            className="card-colorful bg-gradient-to-br from-accent-500 to-accent-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80 mb-1">Streak</p>
                <p className="text-3xl font-heading font-extrabold">
                  {streak?.currentStreak || 0}
                </p>
                <p className="text-xs text-white/80 mt-1">
                  Best: {streak?.longestStreak || 0} days
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-wiggle">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mastery Overview */}
        {mastery && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card animate-fade-in-up">
              <h3 className="text-lg font-heading font-semibold mb-4">📊 Mastery Progress</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Mastered</span>
                    <span className="font-semibold text-success-600">
                      {Array.isArray(mastery) ? mastery.filter((m: any) => m.state === 'MASTERED').length : 0}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Learning</span>
                    <span className="font-semibold text-primary-600">
                      {Array.isArray(mastery) ? mastery.filter((m: any) => ['NOVICE', 'DEVELOPING', 'PROFICIENT'].includes(m.state)).length : 0}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">To Explore</span>
                    <span className="font-semibold text-gray-600">
                      {Array.isArray(mastery) ? mastery.filter((m: any) => m.state === 'NOT_STARTED').length : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
              <h3 className="text-lg font-heading font-semibold mb-4">🎯 Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/learn"
                  className="p-3 bg-primary-50 hover:bg-primary-100 hover:-translate-y-0.5 rounded-xl transition-all text-center"
                >
                  <div className="text-2xl mb-1">📚</div>
                  <p className="font-semibold text-primary-900 text-sm">Learn</p>
                </Link>
                <Link
                  to="/missions"
                  className="p-3 bg-primary-50 hover:bg-primary-100 hover:-translate-y-0.5 rounded-xl transition-all text-center"
                >
                  <div className="text-2xl mb-1">🎯</div>
                  <p className="font-semibold text-primary-900 text-sm">Missions</p>
                </Link>
                <Link
                  to="/projects"
                  className="p-3 bg-secondary-50 hover:bg-secondary-100 hover:-translate-y-0.5 rounded-xl transition-all text-center"
                >
                  <div className="text-2xl mb-1">🎨</div>
                  <p className="font-semibold text-secondary-900 text-sm">Projects</p>
                </Link>
                <Link
                  to="/community"
                  className="p-3 bg-primary-50 hover:bg-primary-100 hover:-translate-y-0.5 rounded-xl transition-all text-center"
                >
                  <div className="text-2xl mb-1">🌟</div>
                  <p className="font-semibold text-primary-900 text-sm">Community</p>
                </Link>
                <Link
                  to="/achievements"
                  className="p-3 bg-warning-50 hover:bg-warning-100 hover:-translate-y-0.5 rounded-xl transition-all text-center"
                >
                  <div className="text-2xl mb-1">🏆</div>
                  <p className="font-semibold text-warning-900 text-sm">Achievements</p>
                </Link>
                <Link
                  to="/leaderboard"
                  className="p-3 bg-success-50 hover:bg-success-100 hover:-translate-y-0.5 rounded-xl transition-all text-center"
                >
                  <div className="text-2xl mb-1">📊</div>
                  <p className="font-semibold text-success-900 text-sm">Leaderboard</p>
                </Link>
                <Link
                  to="/voice-chat"
                  className="p-3 bg-indigo-50 hover:bg-indigo-100 hover:-translate-y-0.5 rounded-xl transition-all text-center"
                >
                  <div className="text-2xl mb-1">🎙️</div>
                  <p className="font-semibold text-indigo-900 text-sm">Voice Chat</p>
                </Link>
                {user?.role === 'GUARDIAN' && (
                  <Link
                    to="/parents"
                    className="p-3 bg-pink-50 hover:bg-pink-100 hover:-translate-y-0.5 rounded-xl transition-all text-center"
                  >
                    <div className="text-2xl mb-1">👨‍👩‍👧</div>
                    <p className="font-semibold text-pink-900 text-sm">Parent Dashboard</p>
                  </Link>
                )}
              </div>
              <Link
                to="/progress"
                className="block mt-3 p-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 rounded-xl transition-all text-center"
              >
                <p className="font-semibold text-white text-sm">
                  📈 View Full Progress
                </p>
              </Link>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentMissions && recentMissions.length > 0 && (
          <div className="card mb-8 animate-fade-in-up">
            <h3 className="text-xl font-heading font-semibold mb-4">📚 Recent Missions</h3>
            <div className="space-y-3">
              {recentMissions.slice(0, 5).map((run: any) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 bg-primary-50/60 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  <div>
                    <h4 className="font-medium">{run.mission?.title || 'Mission'}</h4>
                    <p className="text-sm text-gray-600">
                      {run.status === 'COMPLETED' ? '✅ Completed' : '⏳ In Progress'}
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
