import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Layers, RotateCcw, CheckCircle2, XCircle, Flame } from 'lucide-react'
import { curriculumApi, flashcardsApi, type Flashcard, type FlashcardStats } from '@/lib/api/endpoints'

interface Domain {
  id: string
  name: string
  slug: string
  icon?: string
}

/**
 * Flashcard Engine study UI. Backend (FlashcardsService, seeded via
 * seed-flashcards.ts) has been fully implemented since before this fix but
 * had zero frontend surface — no route, no page, no nav link anywhere.
 * This wires it up as a real spaced-repetition study session: pull due
 * cards (or first-time cards) for an optional domain filter, flip to reveal
 * the answer, self-report remembered/forgot, which POSTs a real review and
 * advances the FlashcardReview confidence/nextReviewDue schedule server-side.
 */
export function FlashcardsStudyPage() {
  const queryClient = useQueryClient()
  const [domainId, setDomainId] = useState<string>('')
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [sessionDone, setSessionDone] = useState<{ remembered: number; forgot: number }>({
    remembered: 0,
    forgot: 0,
  })

  const { data: domains } = useQuery({
    queryKey: ['curriculum-domains'],
    queryFn: () => curriculumApi.getDomains().then((res) => res.data as Domain[]),
  })

  const { data: stats } = useQuery({
    queryKey: ['flashcard-stats'],
    queryFn: () => flashcardsApi.getStats().then((res) => res.data as FlashcardStats),
  })

  const {
    data: cards,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['flashcards-due', domainId],
    queryFn: () =>
      flashcardsApi.getDueCards(domainId || undefined, 20).then((res) => res.data as Flashcard[]),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, remembered }: { id: string; remembered: boolean }) =>
      flashcardsApi.recordReview(id, remembered),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-stats'] })
    },
  })

  const currentCard = useMemo(() => cards?.[index], [cards, index])

  const handleAnswer = async (remembered: boolean) => {
    if (!currentCard) return
    await reviewMutation.mutateAsync({ id: currentCard.id, remembered })
    setSessionDone((prev) => ({
      remembered: prev.remembered + (remembered ? 1 : 0),
      forgot: prev.forgot + (remembered ? 0 : 1),
    }))
    setFlipped(false)
    if (cards && index + 1 < cards.length) {
      setIndex(index + 1)
    } else {
      setIndex(0)
      await refetch()
    }
  }

  const handleDomainChange = (id: string) => {
    setDomainId(id)
    setIndex(0)
    setFlipped(false)
    setSessionDone({ remembered: 0, forgot: 0 })
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-primary-600 shadow-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/learn" className="text-white/90 hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Back
            </Link>
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Layers className="w-6 h-6" strokeWidth={2} />
              Flashcards
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats strip */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="stat-card text-center">
              <p className="text-3xl font-display font-extrabold text-primary-600">{stats.totalReviewed}</p>
              <p className="text-slate-500 text-sm mt-1">Reviewed</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-3xl font-display font-extrabold text-accent-600">{stats.dueNow}</p>
              <p className="text-slate-500 text-sm mt-1">Due Now</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-3xl font-display font-extrabold text-success-600">{stats.mastered}</p>
              <p className="text-slate-500 text-sm mt-1">Mastered</p>
            </div>
          </div>
        )}

        {/* Domain filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleDomainChange('')}
            className={`btn shadow-none ${domainId === '' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-surface-200'}`}
          >
            All Domains
          </button>
          {(domains ?? []).map((d) => (
            <button
              key={d.id}
              onClick={() => handleDomainChange(d.id)}
              className={`btn shadow-none ${domainId === d.id ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-surface-200'}`}
            >
              {d.icon ? `${d.icon} ` : ''}
              {d.name}
            </button>
          ))}
        </div>

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
                key={currentCard.id + String(flipped)}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setFlipped((f) => !f)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setFlipped((f) => !f)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={flipped ? 'Card back. Press to flip back to front.' : 'Card front. Press to reveal answer.'}
                className="card w-full max-w-xl min-h-[220px] flex items-center justify-center text-center p-8 cursor-pointer select-none"
              >
                <p className="text-xl font-heading font-semibold text-slate-900">
                  {flipped ? currentCard.back : currentCard.front}
                </p>
              </motion.div>
            </AnimatePresence>

            {!flipped ? (
              <button
                onClick={() => setFlipped(true)}
                className="btn bg-primary-600 text-white mt-6 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={2} />
                Reveal Answer
              </button>
            ) : (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => handleAnswer(false)}
                  disabled={reviewMutation.isPending}
                  className="btn bg-rose-600 text-white flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" strokeWidth={2} />
                  Forgot
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  disabled={reviewMutation.isPending}
                  className="btn bg-success-600 text-white flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  Remembered
                </button>
              </div>
            )}

            {(sessionDone.remembered > 0 || sessionDone.forgot > 0) && (
              <p className="text-sm text-slate-500 mt-6 flex items-center gap-1">
                <Flame className="w-4 h-4 text-accent-500" strokeWidth={2} />
                This session: {sessionDone.remembered} remembered, {sessionDone.forgot} forgot
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="icon-chip bg-success-50 text-success-600 mx-auto mb-4 w-16 h-16">
              <CheckCircle2 className="w-8 h-8" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">All caught up!</h2>
            <p className="text-slate-500">No flashcards due right now — check back later.</p>
          </div>
        )}
      </main>
    </div>
  )
}
