import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * Button — the single canonical button primitive for the redesigned UI.
 *
 * Accessibility (Radix/Ark-aligned): real <button>, visible focus-visible
 * ring, disabled + aria-busy loading state that keeps size stable, and
 * icon slots that flip for RTL where relevant (callers pass rtl:scale-x-[-1]
 * on directional icons). Variants map to the design tokens in tailwind.config.
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'ghost'
  | 'outline'
  | 'danger'
  | 'hero'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 shadow-soft hover:shadow-soft-hover focus-visible:ring-primary-300',
  secondary:
    'bg-white text-primary-700 border border-surface-200 hover:bg-surface-100 shadow-soft focus-visible:ring-primary-300',
  accent:
    'bg-accent-500 text-white hover:bg-accent-600 shadow-soft hover:shadow-soft-hover focus-visible:ring-accent-300',
  ghost: 'bg-transparent text-slate-600 hover:bg-surface-100 focus-visible:ring-primary-300',
  outline:
    'bg-transparent border border-surface-300 text-slate-700 hover:bg-surface-100 focus-visible:ring-primary-300',
  danger:
    'bg-error-500 text-white hover:bg-error-600 shadow-soft focus-visible:ring-error-300',
  hero: 'bg-brand-hero text-white shadow-hero hover:-translate-y-0.5 focus-visible:ring-primary-300/60',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-2 text-xs gap-1.5 rounded-control',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-control',
  lg: 'px-7 py-3.5 text-base gap-2 rounded-pill',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:opacity-60 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  )
})
