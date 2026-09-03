import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'

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

// Short labels for the step-dot rail. Purely a visual/orientation aid —
// each page still owns its own <h1>/<p> copy. Falls back to plain English
// via t()'s defaultValue (same convention as progressAriaLabel below) so a
// missing translation key never breaks the rail, it just shows English.
const STEP_LABELS = [
  { key: 'language', fallback: 'Language' },
  { key: 'welcome', fallback: 'Welcome' },
  { key: 'age', fallback: 'About you' },
  { key: 'character', fallback: 'Your guides' },
  { key: 'complete', fallback: 'All set' },
] as const

/**
 * OnboardingLayout — shared shell for every screen in the 5-step
 * onboarding wizard (language -> welcome -> age -> character -> complete).
 *
 * Keeps the wizard feeling like ONE continuous flow rather than 5 unrelated
 * pages: a small brand mark for orientation, a step-dot rail that shows
 * every step at a glance (done / current / upcoming) instead of just a
 * number, a slim progress bar whose fill is real (step/total), and a
 * consistent fade/slide transition on step change. RTL-safe (progress bar
 * fill direction and dot order flip via the rtl:/ltr: Tailwind variants
 * already used elsewhere in the app, e.g. AppShell.tsx).
 */
export function OnboardingLayout({ children, step, totalSteps, stepKey }: OnboardingLayoutProps) {
  const { t } = useTranslation()
  const percent = Math.min(100, Math.max(0, (step / totalSteps) * 100))

  return (
    <div className="min-h-dvh bg-surface-100 flex flex-col items-center px-4 py-10 sm:py-14">
      {/* Ambient depth — a single soft radial wash in the brand hue, not a
          flat empty surface. Same primary token as everything else on the
          page, just very low opacity, so it reads as atmosphere not decor. */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(79,70,229,0.08), transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="w-full max-w-lg flex flex-col items-center flex-shrink-0">
        {/* Brand mark — small, quiet orientation anchor so onboarding still
            feels like part of USAM rather than a bare wizard. */}
        <div className="mb-8 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-500" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-wide text-slate-500">
            USAM Learning Worlds
          </span>
        </div>

        {/* Step-dot rail — every step visible at once: done (filled +
            check), current (larger, ring), upcoming (hollow). Communicates
            "how much is left" far better than a bare "Step 3 of 5" line. */}
        <div className="w-full flex items-center justify-between mb-3">
          {STEP_LABELS.map((label, i) => {
            const stepNumber = i + 1
            const isDone = stepNumber < step
            const isCurrent = stepNumber === step
            return (
              <div key={label.key} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-center">
                  {i > 0 && (
                    <div
                      className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                        stepNumber <= step ? 'bg-primary-400' : 'bg-primary-100'
                      }`}
                    />
                  )}
                  <motion.div
                    initial={false}
                    animate={{ scale: isCurrent ? 1.15 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`relative flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isDone
                        ? 'bg-primary-500 text-white'
                        : isCurrent
                          ? 'bg-white text-primary-600 ring-2 ring-primary-500'
                          : 'bg-primary-100 text-primary-300'
                    } ${i === 0 ? 'ms-0' : ''}`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : stepNumber}
                  </motion.div>
                  {i < STEP_LABELS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                        stepNumber < step ? 'bg-primary-400' : 'bg-primary-100'
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`hidden sm:block text-[11px] font-medium text-center leading-tight ${
                    isCurrent ? 'text-primary-700' : 'text-slate-400'
                  }`}
                >
                  {t(`onboarding.stepLabels.${label.key}`, { defaultValue: label.fallback })}
                </span>
              </div>
            )
          })}
        </div>

        {/* Thin ratio bar underneath the dots — real step/totalSteps
            progress, kept for a11y (role="progressbar") and as a secondary
            reinforcement of "how far along" beneath the richer dot rail. */}
        <div className="w-full mb-8">
          <div
            className="h-1 w-full bg-primary-100 rounded-full overflow-hidden"
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
    </div>
  )
}
