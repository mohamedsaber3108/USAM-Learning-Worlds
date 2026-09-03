import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Flame, Trophy, Target, CheckCircle2, Snowflake, Coins } from 'lucide-react'
import { gamificationApi, masteryApi, missionsApi, streakFreezeApi } from '@/lib/api/endpoints'
import { useCountUp } from '@/lib/hooks/useCountUp'
import { LoadingState, ErrorState } from '@/components/common/CharacterState'

export function ProgressPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const {
    data: progression,
    isLoading: progressionLoading,
    isError: progressionIsError,
    refetch: refetchProgression,
  } = useQuery({
    queryKey: ['progression'],
    queryFn: () => gamificationApi.getProgression().then(res => res.data),
  })

  const { data: streak } = useQuery({
    queryKey: ['streak'],
    queryFn: () => gamificationApi.getStreak().then(res => res.data),
  })

  const { data: freezeStatus } = useQuery({
    queryKey: ['streak-freeze-status'],
    queryFn: () => streakFreezeApi.getStatus().then(res => res.data),
  })

  const purchaseFreeze = useMutation({
    mutationFn: () => streakFreezeApi.purchase(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak-freeze-status'] })
      queryClient.invalidateQueries({ queryKey: ['progression'] })
      queryClient.invalidateQueries({ queryKey: ['streak'] })
    },
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
  const masteredCount = Array.isArray(mastery) ? mastery.filter((m: any) => m.state === 'MASTERED').length : 0
  const learningCount = Array.isArray(mastery)
    ? mastery.filter((m: any) => ['NOVICE', 'DEVELOPING', 'PROFICIENT'].includes(m.state)).length
    : 0
  const completedMissions = recentMissions?.filter((m: any) => m.status === 'COMPLETED').length || 0

  const totalXP = useCountUp(progression?.totalXP || 0, 1000)
  const streakCount = useCountUp(streak?.currentStreak || 0, 700)
  const levelProgress = useCountUp(progression?.progress || 0, 900)

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header — one solid brand color, no rainbow gradient */}
      <header className="bg-primary-600 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-white/90 hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              {t('progressPage.back')}
            </Link>
            <h1 className="text-2xl font-display font-bold text-white">{t('progressPage.title')}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {progressionLoading ? (
          <LoadingState character="Azouz" message={t('progressPage.loading')} />
        ) : progressionIsError ? (
          <ErrorState
            character="Azouz"
            title={t('progressPage.errorTitle')}
            message={t('progressPage.errorMessage')}
            onRetry={() => refetchProgression()}
          />
        ) : (
        <>
        {/* Level & XP */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="card mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-500 text-xs font-medium mb-1">{t('progressPage.currentLevel')}</p>
              <p className="text-5xl font-display font-extrabold text-primary-600">{progression?.level || 1}</p>
            </div>
            <div className="text-end">
              <p className="text-slate-500 text-xs font-medium mb-1">{t('progressPage.totalXp')}</p>
              <p className="text-4xl font-display font-extrabold text-slate-900">
                {totalXP.toLocaleString()}
              </p>
            </div>
          </div>

          {/* XP Progress */}
          <div>
            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>{t('progressPage.progressToLevel', { level: (progression?.level || 1) + 1 })}</span>
              <span>
                {progression?.xpInCurrentLevel || 0} / {progression?.xpForNextLevel || 100} {t('progressPage.xpSuffix')}
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Streak Freeze — coin-spending economy, distinct from the XP cosmetic shop */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.03 }}
          className="card mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="icon-chip bg-sky-50 text-sky-600">
                <Snowflake className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <p className="font-display font-semibold text-slate-900">{t('progressPage.streakFreeze.title')}</p>
                <p className="text-xs text-slate-500">
                  {t('progressPage.streakFreeze.description')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Coins className="w-4 h-4 text-amber-500" strokeWidth={2} />
                <span className="font-semibold">{freezeStatus?.coins ?? progression?.coins ?? 0}</span>
                <span className="text-slate-400">{t('progressPage.streakFreeze.coins')}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: freezeStatus?.maxFreezesHeld ?? 2 }).map((_, i) => (
                  <Snowflake
                    key={i}
                    className={`w-5 h-5 ${
                      i < (freezeStatus?.freezesAvailable ?? 0) ? 'text-sky-500' : 'text-slate-200'
                    }`}
                    strokeWidth={2}
                  />
                ))}
                <span className="text-xs text-slate-500 ms-1">
                  {freezeStatus?.freezesAvailable ?? 0} {t('progressPage.streakFreeze.active')}
                </span>
              </div>

              <button
                className="btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  purchaseFreeze.isPending ||
                  !freezeStatus?.canAfford ||
                  freezeStatus?.atCap
                }
                onClick={() => purchaseFreeze.mutate()}
              >
                {freezeStatus?.atCap
                  ? t('progressPage.streakFreeze.maxHeld')
                  : t('progressPage.streakFreeze.buy', { cost: freezeStatus?.costCoins ?? 50 })}
              </button>
            </div>
          </div>

          {purchaseFreeze.isError && (
            <p className="text-xs text-danger-600 mt-3">
              {(purchaseFreeze.error as any)?.response?.data?.message || t('progressPage.streakFreeze.purchaseError')}
            </p>
          )}
          {purchaseFreeze.isSuccess && (
            <p className="text-xs text-success-600 mt-3">
              {t('progressPage.streakFreeze.purchaseSuccess')}
            </p>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="stat-card text-center"
          >
            <div className="icon-chip bg-accent-50 text-accent-600 mx-auto mb-2">
              <Flame className="w-5 h-5" strokeWidth={2} />
            </div>
            <p className="text-3xl font-display font-extrabold text-slate-900">
              {streakCount}
            </p>
            <p className="text-sm text-slate-500 mt-1">{t('progressPage.dayStreak')}</p>
            <p className="text-xs text-slate-400 mt-1">
              {t('progressPage.best', { count: streak?.longestStreak || 0 })}
            </p>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="stat-card text-center"
          >
            <div className="icon-chip bg-secondary-50 text-secondary-600 mx-auto mb-2">
              <Trophy className="w-5 h-5" strokeWidth={2} />
            </div>
            <p className="text-3xl font-display font-extrabold text-slate-900">
              {unlockedAchievements.length}
            </p>
            <p className="text-sm text-slate-500 mt-1">{t('progressPage.achievements')}</p>
            <Link
              to="/achievements"
              className="text-xs text-primary-600 hover:text-primary-700 mt-1 inline-block"
            >
              {t('progressPage.viewAll')} <span className="inline-block rtl:scale-x-[-1]">→</span>
            </Link>
          </motion.div>

          {/* Mastery */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="stat-card text-center"
          >
            <div className="icon-chip bg-success-50 text-success-600 mx-auto mb-2">
              <Target className="w-5 h-5" strokeWidth={2} />
            </div>
            <p className="text-3xl font-display font-extrabold text-slate-900">
              {masteredCount}
            </p>
            <p className="text-sm text-slate-500 mt-1">{t('progressPage.mastered')}</p>
            <p className="text-xs text-slate-400 mt-1">
              {t('progressPage.learningSuffix', { count: learningCount })}
            </p>
          </motion.div>

          {/* Missions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="stat-card text-center"
          >
            <div className="icon-chip bg-primary-50 text-primary-600 mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
            </div>
            <p className="text-3xl font-display font-extrabold text-slate-900">
              {completedMissions}
            </p>
            <p className="text-sm text-slate-500 mt-1">{t('progressPage.completed')}</p>
            <Link
              to="/missions"
              className="text-xs text-primary-600 hover:text-primary-700 mt-1 inline-block"
            >
              {t('progressPage.browse')} <span className="inline-block rtl:scale-x-[-1]">→</span>
            </Link>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Recent Achievements */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold">{t('progressPage.recentAchievements')}</h2>
              <Link
                to="/achievements"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {t('progressPage.viewAll')} <span className="inline-block rtl:scale-x-[-1]">→</span>
              </Link>
            </div>

            {unlockedAchievements.length > 0 ? (
              <div className="space-y-3">
                {unlockedAchievements.slice(0, 5).map((achievement: any) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 rounded-control bg-surface-50 hover:bg-surface-100 transition-colors"
                  >
                    <div className="icon-chip bg-secondary-50 text-secondary-600">
                      <Trophy className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {achievement.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">
                {t('progressPage.noAchievements')}
              </p>
            )}
          </div>

          {/* Recent Missions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold">{t('progressPage.recentMissions')}</h2>
              <Link
                to="/missions"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {t('progressPage.viewAll')} <span className="inline-block rtl:scale-x-[-1]">→</span>
              </Link>
            </div>

            {recentMissions && recentMissions.length > 0 ? (
              <div className="space-y-3">
                {recentMissions.slice(0, 5).map((run: any) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-3 rounded-control bg-surface-50 hover:bg-surface-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {run.mission?.title || t('progressPage.mission')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(run.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-end">
                      {run.status === 'COMPLETED' ? (
                        <>
                          <p className="text-sm font-semibold text-success-600">
                            {run.finalScore}%
                          </p>
                          <p className="text-xs text-slate-500">
                            {t('progressPage.xpEarned', { xp: run.xpEarned })}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-slate-500">{t('progressPage.inProgress')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">
                {t('progressPage.noMissions')}
              </p>
            )}
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  )
}
