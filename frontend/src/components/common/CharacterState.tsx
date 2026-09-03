import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CharacterFace } from '@/features/characters/components/CharacterFace'

/**
 * Shared, on-brand loading / empty / error states built around the four
 * core companion characters (Azouz, Zein, Luma, Codey) instead of a bare
 * spinner or a plain "Something went wrong" message.
 *
 * No new art needed — these reuse the existing hand-crafted CharacterFace
 * SVGs (frontend/src/features/characters/components/CharacterFace.tsx),
 * which already have a gentle idle bob + blink animation, so a page in a
 * loading/empty/error state still feels alive rather than frozen.
 *
 * Tone rules (kid-appropriate, 8-14 audience):
 *  - Loading: short, playful "what the character is doing" line, not
 *    a bare "Loading...".
 *  - Empty: encouraging, names a clear next action (button/link).
 *  - Error: reassuring, no red/alarming language, always offers Retry.
 */

export type CompanionName =
  | 'Azouz'
  | 'Zein'
  | 'Luma'
  | 'Codey'
  | 'Nova'
  | 'Mira'
  | 'Rami'
  | 'Faris'
  | 'Tala'
  | 'Adam'
  | 'Byte'
  | 'Nour'
  | 'Rex'
  | 'Zara'
  | 'Atlas'

function CompanionFace({ character, size }: { character: CompanionName; size: number }) {
  return <CharacterFace characterId={character} size={size} animate />
}

/* ------------------------------------------------------------------ */
/* Loading                                                             */
/* ------------------------------------------------------------------ */

export interface LoadingStateProps {
  /** Which companion is shown doing the waiting. */
  character?: CompanionName
  /** Short friendly line, e.g. "Azouz is fetching your missions...". */
  message: string
  /** Optional smaller helper line underneath. */
  hint?: string
  size?: number
  className?: string
}

export function LoadingState({
  character = 'Azouz',
  message,
  hint,
  size = 72,
  className = '',
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center text-center py-12 ${className}`}
    >
      <CompanionFace character={character} size={size} />
      <p className="mt-4 font-display font-semibold text-slate-700">{message}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Empty                                                               */
/* ------------------------------------------------------------------ */

export interface EmptyStateProps {
  character?: CompanionName
  title: string
  message: string
  actionLabel?: string
  /** Renders the action as a <Link> when provided. */
  actionTo?: string
  /** Renders the action as a <button onClick> when provided instead of actionTo. */
  onAction?: () => void
  size?: number
  children?: ReactNode
  className?: string
}

export function EmptyState({
  character = 'Azouz',
  title,
  message,
  actionLabel,
  actionTo,
  onAction,
  size = 80,
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`card text-center py-12 ${className}`}>
      <div className="flex justify-center mb-4">
        <CompanionFace character={character} size={size} />
      </div>
      <h3 className="text-xl font-display font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 max-w-sm mx-auto">{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary mt-5 inline-flex">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button type="button" onClick={onAction} className="btn btn-primary mt-5">
          {actionLabel}
        </button>
      )}
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Error                                                                */
/* ------------------------------------------------------------------ */

export interface ErrorStateProps {
  character?: CompanionName
  /** Reassuring title — avoid "Error"/"Failed"/red alarm language. */
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  size?: number
  className?: string
}

export function ErrorState({
  character = 'Azouz',
  title = "Hmm, that didn't load",
  message = "No worries — this happens sometimes. Let's give it another try.",
  onRetry,
  retryLabel = 'Try again',
  size = 72,
  className = '',
}: ErrorStateProps) {
  return (
    <div role="status" aria-live="polite" className={`card text-center py-10 ${className}`}>
      <div className="flex justify-center mb-4">
        <CompanionFace character={character} size={size} />
      </div>
      <h3 className="text-lg font-display font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-600 max-w-sm mx-auto text-sm">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-primary mt-5">
          {retryLabel}
        </button>
      )}
    </div>
  )
}
