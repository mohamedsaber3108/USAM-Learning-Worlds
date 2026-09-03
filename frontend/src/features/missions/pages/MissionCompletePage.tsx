import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PartyPopper, Star, ThumbsUp, Zap, ArrowLeft } from 'lucide-react'
import { useCountUp } from '@/lib/hooks/useCountUp'
import { ReflectionQuickCheck } from '@/features/missions/components/ReflectionQuickCheck'

export function MissionCompletePage() {
  const location = useLocation()
  const result = location.state?.result
  const runId = location.state?.runId

  if (!result) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">No results found</p>
          <Link to="/missions" className="text-primary-600 mt-4 inline-block flex items-center gap-1 justify-center">
            <ArrowLeft className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
            Back to Missions
          </Link>
        </div>
      </div>
    )
  }

  const score = result.finalScore || 0
  const xpEarned = result.xpEarned || 0
  const isPerfect = score >= 100

  const scoreCount = useCountUp(score, 900)
  const xpCount = useCountUp(xpEarned, 900)

  const CelebrationIcon = isPerfect ? PartyPopper : score >= 80 ? Star : score >= 60 ? ThumbsUp : Zap
  const celebrationTint = isPerfect
    ? 'bg-secondary-50 text-secondary-600'
    : score >= 80
    ? 'bg-primary-50 text-primary-600'
    : score >= 60
    ? 'bg-success-50 text-success-600'
    : 'bg-accent-50 text-accent-600'

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
            <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">
              {isPerfect
                ? 'Perfect Score!'
                : score >= 80
                ? 'Great Job!'
                : score >= 60
                ? 'Well Done!'
                : 'Keep Going!'}
            </h1>
            <p className="text-slate-500 text-lg">Mission Complete</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-surface-50 rounded-card">
            <div>
              <p className="text-4xl font-display font-extrabold text-primary-600 mb-2">{scoreCount}%</p>
              <p className="text-slate-500">Final Score</p>
            </div>
            <div>
              <p className="text-4xl font-display font-extrabold text-secondary-600 mb-2">+{xpCount}</p>
              <p className="text-slate-500">XP Earned</p>
            </div>
          </div>

          {/* Feedback */}
          {result.feedback && (
            <div className="mb-8 p-6 bg-primary-50 rounded-card text-left">
              <h3 className="font-display font-semibold text-slate-900 mb-2">Feedback</h3>
              <p className="text-slate-700">{result.feedback}</p>
            </div>
          )}

          {/* Metacognition: quick self-reflection check-in */}
          {runId && <ReflectionQuickCheck runId={runId} />}

          {/* Next Steps */}
          <div className="space-y-3">
            <Link to="/missions" className="btn btn-primary w-full py-3 text-lg">
              Browse More Missions
            </Link>
            <Link to="/dashboard" className="btn btn-outline w-full py-3 text-lg">
              Back to Dashboard
            </Link>
          </div>

          {/* Encouragement */}
          {!isPerfect && (
            <p className="mt-6 text-sm text-slate-500">
              {score >= 80
                ? 'Almost perfect! Keep up the excellent work!'
                : score >= 60
                ? "You're making great progress!"
                : "Don't give up! Every attempt makes you stronger!"}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
