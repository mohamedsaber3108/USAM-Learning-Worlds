import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { englishCoachApi } from '@/lib/api/endpoints'

type Mode = 'conversation' | 'grammar' | 'vocabulary' | 'reading'

interface ChatMessage {
  id: string
  role: 'user' | 'coach' | 'system'
  text: string
  mode: Mode
  isError?: boolean
}

const MODES: { id: Mode; label: string; icon: string; placeholder: string }[] = [
  { id: 'conversation', label: 'Conversation', icon: '💬', placeholder: 'Say something in English...' },
  { id: 'grammar', label: 'Grammar Check', icon: '✏️', placeholder: 'Type a sentence to check its grammar...' },
  { id: 'vocabulary', label: 'Vocabulary', icon: '📖', placeholder: 'Enter a topic (e.g. "animals")...' },
  { id: 'reading', label: 'Reading Passage', icon: '📚', placeholder: 'Enter a topic for a reading passage...' },
]

/**
 * Simple chat-style UI over the real `english-coach` Bedrock-backed
 * endpoints (`/api/english-coach/conversation|grammar|vocabulary|reading`).
 * If AWS Bedrock credentials are invalid on the backend, these calls
 * return a non-2xx JSON error (not a crash); we surface that as a
 * regular chat bubble with an error style instead of throwing.
 */
export function EnglishCoachPage() {
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
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'coach', text, mode },
      ])
    },
    onError: (err: any) => {
      const status = err?.response?.status
      const serverMsg = err?.response?.data?.message
      const text =
        status
          ? `Coach is unavailable right now (HTTP ${status}${serverMsg ? `: ${serverMsg}` : ''}). This usually means the AI provider (AWS Bedrock) credentials aren't configured — the strands browser above still works fully without it.`
          : 'Coach is unavailable right now (network error). Please try again later.'
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'coach', text, mode, isError: true },
      ])
    },
  })

  const handleSend = () => {
    const text = input.trim()
    if (!text || mutation.isPending) return
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text, mode }])
    setInput('')
    mutation.mutate({ mode, text })
  }

  const activeModeInfo = MODES.find((m) => m.id === mode)!

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-500 to-secondary-500 shadow-pop">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/english" className="text-white/90 hover:text-white transition-colors">
                ← Strands
              </Link>
              <h1 className="text-2xl font-heading font-bold text-white">🧑‍🏫 English Coach</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        {/* Mode selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                mode === m.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Chat window */}
        <div className="card flex-1 mb-4 min-h-[400px] max-h-[60vh] overflow-y-auto flex flex-col gap-3 p-4">
          {messages.length === 0 && (
            <p className="text-gray-500 text-sm text-center my-auto">
              Pick a mode above and send a message to start practicing English with your AI coach.
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'self-end bg-primary-600 text-white'
                  : msg.isError
                  ? 'self-start bg-red-50 text-red-800 border border-red-200'
                  : 'self-start bg-gray-100 text-gray-900'
              }`}
            >
              {msg.text}
            </div>
          ))}
          {mutation.isPending && (
            <div className="self-start bg-gray-100 text-gray-500 px-4 py-2 rounded-2xl text-sm">
              Coach is thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="input flex-1"
            placeholder={activeModeInfo.placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
            }}
          />
          <button
            className="btn"
            onClick={handleSend}
            disabled={mutation.isPending || !input.trim()}
          >
            Send
          </button>
        </div>
      </main>
    </div>
  )
}
