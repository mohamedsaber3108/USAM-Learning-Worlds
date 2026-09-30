import { useTranslation } from 'react-i18next'
import { Mic } from 'lucide-react'
import { Card, PageHeader, LockedBadge } from '@/components/ui'

/**
 * Voice companion — PROVIDER-GATED / BLOCKED_EXTERNAL. Honest gated state (real
 * explanation), not a placeholder and not a fake voice UI. Activates when the
 * speech provider is wired. DS.
 */
export function VoicePage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.companions')} />
      <Card>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-control bg-canvas-off text-ink-500">
          <Mic className="h-6 w-6" aria-hidden />
        </span>
        <div className="mt-3">
          <LockedBadge label="Provider-gated" />
        </div>
        <p className="mt-3 text-ink-700">{t('learner.voiceGated')}</p>
        <p className="mt-2 text-sm text-ink-500">
          Voice practice will turn on once the speech provider is connected.
        </p>
      </Card>
    </div>
  )
}
