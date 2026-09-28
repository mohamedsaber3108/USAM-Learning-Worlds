import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import * as RadixLabel from '@radix-ui/react-label'
import { cn } from '@/lib/utils/cn'

/**
 * Field — accessible label + input + error/help wiring. Uses Radix Label for
 * correct label/control association, ties the error/help to the input via
 * aria-describedby, and sets aria-invalid. Works for RTL (logical spacing) and
 * keyboard. The visual input uses the existing `.input` token class.
 */
export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  help?: string
  rightSlot?: ReactNode
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, help, rightSlot, className, id, ...props },
  ref,
) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const errorId = `${fieldId}-error`
  const helpId = `${fieldId}-help`
  const describedBy = [error ? errorId : null, help ? helpId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="w-full">
      <RadixLabel.Root htmlFor={fieldId} className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </RadixLabel.Root>
      <div className="relative">
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn('input w-full', error && 'border-error-300 focus-visible:ring-error-300', className)}
          {...props}
        />
        {rightSlot && <div className="absolute end-3 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {help && !error && (
        <p id={helpId} className="mt-1.5 text-sm text-slate-500">
          {help}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-error-600">
          {error}
        </p>
      )}
    </div>
  )
})
