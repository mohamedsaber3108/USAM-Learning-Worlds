import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { CharacterFace, type CharacterState } from './CharacterFace'

/**
 * CharacterStage — a character rendered at HERO SCALE as a present figure,
 * not a small avatar chip.
 *
 * PORTED + adapted (2026-10-02) from the legacy `frontend/` tree's component of
 * the same name, as part of the Landing/character-presence rebuild (ledger 88
 * task 6). The research addendum in
 * `docs/research/FINAL_FRONTEND_REFERENCE_STUDY.md` section D found that a
 * companion mascot must be a state-driven, present figure (not a decorative
 * icon) to read as safe and legible to children — Landing's prior
 * "Companions" section (a lucide `Users` icon in a circle) failed that bar.
 * `CharacterStage` composes `CharacterFace` at 160-320px on a soft
 * brand-tinted pedestal + ambient glow, with an optional speech bubble, so
 * Azouz & the mentors feel alive and present on the landing hero and anywhere
 * else a companion should lead.
 *
 * No new animation runtime — uses the same framer-motion SVG system already
 * ported in CharacterFace.tsx.
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
  /** Pedestal tint — a hex color for the soft glow behind the figure. Defaults
   * to the USAM brand green (brand-500, #1f7a4d). */
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
  tint = '#1f7a4d',
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
      <div className="relative flex items-end justify-center shrink-0">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full blur-3xl animate-pulse-soft"
          style={{ backgroundColor: `${tint}2e` }}
        />
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
          <CharacterFace characterId={characterId} size={size} state={state} evolutionStage={evolutionStage} animate={animate} />
        </motion.div>
      </div>

      {speech != null && (
        <motion.div
          {...(animate
            ? { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2, duration: 0.3 } }
            : {})}
          className={`relative max-w-xs rounded-card bg-white/95 backdrop-blur border border-line shadow-card px-4 py-3 text-sm text-ink-700 ${
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
