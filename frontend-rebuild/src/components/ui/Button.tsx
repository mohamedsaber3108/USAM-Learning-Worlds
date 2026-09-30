import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  // Green is the dominant brand hue for primary actions.
  primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-soft',
  secondary: 'bg-white text-ink-900 border border-line hover:bg-canvas-off',
  ghost: 'bg-transparent text-brand-600 hover:bg-brand-50',
  danger: 'bg-error-500 text-white hover:bg-error-700',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-control',
  md: 'h-11 px-5 text-sm rounded-control',
  lg: 'h-12 px-6 text-base rounded-control',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-display font-semibold',
        'transition-colors duration-fast ease-out-expo',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  )
})
