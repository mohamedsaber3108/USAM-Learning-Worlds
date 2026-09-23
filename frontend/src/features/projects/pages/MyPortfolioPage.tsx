import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FolderKanban, Star, Award, Sparkles, TrendingUp } from 'lucide-react'
import { projectsApi, masteryApi, credentialsApi } from '@/lib/api/endpoints'
import { CredentialsSection } from '@/features/gamification/components/CredentialsSection'
import { EmptyState, LoadingState } from '@/components/common/CharacterState'

/**
 * My Portfolio — the learner's evidence of growth in one place, and the main
 * parent-value surface (North Star: "visible evidence of growth parents can
 * trust"). It aggregates three real sources, all from existing engines:
 *
 *  1. Mastery      (GET /mastery/by-domain)  → competencies mastered
 *  2. Credentials  (GET /credentials/me)     → verifiable Open Badges
 *  3. Projects     (GET /projects/my)        → showcased work
 *
 * No fake data — each section self-hides / shows a real empty state when the
 * learner has nothing yet. Fully internationalized (EN + AR).
 */
export function MyPortfolioPage() {
  const { t } = useTranslation()

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectsApi.getMy().then((res) => res.data),
  })

  const { data: byDomain } = useQuery({
    queryKey: ['mastery-by-domain'],
    queryFn: () => masteryApi.getByDomain().then((res) => res.data),
  })

  const { data: credentials } = useQuery({
    queryKey: ['credentials-mine'],
    queryFn: () => credentialsApi.getMine().then((res) => res.data),
    retry: 1,
  })

  const showcased = Array.isArray(projects)
    ? projects.filter((p: any) => p.isShowcased === true || p.state === 'SHOWCASED')
    : []

  const masteredTotal = Array.isArray(byDomain)
    ? byDomain.reduce((sum: number, r: any) => sum + (r.masteredCount || 0), 0)
    : 0
  const credentialCount = Array.isArray(credentials) ? credentials.length : 0

  const stats = [
    { key: 'mastered', value: masteredTotal, icon: TrendingUp, tint: 'bg-success-50 text-success-600' },
    { key: 'credentials', value: credentialCount, icon: Award, tint: 'bg-secondary-50 text-secondary-600' },
    { key: 'showcased', value: showcased.length, icon: Star, tint: 'bg-primary-50 text-primary-600' },
  ]

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-brand-hero relative overflow-hidden shadow-lift">
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div aria-hidden className="absolute -top-10 -end-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="icon-chip bg-white/15 text-white"><FolderKanban className="w-6 h-6" strokeWidth={2} /></div>
            <div>
              <h1 className="text-2xl font-display font-extrabold text-white">{t('portfolio.title')}</h1>
              <p className="text-white/80 text-sm mt-0.5">{t('portfolio.subtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Evidence summary — the growth story at a glance. */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.key} className="card flex items-center gap-4">
                <div className={`icon-chip ${s.tint} w-12 h-12 shrink-0`}>
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-3xl font-display font-extrabold text-slate-900 leading-none">{s.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{t(`portfolio.stats.${s.key}`)}</p>
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Verifiable credentials (self-hides when none earned). */}
        <CredentialsSection />

        {/* Showcased projects */}
        <section aria-labelledby="portfolio-projects-heading">
          <h2
            id="portfolio-projects-heading"
            className="text-lg font-display font-bold text-slate-900 mb-4 inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-primary-500" strokeWidth={2} />
            {t('portfolio.projectsTitle')}
          </h2>

          {projectsLoading ? (
            <LoadingState character="Mira" message={t('portfolio.loading')} />
          ) : showcased.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {showcased.map((project: any) => (
                <div key={project.id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-semibold text-lg text-slate-900">{project.title}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-50 text-secondary-700 rounded-control text-xs font-medium flex-shrink-0">
                      <Star className="w-3.5 h-3.5" strokeWidth={2} fill="currentColor" />
                      {t('portfolio.showcasedBadge')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3">{project.description}</p>
                  <span className="text-xs text-slate-500">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              character="Mira"
              title={t('portfolio.emptyTitle')}
              message={t('portfolio.emptyMessage')}
              actionLabel={t('portfolio.emptyAction')}
              actionTo="/projects"
            />
          )}
        </section>
      </main>
    </div>
  )
}
