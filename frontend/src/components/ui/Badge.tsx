import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/** Badge / pill label with tone variants tied to the semantic token scales. */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'primary' | 'accent' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral' | 'sky' | 'grape'
  children: ReactNode
}

const TONES: Record<NonNullable<BadgeProps['tone']>, string> = {
  primary: 'bg-primary-50 text-primary-700 border-primary-100',
  accent: 'bg-accent-50 text-accent-700 border-accent-100',
  secondary: 'bg-secondary-50 text-secondary-700 border-secondary-100',
  success: 'bg-success-50 text-success-700 border-success-100',
  warning: 'bg-warning-50 text-warning-700 border-warning-100',
  error: 'bg-error-50 text-error-700 border-error-100',
  neutral: 'bg-surface-100 text-slate-600 border-surface-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-100',
  grape: 'bg-grape-50 text-grape-700 border-grape-100',
}

export function Badge({ tone = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-xs font-semibold border',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
