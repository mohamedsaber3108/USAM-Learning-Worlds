import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, ImageIcon, Smile, ListOrdered, BookOpenCheck, Sparkles } from 'lucide-react'
import { visualLanguageApi, type VisualLanguageCard } from '@/lib/api/endpoints'

const CATEGORY_META: Record<
  VisualLanguageCard['category'],
  { label: string; icon: typeof ImageIcon; color: string }
> = {
  VOCABULARY: { label: 'Vocabulary', icon: ImageIcon, color: 'text-primary-600 bg-primary-50' },
  EMOTION: { label: 'Emotions', icon: Smile, color: 'text-accent-600 bg-accent-50' },
  SEQUENCING: { label: 'Sequencing', icon: ListOrdered, color: 'text-success-600 bg-success-50' },
  COMPREHENSION: { label: 'Comprehension', icon: BookOpenCheck, color: 'text-rose-600 bg-rose-50' },
}

/**
 * Visual Language Engine study UI (Tick 44 built the backend — service,
 * controller, 14 seeded image-paired cards across all 3 AgeBands — with no
 * frontend surface at all. This wires it up: an image-forward card viewer,
 * filterable by category, gated by the learner's own ageAppropriate band so
 * younger/older learners see the right seeded set by default (with an
 * explicit "All ages" override for browsing).
 */
export function VisualLanguageStudyPage() {
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const learnerAgeBand: string | undefined = user?.learner?.ageBand
  const [category, setCategory] = useState<VisualLanguageCard['category'] | ''>('')
  const [useOwnAgeBand, setUseOwnAgeBand] = useState(true)
  const [index, setIndex] = useState(0)

  const ageBand = useOwnAgeBand ? learnerAgeBand : undefined

  const { data: cards, isLoading } = useQuery({
    queryKey: ['visual-language', ageBand, category],
    queryFn: () =>
      visualLanguageApi.list(ageBand, category || undefined).then((res) => res.data as VisualLanguageCard[]),
  })

  const currentCard = useMemo(() => cards?.[index], [cards, index])

  const goTo = (i: number) => {
    if (!cards || cards.length === 0) return
    setIndex(((i % cards.length) + cards.length) % cards.length)
  }

  const handleCategoryChange = (c: VisualLanguageCard['category'] | '') => {
    setCategory(c)
    setIndex(0)
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-primary-600 shadow-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/learn" className="text-white/90 hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Back
            </Link>
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6" strokeWidth={2} />
              Visual Language
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleCategoryChange('')}
            className={`btn shadow-none ${category === '' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-surface-200'}`}
          >
            All Categories
          </button>
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => handleCategoryChange(key as VisualLanguageCard['category'])}
              className={`btn shadow-none flex items-center gap-1 ${
                category === key ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-surface-200'
              }`}
            >
              <meta.icon className="w-4 h-4" strokeWidth={2} />
              {meta.label}
            </button>
          ))}
        </div>

        {learnerAgeBand && (
          <label className="flex items-center gap-2 text-sm text-slate-500 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={useOwnAgeBand}
              onChange={(e) => {
                setUseOwnAgeBand(e.target.checked)
                setIndex(0)
              }}
              className="rounded border-surface-300"
            />
            Show cards for my age band only ({learnerAgeBand.replace('AGE_', '').replace('_', '-')})
          </label>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            <p className="mt-4 text-slate-500">Loading cards...</p>
          </div>
        ) : currentCard ? (
          <div className="flex flex-col items-center">
            <p className="text-sm text-slate-500 mb-3">
              Card {index + 1} of {cards?.length ?? 0}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="card w-full max-w-xl overflow-hidden"
              >
                <div className="aspect-video bg-surface-100 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                  <img
                    src={currentCard.imageUrl}
                    alt={`Illustration for ${currentCard.word}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 text-center">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full mb-2 ${CATEGORY_META[currentCard.category].color}`}
                  >
                    {CATEGORY_META[currentCard.category].label}
                  </span>
                  <h2 className="text-2xl font-heading font-bold text-slate-900">{currentCard.word}</h2>
                  <p className="text-slate-500 mt-2">{currentCard.caption}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-4 mt-6">
              <button onClick={() => goTo(index - 1)} className="btn bg-white text-slate-600 border border-surface-200">
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              </button>
              <button onClick={() => goTo(index + 1)} className="btn bg-primary-600 text-white flex items-center gap-1">
                Next <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="icon-chip bg-surface-100 text-slate-400 mx-auto mb-4 w-16 h-16">
              <ImageIcon className="w-8 h-8" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">No cards found</h2>
            <p className="text-slate-500">Try a different category or age filter.</p>
          </div>
        )}
      </main>
    </div>
  )
}
