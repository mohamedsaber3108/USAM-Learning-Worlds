import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type Tone = 'brand' | 'neutral' | 'success' | 'warning' | 'error'

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700',
  neutral: 'bg-canvas-off text-ink-600',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>
}

/** Locked/entitlement pill used across gated surfaces. */
export function LockedBadge({ label }: { label: string }) {
  return <Badge tone="warning">🔒 {label}</Badge>
}
