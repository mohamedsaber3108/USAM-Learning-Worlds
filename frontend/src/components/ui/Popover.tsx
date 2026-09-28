import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ElementRef } from 'react'
import * as RadixPopover from '@radix-ui/react-popover'
import { cn } from '@/lib/utils/cn'

/**
 * Popover — Radix-backed (focus management, outside-click/ESC dismiss, ARIA).
 * USAM card surface. RTL-safe via Radix side/align mirroring.
 */
export const Popover = RadixPopover.Root
export const PopoverTrigger = RadixPopover.Trigger
export const PopoverClose = RadixPopover.Close

export const PopoverContent = forwardRef<
  ElementRef<typeof RadixPopover.Content>,
  ComponentPropsWithoutRef<typeof RadixPopover.Content>
>(function PopoverContent({ className, sideOffset = 8, ...props }, ref) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-72 rounded-card bg-white p-4 shadow-lift border border-surface-200/70 outline-none',
          className,
        )}
        {...props}
      />
    </RadixPopover.Portal>
  )
})
