import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Rocket, BookOpen, Sparkles } from 'lucide-react'
import { CharacterFace } from '@/features/characters/components/CharacterFace'
import { OnboardingLayout } from '../components/OnboardingLayout'

export function WelcomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <OnboardingLayout step={2} totalSteps={5} stepKey="welcome">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-soft-lg px-8 py-10 sm:px-12 sm:py-12 text-center">
        {/* Lead with a real character face rather than a generic sparkle
            icon-in-a-circle — Azouz is the guide every learner meets first,
            so this is the moment to put a face on the product, not a
            placeholder glyph. */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 190 }}
          className="mx-auto mb-7 relative w-24 h-24"
        >
          <div
            className="absolute inset-0 rounded-full shadow-soft-md"
            style={{ backgroundColor: '#F59E0B22' }}
          />
          <CharacterFace characterId="Azouz" size={96} />
          <span className="absolute -top-1 -end-1 bg-secondary-400 rounded-full p-1.5 shadow">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </span>
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight [text-wrap:balance]">
          {t('onboarding.welcome.title')}
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto mb-10">
          {t('onboarding.welcome.subtitle')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-3 p-4 bg-primary-50 rounded-xl"
          >
            <div className="icon-chip bg-primary-100 text-primary-600 w-10 h-10 flex-shrink-0">
              <Rocket className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {t('onboarding.welcome.missionsPoint')}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-3 p-4 bg-secondary-50 rounded-xl"
          >
            <div className="icon-chip bg-secondary-100 text-secondary-600 w-10 h-10 flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {t('onboarding.welcome.guidePoint')}
            </p>
          </motion.div>
        </div>

        <p className="text-gray-500 text-sm mb-7">{t('onboarding.welcome.getToKnow')}</p>

        <button
          onClick={() => navigate('/onboarding/age')}
          className="btn btn-primary w-full py-3.5 text-lg"
        >
          {t('onboarding.welcome.getStarted')}
        </button>
      </div>
    </OnboardingLayout>
  )
}
