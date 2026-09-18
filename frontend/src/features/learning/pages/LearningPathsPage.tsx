import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Map, Route, ArrowRight } from 'lucide-react'
import { curriculumApi, learningApi } from '@/lib/api/endpoints'
import { ErrorState, EmptyState, LoadingState } from '@/components/common/CharacterState'
import { Badge } from '@/components/ui/Badge'

// Rotating gradients so each journey banner reads as its own "world",
// anchored to real brand/world token hues.
const PATH_GRADIENTS = [
  'from-primary-400 to-primary-600',
  'from-sky-400 to-sky-600',
  'from-grape-400 to-grape-600',
  'from-accent-400 to-accent-600',
  'from-success-400 to-success-600',
  'from-bubble-400 to-bubble-600',
]

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

  const { data: paths, isLoading, isError, refetch } = useQuery({
    queryKey: ['learning-paths', domainId],
    queryFn: () =>
      learningApi.getPaths(domainId ? { domainId } : undefined).then(res => res.data as LearningPath[]),
  })

  return (
    <div className="min-h-screen">
      <header className="bg-brand-hero relative overflow-hidden shadow-lift">
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="icon-chip bg-white/15 text-white"><Map className="w-6 h-6" strokeWidth={2} /></div>
            <div>
              <h1 className="text-2xl font-display font-extrabold text-white">Learning Paths</h1>
              <p className="text-white/80 text-sm mt-0.5">Follow a guided path from first steps to mastery.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card mb-8 flex flex-wrap items-center gap-3">
          <label htmlFor="path-domain" className="text-sm font-semibold text-slate-700">Filter by domain</label>
          <select id="path-domain" className="input max-w-xs" value={domainId} onChange={e => setDomainId(e.target.value)}>
            <option value="">All domains</option>
            {Array.isArray(domains) &&
              domains.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
          </select>
        </div>

        {isError ? (
          <ErrorState
            character="Azouz"
            title="Couldn't load learning paths"
            message="No worries — this happens sometimes. Let's give it another try."
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <LoadingState character="Atlas" message="Atlas is mapping out your learning paths..." />
        ) : paths && paths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map((path, i) => {
              const grad = PATH_GRADIENTS[i % PATH_GRADIENTS.length]
              const stepCount = path.nodes?.length ?? 0
              return (
                <Link
                  key={path.id}
                  to={`/learn/paths/${path.id}`}
                  className="card-playful group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                >
                  {/* Gradient journey banner */}
                  <div className={`relative -m-6 mb-4 h-24 rounded-t-blob bg-gradient-to-br ${grad} overflow-hidden flex items-center justify-between px-6`}>
                    <div aria-hidden className="dots-layer opacity-20" />
                    <Route className="w-8 h-8 text-white relative" strokeWidth={2} />
                    {stepCount > 0 && (
                      <span className="relative chip-glass text-xs !py-1 !px-3">{stepCount} steps</span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-lg text-ink mb-1 group-hover:text-primary-700 transition-colors">{path.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{path.description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {path.domain && <Badge tone="primary">{path.domain.name}</Badge>}
                    {path.ageBand && <Badge tone="neutral">{String(path.ageBand).replace('AGE_', 'Ages ').replace('_', '–')}</Badge>}
                    <span className="ms-auto inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
                      Start <ArrowRight className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2.5} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <EmptyState
            character="Atlas"
            title="No learning paths yet"
            message="New guided journeys are on the way. In the meantime, explore the curriculum and start a mission."
            actionLabel="Browse curriculum"
            actionTo="/learn"
          />
        )}
      </main>
    </div>
  )
}
