import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { gamificationApi } from '@/lib/api/endpoints'

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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600'
    if (rank === 2) return 'text-gray-500'
    if (rank === 3) return 'text-orange-600'
    return 'text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
            </div>

            {/* Scope Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setScope('global')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  scope === 'global'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Global
              </button>
              <button
                onClick={() => setScope('friends')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  scope === 'friends'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
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
          <div className="card mb-8 bg-gradient-to-r from-primary-50 to-secondary-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`text-4xl font-bold ${getRankColor(
                    myRank.rank
                  )}`}
                >
                  {getRankIcon(myRank.rank)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Your Rank</p>
                  <p className="text-2xl font-bold text-gray-900">
                    #{myRank.rank || '---'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total XP</p>
                <p className="text-2xl font-bold text-secondary-600">
                  {myRank.totalXP?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading leaderboard...</p>
          </div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <div className="card">
            <div className="space-y-2">
              {leaderboard.map((entry: any, index: number) => {
                const rank = index + 1
                const isMe = entry.id === myRank?.id

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      isMe
                        ? 'bg-primary-50 border-2 border-primary-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Rank */}
                      <div
                        className={`w-12 text-center text-2xl font-bold ${getRankColor(
                          rank
                        )}`}
                      >
                        {getRankIcon(rank)}
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {entry.displayName?.charAt(0) || 'L'}
                      </div>

                      {/* Name & Level */}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {entry.displayName || 'Learner'}
                          {isMe && (
                            <span className="ml-2 text-xs font-normal text-primary-600">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          Level {entry.level || 1}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <p className="font-bold text-secondary-600">
                          {entry.totalXP?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-gray-500">XP</p>
                      </div>

                      {/* Streak */}
                      {entry.currentStreak > 0 && (
                        <div className="text-right ml-4">
                          <p className="font-bold text-orange-600">
                            {entry.currentStreak}🔥
                          </p>
                          <p className="text-xs text-gray-500">streak</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Rankings Yet
            </h2>
            <p className="text-gray-600">
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
