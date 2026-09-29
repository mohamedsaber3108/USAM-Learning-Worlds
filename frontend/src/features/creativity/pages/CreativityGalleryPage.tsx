import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Palette, Lightbulb, PencilLine, Eye, Send, FolderHeart, Globe, Lock } from 'lucide-react'
import { creativityApi, type CreativityPromptRecord, type CreativitySubmissionRecord } from '@/lib/api/endpoints'
import { LoadingState, EmptyState } from '@/components/common/CharacterState'
import { getFriendlyErrorMessage } from '@/lib/utils/friendlyError'

/**
 * Creativity Studio — the CREATE → CREATION loop (task #9).
 *
 * Makes the real make-something loop visible, not just a prompt gallery:
 *   Brief (prompt) → Create (write) → Improve (preview before sending) →
 *   Submit → My Creations (the learner's portfolio of submissions, with a
 *   Share/Keep-private toggle) → public Gallery.
 *
 * Backed by the real creativity engine
 * (backend/src/modules/creativity/creativity.controller.ts):
 * `/creativity/prompts`, `/creativity/submissions`, `/creativity/submissions/mine`,
 * `/creativity/gallery`, `/creativity/submissions/:id/visibility`.
 *
 * HONESTY NOTE: the creativity engine is a prompt + submission + gallery
 * engine. It does NOT (yet) record Evidence or Mastery, so this page makes no
 * "counts toward mastery" claim — the accomplishment framing is the learner's
 * growing collection of creations, which is real.
 */

// Product-facing age labels. The backend AgeBand enum values (AGE_8_9 /
// AGE_10_11 / AGE_12_14) are stable internal identifiers that MAP to the
// Bible's product-facing 7-9 / 10-12 / 13-15 bands (see
// plans-local/01_PRODUCT_NORTH_STAR.md). Never show the raw enum's numbers to
// a child — show the product-facing range.
const AGE_BAND_LABELS: Record<string, string> = {
  AGE_8_9: 'Ages 7-9',
  AGE_10_11: 'Ages 10-12',
  AGE_12_14: 'Ages 13-15',
}

function ageBandLabel(band: string) {
  return AGE_BAND_LABELS[band] ?? band
}

export function CreativityGalleryPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedPrompt, setSelectedPrompt] = useState<CreativityPromptRecord | null>(null)
  const [draft, setDraft] = useState('')
  const [draftTitle, setDraftTitle] = useState('')
  const [makePublic, setMakePublic] = useState(false)
  const [preview, setPreview] = useState(false)
  const [ageFilter, setAgeFilter] = useState<string>('')

  const { data: prompts, isLoading: promptsLoading } = useQuery({
    queryKey: ['creativity-prompts', ageFilter],
    queryFn: () =>
      creativityApi.listPrompts(ageFilter ? { ageBand: ageFilter } : undefined).then((r) => r.data),
  })

  // The learner's own portfolio of creations (was previously never consumed).
  const { data: mine } = useQuery({
    queryKey: ['creativity-mine'],
    queryFn: () => creativityApi.mySubmissions().then((r) => r.data),
    retry: false,
  })

  const { data: gallery, isLoading: galleryLoading } = useQuery({
    queryKey: ['creativity-gallery', selectedPrompt?.id],
    queryFn: () => creativityApi.gallery(selectedPrompt?.id).then((r) => r.data),
    enabled: !!selectedPrompt,
  })

  const submitMutation = useMutation({
    mutationFn: () =>
      creativityApi.submit({
        promptId: selectedPrompt!.id,
        ...(draftTitle ? { title: draftTitle } : {}),
        content: draft,
        visibility: makePublic ? 'PUBLIC' : 'PRIVATE',
      }),
    onSuccess: () => {
      setDraft('')
      setDraftTitle('')
      setMakePublic(false)
      setPreview(false)
      queryClient.invalidateQueries({ queryKey: ['creativity-gallery', selectedPrompt?.id] })
      queryClient.invalidateQueries({ queryKey: ['creativity-mine'] })
    },
  })

  const visibilityMutation = useMutation({
    mutationFn: ({ id, visibility }: { id: string; visibility: 'PRIVATE' | 'PUBLIC' }) =>
      creativityApi.setVisibility(id, visibility),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creativity-mine'] })
      queryClient.invalidateQueries({ queryKey: ['creativity-gallery', selectedPrompt?.id] })
    },
  })

  const submitErrorMessage = submitMutation.isError
    ? getFriendlyErrorMessage(submitMutation.error, t('creativity.saveError', 'We could not save your creation. Please try again.'))
    : null

  const ageBands = useMemo(() => {
    const set = new Set<string>()
    prompts?.forEach((p) => set.add(p.ageBand))
    return Array.from(set)
  }, [prompts])

  const myCreations: CreativitySubmissionRecord[] = Array.isArray(mine) ? mine : []

  if (promptsLoading) {
    return <LoadingState character="Mira" message={t('creativity.loading', 'Mira is gathering creative ideas…')} />
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="relative overflow-hidden rounded-blob bg-brand-hero text-white p-6 sm:p-8 mb-8 shadow-lift">
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div aria-hidden className="absolute -top-10 -end-10 w-48 h-48 rounded-full bg-bubble-400/20 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="icon-chip bg-white/15 text-white"><Palette className="w-6 h-6" strokeWidth={2} /></div>
          <div>
            <h1 className="text-2xl font-display font-extrabold">{t('creativity.title', 'Creativity Studio')}</h1>
            <p className="text-white/80 text-sm mt-0.5">
              {t('creativity.subtitle', 'Pick a brief, make something, make it better, then share it.')}
            </p>
          </div>
        </div>
      </header>

      {/* My creations — the learner's real portfolio of submissions. */}
      {myCreations.length > 0 && (
        <section className="mb-8" aria-labelledby="my-creations-heading">
          <h2 id="my-creations-heading" className="font-display text-lg font-bold text-slate-900 mb-3 inline-flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-primary-600" strokeWidth={2} />
            {t('creativity.myCreations', 'My creations')}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {myCreations.slice(0, 6).map((sub) => {
              const isPublic = sub.visibility === 'PUBLIC'
              return (
                <div key={sub.id} className="rounded-card border border-surface-200 p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {sub.title || t('creativity.untitled', 'Untitled')}
                    </span>
                    {sub.prompt?.title && (
                      <span className="text-xs text-slate-400 truncate">{sub.prompt.title}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-3">{sub.content}</p>
                  <button
                    type="button"
                    disabled={visibilityMutation.isPending}
                    onClick={() =>
                      visibilityMutation.mutate({ id: sub.id, visibility: isPublic ? 'PRIVATE' : 'PUBLIC' })
                    }
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50"
                  >
                    {isPublic ? <Globe className="w-3.5 h-3.5" strokeWidth={2} /> : <Lock className="w-3.5 h-3.5" strokeWidth={2} />}
                    {isPublic ? t('creativity.shared', 'Shared — make private') : t('creativity.private', 'Private — share it')}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Step 1 — Brief: pick something to make. */}
      <h2 className="font-display text-lg font-bold text-slate-900 mb-1 inline-flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-accent-500" strokeWidth={2} />
        {t('creativity.pickBrief', 'Pick a brief')}
      </h2>
      <p className="text-sm text-slate-500 mb-4">{t('creativity.pickBriefHint', 'Choose something that sounds fun to make.')}</p>

      {ageBands.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            className={`px-3 py-1 min-h-11 rounded-full text-sm border ${
              ageFilter === '' ? 'bg-primary-600 text-white border-primary-600' : 'border-surface-300'
            }`}
            onClick={() => setAgeFilter('')}
          >
            {t('creativity.allAges', 'All ages')}
          </button>
          {ageBands.map((band) => (
            <button
              key={band}
              className={`px-3 py-1 min-h-11 rounded-full text-sm border ${
                ageFilter === band ? 'bg-primary-600 text-white border-primary-600' : 'border-surface-300'
              }`}
              onClick={() => setAgeFilter(band)}
            >
              {ageBandLabel(band)}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {prompts?.map((p) => (
          <button
            key={p.id}
            onClick={() => { setSelectedPrompt(p); setPreview(false) }}
            className={`text-start rounded-card border p-4 hover:shadow-md transition ${
              selectedPrompt?.id === p.id ? 'border-primary-500 ring-2 ring-primary-200' : 'border-surface-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-primary-600">{ageBandLabel(p.ageBand)}</span>
              {p.domain && <span className="text-xs text-slate-400">{p.domain.name}</span>}
            </div>
            <h3 className="font-semibold text-slate-900">{p.title}</h3>
            <p className="text-sm text-slate-600 mt-1 line-clamp-3">{p.prompt}</p>
          </button>
        ))}
      </div>

      {selectedPrompt && (
        <section className="mt-8 border-t border-surface-200 pt-6">
          {/* The brief, restated as "what you're making". */}
          <div className="rounded-card bg-accent-50 border border-accent-100 p-4 mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-600 mb-1">
              {t('creativity.yourBrief', 'Your brief')}
            </p>
            <h2 className="font-display text-lg font-bold text-slate-900">{selectedPrompt.title}</h2>
            <p className="text-sm text-slate-700 mt-1">{selectedPrompt.prompt}</p>
          </div>

          {/* Step 2 — Create. */}
          <h3 className="font-display font-semibold text-slate-800 mb-2 inline-flex items-center gap-2">
            <PencilLine className="w-4 h-4 text-primary-500" strokeWidth={2} />
            {t('creativity.makeIt', 'Make it')}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder={t('creativity.titlePlaceholder', 'Give your creation a title (optional)')}
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="w-full border border-surface-300 rounded-lg px-3 py-2 text-sm"
            />
            <textarea
              placeholder={t('creativity.contentPlaceholder', 'Write, describe, or paste your creation here…')}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={6}
              className="w-full border border-surface-300 rounded-lg px-3 py-2 text-sm"
              aria-invalid={draft.trim().length === 0}
            />
            {draft.trim().length === 0 && (
              <p className="text-xs text-slate-400">
                {t('creativity.startHint', 'Write a little something before you share — even a sentence is a great start!')}
              </p>
            )}

            {/* Step 3 — Improve: preview before sending. */}
            {draft.trim().length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setPreview((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  <Eye className="w-4 h-4" strokeWidth={2} />
                  {preview ? t('creativity.hidePreview', 'Hide preview') : t('creativity.improve', 'Preview & improve')}
                </button>
                {preview && (
                  <div className="mt-2 rounded-card border border-surface-200 bg-surface-50 p-4">
                    <p className="text-xs text-slate-400 mb-1">{t('creativity.previewLabel', 'This is how it will look:')}</p>
                    {draftTitle && <p className="font-semibold text-slate-800">{draftTitle}</p>}
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{draft}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {t('creativity.improveHint', 'Happy with it? Or tweak it above to make it even better.')}
                    </p>
                  </div>
                )}
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={makePublic} onChange={(e) => setMakePublic(e.target.checked)} />
              {t('creativity.shareToggle', 'Share this in the public gallery for this brief')}
            </label>
            {submitErrorMessage && (
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {submitErrorMessage}
              </p>
            )}
            {/* Step 4 — Submit. */}
            <button
              disabled={!draft.trim() || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
              className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" strokeWidth={2} />
              {submitMutation.isPending ? t('creativity.saving', 'Saving…') : t('creativity.submit', 'Save my creation')}
            </button>
          </div>

          {/* Public gallery for this brief. */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-500 mb-3">{t('creativity.galleryTitle', 'What others made for this brief')}</h3>
            {galleryLoading ? (
              <p className="text-sm text-slate-400">{t('creativity.galleryLoading', 'Loading gallery…')}</p>
            ) : gallery && gallery.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {gallery.map((sub) => (
                  <div key={sub.id} className="rounded-lg border border-surface-200 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{sub.title || t('creativity.untitled', 'Untitled')}</span>
                      <span className="text-xs text-slate-400">{sub.learner?.displayName ?? t('creativity.aLearner', 'Learner')}</span>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-4">{sub.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">{t('creativity.galleryEmpty', 'No public creations yet — be the first to share!')}</p>
            )}
          </div>
        </section>
      )}

      {!selectedPrompt && (prompts?.length ?? 0) === 0 && (
        <EmptyState
          character="Mira"
          title={t('creativity.emptyTitle', 'No briefs right now')}
          message={t('creativity.emptyMessage', 'Check back soon — Mira is dreaming up new things to make.')}
        />
      )}
    </div>
  )
}
