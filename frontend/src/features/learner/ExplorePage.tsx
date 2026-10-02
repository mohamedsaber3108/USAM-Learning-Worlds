import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Bot,
  Rocket,
  Wallet,
  ShieldCheck,
  Briefcase,
  MessageCircle,
  Code2,
  Puzzle,
  Cpu,
  Brain,
  Image as ImageIcon,
  type LucideIcon,
} from 'lucide-react'
import { crossCurricularApi, thinkingApi, visualLanguageApi, codingCoachApi, type ConceptCatalogItem, type VisualLanguageCard } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, Tabs, Button, Select } from '@/components/ui'

/**
 * Explore — a single real browser for the 10 cross-curricular/thinking-skills
 * concept catalogs that previously had ZERO frontend representation despite
 * being fully seeded on the backend (ai-literacy, entrepreneurship,
 * financial-literacy, digital-literacy, career-exploration,
 * communication-skills, coding-concepts, problem-solving,
 * computational-thinking, critical-thinking, plus visual-language cards).
 *
 * NEW (2026-10-02, ledger 88 task 9). All these catalogs share the identical
 * backend shape (name/slug/description/category/ageAppropriate), so one
 * reusable grid handles all of them instead of 10 near-duplicate pages.
 */
type CatalogKey =
  | 'ai-literacy'
  | 'entrepreneurship'
  | 'financial-literacy'
  | 'digital-literacy'
  | 'career-exploration'
  | 'communication-skills'
  | 'coding-concepts'
  | 'problem-solving'
  | 'computational-thinking'
  | 'critical-thinking'
  | 'visual-language'

const CATALOGS: Array<{ key: CatalogKey; icon: LucideIcon; labelKey: string }> = [
  { key: 'ai-literacy', icon: Bot, labelKey: 'learner.exploreCatAiLiteracy' },
  { key: 'entrepreneurship', icon: Rocket, labelKey: 'learner.exploreCatEntrepreneurship' },
  { key: 'financial-literacy', icon: Wallet, labelKey: 'learner.exploreCatFinancialLiteracy' },
  { key: 'digital-literacy', icon: ShieldCheck, labelKey: 'learner.exploreCatDigitalLiteracy' },
  { key: 'career-exploration', icon: Briefcase, labelKey: 'learner.exploreCatCareerExploration' },
  { key: 'communication-skills', icon: MessageCircle, labelKey: 'learner.exploreCatCommunicationSkills' },
  { key: 'coding-concepts', icon: Code2, labelKey: 'learner.exploreCatCodingConcepts' },
  { key: 'problem-solving', icon: Puzzle, labelKey: 'learner.exploreCatProblemSolving' },
  { key: 'computational-thinking', icon: Cpu, labelKey: 'learner.exploreCatComputationalThinking' },
  { key: 'critical-thinking', icon: Brain, labelKey: 'learner.exploreCatCriticalThinking' },
  { key: 'visual-language', icon: ImageIcon, labelKey: 'learner.exploreCatVisualLanguage' },
]

async function fetchCatalog(key: CatalogKey): Promise<ConceptCatalogItem[]> {
  switch (key) {
    case 'problem-solving':
      return (await thinkingApi.problemSolving()).data
    case 'computational-thinking':
      return (await thinkingApi.computational()).data
    case 'critical-thinking':
      return (await thinkingApi.critical()).data
    default:
      return (await crossCurricularApi.byCategory(key)).data
  }
}

export function ExplorePage() {
  const { t } = useTranslation()
  const [active, setActive] = useState<CatalogKey>('ai-literacy')

  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.explore')} subtitle={t('learner.exploreSubtitle')} />
      <Tabs
        tabs={CATALOGS.map((c) => ({ key: c.key, label: t(c.labelKey) }))}
        active={active}
        onChange={setActive}
      />
      {active === 'visual-language' ? <VisualLanguageGrid /> : <ConceptGrid catalog={active} />}
    </div>
  )
}

function ConceptGrid({ catalog }: { catalog: CatalogKey }) {
  const Icon = CATALOGS.find((c) => c.key === catalog)?.icon ?? Bot
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['explore', catalog],
    queryFn: () => fetchCatalog(catalog),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!data || data.length === 0) return <EmptyState />

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => (
        <Card key={item.id}>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="mt-3 font-display font-bold text-ink-900">{item.name}</h3>
          {item.description && <p className="mt-1 text-sm text-ink-500">{item.description}</p>}
          {catalog === 'coding-concepts' && <CodingChallengeAction conceptId={item.id} />}
        </Card>
      ))}
    </div>
  )
}

/**
 * "Generate a challenge" — real POST /coding-coach/challenge
 * (coding-coach.controller.ts), had ZERO frontend callers before this
 * pass. Needs a real `CodingConcept.id` to work (the backend 404s
 * otherwise), so it's attached here rather than CodingActivityPanel,
 * which only ever knows a mission's activityId, not a concept id.
 */
function CodingChallengeAction({ conceptId }: { conceptId: string }) {
  const { t } = useTranslation()
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [loading, setLoading] = useState(false)
  const [challenge, setChallenge] = useState<string | null>(null)

  async function generate() {
    setLoading(true)
    setChallenge(null)
    try {
      const res = await codingCoachApi.challenge({ conceptId, difficulty })
      setChallenge(res.data.challenge)
    } catch {
      setChallenge(t('states.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3 space-y-2 border-t border-line pt-3">
      <Select
        label={t('learner.codingChallengeDifficulty')}
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
        options={[
          { value: 'easy', label: t('learner.codingChallengeEasy') },
          { value: 'medium', label: t('learner.codingChallengeMedium') },
          { value: 'hard', label: t('learner.codingChallengeHard') },
        ]}
      />
      <Button size="sm" variant="secondary" onClick={() => void generate()} loading={loading}>
        {t('learner.codingChallengeGenerate')}
      </Button>
      {challenge && <p className="whitespace-pre-wrap text-sm text-ink-700">{challenge}</p>}
    </div>
  )
}

function VisualLanguageGrid() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['explore', 'visual-language'],
    queryFn: async () => (await visualLanguageApi.list()).data,
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!data || data.length === 0) return <EmptyState />

  return (
    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {data.map((card: VisualLanguageCard) => (
        <Card key={card.id} className="text-center">
          <img src={card.imageUrl} alt={card.word} className="mx-auto h-20 w-20 rounded-control object-cover" />
          <h3 className="mt-3 font-display font-bold text-ink-900">{card.word}</h3>
          <p className="mt-1 text-xs text-ink-500">{card.caption}</p>
        </Card>
      ))}
    </div>
  )
}
