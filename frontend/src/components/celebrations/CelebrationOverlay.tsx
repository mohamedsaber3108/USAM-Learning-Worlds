import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, Flame, PartyPopper } from 'lucide-react'
import type { MilestoneResult } from '@/lib/hooks/useMilestoneDetection'

const AUTO_DISMISS_MS = 3600

const CONFETTI_COLORS = [
  '#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899',
]

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotate: number
  color: string
  size: number
  delay: number
}

function useConfettiPieces(count = 42): ConfettiPiece[] {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, id) => {
        const angle = Math.random() * Math.PI * 2
        const distance = 90 + Math.random() * 220
        return {
          id,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 40, // slight upward bias
          rotate: Math.random() * 360,
          color: CONFETTI_COLORS[id % CONFETTI_COLORS.length] || '#4f46e5',
          size: 6 + Math.random() * 8,
          delay: Math.random() * 0.15,
        }
      }),
    [count]
  )
}

function levelUpCopy(level: number) {
  return `Level ${level}! You're on fire!`
}

function streakCopy(days: number) {
  return `${days}-day streak! Amazing consistency!`
}

function firstMissionCopy() {
  return 'First mission complete! Welcome to the journey!'
}

function masteryCopy(count: number) {
  return `${count} skill${count === 1 ? '' : 's'} mastered! Keep it up!`
}

/** Confetti-burst — used for level-up. */
function LevelUpCelebration({ level, onDismiss }: { level: number; onDismiss: () => void }) {
  const pieces = useConfettiPieces(48)

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      role="alertdialog"
      aria-label="Level up celebration"
    >
      <div className="relative flex items-center justify-center">
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-sm"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              top: '50%',
              left: '50%',
            }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
            animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 1 }}
            transition={{ duration: 1.4 + Math.random() * 0.6, delay: p.delay, ease: 'easeOut' }}
          />
        ))}

        <motion.div
          className="relative z-10 bg-white rounded-2xl px-8 py-7 shadow-2xl text-center max-w-xs"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary-600" strokeWidth={2} />
          </div>
          <p className="font-display font-extrabold text-xl text-slate-900">
            {levelUpCopy(level)}
          </p>
          <p className="text-sm text-slate-500 mt-1">Tap anywhere to continue</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

/** Flame-pulse/glow — used for streak milestones, intensity scales with days. */
function StreakCelebration({ days, onDismiss }: { days: 7 | 14 | 30 | 100; onDismiss: () => void }) {
  // Scale glow intensity + flame count with milestone size.
  const intensity = days >= 100 ? 4 : days >= 30 ? 3 : days >= 14 ? 2 : 1
  const flameCount = intensity + 1

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      role="alertdialog"
      aria-label="Streak milestone celebration"
    >
      <motion.div
        className="relative bg-white rounded-2xl px-8 py-7 shadow-2xl text-center max-w-xs overflow-visible"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        style={{
          boxShadow: `0 0 ${30 + intensity * 20}px ${8 + intensity * 4}px rgba(249,115,22,0.45)`,
        }}
      >
        <div className="mx-auto mb-3 relative w-16 h-16 flex items-center justify-center">
          {Array.from({ length: flameCount }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full bg-orange-400"
              animate={{ scale: [1, 1.5 + intensity * 0.15, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            />
          ))}
          <div className="relative z-10 w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
            <Flame className="w-7 h-7 text-orange-500" strokeWidth={2} />
          </div>
        </div>
        <p className="font-display font-extrabold text-xl text-slate-900">{streakCopy(days)}</p>
        <p className="text-sm text-slate-500 mt-1">Tap anywhere to continue</p>
      </motion.div>
    </motion.div>
  )
}

/** Simple congratulatory toast — used for first mission ever completed. */
function FirstMissionCelebration({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onClick={onDismiss}
      role="status"
      aria-label="First mission celebration"
    >
      <div className="flex items-center gap-3 bg-white rounded-full shadow-xl px-5 py-3 border border-success-100 cursor-pointer">
        <div className="icon-chip bg-success-50 text-success-600 flex-shrink-0">
          <PartyPopper className="w-5 h-5" strokeWidth={2} />
        </div>
        <p className="font-semibold text-sm text-slate-800 pr-1">{firstMissionCopy()}</p>
      </div>
    </motion.div>
  )
}

/** Mastery milestone — small variant reusing the confetti pattern with mastery copy. */
function MasteryCelebration({ count, onDismiss }: { count: number; onDismiss: () => void }) {
  const pieces = useConfettiPieces(30)

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      role="alertdialog"
      aria-label="Mastery milestone celebration"
    >
      <div className="relative flex items-center justify-center">
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, backgroundColor: p.color, top: '50%', left: '50%' }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
            transition={{ duration: 1.2 + Math.random() * 0.5, delay: p.delay, ease: 'easeOut' }}
          />
        ))}
        <motion.div
          className="relative z-10 bg-white rounded-2xl px-8 py-7 shadow-2xl text-center max-w-xs"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-success-50 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-success-600" strokeWidth={2} />
          </div>
          <p className="font-display font-extrabold text-xl text-slate-900">{masteryCopy(count)}</p>
          <p className="text-sm text-slate-500 mt-1">Tap anywhere to continue</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export interface CelebrationOverlayProps {
  milestone: MilestoneResult | null
  onDismiss: () => void
}

/**
 * Renders exactly ONE celebration variant based on what useMilestoneDetection
 * returned, in priority order (level-up > streak > first-mission > mastery),
 * since normally only one meaningfully "biggest" event should be surfaced
 * per load even if multiple technically fired together.
 * Auto-dismisses after ~3.6s or on tap.
 */
export function CelebrationOverlay({ milestone, onDismiss }: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!milestone) return
    const hasAny =
      milestone.leveledUp ||
      !!milestone.streakMilestone ||
      milestone.firstMissionEver ||
      !!milestone.masteryMilestone
    if (!hasAny) return

    setVisible(true)
    const timer = setTimeout(() => setVisible(false), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [milestone])

  const handleDismiss = () => {
    setVisible(false)
  }

  useEffect(() => {
    if (!visible) return undefined
    // allow exit animation to play before notifying parent
    const t = setTimeout(onDismiss, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  if (!milestone) return null

  return (
    <AnimatePresence>
      {visible && milestone.leveledUp && milestone.newLevel !== undefined && (
        <LevelUpCelebration level={milestone.newLevel} onDismiss={handleDismiss} />
      )}
      {visible && !milestone.leveledUp && milestone.streakMilestone && (
        <StreakCelebration days={milestone.streakMilestone} onDismiss={handleDismiss} />
      )}
      {visible && !milestone.leveledUp && !milestone.streakMilestone && milestone.firstMissionEver && (
        <FirstMissionCelebration onDismiss={handleDismiss} />
      )}
      {visible &&
        !milestone.leveledUp &&
        !milestone.streakMilestone &&
        !milestone.firstMissionEver &&
        milestone.masteryMilestone !== undefined && (
          <MasteryCelebration count={milestone.masteryMilestone} onDismiss={handleDismiss} />
        )}
    </AnimatePresence>
  )
}
