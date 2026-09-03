import { Flame, Snowflake } from 'lucide-react'

export interface StreakIndicatorProps {
  currentStreak: number
  longestStreak?: number
  /** True if today's practice already counts toward the streak. */
  practicedToday?: boolean
  /** Streak-freeze tokens available (real coin-spending economy data). */
  freezesAvailable?: number
  /** True when the streak lapsed and hasn't reset yet server-side. */
  expired?: boolean
  size?: 'sm' | 'lg'
}

/**
 * Restrained streak indicator.
 *
 * Duolingo-style flame chips lean on a big saturated icon; we keep the
 * SAME visual weight but stay inside the existing palette: `accent`
 * (warm coral) is the one color reserved for streaks/CTAs per
 * tailwind.config.js, used only when the streak is "live" (practiced
 * today or actively protected by a freeze). At rest (not yet practiced
 * today, non-zero streak) the chip drops to a flat neutral tint instead
 * of staying saturated all day — the color pop is earned by today's
 * action, not just decoration that's always on.
 */
export function StreakIndicator({
  currentStreak,
  longestStreak,
  practicedToday = false,
  freezesAvailable = 0,
  expired = false,
  size = 'sm',
}: StreakIndicatorProps) {
  const isLive = !expired && (practicedToday || currentStreak > 0)
  const iconSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
  const textSize = size === 'lg' ? 'text-lg' : 'text-sm'

  return (
    <div className="inline-flex items-center gap-2">
      <div className={`streak-chip ${isLive ? 'streak-chip-active' : 'streak-chip-idle'}`}>
        <Flame className={iconSize} strokeWidth={2} fill={isLive ? 'currentColor' : 'none'} />
        <span className={`font-display font-bold tabular-nums ${textSize}`}>{currentStreak}</span>
        {freezesAvailable > 0 && (
          <span className="flex items-center gap-0.5 text-sky-500 ml-0.5" title={`${freezesAvailable} streak freeze(s) active`}>
            <Snowflake className="w-3.5 h-3.5" strokeWidth={2} />
          </span>
        )}
      </div>
      {typeof longestStreak === 'number' && (
        <span className="text-xs text-slate-400">Best: {longestStreak}</span>
      )}
    </div>
  )
}
