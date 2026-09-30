import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/lib/api/endpoints'
import { useAuthStore } from '@/lib/auth/authStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { AGE_BAND_LABEL } from '@/lib/labels/ageLabels'
import type { AgeBand } from '@/lib/api/types'

const AGE_BANDS: AgeBand[] = ['AGE_8_9', 'AGE_10_11', 'AGE_12_14']
const INTEREST_KEYS = ['english', 'coding', 'ai', 'creativity', 'thinking'] as const

/**
 * Learner onboarding: pick age band (→ PATCH /auth/me/age-band, persisted
 * immediately so a mid-flow close doesn't lose it, mirroring the proven legacy
 * behavior) then interests (→ PATCH /auth/me/preferences), then into the app.
 * Two steps, no nav chrome (full-screen guided flow).
 */
export function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const loadSession = useAuthStore((s) => s.loadSession)

  const [step, setStep] = useState<'age' | 'interests'>('age')
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
      setStep('interests')
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

  function toggleInterest(key: string) {
    setInterests((prev) => (prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-off px-4 py-10">
      <div className="w-full max-w-md rounded-card border border-line bg-white p-8 shadow-card">
        <div className="mb-6 flex items-center gap-2" aria-hidden>
          <span className={cn('h-1.5 flex-1 rounded-pill', step === 'age' ? 'bg-brand-500' : 'bg-brand-200')} />
          <span className={cn('h-1.5 flex-1 rounded-pill', step === 'interests' ? 'bg-brand-500' : 'bg-line')} />
        </div>

        {step === 'age' ? (
          <>
            <h1 className="font-display text-2xl font-bold text-ink-900">{t('onboarding.ageTitle')}</h1>
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
                  <span className="font-display text-lg font-bold text-ink-900">{AGE_BAND_LABEL[band]}</span>
                  {ageBand === band && <span className="text-brand-600">✓</span>}
                </button>
              ))}
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-error-700">{error}</p>}
            <Button className="mt-6 w-full" size="lg" disabled={!ageBand} loading={saving} onClick={saveAge}>
              {t('common.next')}
            </Button>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-ink-900">{t('onboarding.interestsTitle')}</h1>
            <p className="mt-1 text-sm text-ink-500">{t('onboarding.interestsSubtitle')}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {INTEREST_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={interests.includes(key)}
                  onClick={() => toggleInterest(key)}
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
          </>
        )}
      </div>
    </div>
  )
}
