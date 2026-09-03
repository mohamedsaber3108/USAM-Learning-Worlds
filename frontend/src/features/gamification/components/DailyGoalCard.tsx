import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { CheckCircle2, Target } from 'lucide-react'
import { THEME_HEX } from '../../../lib/theme/colors'

export interface DailyGoalProgress {
  goal: { targetMinutes: number; targetActivities: number }
  progress: { minutesSpent: number; activitiesCompleted: number }
  percentComplete: { minutes: number; activities: number }
  goalMet: boolean
}

export interface DailyGoalCardProps {
  data?: DailyGoalProgress
  isLoading?: boolean
}

/**
 * Today's Goal — at-a-glance progress ring.
 *
 * Uses ONLY fields the real backend (daily-goals.service.ts) computes
 * server-side from LearningEvent rows: minutesSpent/activitiesCompleted
 * against targetMinutes/targetActivities, and the derived percentComplete
 * + goalMet flag. No invented streaks-of-goals or weekly stats the API
 * doesn't return.
 *
 * Visual: single ring using the primary indigo (mastery/progress hue),
 * flips to a solid success-emerald fill + checkmark once goalMet is true —
 * the ONE moment color changes, matching the palette's existing rule that
 * emerald means "correctness/mastery feedback only".
 */
export function DailyGoalCard({ data, isLoading }: DailyGoalCardProps) {
  if (isLoading || !data) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 w-24 bg-surface-100 rounded mb-4" />
        <div className="h-20 w-20 bg-surface-100 rounded-full mx-auto" />
      </div>
    )
  }

  const { goal, progress, percentComplete, goalMet } = data
  // Combine both dimensions into one at-a-glance ring value: whichever
  // the learner is closer to completing drives the visual (matches the
  // service's own "OR" logic for goalMet — either target hitting 100%
  // counts as done).
  const ringValue = Math.max(percentComplete.minutes, percentComplete.activities)

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary-600" strokeWidth={2} />
        <h3>Today's Goal</h3>
      </div>

      <div className="flex items-center gap-5">
        <div className="w-20 h-20 flex-shrink-0 relative">
          <CircularProgressbar
            value={ringValue}
            text={goalMet ? '' : `${Math.round(ringValue)}%`}
            strokeWidth={10}
            styles={buildStyles({
              pathColor: goalMet ? THEME_HEX.success500 : THEME_HEX.primary600,
              trailColor: THEME_HEX.primary50,
              textColor: THEME_HEX.slate900,
              textSize: '22px',
            })}
          />
          {goalMet && (
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-success-600" strokeWidth={2} />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Minutes</span>
            <span className="font-semibold text-slate-800">
              {progress.minutesSpent} / {goal.targetMinutes} min
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${percentComplete.minutes}%` }}
            />
          </div>

          <div className="flex justify-between text-sm mt-3">
            <span className="text-slate-500">Activities</span>
            <span className="font-semibold text-slate-800">
              {progress.activitiesCompleted} / {goal.targetActivities}
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${percentComplete.activities}%` }}
            />
          </div>
        </div>
      </div>

      {goalMet && (
        <p className="text-xs text-success-600 font-medium mt-4 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
          Goal complete for today — nice work!
        </p>
      )}
    </div>
  )
}
