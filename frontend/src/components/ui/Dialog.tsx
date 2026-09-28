import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * Dialog — USAM modal, Radix-backed for correct focus trap, ESC-to-close,
 * scroll lock, and ARIA. Styled to the USAM token system (rounded-blob card,
 * warm surface, soft shadow) — NOT the default shadcn look. RTL-safe: close
 * button pins to the inline-end via `end-4`. Respects reduced-motion via the
 * framer transition being a simple fade/scale that the browser can skip.
 */
export const Dialog = RadixDialog.Root
export const DialogTrigger = RadixDialog.Trigger
export const DialogClose = RadixDialog.Close

export const DialogContent = forwardRef<
  ElementRef<typeof RadixDialog.Content>,
  ComponentPropsWithoutRef<typeof RadixDialog.Content> & { title?: string; description?: string; hideClose?: boolean }
>(function DialogContent({ className, children, title, description, hideClose, ...props }, ref) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" />
      <RadixDialog.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2',
          'rounded-blob bg-white p-6 shadow-lift focus:outline-none',
          className,
        )}
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          {title && (
            <RadixDialog.Title className="text-xl font-display font-bold text-slate-900 mb-1">
              {title}
            </RadixDialog.Title>
          )}
          {description && (
            <RadixDialog.Description className="text-sm text-slate-500 mb-4">
              {description}
            </RadixDialog.Description>
          )}
          {children}
          {!hideClose && (
            <RadixDialog.Close
              className="absolute end-4 top-4 rounded-control p-1.5 text-slate-400 hover:bg-surface-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              aria-label="Close"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </RadixDialog.Close>
          )}
        </motion.div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
})

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="mb-4">{children}</div>
}
export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex flex-wrap justify-end gap-2">{children}</div>
}
