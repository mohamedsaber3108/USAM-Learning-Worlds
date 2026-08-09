import { useState } from "react";
import {
  BookOpen,
  Bug,
  Compass,
  HelpCircle,
  Lightbulb,
  MessageCircleQuestion,
  Sparkle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { codingService } from "@/services/coding";
import type { MentorSupport, MentorSupportKind, RuntimeFault } from "@/types/coding";

const KINDS: { kind: MentorSupportKind; label: string; icon: LucideIcon; blurb: string }[] = [
  { kind: "hint", label: "Nudge me", icon: Lightbulb, blurb: "The smallest push that still leaves the thinking to you." },
  { kind: "debugging-question", label: "Ask me a question", icon: MessageCircleQuestion, blurb: "A question to answer with a test, not a guess." },
  { kind: "explanation", label: "Explain my code", icon: BookOpen, blurb: "What your program currently does — not what it should do." },
  { kind: "guided-correction", label: "Point at the area", icon: Compass, blurb: "Where to look. Never the edit itself." },
  { kind: "example", label: "Show a different example", icon: Sparkle, blurb: "The same shape on someone else's problem." },
  { kind: "concept-explanation", label: "Teach the concept", icon: HelpCircle, blurb: "Step off the lab and get the idea straight." },
  { kind: "reflection", label: "Reflect with me", icon: Bug, blurb: "What you tried, and what it taught you." },
];

/**
 * The AI mentor.
 *
 * Deliberately has no free-text "do it for me" path: the seven buttons are the
 * entire surface, and none of them produce the learner's answer. Agency is a
 * structural property here, not a prompt instruction.
 */
export function MentorPanel({
  labId,
  lastError,
}: {
  labId: string;
  lastError?: RuntimeFault | undefined;
}) {
  const [thread, setThread] = useState<MentorSupport[]>([]);
  const [pending, setPending] = useState<MentorSupportKind | null>(null);

  async function ask(kind: MentorSupportKind) {
    setPending(kind);
    const support = await codingService.support({
      labId,
      kind,
      used: thread.length,
      ...(lastError ? { lastError } : {}),
    });
    setThread((prev) => [...prev, support]);
    setPending(null);
  }

  return (
    <section className="surface-panel space-y-4 p-5" aria-label="AI mentor">
      <div>
        <h3 className="font-display text-lg font-semibold">Koda</h3>
        <p className="text-sm text-muted-foreground">
          Koda will not write your code. There is no button here that does that — on purpose.
        </p>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {KINDS.map(({ kind, label, icon: Icon, blurb }) => (
          <li key={kind}>
            <button
              type="button"
              className="flex h-full w-full items-start gap-2 rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-primary/60 disabled:opacity-60"
              disabled={pending !== null}
              onClick={() => ask(kind)}
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs text-muted-foreground">{blurb}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {pending && (
        <p role="status" className="text-sm text-muted-foreground">
          Koda is thinking…
        </p>
      )}

      {thread.length > 0 && (
        <ol className="space-y-3">
          {thread.map((item, i) => (
            <li key={`${item.kind}-${i}`} className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {item.kind.replace(/-/g, " ")}
                {item.exampleOf ? ` · ${item.exampleOf}` : ""}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{item.body}</p>
              {item.askBack && (
                <p className="mt-2 border-s-2 border-primary/50 ps-3 text-sm text-muted-foreground">
                  {item.askBack}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}

      {thread.length >= 3 && (
        <p className="text-xs text-muted-foreground">
          Three asks in. The next thing that moves you forward is probably a run, not a question.
        </p>
      )}
    </section>
  );
}
