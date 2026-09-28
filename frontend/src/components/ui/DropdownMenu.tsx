import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ElementRef } from 'react'
import * as RadixMenu from '@radix-ui/react-dropdown-menu'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * DropdownMenu — Radix-backed for keyboard nav, roving focus, type-ahead, and
 * ARIA. Styled to USAM tokens. RTL-safe via logical `align`/`start` handling
 * (Radix mirrors automatically off document dir).
 */
export const DropdownMenu = RadixMenu.Root
export const DropdownMenuTrigger = RadixMenu.Trigger
export const DropdownMenuLabel = RadixMenu.Label
export const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof RadixMenu.Separator>,
  ComponentPropsWithoutRef<typeof RadixMenu.Separator>
>(function Separator({ className, ...props }, ref) {
  return <RadixMenu.Separator ref={ref} className={cn('my-1 h-px bg-surface-200', className)} {...props} />
})

export const DropdownMenuContent = forwardRef<
  ElementRef<typeof RadixMenu.Content>,
  ComponentPropsWithoutRef<typeof RadixMenu.Content>
>(function Content({ className, sideOffset = 6, ...props }, ref) {
  return (
    <RadixMenu.Portal>
      <RadixMenu.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[10rem] rounded-card bg-white p-1.5 shadow-lift border border-surface-200/70',
          className,
        )}
        {...props}
      />
    </RadixMenu.Portal>
  )
})

export const DropdownMenuItem = forwardRef<
  ElementRef<typeof RadixMenu.Item>,
  ComponentPropsWithoutRef<typeof RadixMenu.Item> & { selected?: boolean }
>(function Item({ className, children, selected, ...props }, ref) {
  return (
    <RadixMenu.Item
      ref={ref}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded-control px-3 py-2 text-sm text-slate-700 outline-none',
        'data-[highlighted]:bg-surface-100 data-[highlighted]:text-slate-900 data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
        className,
      )}
      {...props}
    >
      {children}
      {selected && <Check className="ms-auto w-4 h-4 text-primary-600" strokeWidth={2.5} />}
    </RadixMenu.Item>
  )
})
