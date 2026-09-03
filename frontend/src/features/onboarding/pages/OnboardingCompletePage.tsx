import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { PartyPopper, CheckCircle2, ArrowRight } from 'lucide-react'
import { CharacterFace } from '@/features/characters/components/CharacterFace'
import { OnboardingLayout } from '../components/OnboardingLayout'

export function OnboardingCompletePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const checklist = [
    t('onboarding.complete.checklist.language'),
    t('onboarding.complete.checklist.age'),
    t('onboarding.complete.checklist.characters'),
    t('onboarding.complete.checklist.ready'),
  ]

  return (
    <OnboardingLayout step={5} totalSteps={5} stepKey="complete">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-soft-lg px-8 py-10 sm:px-10 sm:py-12 text-center">
        {/* Azouz sees the learner off from onboarding into the dashboard —
            closes the loop opened on WelcomePage instead of ending on an
            anonymous success glyph. The party-popper badge layers ON the
            character (same composition language as WelcomePage's sparkle
            badge) rather than replacing it. */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 190 }}
          className="mx-auto mb-6 relative w-24 h-24"
        >
          <div
            className="absolute inset-0 rounded-full shadow-soft-md"
            style={{ backgroundColor: '#10B98122' }}
          />
          <CharacterFace characterId="Azouz" size={96} />
          <span className="absolute -top-1 -right-1 bg-success-500 rounded-full p-1.5 shadow">
            <PartyPopper className="w-3.5 h-3.5 text-white" />
          </span>
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight [text-wrap:balance]">
          {t('onboarding.complete.title')}
        </h1>
        <p className="text-gray-600 leading-relaxed max-w-sm mx-auto mb-8">
          {t('onboarding.complete.subtitle')}
        </p>

        {/* Checklist recap — every prior step, tied visually to this final
            screen via the same success-green token used across the app for
            correctness/mastery feedback (see tailwind.config.js). */}
        <ul className="text-left space-y-2.5 mb-9 bg-success-50/60 rounded-2xl p-5">
          {checklist.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="flex items-center gap-2.5 text-sm text-gray-700"
            >
              <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
              <span className="leading-snug">{item}</span>
            </motion.li>
          ))}
        </ul>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary w-full py-3.5 text-lg flex items-center justify-center gap-2"
        >
          {t('onboarding.complete.cta')}
          <ArrowRight className="w-5 h-5 rtl:scale-x-[-1]" />
        </button>
      </div>
    </OnboardingLayout>
  )
}
