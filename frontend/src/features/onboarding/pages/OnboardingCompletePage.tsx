import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { PartyPopper, CheckCircle2 } from 'lucide-react'
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
      <div className="max-w-md w-full bg-white rounded-3xl shadow-soft-lg p-8 sm:p-10 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-6 w-20 h-20 rounded-full bg-success-50 flex items-center justify-center"
        >
          <PartyPopper className="w-10 h-10 text-success-600" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {t('onboarding.complete.title')}
        </h1>
        <p className="text-gray-600 mb-8">{t('onboarding.complete.subtitle')}</p>

        <ul className="text-left space-y-2 mb-8">
          {checklist.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
              {item}
            </motion.li>
          ))}
        </ul>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary w-full py-3 text-lg"
        >
          {t('onboarding.complete.cta')}
        </button>
      </div>
    </OnboardingLayout>
  )
}
