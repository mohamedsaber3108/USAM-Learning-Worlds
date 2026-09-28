import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import * as RadixToast from '@radix-ui/react-toast'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * Toast — Radix-backed (screen-reader announcements via role/aria-live, swipe
 * dismiss, timed close). USAM tone styling. Use via the `useToast()` hook after
 * wrapping the tree in <ToastProvider>. Non-blocking, non-manipulative — for
 * confirmations and gentle errors, never for children's guilt/FOMO.
 */
type ToastTone = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  title: string
  description?: string
  tone: ToastTone
}

const ToastCtx = createContext<{ push: (t: Omit<ToastItem, 'id'>) => void } | null>(null)

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

const TONE_ICON = { success: CheckCircle2, error: AlertCircle, info: Info } as const
const TONE_CLASS: Record<ToastTone, string> = {
  success: 'text-success-600',
  error: 'text-error-600',
  info: 'text-primary-600',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const push = useCallback((t: Omit<ToastItem, 'id'>) => {
    setItems((prev) => [...prev, { ...t, id: Date.now() + Math.random() }])
  }, [])

  return (
    <ToastCtx.Provider value={{ push }}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {items.map((item) => {
          const Icon = TONE_ICON[item.tone]
          return (
            <RadixToast.Root
              key={item.id}
              duration={4000}
              onOpenChange={(open: boolean) => {
                if (!open) setItems((prev) => prev.filter((i) => i.id !== item.id))
              }}
              className={cn(
                'flex items-start gap-3 rounded-card bg-white p-4 shadow-lift border border-surface-200/70',
              )}
            >
              <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', TONE_CLASS[item.tone])} strokeWidth={2} />
              <div className="flex-1 min-w-0">
                <RadixToast.Title className="text-sm font-display font-semibold text-slate-900">
                  {item.title}
                </RadixToast.Title>
                {item.description && (
                  <RadixToast.Description className="text-sm text-slate-500 mt-0.5">
                    {item.description}
                  </RadixToast.Description>
                )}
              </div>
              <RadixToast.Close aria-label="Dismiss" className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" strokeWidth={2} />
              </RadixToast.Close>
            </RadixToast.Root>
          )
        })}
        <RadixToast.Viewport className="fixed bottom-4 end-4 z-[60] flex w-[min(92vw,24rem)] flex-col gap-2 outline-none" />
      </RadixToast.Provider>
    </ToastCtx.Provider>
  )
}
