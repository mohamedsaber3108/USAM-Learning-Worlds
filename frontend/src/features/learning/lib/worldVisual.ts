import {
  Globe2, Calculator, FlaskConical, Languages,
  Code2, Palette, BookOpen, Brain,
} from 'lucide-react'

/**
 * Shared domain → visual mapping so every "world" reads as the same distinct
 * place across the app (the Worlds map page and the Home world-journey strip).
 * Extracted from WorldsPage so both surfaces stay in visual sync rather than
 * drifting apart with duplicated maps.
 */
export interface WorldVisual {
  icon: typeof Globe2
  grad: string
}

const DOMAIN_VISUAL: Record<string, WorldVisual> = {
  mathematics: { icon: Calculator, grad: 'from-sky-400 to-sky-600' },
  math: { icon: Calculator, grad: 'from-sky-400 to-sky-600' },
  science: { icon: FlaskConical, grad: 'from-primary-400 to-primary-600' },
  language: { icon: Languages, grad: 'from-grape-400 to-grape-600' },
  english: { icon: Languages, grad: 'from-grape-400 to-grape-600' },
  technology: { icon: Code2, grad: 'from-success-400 to-success-600' },
  coding: { icon: Code2, grad: 'from-success-400 to-success-600' },
  arts: { icon: Palette, grad: 'from-bubble-400 to-bubble-600' },
  creativity: { icon: Palette, grad: 'from-bubble-400 to-bubble-600' },
  'social-studies': { icon: Globe2, grad: 'from-accent-400 to-accent-600' },
  'critical-thinking': { icon: Brain, grad: 'from-primary-400 to-grape-500' },
  reading: { icon: BookOpen, grad: 'from-accent-400 to-secondary-500' },
}

export function visualFor(slug: string | undefined | null): WorldVisual {
  if (slug && DOMAIN_VISUAL[slug]) return DOMAIN_VISUAL[slug]
  return { icon: Globe2, grad: 'from-primary-400 to-primary-600' }
}
