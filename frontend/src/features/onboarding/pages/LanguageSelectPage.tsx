import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Languages, Check } from 'lucide-react'
import { setLanguage, getStoredLanguage, type SupportedUiLanguage } from '@/lib/i18n'
import { OnboardingLayout } from '../components/OnboardingLayout'

const LANGUAGES: { code: SupportedUiLanguage; nativeLabel: string; sublabel: string }[] = [
  { code: 'en', nativeLabel: 'English', sublabel: 'Continue in English' },
  { code: 'ar', nativeLabel: 'العربية', sublabel: 'واصل بالعربية' },
]

/**
 * First real step of the onboarding wizard — chosen deliberately to come
 * before age/character so the rest of the flow (including character
 * copy) renders in the right language and direction from the very next
 * screen onward. Persists immediately via setLanguage() so a refresh
 * mid-flow doesn't lose the choice.
 */
export function LanguageSelectPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const current = getStoredLanguage()

  function choose(code: SupportedUiLanguage) {
    setLanguage(code)
    navigate('/onboarding/welcome')
  }

  return (
    <OnboardingLayout step={1} totalSteps={5} stepKey="language">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-soft-lg p-8 sm:p-10 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center"
        >
          <Languages className="w-8 h-8 text-primary-600" strokeWidth={2} />
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {t('onboarding.language.title')}
        </h1>
        <p className="text-gray-500 mb-8">{t('onboarding.language.subtitle')}</p>

        <div className="grid grid-cols-2 gap-4">
          {LANGUAGES.map((lang) => {
            const isSelected = current === lang.code
            return (
              <motion.button
                key={lang.code}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => choose(lang.code)}
                className={`relative flex flex-col items-center gap-1 p-5 rounded-2xl border-2 transition-colors ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 end-2 w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                )}
                <span className="text-xl font-bold text-gray-900">{lang.nativeLabel}</span>
                <span className="text-xs text-gray-500">{lang.sublabel}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </OnboardingLayout>
  )
}
