import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { RotateCcw, Sparkles, ArrowRight } from 'lucide-react'
import { masteryApi, adaptiveApi } from '@/lib/api/endpoints'
import { masteryLabel } from '@/lib/mastery/masteryLabels'
import { EmptyState, ErrorState, LoadingState } from '@/components/common/CharacterState'

/**
 * Practice / Review center (phase task #10).
 *
 * Surfaces the review/FSRS engine that previously had NO frontend
 * (masteryApi.getReviewDue had zero consumers). Shows what's "due to practice
 * again so it stays strong" in child-friendly language — never FSRS jargon,
 * never raw confidence decimals. Also surfaces the adaptive recommendation
 * engine as "recommended practice".
 *
 * A due item is something the child already got PROFICIENT/MASTERED at, whose
 * spaced-repetition review date has arrived — so the framing is "keep it
 * strong", not "you failed".
 */
interface ReviewItem {
  competencyId: string
  state: string
  reviewDue: string | null
  competency?: { id: string; name: string; skill?: { name: string } }
}

interface Recommendation {
  type: string
  entityId: string
  title: string
  reason?: string
  competencyId?: string
}

export function PracticePage() {
  const { t } = useTranslation()

  const {
    data: due,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['review-due'],
    queryFn: () => masteryApi.getReviewDue().then((res) => res.data as ReviewItem[]),
  })

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', 'practice'],
    queryFn: () => adaptiveApi.getRecommendations().then((res) => res.data as Recommendation[]),
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <LoadingState character="Azouz" message={t('practice.loading', 'Finding what to practice…')} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <ErrorState
          character="Azouz"
          title={t('practice.errorTitle', "Couldn't load your practice")}
          message={t('practice.errorMessage', "Let's try that again.")}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const dueItems = Array.isArray(due) ? due : []
  const recItems = Array.isArray(recommendations) ? recommendations : []

  return (
    <div className="min-h-screen bg-surface-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="icon-chip bg-accent-50 text-accent-600 w-10 h-10">
              <RotateCcw className="w-5 h-5" strokeWidth={2} />
            </div>
            <h1 className="font-display text-3xl font-bold text-slate-900">
              {t('practice.title', 'Practice')}
            </h1>
          </div>
          <p className="text-slate-600">
            {t('practice.subtitle', 'A little practice keeps what you learned strong. Here is what is ready for you today.')}
          </p>
        </header>

        {/* Due today — spaced review of things already learned. */}
        <section aria-labelledby="due-heading">
          <h2 id="due-heading" className="font-display text-xl font-semibold text-slate-800 mb-3">
            {t('practice.dueToday', 'Ready to keep strong')}
          </h2>

          {dueItems.length === 0 ? (
            <EmptyState
              character="Azouz"
              title={t('practice.noneTitle', 'Nothing to review right now')}
              message={t('practice.noneMessage', "You're all caught up! Learn something new and it'll show up here later to keep strong.")}
              actionLabel={t('practice.browseMissions', 'Learn something new')}
              actionTo="/missions"
            />
          ) : (
            <ul className="space-y-2">
              {dueItems.map((item) => {
                const label = masteryLabel(item.state)
                return (
                  <li key={item.competencyId}>
                    <Link
                      to="/missions"
                      className="card flex items-center justify-between gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {item.competency?.name ?? t('practice.aSkill', 'A skill')}
                        </p>
                        {item.competency?.skill?.name && (
                          <p className="text-xs text-slate-500 truncate">{item.competency.skill.name}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${label.tint}`}>
                          {t(label.labelKey, label.fallback)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-500 rtl:scale-x-[-1]" strokeWidth={2} />
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Recommended practice — adaptive engine. Self-hides when quiet. */}
        {recItems.length > 0 && (
          <section aria-labelledby="rec-heading">
            <h2 id="rec-heading" className="font-display text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" strokeWidth={2} />
              {t('practice.recommended', 'Recommended for you')}
            </h2>
            <ul className="space-y-2">
              {recItems.slice(0, 4).map((rec) => (
                <li key={`${rec.type}-${rec.entityId}`}>
                  <Link
                    to="/missions"
                    className="card flex items-center justify-between gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">{rec.title}</p>
                      {rec.reason && <p className="text-xs text-slate-500 truncate">{rec.reason}</p>}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-500 rtl:scale-x-[-1] flex-shrink-0" strokeWidth={2} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
