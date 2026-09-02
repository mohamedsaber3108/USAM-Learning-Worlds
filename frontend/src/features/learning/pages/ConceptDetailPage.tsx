import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, Link2, Target, Lock, Unlock } from 'lucide-react'
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
    <div className="min-h-screen bg-surface-50">
      <header className="bg-primary-600 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/learn" className="flex items-center gap-1 text-white/90 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Back to Curriculum
            </Link>
            <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5" strokeWidth={2} />
              Concept
            </h1>
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">
                    {concept.name}
                  </h2>
                  <p className="text-slate-600">{concept.description}</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Competency: {concept.competency?.name}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-control text-sm font-medium flex-shrink-0 ${
                    unlockStatus?.unlocked
                      ? 'bg-success-100 text-success-700'
                      : 'bg-surface-100 text-slate-600'
                  }`}
                >
                  {unlockStatus?.unlocked ? (
                    <Unlock className="w-4 h-4" strokeWidth={2} />
                  ) : (
                    <Lock className="w-4 h-4" strokeWidth={2} />
                  )}
                  {unlockStatus?.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            </div>

            {/* Prerequisites */}
            <div className="card mb-6">
              <h3 className="flex items-center gap-2 mb-4">
                <Link2 className="w-5 h-5 text-primary-600" strokeWidth={2} />
                Prerequisites ({unlockStatus?.progress?.completed || 0}/
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
                        className="flex items-center justify-between p-3 bg-surface-50 rounded-control"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{p.prerequisite?.name}</p>
                          <p className="text-xs text-slate-500">{p.type}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-control text-xs font-medium ${
                            status?.complete
                              ? 'bg-success-100 text-success-700'
                              : 'bg-warning-100 text-warning-700'
                          }`}
                        >
                          {status?.state || 'NOT_STARTED'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No prerequisites — ready to go!</p>
              )}
            </div>

            {/* Objectives */}
            {concept.objectives && concept.objectives.length > 0 && (
              <div className="card">
                <h3 className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-primary-600" strokeWidth={2} />
                  Learning Objectives
                </h3>
                <ul className="space-y-2 list-disc list-inside text-slate-700">
                  {concept.objectives.map((o: any) => (
                    <li key={o.id}>{o.title || o.description || o.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-600">Concept not found</p>
        )}
      </main>
    </div>
  )
}
