/**
 * Voice API client — talks to backend/src/modules/voice's POST /voice/turn.
 */
import { apiClient } from '@/lib/api/client'

export interface VoiceTurnResult {
  transcript: string
  aiResponseText: string
  audioUrl: string
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
  /** Resolves a relative audioUrl (e.g. "/voice-audio/xyz.wav") against the API host. */
  resolveAudioUrl: (audioUrl: string) => {
    if (/^https?:\/\//i.test(audioUrl)) return audioUrl
    const origin = API_BASE.replace(/\/api\/?$/, '')
    return `${origin}${audioUrl}`
  },
}
