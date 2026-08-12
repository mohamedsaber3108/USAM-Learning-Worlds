import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { gamificationApi } from '@/lib/api/endpoints'

export function AchievementsPage() {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => gamificationApi.getAchievements().then(res => res.data),
  })

  const categoryIcons: Record<string, string> = {
    mastery: '🎯',
    social: '🤝',
    streak: '🔥',
    exploration: '🗺️',
    milestone: '🏆',
    special: '⭐',
  }

  const categoryColors: Record<string, string> = {
    mastery: 'from-blue-500 to-blue-600',
    social: 'from-green-500 to-green-600',
    streak: 'from-orange-500 to-orange-600',
    exploration: 'from-purple-500 to-purple-600',
    milestone: 'from-yellow-500 to-yellow-600',
    special: 'from-pink-500 to-pink-600',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading achievements...</p>
          </div>
        ) : achievements && achievements.length > 0 ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card text-center">
                <p className="text-4xl font-bold text-primary-600">
                  {achievements.filter((a: any) => a.unlockedAt).length}
                </p>
                <p className="text-gray-600 mt-2">Unlocked</p>
              </div>
              <div className="card text-center">
                <p className="text-4xl font-bold text-gray-400">
                  {achievements.filter((a: any) => !a.unlockedAt).length}
                </p>
                <p className="text-gray-600 mt-2">Locked</p>
              </div>
              <div className="card text-center">
                <p className="text-4xl font-bold text-secondary-600">
                  {Math.round(
                    (achievements.filter((a: any) => a.unlockedAt).length /
                      achievements.length) *
                      100
                  )}
                  %
                </p>
                <p className="text-gray-600 mt-2">Completion</p>
              </div>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement: any) => (
                <div
                  key={achievement.id}
                  className={`card ${
                    achievement.unlockedAt
                      ? 'border-2 border-yellow-400'
                      : 'opacity-60'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${
                      categoryColors[achievement.category] ||
                      'from-gray-400 to-gray-500'
                    } flex items-center justify-center text-4xl ${
                      !achievement.unlockedAt && 'grayscale'
                    }`}
                  >
                    {categoryIcons[achievement.category] || '🏅'}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                    {achievement.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 text-center mb-4">
                    {achievement.description}
                  </p>

                  {/* Progress or Unlocked Date */}
                  {achievement.unlockedAt ? (
                    <div className="text-center">
                      <p className="text-xs text-green-600 font-medium">
                        ✓ Unlocked
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : achievement.progress !== undefined ? (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>
                          {achievement.progress} / {achievement.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              (achievement.progress / achievement.target) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 text-center">
                      🔒 Locked
                    </p>
                  )}

                  {/* Rarity Badge */}
                  {achievement.rarity && (
                    <div className="mt-3 text-center">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          achievement.rarity === 'legendary'
                            ? 'bg-yellow-100 text-yellow-800'
                            : achievement.rarity === 'epic'
                            ? 'bg-purple-100 text-purple-800'
                            : achievement.rarity === 'rare'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {achievement.rarity}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Achievements Yet
            </h2>
            <p className="text-gray-600">Start learning to unlock achievements!</p>
          </div>
        )}
      </main>
    </div>
  )
}
