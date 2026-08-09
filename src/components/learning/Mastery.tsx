import { cn } from "@/lib/utils";
import type { MasteryState } from "@/types/domain";

export const masteryLabel: Record<MasteryState, string> = {
  "not-started": "Not started",
  introduced: "Introduced",
  practicing: "Practising",
  proficient: "Proficient",
  mastered: "Mastered",
  "needs-review": "Needs review",
};

const masteryTone: Record<MasteryState, string> = {
  "not-started": "bg-muted text-muted-foreground",
  introduced: "bg-secondary/20 text-secondary",
  practicing: "bg-primary/20 text-primary",
  proficient: "bg-success/20 text-success",
  mastered: "bg-success text-success-foreground",
  "needs-review": "bg-warning/20 text-warning",
};

export function MasteryBadge({ state }: { state: MasteryState }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        masteryTone[state],
      )}
    >
      {masteryLabel[state]}
    </span>
  );
}

/**
 * Mastery is shown as evidence-backed confidence, never as points.
 */
export function MasteryMeter({
  state,
  confidence,
  evidenceCount,
  label,
}: {
  state: MasteryState;
  confidence: number;
  evidenceCount: number;
  label: string;
}) {
  const pct = Math.round(confidence * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm font-medium">{label}</p>
        <MasteryBadge state={state} />
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} mastery confidence`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {pct}% confidence · {evidenceCount} pieces of evidence
      </p>
    </div>
  );
}
