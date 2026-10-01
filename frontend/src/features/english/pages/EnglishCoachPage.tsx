import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, MessagesSquare, PencilLine, BookOpen, BookMarked, Send } from 'lucide-react'
import { englishCoachApi } from '@/lib/api/endpoints'
import { CharacterFace, type CharacterState } from '@/features/characters/components/CharacterFace'

type Mode = 'conversation' | 'grammar' | 'vocabulary' | 'reading'

interface ChatMessage {
  id: string
  role: 'user' | 'coach'
  text: string
  mode: Mode
  isError?: boolean
}

/**
 * English Coach — a chat with LUMA (the English mentor), over the real
 * `english-coach` Bedrock-backed endpoints (/api/english-coach/*).
 *
 * Phase 4 rebuild: this was the one English surface left behind by the earlier
 * reconstruction — it used emoji (🧑‍🏫💬✏️📖), a rainbow gradient header, and
 * had NO i18n (fully broken in Arabic). Now: Luma is present and reactive (she
 * "thinks" while a reply is pending, "speaks" after it lands), lucide icons
 * replace emoji, a brand-hero header replaces the gradient, and every string is
 * i18n'd (EN + AR) via t(key, fallback). The real API wiring + graceful
 * provider-unavailable handling are preserved exactly.
 */
const MODES: { id: Mode; icon: typeof MessagesSquare }[] = [
  { id: 'conversation', icon: MessagesSquare },
  { id: 'grammar', icon: PencilLine },
  { id: 'vocabulary', icon: BookOpen },
  { id: 'reading', icon: BookMarked },
]

export function EnglishCoachPage() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('conversation')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const mutation = useMutation({
    mutationFn: async ({ mode, text }: { mode: Mode; text: string }) => {
      switch (mode) {
        case 'conversation':
          return englishCoachApi.conversation({ userMessage: text }).then((r) => r.data)
        case 'grammar':
          return englishCoachApi.grammar({ text, explainMistakes: true }).then((r) => r.data)
        case 'vocabulary':
          return englishCoachApi.vocabulary({ topic: text }).then((r) => r.data)
        case 'reading':
          return englishCoachApi.reading({ topic: text }).then((r) => r.data)
      }
    },
    onSuccess: (data: any) => {
      const text =
        data?.response ||
        data?.feedback ||
        data?.passage ||
        (data?.vocabulary ? JSON.stringify(data.vocabulary) : null) ||
        JSON.stringify(data)
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'coach', text, mode }])
    },
    onError: (err: any) => {
      const status = err?.response?.status
      const serverMsg = err?.response?.data?.message
      const text = status
        ? t('englishCoach.errorHttp', {
            status,
            detail: serverMsg ? `: ${serverMsg}` : '',
            defaultValue:
              "Luma can't reply right now (HTTP {{status}}{{detail}}). The strands browser still works fully without the AI coach.",
          })
        : t('englishCoach.errorNetwork', "Luma can't reply right now (network error). Please try again later.")
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'coach', text, mode, isError: true }])
    },
  })

  const handleSend = () => {
    const text = input.trim()
    if (!text || mutation.isPending) return
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text, mode }])
    setInput('')
    mutation.mutate({ mode, text })
  }

  const placeholder = t(`englishCoach.placeholder.${mode}`, {
    defaultValue:
      mode === 'conversation' ? 'Say something in English...'
      : mode === 'grammar' ? 'Type a sentence to check...'
      : mode === 'vocabulary' ? 'Enter a topic (e.g. "animals")...'
      : 'Enter a topic for a reading passage...',
  })

  // Luma's live state: thinking while a reply is pending, speaking right after
  // one lands, else idle — the character reacts to the conversation.
  const lastMsg = messages[messages.length - 1]
  const lumaState: CharacterState = mutation.isPending
    ? 'thinking'
    : lastMsg?.role === 'coach' && !lastMsg.isError
    ? 'speaking'
    : 'idle'

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      {/* Brand-hero header with Luma present (replaces the emoji + gradient). */}
      <header className="relative overflow-hidden bg-brand-hero shadow-lift">
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link to="/english" className="inline-flex items-center gap-1 text-white/90 hover:text-white text-sm font-semibold mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
            {t('englishCoach.backToStrands', 'Strands')}
          </Link>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/15 p-1.5 shrink-0">
              <CharacterFace characterId="Luma" size={56} state={lumaState} />
            </div>
            <div>
              <h1 className="text-2xl font-display font-extrabold text-white">{t('englishCoach.title', 'English Coach')}</h1>
              <p className="text-white/80 text-sm mt-0.5">{t('englishCoach.subtitle', "Practice with Luma — she's patient, and every mistake helps you learn.")}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        {/* Mode selector — lucide icons, pill buttons, i18n labels. */}
        <div className="flex flex-wrap gap-2 mb-4">
          {MODES.map((m) => {
            const Icon = m.icon
            const active = mode === m.id
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-pill text-sm font-semibold transition-colors ${
                  active ? 'bg-primary-600 text-white' : 'bg-surface-100 text-slate-700 hover:bg-surface-200'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                {t(`englishCoach.mode.${m.id}`, m.id.charAt(0).toUpperCase() + m.id.slice(1))}
              </button>
            )
          })}
        </div>

        {/* Chat window */}
        <div className="card flex-1 mb-4 min-h-[400px] max-h-[60vh] overflow-y-auto flex flex-col gap-3 p-4">
          {messages.length === 0 && (
            <div className="m-auto flex flex-col items-center text-center gap-3 py-8">
              <CharacterFace characterId="Luma" size={96} state="encouraging" />
              <p className="text-slate-500 text-sm max-w-xs">
                {t('englishCoach.emptyHint', 'Pick a mode and send a message to start practicing English with Luma.')}
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'} max-w-[85%]`}
            >
              {msg.role === 'coach' && (
                <CharacterFace characterId="Luma" size={32} animate={false} className="shrink-0 mb-1" />
              )}
              <div
                className={`px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : msg.isError
                    ? 'bg-error-50 text-error-800 border border-error-200'
                    : 'bg-surface-100 text-ink'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {mutation.isPending && (
            <div className="self-start flex items-end gap-2">
              <CharacterFace characterId="Luma" size={32} state="thinking" className="shrink-0 mb-1" />
              <div className="bg-surface-100 text-slate-500 px-4 py-2 rounded-2xl text-sm">
                {t('englishCoach.thinking', 'Luma is thinking...')}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="input flex-1"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
            aria-label={placeholder}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={mutation.isPending || !input.trim()}
          >
            <Send className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
            {t('englishCoach.send', 'Send')}
          </button>
        </div>
      </main>
    </div>
  )
}
