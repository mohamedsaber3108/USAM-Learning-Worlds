/**
 * VoiceChatPage — standalone voice-chat surface for Voice Pipeline v1.
 * Record -> upload -> ASR -> AI response -> TTS -> play round trip.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { VoiceRecorder } from '../components/VoiceRecorder'
import { VoicePlayer } from '../components/VoicePlayer'
import { voiceApi, VoiceTurnResult } from '../api/voiceApi'

interface Turn extends VoiceTurnResult {
  id: string
  resolvedAudioUrl: string
}

export function VoiceChatPage() {
  const [conversationId, setConversationId] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRecordingComplete = async (blob: Blob) => {
    if (!conversationId.trim()) {
      setError('Enter a conversationId first (from an existing AI conversation).')
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
          resolvedAudioUrl: voiceApi.resolveAudioUrl(result.audioUrl),
        },
      ])
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'Voice turn failed',
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 shadow-pop">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-heading font-extrabold text-white drop-shadow-sm">
            🎙️ Voice Chat
          </h1>
          <Link
            to="/dashboard"
            className="btn bg-white/90 text-primary-700 hover:bg-white shadow-none"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Conversation ID
          </label>
          <input
            type="text"
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            placeholder="Existing conversation ID (create one via the text chat first)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Voice turns are routed through the same conversation/AI pipeline
            as typed messages — no separate voice conversation logic.
          </p>
        </div>

        <div className="card mb-6 flex flex-col items-center py-8">
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            disabled={isProcessing}
          />
          {isProcessing && (
            <p className="mt-4 text-sm text-primary-600 animate-pulse">
              Transcribing, thinking, and synthesizing speech...
            </p>
          )}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        <div className="space-y-4">
          {turns
            .slice()
            .reverse()
            .map((turn) => (
              <div key={turn.id} className="card">
                <p className="text-sm text-gray-500 mb-1">You said:</p>
                <p className="font-medium mb-3">{turn.transcript}</p>
                <p className="text-sm text-gray-500 mb-1">AI response:</p>
                <p className="font-medium mb-3">{turn.aiResponseText}</p>
                <VoicePlayer audioUrl={turn.resolvedAudioUrl} />
              </div>
            ))}
        </div>
      </main>
    </div>
  )
}
