import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/** Toast system — context provider + useToast() hook. role=status, auto-dismiss,
 * reduced-motion safe (entrance animation collapses under the global rule). */

type ToastTone = 'success' | 'error' | 'info'
interface Toast {
  id: number
  tone: ToastTone
  message: string
}

interface ToastCtx {
  show: (message: string, tone?: ToastTone) => void
}
const Ctx = createContext<ToastCtx | null>(null)

const toneClass: Record<ToastTone, string> = {
  success: 'border-success-500 bg-success-100 text-success-700',
  error: 'border-error-500 bg-error-100 text-error-700',
  info: 'border-line bg-white text-ink-800',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const show = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, tone, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 end-4 z-[60] flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn('animate-fade-in-up rounded-control border px-4 py-3 text-sm shadow-lift', toneClass[t.tone])}
          >
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx)
  if (!ctx) return { show: () => {} } // no-op if provider absent (safe default)
  return ctx
}
