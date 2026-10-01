import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  MessageCircle, BookOpen, PencilLine, Mic, Ear, BookMarked,
  PenLine, MessagesSquare, Drama, Keyboard,
} from 'lucide-react'
import { englishApi, type EnglishStrand, type EnglishStrandFamily } from '@/lib/api/endpoints'
import { CharacterFace } from '@/features/characters/components/CharacterFace'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/CharacterState'
import { DomainLearningPath } from '@/features/learning/components/DomainLearningPath'

/**
 * English Strands (Phase E rework) — surfaces the real English engine
 * (GET /english/strands, grouped by the server-side `strandType` enum: the
 * nine Bible §9 sub-engines). Reworked to the rebuild standard: i18n (EN+AR),
 * CharacterState loading/empty/error, design-system tokens (no ad-hoc colors),
 * lucide icons (no emoji), RTL-safe. Real data preserved; no new engine.
 */

// The 9 real strand families (EnglishStrand.strandType enum). i18n label key:
// english.family.<lowercased>. Lucide icon replaces the old emoji set.
const STRAND_FAMILIES: { value: EnglishStrandFamily; icon: typeof BookOpen; tint: string }[] = [
  { value: 'VOCABULARY', icon: BookOpen, tint: 'bg-primary-50 text-primary-600' },
  { value: 'GRAMMAR', icon: PencilLine, tint: 'bg-accent-50 text-accent-600' },
  { value: 'PRONUNCIATION', icon: Mic, tint: 'bg-grape-50 text-grape-600' },
  { value: 'LISTENING', icon: Ear, tint: 'bg-sky-50 text-sky-600' },
  { value: 'READING', icon: BookMarked, tint: 'bg-secondary-50 text-secondary-600' },
  { value: 'WRITING', icon: PenLine, tint: 'bg-success-50 text-success-600' },
  { value: 'SPEAKING', icon: MessagesSquare, tint: 'bg-bubble-50 text-bubble-600' },
  { value: 'SHADOWING', icon: Drama, tint: 'bg-primary-50 text-primary-600' },
  { value: 'DICTATION', icon: Keyboard, tint: 'bg-accent-50 text-accent-600' },
]

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
const CEFR_CHIP: Record<string, string> = {
  A1: 'bg-success-50 text-success-700',
  A2: 'bg-success-100 text-success-800',
  B1: 'bg-primary-50 text-primary-700',
  B2: 'bg-primary-100 text-primary-800',
  C1: 'bg-grape-50 text-grape-700',
  C2: 'bg-grape-100 text-grape-800',
}

export function EnglishStrandsPage() {
  const { t } = useTranslation()
  const [cefrFilter, setCefrFilter] = useState('')
  const [activeFamily, setActiveFamily] = useState<EnglishStrandFamily | null>(null)

  const { data: strands, isLoading, isError, refetch } = useQuery({
    queryKey: ['english-strands', cefrFilter],
    queryFn: () =>
      englishApi.listStrands(cefrFilter ? { cefrLevel: cefrFilter } : undefined).then((res) => res.data),
  })

  // Option A: the real learning path (skills → competencies → mission + mastery).
  const { data: path } = useQuery({
    queryKey: ['english-path'],
    queryFn: () => englishApi.getLearningPath().then((res) => res.data),
  })
  const pathSkills = path?.skills?.filter((s) => s.competencies.length > 0) ?? []

  const grouped: Record<string, EnglishStrand[]> = {}
  for (const strand of strands || []) {
    const fam = strand.strandType || 'VOCABULARY'
    if (!grouped[fam]) grouped[fam] = []
    grouped[fam]!.push(strand)
  }

  const familiesToShow = activeFamily
    ? STRAND_FAMILIES.filter((f) => f.value === activeFamily)
    : STRAND_FAMILIES

  const hasAny = (strands || []).length > 0

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-brand-hero relative overflow-hidden shadow-lift">
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/15 p-1.5 shrink-0">
                <CharacterFace characterId="Luma" size={52} state="encouraging" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-extrabold text-white">{t('english.title')}</h1>
                <p className="text-white/80 text-sm mt-0.5">{t('english.subtitle')}</p>
              </div>
            </div>
            <Link to="/english/coach" className="chip-glass hover:bg-white/25 transition-colors">
              <MessageCircle className="w-4 h-4" strokeWidth={2} /> {t('english.talkToCoach')}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CURRENT LEARNING PATH (Option A) — the real spine: competencies with
            live mastery state, each launching its real mission. Shown ABOVE the
            strand catalog: "what do I learn next?" before "what can I browse?".
            Mission ids come from the API (GET /english/path), never hardcoded. */}
        {pathSkills.length > 0 && (
          <section className="mb-8" aria-labelledby="english-path-heading">
            <h2 id="english-path-heading" className="text-lg font-display font-bold text-slate-900 mb-1">
              {t('english.pathTitle')}
            </h2>
            <p className="text-sm text-slate-500 mb-4">{t('english.pathSubtitle')}</p>
            {/* Shared canonical-spine renderer (child-friendly mastery bands,
                CEFR chips, real mission links) — same component every domain uses. */}
            <DomainLearningPath
              skills={pathSkills}
              startLabelKey="english.startLearning"
              startLabelFallback="Start"
            />
          </section>
        )}

        {/* EXPLORE ENGLISH — the strand catalog (discovery, secondary). */}
        <h2 className="text-lg font-display font-bold text-slate-900 mb-3">{t('english.exploreTitle')}</h2>

        {/* CEFR filter */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-700 me-1">{t('english.cefrLevel')}</span>
            <button
              className={`px-3 py-1.5 min-h-11 rounded-pill text-sm font-semibold transition-colors ${
                cefrFilter === '' ? 'bg-primary-600 text-white' : 'bg-surface-100 text-slate-700 hover:bg-surface-200'
              }`}
              onClick={() => setCefrFilter('')}
            >
              {t('english.allLevels')}
            </button>
            {CEFR_LEVELS.map((level) => (
              <button
                key={level}
                aria-pressed={cefrFilter === level}
                className={`px-3 py-1.5 min-h-11 rounded-pill text-sm font-semibold transition-colors ${
                  cefrFilter === level ? 'bg-primary-600 text-white' : CEFR_CHIP[level]
                }`}
                onClick={() => setCefrFilter(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Strand family tabs (the 9 strand types) */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              aria-pressed={activeFamily === null}
              className={`px-3 py-2 rounded-pill text-sm font-semibold transition-colors ${
                activeFamily === null ? 'bg-secondary-500 text-white' : 'bg-surface-100 text-slate-700 hover:bg-surface-200'
              }`}
              onClick={() => setActiveFamily(null)}
            >
              {t('english.allStrands')}
            </button>
            {STRAND_FAMILIES.map((fam) => {
              const Icon = fam.icon
              return (
                <button
                  key={fam.value}
                  aria-pressed={activeFamily === fam.value}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-pill text-sm font-semibold transition-colors ${
                    activeFamily === fam.value ? 'bg-secondary-500 text-white' : 'bg-surface-100 text-slate-700 hover:bg-surface-200'
                  }`}
                  onClick={() => setActiveFamily(fam.value)}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  {t(`english.family.${fam.value.toLowerCase()}`)}
                </button>
              )
            })}
          </div>
        </div>

        {isError ? (
          <ErrorState
            character="Luma"
            title={t('english.errorTitle')}
            message={t('english.errorMessage')}
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <LoadingState character="Luma" message={t('english.loading')} />
        ) : hasAny ? (
          <div className="space-y-8">
            {familiesToShow.map((fam) => {
              const items = (grouped[fam.value] || []).slice().sort((a, b) => a.order - b.order)
              if (items.length === 0) return null
              const Icon = fam.icon
              return (
                <section key={fam.value} aria-labelledby={`fam-${fam.value}`}>
                  <h2 id={`fam-${fam.value}`} className="text-xl font-heading font-bold text-slate-900 mb-3 inline-flex items-center gap-2">
                    <span className={`icon-chip ${fam.tint} w-8 h-8`}><Icon className="w-4 h-4" strokeWidth={2} /></span>
                    {t(`english.family.${fam.value.toLowerCase()}`)}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((strand) => (
                      <div key={strand.id} className="card hover:shadow-lift transition-shadow">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-display font-semibold text-slate-900 line-clamp-2">{strand.name}</h3>
                          {strand.cefrLevel && (
                            <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-bold ${CEFR_CHIP[strand.cefrLevel] || 'bg-surface-100 text-slate-700'}`}>
                              {strand.cefrLevel}
                            </span>
                          )}
                        </div>
                        {strand.description && (
                          <p className="text-sm text-slate-600 line-clamp-3">{strand.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        ) : (
          <EmptyState
            character="Luma"
            title={t('english.emptyTitle')}
            message={t('english.emptyMessage')}
          />
        )}
      </main>
    </div>
  )
}
