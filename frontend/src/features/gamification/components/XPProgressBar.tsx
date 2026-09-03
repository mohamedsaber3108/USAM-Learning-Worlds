import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export interface XPProgressBarProps {
  /** 0-100, current progress toward the next level. */
  value: number
  /** Optional "N / M XP" style label rendered above the bar. */
  label?: string
  /** Small caption under the label (e.g. "Progress to Level 5"). */
  caption?: string
  className?: string
}

/**
 * Restrained XP progress bar.
 *
 * Design intent: this is the ONE place in the app that gets the gold
 * `secondary` color at real width — a deliberate, tasteful use of the
 * palette's reserved "XP / rewards" hue (see tailwind.config.js comment
 * on `secondary`). No gradient, no rainbow — a single flat fill color
 * with a one-shot shimmer sweep that plays only when the value increases,
 * so filling up feels like a small reward without turning into constant
 * motion/decoration.
 */
export function XPProgressBar({ value, label, caption, className = '' }: XPProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value || 0))
  const [shimmerKey, setShimmerKey] = useState(0)
  const [prevValue, setPrevValue] = useState(clamped)

  useEffect(() => {
    if (clamped > prevValue) {
      // Value grew — play the reward shimmer once.
      setShimmerKey((k) => k + 1)
    }
    setPrevValue(clamped)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamped])

  return (
    <div className={className}>
      {(label || caption) && (
        <div className="flex justify-between items-baseline text-sm text-slate-500 mb-2">
          {caption && <span>{caption}</span>}
          {label && <span className="font-medium text-slate-700">{label}</span>}
        </div>
      )}
      <div className="xp-progress-track" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          className="xp-progress-fill"
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {shimmerKey > 0 && (
            <motion.span
              key={shimmerKey}
              className="absolute inset-y-0 left-0 w-1/3 bg-white/40 skew-x-[-20deg]"
              initial={{ x: '-120%' }}
              animate={{ x: '220%' }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}
