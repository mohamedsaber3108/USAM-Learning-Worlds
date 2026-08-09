import { useMemo, useState } from "react";
import { ArrowRight, Coins, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SIM_CURRENCY } from "@/data/venture";
import { ventureService } from "@/services/venture";
import type {
  SimDelta,
  SimMetricMeta,
  SimRun,
  SimState,
  VentureDecision,
  VentureLab,
  VentureScenario,
} from "@/types/venture";
import type { AgeBand } from "@/types/domain";

const ACCENT: Record<VentureLab["accent"], string> = {
  primary: "bg-primary/15 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  accent: "bg-accent/15 text-accent",
};

export function LabCard({ lab, ageBand }: { lab: VentureLab; ageBand: AgeBand }) {
  return (
    <article className="surface-panel flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold">{lab.name}</h3>
          <p className="text-sm text-muted-foreground">{lab.tagline}</p>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", ACCENT[lab.accent])}>
          {lab.kind === "pitch" ? "Stage" : "Sim"}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{lab.framing[ageBand]}</p>
      <div className="rounded-xl bg-surface-raised p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          You leave with
        </p>
        <p className="text-sm">{lab.output}</p>
      </div>
      <Link
        to="/venture/$labId"
        params={{ labId: lab.id }}
        className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        Open {lab.name}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}

function formatValue(metric: SimMetricMeta, value: number) {
  if (metric.id === "cash") return `${Math.round(value)} ${SIM_CURRENCY}`;
  if (metric.unit === "/100") return `${Math.round(value)}`;
  return `${Math.round(value)} ${metric.unit}`;
}

/** Eight coupled meters. Deltas are shown so cause and effect stay visible. */
export function SimDashboard({
  state,
  metrics,
  lastDelta,
}: {
  state: SimState;
  metrics: SimMetricMeta[];
  lastDelta?: SimDelta | undefined;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const value = state[metric.id];
        const delta = lastDelta?.[metric.id];
        const pct = Math.max(0, Math.min(100, (value / (metric.scale ?? 100)) * 100));
        const good = metric.direction === "lower-better" ? (delta ?? 0) < 0 : (delta ?? 0) > 0;
        return (
          <div key={metric.id} className="surface-panel p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {metric.label}
              </p>
              {delta != null && delta !== 0 && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
                    good ? "bg-secondary/15 text-secondary" : "bg-destructive/15 text-destructive",
                  )}
                >
                  {delta > 0 ? (
                    <TrendingUp className="size-3" aria-hidden />
                  ) : (
                    <TrendingDown className="size-3" aria-hidden />
                  )}
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
              )}
            </div>
            <p className="mt-1 font-display text-2xl font-semibold">{formatValue(metric, value)}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-raised">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  metric.direction === "lower-better" ? "bg-destructive/70" : "bg-primary",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{metric.description}</p>
          </div>
        );
      })}
    </div>
  );
}

/** The decision loop: choose, see the world move, read why. */
export function SimulationRunner({
  scenario,
  decisions,
  metrics,
  ageBand,
}: {
  scenario: VentureScenario;
  decisions: VentureDecision[];
  metrics: SimMetricMeta[];
  ageBand: AgeBand;
}) {
  const [run, setRun] = useState<SimRun>(() => ventureService.startRun(scenario.id));
  const [reflection, setReflection] = useState("");
  const variant = scenario.variants[ageBand];

  const current = useMemo(() => {
    const id = scenario.decisionIds[run.step];
    return decisions.find((d) => d.id === id) ?? null;
  }, [decisions, run.step, scenario.decisionIds]);

  const lastDelta = run.log.at(-1)?.effects;

  return (
    <div className="space-y-6">
      <section className="surface-panel space-y-2 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {variant.title}
        </p>
        <p className="text-sm text-muted-foreground">{variant.premise}</p>
        <p className="text-sm">
          <span className="font-medium">Doing well here means:</span> {variant.successLooksLike}
        </p>
        <p className="inline-flex items-center gap-2 rounded-full bg-surface-raised px-3 py-1 text-xs text-muted-foreground">
          <Coins className="size-3.5" aria-hidden />
          Sim Coins ({SIM_CURRENCY}) are pretend. No real money is involved anywhere here.
        </p>
      </section>

      <SimDashboard state={run.state} metrics={metrics} lastDelta={lastDelta} />

      {current ? (
        <section className="surface-panel space-y-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Decision {run.step + 1} of {scenario.decisionIds.length}
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold">{current.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{current.situation}</p>
            <p className="mt-2 text-sm font-medium">{current.question}</p>
          </div>
          <ul className="grid gap-3">
            {current.options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => setRun((prev) => ventureService.applyDecision(prev, current.id, option.id))}
                  className="w-full rounded-xl border border-border p-4 text-start transition-colors hover:border-primary/60 hover:bg-surface-raised"
                >
                  <p className="font-medium">{option.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{option.tradeoff}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Practises: {option.skills.join(", ")}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="surface-panel space-y-3 p-5">
          <h3 className="font-display text-xl font-semibold">Run complete — now the useful part</h3>
          {scenario.closingReflection.map((question) => (
            <p key={question} className="text-sm text-muted-foreground">
              • {question}
            </p>
          ))}
          <Textarea
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            placeholder="What would you do differently, and what would you need to know first?"
            rows={4}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setRun((prev) => ventureService.recordReflection(prev, reflection))}
              disabled={reflection.trim().length < 8}
            >
              Save reflection
            </Button>
            <Button variant="secondary" onClick={() => setRun(ventureService.startRun(scenario.id))}>
              Run it again differently
            </Button>
          </div>
          {run.reflection && (
            <p className="text-sm text-secondary">Saved. That reflection is what makes the run count.</p>
          )}
        </section>
      )}

      {run.log.length > 0 && (
        <section className="surface-panel space-y-3 p-5">
          <h3 className="font-display text-lg font-semibold">Decision ledger</h3>
          <ol className="space-y-3">
            {run.log.map((entry, index) => (
              <li key={`${entry.decisionId}-${index}`} className="rounded-xl bg-surface-raised p-4">
                <p className="text-sm font-medium">
                  {index + 1}. {entry.optionLabel}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{entry.consequence}</p>
                <p className="mt-2 inline-flex items-start gap-2 text-xs text-primary">
                  <Sparkles className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  {entry.teachingPoint}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
