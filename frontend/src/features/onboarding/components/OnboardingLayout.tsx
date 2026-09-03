import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export interface OnboardingLayoutProps {
  children: ReactNode
  step: number
  totalSteps: number
  /**
   * Identifies the current wizard step for a11y (aria-label on the
   * progress bar) — not rendered as visible text, the visible copy lives
   * on each page's own <h1>/<p>.
   */
  stepKey: string
}

/**
 * OnboardingLayout — shared shell for every screen in the 5-step
 * onboarding wizard (language -> welcome -> age -> character -> complete).
 *
 * Keeps the wizard feeling like ONE continuous flow rather than 5 unrelated
 * pages: a consistent centered card container, a fade/slide transition on
 * step change, and a slim top progress bar whose width is real (step/total),
 * not decorative. RTL-safe (progress bar fill direction flips via the
 * rtl:/ltr: Tailwind variants already used elsewhere in the app, e.g.
 * AppShell.tsx).
 */
export function OnboardingLayout({ children, step, totalSteps, stepKey }: OnboardingLayoutProps) {
  const { t } = useTranslation()
  const percent = Math.min(100, Math.max(0, (step / totalSteps) * 100))

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center px-4 py-10">
      {/* Progress bar — real step/totalSteps ratio, fills from the
          reading-direction-appropriate side via rtl:/ltr: origin flip. */}
      <div className="w-full max-w-lg mb-6">
        <div
          className="h-1.5 w-full bg-primary-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={t('onboarding.progressAriaLabel', {
            step,
            total: totalSteps,
            defaultValue: `Step ${step} of ${totalSteps}: ${stepKey}`,
          })}
        >
          <motion.div
            key={step}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full bg-primary-500 rounded-full ltr:origin-left rtl:origin-right"
          />
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          {t('onboarding.stepIndicator', {
            step,
            total: totalSteps,
            defaultValue: `Step ${step} of ${totalSteps}`,
          })}
        </p>
      </div>

      {/* Card content — fades/slides in per step change, same motion
          language used across the rest of onboarding (AgeSelectPage,
          CharacterIntroPage). */}
      <motion.div
        key={`content-${stepKey}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full flex items-center justify-center"
      >
        {children}
      </motion.div>
    </div>
  )
}
