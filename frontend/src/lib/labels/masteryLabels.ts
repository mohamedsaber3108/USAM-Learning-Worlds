/**
 * MASTERY — child-language labels. The backend `MasteryState` enum and raw
 * confidence decimals are NEVER shown. Map to kid words + framing per the
 * design system's child-language rule.
 */
export type MasteryState =
  | 'NOT_STARTED'
  | 'INTRODUCED'
  | 'EXPLORING'
  | 'PRACTICING'
  | 'DEVELOPING'
  | 'PROFICIENT'
  | 'MASTERED'

export const MASTERY_LABEL: Record<MasteryState, string> = {
  NOT_STARTED: 'New',
  INTRODUCED: 'Just started',
  EXPLORING: 'Exploring',
  PRACTICING: 'Practicing',
  DEVELOPING: 'Getting stronger',
  PROFICIENT: 'Strong',
  MASTERED: 'Mastered',
}

/** Review/FSRS is framed as "keep it strong", never "FSRS scheduled item". */
export const REVIEW_FRAMING = {
  title: 'Keep it strong',
  subtitle: 'A quick review to lock in what you have learned.',
  emptyAllCaughtUp: 'All caught up — nothing to review right now.',
}

export function masteryLabel(state: string): string {
  return (MASTERY_LABEL as Record<string, string>)[state] ?? 'New'
}
