import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { thinkingSkillsApi, type ThinkingSkillEngine } from '@/lib/api/endpoints'

const ENGINE_META: Record<ThinkingSkillEngine, { title: string; icon: string; gradient: string }> = {
  'problem-solving': { title: 'Problem Solving', icon: '🧩', gradient: 'from-orange-500 to-red-500' },
  'computational-thinking': { title: 'Computational Thinking', icon: '🧠', gradient: 'from-blue-500 to-indigo-500' },
  'critical-thinking': { title: 'Critical Thinking', icon: '🔍', gradient: 'from-teal-500 to-cyan-600' },
}

const AGE_BAND_COLORS: Record<string, string> = {
  AGE_8_9: 'bg-green-100 text-green-800',
  AGE_10_11: 'bg-blue-100 text-blue-800',
  AGE_12_14: 'bg-purple-100 text-purple-800',
}

export function ThinkingSkillConceptDetailPage() {
  const { engine, slug } = useParams<{ engine: ThinkingSkillEngine; slug: string }>()
  const meta = engine ? ENGINE_META[engine] : undefined

  const { data: concept, isLoading, isError } = useQuery({
    queryKey: ['thinking-skill-concept', engine, slug],
    enabled: !!engine && !!slug,
    queryFn: () =>
      thinkingSkillsApi.getConcept(engine as ThinkingSkillEngine, slug as string).then((res) => res.data),
  })

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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={`/thinking/${engine}`} className="text-white/90 hover:text-white transition-colors">
            <span className="inline-block rtl:scale-x-[-1]">←</span> Back to {meta.title}
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
