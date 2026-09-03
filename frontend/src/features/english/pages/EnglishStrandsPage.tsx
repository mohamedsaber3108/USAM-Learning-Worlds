import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { englishApi, type EnglishStrand, type EnglishStrandFamily } from '@/lib/api/endpoints'

// The 9 real strand families, backed by the `EnglishStrand.strandType`
// enum column (migration `20260903_add_english_strand_type_column.sql`).
// Previously this page grouped strands by regex-parsing `name`
// ("<Family>: <Topic> (<CEFR>)") client-side - that fragile parsing is
// gone; `strand.strandType` is now a real, queryable server-side value.
const STRAND_FAMILIES: { value: EnglishStrandFamily; label: string }[] = [
  { value: 'VOCABULARY', label: 'Vocabulary' },
  { value: 'GRAMMAR', label: 'Grammar' },
  { value: 'PRONUNCIATION', label: 'Pronunciation' },
  { value: 'LISTENING', label: 'Listening' },
  { value: 'READING', label: 'Reading' },
  { value: 'WRITING', label: 'Writing' },
  { value: 'SPEAKING', label: 'Speaking' },
  { value: 'SHADOWING', label: 'Shadowing' },
  { value: 'DICTATION', label: 'Dictation' },
]

const FAMILY_ICON: Record<EnglishStrandFamily, string> = {
  VOCABULARY: '📖',
  GRAMMAR: '✏️',
  PRONUNCIATION: '🗣️',
  LISTENING: '👂',
  READING: '📚',
  WRITING: '✍️',
  SPEAKING: '💬',
  SHADOWING: '🎭',
  DICTATION: '⌨️',
}

const CEFR_COLORS: Record<string, string> = {
  A1: 'bg-green-100 text-green-800',
  A2: 'bg-green-200 text-green-900',
  B1: 'bg-blue-100 text-blue-800',
  B2: 'bg-blue-200 text-blue-900',
  C1: 'bg-purple-100 text-purple-800',
  C2: 'bg-purple-200 text-purple-900',
}

export function EnglishStrandsPage() {
  const [cefrFilter, setCefrFilter] = useState('')
  const [activeFamily, setActiveFamily] = useState<EnglishStrandFamily | null>(null)

  const { data: strands, isLoading, isError } = useQuery({
    queryKey: ['english-strands', cefrFilter],
    queryFn: () =>
      englishApi
        .listStrands(cefrFilter ? { cefrLevel: cefrFilter } : undefined)
        .then((res) => res.data),
  })

  // Group by the real `strandType` column instead of regex-parsing `name`.
  const grouped: Record<string, EnglishStrand[]> = {}
  for (const strand of strands || []) {
    const fam = strand.strandType || 'VOCABULARY'
    if (!grouped[fam]) grouped[fam] = []
    grouped[fam]!.push(strand)
  }

  const familiesToShow = activeFamily
    ? STRAND_FAMILIES.filter((f) => f.value === activeFamily)
    : STRAND_FAMILIES

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-500 to-secondary-500 shadow-pop">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-white/90 hover:text-white transition-colors">
                ← Back
              </Link>
              <h1 className="text-2xl font-heading font-bold text-white">🇬🇧 English Strands</h1>
            </div>
            <Link
              to="/english/coach"
              className="btn bg-white/90 text-primary-700 hover:bg-white shadow-none"
            >
              💬 Talk to Coach
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CEFR filter */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">CEFR Level:</span>
            <button
              className={`px-3 py-1 rounded text-sm font-medium ${
                cefrFilter === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setCefrFilter('')}
            >
              All
            </button>
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
              <button
                key={level}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  cefrFilter === level ? 'bg-primary-600 text-white' : CEFR_COLORS[level] || 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setCefrFilter(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Strand family tabs (the 9 strand types, filtered server-side by strandType) */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-2 rounded-xl text-sm font-semibold ${
                activeFamily === null ? 'bg-secondary-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setActiveFamily(null)}
            >
              All 9 Strands
            </button>
            {STRAND_FAMILIES.map((fam) => (
              <button
                key={fam.value}
                className={`px-3 py-2 rounded-xl text-sm font-semibold ${
                  activeFamily === fam.value ? 'bg-secondary-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setActiveFamily(fam.value)}
              >
                {FAMILY_ICON[fam.value]} {fam.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading strands...</p>
          </div>
        )}

        {isError && (
          <div className="card text-center py-8">
            <p className="text-gray-700">Could not load English strands right now.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-8">
            {familiesToShow.map((fam) => {
              const items = grouped[fam.value] || []
              if (items.length === 0) return null
              return (
                <section key={fam.value}>
                  <h2 className="text-xl font-heading font-bold text-gray-900 mb-3">
                    {FAMILY_ICON[fam.value]} {fam.label}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items
                      .sort((a, b) => a.order - b.order)
                      .map((strand) => (
                        <div key={strand.id} className="card hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 line-clamp-2">
                              {strand.name}
                            </h3>
                            {strand.cefrLevel && (
                              <span
                                className={`ml-2 shrink-0 px-2 py-1 rounded text-xs font-bold ${
                                  CEFR_COLORS[strand.cefrLevel] || 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {strand.cefrLevel}
                              </span>
                            )}
                          </div>
                          {strand.description && (
                            <p className="text-sm text-gray-600 line-clamp-3">{strand.description}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </section>
              )
            })}

            {(strands || []).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No strands found for this filter</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
