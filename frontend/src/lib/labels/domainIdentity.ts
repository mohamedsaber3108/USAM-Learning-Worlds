/**
 * Per-domain visual identity — a single shared source for each learning
 * domain's icon + a restrained accent tint, so the same world reads the
 * same way everywhere (Home world cards, Learn hub, domain path header).
 *
 * This is the implementation of the loosened Decision A (design.md,
 * 2026-10-22): the brand foundation stays green/white/ink, but a learning
 * domain may carry ONE low-saturation accent tint for wayfinding — distinct
 * enough to tell worlds apart at a glance, never a saturated per-feature
 * rainbow. Accents are expressed as Tailwind utility class fragments on a
 * soft tinted chip, not new palette tokens, so they compose with the
 * existing token system rather than forking it.
 *
 * Original USAM design, keyed to USAM's own real domain slugs (confirmed
 * against the live GET /worlds response: english, coding, ai-literacy,
 * entrepreneurship, plus creativity/critical-thinking from the catalog).
 * No third-party assets or icons beyond the shared lucide set already used
 * app-wide.
 */
import { Languages, Code2, Bot, Sparkles, Brain, Rocket, BookOpen, type LucideIcon } from 'lucide-react'

export interface DomainIdentity {
  icon: LucideIcon
  /** Soft tinted chip classes for the domain's icon badge. */
  chip: string
  /** Solid accent fill (for filled path nodes / active markers). */
  solid: string
  /** Atmospheric gradient classes for a world/domain hero panel. */
  gradient: string
}

const DEFAULT_IDENTITY: DomainIdentity = {
  icon: BookOpen,
  chip: 'bg-brand-50 text-brand-600',
  solid: 'bg-brand-500',
  gradient: 'from-brand-600 to-brand-800',
}

const DOMAIN_IDENTITY: Record<string, DomainIdentity> = {
  english: { icon: Languages, chip: 'bg-sky-50 text-sky-700', solid: 'bg-sky-500', gradient: 'from-sky-600 to-sky-900' },
  coding: { icon: Code2, chip: 'bg-emerald-50 text-emerald-700', solid: 'bg-emerald-500', gradient: 'from-emerald-600 to-emerald-900' },
  'ai-literacy': { icon: Bot, chip: 'bg-violet-50 text-violet-700', solid: 'bg-violet-500', gradient: 'from-violet-600 to-violet-900' },
  entrepreneurship: { icon: Rocket, chip: 'bg-amber-50 text-amber-700', solid: 'bg-amber-500', gradient: 'from-amber-600 to-amber-900' },
  creativity: { icon: Sparkles, chip: 'bg-pink-50 text-pink-700', solid: 'bg-pink-500', gradient: 'from-pink-600 to-pink-900' },
  'critical-thinking': { icon: Brain, chip: 'bg-indigo-50 text-indigo-700', solid: 'bg-indigo-500', gradient: 'from-indigo-600 to-indigo-900' },
}

/** Resolve a domain's identity by slug; safe default for unknown slugs. */
export function domainIdentity(slug?: string | null): DomainIdentity {
  if (!slug) return DEFAULT_IDENTITY
  return DOMAIN_IDENTITY[slug] ?? DEFAULT_IDENTITY
}
