import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ElementRef } from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils/cn'

/**
 * Tabs — Radix-backed (arrow-key roving, ARIA tablist/tab/tabpanel). USAM pill
 * style with an active teal underline. RTL handled by Radix + logical spacing.
 */
export const Tabs = RadixTabs.Root

export const TabsList = forwardRef<
  ElementRef<typeof RadixTabs.List>,
  ComponentPropsWithoutRef<typeof RadixTabs.List>
>(function TabsList({ className, ...props }, ref) {
  return (
    <RadixTabs.List
      ref={ref}
      className={cn('inline-flex items-center gap-1 rounded-pill bg-surface-100 p-1', className)}
      {...props}
    />
  )
})

export const TabsTrigger = forwardRef<
  ElementRef<typeof RadixTabs.Trigger>,
  ComponentPropsWithoutRef<typeof RadixTabs.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <RadixTabs.Trigger
      ref={ref}
      className={cn(
        'rounded-pill px-4 py-1.5 text-sm font-semibold text-slate-500 transition-colors outline-none',
        'hover:text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-300',
        'data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-soft',
        className,
      )}
      {...props}
    />
  )
})

export const TabsContent = forwardRef<
  ElementRef<typeof RadixTabs.Content>,
  ComponentPropsWithoutRef<typeof RadixTabs.Content>
>(function TabsContent({ className, ...props }, ref) {
  return <RadixTabs.Content ref={ref} className={cn('mt-4 outline-none', className)} {...props} />
})
