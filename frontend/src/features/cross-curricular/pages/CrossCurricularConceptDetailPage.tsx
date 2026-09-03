import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { crossCurricularApi, type CrossCurricularCategory } from '@/lib/api/endpoints'

const CATEGORY_META: Record<CrossCurricularCategory, { title: string; icon: string; gradient: string }> = {
  'ai-literacy': { title: 'AI Literacy', icon: '🤖', gradient: 'from-violet-500 to-indigo-500' },
  entrepreneurship: { title: 'Entrepreneurship', icon: '💡', gradient: 'from-amber-500 to-orange-500' },
  'financial-literacy': { title: 'Financial Literacy', icon: '💰', gradient: 'from-emerald-500 to-teal-500' },
  'digital-literacy': { title: 'Digital Literacy', icon: '🛡️', gradient: 'from-sky-500 to-cyan-500' },
}

const AGE_BAND_COLORS: Record<string, string> = {
  AGE_8_9: 'bg-green-100 text-green-800',
  AGE_10_11: 'bg-blue-100 text-blue-800',
  AGE_12_14: 'bg-purple-100 text-purple-800',
}

export function CrossCurricularConceptDetailPage() {
  const { category, slug } = useParams<{ category: CrossCurricularCategory; slug: string }>()
  const meta = category ? CATEGORY_META[category] : undefined

  const { data: concept, isLoading, isError } = useQuery({
    queryKey: ['cross-curricular-concept', category, slug],
    enabled: !!category && !!slug,
    queryFn: () =>
      crossCurricularApi.getConcept(category as CrossCurricularCategory, slug as string).then((res) => res.data),
  })

  if (!category || !meta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Unknown cross-curricular category.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className={`bg-gradient-to-r ${meta.gradient} shadow-pop`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={`/cross-curricular/${category}`} className="text-white/90 hover:text-white transition-colors">
            ← Back to {meta.title}
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}
        {isError && (
          <div className="card text-center py-8">
            <p className="text-gray-700">Could not load this concept.</p>
          </div>
        )}
        {concept && (
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-heading font-bold text-gray-900">{concept.name}</h1>
              <span
                className={`ml-2 shrink-0 px-2 py-1 rounded text-xs font-bold ${
                  AGE_BAND_COLORS[concept.ageAppropriate] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {concept.ageAppropriate}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">{concept.category}</p>
            {concept.description && (
              <p className="text-gray-700 leading-relaxed">{concept.description}</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
