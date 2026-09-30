import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import { creativityApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader, Button, Dialog, Textarea, useToast } from '@/components/ui'

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

/** Creativity studio (Mira) — real prompts + submit + my creations. The
 * creativity engine does NOT write mastery/evidence by design; we never
 * fabricate mastery linkage. DS + Dialog. */
export function CreativityPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const toast = useToast()
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
      toast.show(t('learner.submitCreation'), 'success')
      await qc.invalidateQueries({ queryKey: ['creativity-mine'] })
    } catch {
      toast.show(t('states.error'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (prompts.isLoading) return <LoadingState />
  if (prompts.isError) return <ErrorState onRetry={() => void prompts.refetch()} />

  return (
    <div className="space-y-8">
      <PageHeader title={t('learner.creativityStudio')} />

      <section>
        <SectionHeader title={t('learner.create')} />
        {prompts.data && prompts.data.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {prompts.data.map((p) => (
              <Card key={p.id}>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                  <Sparkles className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-3 font-display font-bold text-ink-900">{p.title}</h3>
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

      <Dialog
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.title ?? ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setActive(null)}>
              {t('common.cancel')}
            </Button>
            <Button loading={submitting} disabled={!content.trim()} onClick={submit}>
              {t('learner.submitCreation')}
            </Button>
          </>
        }
      >
        {active?.description && <p className="mb-3 text-sm text-ink-500">{active.description}</p>}
        <Textarea aria-label={active?.title} rows={6} value={content} onChange={(e) => setContent(e.target.value)} />
      </Dialog>
    </div>
  )
}
