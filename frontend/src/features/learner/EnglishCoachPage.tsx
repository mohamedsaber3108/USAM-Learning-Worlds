import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, SpellCheck, BookOpenText, Hash } from 'lucide-react'
import { englishCoachApi } from '@/lib/api/endpoints'
import { Button, Card, PageHeader, Tabs, Textarea, Input, Select } from '@/components/ui'
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
  const [tab, setTab] = useState<'conversation' | 'grammar' | 'vocabulary' | 'reading'>('conversation')

  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.englishCoachTitle')} />
      <Tabs
        tabs={[
          { key: 'conversation', label: t('learner.englishCoachTabConversation') },
          { key: 'grammar', label: t('learner.englishCoachTabGrammar') },
          { key: 'vocabulary', label: t('learner.englishCoachTabVocabulary') },
          { key: 'reading', label: t('learner.englishCoachTabReading') },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'conversation' && <ConversationTab />}
      {tab === 'grammar' && <GrammarTab />}
      {tab === 'vocabulary' && <VocabularyTab />}
      {tab === 'reading' && <ReadingTab />}
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

/**
 * Vocabulary practice — real POST /english-coach/vocabulary. Backend
 * returns `vocabulary: any[]` (its own parser is unstructured), so each
 * item is rendered defensively: common shapes (word/definition/example) are
 * shown when present, with a raw-string fallback so nothing silently
 * disappears if the AI's JSON came back shaped differently.
 */
function VocabularyTab() {
  const { t } = useTranslation()
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [words, setWords] = useState<unknown[] | null>(null)

  async function generate() {
    if (!topic.trim() || loading) return
    setLoading(true)
    setWords(null)
    try {
      const res = await englishCoachApi.vocabulary({ topic: topic.trim() })
      setWords(res.data.vocabulary ?? [])
    } catch {
      setWords([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="space-y-4">
      <Input
        label={t('learner.englishCoachVocabTopicLabel')}
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder={t('learner.englishCoachVocabTopicPlaceholder')}
      />
      <Button onClick={() => void generate()} disabled={loading || !topic.trim()} loading={loading}>
        <Hash className="h-4 w-4" aria-hidden />
        {t('learner.englishCoachVocabGenerate')}
      </Button>
      {words && (
        words.length === 0 ? (
          <p className="text-sm text-ink-500">{t('states.error')}</p>
        ) : (
          <div className="space-y-2">
            {words.map((w, i) => {
              const item = (w ?? {}) as Record<string, unknown>
              const word = typeof item.word === 'string' ? item.word : undefined
              const definition = typeof item.definition === 'string' ? item.definition : undefined
              const example = typeof item.example === 'string' ? item.example : undefined
              return (
                <div key={i} className="rounded-control border border-line p-3">
                  {word ? (
                    <>
                      <p className="font-display font-bold text-ink-900">{word}</p>
                      {definition && <p className="mt-1 text-sm text-ink-700">{definition}</p>}
                      {example && <p className="mt-1 text-sm italic text-ink-500">{example}</p>}
                    </>
                  ) : (
                    <p className="text-sm text-ink-700">{String(w)}</p>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}
    </Card>
  )
}

/** Reading passage — real POST /english-coach/reading. */
function ReadingTab() {
  const { t } = useTranslation()
  const [topic, setTopic] = useState('')
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('short')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ passage: string; wordCount: number; estimatedReadingTime: number } | null>(null)

  async function generate() {
    if (!topic.trim() || loading) return
    setLoading(true)
    setResult(null)
    try {
      const res = await englishCoachApi.reading({ topic: topic.trim(), length })
      setResult(res.data)
    } catch {
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="space-y-4">
      <Input
        label={t('learner.englishCoachReadingTopicLabel')}
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder={t('learner.englishCoachVocabTopicPlaceholder')}
      />
      <Select
        label={t('learner.englishCoachReadingLengthLabel')}
        value={length}
        onChange={(e) => setLength(e.target.value as 'short' | 'medium' | 'long')}
        options={[
          { value: 'short', label: t('learner.englishCoachReadingShort') },
          { value: 'medium', label: t('learner.englishCoachReadingMedium') },
          { value: 'long', label: t('learner.englishCoachReadingLong') },
        ]}
      />
      <Button onClick={() => void generate()} disabled={loading || !topic.trim()} loading={loading}>
        <BookOpenText className="h-4 w-4" aria-hidden />
        {t('learner.englishCoachReadingGenerate')}
      </Button>
      {result && (
        <div className="rounded-control border border-brand-200 bg-brand-50 p-4">
          <p className="whitespace-pre-wrap text-ink-900">{result.passage}</p>
          <p className="mt-3 text-xs text-ink-400">
            {t('learner.englishCoachReadingMeta', { minutes: result.estimatedReadingTime })}
          </p>
        </div>
      )}
    </Card>
  )
}
