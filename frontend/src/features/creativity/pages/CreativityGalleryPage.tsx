import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { creativityApi, type CreativityPromptRecord } from '@/lib/api/endpoints'
import { LoadingState } from '@/components/common/CharacterState'

/**
 * Creativity Engine — guided creative-project-prompt gallery.
 *
 * Distinct from generic Projects: a curated prompt library
 * (CreativityPrompt: story/art/music/invention across ageBand + domain)
 * with an opt-in public submission gallery, backed by real
 * backend/src/modules/creativity/creativity.controller.ts endpoints
 * (`/creativity/prompts`, `/creativity/submissions`, `/creativity/gallery`).
 * No frontend previously existed for this engine — this page is the v1
 * closing that gap: browse prompts, respond to one, see the public gallery
 * of other learners' PUBLIC submissions for that prompt.
 */

const AGE_BAND_LABELS: Record<string, string> = {
  AGE_6_7: 'Ages 6-7',
  AGE_8_9: 'Ages 8-9',
  AGE_10_11: 'Ages 10-11',
  AGE_12_13: 'Ages 12-13',
  AGE_14_15: 'Ages 14-15',
  AGE_16_18: 'Ages 16-18',
}

function ageBandLabel(band: string) {
  return AGE_BAND_LABELS[band] ?? band
}

export function CreativityGalleryPage() {
  const queryClient = useQueryClient()
  const [selectedPrompt, setSelectedPrompt] = useState<CreativityPromptRecord | null>(null)
  const [draft, setDraft] = useState('')
  const [draftTitle, setDraftTitle] = useState('')
  const [makePublic, setMakePublic] = useState(false)
  const [ageFilter, setAgeFilter] = useState<string>('')

  const { data: prompts, isLoading: promptsLoading } = useQuery({
    queryKey: ['creativity-prompts', ageFilter],
    queryFn: () =>
      creativityApi.listPrompts(ageFilter ? { ageBand: ageFilter } : undefined).then((r) => r.data),
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
      queryClient.invalidateQueries({ queryKey: ['creativity-gallery', selectedPrompt?.id] })
    },
  })

  const ageBands = useMemo(() => {
    const set = new Set<string>()
    prompts?.forEach((p) => set.add(p.ageBand))
    return Array.from(set)
  }, [prompts])

  if (promptsLoading) {
    return <LoadingState character="Luma" message="Luma is gathering creative prompts..." />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Creativity Studio</h1>
        <p className="text-sm text-gray-500 mt-1">
          Guided story, art, music, and invention prompts — pick one, create your response, and
          share it if you'd like.
        </p>
      </header>

      {ageBands.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            className={`px-3 py-1 min-h-11 rounded-full text-sm border ${
              ageFilter === '' ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300'
            }`}
            onClick={() => setAgeFilter('')}
          >
            All ages
          </button>
          {ageBands.map((band) => (
            <button
              key={band}
              className={`px-3 py-1 min-h-11 rounded-full text-sm border ${
                ageFilter === band ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300'
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
            onClick={() => setSelectedPrompt(p)}
            className={`text-start rounded-xl border p-4 hover:shadow-md transition ${
              selectedPrompt?.id === p.id ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-purple-600">{ageBandLabel(p.ageBand)}</span>
              {p.domain && <span className="text-xs text-gray-400">{p.domain.name}</span>}
            </div>
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-3">{p.prompt}</p>
          </button>
        ))}
      </div>

      {selectedPrompt && (
        <section className="mt-8 border-t pt-6">
          <h2 className="text-lg font-bold">{selectedPrompt.title}</h2>
          <p className="text-sm text-gray-700 mt-2 mb-4">{selectedPrompt.prompt}</p>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Give your creation a title (optional)"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Write, describe, or paste your creation here..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={makePublic}
                onChange={(e) => setMakePublic(e.target.checked)}
              />
              Share this in the public gallery for this prompt
            </label>
            <button
              disabled={!draft.trim() || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium disabled:opacity-50"
            >
              {submitMutation.isPending ? 'Saving...' : 'Submit my creation'}
            </button>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Public gallery for this prompt</h3>
            {galleryLoading ? (
              <p className="text-sm text-gray-400">Loading gallery...</p>
            ) : gallery && gallery.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {gallery.map((sub) => (
                  <div key={sub.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{sub.title || 'Untitled'}</span>
                      <span className="text-xs text-gray-400">{sub.learner?.displayName ?? 'Learner'}</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-4">{sub.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No public creations yet — be the first to share!</p>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
