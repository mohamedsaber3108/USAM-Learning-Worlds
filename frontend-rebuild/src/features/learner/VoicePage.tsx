import { useTranslation } from 'react-i18next'
import { Card, PageHeader } from '@/components/ui/Card'
import { LockedBadge } from '@/components/ui/Badge'

/**
 * Voice companion — PROVIDER-GATED / BLOCKED_EXTERNAL. The voice pipeline
 * (ASR/TTS/Bedrock) needs provider credentials not present in this environment.
 * This is an HONEST gated state (a real explanation), NOT a placeholder and NOT
 * a fake voice UI. When the provider is wired, this surface activates.
 */
export function VoicePage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <PageHeader title={t('nav.learn')} />
      <Card>
        <LockedBadge label="Provider-gated" />
        <p className="mt-3 text-ink-700">{t('learner.voiceGated')}</p>
        <p className="mt-2 text-sm text-ink-500">
          Voice practice will turn on once the speech provider is connected.
        </p>
      </Card>
    </div>
  )
}
