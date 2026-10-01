import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Compass, RotateCcw } from 'lucide-react'
import { learningApi, masteryApi } from '@/lib/api/endpoints'
import type { DomainPath } from '@/lib/api/endpoints'
import { DomainLearningPath } from '../components/DomainLearningPath'
import { CharacterFace } from '@/features/characters/components/CharacterFace'
import { LoadingState, EmptyState, ErrorState, type CompanionName } from '@/components/common/CharacterState'

/**
 * DomainPathPage — the ONE generic domain-experience page, driven by slug, that
 * every learning domain shares (English/Coding/AI Literacy/Creativity) instead
 * of four bespoke landing pages. It composes the shared canonical-spine path
 * (GET /learning/domains/:slug/path) with:
 *   - a companion-led intro header + the ONE next action (first unstarted, else
 *     first in-progress, competency's mission),
 *   - the DomainLearningPath (skills → competencies → child-friendly mastery),
 *   - a review-due nudge (links /practice) when the learner has spaced reviews,
 *   - a link to the domain's TOOL (coach / gallery / concept catalog / missions).
 *
 * All learner-facing text is child-friendly: no MasteryState enum, no confidence
 * decimals, no backend jargon.
 */

interface DomainConfig {
  companion: CompanionName
  /** i18n key for the domain display name (falls back to API domain.name). */
  nameKey: string
  /** The domain's own tool/explore surface. */
  toolTo: string
  toolLabelKey: string
  toolLabelFallback: string
}

// slug → presentation. Slugs are the seeded Domain slugs; unknown slugs still
// render (companion defaults to Azouz, tool link falls back to /missions).
const DOMAIN_CONFIG: Record<string, DomainConfig> = {
  english: {
    companion: 'Luma',
    nameKey: 'domainPath.name.english',
    toolTo: '/english/coach',
    toolLabelKey: 'domainPath.tool.english',
    toolLabelFallback: 'Talk with Luma',
  },
  coding: {
    companion: 'Codey',
    nameKey: 'domainPath.name.coding',
    toolTo: '/coding',
    toolLabelKey: 'domainPath.tool.coding',
    toolLabelFallback: 'Explore coding',
  },
  'ai-literacy': {
    companion: 'Nova',
    nameKey: 'domainPath.name.aiLiteracy',
    toolTo: '/cross-curricular/ai-literacy',
    toolLabelKey: 'domainPath.tool.aiLiteracy',
    toolLabelFallback: 'Explore AI ideas',
  },
  creativity: {
    companion: 'Mira',
    nameKey: 'domainPath.name.creativity',
    toolTo: '/creativity',
    toolLabelKey: 'domainPath.tool.creativity',
    toolLabelFallback: 'Make something',
  },
  // Entrepreneurship — the 4th LOCKED primary domain (Adam mentor). Content is
  // the thinnest today (plans-local/13); the generic spine still renders its
  // path, and the tool link opens the entrepreneurship concept/simulation
  // surface via the cross-curricular route.
  entrepreneurship: {
    companion: 'Adam',
    nameKey: 'domainPath.name.entrepreneurship',
    toolTo: '/cross-curricular/entrepreneurship',
    toolLabelKey: 'domainPath.tool.entrepreneurship',
    toolLabelFallback: 'Build & pitch an idea',
  },
}

const DEFAULT_CONFIG: DomainConfig = {
  companion: 'Azouz',
  nameKey: 'domainPath.name.default',
  toolTo: '/missions',
  toolLabelKey: 'domainPath.tool.default',
  toolLabelFallback: 'Explore missions',
}

export function DomainPathPage() {
  const { t } = useTranslation()
  const { slug = '' } = useParams<{ slug: string }>()
  const cfg = DOMAIN_CONFIG[slug] ?? DEFAULT_CONFIG

  const {
    data: path,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['domain-path', slug],
    queryFn: () => learningApi.getDomainPath(slug).then((res) => res.data as DomainPath),
    enabled: Boolean(slug),
  })

  const { data: reviewDue } = useQuery({
    queryKey: ['review-due', 'domain', slug],
    queryFn: () => masteryApi.getReviewDue().then((res) => res.data as unknown[]),
    retry: false,
  })
  const reviewCount = Array.isArray(reviewDue) ? reviewDue.length : 0

  // The ONE next action: first competency with a mission that isn't started
  // yet; if all started, the first in-progress one; else nothing.
  const nextAction = useMemo(() => {
    const comps = (path?.skills ?? []).flatMap((s) => s.competencies).filter((c) => c.missionId)
    const unstarted = comps.find((c) => c.masteryState === 'NOT_STARTED')
    const inProgress = comps.find(
      (c) => c.masteryState !== 'NOT_STARTED' && c.masteryState !== 'MASTERED'
    )
    return unstarted ?? inProgress ?? comps[0] ?? null
  }, [path])

  const domainName = path?.domain?.name ?? t(cfg.nameKey, slug)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <LoadingState character={cfg.companion} message={t('domainPath.loading', 'Getting your path ready…')} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <ErrorState
          character={cfg.companion}
          title={t('domainPath.errorTitle', "Couldn't load this path")}
          message={t('domainPath.errorMessage', "Let's try that again.")}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const skills = path?.skills ?? []
  const hasPath = skills.some((s) => s.competencies.length > 0)

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Companion intro + ONE next action. */}
      <header className="bg-brand-hero relative overflow-hidden shadow-lift">
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Companion present at scale — the domain mentor (Nova for AI, Adam
              for entrepreneurship, etc.) leads the path, consistent with every
              other domain surface and the Home world journey. */}
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/15 p-1.5 shrink-0">
              <CharacterFace characterId={cfg.companion} size={60} state="encouraging" />
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-sm">{t('domainPath.kicker', 'Your learning path')}</p>
              <h1 className="text-3xl font-display font-extrabold text-white mt-0.5">{domainName}</h1>
            </div>
          </div>

          {nextAction?.missionId && (
            <Link
              to={`/missions/${nextAction.missionId}`}
              className="mt-5 inline-flex items-center gap-3 rounded-card bg-white/95 hover:bg-white transition-colors px-5 py-3 shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <div className="min-w-0 text-start">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                  {nextAction.masteryState === 'NOT_STARTED'
                    ? t('domainPath.nextStart', 'Start here')
                    : t('domainPath.nextContinue', 'Pick up where you left off')}
                </p>
                <p className="font-display font-bold text-slate-900 truncate">{nextAction.name}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-primary-600 rtl:scale-x-[-1] shrink-0" strokeWidth={2.5} />
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Review due — self-hiding nudge to keep learned skills strong. */}
        {reviewCount > 0 && (
          <Link
            to="/practice"
            className="card flex items-center justify-between gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="icon-chip bg-accent-50 text-accent-600 w-10 h-10 shrink-0">
                <RotateCcw className="w-5 h-5" strokeWidth={2} />
              </div>
              <p className="font-medium text-slate-800">
                {t('home.reviewDueTitle', { count: reviewCount, defaultValue: 'Time to keep {{count}} skills strong' })}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-500 rtl:scale-x-[-1] shrink-0" strokeWidth={2} />
          </Link>
        )}

        {/* The path itself. */}
        <section aria-labelledby="path-heading">
          <h2 id="path-heading" className="text-lg font-display font-bold text-slate-900 mb-1">
            {t('domainPath.title', 'What you are learning')}
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            {t('domainPath.subtitle', 'Work through these one step at a time. Each one opens a real mission.')}
          </p>

          {hasPath ? (
            <DomainLearningPath skills={skills} />
          ) : (
            <EmptyState
              character={cfg.companion}
              title={t('domainPath.emptyTitle', 'This path is being built')}
              message={t('domainPath.emptyMessage', "There's nothing here just yet — try exploring while we add more.")}
              actionLabel={t(cfg.toolLabelKey, cfg.toolLabelFallback)}
              actionTo={cfg.toolTo}
            />
          )}
        </section>

        {/* Domain tool / explore surface. */}
        <section>
          <Link
            to={cfg.toolTo}
            className="card flex items-center justify-between gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="icon-chip bg-primary-50 text-primary-600 w-10 h-10 shrink-0">
                <Compass className="w-5 h-5" strokeWidth={2} />
              </div>
              <p className="font-medium text-slate-800">{t(cfg.toolLabelKey, cfg.toolLabelFallback)}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-500 rtl:scale-x-[-1] shrink-0" strokeWidth={2} />
          </Link>
        </section>
      </main>
    </div>
  )
}
