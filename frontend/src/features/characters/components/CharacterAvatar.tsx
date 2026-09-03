import { Lock } from 'lucide-react'
import { getCharacterVisual } from '../lib/characterVisuals'
import { CharacterFace } from './CharacterFace'

/**
 * Reusable avatar for a character.
 *
 * Renders the character's hand-crafted illustrated SVG (see CharacterFace)
 * with a soft accent-colored glow behind it, in both a small (nav/card) and
 * large (gallery/chat header) footprint. Locked characters still render
 * their real design — just desaturated to a silhouette — so kids see who
 * they're working toward unlocking rather than a mystery blank.
 */
export interface CharacterAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Locked characters render as a grayed silhouette with a lock badge. */
  locked?: boolean
  /**
   * Real relationship-derived visual-leveling stage (1-5), from
   * GET /characters/:id/state's relationshipLevel. Omit for contexts with
   * no per-learner state (e.g. gallery cards before any chat has happened).
   */
  evolutionStage?: 1 | 2 | 3 | 4 | 5
  className?: string
}

const SIZE_MAP: Record<NonNullable<CharacterAvatarProps['size']>, { box: string; px: number; lock: string }> = {
  sm: { box: 'w-9 h-9', px: 36, lock: 'w-3 h-3' },
  md: { box: 'w-12 h-12', px: 48, lock: 'w-3.5 h-3.5' },
  lg: { box: 'w-16 h-16', px: 64, lock: 'w-4 h-4' },
  xl: { box: 'w-24 h-24', px: 96, lock: 'w-5 h-5' },
}

export function CharacterAvatar({ name, size = 'md', locked = false, evolutionStage, className = '' }: CharacterAvatarProps) {
  const visual = getCharacterVisual(name)
  const sizing = SIZE_MAP[size]

  return (
    <div
      className={`relative shrink-0 rounded-full flex items-center justify-center overflow-hidden ${sizing.box} ${className}`}
      style={{ backgroundColor: locked ? '#E2E8F0' : `${visual.color}22` }}
      aria-label={locked ? `${name} (locked)` : name}
    >
      <CharacterFace characterId={name} size={sizing.px} locked={locked} evolutionStage={evolutionStage ?? 1} />
      {locked && (
        <span className="absolute -bottom-0.5 -right-0.5 bg-slate-600 rounded-full p-1 border-2 border-white">
          <Lock className={`${sizing.lock} text-white`} strokeWidth={2.5} />
        </span>
      )}
    </div>
  )
}
