import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { learningApi } from '@/lib/api/endpoints'

export function ConceptDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: concept, isLoading } = useQuery({
    queryKey: ['concept', id],
    queryFn: () => learningApi.getConcept(id!).then(res => res.data),
    enabled: !!id,
  })

  const { data: unlockStatus } = useQuery({
    queryKey: ['concept-unlock-status', id],
    queryFn: () => learningApi.getUnlockStatus(id!).then(res => res.data),
    enabled: !!id,
  })

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-primary-500 to-secondary-500 shadow-pop">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/learn" className="text-white/90 hover:text-white transition-colors">
              ← Back to Curriculum
            </Link>
            <h1 className="text-2xl font-heading font-bold text-white">🧠 Concept</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : concept ? (
          <>
            <div className="card mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    {concept.name}
                  </h2>
                  <p className="text-gray-600">{concept.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Competency: {concept.competency?.name}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    unlockStatus?.unlocked
                      ? 'bg-success-100 text-success-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {unlockStatus?.unlocked ? '🔓 Unlocked' : '🔒 Locked'}
                </span>
              </div>
            </div>

            {/* Prerequisites */}
            <div className="card mb-6">
              <h3 className="text-lg font-heading font-semibold mb-4">
                🔗 Prerequisites ({unlockStatus?.progress?.completed || 0}/
                {unlockStatus?.progress?.required || 0})
              </h3>
              {concept.prerequisites && concept.prerequisites.length > 0 ? (
                <div className="space-y-2">
                  {concept.prerequisites.map((p: any) => {
                    const status = unlockStatus?.prerequisites?.find(
                      (u: any) => u.conceptId === p.prerequisiteId
                    )
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{p.prerequisite?.name}</p>
                          <p className="text-xs text-gray-500">{p.type}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            status?.complete
                              ? 'bg-success-100 text-success-800'
                              : 'bg-warning-100 text-warning-800'
                          }`}
                        >
                          {status?.state || 'NOT_STARTED'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No prerequisites — ready to go!</p>
              )}
            </div>

            {/* Objectives */}
            {concept.objectives && concept.objectives.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-heading font-semibold mb-4">🎯 Learning Objectives</h3>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  {concept.objectives.map((o: any) => (
                    <li key={o.id}>{o.title || o.description || o.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-600">Concept not found</p>
        )}
      </main>
    </div>
  )
}
