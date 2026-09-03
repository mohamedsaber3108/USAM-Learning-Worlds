import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  thinkingSkillsApi,
  type ThinkingSkillConcept,
  type ThinkingSkillEngine,
} from '@/lib/api/endpoints'

/**
 * Shared page for the three Thinking Skills engines
 * (ProblemSolvingConcept, ComputationalThinkingConcept, CriticalThinkingConcept).
 * Mirrors CrossCurricularPage.tsx's convention exactly (list/detail pair,
 * category tabs, age-band filter) since all three models share the same
 * shape. Found 2026-09-03: fully seeded (15/14/15 rows) with working
 * backend routes and zero frontend surface.
 *
 * Route: /thinking/:engine where engine is one of
 * 'problem-solving' | 'computational-thinking' | 'critical-thinking'.
 */

const ENGINE_META: Record<
  ThinkingSkillEngine,
  { title: string; icon: string; gradient: string }
> = {
  'problem-solving': {
    title: 'Problem Solving',
    icon: '🧩',
    gradient: 'from-orange-500 to-red-500',
  },
  'computational-thinking': {
    title: 'Computational Thinking',
    icon: '🧠',
    gradient: 'from-blue-500 to-indigo-500',
  },
  'critical-thinking': {
    title: 'Critical Thinking',
    icon: '🔍',
    gradient: 'from-teal-500 to-cyan-600',
  },
}

const AGE_BANDS = [
  { value: '', label: 'All Ages' },
  { value: 'AGE_8_9', label: 'Age 8-9' },
  { value: 'AGE_10_11', label: 'Age 10-11' },
  { value: 'AGE_12_14', label: 'Age 12-14' },
] as const

const AGE_BAND_COLORS: Record<string, string> = {
  AGE_8_9: 'bg-green-100 text-green-800',
  AGE_10_11: 'bg-blue-100 text-blue-800',
  AGE_12_14: 'bg-purple-100 text-purple-800',
}

function humanizeCategory(raw: string): string {
  return raw
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
}

export function ThinkingSkillsPage() {
  const { engine } = useParams<{ engine: ThinkingSkillEngine }>()
  const [ageBandFilter, setAgeBandFilter] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const meta = engine ? ENGINE_META[engine] : undefined

  const { data: concepts, isLoading, isError } = useQuery({
    queryKey: ['thinking-skills', engine, ageBandFilter],
    enabled: !!engine,
    queryFn: () =>
      thinkingSkillsApi
        .list(engine as ThinkingSkillEngine, ageBandFilter ? { ageBand: ageBandFilter } : undefined)
        .then((res) => res.data),
  })

  const subCategories = useMemo(() => {
    const set = new Set<string>()
    for (const c of concepts || []) set.add(c.category)
    return Array.from(set)
  }, [concepts])

  const grouped: Record<string, ThinkingSkillConcept[]> = {}
  for (const c of concepts || []) {
    if (!grouped[c.category]) grouped[c.category] = []
    grouped[c.category]!.push(c)
  }

  const categoriesToShow = activeCategory ? [activeCategory] : subCategories

  if (!engine || !meta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Unknown thinking skills engine.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className={`bg-gradient-to-r ${meta.gradient} shadow-pop`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/learn" className="text-white/90 hover:text-white transition-colors">
                ← Back
              </Link>
              <h1 className="text-2xl font-heading font-bold text-white">
                {meta.icon} {meta.title}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Age Band:</span>
            {AGE_BANDS.map((band) => (
              <button
                key={band.value}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  ageBandFilter === band.value
                    ? 'bg-primary-600 text-white'
                    : AGE_BAND_COLORS[band.value] || 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setAgeBandFilter(band.value)}
              >
                {band.label}
              </button>
            ))}
          </div>
        </div>

        {subCategories.length > 0 && (
          <div className="card mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-2 rounded-xl text-sm font-semibold ${
                  activeCategory === null ? 'bg-secondary-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setActiveCategory(null)}
              >
                All Topics
              </button>
              {subCategories.map((cat) => (
                <button
                  key={cat}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold ${
                    activeCategory === cat ? 'bg-secondary-600 text-white' : 'bg-gray-100 text-gray-700'
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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading concepts...</p>
          </div>
        )}

        {isError && (
          <div className="card text-center py-8">
            <p className="text-gray-700">Could not load {meta.title} concepts right now.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-8">
            {categoriesToShow.map((cat) => {
              const items = grouped[cat] || []
              if (items.length === 0) return null
              return (
                <section key={cat}>
                  <h2 className="text-xl font-heading font-bold text-gray-900 mb-3">
                    {humanizeCategory(cat)}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items
                      .sort((a, b) => a.order - b.order)
                      .map((concept) => (
                        <Link
                          key={concept.id}
                          to={`/thinking/${engine}/${concept.slug}`}
                          className="card hover:shadow-soft-hover transition-shadow block"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 line-clamp-2">
                              {concept.name}
                            </h3>
                            <span
                              className={`ml-2 shrink-0 px-2 py-1 rounded text-xs font-bold ${
                                AGE_BAND_COLORS[concept.ageAppropriate] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {concept.ageAppropriate.replace('AGE_', '').replace('_', '-')}
                            </span>
                          </div>
                          {concept.description && (
                            <p className="text-sm text-gray-600 line-clamp-3">{concept.description}</p>
                          )}
                        </Link>
                      ))}
                  </div>
                </section>
              )
            })}

            {(concepts || []).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No concepts found for this filter</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
