import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Medal, Award, Flame } from 'lucide-react'
import { gamificationApi } from '@/lib/api/endpoints'
import { useCountUp } from '@/lib/hooks/useCountUp'

export function LeaderboardPage() {
  const [scope, setScope] = useState<'global' | 'friends'>('global')

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', scope],
    queryFn: () =>
      gamificationApi
        .getLeaderboard({ scope, limit: 50 })
        .then(res => res.data),
  })

  const { data: myRank } = useQuery({
    queryKey: ['my-rank'],
    queryFn: () => gamificationApi.getRank().then(res => res.data),
  })

  const myRankXP = useCountUp(myRank?.totalXP || 0, 900)

  const getRankIcon = (rank: number) => {
    if (rank === 1) return Trophy
    if (rank === 2) return Medal
    if (rank === 3) return Award
    return null
  }

  const getRankTint = (rank: number) => {
    if (rank === 1) return 'bg-secondary-50 text-secondary-600'
    if (rank === 2) return 'bg-surface-200 text-slate-500'
    if (rank === 3) return 'bg-accent-50 text-accent-600'
    return 'bg-surface-100 text-slate-500'
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
              <h1 className="text-2xl font-display font-bold text-white">Leaderboard</h1>
            </div>

            {/* Scope Toggle */}
            <div className="flex bg-white/10 rounded-control p-1">
              <button
                onClick={() => setScope('global')}
                className={`px-4 py-2 rounded-control text-sm font-medium transition-colors ${
                  scope === 'global'
                    ? 'bg-white text-primary-700 shadow-soft'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Global
              </button>
              <button
                onClick={() => setScope('friends')}
                className={`px-4 py-2 rounded-control text-sm font-medium transition-colors ${
                  scope === 'friends'
                    ? 'bg-white text-primary-700 shadow-soft'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Friends
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Rank Card */}
        {myRank && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="stat-card mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`icon-chip ${getRankTint(myRank.rank)}`}>
                  {getRankIcon(myRank.rank) ? (
                    (() => {
                      const RankIcon = getRankIcon(myRank.rank)!
                      return <RankIcon className="w-5 h-5" strokeWidth={2} />
                    })()
                  ) : (
                    <span className="font-display font-bold text-sm">#{myRank.rank}</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Your Rank</p>
                  <p className="text-2xl font-display font-extrabold text-slate-900 tabular-nums">
                    #{myRank.rank || '---'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500">Total XP</p>
                <p className="text-2xl font-display font-extrabold text-secondary-600 tabular-nums">
                  {myRankXP.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        {isLoading ? (
          <div className="card">
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-control bg-surface-50 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-surface-200 flex-shrink-0" />
                  <div className="w-10 h-10 rounded-full bg-surface-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-32 bg-surface-200 rounded" />
                    <div className="h-3 w-16 bg-surface-200 rounded" />
                  </div>
                  <div className="h-4 w-12 bg-surface-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <div className="card">
            <div className="space-y-2">
              {leaderboard.map((entry: any, index: number) => {
                const rank = index + 1
                const isMe = entry.id === myRank?.id
                const RankIcon = getRankIcon(rank)

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(index, 10) * 0.03 }}
                    className={`flex items-center justify-between p-4 rounded-control transition-colors ${
                      isMe
                        ? 'bg-primary-50 border border-primary-200'
                        : 'bg-surface-50 hover:bg-surface-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Rank */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getRankTint(rank)}`}>
                        {RankIcon ? (
                          <RankIcon className="w-5 h-5" strokeWidth={2} />
                        ) : (
                          <span className="font-display font-bold text-sm">#{rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-display font-bold text-base flex-shrink-0">
                        {entry.displayName?.charAt(0) || 'L'}
                      </div>

                      {/* Name & Level */}
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          {entry.displayName || 'Learner'}
                          {isMe && (
                            <span className="ml-2 text-xs font-normal text-primary-600">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-slate-500">
                          Level {entry.level || 1}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <p className="font-display font-bold text-secondary-600 tabular-nums">
                          {entry.totalXP?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-slate-400">XP</p>
                      </div>

                      {/* Streak */}
                      {entry.currentStreak > 0 && (
                        <div className="text-right ml-4 flex items-center gap-1">
                          <Flame className="w-4 h-4 text-accent-600" strokeWidth={2} />
                          <div>
                            <p className="font-display font-bold text-accent-600 leading-none tabular-nums">
                              {entry.currentStreak}
                            </p>
                            <p className="text-xs text-slate-400">streak</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="icon-chip bg-secondary-50 text-secondary-600 mx-auto mb-4 w-16 h-16">
              <Trophy className="w-8 h-8" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">
              No Rankings Yet
            </h2>
            <p className="text-slate-500">
              {scope === 'friends'
                ? 'Add friends to see their rankings!'
                : 'Be the first to earn XP!'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
