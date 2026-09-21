import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Target, RefreshCw, Palette, Rocket, Sparkles, ArrowRight } from 'lucide-react'
import { adaptiveApi } from '@/lib/api/endpoints'

/**
 * "Recommended for you" — surfaces the backend Adaptive/Recommendation engine
 * (GET /adaptive/recommendations), which was fully built server-side but had
 * ZERO learner-facing UX (traceability #32). Renders the real personalized
 * recommendation list — no fake data. Each recommendation carries a type,
 * title, and human "reason" the engine computed (ZPD, spaced review, etc.).
 *
 * Backend contract (recommendation.service.ts):
 *   Recommendation = { type:'MISSION'|'ACTIVITY'|'REVIEW'|'PROJECT',
 *     entityId, title, reason, priority, estimatedMinutes?, competencyId? }
 *
 * The section self-hides when the engine returns nothing (new learner with no
 * signal yet) so it never shows an empty shell.
 */

interface Recommendation {
  type: 'MISSION' | 'ACTIVITY' | 'REVIEW' | 'PROJECT'
  entityId: string
  title: string
  reason: string
  priority: number
  estimatedMinutes?: number
  competencyId?: string
}

// Map each recommendation type to an icon, tint, and where tapping it goes.
const TYPE_META: Record<
  Recommendation['type'],
  { icon: typeof Target; tint: string; to: (r: Recommendation) => string }
> = {
  MISSION: { icon: Target, tint: 'bg-accent-50 text-accent-600', to: (r) => `/missions/${r.entityId}` },
  ACTIVITY: { icon: Rocket, tint: 'bg-primary-50 text-primary-600', to: () => '/missions' },
  REVIEW: { icon: RefreshCw, tint: 'bg-secondary-50 text-secondary-600', to: () => '/learn/flashcards' },
  PROJECT: { icon: Palette, tint: 'bg-grape-50 text-grape-600', to: (r) => `/projects/${r.entityId}` },
}

interface Props {
  /** AGE_8_9 sees fewer, simpler recommendations. */
  maxItems?: number
}

export function RecommendationsSection({ maxItems = 4 }: Props) {
  const { t } = useTranslation()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adaptive-recommendations', maxItems],
    queryFn: () =>
      adaptiveApi.getRecommendations().then((res) => res.data as Recommendation[]),
    // The engine can be quiet for brand-new learners; don't spam retries.
    retry: 1,
  })

  // Self-hide on error or empty — the "next step" card already covers the
  // baseline case, so an empty recommendations shell would be noise.
  if (isError) return null
  if (!isLoading && (!Array.isArray(data) || data.length === 0)) return null

  const items = Array.isArray(data) ? data.slice(0, maxItems) : []

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="mb-10"
      aria-label={t('dashboard.recommendedTitle', 'Recommended for you')}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary-600" strokeWidth={2} />
        <h3>{t('dashboard.recommendedTitle', 'Recommended for you')}</h3>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: maxItems }).map((_, i) => (
            <div key={i} className="card animate-pulse h-24" aria-hidden />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((rec, i) => {
            const meta = TYPE_META[rec.type] ?? TYPE_META.ACTIVITY
            const Icon = meta.icon
            return (
              <motion.div
                key={`${rec.type}-${rec.entityId}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link
                  to={meta.to(rec)}
                  className="card flex items-start gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 h-full"
                >
                  <div className={`icon-chip ${meta.tint} w-11 h-11 shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-primary-600">
                        {t(`dashboard.recTypes.${rec.type}`, rec.type)}
                      </span>
                      {rec.estimatedMinutes ? (
                        <span className="text-[11px] font-semibold text-slate-400">
                          {t('dashboard.recMinutes', { count: rec.estimatedMinutes, defaultValue: '{{count}} min' })}
                        </span>
                      ) : null}
                    </div>
                    <p className="font-display font-bold text-ink text-sm leading-snug truncate">
                      {rec.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{rec.reason}</p>
                  </div>
                  <ArrowRight
                    className="w-4 h-4 text-slate-300 group-hover:text-primary-500 shrink-0 mt-1 rtl:scale-x-[-1] transition-colors"
                    strokeWidth={2.5}
                  />
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.section>
  )
}
