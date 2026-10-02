import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Languages, Code2, Bot, Sparkles, Brain, BookOpen, ArrowRight, Compass, type LucideIcon } from 'lucide-react'
import { worldsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui'

interface World {
  id: string
  name: string
  description?: string
  domain?: { slug: string; name: string }
  isUnlocked?: boolean
}

// Per-domain icon (slug-keyed); default for anything else.
const DOMAIN_ICON: Record<string, LucideIcon> = {
  english: Languages,
  coding: Code2,
  'ai-literacy': Bot,
  creativity: Sparkles,
  'critical-thinking': Brain,
}

/** Learn hub — the learning worlds, each a themed entry to its domain path. */
export function LearnPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['worlds'],
    queryFn: async () => (await worldsApi.list()).data as World[],
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!data || data.length === 0) return <EmptyState />

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('learner.chooseWorld')}
        action={
          <Link to="/app/explore" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
            <Compass className="h-4 w-4" aria-hidden />
            {t('learner.explore')}
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((world) => {
          const slug = world.domain?.slug
          const Icon = (slug && DOMAIN_ICON[slug]) || BookOpen
          const card = (
            <Card className="group flex h-full flex-col transition-transform duration-fast hover:-translate-y-0.5 hover:shadow-card">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-ink-900">{world.domain?.name ?? world.name}</h2>
              {world.description && <p className="mt-1 text-sm text-ink-500">{world.description}</p>}
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                {world.isUnlocked === false ? t('learner.worldLocked') : t('learner.startMission')}{' '}
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
              </span>
            </Card>
          )
          // World Detail (real sequential per-world mission order with
          // lock status) is the entry point now; DomainPathPage remains
          // reachable from inside it for the broader skill tree view.
          return (
            <Link key={world.id} to={`/app/worlds/${world.id}`}>
              {card}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
