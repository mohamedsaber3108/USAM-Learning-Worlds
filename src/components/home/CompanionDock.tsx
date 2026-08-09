import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { CharacterPortrait } from "@/components/character/CharacterPortrait";
import { DialogueBubble, SuggestionChips, TypingIndicator } from "@/components/ai/Dialogue";
import { VoiceOrb, VOICE_COPY } from "@/components/voice/VoiceOrb";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { cn } from "@/lib/utils";
import type { CompanionPresence } from "@/types/home";
import type { VoiceState } from "@/types/domain";

/**
 * Companion presence on the home world.
 *
 * The companion is *present*, not summoned: portrait, greeting, the child's
 * own standing intents, and state-derived suggestions that always explain
 * themselves. Text and voice are equal entry points — voice is placeholder
 * state only, no microphone is opened here.
 */

interface Turn {
  id: string;
  author: "learner" | "companion";
  text: string;
  kind?: "chat" | "hint" | "reflection-prompt";
}

/** Placeholder responder — a real AI service drives exactly this shape. */
function respondTo(input: string, companion: CompanionPresence): Turn {
  const q = input.toLowerCase();
  if (q.includes("next"))
    return {
      id: crypto.randomUUID(),
      author: "companion",
      kind: "hint",
      text: `${companion.contextualSuggestions[0]?.label ?? "Finish your current mission step"} — ${
        companion.contextualSuggestions[0]?.because ?? "it is one step from done."
      }`,
    };
  if (q.includes("build"))
    return {
      id: crypto.randomUUID(),
      author: "companion",
      text: "Then let's start from the thing you want people to see. What should it do first?",
    };
  if (q.includes("english") || q.includes("practice"))
    return {
      id: crypto.randomUUID(),
      author: "companion",
      text: "Lina is on the pier. Six minutes of describing out loud, then we stop — no test.",
    };
  if (q.includes("challenge"))
    return {
      id: crypto.randomUUID(),
      author: "companion",
      text: "There's a loop puzzle that beat two people today. Want it slightly hard or properly hard?",
    };
  if (q.includes("help"))
    return {
      id: crypto.randomUUID(),
      author: "companion",
      kind: "hint",
      text: "Tell me the part that stopped making sense. I'll ask you one question before I explain anything.",
    };
  return {
    id: crypto.randomUUID(),
    author: "companion",
    kind: "reflection-prompt",
    text: "Say more about that — what were you trying to make happen?",
  };
}

export function CompanionDock({ companion }: { companion: CompanionPresence }) {
  const { p, fit } = useAgePresentation();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [voice, setVoice] = useState<VoiceState>("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    setTurns((t) => [...t, { id: crypto.randomUUID(), author: "learner", text: value }]);
    setDraft("");
    setThinking(true);
    timers.current.push(
      window.setTimeout(() => {
        setThinking(false);
        setTurns((t) => [...t, respondTo(value, companion)]);
      }, 700),
    );
  }

  function toggleVoice() {
    setVoice((state) => {
      if (state === "idle") {
        timers.current.push(window.setTimeout(() => setVoice("thinking"), 1400));
        timers.current.push(window.setTimeout(() => setVoice("speaking"), 2600));
        timers.current.push(window.setTimeout(() => setVoice("idle"), 4600));
        return "listening";
      }
      return "idle";
    });
  }

  const hero = p.companionProminence === "hero";

  return (
    <section
      aria-label={`${companion.name}, your companion`}
      className="surface-panel flex flex-col gap-4 p-4 sm:p-5"
    >
      <div className="flex items-start gap-4">
        <CharacterPortrait
          character={{
            id: companion.characterId,
            name: companion.name,
            accentColor: companion.accentColor,
          }}
          expression={voice === "idle" ? companion.expression : (voice as never)}
          size={hero ? 96 : 64}
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-heading font-semibold">{companion.name}</h2>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{companion.role}</p>
          <p className="mt-2 text-sm text-foreground">{fit(companion.greeting)}</p>
        </div>
        {p.voiceFirst && (
          <div className="hidden shrink-0 flex-col items-center gap-1 sm:flex">
            <VoiceOrb state={voice} size={hero ? 96 : 72} onToggle={toggleVoice} />
            <span className="text-[11px] text-muted-foreground">{VOICE_COPY[voice]}</span>
          </div>
        )}
      </div>

      {turns.length > 0 && (
        <div className="max-h-64 space-y-2 overflow-y-auto pe-1">
          {turns.map((t) => (
            <DialogueBubble key={t.id} author={t.author} kind={t.kind ?? "chat"}>
              {t.text}
            </DialogueBubble>
          ))}
          {thinking && <TypingIndicator label={`${companion.name} is thinking`} />}
        </div>
      )}

      <div className="space-y-3">
        <SuggestionChips suggestions={companion.quickPrompts} onPick={send} />
        {p.showSecondaryMeta && companion.contextualSuggestions.length > 0 && (
          <ul className="space-y-1.5">
            {companion.contextualSuggestions.map((s) => (
              <li key={s.label} className="text-sm">
                <button
                  type="button"
                  onClick={() => send(s.label)}
                  className="text-start font-medium text-primary hover:underline"
                >
                  {s.label}
                </button>
                <span className="text-muted-foreground"> — {s.because}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <label className="sr-only" htmlFor="companion-input">
          Say something to {companion.name}
        </label>
        <input
          id="companion-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={p.mode === "explorer" ? "Say anything…" : `Ask ${companion.name} anything…`}
          className="min-h-11 flex-1 rounded-xl border border-border bg-surface-raised px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        {p.voiceFirst && (
          <div className="sm:hidden">
            <VoiceOrb state={voice} size={44} onToggle={toggleVoice} />
          </div>
        )}
        <button
          type="submit"
          className={cn(
            "interactive grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground",
            !draft.trim() && "opacity-60",
          )}
          aria-label="Send"
        >
          <Send className="size-4" aria-hidden />
        </button>
      </form>
    </section>
  );
}
