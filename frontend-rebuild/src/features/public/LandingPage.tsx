import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Languages,
  Code2,
  Bot,
  Sparkles,
  Brain,
  Compass,
  GraduationCap,
  RotateCcw,
  Hammer,
  Award,
  TrendingUp,
  ShieldCheck,
  Users,
  FolderCheck,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { PublicNav } from './PublicNav'
import { PublicFooter } from './PublicFooter'

/**
 * USAM public LANDING — rebuilt from zero as an ECOSYSTEM PRESENTATION
 * (research-driven: comprehension over funnel; show the learning loop visually;
 * distinct child + parent value; companions as guides; trust explicit; one
 * clear start). WHITE/GREEN/BLACK, no legacy contamination, EN/AR + RTL,
 * responsive, purposeful motion (reduced-motion respected via global CSS).
 */

const DOMAINS = [
  { icon: Languages, titleKey: 'public.domainEnglish', descKey: 'public.domainEnglishDesc' },
  { icon: Code2, titleKey: 'public.domainCoding', descKey: 'public.domainCodingDesc' },
  { icon: Bot, titleKey: 'public.domainAi', descKey: 'public.domainAiDesc' },
  { icon: Sparkles, titleKey: 'public.domainCreativity', descKey: 'public.domainCreativityDesc' },
  { icon: Brain, titleKey: 'public.domainThinking', descKey: 'public.domainThinkingDesc' },
]

const JOURNEY = [
  { icon: Compass, titleKey: 'public.journeyDiscover', descKey: 'public.journeyDiscoverDesc' },
  { icon: GraduationCap, titleKey: 'public.journeyLearn', descKey: 'public.journeyLearnDesc' },
  { icon: RotateCcw, titleKey: 'public.journeyPractice', descKey: 'public.journeyPracticeDesc' },
  { icon: Hammer, titleKey: 'public.journeyBuild', descKey: 'public.journeyBuildDesc' },
  { icon: Award, titleKey: 'public.journeyProve', descKey: 'public.journeyProveDesc' },
  { icon: TrendingUp, titleKey: 'public.journeyProgress', descKey: 'public.journeyProgressDesc' },
]

const PARENT = [
  { icon: TrendingUp, titleKey: 'public.parentProgress', descKey: 'public.parentProgressDesc' },
  { icon: FolderCheck, titleKey: 'public.parentEvidence', descKey: 'public.parentEvidenceDesc' },
  { icon: ShieldCheck, titleKey: 'public.parentSafety', descKey: 'public.parentSafetyDesc' },
]

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-canvas-white text-ink-900">
      <PublicNav />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50/60 to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
            <span className="inline-block rounded-pill bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              {t('public.heroKicker')}
            </span>
            <h1 className="mt-5 animate-fade-in-up font-display text-4xl font-extrabold leading-[1.1] sm:text-5xl">
              {t('public.heroTitle')}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-600">{t('public.heroSubtitle')}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/signup">
                <Button size="lg">{t('public.heroCtaPrimary')}</Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="secondary">
                  {t('public.heroCtaSecondary')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ECOSYSTEM — five connected domains */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold">{t('public.ecosystemTitle')}</h2>
            <p className="mt-2 text-ink-600">{t('public.ecosystemSubtitle')}</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {DOMAINS.map((d) => {
              const Icon = d.icon
              return (
                <div
                  key={d.titleKey}
                  className="rounded-card border border-line bg-white p-5 shadow-soft transition-transform duration-fast hover:-translate-y-0.5 hover:shadow-card"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display font-bold">{t(d.titleKey)}</h3>
                  <p className="mt-1 text-sm text-ink-500">{t(d.descKey)}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* LEARNING JOURNEY — the visible loop */}
        <section className="bg-canvas-off py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold">{t('public.journeyTitle')}</h2>
              <p className="mt-2 text-ink-600">{t('public.journeySubtitle')}</p>
            </div>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {JOURNEY.map((j, i) => {
                const Icon = j.icon
                return (
                  <li key={j.titleKey} className="relative rounded-card border border-line bg-white p-5 shadow-soft">
                    <span className="absolute -top-3 start-5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <Icon className="mt-2 h-6 w-6 text-brand-600" aria-hidden />
                    <h3 className="mt-3 font-display text-sm font-bold">{t(j.titleKey)}</h3>
                    <p className="mt-1 text-xs text-ink-500">{t(j.descKey)}</p>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        {/* COMPANIONS */}
        <section className="mx-auto max-w-4xl px-4 py-16 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <Users className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold">{t('public.companionsTitle')}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-ink-600">{t('public.companionsSubtitle')}</p>
        </section>

        {/* PARENT VALUE */}
        <section className="bg-canvas-off py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold">{t('public.parentTitle')}</h2>
              <p className="mt-2 text-ink-600">{t('public.parentSubtitle')}</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {PARENT.map((p) => {
                const Icon = p.icon
                return (
                  <div key={p.titleKey} className="rounded-card border border-line bg-white p-6 shadow-soft">
                    <Icon className="h-6 w-6 text-brand-600" aria-hidden />
                    <h3 className="mt-3 font-display font-bold">{t(p.titleKey)}</h3>
                    <p className="mt-1 text-sm text-ink-500">{t(p.descKey)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* TRUST / SAFETY */}
        <section className="mx-auto max-w-4xl px-4 py-16 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-700">
            <ShieldCheck className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold">{t('public.trustTitle')}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-ink-600">{t('public.trustSubtitle')}</p>
        </section>

        {/* FINAL CTA */}
        <section className="bg-brand-700 py-16 text-center text-white">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="font-display text-3xl font-extrabold">{t('public.finalCtaTitle')}</h2>
            <p className="mt-2 text-white/85">{t('public.finalCtaSubtitle')}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/signup">
                <Button size="lg" variant="secondary">
                  {t('public.getStarted')}
                </Button>
              </Link>
              <Link to="/pricing">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  {t('public.pricing')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
