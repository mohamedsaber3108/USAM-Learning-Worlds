import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, UserCheck, Lock, Eye, Users } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { PublicPage } from './PublicPage'

/** How USAM works — the learning journey as a public explainer. */
export function HowItWorksPage() {
  const { t } = useTranslation()
  const steps = [
    ['public.journeyDiscover', 'public.journeyDiscoverDesc'],
    ['public.journeyLearn', 'public.journeyLearnDesc'],
    ['public.journeyPractice', 'public.journeyPracticeDesc'],
    ['public.journeyBuild', 'public.journeyBuildDesc'],
    ['public.journeyProve', 'public.journeyProveDesc'],
    ['public.journeyProgress', 'public.journeyProgressDesc'],
  ] as const
  return (
    <PublicPage title={t('public.howTitle')} subtitle={t('public.howSubtitle')}>
      <ol className="space-y-4">
        {steps.map(([titleKey, descKey], i) => (
          <li key={titleKey}>
            <Card className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h2 className="font-display font-bold">{t(titleKey)}</h2>
                <p className="mt-1 text-sm text-ink-500">{t(descKey)}</p>
              </div>
            </Card>
          </li>
        ))}
      </ol>
      <div className="mt-8 text-center">
        <Link to="/signup">
          <Button size="lg">{t('public.getStarted')}</Button>
        </Link>
      </div>
    </PublicPage>
  )
}

/** For families — parent value as a public explainer. */
export function ForFamiliesPage() {
  const { t } = useTranslation()
  const items = [
    ['public.parentProgress', 'public.parentProgressDesc'],
    ['public.parentEvidence', 'public.parentEvidenceDesc'],
    ['public.parentSafety', 'public.parentSafetyDesc'],
  ] as const
  return (
    <PublicPage title={t('public.familiesTitle')} subtitle={t('public.familiesSubtitle')}>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map(([titleKey, descKey]) => (
          <Card key={titleKey}>
            <h2 className="font-display font-bold">{t(titleKey)}</h2>
            <p className="mt-1 text-sm text-ink-500">{t(descKey)}</p>
          </Card>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link to="/signup">
          <Button size="lg">{t('public.getStarted')}</Button>
        </Link>
      </div>
    </PublicPage>
  )
}

/** Safety & privacy — child-first trust presentation. */
export function SafetyPage() {
  const { t } = useTranslation()
  const items = [
    { icon: UserCheck, titleKey: 'public.safetyConsent', descKey: 'public.safetyConsentDesc' },
    { icon: Lock, titleKey: 'public.safetyPrivacy', descKey: 'public.safetyPrivacyDesc' },
    { icon: Eye, titleKey: 'public.safetyOversight', descKey: 'public.safetyOversightDesc' },
    { icon: Users, titleKey: 'public.safetyModeration', descKey: 'public.safetyModerationDesc' },
  ]
  return (
    <PublicPage title={t('public.safetyTitle')} subtitle={t('public.safetySubtitle')}>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((it) => {
          const Icon = it.icon
          return (
            <Card key={it.titleKey}>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-success-100 text-success-700">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-3 font-display font-bold">{t(it.titleKey)}</h2>
              <p className="mt-1 text-sm text-ink-500">{t(it.descKey)}</p>
            </Card>
          )
        })}
      </div>
    </PublicPage>
  )
}

/** Legal / privacy center. */
export function LegalPage() {
  const { t } = useTranslation()
  return (
    <PublicPage title={t('public.legalTitle')} subtitle={t('public.legalSubtitle')}>
      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-600" aria-hidden />
            <h2 className="font-display text-lg font-bold">{t('public.legalPrivacyHeading')}</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{t('public.legalPrivacyBody')}</p>
        </Card>
        <Card>
          <h2 className="font-display text-lg font-bold">{t('public.legalTermsHeading')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{t('public.legalTermsBody')}</p>
        </Card>
        <p className="text-center text-sm text-ink-400">{t('public.legalContact')}</p>
      </div>
    </PublicPage>
  )
}
