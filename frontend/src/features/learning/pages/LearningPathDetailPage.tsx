import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { learningApi } from '@/lib/api/endpoints'

export function LearningPathDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: path, isLoading } = useQuery({
    queryKey: ['learning-path', id],
    queryFn: () => learningApi.getPath(id!).then(res => res.data),
    enabled: !!id,
  })

  const { data: progress } = useQuery({
    queryKey: ['learning-path-progress', id],
    queryFn: () => learningApi.getPathProgress(id!).then(res => res.data),
    enabled: !!id,
  })

  const completedSet = new Set<string>(progress?.completedNodes || [])

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-primary-500 to-secondary-500 shadow-pop">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/learn/paths" className="text-white/90 hover:text-white transition-colors">
              ← All Paths
            </Link>
            <h1 className="text-2xl font-heading font-bold text-white">🗺️ Learning Path</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : path ? (
          <>
            <div className="card mb-6">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">{path.name}</h2>
              <p className="text-gray-600 mb-2">{path.description}</p>
              <div className="flex gap-2">
                {path.domain?.name && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800">
                    {path.domain.name}
                  </span>
                )}
                {path.ageBand && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {path.ageBand}
                  </span>
                )}
              </div>

              {progress && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-primary-600">
                      {Math.round(progress.percentComplete || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-primary-500 h-2.5 rounded-full"
                      style={{ width: `${progress.percentComplete || 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ordered path nodes */}
            <div className="card">
              <h3 className="text-lg font-heading font-semibold mb-4">📋 Path Steps</h3>
              <ol className="space-y-3">
                {path.nodes?.map((node: any, idx: number) => {
                  const isCompleted = completedSet.has(node.id)
                  const isCurrent = progress?.currentNode?.nodeId === node.id
                  return (
                    <li
                      key={node.id}
                      className={`flex items-center gap-4 p-3 rounded-xl border ${
                        isCurrent
                          ? 'border-primary-400 bg-primary-50'
                          : isCompleted
                          ? 'border-success-200 bg-success-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white font-semibold text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {node.entityName || node.entityId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {node.entityType}
                          {node.isOptional ? ' · optional' : ''}
                        </p>
                      </div>
                      <span className="text-xl">
                        {isCompleted ? '✅' : isCurrent ? '➡️' : '⬜'}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>
          </>
        ) : (
          <p className="text-gray-600">Learning path not found</p>
        )}
      </main>
    </div>
  )
}
