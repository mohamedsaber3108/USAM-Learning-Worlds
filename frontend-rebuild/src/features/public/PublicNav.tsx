import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, Globe } from 'lucide-react'
import { setLanguage } from '@/lib/i18n'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

/**
 * Public navigation — built from zero for the ecosystem site (not ported from
 * legacy). Logo + ecosystem links + language toggle + login + primary CTA.
 * Responsive: inline on desktop, a slide-in sheet on mobile. RTL-aware.
 */
const LINKS = [
  { to: '/how-it-works', key: 'public.howItWorks' },
  { to: '/for-families', key: 'public.forFamilies' },
  { to: '/safety', key: 'public.safety' },
  { to: '/pricing', key: 'public.pricing' },
]

export function PublicNav() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="font-display text-xl font-extrabold text-brand-700" aria-label="USAM home">
          USAM
        </Link>

        <nav className="ms-6 hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-control px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-canvas-off hover:text-ink-900"
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="ms-auto hidden items-center gap-2 md:flex">
          <button
            onClick={() => setLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
            className="inline-flex items-center gap-1.5 rounded-control px-3 py-2 text-sm text-ink-600 hover:bg-canvas-off"
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4" aria-hidden />
            {i18n.language === 'ar' ? 'EN' : 'ع'}
          </button>
          <Link to="/login" className="rounded-control px-3 py-2 text-sm font-medium text-ink-700 hover:bg-canvas-off">
            {t('public.logIn')}
          </Link>
          <Link to="/signup">
            <Button size="sm">{t('public.getStarted')}</Button>
          </Link>
        </div>

        <button
          className="ms-auto inline-flex items-center rounded-control p-2 text-ink-700 md:hidden"
          onClick={() => setOpen(true)}
          aria-label={t('public.menu')}
        >
          <Menu className="h-6 w-6" aria-hidden />
        </button>
      </div>

      {/* Mobile sheet */}
      <div className={cn('fixed inset-0 z-50 md:hidden', open ? '' : 'pointer-events-none')}>
        <div
          className={cn('absolute inset-0 bg-ink-900/40 transition-opacity', open ? 'opacity-100' : 'opacity-0')}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            'absolute top-0 h-full w-72 max-w-[85%] bg-white p-5 shadow-lift transition-transform end-0',
            open ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-extrabold text-brand-700">USAM</span>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-control p-2 text-ink-500">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <nav className="mt-6 flex flex-col gap-1" aria-label="Primary">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-control px-3 py-2.5 text-ink-700 hover:bg-canvas-off"
              >
                {t(l.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => setLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
              className="inline-flex items-center gap-1.5 rounded-control px-3 py-2.5 text-start text-ink-600 hover:bg-canvas-off"
            >
              <Globe className="h-4 w-4" aria-hidden />
              {i18n.language === 'ar' ? 'English' : 'العربية'}
            </button>
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button variant="secondary" className="w-full">
                {t('public.logIn')}
              </Button>
            </Link>
            <Link to="/signup" onClick={() => setOpen(false)}>
              <Button className="w-full">{t('public.getStarted')}</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
