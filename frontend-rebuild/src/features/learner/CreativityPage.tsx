import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { creativityApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Prompt {
  id: string
  slug: string
  title: string
  description?: string
}
interface Submission {
  id: string
  title?: string
  content: string
}

/** Creativity studio — real prompts + submit + my creations. The creativity
 * submission engine does NOT write mastery/evidence (by design); we do not
 * fabricate any mastery linkage here. */
export function CreativityPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [active, setActive] = useState<Prompt | null>(null)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const prompts = useQuery({
    queryKey: ['creativity-prompts'],
    queryFn: async () => (await creativityApi.getPrompts()).data as Prompt[],
  })
  const mine = useQuery({
    queryKey: ['creativity-mine'],
    queryFn: async () => (await creativityApi.mySubmissions()).data as Submission[],
    retry: false,
  })

  async function submit() {
    if (!active || !content.trim()) return
    setSubmitting(true)
    try {
      await creativityApi.submit({ promptId: active.id, content })
      setContent('')
      setActive(null)
      await qc.invalidateQueries({ queryKey: ['creativity-mine'] })
    } finally {
      setSubmitting(false)
    }
  }

  if (prompts.isLoading) return <LoadingState />
  if (prompts.isError) return <ErrorState onRetry={() => void prompts.refetch()} />

  return (
    <div className="space-y-8">
      <PageHeader title={t('learner.creativityStudio')} />

      {active ? (
        <Card>
          <h2 className="font-display text-lg font-bold text-ink-900">{active.title}</h2>
          {active.description && <p className="mt-1 text-sm text-ink-500">{active.description}</p>}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="mt-4 w-full rounded-control border border-line px-3 py-2 focus-visible:border-brand-400"
            aria-label={active.title}
          />
          <div className="mt-3 flex gap-2">
            <Button loading={submitting} disabled={!content.trim()} onClick={submit}>
              {t('learner.submitCreation')}
            </Button>
            <Button variant="ghost" onClick={() => setActive(null)}>
              {t('common.cancel')}
            </Button>
          </div>
        </Card>
      ) : (
        <section>
          <SectionHeader title={t('learner.create')} />
          {prompts.data && prompts.data.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {prompts.data.map((p) => (
                <Card key={p.id}>
                  <h3 className="font-display font-bold text-ink-900">{p.title}</h3>
                  {p.description && <p className="mt-1 text-sm text-ink-500">{p.description}</p>}
                  <Button className="mt-3" size="sm" onClick={() => setActive(p)}>
                    {t('learner.create')}
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>
      )}

      <section>
        <SectionHeader title={t('learner.myCreations')} />
        {mine.data && mine.data.length > 0 ? (
          <div className="space-y-2">
            {mine.data.map((s) => (
              <Card key={s.id}>
                {s.title && <p className="font-medium text-ink-900">{s.title}</p>}
                <p className="text-sm text-ink-600">{s.content}</p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </div>
  )
}
