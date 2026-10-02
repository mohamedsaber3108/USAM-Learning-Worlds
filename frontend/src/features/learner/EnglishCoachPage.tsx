import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, SpellCheck } from 'lucide-react'
import { englishCoachApi } from '@/lib/api/endpoints'
import { Button, Card, PageHeader, Tabs, Textarea } from '@/components/ui'
import { AiDisclosureNotice } from '@/components/common/AiDisclosureNotice'
import { CharacterStage } from '@/features/characters/CharacterStage'

interface ChatTurn {
  role: 'LEARNER' | 'LUMA'
  content: string
}

/**
 * English Coach — real POST /english-coach/conversation + /grammar.
 *
 * NEW (ledger 88 batch-3): the backend's EnglishCoachService had full
 * working logic (CEFR-aware conversation practice, deterministic +
 * LLM-reviewed grammar correction) but ZERO frontend callers — a real
 * "zero FE representation despite real backend support" gap, distinct from
 * the companion chat (character.controller.ts), which is a different
 * engine. Two tabs: free conversation practice (framed as Luma, the
 * English-domain companion) and a standalone grammar checker.
 */
export function EnglishCoachPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'conversation' | 'grammar'>('conversation')

  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.englishCoachTitle')} />
      <Tabs
        tabs={[
          { key: 'conversation', label: t('learner.englishCoachTabConversation') },
          { key: 'grammar', label: t('learner.englishCoachTabGrammar') },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'conversation' ? <ConversationTab /> : <GrammarTab />}
    </div>
  )
}

function ConversationTab() {
  const { t } = useTranslation()
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns.length])

  async function send() {
    const content = draft.trim()
    if (!content || sending) return
    setSending(true)
    setTurns((p) => [...p, { role: 'LEARNER', content }])
    setDraft('')
    try {
      const res = await englishCoachApi.conversation({ userMessage: content })
      setTurns((p) => [...p, { role: 'LUMA', content: res.data.response }])
    } catch {
      setTurns((p) => [...p, { role: 'LUMA', content: t('states.error') }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-[60vh] flex-col gap-4">
      <AiDisclosureNotice />
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-card border border-line bg-white p-4">
        <div className="flex justify-center py-2">
          <CharacterStage characterId="Luma" size={88} />
        </div>
        {turns.length === 0 ? (
          <p className="text-center text-sm text-ink-400">{t('learner.englishCoachConversationEmpty')}</p>
        ) : (
          turns.map((turn, i) => (
            <div key={i} className={`flex ${turn.role === 'LEARNER' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-card px-4 py-2.5 text-sm ${
                  turn.role === 'LEARNER' ? 'bg-brand-500 text-white' : 'border border-line bg-canvas-off text-ink-800'
                }`}
              >
                {turn.content}
              </div>
            </div>
          ))
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void send()
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
    </div>
  )
}

function GrammarTab() {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<{ correctedText: string; feedback: string; mistakeCount: number } | null>(null)

  async function check() {
    if (!text.trim() || checking) return
    setChecking(true)
    setResult(null)
    try {
      const res = await englishCoachApi.grammar({ text, explainMistakes: true })
      setResult(res.data)
    } catch {
      setResult({ correctedText: text, feedback: t('states.error'), mistakeCount: 0 })
    } finally {
      setChecking(false)
    }
  }

  return (
    <Card className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder={t('learner.englishCoachGrammarPlaceholder')}
      />
      <Button onClick={() => void check()} disabled={checking || !text.trim()} loading={checking}>
        <SpellCheck className="h-4 w-4" aria-hidden />
        {t('learner.englishCoachGrammarCheck')}
      </Button>
      {result && (
        <div className="space-y-3 rounded-control border border-brand-200 bg-brand-50 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {t('learner.englishCoachGrammarCorrected')}
            </p>
            <p className="mt-1 text-ink-900">{result.correctedText}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {t('learner.englishCoachGrammarFeedback')}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-700">{result.feedback}</p>
          </div>
        </div>
      )}
    </Card>
  )
}
