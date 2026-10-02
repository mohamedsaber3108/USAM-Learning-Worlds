import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/lib/api/endpoints'
import { useAuthStore } from '@/lib/auth/authStore'
import { Button, Card, Stepper } from '@/components/ui'
import { AuthShell } from '@/features/public/PublicPage'
import { cn } from '@/lib/utils/cn'
import { AGE_BAND_LABEL } from '@/lib/labels/ageLabels'
import type { AgeBand } from '@/lib/api/types'

const AGE_BANDS: AgeBand[] = ['AGE_8_9', 'AGE_10_11', 'AGE_12_14']
const INTEREST_KEYS = ['english', 'coding', 'ai', 'creativity', 'thinking'] as const

/**
 * Learner onboarding — short, low-cognitive-load, journey-framed (research):
 * age band (persisted immediately) → interests → into the app. Rebuilt on the
 * design-system Stepper + Card. Real PATCH /auth/me/age-band + /preferences.
 */
export function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const loadSession = useAuthStore((s) => s.loadSession)

  const [step, setStep] = useState(0)
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null)
  const [interests, setInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function saveAge() {
    if (!ageBand) return
    setSaving(true)
    setError(null)
    try {
      await authApi.updateAgeBand(ageBand)
      setStep(1)
    } catch {
      setError(t('onboarding.savedError'))
    } finally {
      setSaving(false)
    }
  }

  async function finish() {
    setSaving(true)
    setError(null)
    try {
      await authApi.updatePreferences({ interests })
      await loadSession()
      navigate('/app', { replace: true })
    } catch {
      setError(t('onboarding.savedError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthShell>
      <Card>
        <Stepper steps={[t('onboarding.ageTitle'), t('onboarding.interestsTitle')]} current={step} />

        {step === 0 ? (
          <div className="mt-6">
            <h1 className="font-display text-2xl font-bold">{t('onboarding.ageTitle')}</h1>
            <p className="mt-1 text-sm text-ink-500">{t('onboarding.ageSubtitle')}</p>
            <div className="mt-6 space-y-3" role="radiogroup">
              {AGE_BANDS.map((band) => (
                <button
                  key={band}
                  type="button"
                  role="radio"
                  aria-checked={ageBand === band}
                  onClick={() => setAgeBand(band)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-control border px-4 py-4 text-start transition-colors',
                    ageBand === band ? 'border-brand-500 bg-brand-50' : 'border-line hover:bg-canvas-off',
                  )}
                >
                  <span className="font-display text-lg font-bold">{AGE_BAND_LABEL[band]}</span>
                  {ageBand === band && <span className="text-brand-600">✓</span>}
                </button>
              ))}
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-error-700">{error}</p>}
            <Button className="mt-6 w-full" size="lg" disabled={!ageBand} loading={saving} onClick={saveAge}>
              {t('common.next')}
            </Button>
          </div>
        ) : (
          <div className="mt-6">
            <h1 className="font-display text-2xl font-bold">{t('onboarding.interestsTitle')}</h1>
            <p className="mt-1 text-sm text-ink-500">{t('onboarding.interestsSubtitle')}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {INTEREST_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={interests.includes(key)}
                  onClick={() =>
                    setInterests((prev) => (prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]))
                  }
                  className={cn(
                    'rounded-control border px-4 py-4 text-sm font-medium transition-colors',
                    interests.includes(key) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line text-ink-700 hover:bg-canvas-off',
                  )}
                >
                  {t(`onboarding.interests.${key}`)}
                </button>
              ))}
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-error-700">{error}</p>}
            <Button className="mt-6 w-full" size="lg" loading={saving} onClick={finish}>
              {t('onboarding.finish')}
            </Button>
          </div>
        )}
      </Card>
    </AuthShell>
  )
}
