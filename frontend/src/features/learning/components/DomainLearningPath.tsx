import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react'
import type { DomainPathSkill } from '@/lib/api/endpoints'
import { masteryLabel } from '@/lib/mastery/masteryLabels'

/**
 * DomainLearningPath — the shared canonical-spine path renderer used by every
 * domain (English/Coding/AI Literacy/Creativity) instead of one bespoke block
 * per page. Given the `skills` from GET /learning/domains/:slug/path, it renders
 * skill groups → competency rows with:
 *   - a state icon (new / in-progress / strong-or-mastered),
 *   - a CHILD-FRIENDLY mastery band chip (never the raw MasteryState enum or the
 *     confidence decimal — translated via lib/mastery/masteryLabels),
 *   - an optional CEFR chip (English only; the field is null elsewhere),
 *   - a Start/Continue link into the competency's real mission.
 *
 * Mission ids come straight from the API — never hardcoded. A competency with
 * no mission yet renders as a non-interactive "coming soon" row.
 */
export interface DomainLearningPathProps {
  skills: DomainPathSkill[]
  /** i18n key (with sensible fallback) for the "Start" verb on unstarted rows. */
  startLabelKey?: string
  startLabelFallback?: string
}

export function DomainLearningPath({
  skills,
  startLabelKey = 'domainPath.start',
  startLabelFallback = 'Start',
}: DomainLearningPathProps) {
  const { t } = useTranslation()
  const visible = skills.filter((s) => s.competencies.length > 0)
  if (visible.length === 0) return null

  return (
    <div className="space-y-6">
      {visible.map((skill) => (
        <div key={skill.id}>
          <h3 className="font-display font-semibold text-slate-700 mb-2">{skill.name}</h3>
          <ul className="space-y-2">
            {skill.competencies.map((c) => {
              const label = masteryLabel(c.masteryState)
              const started = label.band !== 'new'
              const strong = label.band === 'strong' || label.band === 'mastered'
              const StateIcon = strong ? CheckCircle2 : started ? PlayCircle : Circle
              const stateTint = strong ? 'text-success-600' : started ? 'text-primary-600' : 'text-slate-300'
              const inner = (
                <div className="flex items-center gap-3 rounded-card border-2 border-surface-200/70 bg-white p-4 hover:border-primary-300 transition-colors">
                  <StateIcon className={`w-5 h-5 shrink-0 ${stateTint}`} strokeWidth={2} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-semibold text-slate-900">{c.name}</span>
                      {c.cefrLevel && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">
                          {c.cefrLevel}
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${label.tint}`}>
                        {t(label.labelKey, label.fallback)}
                      </span>
                    </div>
                    {c.description && <p className="text-sm text-slate-500 line-clamp-1">{c.description}</p>}
                  </div>
                  {c.missionId && (
                    <span className="btn btn-primary shrink-0 hidden sm:inline-flex text-sm px-3 py-1.5">
                      {started ? t('missionPlayer.continue') : t(startLabelKey, startLabelFallback)}
                    </span>
                  )}
                </div>
              )
              return (
                <li key={c.id}>
                  {c.missionId ? (
                    <Link
                      to={`/missions/${c.missionId}`}
                      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-card"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div
                      aria-disabled
                      title={t('domainPath.comingSoon', 'Coming soon')}
                      className="opacity-70"
                    >
                      {inner}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
