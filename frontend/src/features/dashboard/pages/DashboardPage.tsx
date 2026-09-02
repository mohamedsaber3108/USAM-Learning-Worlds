import { useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import {
  Target,
  Zap,
  Flame,
  BarChart3,
  BookOpen,
  Palette,
  Sparkles,
  Trophy,
  Mic,
  Languages,
  Users2,
  TrendingUp,
  CheckCircle2,
  Clock,
  LogOut,
} from 'lucide-react'
import { gamificationApi, masteryApi, missionsApi } from '@/lib/api/endpoints'
import { useCountUp } from '@/lib/hooks/useCountUp'

// Quick-action tiles: each gets ONE tasteful icon-chip tint, not a rainbow gradient.
const quickActions = [
  { to: '/learn', label: 'Learn', icon: BookOpen, tint: 'bg-primary-50 text-primary-600' },
  { to: '/missions', label: 'Missions', icon: Target, tint: 'bg-accent-50 text-accent-600' },
  { to: '/projects', label: 'Projects', icon: Palette, tint: 'bg-secondary-50 text-secondary-600' },
  { to: '/community', label: 'Community', icon: Sparkles, tint: 'bg-primary-50 text-primary-600' },
  { to: '/achievements', label: 'Achievements', icon: Trophy, tint: 'bg-warning-50 text-warning-600' },
  { to: '/leaderboard', label: 'Leaderboard', icon: BarChart3, tint: 'bg-success-50 text-success-600' },
  { to: '/voice-chat', label: 'Voice Chat', icon: Mic, tint: 'bg-primary-50 text-primary-600' },
  { to: '/english', label: 'English', icon: Languages, tint: 'bg-accent-50 text-accent-600' },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  // First-time learners who somehow land here without completing
  // onboarding (e.g. a pre-existing account, or a direct URL visit)
  // get routed into the onboarding flow instead of seeing the dashboard.
  useEffect(() => {
    if (user?.role === 'LEARNER' && user.learner && !user.learner.ageBand) {
      navigate('/onboarding/welcome', { replace: true })
    }
  }, [user, navigate])

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

  const totalXP = useCountUp(progression?.totalXP || 0, 1000)
  const streakCount = useCountUp(streak?.currentStreak || 0, 700)
  const levelProgress = progression?.progress || 0

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const masteredCount = Array.isArray(mastery) ? mastery.filter((m: any) => m.state === 'MASTERED').length : 0
  const learningCount = Array.isArray(mastery)
    ? mastery.filter((m: any) => ['NOVICE', 'DEVELOPING', 'PROFICIENT'].includes(m.state)).length
    : 0
  const toExploreCount = Array.isArray(mastery) ? mastery.filter((m: any) => m.state === 'NOT_STARTED').length : 0

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header — one solid brand color, no rainbow gradient */}
      <header className="bg-primary-600 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-display font-bold text-white">
            USAM Learning Worlds
          </h1>
          <button
            onClick={handleLogout}
            className="btn bg-white/10 text-white hover:bg-white/20 shadow-none focus:ring-white/40"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-1">
            Welcome back, {user?.displayName || 'Learner'}
          </h2>
          <p className="text-slate-500 text-sm">Ready to continue your learning journey?</p>
        </motion.div>

        {/* Stats Grid — one tasteful accent per card via icon-chip + progress ring, not full gradient blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Level</p>
                <p className="text-3xl font-display font-extrabold text-slate-900">
                  {progression?.level || 1}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {progression?.xpInCurrentLevel || 0} / {progression?.xpForNextLevel || 100} XP
                </p>
              </div>
              <div className="w-14 h-14">
                <CircularProgressbar
                  value={levelProgress}
                  text=""
                  strokeWidth={10}
                  styles={buildStyles({
                    pathColor: '#4f46e5',
                    trailColor: '#e0e4ff',
                  })}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Total XP</p>
                <p className="text-3xl font-display font-extrabold text-slate-900">
                  {totalXP.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Rank #{rank?.rank || '---'}
                </p>
              </div>
              <div className="icon-chip bg-secondary-50 text-secondary-600">
                <Zap className="w-5 h-5" strokeWidth={2} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Streak</p>
                <p className="text-3xl font-display font-extrabold text-slate-900">
                  {streakCount}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Best: {streak?.longestStreak || 0} days
                </p>
              </div>
              <div className="icon-chip bg-accent-50 text-accent-600">
                <Flame className="w-5 h-5" strokeWidth={2} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mastery Overview */}
        {mastery && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary-600" strokeWidth={2} />
                <h3>Mastery Progress</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Mastered</span>
                  <span className="font-semibold text-success-600">{masteredCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Learning</span>
                  <span className="font-semibold text-primary-600">{learningCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">To Explore</span>
                  <span className="font-semibold text-slate-500">{toExploreCount}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary-600" strokeWidth={2} />
                <h3>Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map(({ to, label, icon: Icon, tint }) => (
                  <Link key={to} to={to} className="quick-action">
                    <div className={`icon-chip ${tint}`}>
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <p className="font-medium text-slate-700 text-sm">{label}</p>
                  </Link>
                ))}
                {user?.role === 'GUARDIAN' && (
                  <Link to="/parents" className="quick-action">
                    <div className="icon-chip bg-primary-50 text-primary-600">
                      <Users2 className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <p className="font-medium text-slate-700 text-sm">Parent Dashboard</p>
                  </Link>
                )}
              </div>
              <Link
                to="/progress"
                className="btn btn-primary w-full mt-3"
              >
                <TrendingUp className="w-4 h-4" strokeWidth={2} />
                View Full Progress
              </Link>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentMissions && recentMissions.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary-600" strokeWidth={2} />
              <h3>Recent Missions</h3>
            </div>
            <div className="space-y-2">
              {recentMissions.slice(0, 5).map((run: any) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 rounded-control bg-surface-50 hover:bg-surface-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {run.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0" strokeWidth={2} />
                    ) : (
                      <Clock className="w-4 h-4 text-warning-500 flex-shrink-0" strokeWidth={2} />
                    )}
                    <div>
                      <h4 className="font-medium text-sm text-slate-800">{run.mission?.title || 'Mission'}</h4>
                      <p className="text-xs text-slate-500">
                        {run.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-600">
                      {run.finalScore ? `${run.finalScore}%` : '---'}
                    </p>
                    <p className="text-xs text-slate-400">
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
