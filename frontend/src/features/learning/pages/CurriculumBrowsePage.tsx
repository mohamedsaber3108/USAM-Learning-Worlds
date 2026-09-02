import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { curriculumApi, learningApi, masteryApi } from '@/lib/api/endpoints'

interface Domain {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
}

interface Concept {
  id: string
  competencyId: string
  name: string
  slug: string
  description?: string
  order: number
  competency?: { id: string; name: string; skillId: string }
}

interface MasteryRecord {
  competencyId: string
  state: string
}

export function CurriculumBrowsePage() {
  const [selectedDomainId, setSelectedDomainId] = useState<string>('')

  const { data: domains, isLoading: domainsLoading } = useQuery({
    queryKey: ['curriculum-domains'],
    queryFn: () => curriculumApi.getDomains().then(res => res.data as Domain[]),
  })

  const { data: concepts, isLoading: conceptsLoading } = useQuery({
    queryKey: ['learning-concepts-for-domain', selectedDomainId],
    queryFn: () =>
      learningApi.getConceptsForDomain(selectedDomainId).then(res => res.data as Concept[]),
    enabled: !!selectedDomainId,
  })

  const { data: mastery } = useQuery({
    queryKey: ['mastery-overview'],
    queryFn: () => masteryApi.getOverview().then(res => res.data as MasteryRecord[]),
  })

  const masteredCompetencyIds = useMemo(() => {
    if (!Array.isArray(mastery)) return new Set<string>()
    return new Set(
      mastery
        .filter((m: MasteryRecord) => ['PROFICIENT', 'MASTERED'].includes(m.state))
        .map((m: MasteryRecord) => m.competencyId)
    )
  }, [mastery])

  // Group concepts -> competencies (domains -> competencies -> concepts)
  const competencyGroups = useMemo(() => {
    if (!concepts) return []
    const groups = new Map<string, { competencyId: string; competencyName: string; concepts: Concept[] }>()
    for (const c of concepts) {
      const key = c.competencyId
      if (!groups.has(key)) {
        groups.set(key, {
          competencyId: key,
          competencyName: c.competency?.name || 'Competency',
          concepts: [],
        })
      }
      groups.get(key)!.concepts.push(c)
    }
    return Array.from(groups.values()).map(g => ({
      ...g,
      concepts: g.concepts.sort((a, b) => a.order - b.order),
    }))
  }, [concepts])

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
              <h1 className="text-2xl font-heading font-bold text-white">📚 Curriculum</h1>
            </div>
            <Link
              to="/learn/paths"
              className="btn bg-white/90 text-primary-700 hover:bg-white shadow-none"
            >
              Learning Paths →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Domain selector */}
        <div className="card mb-6">
          <h2 className="text-lg font-heading font-semibold mb-4">Choose a Domain</h2>
          {domainsLoading ? (
            <p className="text-gray-600">Loading domains...</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {domains?.map(domain => (
                <button
                  key={domain.id}
                  onClick={() => setSelectedDomainId(domain.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all border ${
                    selectedDomainId === domain.id
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400'
                  }`}
                >
                  {domain.icon ? `${domain.icon} ` : ''}
                  {domain.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Domain -> Competency -> Concept hierarchy */}
        {!selectedDomainId ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Pick a domain above to browse its concepts</p>
          </div>
        ) : conceptsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading concepts...</p>
          </div>
        ) : competencyGroups.length > 0 ? (
          <div className="space-y-6">
            {competencyGroups.map(group => (
              <div key={group.competencyId} className="card">
                <h3 className="text-lg font-heading font-semibold mb-4 text-gray-900">
                  🧩 {group.competencyName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.concepts.map(concept => {
                    const competencyMastered = masteredCompetencyIds.has(concept.competencyId)
                    return (
                      <ConceptCard
                        key={concept.id}
                        concept={concept}
                        assumedUnlocked={competencyMastered || group.concepts[0]?.id === concept.id}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No concepts found for this domain</p>
          </div>
        )}
      </main>
    </div>
  )
}

function ConceptCard({ concept }: { concept: Concept; assumedUnlocked: boolean }) {
  const { data: unlockStatus, isLoading } = useQuery({
    queryKey: ['concept-unlock-status', concept.id],
    queryFn: () => learningApi.getUnlockStatus(concept.id).then(res => res.data),
  })

  const unlocked = unlockStatus?.unlocked ?? true
  const progress = unlockStatus?.progress

  return (
    <Link
      to={`/learn/concepts/${concept.id}`}
      className={`card hover:shadow-lg transition-shadow relative ${
        !unlocked ? 'opacity-70' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 line-clamp-2">{concept.name}</h4>
        <span className="text-xl ml-2">{isLoading ? '⏳' : unlocked ? '🔓' : '🔒'}</span>
      </div>
      {concept.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{concept.description}</p>
      )}
      {progress && progress.required > 0 && (
        <div className="text-xs text-gray-500">
          Prerequisites: {progress.completed}/{progress.required} complete
        </div>
      )}
      <span
        className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
          unlocked ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-600'
        }`}
      >
        {unlocked ? 'Unlocked' : 'Locked'}
      </span>
    </Link>
  )
}
