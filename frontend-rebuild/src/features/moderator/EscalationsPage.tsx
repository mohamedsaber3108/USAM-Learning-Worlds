import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { moderationApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, StatusPill, Button, Select, Textarea, Dialog, useToast } from '@/components/ui'

interface Escalation {
  id: string
  reason?: string
  status?: string
  severity?: string
}

type ResolutionType = 'RESOLVED_INTERNALLY' | 'REFERRED_TO_GUARDIAN' | 'REFERRED_TO_HUMAN_SUPPORT' | 'FALSE_POSITIVE'

/**
 * Safety escalations queue — assign/resolve. Real `/safety-escalations`
 * (@Roles MODERATOR, ADMIN). DS.
 *
 * FIX (2026-10-02): resolve() used to send `{ resolution: 'reviewed' }`, which
 * does not match the backend's `ResolveSafetyEscalationDto` at all (requires
 * `resolutionType` from a fixed enum + a non-empty `resolutionNote`) — every
 * resolve attempt was rejected with a 400 by the global ValidationPipe's
 * `forbidNonWhitelisted`. Replaced the one-click action with a real dialog
 * that collects both required fields, matching the actual contract
 * (backend/src/modules/ai/dto/safety-escalation.dto.ts).
 */
export function EscalationsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const toast = useToast()
  const [resolving, setResolving] = useState<Escalation | null>(null)
  const [resolutionType, setResolutionType] = useState<ResolutionType>('RESOLVED_INTERNALLY')
  const [resolutionNote, setResolutionNote] = useState('')
  const [noteError, setNoteError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['escalations'],
    queryFn: async () => (await moderationApi.escalations()).data as Escalation[],
  })

  async function assign(id: string) {
    await moderationApi.assign(id)
    toast.show(t('mod.assign'), 'success')
    await qc.invalidateQueries({ queryKey: ['escalations'] })
  }

  function openResolve(e: Escalation) {
    setResolving(e)
    setResolutionType('RESOLVED_INTERNALLY')
    setResolutionNote('')
    setNoteError(undefined)
  }

  async function confirmResolve() {
    if (!resolving) return
    if (!resolutionNote.trim()) {
      setNoteError(t('mod.resolutionNoteRequired'))
      return
    }
    setSubmitting(true)
    try {
      await moderationApi.resolve(resolving.id, { resolutionType, resolutionNote: resolutionNote.trim() })
      toast.show(t('mod.resolve'), 'success')
      setResolving(null)
      await qc.invalidateQueries({ queryKey: ['escalations'] })
    } catch {
      toast.show(t('states.error'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const items = data ?? []
  const resolutionOptions: Array<{ value: ResolutionType; label: string }> = [
    { value: 'RESOLVED_INTERNALLY', label: t('mod.resolutionTypeResolvedInternally') },
    { value: 'REFERRED_TO_GUARDIAN', label: t('mod.resolutionTypeReferredToGuardian') },
    { value: 'REFERRED_TO_HUMAN_SUPPORT', label: t('mod.resolutionTypeReferredToHumanSupport') },
    { value: 'FALSE_POSITIVE', label: t('mod.resolutionTypeFalsePositive') },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title={t('mod.escalations')} />
      {items.length === 0 ? (
        <EmptyState title={t('mod.nothingToReview')} />
      ) : (
        <div className="space-y-3">
          {items.map((e) => (
            <Card key={e.id} className="flex flex-wrap items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block font-medium text-ink-900">{e.reason ?? 'Escalation'}</span>
                <span className="mt-1 flex gap-2">
                  {e.severity && <StatusPill tone="warning">{e.severity}</StatusPill>}
                  {e.status && <StatusPill tone={e.status === 'RESOLVED' ? 'success' : 'neutral'}>{e.status}</StatusPill>}
                </span>
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => assign(e.id)}>
                  {t('mod.assign')}
                </Button>
                <Button size="sm" onClick={() => openResolve(e)}>
                  {t('mod.resolve')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!resolving}
        onClose={() => setResolving(null)}
        title={t('mod.resolveTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setResolving(null)} disabled={submitting}>
              {t('mod.cancel')}
            </Button>
            <Button onClick={() => void confirmResolve()} disabled={submitting}>
              {t('mod.confirmResolve')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label={t('mod.resolutionType')}
            options={resolutionOptions}
            value={resolutionType}
            onChange={(ev) => setResolutionType(ev.target.value as ResolutionType)}
          />
          <Textarea
            label={t('mod.resolutionNote')}
            hint={!noteError ? t('mod.resolutionNoteHint') : undefined}
            error={noteError}
            value={resolutionNote}
            onChange={(ev) => {
              setResolutionNote(ev.target.value)
              if (noteError) setNoteError(undefined)
            }}
            required
          />
        </div>
      </Dialog>
    </div>
  )
}
