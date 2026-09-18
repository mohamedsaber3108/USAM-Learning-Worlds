import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * PageHeader — consistent title block for every logged-in page so the app
 * reads as one product instead of 90 differently-styled screens. Optional
 * eyebrow kicker, subtitle, and a right-aligned actions slot.
 */
export interface PageHeaderProps {
  title: ReactNode
  eyebrow?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  icon?: ReactNode
  className?: string
}

export function PageHeader({ title, eyebrow, subtitle, actions, icon, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4 mb-6', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="icon-chip bg-primary-50 text-primary-600 shrink-0 mt-0.5">{icon}</div>
        )}
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
          <h1 className="display-lg">{title}</h1>
          {subtitle && <p className="mt-1.5 text-slate-500 text-sm sm:text-base">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
