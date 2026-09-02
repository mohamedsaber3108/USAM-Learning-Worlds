import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Baby, Backpack, GraduationCap, ArrowRight } from 'lucide-react'
import apiClient from '@/lib/api/client'

// Maps directly to the backend AgeBand enum (backend/prisma/schema.prisma):
//   AGE_8_9, AGE_10_11, AGE_12_14
const AGE_BANDS = [
  {
    value: 'AGE_8_9',
    label: '8-9 years old',
    blurb: "I'm just starting my learning adventure",
    icon: Baby,
    tint: 'bg-primary-50 text-primary-600 border-primary-200',
  },
  {
    value: 'AGE_10_11',
    label: '10-11 years old',
    blurb: "I'm ready for bigger challenges",
    icon: Backpack,
    tint: 'bg-accent-50 text-accent-600 border-accent-200',
  },
  {
    value: 'AGE_12_14',
    label: '12-14 years old',
    blurb: "I want to level up fast",
    icon: GraduationCap,
    tint: 'bg-secondary-50 text-secondary-600 border-secondary-200',
  },
] as const

export function AgeSelectPage() {
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
      setError(err.response?.data?.message || 'Could not save your age group. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 sm:p-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            How old are you?
          </h1>
          <p className="text-gray-600">
            This helps us pick missions and lessons that fit you best.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          {AGE_BANDS.map((band) => {
            const Icon = band.icon
            const isSelected = selected === band.value
            return (
              <button
                key={band.value}
                type="button"
                onClick={() => setSelected(band.value)}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
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
                  <p className="text-lg font-bold text-gray-900">{band.label}</p>
                  <p className="text-sm text-gray-600">{band.blurb}</p>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || saving}
          className="btn btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? 'Saving...' : 'Continue'}
          {!saving && <ArrowRight className="w-5 h-5" />}
        </button>
      </motion.div>
    </div>
  )
}
