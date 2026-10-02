import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import { charactersApi, conversationsApi, entitlementsApi, type ConversationMessage } from '@/lib/api/endpoints'
import { LoadingState, ErrorState } from '@/components/common/States'
import { Button, Card, PageHeader } from '@/components/ui'
import { CharacterStage } from '@/features/characters/CharacterStage'
import type { CharacterState } from '@/features/characters/CharacterFace'

/**
 * Companion chat — real conversation against a character.
 *
 * NEW (2026-10-02, ledger 88 task 9): closes the biggest companion gap found
 * in the reconciliation pass — the Companions gallery previously had no way
 * to actually talk to anyone despite the backend's full conversation engine
 * (`character.controller.ts` conversations CRUD + messages).
 *
 * Entitlement-honest: `POST /characters/:id/chat` and conversation messaging
 * both require the `aiTutor` feature flag server-side (FREE plan = false).
 * Rather than let the first message silently 403, this page checks
 * `GET /entitlements/me` up front and shows a real upgrade state instead of a
 * broken chat box for learners on the free plan — no fake chat, no silent
 * failure.
 */
export function CompanionChatPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [draft, setDraft] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [characterState, setCharacterState] = useState<CharacterState>('idle')
  const scrollRef = useRef<HTMLDivElement>(null)

  const character = useQuery({
    queryKey: ['character', id],
    queryFn: async () => (await charactersApi.getById(id)).data,
    enabled: Boolean(id),
  })

  const entitlements = useQuery({
    queryKey: ['entitlements-me'],
    queryFn: async () => (await entitlementsApi.getMine()).data,
  })
  const canChat = entitlements.data?.features?.aiTutor === true

  const conversation = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => (await conversationsApi.get(conversationId!)).data.conversation,
    enabled: Boolean(conversationId),
  })

  const messages: ConversationMessage[] = conversation.data?.messages ?? []

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  async function startOrSend() {
    const content = draft.trim()
    if (!content || sending) return
    setSending(true)
    setCharacterState('thinking')
    try {
      if (!conversationId) {
        const res = await conversationsApi.create(id, { type: 'CASUAL', initialMessage: content })
        setConversationId(res.data.conversation.id)
      } else {
        await conversationsApi.sendMessage(conversationId, { content })
        await qc.invalidateQueries({ queryKey: ['conversation', conversationId] })
      }
      setDraft('')
      setCharacterState('speaking')
      setTimeout(() => setCharacterState('idle'), 2000)
    } catch {
      setCharacterState('error')
      setTimeout(() => setCharacterState('idle'), 1500)
    } finally {
      setSending(false)
    }
  }

  if (character.isLoading || entitlements.isLoading) return <LoadingState />
  if (character.isError) return <ErrorState onRetry={() => void character.refetch()} />
  const name = character.data?.name ?? ''

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4">
      <PageHeader title={name} />

      {!canChat ? (
        <Card className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <CharacterStage characterId={name} size={140} />
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">{t('learner.chatUpgradeTitle')}</h2>
            <p className="mt-1 max-w-sm text-sm text-ink-500">{t('learner.chatUpgradeBody')}</p>
          </div>
          <Link to="/pricing">
            <Button>{t('learner.chatUpgradeCta')}</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-card border border-line bg-white p-4">
            <div className="flex justify-center py-4">
              <CharacterStage characterId={name} size={100} state={characterState} />
            </div>
            {messages.length === 0 ? (
              <p className="text-center text-sm text-ink-400">{t('learner.chatEmpty')}</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'LEARNER' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-card px-4 py-2.5 text-sm ${
                      m.role === 'LEARNER' ? 'bg-brand-500 text-white' : 'border border-line bg-canvas-off text-ink-800'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              void startOrSend()
            }}
            className="flex gap-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t('learner.chatPlaceholder')}
              aria-label={t('learner.chatPlaceholder')}
              className="flex-1 rounded-control border border-line bg-white px-4 py-2.5 text-sm text-ink-900 focus-visible:border-brand-400 focus-visible:shadow-focus"
              disabled={sending}
            />
            <Button type="submit" disabled={sending || !draft.trim()} aria-label={t('learner.chatSend')}>
              <Send className="h-4 w-4" aria-hidden />
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
