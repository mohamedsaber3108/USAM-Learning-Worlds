import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { CharacterFace, type CharacterState } from './CharacterFace'

/**
 * CharacterStage — a character rendered at HERO SCALE as a present figure, not
 * a small avatar chip.
 *
 * This is the fix for experience-defect L2/§9/§10: the rich `CharacterFace`
 * SVG system (15 bespoke animated designs, 7 emotional states) was being
 * rendered at 22–88px inside `rounded-full` dots, so characters read as icons
 * instead of companions. `CharacterStage` composes the SAME component at
 * 160–320px on a soft world-tinted pedestal + ambient glow, with an optional
 * speech bubble, so Azouz & the mentors feel alive and present on the landing
 * hero, the home hero, and the world/domain places.
 *
 * No new animation runtime (Rive/Lottie/Pixi) — directive §10 is satisfied by
 * scaling + state-wiring the existing SVG system (see
 * plans-local/91_LOCKED_EXPERIENCE_DIRECTION.md §1).
 */
export interface CharacterStageProps {
  /** Character name (matches CharacterFace keys), case-insensitive. */
  characterId: string
  /** Rendered character size in px. Hero scale by default. */
  size?: number
  /** Emotional/interaction state wired to context (greeting = speaking, etc). */
  state?: CharacterState
  /** Relationship-evolution stage 1-5 (soft glow at 3+). */
  evolutionStage?: 1 | 2 | 3 | 4 | 5
  /** Optional speech line shown in a bubble beside the character. */
  speech?: ReactNode
  /** Pedestal tint — a hex (world hue) for the soft glow behind the figure. */
  tint?: string
  /** Where the speech bubble sits relative to the figure. */
  bubbleSide?: 'end' | 'top'
  /** Disable idle + state motion (reduced-motion / tiny contexts). */
  animate?: boolean
  className?: string
}

export function CharacterStage({
  characterId,
  size = 220,
  state = 'idle',
  evolutionStage = 1,
  speech,
  tint = '#1c5a4d',
  bubbleSide = 'end',
  animate = true,
  className = '',
}: CharacterStageProps) {
  return (
    <div
      className={`relative flex ${
        bubbleSide === 'top' ? 'flex-col items-center' : 'items-center gap-4'
      } ${className}`}
    >
      {/* Figure on a soft tinted pedestal + ambient glow. */}
      <div className="relative flex items-end justify-center shrink-0">
        {/* Ambient glow — world-hue, breathing. aria-hidden. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full blur-3xl animate-pulse-soft"
          style={{ backgroundColor: `${tint}2e` }}
        />
        {/* Ground pedestal — a soft elliptical shadow so the figure "stands". */}
        <div
          aria-hidden
          className="absolute bottom-1 left-1/2 -translate-x-1/2 h-3 rounded-[50%] blur-md"
          style={{ width: size * 0.6, backgroundColor: `${tint}33` }}
        />
        <motion.div
          {...(animate
            ? {
                initial: { opacity: 0, scale: 0.9, y: 8 },
                animate: { opacity: 1, scale: 1, y: 0 },
                transition: { type: 'spring' as const, stiffness: 120, damping: 16 },
              }
            : {})}
        >
          <CharacterFace
            characterId={characterId}
            size={size}
            state={state}
            evolutionStage={evolutionStage}
            animate={animate}
          />
        </motion.div>
      </div>

      {/* Speech bubble — logical-side aware (RTL-safe via start/end + arrow). */}
      {speech != null && (
        <motion.div
          {...(animate
            ? {
                initial: { opacity: 0, y: 6 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.2, duration: 0.3 },
              }
            : {})}
          className={`relative max-w-xs rounded-blob bg-white/95 backdrop-blur border border-surface-200 shadow-soft-md px-4 py-3 text-sm text-slate-700 ${
            bubbleSide === 'top' ? 'mt-3' : ''
          }`}
          role="note"
        >
          {speech}
        </motion.div>
      )}
    </div>
  )
}
