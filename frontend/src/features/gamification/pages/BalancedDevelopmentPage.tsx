import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Sparkles, Brain, Code2, Languages, Palette, FlaskConical,
  Globe2, Compass, TrendingUp, Star,
} from 'lucide-react'
import { masteryApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/CharacterState'

/**
 * Balanced Development — the learner-facing "whole child" view the product
 * mandate calls for (NOT a raw analytics dashboard). Surfaces the real
 * per-domain mastery aggregation from the backend Mastery engine
 * (GET /mastery/by-domain → { domain, totalCompetencies, masteredCount,
 * proficientCount, avgConfidence }[]) as a warm, motivating balance view.
 *
 * No fake data — every ring/bar is computed from the learner's real mastery.
 */

interface DomainRow {
  domain: string
  totalCompetencies: number
  masteredCount: number
  proficientCount: number
  avgConfidence: number
}

// Map a domain name to an icon + gradient (best-effort by keyword; falls back
// to a neutral compass so any unseeded domain still renders cleanly).
function domainVisual(name: string): { icon: typeof Compass; grad: string; ring: string } {
  const n = name.toLowerCase()
  if (n.includes('cod') || n.includes('tech')) return { icon: Code2, grad: 'from-success-400 to-success-600', ring: 'text-success-500' }
  if (n.includes('engl') || n.includes('lang')) return { icon: Languages, grad: 'from-grape-400 to-grape-600', ring: 'text-grape-500' }
  if (n.includes('art') || n.includes('creativ') || n.includes('design')) return { icon: Palette, grad: 'from-bubble-400 to-bubble-600', ring: 'text-bubble-500' }
  if (n.includes('sci')) return { icon: FlaskConical, grad: 'from-primary-400 to-primary-600', ring: 'text-primary-500' }
  if (n.includes('think') || n.includes('problem') || n.includes('logic')) return { icon: Brain, grad: 'from-primary-400 to-grape-500', ring: 'text-primary-500' }
  if (n.includes('math')) return { icon: Sparkles, grad: 'from-sky-400 to-sky-600', ring: 'text-sky-500' }
  return { icon: Globe2, grad: 'from-accent-400 to-accent-600', ring: 'text-accent-500' }
}

export function BalancedDevelopmentPage() {
  const { t } = useTranslation()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mastery-by-domain'],
    queryFn: () => masteryApi.getByDomain().then((r) => r.data as DomainRow[]),
  })

  const rows = Array.isArray(data) ? data : []
  // Overall balance = average of per-domain confidence (0..1 → %).
  const overall = rows.length
    ? Math.round((rows.reduce((s, r) => s + (r.avgConfidence || 0), 0) / rows.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-brand-hero relative overflow-hidden shadow-lift">
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div aria-hidden className="absolute -top-10 -end-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="icon-chip bg-white/15 text-white w-12 h-12"><Sparkles className="w-6 h-6" strokeWidth={2} /></div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                {t('balanced.title', 'Balanced Development')}
              </h1>
              <p className="text-white/80 text-sm mt-0.5">
                {t('balanced.subtitle', 'How you are growing across every kind of skill.')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isError ? (
          <ErrorState
            character="Azouz"
            title={t('balanced.errorTitle', "Couldn't load your development")}
            message={t('balanced.errorMessage', "No worries — let's try again.")}
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <LoadingState character="Zein" message={t('balanced.loading', 'Gathering your growth story...')} />
        ) : rows.length > 0 ? (
          <>
            {/* Overall balance hero */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              className="card-playful bg-primary-50/40 mb-8 flex items-center gap-5"
            >
              <div className="icon-chip bg-primary-600 text-white w-16 h-16 shrink-0">
                <TrendingUp className="w-8 h-8" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                  {t('balanced.overallLabel', 'Overall balance')}
                </p>
                <p className="font-display font-extrabold text-ink text-4xl leading-none tabular-nums">{overall}%</p>
                <p className="text-sm text-slate-500 mt-1">
                  {t('balanced.overallHint', 'A blend of confidence across all your learning worlds.')}
                </p>
              </div>
            </motion.div>

            {/* Per-domain balance cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rows.map((row, i) => {
                const v = domainVisual(row.domain)
                const Icon = v.icon
                const pct = Math.round((row.avgConfidence || 0) * 100)
                return (
                  <motion.div
                    key={row.domain}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="card"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`icon-chip w-11 h-11 bg-gradient-to-br ${v.grad} text-white`}>
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-bold text-ink leading-snug truncate">{row.domain}</p>
                        <p className="text-xs text-slate-500">
                          {t('balanced.masteredOf', { mastered: row.masteredCount, total: row.totalCompetencies, defaultValue: '{{mastered}} of {{total}} mastered' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-600">{t('balanced.confidence', 'Confidence')}</span>
                      <span className="font-display font-bold text-ink tabular-nums">{pct}%</span>
                    </div>
                    <div className="progress-track">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${v.grad}`}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.1 + i * 0.05, ease: 'easeOut' }}
                      />
                    </div>
                    {row.proficientCount > 0 && (
                      <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-secondary-600">
                        <Star className="w-3.5 h-3.5 fill-secondary-400 text-secondary-400" />
                        {t('balanced.proficient', { count: row.proficientCount, defaultValue: '{{count}} proficient' })}
                      </p>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </>
        ) : (
          <EmptyState
            character="Zein"
            title={t('balanced.emptyTitle', 'Your growth story starts now')}
            message={t('balanced.emptyMessage', 'Complete a few activities and your balanced-development map will bloom here!')}
            actionLabel={t('balanced.emptyAction', 'Start a mission')}
            actionTo="/missions"
          />
        )}
      </main>
    </div>
  )
}
