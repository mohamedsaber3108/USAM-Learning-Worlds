import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Calculator, FlaskConical, Languages, Code2, Palette, Globe2, Brain, Rocket, Heart,
} from 'lucide-react'

/**
 * InterestChips — surfaces the learner's onboarding interests (saved to
 * Learner.preferences.interests via PATCH /auth/me/preferences) on the Home
 * page, closing the loop: interests captured → shown → actionable. Each chip
 * links to the most relevant destination (a world / learn area), so the
 * child's stated interests are a real navigation shortcut, not decoration.
 *
 * Reads the interests from the locally-cached user (kept in sync by the
 * Interests onboarding step and /auth/me). Self-hides when there are none.
 */

// Interest slug → icon + tint + where it leads. Slugs match the onboarding
// InterestsPage keys (onboarding.interests.options.*).
const INTEREST_META: Record<string, { icon: typeof Calculator; tint: string; to: string }> = {
  math: { icon: Calculator, tint: 'bg-sky-50 text-sky-600', to: '/worlds' },
  science: { icon: FlaskConical, tint: 'bg-primary-50 text-primary-600', to: '/worlds' },
  language: { icon: Languages, tint: 'bg-grape-50 text-grape-600', to: '/english' },
  coding: { icon: Code2, tint: 'bg-success-50 text-success-600', to: '/worlds' },
  arts: { icon: Palette, tint: 'bg-bubble-50 text-bubble-600', to: '/creativity' },
  world: { icon: Globe2, tint: 'bg-accent-50 text-accent-600', to: '/worlds' },
  thinking: { icon: Brain, tint: 'bg-primary-50 text-primary-600', to: '/thinking/problem-solving' },
  entrepreneurship: { icon: Rocket, tint: 'bg-secondary-50 text-secondary-600', to: '/cross-curricular/entrepreneurship' },
}

export function InterestChips() {
  const { t } = useTranslation()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const interests: string[] = user?.learner?.preferences?.interests ?? []

  if (!Array.isArray(interests) || interests.length === 0) return null

  const known = interests.filter((k) => INTEREST_META[k])
  if (known.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="mb-8"
      aria-label={t('dashboard.interestsTitle', 'Made for what you love')}
    >
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-4.5 h-4.5 text-bubble-500" strokeWidth={2} fill="currentColor" />
        <h3 className="font-display font-bold text-ink">{t('dashboard.interestsTitle', 'Made for what you love')}</h3>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {known.map((key, i) => {
          const meta = INTEREST_META[key]!
          const Icon = meta.icon
          return (
            <motion.div key={key} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
              <Link
                to={meta.to}
                className={`inline-flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold border border-surface-200 hover:border-primary-200 hover:-translate-y-0.5 transition-all ${meta.tint}`}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                {t(`onboarding.interests.options.${key}`)}
              </Link>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
