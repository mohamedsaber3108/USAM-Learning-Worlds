/**
 * VoicePlayer — plays a synthesized TTS response via a plain <audio>
 * element. Part of Voice Pipeline v1
 * (see docs/architecture/USAM_OSS_INTEGRATION_PLAN.md Section 3).
 */
import { useEffect, useRef } from 'react'

interface VoicePlayerProps {
  audioUrl: string | null
  autoPlay?: boolean
}

export function VoicePlayer({ audioUrl, autoPlay = true }: VoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioUrl && autoPlay && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Autoplay can be blocked by the browser; user can press play manually.
      })
    }
  }, [audioUrl, autoPlay])

  if (!audioUrl) return null

  return (
    <div className="mt-2">
      <audio ref={audioRef} controls src={audioUrl} className="w-full">
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}
