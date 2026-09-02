/**
 * VoiceRecorder — captures mic audio via MediaRecorder and hands the
 * resulting Blob to the caller. Part of Voice Pipeline v1
 * (see docs/architecture/USAM_OSS_INTEGRATION_PLAN.md Section 3).
 */
import { useCallback, useRef, useState } from 'react'

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void
  disabled?: boolean
}

export function VoiceRecorder({ onRecordingComplete, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : ''
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        onRecordingComplete(blob)
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? `Microphone access failed: ${err.message}`
          : 'Microphone access failed',
      )
    }
  }, [onRecordingComplete])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }, [])

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-pop transition-all ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-primary-500 hover:bg-primary-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-pressed={isRecording}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? '⏹️' : '🎤'}
      </button>
      <p className="text-sm text-gray-600">
        {isRecording ? 'Recording... tap to stop' : 'Tap to speak'}
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
