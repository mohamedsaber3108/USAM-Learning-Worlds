import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { PartyPopper, Star, ThumbsUp, Zap, ArrowLeft, TrendingUp, Sparkles } from 'lucide-react'
import { useCountUp } from '@/lib/hooks/useCountUp'
import { ReflectionQuickCheck } from '@/features/missions/components/ReflectionQuickCheck'

/**
 * Shape returned by `POST /missions/runs/:runId/complete`:
 *   { success, message, outcome: { finalScore, passed, requiredActivities,
 *     activitiesAttempted, xp } }
 * where `xp` is the awardXP payload: { awarded, amount?, leveledUp?, newLevel?, ... }
 * (or { awarded: false } when the mission didn't pass / XP already granted).
 */
export function MissionCompletePage() {
  const { t } = useTranslation()
  const location = useLocation()
  const result = location.state?.result
  const runId = location.state?.runId

  const outcome = result?.outcome
  // Read from the real backend contract. Fall back to the legacy top-level
  // fields only if a caller still passes the old shape, so nothing regresses.
  const score = outcome?.finalScore ?? result?.finalScore ?? 0
  const passed = outcome?.passed ?? score >= 60
  const xp = outcome?.xp ?? {}
  const xpEarned = xp?.amount ?? result?.xpEarned ?? 0
  const leveledUp = xp?.leveledUp === true
  const newLevel = xp?.newLevel
  const isPerfect = score >= 100

  // Hooks must run unconditionally and in a stable order on every render, so
  // the count-up animations are computed BEFORE the early "no results" return.
  const scoreCount = useCountUp(score, 900)
  const xpCount = useCountUp(xpEarned, 900)

  if (!result) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">{t('missionComplete.noResultsTitle')}</p>
          <Link to="/missions" className="text-primary-600 mt-4 inline-flex items-center gap-1 justify-center">
            <ArrowLeft className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
            {t('missionComplete.backToMissions')}
          </Link>
        </div>
      </div>
    )
  }

  const CelebrationIcon = isPerfect ? PartyPopper : score >= 80 ? Star : score >= 60 ? ThumbsUp : Zap
  const celebrationTint = isPerfect
    ? 'bg-secondary-50 text-secondary-600'
    : score >= 80
    ? 'bg-primary-50 text-primary-600'
    : score >= 60
    ? 'bg-success-50 text-success-600'
    : 'bg-accent-50 text-accent-600'

  const headline = isPerfect
    ? t('missionComplete.perfectScore')
    : score >= 80
    ? t('missionComplete.greatJob')
    : score >= 60
    ? t('missionComplete.wellDone')
    : t('missionComplete.keepGoing')

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card text-center"
        >
          {/* Celebration */}
          <div className="mb-6">
            <div className={`icon-chip ${celebrationTint} w-20 h-20 mx-auto mb-4`}>
              <CelebrationIcon className="w-10 h-10" strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">{headline}</h1>
            <p className="text-slate-500 text-lg">
              {passed ? t('missionComplete.missionComplete') : t('missionComplete.missionFinished')}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 mb-6 p-6 bg-surface-50 rounded-card">
            <div>
              <p className="text-4xl font-display font-extrabold text-primary-600 mb-2">{scoreCount}%</p>
              <p className="text-slate-500">{t('missionComplete.finalScore')}</p>
            </div>
            <div>
              <p className="text-4xl font-display font-extrabold text-secondary-600 mb-2">+{xpCount}</p>
              <p className="text-slate-500">{t('missionComplete.xpEarned')}</p>
            </div>
          </div>

          {/* Pass / mastery signal */}
          <div
            className={`mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              passed ? 'bg-success-50 text-success-700' : 'bg-accent-50 text-accent-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" strokeWidth={2} />
            {passed ? t('missionComplete.passed') : t('missionComplete.notPassedYet')}
          </div>

          {/* Level-up celebration — only when the XP award bumped the level */}
          {leveledUp && newLevel != null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 18 }}
              className="mb-6 flex items-center justify-center gap-2 px-4 py-3 rounded-card bg-secondary-50 text-secondary-700 font-display font-semibold"
            >
              <Sparkles className="w-5 h-5" strokeWidth={2} />
              {t('missionComplete.leveledUp', { level: newLevel })}
            </motion.div>
          )}

          {/* Server message / feedback, if any */}
          {result.message && (
            <div className="mb-8 p-6 bg-primary-50 rounded-card text-start">
              <h3 className="font-display font-semibold text-slate-900 mb-2">{t('missionComplete.feedback')}</h3>
              <p className="text-slate-700">{result.message}</p>
            </div>
          )}

          {/* Metacognition: quick self-reflection check-in */}
          {runId && <ReflectionQuickCheck runId={runId} />}

          {/* Next Steps */}
          <div className="space-y-3">
            <Link to="/missions" className="btn btn-primary w-full py-3 text-lg">
              {t('missionComplete.browseMore')}
            </Link>
            <Link to="/dashboard" className="btn btn-outline w-full py-3 text-lg">
              {t('missionComplete.backToDashboard')}
            </Link>
          </div>

          {/* Encouragement */}
          {!isPerfect && (
            <p className="mt-6 text-sm text-slate-500">
              {score >= 80
                ? t('missionComplete.encourageAlmost')
                : score >= 60
                ? t('missionComplete.encourageGood')
                : t('missionComplete.encourageKeep')}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
