import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Layers,
  Puzzle,
  Loader2,
  Lock,
  Unlock,
  Bot,
  Lightbulb,
  DollarSign,
  Shield,
  Compass,
  MessageCircle,
  Puzzle as PuzzleIcon,
  Brain,
  Search,
  Code,
} from 'lucide-react'
import { curriculumApi, learningApi, masteryApi, worldsApi, type WorldRecord } from '@/lib/api/endpoints'
import { WorldPathMap, type WorldPathDomain } from '@/features/learning/components/WorldPathMap'

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

interface DomainMasteryAggregate {
  domain: string
  totalCompetencies: number
  masteredCount: number
  proficientCount: number
  avgConfidence: number
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

  // Real per-domain engagement signal: MasteryRecord rows joined up to their
  // Domain, aggregated server-side by mastery.service.getMasteryByDomain().
  // This is the same underlying signal (MasteryRecord -> competency -> skill
  // -> domain) that character.service.ts's getDomainEngagementSet() uses as
  // its Signal 1 for "has the learner engaged with domain X" - reused here
  // rather than inventing a separate definition.
  const { data: masteryByDomain } = useQuery({
    queryKey: ['mastery-by-domain'],
    queryFn: () => masteryApi.getByDomain().then(res => res.data as DomainMasteryAggregate[]),
  })

  // Real per-domain curriculum size (conceptCount), fetched once per domain
  // in parallel so the world path can show real "mastered/total" progress
  // rather than a placeholder.
  const { data: conceptCountsByDomainId } = useQuery({
    queryKey: ['concept-counts-by-domain', domains?.map(d => d.id).join(',')],
    queryFn: async () => {
      if (!domains) return {} as Record<string, number>
      const entries = await Promise.all(
        domains.map(async d => {
          try {
            const res = await learningApi.getConceptsForDomain(d.id)
            const list = res.data as Concept[]
            return [d.id, Array.isArray(list) ? list.length : 0] as const
          } catch {
            return [d.id, 0] as const
          }
        })
      )
      return Object.fromEntries(entries)
    },
    enabled: !!domains && domains.length > 0,
  })

  const masteredCompetencyIds = useMemo(() => {
    if (!Array.isArray(mastery)) return new Set<string>()
    return new Set(
      mastery
        .filter((m: MasteryRecord) => ['PROFICIENT', 'MASTERED'].includes(m.state))
        .map((m: MasteryRecord) => m.competencyId)
    )
  }, [mastery])

  // Real World Engine data: 7 seeded worlds (Numeria, Verdantia, Circuit
  // City, Prisma Isles, Wordhaven, Gearhollow, The Riddle Reach), each tied
  // to one Domain, with server-computed per-learner unlock status (mastery
  // + mission-completion signal from worlds.service.ts). Previously this
  // page derived a client-side "world path" purely from raw domains with
  // no real unlock logic at all — the actual World model/engine was never
  // wired to any frontend surface (Tick 26 dead-frontend-bug finding #9).
  const { data: worlds, isLoading: worldsLoading } = useQuery({
    queryKey: ['worlds-for-learner'],
    queryFn: () => worldsApi.list().then(res => res.data as WorldRecord[]),
  })

  // Build the world-path list straight from real World rows: real name,
  // real server-computed unlock signal, real per-domain concept/mastered
  // counts (still sourced from the domain aggregates already fetched).
  const worldPathDomains: WorldPathDomain[] = useMemo(() => {
    if (!worlds) return []
    const masteryByDomainName = new Map(
      (masteryByDomain ?? []).map(d => [d.domain, d])
    )
    return worlds
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((world) => {
        const engagement = masteryByDomainName.get(world.domain.name)
        return {
          id: world.domain.id,
          name: world.name,
          isUnlocked: world.isUnlocked,
          conceptCount: conceptCountsByDomainId?.[world.domain.id] ?? 0,
          masteredCount: engagement?.masteredCount ?? 0,
        }
      })
  }, [worlds, masteryByDomain, conceptCountsByDomainId])

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
              <Link to="/dashboard" className="text-white/90 hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                Back
              </Link>
              <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6" strokeWidth={2} />
                Curriculum
              </h1>
            </div>
            <Link
              to="/learn/paths"
              className="btn bg-white/90 text-primary-700 hover:bg-white shadow-none"
            >
              Learning Paths <ArrowRight className="w-4 h-4 inline" strokeWidth={2} />
            </Link>
            <Link
              to="/learn/flashcards"
              className="btn bg-white/90 text-primary-700 hover:bg-white shadow-none flex items-center gap-1"
            >
              <Layers className="w-4 h-4" strokeWidth={2} />
              Flashcards <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="card mb-2">
          <h2 className="text-lg font-heading font-semibold mb-3">Thinking Skills</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/thinking/problem-solving" className="btn bg-orange-600 text-white hover:bg-orange-700 shadow-none flex items-center gap-1.5">
              <PuzzleIcon className="w-4 h-4" strokeWidth={2} />
              Problem Solving
            </Link>
            <Link to="/thinking/computational-thinking" className="btn bg-blue-600 text-white hover:bg-blue-700 shadow-none flex items-center gap-1.5">
              <Brain className="w-4 h-4" strokeWidth={2} />
              Computational Thinking
            </Link>
            <Link to="/thinking/critical-thinking" className="btn bg-teal-600 text-white hover:bg-teal-700 shadow-none flex items-center gap-1.5">
              <Search className="w-4 h-4" strokeWidth={2} />
              Critical Thinking
            </Link>
          </div>
        </div>
      </div>

      {/* Cross-Curricular quick links — real seeded AILiteracyConcept /
          EntrepreneurshipConcept / FinancialLiteracyConcept content,
          surfaced from the main curriculum browse page. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="card mb-2">
          <h2 className="text-lg font-heading font-semibold mb-3">Cross-Curricular</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/cross-curricular/ai-literacy" className="btn bg-violet-600 text-white hover:bg-violet-700 shadow-none flex items-center gap-1.5">
              <Bot className="w-4 h-4" strokeWidth={2} />
              AI Literacy
            </Link>
            <Link to="/cross-curricular/entrepreneurship" className="btn bg-amber-600 text-white hover:bg-amber-700 shadow-none flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" strokeWidth={2} />
              Entrepreneurship
            </Link>
            <Link to="/cross-curricular/financial-literacy" className="btn bg-emerald-600 text-white hover:bg-emerald-700 shadow-none flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" strokeWidth={2} />
              Financial Literacy
            </Link>
            <Link to="/cross-curricular/digital-literacy" className="btn bg-sky-600 text-white hover:bg-sky-700 shadow-none flex items-center gap-1.5">
              <Shield className="w-4 h-4" strokeWidth={2} />
              Digital Literacy
            </Link>
            <Link to="/cross-curricular/career-exploration" className="btn bg-rose-600 text-white hover:bg-rose-700 shadow-none flex items-center gap-1.5">
              <Compass className="w-4 h-4" strokeWidth={2} />
              Career Exploration
            </Link>
            <Link to="/cross-curricular/communication-skills" className="btn bg-fuchsia-600 text-white hover:bg-fuchsia-700 shadow-none flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" strokeWidth={2} />
              Communication Skills
            </Link>
            <Link to="/cross-curricular/coding-concepts" className="btn bg-slate-700 text-white hover:bg-slate-800 shadow-none flex items-center gap-1.5">
              <Code className="w-4 h-4" strokeWidth={2} />
              Coding Concepts
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* World path domain navigation - replaces the flat icon-tile grid */}
        <div className="card mb-6">
          <h2 className="text-lg font-heading font-semibold mb-4">Your Learning Path</h2>
          {domainsLoading || worldsLoading ? (
            <p className="text-gray-600">Loading domains...</p>
          ) : (
            <WorldPathMap
              domains={worldPathDomains}
              selectedDomainId={selectedDomainId}
              onSelectDomain={setSelectedDomainId}
            />
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
                <h3 className="text-lg font-heading font-semibold mb-4 text-gray-900 flex items-center gap-2">
                  <Puzzle className="w-5 h-5" strokeWidth={2} />
                  {group.competencyName}
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
      className={`card hover:shadow-soft-hover transition-shadow relative ${
        !unlocked ? 'opacity-70' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 line-clamp-2">{concept.name}</h4>
        <span className="text-xl ml-2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" strokeWidth={2} />
          ) : unlocked ? (
            <Unlock className="w-5 h-5 text-success-600" strokeWidth={2} />
          ) : (
            <Lock className="w-5 h-5 text-gray-400" strokeWidth={2} />
          )}
        </span>
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
