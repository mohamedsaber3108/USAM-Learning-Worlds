/**
 * Voice API client — talks to backend/src/modules/voice's POST /voice/turn.
 */
import { apiClient } from '@/lib/api/client'

export interface VoiceTurnResult {
  transcript: string
  aiResponseText: string
  /** Null when the TTS sidecar failed/timed out — turn still has text. */
  audioUrl: string | null
  audioUnavailable?: boolean
}

/**
 * Shape of the 503 body voice.service.ts's VoiceSidecarUnavailableException
 * sends when an ASR/TTS sidecar is unreachable or times out. `fallbackToText`
 * tells the UI to stop waiting on voice and let the learner type instead.
 */
export interface VoiceSidecarUnavailableBody {
  statusCode: 503
  error: 'VoiceSidecarUnavailable'
  stage: 'asr' | 'tts'
  message: string
  fallbackToText: true
}

export function isVoiceSidecarUnavailable(err: any): err is { response: { data: VoiceSidecarUnavailableBody } } {
  return err?.response?.data?.error === 'VoiceSidecarUnavailable'
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const voiceApi = {
  turn: (audioBlob: Blob, conversationId: string) => {
    const form = new FormData()
    form.append('audio', audioBlob, 'recording.webm')
    form.append('conversationId', conversationId)

    return apiClient.post<VoiceTurnResult>('/voice/turn', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  /**
   * Text-chat fallback path — reuses the same
   * POST /characters/conversations/:id/messages endpoint the typed chat UI
   * calls, so when voice is down the learner can keep the conversation
   * going without audio instead of being stuck.
   */
  sendTextFallback: (conversationId: string, content: string) =>
    apiClient.post<{ characterMessage: { content: string } }>(
      `/characters/conversations/${conversationId}/messages`,
      { content, metadata: { source: 'voice-fallback' } },
    ),
  /** Resolves a relative audioUrl (e.g. "/voice-audio/xyz.wav") against the API host. */
  resolveAudioUrl: (audioUrl: string) => {
    if (/^https?:\/\//i.test(audioUrl)) return audioUrl
    const origin = API_BASE.replace(/\/api\/?$/, '')
    return `${origin}${audioUrl}`
  },
}
