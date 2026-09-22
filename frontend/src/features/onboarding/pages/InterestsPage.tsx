import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Calculator, FlaskConical, Languages, Code2, Palette, Globe2,
  Brain, Rocket, ArrowRight, Check,
} from 'lucide-react'
import { authApi } from '@/lib/api/endpoints'
import { OnboardingLayout } from '../components/OnboardingLayout'

/**
 * Interests step — generates real learner-profile data (mandate: onboarding
 * must produce a learner model, not just store a questionnaire). The chosen
 * interests are persisted to Learner.preferences via PATCH /auth/me/preferences
 * (real backend contract) and also cached on the local user so the rest of the
 * app (recommendations, home) can read them immediately.
 *
 * Interest keys are stable slugs so the backend/recommendation engine can key
 * off them; labels are localized.
 */
const INTERESTS = [
  { key: 'math', icon: Calculator, tint: 'bg-sky-50 text-sky-600' },
  { key: 'science', icon: FlaskConical, tint: 'bg-primary-50 text-primary-600' },
  { key: 'language', icon: Languages, tint: 'bg-grape-50 text-grape-600' },
  { key: 'coding', icon: Code2, tint: 'bg-success-50 text-success-600' },
  { key: 'arts', icon: Palette, tint: 'bg-bubble-50 text-bubble-600' },
  { key: 'world', icon: Globe2, tint: 'bg-accent-50 text-accent-600' },
  { key: 'thinking', icon: Brain, tint: 'bg-primary-50 text-primary-600' },
  { key: 'entrepreneurship', icon: Rocket, tint: 'bg-secondary-50 text-secondary-600' },
] as const

export function InterestsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function toggle(key: string) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const handleContinue = async () => {
    try {
      setSaving(true)
      setError('')
      // Persist real preferences to the backend (merged onto Learner.preferences).
      await authApi.updatePreferences({ interests: selected })
      // Keep the locally cached user in sync so recommendations/home can read it.
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.learner) {
          user.learner.preferences = { ...(user.learner.preferences || {}), interests: selected }
          localStorage.setItem('user', JSON.stringify(user))
        }
      }
      navigate('/onboarding/character')
    } catch (err: any) {
      // Non-blocking: interests are enrichment, not a gate. Still let them proceed.
      setError(err?.response?.data?.message || t('onboarding.interests.error', 'Could not save — you can set these later.'))
      navigate('/onboarding/character')
    } finally {
      setSaving(false)
    }
  }

  return (
    <OnboardingLayout step={4} totalSteps={6} stepKey="interests">
      <div className="max-w-xl w-full bg-white rounded-blob shadow-hero border border-surface-200/60 px-8 py-10 sm:px-12 sm:py-12">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            className="icon-chip w-14 h-14 mx-auto mb-5 bg-primary-50 text-primary-600"
          >
            <Rocket className="w-7 h-7" />
          </motion.div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink mb-2 leading-tight [text-wrap:balance]">
            {t('onboarding.interests.title', 'What do you love?')}
          </h1>
          <p className="text-slate-600 leading-relaxed max-w-sm mx-auto">
            {t('onboarding.interests.subtitle', 'Pick a few — we\u2019ll suggest missions and worlds you\u2019ll enjoy. You can change these anytime.')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-control text-warning-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-9">
          {INTERESTS.map((item, i) => {
            const Icon = item.icon
            const isSel = selected.includes(item.key)
            return (
              <motion.button
                key={item.key}
                type="button"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggle(item.key)}
                aria-pressed={isSel}
                className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 text-start transition-all duration-150 ${
                  isSel ? 'border-primary-500 ring-2 ring-primary-200 bg-primary-50' : 'border-surface-200 hover:border-primary-200 hover:bg-surface-50'
                }`}
              >
                <div className={`icon-chip w-10 h-10 shrink-0 ${item.tint}`}>
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <span className="font-display font-bold text-ink text-sm leading-snug">
                  {t(`onboarding.interests.options.${item.key}`)}
                </span>
                {isSel && (
                  <span className="absolute top-2 end-2 w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={saving}
          className="btn btn-primary w-full py-3.5 text-lg flex items-center justify-center gap-2"
        >
          {saving ? t('onboarding.interests.saving', 'Saving...') : selected.length === 0 ? t('onboarding.interests.skip', 'Skip for now') : t('onboarding.interests.continue', 'Continue')}
          {!saving && <ArrowRight className="w-5 h-5 rtl:scale-x-[-1]" />}
        </button>
      </div>
    </OnboardingLayout>
  )
}
