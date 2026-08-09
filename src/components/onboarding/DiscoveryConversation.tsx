import { useMemo, useState } from "react";
import { DialogueBubble, TypingIndicator } from "@/components/ai/Dialogue";
import { CharacterPortrait } from "@/components/character/CharacterPortrait";
import { VoiceOrb } from "@/components/voice/VoiceOrb";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { CAST, DISCOVERY_PROMPTS } from "@/data/onboarding";
import { cn } from "@/lib/utils";
import type { DiscoveryProfile, DiscoveryPrompt } from "@/types/onboarding";

/**
 * The discovery adventure.
 *
 * A conversation, not an assessment. Nothing is scored, every answer gets a
 * warm reply, and the child can skip any question without penalty.
 */
export function DiscoveryConversation({
  discovery,
  onAnswer,
  onFinished,
}: {
  discovery: DiscoveryProfile;
  onAnswer: (prompt: DiscoveryPrompt, value: string) => void;
  onFinished: () => void;
}) {
  const { p, fit } = useAgePresentation();
  const prompts = useMemo(
    () => (p.mode === "explorer" ? DISCOVERY_PROMPTS.slice(0, 8) : DISCOVERY_PROMPTS),
    [p.mode],
  );
  const [index, setIndex] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [lastReply, setLastReply] = useState<string | null>(null);

  const prompt = prompts[index]!;
  const asker = CAST.find((c) => c.role === prompt.askedByRole) ?? CAST[0]!;
  const question =
    p.mode === "explorer" && prompt.questionExplorer ? prompt.questionExplorer : prompt.question;
  const answered = discovery[prompt.signal]?.[0];

  function pick(optionId: string) {
    const option = prompt.options.find((o) => o.id === optionId)!;
    onAnswer(prompt, option.value);
    setThinking(true);
    setLastReply(null);
    window.setTimeout(() => {
      setThinking(false);
      setLastReply(option.reply);
      window.setTimeout(() => {
        setLastReply(null);
        if (index + 1 < prompts.length) setIndex((i) => i + 1);
        else onFinished();
      }, 900);
    }, 500);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,16rem)_1fr]">
      <aside className="surface-panel flex flex-col items-center gap-3 p-6 text-center">
        <CharacterPortrait
          character={{ id: asker.id, name: asker.name, accentColor: asker.accentColor }}
          expression={thinking ? "thinking" : lastReply ? "encouraging" : "listening"}
        />
        <div>
          <p className="font-display text-heading font-semibold">{asker.name}</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{asker.roleLabel}</p>
        </div>
        {p.showSecondaryMeta && (
          <p className="text-sm text-muted-foreground">{fit(asker.responsibility)}</p>
        )}
        <VoiceOrb state={thinking ? "thinking" : "listening"} size={56} />
        <p className="text-xs text-muted-foreground">Talk or tap — both work.</p>
      </aside>

      <div className="surface-panel flex min-h-[24rem] flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-raised">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((index + (answered ? 1 : 0)) / prompts.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {index + 1}/{prompts.length}
          </span>
        </div>

        <div className="flex-1 space-y-3">
          <DialogueBubble author="companion">{question}</DialogueBubble>
          {thinking && <TypingIndicator label={`${asker.name} is listening`} />}
          {lastReply && (
            <DialogueBubble author="companion" kind="reflection-prompt">
              {lastReply}
            </DialogueBubble>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {prompt.options.map((o) => (
            <button
              key={o.id}
              type="button"
              disabled={thinking || Boolean(lastReply)}
              onClick={() => pick(o.id)}
              className={cn(
                "interactive min-h-12 rounded-full border border-border bg-surface-raised px-5 text-sm disabled:opacity-50",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            className="text-muted-foreground underline-offset-4 hover:underline"
            onClick={() =>
              index + 1 < prompts.length ? setIndex((i) => i + 1) : onFinished()
            }
          >
            Skip this one
          </button>
          <p className="text-xs text-muted-foreground">
            No right answers. You can change any of this later.
          </p>
        </div>
      </div>
    </div>
  );
}
