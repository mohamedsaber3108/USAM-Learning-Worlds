import { useState } from "react";
import { Loader2, Mic, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { voiceService } from "@/services";
import { useExperience } from "@/state/experience";

/**
 * Voice surface placeholder. No microphone is accessed — the component only
 * renders the four voice states a real VoiceService will drive.
 */
export function VoiceControl({
  prompt,
  onTranscript,
}: {
  prompt: string;
  onTranscript?: (text: string) => void;
}) {
  const { voiceState, setVoiceState } = useExperience();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const listening = voiceState === "listening";

  async function toggle() {
    if (listening && sessionId) {
      setVoiceState("thinking");
      const result = await voiceService.stop(sessionId);
      setTranscript(result.transcript);
      onTranscript?.(result.transcript);
      setSessionId(null);
      setVoiceState("idle");
      return;
    }
    const session = await voiceService.start();
    setSessionId(session.sessionId);
    setVoiceState("listening");
  }

  async function playPrompt() {
    setVoiceState("speaking");
    const { durationMs } = await voiceService.speak(prompt);
    setTimeout(() => setVoiceState("idle"), Math.min(durationMs, 1200));
  }

  return (
    <div className="surface-panel space-y-4 p-5">
      <div className="flex items-start gap-3">
        <div
          aria-hidden
          className={cn(
            "mt-1 size-2.5 shrink-0 rounded-full bg-muted-foreground",
            listening && "bg-destructive motion-safe:animate-pulse",
            voiceState === "speaking" && "bg-secondary motion-safe:animate-pulse",
            voiceState === "thinking" && "bg-primary",
          )}
        />
        <p className="min-w-0 text-sm text-muted-foreground">{prompt}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={toggle} variant={listening ? "destructive" : "default"} className="min-h-11">
          {listening ? <Square className="size-4" aria-hidden /> : <Mic className="size-4" aria-hidden />}
          {listening ? "Stop recording" : "Speak your answer"}
        </Button>
        <Button onClick={playPrompt} variant="secondary" className="min-h-11">
          <Volume2 className="size-4" aria-hidden />
          Hear it
        </Button>
      </div>

      <p aria-live="polite" className="text-xs text-muted-foreground">
        {voiceState === "thinking" && (
          <span className="inline-flex items-center gap-1">
            <Loader2 className="size-3 animate-spin" aria-hidden /> Listening back to what you said…
          </span>
        )}
        {voiceState === "listening" && "Recording — take your time."}
        {voiceState === "speaking" && "Playing the model sentence."}
        {voiceState === "idle" && "Voice is a placeholder in this build; no audio is captured."}
      </p>

      {transcript && (
        <blockquote className="rounded-xl border border-border bg-surface p-4 text-sm">
          <span className="block text-xs uppercase tracking-wide text-muted-foreground">
            What we heard
          </span>
          {transcript}
        </blockquote>
      )}
    </div>
  );
}
