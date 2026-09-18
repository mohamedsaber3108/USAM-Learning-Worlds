import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Card — canonical surface container for the redesign. `tone` picks the
 * visual weight: `plain` (white/soft), `playful` (bigger radius + lift),
 * `tinted` (subtle brand wash). Keeps existing global `.card` class usable
 * elsewhere; this is the composable React version for new/updated pages.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'plain' | 'playful' | 'tinted'
  interactive?: boolean
  children: ReactNode
}

const TONES: Record<NonNullable<CardProps['tone']>, string> = {
  plain: 'bg-white rounded-card shadow-soft border border-surface-200/70 p-6',
  playful:
    'bg-white rounded-blob shadow-lift border border-surface-200/60 p-6',
  tinted:
    'bg-primary-50/60 rounded-card shadow-soft border border-primary-100 p-6',
}

export function Card({ tone = 'plain', interactive = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'transition-all duration-200',
        TONES[tone],
        interactive && 'hover:shadow-hero hover:-translate-y-1 cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
