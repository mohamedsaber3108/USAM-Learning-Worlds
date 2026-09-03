import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Map } from 'lucide-react'
import { curriculumApi, learningApi } from '@/lib/api/endpoints'

interface LearningPath {
  id: string
  name: string
  slug: string
  description?: string
  ageBand?: string
  domain?: { id: string; name: string; slug: string }
  nodes?: Array<{ id: string; entityType: string; entityId: string; order: number }>
}

export function LearningPathsPage() {
  const [domainId, setDomainId] = useState<string>('')

  const { data: domains } = useQuery({
    queryKey: ['curriculum-domains'],
    queryFn: () => curriculumApi.getDomains().then(res => res.data),
  })

  const { data: paths, isLoading } = useQuery({
    queryKey: ['learning-paths', domainId],
    queryFn: () =>
      learningApi.getPaths(domainId ? { domainId } : undefined).then(res => res.data as LearningPath[]),
  })

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-primary-500 to-secondary-500 shadow-pop">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/learn" className="text-white/90 hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Curriculum
            </Link>
            <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
              <Map className="w-6 h-6" strokeWidth={2} />
              Learning Paths
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Domain</label>
          <select className="input" value={domainId} onChange={e => setDomainId(e.target.value)}>
            <option value="">All Domains</option>
            {Array.isArray(domains) &&
              domains.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : paths && paths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map(path => (
              <Link
                key={path.id}
                to={`/learn/paths/${path.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{path.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{path.description}</p>
                <div className="flex flex-wrap gap-2">
                  {path.domain && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800">
                      {path.domain.name}
                    </span>
                  )}
                  {path.ageBand && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {path.ageBand}
                    </span>
                  )}
                  {path.nodes && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-secondary-100 text-secondary-800">
                      {path.nodes.length}+ steps
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No learning paths found</p>
          </div>
        )}
      </main>
    </div>
  )
}
