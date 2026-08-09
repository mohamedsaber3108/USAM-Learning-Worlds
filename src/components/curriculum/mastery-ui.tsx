import type { MasteryState, PathStatus } from "@/types/curriculum";
import { cn } from "@/lib/utils";

/**
 * Mastery and path vocabulary in one place.
 *
 * Learning state is never "done / not done". Each state carries a plain-language
 * meaning a child (or a mentor character) can say out loud.
 */
export const MASTERY_META: Record<
  MasteryState,
  { label: string; meaning: string; tone: string; dot: string; rank: number }
> = {
  introduced: {
    label: "Introduced",
    meaning: "You've met this. Nothing is expected yet.",
    tone: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
    rank: 0,
  },
  exploring: {
    label: "Exploring",
    meaning: "You're trying it out, making sense of what it is.",
    tone: "bg-secondary/10 text-secondary",
    dot: "bg-secondary/40",
    rank: 1,
  },
  practicing: {
    label: "Practicing",
    meaning: "You can do it with help nearby.",
    tone: "bg-secondary/15 text-secondary",
    dot: "bg-secondary/60",
    rank: 2,
  },
  developing: {
    label: "Developing",
    meaning: "Mostly on your own, still uneven.",
    tone: "bg-secondary/25 text-secondary",
    dot: "bg-secondary",
    rank: 3,
  },
  proficient: {
    label: "Proficient",
    meaning: "Reliable in familiar situations.",
    tone: "bg-primary/15 text-primary",
    dot: "bg-primary/70",
    rank: 4,
  },
  mastered: {
    label: "Mastered",
    meaning: "Holds up in situations you weren't taught in.",
    tone: "bg-primary/25 text-primary",
    dot: "bg-primary",
    rank: 5,
  },
  "needs-review": {
    label: "Needs review",
    meaning: "You had this. It's been a while.",
    tone: "bg-destructive/15 text-destructive",
    dot: "bg-destructive",
    rank: 3,
  },
};

export const MASTERY_ORDER: MasteryState[] = [
  "introduced",
  "exploring",
  "practicing",
  "developing",
  "proficient",
  "mastered",
  "needs-review",
];

export const PATH_META: Record<PathStatus, { label: string; meaning: string; tone: string }> = {
  "recommended-next": {
    label: "Recommended next",
    meaning: "The best next step, based on what you just did.",
    tone: "bg-primary text-primary-foreground",
  },
  available: {
    label: "Available",
    meaning: "Open now — you can start whenever you like.",
    tone: "bg-secondary/15 text-secondary",
  },
  locked: {
    label: "Locked by prerequisite",
    meaning: "Something earlier needs to be steadier first.",
    tone: "bg-muted text-muted-foreground",
  },
  "needs-review": {
    label: "Needs review",
    meaning: "A short revisit will bring this back.",
    tone: "bg-destructive/15 text-destructive",
  },
  "optional-challenge": {
    label: "Optional challenge",
    meaning: "Not required. Interesting if you want it.",
    tone: "bg-accent/20 text-accent",
  },
  "advanced-challenge": {
    label: "Advanced challenge",
    meaning: "Deliberately hard. Expect to struggle.",
    tone: "bg-accent/30 text-accent",
  },
};

export function MasteryBadge({ state, className }: { state: MasteryState; className?: string }) {
  const meta = MASTERY_META[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        meta.tone,
        className,
      )}
      title={meta.meaning}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}

export function PathBadge({ status, className }: { status: PathStatus; className?: string }) {
  const meta = PATH_META[status];
  return (
    <span
      className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", meta.tone, className)}
      title={meta.meaning}
    >
      {meta.label}
    </span>
  );
}

/** A ladder, not a percentage: where this skill sits and what comes next. */
export function MasteryLadder({ state }: { state: MasteryState }) {
  const steps: MasteryState[] = ["introduced", "exploring", "practicing", "developing", "proficient", "mastered"];
  const reviewing = state === "needs-review";
  const current = reviewing ? "developing" : state;
  const currentRank = MASTERY_META[current].rank;
  return (
    <ol className="flex items-center gap-1.5" aria-label={`Mastery: ${MASTERY_META[state].label}`}>
      {steps.map((step) => {
        const reached = MASTERY_META[step].rank <= currentRank;
        return (
          <li key={step} className="flex-1">
            <span
              className={cn(
                "block h-1.5 rounded-full transition-colors",
                reached ? (reviewing ? "bg-destructive/70" : "bg-primary") : "bg-muted",
              )}
            />
            <span className="mt-1.5 block text-[10px] uppercase tracking-wide text-muted-foreground">
              {MASTERY_META[step].label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function MasteryLegend() {
  return (
    <div className="surface-panel p-4">
      <h3 className="font-display text-sm font-semibold">What the states mean</h3>
      <dl className="mt-3 space-y-2.5">
        {MASTERY_ORDER.map((state) => (
          <div key={state} className="space-y-1">
            <dt>
              <MasteryBadge state={state} />
            </dt>
            <dd className="text-xs text-muted-foreground">{MASTERY_META[state].meaning}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
