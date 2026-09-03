import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Baby, Backpack, GraduationCap, ArrowRight } from 'lucide-react'
import apiClient from '@/lib/api/client'
import { OnboardingLayout } from '../components/OnboardingLayout'

// Maps directly to the backend AgeBand enum (backend/prisma/schema.prisma):
//   AGE_8_9, AGE_10_11, AGE_12_14
const AGE_BANDS = [
  {
    value: 'AGE_8_9',
    key: 'AGE_8_9',
    icon: Baby,
    tint: 'bg-primary-50 text-primary-600 border-primary-200',
  },
  {
    value: 'AGE_10_11',
    key: 'AGE_10_11',
    icon: Backpack,
    tint: 'bg-accent-50 text-accent-600 border-accent-200',
  },
  {
    value: 'AGE_12_14',
    key: 'AGE_12_14',
    icon: GraduationCap,
    tint: 'bg-secondary-50 text-secondary-600 border-secondary-200',
  },
] as const

export function AgeSelectPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleContinue = async () => {
    if (!selected) return
    try {
      setSaving(true)
      setError('')

      // Persist the choice on the learner record right away so it isn't
      // lost if the user closes the tab mid-onboarding.
      const response = await apiClient.patch('/auth/me/age-band', {
        ageBand: selected,
      })

      // Keep the locally cached user in sync with the updated learner.
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.learner && response.data?.learner) {
          user.learner.ageBand = response.data.learner.ageBand
          localStorage.setItem('user', JSON.stringify(user))
        }
      }

      navigate('/onboarding/character')
    } catch (err: any) {
      setError(err.response?.data?.message || t('onboarding.age.error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <OnboardingLayout step={3} totalSteps={5} stepKey="age">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-soft-lg p-8 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t('onboarding.age.title')}
          </h1>
          <p className="text-gray-600">{t('onboarding.age.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          {AGE_BANDS.map((band, i) => {
            const Icon = band.icon
            const isSelected = selected === band.value
            return (
              <motion.button
                key={band.value}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelected(band.value)}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-colors ${
                  isSelected
                    ? 'border-primary-500 ring-2 ring-primary-200 bg-primary-50'
                    : `border-gray-200 hover:border-gray-300 ${band.tint.split(' ').filter(c => c.startsWith('bg-')).join(' ')}`
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-primary-500 text-white' : band.tint
                  }`}
                >
                  <Icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-gray-900">
                    {t(`onboarding.age.bands.${band.key}.label`)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t(`onboarding.age.bands.${band.key}.blurb`)}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || saving}
          className="btn btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? t('onboarding.age.saving') : t('onboarding.age.continue')}
          {!saving && <ArrowRight className="w-5 h-5 rtl:scale-x-[-1]" />}
        </button>
      </div>
    </OnboardingLayout>
  )
}
