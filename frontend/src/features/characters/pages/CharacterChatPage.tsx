import { useState, useRef, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Send } from 'lucide-react'
import { charactersApi } from '@/lib/api/endpoints'
import { CharacterAvatar } from '../components/CharacterAvatar'
import { getCharacterVisual } from '../lib/characterVisuals'

interface ChatMessage {
  id: string
  role: 'user' | 'character'
  text: string
  isError?: boolean
}

/**
 * Chat UI for POST /characters/:id/chat, mirroring the established pattern
 * from EnglishCoachPage.tsx: local message list, mutation per send, error
 * bubbles instead of thrown exceptions, auto-scroll to bottom.
 *
 * Live-verified route wiring on production: GET /characters/:id returns the
 * real character (name/role/personality/avatarUrl), and POST .../chat is
 * reachable (auth + Prisma + controller all execute) but currently 500s at
 * the Bedrock call step ("security token included in the request is
 * invalid") — a pre-existing AWS credential blocker shared with
 * english-coach, not a bug introduced here. The error bubble below surfaces
 * that gracefully instead of crashing the page.
 */
export function CharacterChatPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: character, isLoading: characterLoading } = useQuery({
    queryKey: ['characters', id],
    queryFn: () => charactersApi.getById(id!).then((r) => r.data),
    enabled: !!id,
  })

  // Real relationship-derived visual-leveling stage — see CharacterFace's
  // evolutionStage doc. Backed by GET /characters/:id/state
  // (CharacterService.getCharacterState); harmless 404/500 falls back to
  // stage 1 (base design) via the catch below.
  const { data: stateData } = useQuery({
    queryKey: ['characters', id, 'state'],
    queryFn: () => charactersApi.getState(id!).then((r) => r.data),
    enabled: !!id,
    retry: false,
  })
  const evolutionStage = (stateData?.state?.relationshipLevel ?? 1) as 1 | 2 | 3 | 4 | 5

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const mutation = useMutation({
    mutationFn: (text: string) => charactersApi.chat(id!, text).then((r) => r.data),
    onSuccess: (data) => {
      const text = data?.response?.message ?? 'Hmm, no response came back.'
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'character', text }])
    },
    onError: (err: any) => {
      const status = err?.response?.status
      const serverMsg = err?.response?.data?.message
      const name = character?.name ?? t('characterChat.thisCharacter', 'This character')
      const text = status
        ? t('characterChat.errorHttp', {
            name,
            status,
            detail: serverMsg ? `: ${serverMsg}` : '',
            defaultValue: "{{name}} can't reply right now (HTTP {{status}}{{detail}}). The AI coach may be resting — character data and the chat still work.",
          })
        : t('characterChat.errorNetwork', 'Could not reach the character (network error). Please try again.')
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'character', text, isError: true },
      ])
    },
  })

  const handleSend = () => {
    const text = input.trim()
    if (!text || mutation.isPending || !id) return
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text }])
    setInput('')
    mutation.mutate(text)
  }

  const visual = character ? getCharacterVisual(character.name) : null

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="shadow-pop" style={{ backgroundColor: visual?.color ?? '#64748B' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link to="/characters" className="inline-flex items-center gap-1 text-white/90 hover:text-white text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
            {t('characterChat.back', 'Characters')}
          </Link>
          {character && <CharacterAvatar name={character.name} size="sm" evolutionStage={evolutionStage} />}
          <div>
            <h1 className="text-xl font-heading font-bold text-white leading-tight">
              {characterLoading ? t('characterChat.loading', 'Loading…') : character?.name ?? t('characterChat.character', 'Character')}
            </h1>
            {character?.role && (
              <p className="text-xs text-white/80 leading-tight">{character.role}</p>
            )}
            {stateData?.state && evolutionStage >= 2 && (
              <p className="text-[11px] text-white/70 leading-tight mt-0.5">
                {t('characterChat.relationshipLevel', { level: evolutionStage, defaultValue: 'Relationship level {{level}}/5' })}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        {/* Chat window */}
        <div className="card flex-1 mb-4 min-h-[400px] max-h-[60vh] overflow-y-auto flex flex-col gap-3 p-4">
          {messages.length === 0 && (
            <p className="text-slate-500 text-sm text-center my-auto">
              {character
                ? t('characterChat.sayHi', { name: character.name, defaultValue: 'Say hi to {{name}} to start chatting.' })
                : t('characterChat.loadingCharacter', 'Loading character…')}
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap flex items-start gap-2 ${
                msg.role === 'user'
                  ? 'self-end bg-primary-600 text-white'
                  : msg.isError
                  ? 'self-start bg-error-50 text-error-800 border border-error-200'
                  : 'self-start bg-surface-100 text-ink'
              }`}
            >
              {msg.role === 'character' && character && (
                <CharacterAvatar name={character.name} size="sm" />
              )}
              <span>{msg.text}</span>
            </div>
          ))}
          {mutation.isPending && (
            <div className="self-start bg-surface-100 text-slate-500 px-4 py-2 rounded-2xl text-sm">
              {t('characterChat.thinking', { name: character?.name ?? t('characterChat.character', 'Character'), defaultValue: '{{name}} is thinking…' })}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="input flex-1"
            placeholder={character ? t('characterChat.messagePlaceholder', { name: character.name, defaultValue: 'Message {{name}}…' }) : t('characterChat.loading', 'Loading…')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!character}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
            }}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={mutation.isPending || !input.trim() || !character}
          >
            <Send className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
            {t('characterChat.send', 'Send')}
          </button>
        </div>
      </main>
    </div>
  )
}
