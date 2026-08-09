import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, CircleDot, Lock, Star, Users, Eye, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Creation,
  CreationStage,
  CreationStageMeta,
  CreationStatus,
  CreationVisibility,
  Studio,
} from "@/types/studio";
import type { AgeBand } from "@/types/domain";

const ACCENT: Record<Studio["accent"], string> = {
  primary: "bg-primary/15 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  accent: "bg-accent/15 text-accent",
};

export const STATUS_META: Record<CreationStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-surface-raised text-muted-foreground" },
  "in-progress": { label: "In progress", className: "bg-secondary/15 text-secondary" },
  completed: { label: "Completed", className: "bg-primary/15 text-primary" },
  featured: { label: "Featured", className: "bg-accent/20 text-accent" },
};

const VISIBILITY_META: Record<
  CreationVisibility,
  { label: string; icon: typeof Lock; note: string }
> = {
  private: { label: "Private", icon: Lock, note: "Only you" },
  family: { label: "Family", icon: Eye, note: "Shared at home" },
  mentor: { label: "Mentor", icon: MessageSquare, note: "For feedback" },
  community: { label: "Community", icon: Users, note: "Needs parent approval" },
};

export function StatusPill({ status }: { status: CreationStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        meta.className,
      )}
    >
      {status === "featured" && <Star className="size-3.5" aria-hidden />}
      {meta.label}
    </span>
  );
}

export function VisibilityPill({ visibility }: { visibility: CreationVisibility }) {
  const meta = VISIBILITY_META[visibility];
  const Icon = meta.icon;
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
      <Icon className="size-3.5" aria-hidden />
      {meta.label}
      <span className="sr-only"> — {meta.note}</span>
    </span>
  );
}

/** The nine-stage spine, always visible so the child sees where making sits. */
export function CreationFlowRail({
  stages,
  current,
  onSelect,
  compact = false,
}: {
  stages: CreationStageMeta[];
  current: CreationStage;
  onSelect?: (stage: CreationStage) => void;
  compact?: boolean;
}) {
  const currentIndex = stages.findIndex((s) => s.id === current);
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Creation flow">
      {stages.map((stage, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const content = (
          <>
            {done ? (
              <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
            ) : (
              <CircleDot className="size-3.5 shrink-0" aria-hidden />
            )}
            <span className="whitespace-nowrap">{stage.label}</span>
          </>
        );
        const className = cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          active
            ? "border-primary bg-primary/15 text-primary"
            : done
              ? "border-secondary/40 text-secondary"
              : "border-border text-muted-foreground",
          onSelect && "hover:border-primary/60 hover:text-foreground",
          compact && "px-2.5 py-1",
        );
        return (
          <li key={stage.id}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(stage.id)}
                className={className}
                aria-current={active ? "step" : undefined}
              >
                {content}
              </button>
            ) : (
              <span className={className} aria-current={active ? "step" : undefined}>
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function StudioCard({ studio, ageBand }: { studio: Studio; ageBand: AgeBand }) {
  return (
    <Link
      to="/create/$studioId"
      params={{ studioId: studio.id }}
      className="surface-panel interactive group flex h-full flex-col gap-3 p-5"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold">{studio.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{studio.tagline}</p>
        </div>
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-2xl text-sm font-semibold",
            ACCENT[studio.accent],
          )}
          aria-hidden
        >
          {studio.name.slice(0, 1)}
        </span>
      </div>

      <p className="text-sm text-foreground/80">{studio.medium.artifact}</p>

      <div className="rounded-xl bg-surface-raised/60 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Your workspace
        </p>
        <p className="mt-1 text-sm">{studio.medium.surface[ageBand]}</p>
      </div>

      <ul className="mt-auto flex flex-wrap gap-1.5">
        {studio.craftSkills.slice(0, 3).map((skill) => (
          <li
            key={skill}
            className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
          >
            {skill}
          </li>
        ))}
      </ul>

      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        Open the studio
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  );
}

export function CreationCard({
  creation,
  studioName,
  stages,
}: {
  creation: Creation;
  studioName: string;
  stages: CreationStageMeta[];
}) {
  const index = stages.findIndex((s) => s.id === creation.stage);
  return (
    <Link
      to="/create/$studioId"
      params={{ studioId: creation.studioId }}
      search={{ creation: creation.id }}
      className="surface-panel interactive flex h-full flex-col gap-3 p-5"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {studioName}
          </p>
          <h3 className="mt-1 font-display text-base font-semibold">{creation.title}</h3>
        </div>
        <StatusPill status={creation.status} />
      </div>
      <p className="text-sm text-muted-foreground">{creation.intent}</p>
      <div className="mt-auto space-y-2">
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${((index + 1) / stages.length) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>
            Stage {index + 1} of {stages.length} · {stages[index]?.label}
          </span>
          <VisibilityPill visibility={creation.visibility} />
        </div>
      </div>
    </Link>
  );
}

/**
 * Authorship ledger. Shown openly rather than buried: the point is that the
 * child can see how much of the work is theirs and say so out loud.
 */
export function AuthorshipLedger({
  ownMoves,
  assistedMoves,
}: {
  ownMoves: number;
  assistedMoves: number;
}) {
  const total = Math.max(ownMoves + assistedMoves, 1);
  const ownPct = Math.round((ownMoves / total) * 100);
  return (
    <div className="surface-panel p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold">Who did the work</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Every AI assist is logged next to your own moves. Nobody is grading this — it's so you
            can answer honestly when someone asks how you made it.
          </p>
        </div>
        <span className="shrink-0 font-display text-2xl font-bold text-primary">{ownPct}%</span>
      </div>
      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-surface-raised">
        <div className="h-full bg-primary" style={{ width: `${ownPct}%` }} />
        <div className="h-full bg-secondary/60" style={{ width: `${100 - ownPct}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>{ownMoves} decisions you made</span>
        <span>{assistedMoves} times you asked for help</span>
      </div>
    </div>
  );
}
