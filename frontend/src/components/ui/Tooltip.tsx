import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils/cn'

/**
 * Tooltip — Radix-backed (hover + focus, ESC dismiss, ARIA). Use sparingly for
 * children (prefer visible labels); good for icon-only utilities. Wrap the app
 * (or a subtree) in TooltipProvider once.
 */
export const TooltipProvider = RadixTooltip.Provider

const TooltipContent = forwardRef<
  ElementRef<typeof RadixTooltip.Content>,
  ComponentPropsWithoutRef<typeof RadixTooltip.Content>
>(function TooltipContent({ className, sideOffset = 6, ...props }, ref) {
  return (
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 rounded-control bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lift',
          className,
        )}
        {...props}
      />
    </RadixTooltip.Portal>
  )
})

export function Tooltip({ children, label, ...root }: { children: ReactNode; label: ReactNode } & RadixTooltip.TooltipProps) {
  return (
    <RadixTooltip.Root {...root}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <TooltipContent>{label}</TooltipContent>
    </RadixTooltip.Root>
  )
}
