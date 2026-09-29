/**
 * VoiceChatPage — standalone voice-chat surface for Voice Pipeline v1.
 * Record -> upload -> ASR -> AI response -> TTS -> play round trip.
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic2, Info, Sparkles, Keyboard } from 'lucide-react'
import { VoiceRecorder } from '../components/VoiceRecorder'
import { VoicePlayer } from '../components/VoicePlayer'
import { voiceApi, VoiceTurnResult, isVoiceSidecarUnavailable } from '../api/voiceApi'
import { EmptyState } from '@/components/common/CharacterState'
import { CharacterFace, type CharacterState } from '@/features/characters/components/CharacterFace'

interface Turn extends VoiceTurnResult {
  id: string
  resolvedAudioUrl: string | null
}

export function VoiceChatPage() {
  const { t } = useTranslation()
  const [conversationId, setConversationId] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // When the ASR/TTS sidecar is unreachable/timed out, we stop asking the
  // child to keep recording and drop them into a plain text input instead —
  // no stuck spinner they can't debug.
  const [textFallbackActive, setTextFallbackActive] = useState(false)
  const [textFallbackMessage, setTextFallbackMessage] = useState<string | null>(null)
  const [textInput, setTextInput] = useState('')

  const handleRecordingComplete = async (blob: Blob) => {
    if (!conversationId.trim()) {
      setError(t('voice.needConversationId', 'Enter a conversation ID first (from an existing AI conversation).'))
      return
    }
    setError(null)
    setIsProcessing(true)
    try {
      const res = await voiceApi.turn(blob, conversationId.trim())
      const result = res.data
      setTurns((prev) => [
        ...prev,
        {
          ...result,
          id: `${Date.now()}`,
          resolvedAudioUrl: result.audioUrl ? voiceApi.resolveAudioUrl(result.audioUrl) : null,
        },
      ])
    } catch (err: any) {
      if (isVoiceSidecarUnavailable(err)) {
        // Backend signals fallbackToText:true — auto-switch this child to
        // typing instead of leaving the mic UI up with no way forward.
        setTextFallbackMessage(err.response.data.message)
        setTextFallbackActive(true)
      } else {
        setError(
          err?.response?.data?.message || err?.message || 'Voice turn failed',
        )
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextFallbackSend = async () => {
    if (!textInput.trim() || !conversationId.trim()) return
    setError(null)
    setIsProcessing(true)
    try {
      const res = await voiceApi.sendTextFallback(conversationId.trim(), textInput.trim())
      setTurns((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          transcript: textInput.trim(),
          aiResponseText: res.data.characterMessage.content,
          audioUrl: null,
          audioUnavailable: true,
          resolvedAudioUrl: null,
        },
      ])
      setTextInput('')
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Message failed to send')
    } finally {
      setIsProcessing(false)
    }
  }

  const orderedTurns = turns.slice().reverse()

  // Companion (Tala, the voice guide) reflects the real voice state machine:
  // error > thinking (processing) > idle. (Recording/listening + speaking are
  // owned by the VoiceRecorder/VoicePlayer sub-components.)
  const companionState: CharacterState = error
    ? 'error'
    : isProcessing
    ? 'thinking'
    : 'idle'
  const companionCaption = error
    ? t('voice.stateError', 'Hmm, that didn’t work — let’s try again.')
    : isProcessing
    ? t('voice.stateThinking', 'Thinking about what you said…')
    : textFallbackActive
    ? t('voice.stateTyping', "Let's type instead.")
    : t('voice.stateIdle', 'Tap the mic and say something!')

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header — one solid brand color, no rainbow gradient, matches Community/Dashboard chrome */}
      <header className="bg-brand-hero relative overflow-hidden shadow-lift">
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="icon-chip bg-white/15 text-white"><Mic2 className="w-6 h-6" strokeWidth={2} /></div>
            <div>
              <h1 className="text-2xl font-display font-extrabold text-white">{t('voice.title', 'Voice Chat')}</h1>
              <p className="text-white/80 text-sm mt-0.5">{t('voice.subtitle', 'Talk with your guide — practice speaking and listening.')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Conversation setup */}
        <div className="card mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {t('voice.conversationId', 'Conversation ID')}
          </label>
          <input
            type="text"
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            placeholder={t('voice.conversationIdPlaceholder', 'Existing conversation ID (create one via the text chat first)')}
            className="input"
          />
          <div className="flex items-start gap-2 mt-3 bg-primary-50 border border-primary-100 rounded-control p-3">
            <Info className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-xs text-primary-800">
              {t('voice.pipelineNote', 'Voice turns are routed through the same conversation/AI pipeline as typed messages — no separate voice conversation logic.')}
            </p>
          </div>
        </div>

        {/* Recorder surface — the hero interaction, given real visual weight.
            When a sidecar is unreachable/timed out we swap this whole block
            for a plain text input so the child is never stuck staring at a
            mic/spinner they can't recover from. */}
        <div className="stat-card-hero flex flex-col items-center py-10 mb-8">
          {/* Companion (Tala) reflecting the voice state machine + a caption. */}
          <CharacterFace characterId="Tala" size={96} state={companionState} />
          <p className="mt-2 mb-4 text-sm font-medium text-slate-600" aria-live="polite">{companionCaption}</p>
          {textFallbackActive ? (
            <div className="w-full max-w-md flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-primary-700">
                <Keyboard className="w-5 h-5" strokeWidth={2} />
                <p className="text-sm font-semibold">{t('voice.fallbackTitle', "Voice is taking a break — let's type!")}</p>
              </div>
              {textFallbackMessage && (
                <p className="text-sm text-slate-600 text-center">{textFallbackMessage}</p>
              )}
              <div className="flex w-full gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTextFallbackSend()}
                  placeholder={t('voice.fallbackPlaceholder', 'Type what you wanted to say…')}
                  className="input flex-1"
                  disabled={isProcessing}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleTextFallbackSend}
                  disabled={isProcessing || !textInput.trim()}
                  className="px-4 py-2 rounded-control bg-primary-500 text-white font-semibold hover:bg-primary-600 disabled:opacity-50"
                >
                  {t('voice.send', 'Send')}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTextFallbackActive(false)
                  setTextFallbackMessage(null)
                }}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 underline"
              >
                {t('voice.tryMicAgain', 'Try the microphone again')}
              </button>
            </div>
          ) : (
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              disabled={isProcessing}
            />
          )}
          <AnimatePresence>
            {isProcessing && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 text-sm font-medium text-primary-700 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" strokeWidth={2} />
                {textFallbackActive ? t('voice.sending', 'Sending your message…') : t('voice.processing', 'Transcribing, thinking, and synthesizing speech…')}
              </motion.p>
            )}
          </AnimatePresence>
          {error && (
            <p className="mt-4 text-sm font-medium text-error-600 bg-error-50 border border-error-100 rounded-control px-3 py-1.5">
              {error}
            </p>
          )}
        </div>

        {/* Turn history */}
        <h2 className="text-lg font-display font-bold text-slate-900 mb-4">{t('voice.conversation', 'Conversation')}</h2>

        {orderedTurns.length === 0 ? (
          <EmptyState
            character="Tala"
            title={t('voice.noTurnsTitle', 'No turns yet')}
            message={t('voice.noTurnsMessage', 'Tap the microphone above and say something to start a voice round trip.')}
          />
        ) : (
          <div className="space-y-5">
            {orderedTurns.map((turn, idx) => (
              <motion.div
                key={turn.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx === 0 ? 0 : 0 }}
                className="card"
              >
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-100 text-secondary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {t('voice.you', 'You')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                        {t('voice.youSaid', 'You said')}
                      </p>
                      <p className="text-slate-800 font-medium">{turn.transcript}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      AI
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                        {t('voice.aiResponse', 'AI response')}
                      </p>
                      <p className="text-slate-800 font-medium">{turn.aiResponseText}</p>
                      {turn.resolvedAudioUrl ? (
                        <VoicePlayer audioUrl={turn.resolvedAudioUrl} />
                      ) : (
                        turn.audioUnavailable && (
                          <p className="mt-1 text-xs text-slate-400 italic">
                            {t('voice.noPlayback', "(voice playback wasn't available for this reply — text only)")}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
