import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FolderKanban,
  Sparkles,
  Users,
  BookOpen,
  Boxes,
  Bot,
  MessageCircle,
  Mic,
  Award,
  Trophy,
  Compass,
  type LucideIcon,
} from 'lucide-react'
import { Card, PageHeader, SectionHeader } from '@/components/ui'

interface MoreLink {
  to: string
  icon: LucideIcon
  titleKey: string
  descKey: string
}

/**
 * More hub — the real second-level nav surface.
 *
 * FIX (2026-10-02, owner report "where are all the remaining pages!!!"):
 * ~12 real, built, backend-connected learner pages had zero navigation
 * entry anywhere (reachable only by typing the exact URL): Portfolio,
 * Creativity, Community, Stories, Simulations, Companions, English Coach,
 * Voice, Credentials, Leaderboard, My Journey, Explore. This page is the
 * single, honest index of all of them, grouped by what they're for. It is
 * NOT a dead end — every tile below links to a real, live, data-connected
 * page (confirmed by reading each page's component before linking it here).
 */
const CREATE_LINKS: MoreLink[] = [
  { to: '/app/portfolio', icon: FolderKanban, titleKey: 'learner.morePortfolio', descKey: 'learner.morePortfolioDesc' },
  { to: '/app/create', icon: Sparkles, titleKey: 'learner.moreCreativity', descKey: 'learner.moreCreativityDesc' },
  { to: '/app/community', icon: Users, titleKey: 'learner.moreCommunity', descKey: 'learner.moreCommunityDesc' },
]

const LEARN_LINKS: MoreLink[] = [
  { to: '/app/explore', icon: Compass, titleKey: 'learner.explore', descKey: 'learner.exploreSubtitle' },
  { to: '/app/stories', icon: BookOpen, titleKey: 'learner.moreStories', descKey: 'learner.moreStoriesDesc' },
  { to: '/app/simulations', icon: Boxes, titleKey: 'learner.moreSimulations', descKey: 'learner.moreSimulationsDesc' },
  { to: '/app/companions', icon: Bot, titleKey: 'learner.moreCompanions', descKey: 'learner.moreCompanionsDesc' },
  { to: '/app/english-coach', icon: MessageCircle, titleKey: 'learner.moreEnglishCoach', descKey: 'learner.moreEnglishCoachDesc' },
  { to: '/app/voice', icon: Mic, titleKey: 'learner.moreVoice', descKey: 'learner.moreVoiceDesc' },
]

const YOU_LINKS: MoreLink[] = [
  { to: '/app/credentials', icon: Award, titleKey: 'learner.moreCredentials', descKey: 'learner.moreCredentialsDesc' },
  { to: '/app/leaderboard', icon: Trophy, titleKey: 'learner.moreLeaderboard', descKey: 'learner.moreLeaderboardDesc' },
  { to: '/app/insights', icon: Compass, titleKey: 'learner.moreInsights', descKey: 'learner.moreInsightsDesc' },
]

function LinkGrid({ links }: { links: MoreLink[] }) {
  const { t } = useTranslation()
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => {
        const Icon = link.icon
        return (
          <Link key={link.to} to={link.to}>
            <Card className="flex h-full items-start gap-3 transition-transform duration-fast hover:-translate-y-0.5 hover:shadow-card">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-display font-bold text-ink-900">{t(link.titleKey)}</span>
                <span className="mt-0.5 block text-sm text-ink-500">{t(link.descKey)}</span>
              </span>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

export function MorePage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-8">
      <PageHeader title={t('learner.moreTitle')} subtitle={t('learner.moreSubtitle')} />
      <section>
        <SectionHeader title={t('learner.moreSectionCreate')} />
        <LinkGrid links={CREATE_LINKS} />
      </section>
      <section>
        <SectionHeader title={t('learner.moreSectionLearn')} />
        <LinkGrid links={LEARN_LINKS} />
      </section>
      <section>
        <SectionHeader title={t('learner.moreSectionYou')} />
        <LinkGrid links={YOU_LINKS} />
      </section>
    </div>
  )
}
