import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Route, ArrowRight, ArrowLeft, Bot, Rocket, PiggyBank, ShieldCheck,
  Compass, Mic2, Code2, Star, type LucideIcon,
} from 'lucide-react'
import {
  crossCurricularApi,
  type CrossCurricularCategory,
  type CrossCurricularConcept,
} from '@/lib/api/endpoints'
import { ageRange } from '@/lib/age/ageLabels'
import { CharacterFace } from '@/features/characters/components/CharacterFace'
import { LoadingState, ErrorState, EmptyState, type CompanionName } from '@/components/common/CharacterState'

/**
 * Shared page for the three cross-curricular concept models
 * (AILiteracyConcept, EntrepreneurshipConcept, FinancialLiteracyConcept).
 * One parameterized page rather than three near-identical files, following
 * the same card/list + age-band-filter convention as
 * EnglishStrandsPage.tsx (family filter -> age-band filter here) and
 * CurriculumBrowsePage.tsx (grouped cards).
 *
 * Route: /cross-curricular/:category where category is one of
 * 'ai-literacy' | 'entrepreneurship' | 'financial-literacy'.
 */

// Per-category presentation: a lucide icon (no emoji), a world-hue gradient,
// and the CHARACTER who leads it (Nova for AI, Adam for entrepreneurship, Nour
// for money, Byte for digital safety, etc.) — so each cross-curricular surface
// has a mentor present, consistent with the domain pages + Home world journey.
// `titleKey` resolves against crossCurricular.category.* (EN+AR).
const CATEGORY_META: Record<
  CrossCurricularCategory,
  { titleKey: string; titleFallback: string; icon: LucideIcon; gradient: string; mentor: CompanionName }
> = {
  'ai-literacy': { titleKey: 'aiLiteracy', titleFallback: 'AI Literacy', icon: Bot, gradient: 'from-secondary-400 to-secondary-600', mentor: 'Nova' },
  entrepreneurship: { titleKey: 'entrepreneurship', titleFallback: 'Entrepreneurship', icon: Rocket, gradient: 'from-accent-400 to-accent-600', mentor: 'Adam' },
  'financial-literacy': { titleKey: 'financialLiteracy', titleFallback: 'Financial Literacy', icon: PiggyBank, gradient: 'from-success-400 to-success-600', mentor: 'Nour' },
  'digital-literacy': { titleKey: 'digitalLiteracy', titleFallback: 'Digital Literacy', icon: ShieldCheck, gradient: 'from-sky-400 to-sky-600', mentor: 'Byte' },
  'career-exploration': { titleKey: 'careerExploration', titleFallback: 'Career Exploration', icon: Compass, gradient: 'from-primary-400 to-primary-600', mentor: 'Atlas' },
  'communication-skills': { titleKey: 'communicationSkills', titleFallback: 'Communication Skills', icon: Mic2, gradient: 'from-bubble-400 to-bubble-600', mentor: 'Tala' },
  'coding-concepts': { titleKey: 'codingConcepts', titleFallback: 'Coding Concepts', icon: Code2, gradient: 'from-success-400 to-success-600', mentor: 'Codey' },
}

/** CodingConcept has no ageAppropriate column (uses difficulty:Int instead),
 * so its category hides the age-band filter/badges the other five models use. */
const HAS_AGE_BAND: Record<CrossCurricularCategory, boolean> = {
  'ai-literacy': true,
  entrepreneurship: true,
  'financial-literacy': true,
  'digital-literacy': true,
  'career-exploration': true,
  'communication-skills': true,
  'coding-concepts': false,
}

/** Categories that are also a real canonical-spine domain get a prominent
 * "follow the learning path" CTA (mission-based progression), so the page is
 * not just a concept catalog. Maps category -> Domain slug used by
 * /learning/domains/:slug/path (DomainPathPage). Categories without a seeded
 * domain (entrepreneurship, financial-literacy, etc.) stay catalog-only.
 * coding-concepts has its own /coding landing, so it's intentionally omitted. */
const DOMAIN_PATH_SLUG: Partial<Record<CrossCurricularCategory, string>> = {
  'ai-literacy': 'ai-literacy',
}

// Product-facing labels via the shared age-label source of truth (never the
// raw enum numbers — see lib/age/ageLabels.ts + North Star).
const AGE_BANDS = [
  { value: '', label: 'All Ages' },
  { value: 'AGE_8_9', label: `Age ${ageRange('AGE_8_9')}` },
  { value: 'AGE_10_11', label: `Age ${ageRange('AGE_10_11')}` },
  { value: 'AGE_12_14', label: `Age ${ageRange('AGE_12_14')}` },
] as const

const AGE_BAND_COLORS: Record<string, string> = {
  AGE_8_9: 'bg-success-50 text-success-700',
  AGE_10_11: 'bg-sky-50 text-sky-700',
  AGE_12_14: 'bg-grape-50 text-grape-700',
}

function humanizeCategory(raw: string): string {
  return raw
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
}

export function CrossCurricularPage() {
  const { t } = useTranslation()
  const { category } = useParams<{ category: CrossCurricularCategory }>()
  const [ageBandFilter, setAgeBandFilter] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const meta = category ? CATEGORY_META[category] : undefined
  const showAgeBand = category ? HAS_AGE_BAND[category] : true
  const pathSlug = category ? DOMAIN_PATH_SLUG[category] : undefined

  const { data: concepts, isLoading, isError } = useQuery({
    queryKey: ['cross-curricular', category, ageBandFilter],
    enabled: !!category,
    queryFn: () =>
      crossCurricularApi
        .list(category as CrossCurricularCategory, ageBandFilter ? { ageBand: ageBandFilter } : undefined)
        .then((res) => res.data),
  })

  const subCategories = useMemo(() => {
    const set = new Set<string>()
    for (const c of concepts || []) set.add(c.category)
    return Array.from(set)
  }, [concepts])

  const grouped: Record<string, CrossCurricularConcept[]> = {}
  for (const c of concepts || []) {
    if (!grouped[c.category]) grouped[c.category] = []
    grouped[c.category]!.push(c)
  }

  const categoriesToShow = activeCategory ? [activeCategory] : subCategories

  if (!category || !meta) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <EmptyState
          character="Azouz"
          title={t('crossCurricular.unknownTitle', 'Unknown topic')}
          message={t('crossCurricular.unknownMessage', "That topic doesn't exist — let's head back to Learn.")}
          actionLabel={t('crossCurricular.back', 'Back to Learn')}
          actionTo="/learn"
        />
      </div>
    )
  }

  const CategoryIcon = meta.icon
  const title = t(`crossCurricular.category.${meta.titleKey}`, meta.titleFallback)

  return (
    <div className="min-h-screen bg-surface-50">
      {/* World-hue brand header with the category's MENTOR present (no emoji). */}
      <header className={`relative overflow-hidden bg-gradient-to-br ${meta.gradient} shadow-lift`}>
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div aria-hidden className="absolute -top-10 -end-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/learn" className="inline-flex items-center gap-1 text-white/90 hover:text-white text-sm font-semibold mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
            {t('crossCurricular.back', 'Back to Learn')}
          </Link>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/15 p-1.5 shrink-0">
              <CharacterFace characterId={meta.mentor} size={56} state="encouraging" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight inline-flex items-center gap-2">
              <CategoryIcon className="w-6 h-6" strokeWidth={2} />
              {title}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Learning-path CTA (primary) — for categories backed by a real
            canonical-spine domain, lead with the mission-based path, not the
            concept catalog. The catalog below becomes "explore the ideas". */}
        {pathSlug && (
          <Link
            to={`/learning/domains/${pathSlug}/path`}
            className="card flex items-center justify-between gap-3 mb-6 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="icon-chip bg-primary-50 text-primary-600 w-11 h-11 shrink-0">
                <Route className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="font-display font-semibold text-slate-900">
                  {t('crossCurricular.pathTitle', 'Follow your learning path')}
                </p>
                <p className="text-sm text-slate-500">
                  {t('crossCurricular.pathSubtitle', 'Step-by-step missions that build real understanding.')}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 rtl:scale-x-[-1] shrink-0" strokeWidth={2} />
          </Link>
        )}

        {/* Age band filter */}
        {showAgeBand && (
        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-700 me-1">{t('crossCurricular.ageBand', 'Age')}</span>
            {AGE_BANDS.map((band) => (
              <button
                key={band.value}
                aria-pressed={ageBandFilter === band.value}
                className={`px-3 py-1.5 min-h-11 rounded-pill text-sm font-semibold transition-colors ${
                  ageBandFilter === band.value
                    ? 'bg-primary-600 text-white'
                    : AGE_BAND_COLORS[band.value] || 'bg-surface-100 text-slate-700 hover:bg-surface-200'
                }`}
                onClick={() => setAgeBandFilter(band.value)}
              >
                {band.value === '' ? t('crossCurricular.allAges', 'All ages') : band.label}
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Sub-category tabs (derived from real `category` field on the model) */}
        {subCategories.length > 0 && (
          <div className="card mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                aria-pressed={activeCategory === null}
                className={`px-3 py-2 rounded-pill text-sm font-semibold transition-colors ${
                  activeCategory === null ? 'bg-secondary-500 text-white' : 'bg-surface-100 text-slate-700 hover:bg-surface-200'
                }`}
                onClick={() => setActiveCategory(null)}
              >
                {t('crossCurricular.allTopics', 'All topics')}
              </button>
              {subCategories.map((cat) => (
                <button
                  key={cat}
                  aria-pressed={activeCategory === cat}
                  className={`px-3 py-2 rounded-pill text-sm font-semibold transition-colors ${
                    activeCategory === cat ? 'bg-secondary-500 text-white' : 'bg-surface-100 text-slate-700 hover:bg-surface-200'
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {humanizeCategory(cat)}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <LoadingState character={meta.mentor} message={t('crossCurricular.loading', 'Loading…')} />
        )}

        {isError && (
          <ErrorState
            character={meta.mentor}
            title={t('crossCurricular.errorTitle', "Couldn't load this")}
            message={t('crossCurricular.errorMessage', "No worries — let's try that again.")}
          />
        )}

        {!isLoading && !isError && (
          <div className="space-y-8">
            {categoriesToShow.map((cat) => {
              const items = grouped[cat] || []
              if (items.length === 0) return null
              return (
                <section key={cat}>
                  <h2 className="text-xl font-heading font-bold text-ink mb-3">
                    {humanizeCategory(cat)}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items
                      .sort((a, b) => a.order - b.order)
                      .map((concept) => (
                        <Link
                          key={concept.id}
                          to={`/cross-curricular/${category}/${concept.slug}`}
                          className="card hover:shadow-soft-hover transition-shadow block"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-ink line-clamp-2">
                              {concept.name}
                            </h3>
                            {concept.ageAppropriate ? (
                              <span
                                className={`ms-2 shrink-0 px-2 py-1 rounded text-xs font-bold ${
                                  AGE_BAND_COLORS[concept.ageAppropriate] || 'bg-surface-200 text-ink'
                                }`}
                              >
                                {ageRange(concept.ageAppropriate)}
                              </span>
                            ) : concept.difficulty != null ? (
                              <span className="ms-2 shrink-0 inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-bold bg-secondary-50 text-secondary-700">
                                {Array.from({ length: concept.difficulty }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-current" />
                                ))}
                              </span>
                            ) : null}
                          </div>
                          {concept.description && (
                            <p className="text-sm text-slate-600 line-clamp-3">{concept.description}</p>
                          )}
                        </Link>
                      ))}
                  </div>
                </section>
              )
            })}

            {(concepts || []).length === 0 && (
              <EmptyState
                character={meta.mentor}
                title={t('crossCurricular.emptyTitle', 'Nothing here yet')}
                message={t('crossCurricular.emptyMessage', 'Try a different age or topic — more is on the way.')}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
