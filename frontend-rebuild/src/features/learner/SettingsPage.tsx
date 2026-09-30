import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/lib/auth/authStore'
import { setLanguage, type Language } from '@/lib/i18n'
import { authApi } from '@/lib/api/endpoints'
import { Card, PageHeader, SectionHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AGE_BAND_LABEL } from '@/lib/labels/ageLabels'
import type { AgeBand } from '@/lib/api/types'

const AGE_BANDS: AgeBand[] = ['AGE_8_9', 'AGE_10_11', 'AGE_12_14']

/** Learner settings — only controls the backend can actually persist:
 * language (local), age band (PATCH /auth/me/age-band). Profile shows real me. */
export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const loadSession = useAuthStore((s) => s.loadSession)
  const [savingAge, setSavingAge] = useState(false)

  async function changeAge(band: AgeBand) {
    setSavingAge(true)
    try {
      await authApi.updateAgeBand(band)
      await loadSession()
    } finally {
      setSavingAge(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title={t('learner.settings')} />

      <section>
        <SectionHeader title={t('learner.profile')} />
        <Card>
          <p className="text-ink-900">{user?.learner?.displayName || user?.learner?.firstName}</p>
          <p className="mt-1 text-sm text-ink-500">{user?.email}</p>
        </Card>
      </section>

      <section>
        <SectionHeader title={t('learner.language')} />
        <div className="flex gap-2">
          {(['en', 'ar'] as Language[]).map((lng) => (
            <Button
              key={lng}
              variant={i18n.language === lng ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setLanguage(lng)}
            >
              {lng === 'en' ? 'English' : 'العربية'}
            </Button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Age band" />
        <div className="flex flex-wrap gap-2">
          {AGE_BANDS.map((band) => (
            <Button
              key={band}
              variant={user?.learner?.ageBand === band ? 'primary' : 'secondary'}
              size="sm"
              loading={savingAge && user?.learner?.ageBand !== band}
              onClick={() => changeAge(band)}
            >
              {AGE_BAND_LABEL[band]}
            </Button>
          ))}
        </div>
      </section>
    </div>
  )
}
