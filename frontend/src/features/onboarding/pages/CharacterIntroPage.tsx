import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, MessageCircle, Star } from 'lucide-react'
import {
  getPreferredCharacter,
  clearPreferredCharacter,
} from '@/features/landing/lib/characterPreference'
import { getCharacterVisual } from '@/features/characters/lib/characterVisuals'
import { OnboardingLayout } from '../components/OnboardingLayout'

// The 4 core characters, present for every learner from day one (the other
// 11 in the roster unlock progressively and are introduced in the
// Character Gallery, not here). i18nKey drives role/quote copy so each
// character's personality — not just their name — is genuinely localized.
const CORE_CHARACTERS = [
  { name: 'Azouz', i18nKey: 'azouz' },
  { name: 'Zein', i18nKey: 'zein' },
  { name: 'Luma', i18nKey: 'luma' },
  { name: 'Codey', i18nKey: 'codey' },
] as const

export function CharacterIntroPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const preferredCharacter = getPreferredCharacter()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const current = CORE_CHARACTERS[index] ?? CORE_CHARACTERS[0]
  const visual = getCharacterVisual(current.name)
  const Icon = visual.icon
  const isLast = index === CORE_CHARACTERS.length - 1

  function go(nextIndex: number, dir: 1 | -1) {
    setDirection(dir)
    setIndex(nextIndex)
  }

  function handlePrimaryAction() {
    if (!isLast) {
      go(index + 1, 1)
      return
    }
    clearPreferredCharacter()
    navigate('/onboarding/complete')
  }

  return (
    <OnboardingLayout step={4} totalSteps={5} stepKey="character">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-soft-lg p-8 sm:p-10 text-center overflow-hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
          {t('onboarding.character.title')}
        </h1>
        <p className="text-gray-500 text-sm mb-6">{t('onboarding.character.subtitle')}</p>

        <div className="relative min-h-[340px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.name}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="w-full"
            >
              {/* Avatar — colored circle + lucide icon per CHARACTER_VISUALS,
                  the honest stand-in until illustrated character art ships
                  (see characterVisuals.ts header comment). */}
              <motion.div
                initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ delay: 0.05, type: 'spring', stiffness: 190 }}
                className="mx-auto mb-5 relative w-28 h-28"
              >
                <div
                  className="absolute inset-0 rounded-full shadow-soft-md"
                  style={{ backgroundColor: visual.color }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-12 h-12 text-white" strokeWidth={2.2} />
                </div>
                <div className="absolute -top-1 -right-1 bg-secondary-400 rounded-full p-1.5 shadow">
                  <Star className="w-3.5 h-3.5 text-white" fill="currentColor" />
                </div>
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">{current.name}</h2>
              <p className="text-primary-600 font-medium mb-5 text-sm">
                {t(`onboarding.character.${current.i18nKey}.role`)}
              </p>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl text-left mb-2">
                <MessageCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 text-sm sm:text-[15px] leading-relaxed">
                  “{t(`onboarding.character.${current.i18nKey}.quote`)}”
                </p>
              </div>

              {preferredCharacter && index === 0 && (
                <p className="text-xs text-slate-500 mt-3">
                  {preferredCharacter === 'Azouz'
                    ? t('onboarding.character.preferredPickSame', { name: preferredCharacter })
                    : t('onboarding.character.preferredPickOther', { name: preferredCharacter })}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots — double as direct-jump navigation */}
        <div className="flex items-center justify-center gap-2 mt-6 mb-6">
          {CORE_CHARACTERS.map((c, i) => (
            <button
              key={c.name}
              type="button"
              aria-label={t('onboarding.character.dotAriaLabel', { name: c.name })}
              onClick={() => go(i, i > index ? 1 : -1)}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-6 bg-primary-500' : 'w-2 bg-gray-200 hover:bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(Math.max(0, index - 1), -1)}
            disabled={index === 0}
            aria-label={t('onboarding.character.back')}
            className="btn btn-outline px-3 py-3 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 rtl:scale-x-[-1]" />
          </button>
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="btn btn-primary flex-1 py-3 text-lg flex items-center justify-center gap-2"
          >
            {isLast ? t('onboarding.character.continueWithAll') : t('onboarding.character.next')}
            {!isLast && <ChevronRight className="w-5 h-5 rtl:scale-x-[-1]" />}
          </button>
        </div>
      </div>
    </OnboardingLayout>
  )
}
