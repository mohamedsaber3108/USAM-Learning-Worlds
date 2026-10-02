import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Languages, Code2, Bot, Sparkles, Brain, type LucideIcon } from 'lucide-react'
import { authApi, worldsApi, charactersApi } from '@/lib/api/endpoints'
import { useAuthStore } from '@/lib/auth/authStore'
import { Button, Card, Stepper } from '@/components/ui'
import { LoadingState } from '@/components/common/States'
import { AuthShell } from '@/features/public/PublicPage'
import { CharacterStage } from '@/features/characters/CharacterStage'
import { cn } from '@/lib/utils/cn'
import { AGE_BAND_LABEL } from '@/lib/labels/ageLabels'
import type { AgeBand } from '@/lib/api/types'

const AGE_BANDS: AgeBand[] = ['AGE_8_9', 'AGE_10_11', 'AGE_12_14']
const INTEREST_KEYS = ['english', 'coding', 'ai', 'creativity', 'thinking'] as const
const INTEREST_ICON: Record<(typeof INTEREST_KEYS)[number], LucideIcon> = {
  english: Languages,
  coding: Code2,
  ai: Bot,
  creativity: Sparkles,
  thinking: Brain,
}

interface World {
  id: string
  name: string
  domain?: { slug: string; name: string }
  isUnlocked?: boolean
}

/**
 * Learner onboarding — rebuilt into a real guided journey (owner directive
 * 2026-10-02: "do not build onboarding as a long form... the child should
 * feel like they are entering a world").
 *
 * Previously 2 steps (age -> interests -> dumped into /app). Now 4 real
 * steps, each backed by a real signal — no fabricated "diagnostic quiz" or
 * fake skill test (no backend support exists for either, so none was
 * invented):
 *   1. Welcome — a companion (real GET /characters/orchestrate pick, no
 *      learner context yet so this resolves to a sensible default/fallback)
 *      greets the learner by name. Sets the tone before asking anything.
 *   2. Age — persisted immediately (PATCH /auth/me/age-band), same as
 *      before, because the backend's adaptive/content-filtering logic
 *      needs it as early as possible.
 *   3. Interests — persisted (PATCH /auth/me/preferences), same backend
 *      contract as before.
 *   4. First world — real GET /worlds (unlocked-for-new-learner subset),
 *      so the learner picks WHERE to start instead of being dropped on a
 *      generic Home with no context. Selecting one navigates straight into
 *      that domain's path (/app/learn/:slug), which is itself the real
 *      "first mission" entry point (DomainPathPage's own next-action logic
 *      picks the actual first mission) — onboarding does not invent its
 *      own first-mission selection logic separate from that.
 */
export function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const loadSession = useAuthStore((s) => s.loadSession)
  const name = user?.learner?.displayName || user?.learner?.firstName || ''

  const [step, setStep] = useState(0)
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null)
  const [interests, setInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const companion = useQuery({
    queryKey: ['onboarding-companion'],
    queryFn: async () => (await charactersApi.orchestrate()).data,
    retry: false,
    enabled: step === 0,
  })
  const worlds = useQuery({
    queryKey: ['onboarding-worlds'],
    queryFn: async () => (await worldsApi.list()).data as World[],
    retry: false,
    enabled: step === 3,
  })
  const unlockedWorlds = (worlds.data ?? []).filter((w) => w.isUnlocked !== false)

  async function saveAge() {
    if (!ageBand) return
    setSaving(true)
    setError(null)
    try {
      await authApi.updateAgeBand(ageBand)
      setStep(2)
    } catch {
      setError(t('onboarding.savedError'))
    } finally {
      setSaving(false)
    }
  }

  async function saveInterests() {
    setSaving(true)
    setError(null)
    try {
      await authApi.updatePreferences({ interests })
      setStep(3)
    } catch {
      setError(t('onboarding.savedError'))
    } finally {
      setSaving(false)
    }
  }

  async function finishToWorld(slug?: string) {
    setSaving(true)
    try {
      await loadSession()
      navigate(slug ? `/app/learn/${slug}` : '/app', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthShell>
      <Card className={step === 0 ? 'text-center' : undefined}>
        {step > 0 && (
          <Stepper
            steps={[t('onboarding.ageTitle'), t('onboarding.interestsTitle'), t('onboarding.worldTitle')]}
            current={step - 1}
          />
        )}

        {/* Step 0 — Welcome: companion greets the learner by name. */}
        {step === 0 && (
          <div className="mt-2">
            {companion.isLoading ? (
              <LoadingState />
            ) : (
              <div className="flex flex-col items-center">
                <CharacterStage
                  characterId={companion.data?.character?.name ?? 'Azouz'}
                  size={160}
                  state="speaking"
                  speech={t('onboarding.welcomeSpeech', { name })}
                  bubbleSide="top"
                />
              </div>
            )}
            <h1 className="mt-6 font-display text-2xl font-bold">{t('onboarding.welcomeTitle', { name })}</h1>
            <p className="mt-2 text-sm text-ink-500">{t('onboarding.welcomeSubtitle')}</p>
            <Button className="mt-6 w-full" size="lg" onClick={() => setStep(1)}>
              {t('onboarding.letsGo')}
            </Button>
          </div>
        )}

        {/* Step 1 — Age band (persisted immediately). */}
        {step === 1 && (
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
        )}

        {/* Step 2 — Interests (persisted). */}
        {step === 2 && (
          <div className="mt-6">
            <h1 className="font-display text-2xl font-bold">{t('onboarding.interestsTitle')}</h1>
            <p className="mt-1 text-sm text-ink-500">{t('onboarding.interestsSubtitle')}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {INTEREST_KEYS.map((key) => {
                const Icon = INTEREST_ICON[key]
                const active = interests.includes(key)
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setInterests((prev) => (prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]))
                    }
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-control border px-4 py-4 text-sm font-medium transition-colors',
                      active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line text-ink-700 hover:bg-canvas-off',
                    )}
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                    {t(`onboarding.interests.${key}`)}
                  </button>
                )
              })}
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-error-700">{error}</p>}
            <Button className="mt-6 w-full" size="lg" loading={saving} onClick={saveInterests}>
              {t('common.next')}
            </Button>
          </div>
        )}

        {/* Step 3 — First world: real unlocked worlds, pick where to start. */}
        {step === 3 && (
          <div className="mt-6">
            <h1 className="font-display text-2xl font-bold">{t('onboarding.worldTitle')}</h1>
            <p className="mt-1 text-sm text-ink-500">{t('onboarding.worldSubtitle')}</p>
            {worlds.isLoading ? (
              <LoadingState />
            ) : unlockedWorlds.length > 0 ? (
              <div className="mt-6 space-y-3">
                {unlockedWorlds.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    disabled={saving}
                    onClick={() => void finishToWorld(w.domain?.slug)}
                    className="flex w-full items-center justify-between rounded-control border border-line px-4 py-4 text-start transition-colors hover:border-brand-500 hover:bg-brand-50 disabled:opacity-60"
                  >
                    <span className="font-display font-bold text-ink-900">{w.domain?.name ?? w.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-sm text-ink-500">{t('onboarding.worldFallback')}</p>
                <Button className="mt-4 w-full" size="lg" loading={saving} onClick={() => void finishToWorld()}>
                  {t('onboarding.finish')}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </AuthShell>
  )
}
