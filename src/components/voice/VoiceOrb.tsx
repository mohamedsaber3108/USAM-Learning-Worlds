import { Mic, MicOff, Pause, Square, Volume2 } from "lucide-react";
import { CHARACTER_EXPRESSIONS, VOICE_TO_EXPRESSION } from "@/design/character";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { VoiceState } from "@/types/domain";

/**
 * Voice interaction UI.
 *
 * Presentational only — no microphone access. A future voice service drives
 * exactly this `VoiceState`, so the visuals never need to change.
 */

export const VOICE_COPY: Record<VoiceState, string> = {
  idle: "Ready when you are",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking",
  paused: "Paused",
  error: "Voice unavailable — text still works",
  muted: "Muted",
  interrupted: "Go ahead",
};

export function VoiceOrb({
  state,
  size = 120,
  onToggle,
}: {
  state: VoiceState;
  size?: number;
  onToggle?: () => void;
}) {
  const { reducedMotion } = useAgePresentation();
  const spec = CHARACTER_EXPRESSIONS[VOICE_TO_EXPRESSION[state] ?? "idle"]!;
  const active = state === "listening" || state === "speaking";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={`Voice: ${VOICE_COPY[state]}`}
      className="interactive relative grid place-items-center rounded-full"
      style={{ width: size, height: size }}
    >
      {active && !reducedMotion && (
        <>
          <span className="absolute inset-0 rounded-full bg-primary/25 animate-pulse-ring" aria-hidden />
          <span
            className="absolute inset-2 rounded-full bg-primary/20 animate-pulse-ring"
            style={{ animationDelay: "0.5s" }}
            aria-hidden
          />
        </>
      )}
      <span
        className={cn(
          "grid size-full place-items-center rounded-full border-2 elevation-2",
          state === "error"
            ? "border-destructive bg-destructive/10"
            : active
              ? "border-primary bg-primary/15 elevation-glow"
              : "border-border bg-surface-raised",
        )}
      >
        {state === "speaking" ? (
          <VoiceWaveform bars={7} />
        ) : (
          <Icon
            as={state === "muted" ? MicOff : state === "paused" ? Pause : Mic}
            size="xl"
            className={active ? "text-primary" : "text-muted-foreground"}
          />
        )}
      </span>
      <span className="sr-only">{spec.meaning}</span>
    </button>
  );
}

export function VoiceWaveform({ bars = 5 }: { bars?: number }) {
  const { reducedMotion } = useAgePresentation();
  return (
    <span className="flex items-end gap-1" aria-hidden>
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className={cn("w-1.5 rounded-full bg-primary", !reducedMotion && "animate-think")}
          style={{ height: 10 + ((i * 7) % 22), animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </span>
  );
}

export function VoiceStatusBar({
  state,
  transcript,
  onSetState,
}: {
  state: VoiceState;
  transcript?: string | null;
  onSetState?: (state: VoiceState) => void;
}) {
  const { p } = useAgePresentation();
  return (
    <div className="surface-panel flex flex-wrap items-center gap-3 p-3">
      <span
        className={cn(
          "size-2.5 shrink-0 rounded-full",
          state === "error"
            ? "bg-destructive"
            : state === "idle" || state === "muted"
              ? "bg-muted-foreground"
              : "bg-success",
        )}
        aria-hidden
      />
      <p className="min-w-0 flex-1 truncate text-sm" aria-live="polite">
        {transcript ? `“${transcript}”` : VOICE_COPY[state]}
      </p>
      {p.voiceFirst && (
        <div className="flex gap-2">
          <VoiceAction
            icon={Mic}
            label="Talk"
            active={state === "listening"}
            onClick={() => onSetState?.(state === "listening" ? "idle" : "listening")}
          />
          <VoiceAction
            icon={Volume2}
            label="Replay"
            active={state === "speaking"}
            onClick={() => onSetState?.("speaking")}
          />
          <VoiceAction icon={Square} label="Stop" active={false} onClick={() => onSetState?.("idle")} />
        </div>
      )}
    </div>
  );
}

function VoiceAction({
  icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Mic;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "interactive grid min-h-11 min-w-11 place-items-center rounded-full border border-border",
        active ? "bg-primary text-primary-foreground" : "bg-surface-raised",
      )}
    >
      <Icon as={icon} size="sm" />
    </button>
  );
}
