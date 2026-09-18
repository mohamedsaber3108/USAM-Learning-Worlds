import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * HeroHeader — the branded gradient banner used at the top of logged-in
 * feature pages so the whole app leads with one consistent, energetic
 * header instead of a bare heading on gray. Decorative dots + glow are
 * aria-hidden. RTL-safe (uses -end-* for the glow).
 *
 * Kept as a single self-contained component so pages adopt it with one
 * import + one element (avoids fragile multi-line edits on older files).
 */
export interface HeroHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  /** Right-aligned actions (buttons, badges). */
  actions?: ReactNode
  /** Optional visual on the trailing side (e.g. a CharacterFace). */
  visual?: ReactNode
  className?: string
}

export function HeroHeader({ title, subtitle, icon, actions, visual, className }: HeroHeaderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-blob bg-brand-hero text-white p-6 sm:p-8 mb-8 shadow-lift',
        className,
      )}
    >
      <div aria-hidden className="dots-layer opacity-[0.15]" />
      <div aria-hidden className="absolute -top-10 -end-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="icon-chip bg-white/15 text-white shrink-0">{icon}</div>
          )}
          <div className="min-w-0">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl leading-tight">{title}</h1>
            {subtitle && <p className="text-white/80 text-sm mt-1">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        {visual && <div className="shrink-0 hidden sm:block">{visual}</div>}
      </div>
    </div>
  )
}
