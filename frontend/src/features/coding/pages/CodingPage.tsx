import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Code2, Blocks, Terminal, Puzzle, ArrowRight, Target } from 'lucide-react'
import { crossCurricularApi, type CrossCurricularConcept } from '@/lib/api/endpoints'
import { CharacterFace } from '@/features/characters/components/CharacterFace'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/CharacterState'

/**
 * Coding landing (Phase E2) — the missing browse/entry surface for the coding
 * domain (Bible §10). Previously coding was only reachable INSIDE a mission
 * player; a child had no "what coding can I do?" page. This presents the real
 * coding-concept progression (GET /cross-curricular/coding-concepts →
 * CodingConcept rows, ordered by difficulty 1–5) as a journey from
 * computational thinking → blocks → Python/JS, with Codey as the guide and a
 * clear entry into coding missions. Real data; no new engine.
 */

// Difficulty band → visual + label key. CodingConcept.difficulty is 1–5.
function bandFor(difficulty: number | undefined) {
  const d = difficulty ?? 1
  if (d <= 2) return { key: 'foundations', icon: Puzzle, tint: 'bg-success-50 text-success-600' }
  if (d <= 3) return { key: 'blocks', icon: Blocks, tint: 'bg-primary-50 text-primary-600' }
  return { key: 'code', icon: Terminal, tint: 'bg-grape-50 text-grape-600' }
}

export function CodingPage() {
  const { t } = useTranslation()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['coding-concepts'],
    queryFn: () => crossCurricularApi.list('coding-concepts').then((r) => r.data),
  })

  const concepts: CrossCurricularConcept[] = Array.isArray(data)
    ? [...data].sort((a, b) => (a.difficulty ?? a.order) - (b.difficulty ?? b.order))
    : []

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-gradient-to-br from-success-400 to-success-600 relative overflow-hidden shadow-lift">
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div aria-hidden className="absolute -top-10 -end-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/15 p-1.5 shrink-0 hidden sm:block animate-bob" aria-hidden>
              <CharacterFace characterId="Codey" size={72} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="icon-chip bg-white/20 text-white w-10 h-10"><Code2 className="w-5 h-5" strokeWidth={2} /></span>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">{t('coding.title')}</h1>
              </div>
              <p className="text-white/85 text-sm">{t('coding.subtitle')}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/learning/domains/coding/path" className="chip-glass hover:bg-white/25 transition-colors">
                <Target className="w-4 h-4" strokeWidth={2} /> {t('coding.myPath', 'My coding path')}
              </Link>
              <Link to="/missions" className="chip-glass hover:bg-white/25 transition-colors">
                <Target className="w-4 h-4" strokeWidth={2} /> {t('coding.missions')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isError ? (
          <ErrorState character="Codey" title={t('coding.errorTitle')} message={t('coding.errorMessage')} onRetry={() => refetch()} />
        ) : isLoading ? (
          <LoadingState character="Codey" message={t('coding.loading')} />
        ) : concepts.length > 0 ? (
          <>
            <p className="text-slate-600 mb-6">{t('coding.intro')}</p>
            <ol className="space-y-3">
              {concepts.map((c, i) => {
                const band = bandFor(c.difficulty)
                const Icon = band.icon
                return (
                  <motion.li
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <div className="card flex items-center gap-4">
                      <div className={`icon-chip ${band.tint} w-11 h-11 shrink-0`}>
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-semibold text-slate-900">{c.name}</h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-100 text-slate-500">
                            {t(`coding.band.${band.key}`)}
                          </span>
                        </div>
                        {c.description && <p className="text-sm text-slate-600 line-clamp-2 mt-0.5">{c.description}</p>}
                      </div>
                    </div>
                  </motion.li>
                )
              })}
            </ol>

            {/* Entry into hands-on coding — the sandbox lives inside missions. */}
            <Link
              to="/missions"
              className="mt-8 flex items-center gap-4 rounded-card bg-primary-600 text-white p-4 group focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300 hover:bg-primary-700 transition-colors"
            >
              <div className="icon-chip bg-white/20 text-white w-12 h-12 shrink-0"><Terminal className="w-5 h-5" strokeWidth={2} /></div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{t('coding.tryKicker')}</p>
                <p className="font-display font-bold text-lg">{t('coding.tryTitle')}</p>
              </div>
              <ArrowRight className="w-6 h-6 rtl:scale-x-[-1]" strokeWidth={2.5} />
            </Link>
          </>
        ) : (
          <EmptyState
            character="Codey"
            title={t('coding.emptyTitle')}
            message={t('coding.emptyMessage')}
            actionLabel={t('coding.missions')}
            actionTo="/missions"
          />
        )}
      </main>
    </div>
  )
}
