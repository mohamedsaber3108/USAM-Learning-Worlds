import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Target,
  Users2,
  Flame,
  Compass,
  Trophy,
  Star,
  Award,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { gamificationApi } from '@/lib/api/endpoints'
import { EmptyState, ErrorState } from '@/components/common/CharacterState'

export function AchievementsPage() {
  const { data: achievements, isLoading, isError, refetch } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => gamificationApi.getAchievements().then(res => res.data),
  })

  const categoryIcons: Record<string, any> = {
    mastery: Target,
    social: Users2,
    streak: Flame,
    exploration: Compass,
    milestone: Trophy,
    special: Star,
  }

  const categoryTints: Record<string, string> = {
    mastery: 'bg-primary-50 text-primary-600',
    social: 'bg-success-50 text-success-600',
    streak: 'bg-accent-50 text-accent-600',
    exploration: 'bg-primary-50 text-primary-600',
    milestone: 'bg-secondary-50 text-secondary-600',
    special: 'bg-accent-50 text-accent-600',
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header — one solid brand color, no rainbow gradient */}
      <header className="bg-primary-600 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-white/90 hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Back
            </Link>
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6" strokeWidth={2} />
              Achievements
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isError ? (
          <ErrorState
            character="Azouz"
            title="Couldn't load your achievements"
            message="No worries — this happens sometimes. Let's give it another try."
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="stat-card text-center animate-pulse">
                  <div className="h-9 w-14 bg-surface-200 rounded mx-auto mb-2" />
                  <div className="h-3 w-16 bg-surface-200 rounded mx-auto" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="stat-card animate-pulse">
                  <div className="w-16 h-16 rounded-xl bg-surface-200 mx-auto mb-4" />
                  <div className="h-4 w-32 bg-surface-200 rounded mx-auto mb-2" />
                  <div className="h-3 w-40 bg-surface-200 rounded mx-auto" />
                </div>
              ))}
            </div>
          </div>
        ) : achievements && achievements.length > 0 ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div className="stat-card text-center">
                <p className="text-4xl font-display font-extrabold text-primary-600">
                  {achievements.filter((a: any) => a.unlockedAt).length}
                </p>
                <p className="text-slate-500 mt-2">Unlocked</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-4xl font-display font-extrabold text-slate-400">
                  {achievements.filter((a: any) => !a.unlockedAt).length}
                </p>
                <p className="text-slate-500 mt-2">Locked</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-4xl font-display font-extrabold text-secondary-600">
                  {Math.round(
                    (achievements.filter((a: any) => a.unlockedAt).length /
                      achievements.length) *
                      100
                  )}
                  %
                </p>
                <p className="text-slate-500 mt-2">Completion</p>
              </div>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {achievements.map((achievement: any) => {
                const CategoryIcon = categoryIcons[achievement.category] || Award
                const tint = categoryTints[achievement.category] || 'bg-surface-100 text-slate-500'
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`stat-card ${
                      achievement.unlockedAt
                        ? 'border-secondary-300'
                        : 'opacity-60'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`icon-chip w-16 h-16 mx-auto mb-4 ${tint} ${
                        !achievement.unlockedAt && 'grayscale'
                      }`}
                    >
                      <CategoryIcon className="w-7 h-7" strokeWidth={2} />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-display font-semibold text-slate-900 text-center mb-2">
                      {achievement.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-500 text-center mb-4">
                      {achievement.description}
                    </p>

                    {/* Progress or Unlocked Date */}
                    {achievement.unlockedAt ? (
                      <div className="text-center">
                        <p className="text-xs text-success-600 font-medium flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                          Unlocked
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : achievement.progress !== undefined ? (
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Progress</span>
                          <span>
                            {achievement.progress} / {achievement.target}
                          </span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${
                                (achievement.progress / achievement.target) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                        <Lock className="w-3.5 h-3.5" strokeWidth={2} />
                        Locked
                      </p>
                    )}

                    {/* Rarity Badge */}
                    {achievement.rarity && (
                      <div className="mt-3 text-center">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            achievement.rarity === 'legendary'
                              ? 'bg-secondary-100 text-secondary-800'
                              : achievement.rarity === 'epic'
                              ? 'bg-primary-100 text-primary-800'
                              : achievement.rarity === 'rare'
                              ? 'bg-success-100 text-success-800'
                              : 'bg-surface-100 text-slate-600'
                          }`}
                        >
                          {achievement.rarity}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </>
        ) : (
          <EmptyState
            character="Zein"
            title="No Achievements Yet"
            message="Every mission, streak, and project you complete earns you a badge. Start your first mission to unlock your very first achievement!"
            actionLabel="Start a Mission"
            actionTo="/missions"
          />
        )}
      </main>
    </div>
  )
}
