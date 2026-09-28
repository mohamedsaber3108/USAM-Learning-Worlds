import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ElementRef } from 'react'
import * as RadixProgress from '@radix-ui/react-progress'
import { cn } from '@/lib/utils/cn'

/**
 * Progress — Radix-backed linear progress with correct ARIA (role=progressbar,
 * aria-valuenow/min/max). USAM teal fill on a soft track. `value` is 0–100.
 */
export const Progress = forwardRef<
  ElementRef<typeof RadixProgress.Root>,
  ComponentPropsWithoutRef<typeof RadixProgress.Root> & {
    value?: number
    tone?: 'primary' | 'secondary' | 'success'
    /** Accessible name for the progressbar (WCAG: a progressbar needs a name). */
    label?: string
  }
>(function Progress({ className, value = 0, tone = 'primary', label = 'Progress', 'aria-label': ariaLabel, ...props }, ref) {
  const clamped = Math.max(0, Math.min(100, value))
  const fill =
    tone === 'secondary' ? 'bg-secondary-500' : tone === 'success' ? 'bg-success-500' : 'bg-primary-500'
  return (
    <RadixProgress.Root
      ref={ref}
      value={clamped}
      aria-label={ariaLabel ?? label}
      className={cn('relative h-2.5 w-full overflow-hidden rounded-pill bg-surface-200', className)}
      {...props}
    >
      {/* Width-based fill is direction-agnostic (works in LTR and RTL without
          transform math); the track is a flex row so the fill grows from the
          inline-start edge in both directions. */}
      <RadixProgress.Indicator
        className={cn('h-full rounded-pill transition-[width] duration-500 ease-out', fill)}
        style={{ width: `${clamped}%` }}
      />
    </RadixProgress.Root>
  )
})
