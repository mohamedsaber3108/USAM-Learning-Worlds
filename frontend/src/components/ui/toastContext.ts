import { createContext, useContext } from 'react'

/** Toast context + hook, split out of Toast.tsx (react-refresh/
 * only-export-components: a file with JSX components must only export
 * components). */
export type ToastTone = 'success' | 'error' | 'info'

export interface ToastCtx {
  show: (message: string, tone?: ToastTone) => void
}

export const ToastContext = createContext<ToastCtx | null>(null)

export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext)
  if (!ctx) return { show: () => {} } // no-op if provider absent (safe default)
  return ctx
}
