import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Award, CheckCircle2 } from 'lucide-react'
import { masteryApi } from '@/lib/api/endpoints'
import { masteryLabel } from '@/lib/mastery/masteryLabels'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/CharacterState'

/**
 * "What I've proved" — the child-facing Evidence / accomplishments view (task #10).
 *
 * Evidence is core backend infrastructure (every graded attempt records an
 * Evidence row that drives mastery) but had no user-facing surface. This page
 * translates it into meaningful accomplishments a child understands: the skills
 * they've actually shown they can do, grouped by world/domain, in child-friendly
 * mastery language — never the raw MasteryState enum or a confidence decimal.
 *
 * HONESTY: there is no per-evidence read endpoint yet, so this is built from the
 * REAL mastery overview (GET /mastery/overview) — each row is a competency the
 * learner has genuinely accumulated evidence on (evidenceCount, state,
 * lastPracticed). It does not invent per-artifact evidence. A richer
 * evidence-timeline would need a backend GET /mastery/evidence endpoint (noted
 * as a follow-up).
 */
interface MasteryRow {
  id: string
  state: string
  evidenceCount?: number
  lastPracticed?: string | null
  competency?: {
    id: string
    name: string
    skill?: { name: string; domain?: { name: string; slug?: string } }
  }
}

export function EvidencePage() {
  const { t } = useTranslation()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mastery-overview', 'evidence'],
    queryFn: () => masteryApi.getOverview().then((res) => res.data as MasteryRow[]),
  })

  // Only show competencies the learner has actually demonstrated — a "proof"
  // is a competency past NOT_STARTED (real evidence accumulated), grouped by
  // domain/world so it reads as "what I can do in each world".
  const byDomain = useMemo(() => {
    const rows = Array.isArray(data) ? data : []
    const proved = rows.filter((r) => masteryLabel(r.state).band !== 'new')
    const groups = new Map<string, MasteryRow[]>()
    for (const r of proved) {
      const domain = r.competency?.skill?.domain?.name ?? t('evidence.otherDomain', 'Other')
      if (!groups.has(domain)) groups.set(domain, [])
      groups.get(domain)!.push(r)
    }
    return Array.from(groups.entries())
  }, [data, t])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <LoadingState character="Azouz" message={t('evidence.loading', 'Gathering what you have proved…')} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <ErrorState
          character="Azouz"
          title={t('evidence.errorTitle', "Couldn't load your accomplishments")}
          message={t('evidence.errorMessage', "Let's try that again.")}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const provedCount = byDomain.reduce((n, [, rows]) => n + rows.length, 0)

  return (
    <div className="min-h-screen bg-surface-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="icon-chip bg-success-50 text-success-600 w-10 h-10">
              <Award className="w-5 h-5" strokeWidth={2} />
            </div>
            <h1 className="font-display text-3xl font-bold text-slate-900">
              {t('evidence.title', 'What I have proved')}
            </h1>
          </div>
          <p className="text-slate-600">
            {t('evidence.subtitle', 'Every skill here is one you have actually shown you can do.')}
          </p>
        </header>

        {provedCount === 0 ? (
          <EmptyState
            character="Azouz"
            title={t('evidence.emptyTitle', 'Your proof starts soon')}
            message={t('evidence.emptyMessage', 'Finish a mission and the skills you show will appear here as proof.')}
            actionLabel={t('evidence.browseMissions', 'Start a mission')}
            actionTo="/missions"
          />
        ) : (
          byDomain.map(([domain, rows]) => (
            <section key={domain} aria-labelledby={`domain-${domain}`}>
              <h2 id={`domain-${domain}`} className="font-display text-xl font-semibold text-slate-800 mb-3">
                {domain}
              </h2>
              <ul className="space-y-2">
                {rows.map((r) => {
                  const label = masteryLabel(r.state)
                  const count = r.evidenceCount ?? 0
                  return (
                    <li
                      key={r.id}
                      className="card flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CheckCircle2 className="w-5 h-5 text-success-500 shrink-0" strokeWidth={2} />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">
                            {r.competency?.name ?? t('evidence.aSkill', 'A skill')}
                          </p>
                          {count > 0 && (
                            <p className="text-xs text-slate-500">
                              {t('evidence.shownTimes', 'You have shown this {{count}} time', { count })}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${label.tint}`}>
                        {t(label.labelKey, label.fallback)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))
        )}
      </main>
    </div>
  )
}
