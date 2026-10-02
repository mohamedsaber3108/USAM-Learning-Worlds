import { useCallback, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { ToastContext, type ToastTone } from './toastContext'

/** Toast system — context provider. role=status, auto-dismiss,
 * reduced-motion safe (entrance animation collapses under the global rule).
 * useToast() lives in ./toastContext (fast-refresh: this file exports only
 * the ToastProvider component). */

interface Toast {
  id: number
  tone: ToastTone
  message: string
}

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
    <ToastContext.Provider value={{ show }}>
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
    </ToastContext.Provider>
  )
}
