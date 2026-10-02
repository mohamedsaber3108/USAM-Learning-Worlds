import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, useId } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Form primitives — shared, accessible, WHITE/GREEN/BLACK. Every form across
 * the product uses these; no page-specific input styling. Labels are wired to
 * controls via a generated id; errors render with role=alert + aria-describedby.
 */

const baseControl =
  'w-full rounded-control border bg-white px-3 py-2.5 text-ink-900 placeholder:text-ink-400 ' +
  'transition-colors duration-fast focus-visible:border-brand-400 focus-visible:shadow-focus ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

function Wrap({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label?: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-error-700">
          {error}
        </p>
      )}
    </div>
  )
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, id, ...props },
  ref,
) {
  const gen = useId()
  const fid = id || gen
  return (
    <Wrap id={fid} label={label} hint={hint} error={error}>
      <input
        ref={ref}
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
        className={cn(baseControl, error && 'border-error-500', className)}
        {...props}
      />
    </Wrap>
  )
})

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, id, rows = 4, ...props },
  ref,
) {
  const gen = useId()
  const fid = id || gen
  return (
    <Wrap id={fid} label={label} hint={hint} error={error}>
      <textarea
        ref={ref}
        id={fid}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
        className={cn(baseControl, error && 'border-error-500', className)}
        {...props}
      />
    </Wrap>
  )
})

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className, id, options, placeholder, ...props },
  ref,
) {
  const gen = useId()
  const fid = id || gen
  return (
    <Wrap id={fid} label={label} hint={hint} error={error}>
      <select
        ref={ref}
        id={fid}
        aria-invalid={error ? true : undefined}
        className={cn(baseControl, 'appearance-none pe-8', error && 'border-error-500', className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrap>
  )
})

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, id, ...props },
  ref,
) {
  const gen = useId()
  const fid = id || gen
  return (
    <label htmlFor={fid} className="flex cursor-pointer items-center gap-2 text-sm text-ink-800">
      <input
        ref={ref}
        id={fid}
        type="checkbox"
        className={cn('h-4 w-4 rounded border-line text-brand-500 focus-visible:shadow-focus', className)}
        {...props}
      />
      {label}
    </label>
  )
})

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, className, id, ...props },
  ref,
) {
  const gen = useId()
  const fid = id || gen
  return (
    <label htmlFor={fid} className="flex cursor-pointer items-center gap-2 text-sm text-ink-800">
      <input
        ref={ref}
        id={fid}
        type="radio"
        className={cn('h-4 w-4 border-line text-brand-500 focus-visible:shadow-focus', className)}
        {...props}
      />
      {label}
    </label>
  )
})

/** Accessible toggle switch (role=switch). */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-pill transition-colors duration-fast disabled:opacity-50',
        checked ? 'bg-brand-500' : 'bg-line',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform',
          checked ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0.5 rtl:-translate-x-0.5',
        )}
      />
    </button>
  )
}
