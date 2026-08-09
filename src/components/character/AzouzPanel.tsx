import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Pause, Send, Sparkles, TriangleAlert } from "lucide-react";
import azouzArt from "@/assets/azouz.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useExperience } from "@/state/experience";
import type { AIMessage, VoiceState } from "@/types/domain";

const voiceCopy: Record<VoiceState, string> = {
  idle: "Ready when you are",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking",
  paused: "Paused",
  error: "Voice unavailable",
  muted: "Muted",
  interrupted: "Go ahead",
};

/**
 * Azouz — the recurring companion surface.
 * All behaviour here is presentational state only; a future AI backend drives
 * `CharacterState`, `AIConversation` and `VoiceSession` through the same props.
 */
export function AzouzPanel({
  messages,
  onSend,
  compact = false,
}: {
  messages: AIMessage[];
  onSend?: (text: string) => void;
  compact?: boolean;
}) {
  const { azouz, setVoiceState, adaptation } = useExperience();
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const voice = azouz.voiceState;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  return (
    <section
      aria-label="Azouz, your learning companion"
      className="surface-panel flex h-full flex-col overflow-hidden"
    >
      <header className="flex items-center gap-3 border-b border-border p-4">
        <AzouzPortrait size={compact ? 56 : 72} />
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-semibold">Azouz</h2>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={cn(
                "size-2 rounded-full",
                voice === "error"
                  ? "bg-destructive"
                  : voice === "idle"
                    ? "bg-muted-foreground"
                    : "bg-success",
              )}
              aria-hidden
            />
            {voiceCopy[voice]} · {adaptation.label} tone
          </p>
        </div>
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {voice === "thinking" && (
          <div className="flex gap-1 pl-1" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-2 rounded-full bg-primary animate-think"
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </div>
        )}
      </div>

      <footer className="space-y-3 border-t border-border p-4">
        <div className="flex flex-wrap gap-2">
          <VoiceButton
            active={voice === "listening"}
            onClick={() => setVoiceState(voice === "listening" ? "idle" : "listening")}
            icon={voice === "muted" ? MicOff : Mic}
            label={voice === "listening" ? "Stop listening" : "Talk to Azouz"}
          />
          <VoiceButton
            active={voice === "paused"}
            onClick={() => setVoiceState(voice === "paused" ? "idle" : "paused")}
            icon={Pause}
            label="Pause"
          />
          <VoiceButton
            active={voice === "muted"}
            onClick={() => setVoiceState(voice === "muted" ? "idle" : "muted")}
            icon={MicOff}
            label="Mute"
          />
        </div>
        {voice === "error" && (
          <p className="flex items-center gap-2 text-xs text-destructive">
            <TriangleAlert className="size-3.5" aria-hidden /> Voice is unavailable — text still
            works.
          </p>
        )}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            onSend?.(draft.trim());
            setDraft("");
          }}
        >
          <label className="sr-only" htmlFor="azouz-input">
            Message Azouz
          </label>
          <Input
            id="azouz-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask Azouz anything about your mission"
            className="min-h-11"
          />
          <Button type="submit" size="icon" className="min-h-11 min-w-11" aria-label="Send message">
            <Send className="size-4" aria-hidden />
          </Button>
        </form>
      </footer>
    </section>
  );
}

function VoiceButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Mic;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "secondary"}
      size="sm"
      className="min-h-11 gap-2"
      onClick={onClick}
      aria-pressed={active}
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </Button>
  );
}

function MessageBubble({ message }: { message: AIMessage }) {
  const isLearner = message.author === "learner";
  const kindLabel: Record<AIMessage["kind"], string | null> = {
    chat: null,
    hint: "Hint",
    explanation: "Explanation",
    "reflection-prompt": "Reflect",
    "safety-notice": "Safety",
  };
  const label = kindLabel[message.kind];
  return (
    <div className={cn("flex", isLearner ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm animate-rise",
          isLearner
            ? "bg-primary text-primary-foreground"
            : "bg-surface-raised text-foreground border border-border",
        )}
      >
        {label && (
          <span className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Sparkles className="size-3" aria-hidden />
            {label}
          </span>
        )}
        {message.text}
      </div>
    </div>
  );
}

export function AzouzPortrait({ size = 72, animate = true }: { size?: number; animate?: boolean }) {
  const { azouz } = useExperience();
  return (
    <span className="relative inline-grid shrink-0 place-items-center">
      {azouz.voiceState === "listening" && (
        <span aria-hidden className="absolute inset-0 rounded-full bg-primary/25 animate-pulse-ring" />
      )}
      <img
        src={azouzArt}
        alt="Azouz, your AI learning companion"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={cn(
          "rounded-full object-contain",
          animate && azouz.voiceState === "speaking" && "animate-float",
        )}
      />
    </span>
  );
}
