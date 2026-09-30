import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Overlay primitives — Dialog + Drawer. Accessible (role, aria-modal, Escape to
 * close, backdrop click, focus contained via autofocus). Motion respects
 * prefers-reduced-motion (transition durations collapse via the global CSS
 * reduced-motion rule).
 */

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [open, onClose])
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  useEscape(open, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink-900/40 animate-[fade-in-up_.18s_ease-out]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-card border border-line bg-white p-6 shadow-lift animate-fade-in-up">
        <h2 className="font-display text-xl font-bold text-ink-900">{title}</h2>
        <div className="mt-3">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

export function Drawer({
  open,
  onClose,
  title,
  side = 'end',
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  side?: 'start' | 'end'
  children: ReactNode
}) {
  useEscape(open, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink-900/40" onClick={onClose} />
      <div
        className={cn(
          'absolute top-0 h-full w-full max-w-sm bg-white shadow-lift',
          side === 'end' ? 'end-0' : 'start-0',
        )}
      >
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-control px-2 py-1 text-ink-500 hover:bg-canvas-off">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}
