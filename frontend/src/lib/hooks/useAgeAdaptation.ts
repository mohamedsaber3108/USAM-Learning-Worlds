import { useMemo } from 'react'
import type { User } from '@/types'

/**
 * useAgeAdaptation — the single source of truth for how the UI should
 * change based on the signed-in learner's `ageBand`.
 *
 * This is NOT a cosmetic/CSS-only toggle. It returns a structured config
 * that DashboardPage.tsx / AppShell.tsx branch real render logic on:
 * different card counts, different copy strings, different information
 * density — not just different class names on identical markup.
 *
 * Design rationale (see docs/architecture/USAM_COMPETITIVE_UX_AUDIT.md,
 * Finding #2 / Section D): USAM's learner range is 8-14, not toddler-age,
 * so the CodeSpark/Prodigy-validated adaptation axis is vocabulary density
 * and unlock-gated complexity — NOT touch-target size (that pattern is for
 * 2-5 year olds who can't yet reliably tap small targets; it doesn't apply
 * here). Concretely:
 *
 *  - AGE_8_9   -> simplest surface: 3 core stat cards (Level/XP/Streak),
 *                secondary stats (Rank, Mastery breakdown) hidden, short
 *                exclamation-heavy encouraging copy.
 *  - AGE_10_11 -> middle ground: 4 cards (adds Rank), balanced copy tone,
 *                still no full mastery breakdown by default.
 *  - AGE_12_14 -> full information density: 6 cards including Mastery
 *                breakdown + Rank, terser and more mature copy that reads
 *                like real feedback rather than baby talk.
 */

export type AgeBand = 'AGE_8_9' | 'AGE_10_11' | 'AGE_12_14'

export type DensityLevel = 'simple' | 'balanced' | 'detailed'
export type VocabularyLevel = 'playful' | 'balanced' | 'mature'
export type CopyTone = 'encouraging-simple' | 'encouraging-balanced' | 'encouraging-mature'

export interface AgeAdaptationConfig {
  band: AgeBand
  density: DensityLevel
  vocabularyLevel: VocabularyLevel
  showAllStats: boolean
  maxVisibleCards: number
  copyTone: CopyTone
}

// The single lookup table every component branches on. Keeping this as one
// exported map (rather than scattering literals through components) is what
// makes the adaptation auditable and testable in one place.
const ADAPTATION_TABLE: Record<AgeBand, AgeAdaptationConfig> = {
  AGE_8_9: {
    band: 'AGE_8_9',
    density: 'simple',
    vocabularyLevel: 'playful',
    showAllStats: false,
    maxVisibleCards: 3,
    copyTone: 'encouraging-simple',
  },
  AGE_10_11: {
    band: 'AGE_10_11',
    density: 'balanced',
    vocabularyLevel: 'balanced',
    showAllStats: false,
    maxVisibleCards: 4,
    copyTone: 'encouraging-balanced',
  },
  AGE_12_14: {
    band: 'AGE_12_14',
    density: 'detailed',
    vocabularyLevel: 'mature',
    showAllStats: true,
    maxVisibleCards: 6,
    copyTone: 'encouraging-mature',
  },
}

// Fallback for accounts that somehow reach an authenticated page without
// having completed onboarding (ageBand null/undefined) — default to the
// middle band rather than the most-permissive or most-restrictive extreme.
const DEFAULT_BAND: AgeBand = 'AGE_10_11'

function isAgeBand(value: unknown): value is AgeBand {
  return value === 'AGE_8_9' || value === 'AGE_10_11' || value === 'AGE_12_14'
}

/**
 * Reads the current learner's ageBand the same way the rest of the app
 * currently accesses the signed-in user (frontend/src/features/auth has no
 * separate context/provider — the authenticated user is cached in
 * localStorage under the 'user' key by LoginPage/RegisterPage and read
 * directly, e.g. in DashboardPage.tsx / AppShell.tsx today).
 */
function readAgeBandFromStorage(): AgeBand {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return DEFAULT_BAND
    const user = JSON.parse(raw) as User
    const ageBand = user?.learner?.ageBand
    return isAgeBand(ageBand) ? ageBand : DEFAULT_BAND
  } catch {
    return DEFAULT_BAND
  }
}

/**
 * useAgeAdaptation — optionally pass an explicit ageBand (e.g. from a
 * freshly-fetched user object) to avoid re-reading localStorage; otherwise
 * it reads the cached signed-in learner directly.
 */
export function useAgeAdaptation(explicitAgeBand?: string | null): AgeAdaptationConfig {
  return useMemo(() => {
    const band = isAgeBand(explicitAgeBand) ? explicitAgeBand : readAgeBandFromStorage()
    return ADAPTATION_TABLE[band]
  }, [explicitAgeBand])
}

export { ADAPTATION_TABLE }
