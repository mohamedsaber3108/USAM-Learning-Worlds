import { Lightbulb, MessageCircle, ShieldCheck, Sparkles, BookOpen } from "lucide-react";
import type { ReactNode } from "react";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * AI dialogue visualisation.
 *
 * The learner must always be able to tell *what kind* of thing the AI just
 * said — a hint is not an explanation, and a safety notice is neither.
 */

export type DialogueKind =
  | "chat"
  | "hint"
  | "explanation"
  | "reflection-prompt"
  | "safety-notice";

const KIND_META: Record<
  DialogueKind,
  { label: string | null; icon: typeof Lightbulb; tone: string }
> = {
  chat: { label: null, icon: MessageCircle, tone: "" },
  hint: { label: "Hint", icon: Lightbulb, tone: "text-primary" },
  explanation: { label: "Explanation", icon: BookOpen, tone: "text-secondary" },
  "reflection-prompt": { label: "Reflect", icon: Sparkles, tone: "text-accent" },
  "safety-notice": { label: "Safety", icon: ShieldCheck, tone: "text-warning" },
};

export function DialogueBubble({
  author,
  kind = "chat",
  children,
}: {
  author: "learner" | "companion";
  kind?: DialogueKind;
  children: ReactNode;
}) {
  const isLearner = author === "learner";
  const meta = KIND_META[kind];
  return (
    <div className={cn("flex", isLearner ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm animate-rise",
          isLearner
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-surface-raised text-foreground",
          kind === "safety-notice" && "border-warning",
        )}
      >
        {meta.label && (
          <span
            className={cn(
              "mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide",
              meta.tone,
            )}
          >
            <Icon as={meta.icon} size="xs" />
            {meta.label}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

/** The "AI is composing" indicator, shared by every conversational surface. */
export function TypingIndicator({ label = "Azouz is thinking" }: { label?: string }) {
  return (
    <div className="flex items-center gap-1 pl-1" aria-live="polite" aria-label={label}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="size-2 rounded-full bg-primary animate-think"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}

/** Suggested replies — the main input affordance in the youngest mode. */
export function SuggestionChips({
  suggestions,
  onPick,
}: {
  suggestions: string[];
  onPick?: (value: string) => void;
}) {
  const { p } = useAgePresentation();
  const limit = p.mode === "explorer" ? 2 : p.mode === "creator" ? 3 : 4;
  return (
    <ul className="flex flex-wrap gap-2">
      {suggestions.slice(0, limit).map((s) => (
        <li key={s}>
          <button
            type="button"
            onClick={() => onPick?.(s)}
            className="interactive min-h-11 rounded-full border border-border bg-surface-raised px-4 text-sm"
          >
            {s}
          </button>
        </li>
      ))}
    </ul>
  );
}
