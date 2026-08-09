import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { MasteryBadge } from "@/components/curriculum/mastery-ui";
import type { AgeBand } from "@/types/domain";
import type { EnglishStrand, StrandEmphasis } from "@/types/english";

const EMPHASIS_META: Record<StrandEmphasis, { label: string; tone: string }> = {
  core: { label: "Core now", tone: "border-primary/50 bg-primary/10 text-primary" },
  supporting: {
    label: "Supporting",
    tone: "border-secondary/40 bg-secondary/10 text-secondary",
  },
  stretch: { label: "Stretch", tone: "border-border bg-surface text-muted-foreground" },
};

/**
 * The fourteen strands of English, always all visible.
 *
 * Age changes emphasis, never the list — a nine-year-old should be able to see
 * that presentation exists and is waiting for them.
 */
export function StrandBoard({
  strands,
  ageBand,
  selectedId,
  onSelect,
}: {
  strands: EnglishStrand[];
  ageBand: AgeBand;
  selectedId?: string | null;
  onSelect?: (id: EnglishStrand["id"]) => void;
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {strands.map((strand) => {
        const emphasis = EMPHASIS_META[strand.emphasis[ageBand]];
        const active = selectedId === strand.id;
        return (
          <li key={strand.id}>
            <button
              type="button"
              onClick={() => onSelect?.(strand.id)}
              aria-pressed={active}
              className={cn(
                "flex h-full w-full flex-col gap-2 rounded-xl border p-4 text-left transition-colors",
                active ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-primary/50",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-display text-base font-semibold">{strand.label}</span>
                <MasteryBadge state={strand.mastery} />
              </div>
              <p className="text-sm text-muted-foreground">{strand.description}</p>
              <div className="mt-auto space-y-2 pt-2">
                <ConfidenceBar value={strand.confidence} />
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span
                    className={cn("rounded-full border px-2 py-0.5 font-medium", emphasis.tone)}
                  >
                    {emphasis.label}
                  </span>
                  <span className="text-muted-foreground">
                    {strand.evidenceCount} pieces of evidence
                  </span>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Confidence is self-reported and shown separately from mastery, on purpose. */
export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>How confident you feel</span>
        <span>{pct}%</span>
      </div>
      <div
        role="img"
        aria-label={`Confidence ${pct} percent`}
        className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function StrandDetail({ strand, ageBand }: { strand: EnglishStrand; ageBand: AgeBand }) {
  return (
    <div className="surface-panel space-y-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold">{strand.label}</h3>
        <MasteryBadge state={strand.mastery} />
      </div>
      <p className="text-sm text-muted-foreground">{strand.description}</p>
      <p className="rounded-lg border border-border bg-surface p-3 text-sm">
        <span className="font-medium">Why it matters: </span>
        {strand.whyItMatters}
      </p>
      <p className="text-xs text-muted-foreground">
        At your age this strand is{" "}
        <span className="font-medium text-foreground">{EMPHASIS_META[strand.emphasis[ageBand]].label.toLowerCase()}</span>.
      </p>
    </div>
  );
}

export function glyphIcon(name: string): Icons.LucideIcon {
  return (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Circle;
}
