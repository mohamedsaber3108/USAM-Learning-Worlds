import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/** Display + feedback primitives — shared, WHITE/GREEN/BLACK. */

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ key: T; label: string }>
  active: T
  onChange: (k: T) => void
}) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1 border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            'rounded-t-control px-4 py-2 text-sm font-medium transition-colors duration-fast',
            active === t.key ? 'border-b-2 border-brand-500 text-brand-700' : 'text-ink-500 hover:text-ink-800',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Progress({ value, max = 100, label }: { value: number; max?: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-pill bg-line"
    >
      <div className="h-full rounded-pill bg-brand-500 transition-[width] duration-slow ease-out-expo" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-control bg-line/70', className)} />
}

export function Avatar({ name, src, size = 40 }: { name: string; src?: string | null; size?: number }) {
  const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
  return src ? (
    <img src={src} alt={name} width={size} height={size} className="rounded-full object-cover" />
  ) : (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="inline-flex items-center justify-center rounded-full bg-brand-100 font-display text-sm font-bold text-brand-700"
    >
      {initials || '?'}
    </span>
  )
}

type StatusTone = 'brand' | 'neutral' | 'success' | 'warning' | 'error'
const dotTone: Record<StatusTone, string> = {
  brand: 'bg-brand-500',
  neutral: 'bg-ink-400',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
}
export function StatusPill({ tone = 'neutral', children }: { tone?: StatusTone; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-line px-2.5 py-0.5 text-xs font-medium text-ink-700">
      <span className={cn('h-1.5 w-1.5 rounded-full', dotTone[tone])} />
      {children}
    </span>
  )
}

/** Horizontal stepper (onboarding, project stages). */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-2">
          <span
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
              i < current ? 'bg-brand-500 text-white' : i === current ? 'border-2 border-brand-500 text-brand-700' : 'border border-line text-ink-400',
            )}
            aria-current={i === current ? 'step' : undefined}
          >
            {i < current ? '✓' : i + 1}
          </span>
          <span className={cn('truncate text-xs', i === current ? 'font-medium text-ink-900' : 'text-ink-400')}>{s}</span>
          {i < steps.length - 1 && <span className="h-px flex-1 bg-line" />}
        </li>
      ))}
    </ol>
  )
}

/** Simple data table (admin/lists). Header + rows; caller supplies cells. */
export function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-card border border-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-canvas-off text-start">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-start font-medium text-ink-600">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {r.map((c, j) => (
                <td key={j} className="px-4 py-3 text-ink-800">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
