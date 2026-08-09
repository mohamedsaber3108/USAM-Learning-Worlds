import { useAgePresentation } from "@/design/AgePresentationProvider";
import { cn } from "@/lib/utils";

/**
 * Progress, skill and mission visualisation.
 *
 * Progress is expressed as *confidence and evidence*, never as a raw score.
 * Every visual has a text equivalent so it survives screen readers, RTL and
 * translated content of any length.
 */

const MASTERY_LABELS = [
  "Not started",
  "Exploring",
  "Practising",
  "Confident",
  "Mastered",
] as const;

export type MasteryLevel = 0 | 1 | 2 | 3 | 4;

export function ProgressRing({
  value,
  size = 96,
  label,
  caption,
  tone = "primary",
}: {
  /** 0–1. */
  value: number;
  size?: number;
  label: string;
  caption?: string;
  tone?: "primary" | "secondary" | "accent" | "success";
}) {
  const { reducedMotion } = useAgePresentation();
  const clamped = Math.min(1, Math.max(0, value));
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const stroke = `var(--color-${tone})`;
  return (
    <figure
      className="flex flex-col items-center gap-2"
      role="img"
      aria-label={`${label}: ${Math.round(clamped * 100)} percent`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{
            transition: reducedMotion
              ? undefined
              : "stroke-dashoffset var(--duration-slow) var(--ease-entrance)",
          }}
        />
      </svg>
      <figcaption className="text-center">
        <span className="block font-display text-heading font-semibold">
          {Math.round(clamped * 100)}%
        </span>
        <span className="block text-xs text-muted-foreground">{caption ?? label}</span>
      </figcaption>
    </figure>
  );
}

export function MasteryLadder({
  level,
  skill,
  evidenceCount = 0,
}: {
  level: MasteryLevel;
  skill: string;
  evidenceCount?: number;
}) {
  const { p } = useAgePresentation();
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-sm font-medium">{skill}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{MASTERY_LABELS[level]}</span>
      </div>
      <div
        className="flex gap-1.5"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={level}
        aria-valuetext={`${skill}: ${MASTERY_LABELS[level]}`}
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-2.5 flex-1 rounded-full transition-colors",
              i < level ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>
      {p.showSecondaryMeta && evidenceCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {evidenceCount} pieces of evidence collected
        </p>
      )}
    </div>
  );
}

export interface SkillNode {
  id: string;
  name: string;
  level: MasteryLevel;
  x: number;
  y: number;
  requires?: string[];
}

/** Skill constellation — a skill map that reads as a place, not a checklist. */
export function SkillConstellation({
  nodes,
  title,
}: {
  nodes: SkillNode[];
  title: string;
}) {
  const { reducedMotion } = useAgePresentation();
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return (
    <figure className="surface-panel p-4">
      <figcaption className="mb-3 font-display text-heading font-semibold">{title}</figcaption>
      <svg viewBox="0 0 240 140" className="w-full" role="img" aria-label={`${title} skill map`}>
        {nodes.flatMap((n) =>
          (n.requires ?? []).map((reqId) => {
            const from = byId.get(reqId);
            if (!from) return null;
            return (
              <line
                key={`${reqId}-${n.id}`}
                x1={from.x}
                y1={from.y}
                x2={n.x}
                y2={n.y}
                stroke="var(--color-border)"
                strokeWidth="2"
                strokeDasharray={n.level === 0 ? "4 4" : undefined}
              />
            );
          }),
        )}
        {nodes.map((n) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={n.level === 4 ? 11 : 8}
              fill={n.level === 0 ? "var(--color-surface-raised)" : "var(--color-primary)"}
              stroke="var(--color-border)"
              strokeWidth="2"
              opacity={n.level === 0 ? 0.7 : 1}
              className={cn(n.level === 4 && !reducedMotion && "animate-breathe")}
            />
            <text
              x={n.x}
              y={n.y + 26}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {n.name}
            </text>
          </g>
        ))}
      </svg>
      <ul className="sr-only">
        {nodes.map((n) => (
          <li key={n.id}>
            {n.name}: {MASTERY_LABELS[n.level]}
          </li>
        ))}
      </ul>
    </figure>
  );
}

export interface MissionStep {
  id: string;
  title: string;
  state: "locked" | "current" | "complete";
  kind: "learn" | "practice" | "build" | "reflect";
}

/** Mission track — the arc of a mission as a walkable path. */
export function MissionTrack({ steps, title }: { steps: MissionStep[]; title: string }) {
  const { p } = useAgePresentation();
  return (
    <section className="surface-panel p-4" aria-label={`${title} steps`}>
      <h3 className="mb-4 font-display text-heading font-semibold">{title}</h3>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={step.id} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
            <span
              className={cn(
                "grid size-8 place-items-center rounded-full border text-xs font-semibold",
                step.state === "complete" && "border-success bg-success text-background",
                step.state === "current" &&
                  "border-primary bg-primary text-primary-foreground elevation-glow",
                step.state === "locked" && "border-border text-muted-foreground",
              )}
              aria-hidden
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "truncate text-sm font-medium",
                  step.state === "locked" && "text-muted-foreground",
                )}
              >
                {step.title}
              </p>
              {p.showSecondaryMeta && (
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {step.kind} ·{" "}
                  {step.state === "complete"
                    ? "Done"
                    : step.state === "current"
                      ? "You are here"
                      : "Locked"}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
