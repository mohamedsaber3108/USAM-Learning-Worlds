import { Lock } from 'lucide-react'
import { getCharacterVisual } from '../lib/characterVisuals'

/**
 * Reusable icon-based avatar for a character.
 *
 * v1 honest visual: a colored circle (per-character accent) + a lucide-react
 * icon. There is no illustrated/Rive character art yet — this component is
 * the deliberate stand-in, and it's built so the *rendering* can be swapped
 * for real character art later (per
 * docs/architecture/USAM_FRONTEND_UX_UPGRADE_PLAN.md) without touching this
 * props contract. Every place a character avatar appears (gallery cards,
 * chat header, onboarding, etc.) should render through this component.
 */
export interface CharacterAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Locked characters render as a grayed silhouette with a lock badge. */
  locked?: boolean
  className?: string
}

const SIZE_MAP: Record<NonNullable<CharacterAvatarProps['size']>, { box: string; icon: string; lock: string }> = {
  sm: { box: 'w-9 h-9', icon: 'w-4 h-4', lock: 'w-3 h-3' },
  md: { box: 'w-12 h-12', icon: 'w-6 h-6', lock: 'w-3.5 h-3.5' },
  lg: { box: 'w-16 h-16', icon: 'w-8 h-8', lock: 'w-4 h-4' },
  xl: { box: 'w-24 h-24', icon: 'w-12 h-12', lock: 'w-5 h-5' },
}

export function CharacterAvatar({ name, size = 'md', locked = false, className = '' }: CharacterAvatarProps) {
  const visual = getCharacterVisual(name)
  const Icon = visual.icon
  const sizing = SIZE_MAP[size]

  return (
    <div
      className={`relative shrink-0 rounded-full flex items-center justify-center ${sizing.box} ${className}`}
      style={{ backgroundColor: locked ? '#CBD5E1' : visual.color }}
      aria-label={locked ? `${name} (locked)` : name}
    >
      <Icon
        className={`${sizing.icon} ${locked ? 'text-white/70' : 'text-white'}`}
        strokeWidth={2.2}
      />
      {locked && (
        <span className="absolute -bottom-0.5 -right-0.5 bg-slate-600 rounded-full p-1 border-2 border-white">
          <Lock className={`${sizing.lock} text-white`} strokeWidth={2.5} />
        </span>
      )}
    </div>
  )
}
