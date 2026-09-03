/**
 * VoiceRecorder — captures mic audio via MediaRecorder and hands the
 * resulting Blob to the caller. Part of Voice Pipeline v1
 * (see docs/architecture/USAM_OSS_INTEGRATION_PLAN.md Section 3).
 */
import { useCallback, useRef, useState } from 'react'
import { Mic, Square } from 'lucide-react'

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
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        {/* Idle/active ring — quiet primary halo at rest, warm accent pulse while recording */}
        <span
          className={`absolute inline-flex h-28 w-28 rounded-full transition-colors duration-300 ${
            isRecording ? 'bg-accent-100 animate-pulse' : 'bg-primary-50'
          }`}
          aria-hidden="true"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={isRecording ? stopRecording : startRecording}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-white
            active:scale-95 ${
            isRecording
              ? 'bg-accent-500 hover:bg-accent-600 shadow-glow-primary focus:ring-accent-200'
              : 'bg-primary-500 hover:bg-primary-600 shadow-soft-md hover:shadow-soft-hover focus:ring-primary-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-primary-500' : ''}`}
          aria-pressed={isRecording}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <Square className="w-7 h-7" strokeWidth={2} fill="currentColor" />
          ) : (
            <Mic className="w-8 h-8" strokeWidth={2} />
          )}
        </button>
      </div>
      <p className={`text-sm font-medium transition-colors ${isRecording ? 'text-accent-600' : 'text-slate-500'}`}>
        {isRecording ? 'Recording — tap to stop' : 'Tap to speak'}
      </p>
      {error && (
        <p className="text-sm font-medium text-error-600 bg-error-50 border border-error-100 rounded-control px-3 py-1.5">
          {error}
        </p>
      )}
    </div>
  )
}
