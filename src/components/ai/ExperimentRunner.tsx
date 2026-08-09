import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Columns2,
  Lightbulb,
  Play,
  Scale,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { aiLiteracyService } from "@/services/ai-literacy";
import type {
  AiExperiment,
  AiPlayground,
  ExperimentOutput,
  ExperimentRun,
  ExperimentStep,
  OutputNote,
} from "@/types/ai-literacy";
import type { AgeBand } from "@/types/domain";

/**
 * The seven-move experiment loop.
 *
 * Deliberately not a chat window: you cannot reach "output" without stating an
 * input *and* choosing an action, and you cannot leave without comparing,
 * scoring against criteria written by the experiment, and reflecting. The
 * screen is a method, not a text box.
 */
const STEPS: { id: ExperimentStep; label: string; hint: string }[] = [
  { id: "input", label: "Input", hint: "What you're putting in" },
  { id: "action", label: "Model / action", hint: "What you're asking it to do" },
  { id: "output", label: "Output", hint: "What came back" },
  { id: "compare", label: "Compare", hint: "Against another run" },
  { id: "evaluate", label: "Evaluate", hint: "Against your criteria" },
  { id: "improve", label: "Improve", hint: "Change one thing" },
  { id: "reflect", label: "Reflect", hint: "What you learned about the system" },
];

const NOTE_META: Record<OutputNote["kind"], { label: string; tone: string; icon: typeof AlertTriangle }> = {
  hallucination: { label: "Possible invention", tone: "text-destructive", icon: AlertTriangle },
  bias: { label: "Bias signal", tone: "text-destructive", icon: Scale },
  privacy: { label: "Privacy", tone: "text-destructive", icon: ShieldAlert },
  copyright: { label: "Credit", tone: "text-primary", icon: Sparkles },
  uncertainty: { label: "Uncertainty", tone: "text-primary", icon: Lightbulb },
  strength: { label: "Strength", tone: "text-secondary", icon: Check },
};

export function ExperimentRunner({
  playground,
  experiment,
  ageBand,
}: {
  playground: AiPlayground;
  experiment: AiExperiment;
  ageBand: AgeBand;
}) {
  const framing = experiment.framing[ageBand];
  const [input, setInput] = useState(experiment.seeds[0]?.value ?? "");
  const [actionId, setActionId] = useState(experiment.actions[0]?.id ?? "");
  const [runs, setRuns] = useState<ExperimentRun[]>([]);
  const [running, setRunning] = useState(false);
  const [compareId, setCompareId] = useState<string | null>(null);
  const [improvement, setImprovement] = useState("");
  const [reflections, setReflections] = useState<Record<number, string>>({});

  const latest = runs[0] ?? null;
  const compareWith = useMemo(
    () => runs.find((r) => r.id === compareId) ?? runs[1] ?? null,
    [runs, compareId],
  );
  const budgetLeft = experiment.runBudget - runs.length;
  const scored = latest ? Object.keys(latest.scores).length === experiment.criteria.length : false;
  const reflected = experiment.reflectionPrompts.every((_, i) => (reflections[i] ?? "").trim().length > 8);

  const reached: Record<ExperimentStep, boolean> = {
    input: input.trim().length > 0,
    action: Boolean(actionId),
    output: Boolean(latest),
    compare: runs.length >= 2,
    evaluate: scored,
    improve: improvement.trim().length > 8,
    reflect: reflected,
  };

  async function run() {
    if (budgetLeft <= 0 || !input.trim()) return;
    setRunning(true);
    try {
      const result = await aiLiteracyService.runExperiment(experiment, input.trim(), actionId);
      setRuns((prev) => [result, ...prev]);
      setCompareId(null);
    } finally {
      setRunning(false);
    }
  }

  function score(criterionId: string, value: 1 | 2 | 3) {
    setRuns((prev) =>
      prev.map((r, i) => (i === 0 ? { ...r, scores: { ...r.scores, [criterionId]: value } } : r)),
    );
  }

  return (
    <div className="space-y-6">
      <StepRail reached={reached} />

      <div className="surface-panel space-y-2 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          The question
        </p>
        <h2 className="font-display text-xl font-semibold">{experiment.question}</h2>
        <p className="text-sm text-muted-foreground">{framing.brief}</p>
        <p className="text-sm">
          <span className="font-semibold">Watch for: </span>
          <span className="text-muted-foreground">{framing.watchFor}</span>
        </p>
        <p className="flex items-start gap-1.5 pt-1 text-xs text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-secondary" aria-hidden />
          {playground.guardrail}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="space-y-5">
          {/* 1 — input */}
          <section className="surface-panel space-y-3 p-5">
            <StepTitle n={1} label={experiment.inputLabel} />
            <div className="flex flex-wrap gap-2">
              {experiment.seeds.map((seed) => (
                <button
                  key={seed.id}
                  type="button"
                  onClick={() => setInput(seed.value)}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:border-primary/60"
                >
                  Start from: {seed.label}
                </button>
              ))}
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              placeholder={experiment.inputPlaceholder}
              aria-label={experiment.inputLabel}
            />
          </section>

          {/* 2 — model / action */}
          <section className="surface-panel space-y-3 p-5">
            <StepTitle n={2} label="Model / action" />
            <div className="grid gap-2 sm:grid-cols-2">
              {experiment.actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => setActionId(action.id)}
                  aria-pressed={actionId === action.id}
                  className={cn(
                    "rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-primary/60",
                    actionId === action.id && "border-primary",
                  )}
                >
                  <span className="block text-sm font-semibold">{action.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{action.describes}</span>
                  <span className="mt-1 block text-xs text-primary">Trade-off: {action.tradeoff}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={run} disabled={running || budgetLeft <= 0 || !input.trim()}>
                <Play className="size-4" aria-hidden />
                {running ? "Running" : "Run the experiment"}
              </Button>
              <p className="text-xs text-muted-foreground">
                {budgetLeft > 0
                  ? `${budgetLeft} runs left in this session.`
                  : "Run budget spent. Finish the evaluation and reflection with what you have."}
              </p>
            </div>
          </section>

          {/* 3 — output */}
          <section className="surface-panel space-y-3 p-5">
            <StepTitle n={3} label="Output" />
            {latest ? (
              <OutputView output={latest.output} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing yet. An output only means something next to the input that produced it.
              </p>
            )}
          </section>

          {/* 4 — compare */}
          <section className="surface-panel space-y-3 p-5">
            <StepTitle n={4} label="Compare" />
            {runs.length < 2 ? (
              <p className="text-sm text-muted-foreground">
                Run it a second time with exactly one thing changed. One difference, or the comparison
                proves nothing.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {runs.slice(1).map((r, i) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setCompareId(r.id)}
                      className={cn(
                        "rounded-full border border-border px-3 py-1 text-xs font-medium",
                        (compareWith?.id ?? "") === r.id && "border-primary text-primary",
                      )}
                    >
                      Run {runs.length - 1 - i}
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <RunColumn title="This run" run={latest} experiment={experiment} />
                  <RunColumn title="Earlier run" run={compareWith} experiment={experiment} />
                </div>
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Columns2 className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  If more than one thing changed between these, you learned nothing about which change
                  mattered.
                </p>
              </>
            )}
          </section>

          {/* 5 — evaluate */}
          <section className="surface-panel space-y-3 p-5">
            <StepTitle n={5} label="Evaluate" />
            <p className="text-xs text-muted-foreground">
              These criteria were fixed before you ran anything. That is what makes the score mean
              something.
            </p>
            <ul className="space-y-3">
              {experiment.criteria.map((c) => (
                <li key={c.id} className="rounded-xl border border-border p-3">
                  <p className="text-sm font-semibold">{c.label}</p>
                  <p className="text-xs text-muted-foreground">Strong: {c.strong}</p>
                  <p className="text-xs text-muted-foreground">Weak: {c.weak}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {([1, 2, 3] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        disabled={!latest}
                        onClick={() => score(c.id, v)}
                        aria-pressed={latest?.scores[c.id] === v}
                        className={cn(
                          "rounded-full border border-border px-3 py-1 text-xs font-medium disabled:opacity-50",
                          latest?.scores[c.id] === v && "border-primary text-primary",
                        )}
                      >
                        {v === 1 ? "Weak" : v === 2 ? "Partly" : "Strong"}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* 6 — improve */}
          <section className="surface-panel space-y-3 p-5">
            <StepTitle n={6} label="Improve" />
            <p className="text-xs text-muted-foreground">
              Name the single change you'd make next, and what you expect it to do. Predicting first
              is the whole method.
            </p>
            <Textarea
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              rows={3}
              placeholder="I'd change… because I expect…"
              aria-label="What you'd change next and why"
            />
          </section>

          {/* 7 — reflect */}
          <section className="surface-panel space-y-3 p-5">
            <StepTitle n={7} label="Reflect" />
            <p className="text-xs text-muted-foreground">
              About the system, not about the topic. This is where the learning lands.
            </p>
            {experiment.reflectionPrompts.map((prompt, i) => (
              <div key={prompt} className="space-y-1">
                <label className="text-sm font-medium" htmlFor={`reflect-${i}`}>
                  {prompt}
                </label>
                <Textarea
                  id={`reflect-${i}`}
                  rows={2}
                  value={reflections[i] ?? ""}
                  onChange={(e) => setReflections((prev) => ({ ...prev, [i]: e.target.value }))}
                />
              </div>
            ))}
            <div
              className={cn(
                "rounded-xl border p-3 text-sm",
                reflected && scored
                  ? "border-secondary/40 bg-secondary/10"
                  : "border-border text-muted-foreground",
              )}
            >
              {reflected && scored
                ? "This counts as evidence: criteria fixed first, two runs compared, a reason recorded."
                : "Evidence needs a scored output and a real reflection. Runs alone don't count."}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="surface-panel space-y-2 p-4">
            <h3 className="font-display text-base font-semibold">Why this lab exists</h3>
            <p className="text-sm text-muted-foreground">{playground.purpose}</p>
          </div>
          <div className="surface-panel space-y-2 p-4">
            <h3 className="font-display text-base font-semibold">Run history</h3>
            {runs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No runs yet.</p>
            ) : (
              <ol className="space-y-2">
                {runs.map((r, i) => (
                  <li key={r.id} className="rounded-xl border border-border p-2.5">
                    <p className="text-xs text-muted-foreground">
                      Run {runs.length - i} ·{" "}
                      {experiment.actions.find((a) => a.id === r.actionId)?.label ?? r.actionId}
                    </p>
                    <p className="line-clamp-2 text-sm">{r.input}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StepRail({ reached }: { reached: Record<ExperimentStep, boolean> }) {
  return (
    <ol className="flex flex-wrap gap-2">
      {STEPS.map((step, i) => (
        <li
          key={step.id}
          className={cn(
            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
            reached[step.id]
              ? "border-secondary/50 bg-secondary/10 text-secondary"
              : "border-border text-muted-foreground",
          )}
          title={step.hint}
        >
          <span className="tabular-nums">{i + 1}</span>
          <span className="font-semibold">{step.label}</span>
        </li>
      ))}
    </ol>
  );
}

function StepTitle({ n, label }: { n: number; label: string }) {
  return (
    <h3 className="flex items-baseline gap-2 font-display text-lg font-semibold">
      <span className="text-sm tabular-nums text-muted-foreground">{String(n).padStart(2, "0")}</span>
      {label}
    </h3>
  );
}

function RunColumn({
  title,
  run,
  experiment,
}: {
  title: string;
  run: ExperimentRun | null;
  experiment: AiExperiment;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      {run ? (
        <>
          <p className="mt-1 text-xs text-primary">
            {experiment.actions.find((a) => a.id === run.actionId)?.label ?? run.actionId}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{run.input}</p>
          <div className="mt-2">
            <OutputView output={run.output} compact />
          </div>
        </>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">Nothing to compare yet.</p>
      )}
    </div>
  );
}

/** One renderer per output modality, each carrying its teaching notes. */
export function OutputView({ output, compact }: { output: ExperimentOutput; compact?: boolean }) {
  return (
    <div className="space-y-3">
      {output.type === "text" && (
        <p className={cn("whitespace-pre-wrap text-sm", compact && "line-clamp-6")}>{output.body}</p>
      )}

      {output.type === "image" && (
        <div className="space-y-2">
          <div
            className="h-32 w-full rounded-xl border border-border"
            style={{
              background: `linear-gradient(135deg, ${output.palette.join(", ")})`,
            }}
            role="img"
            aria-label={output.caption}
          />
          <p className="text-sm text-muted-foreground">{output.caption}</p>
          <p className="text-xs text-muted-foreground">
            Placeholder render — the lab studies how image models behave, not how pretty they are.
          </p>
        </div>
      )}

      {output.type === "transcript" && (
        <div className="space-y-1">
          <p className="text-sm">“{output.heard}”</p>
          <p className="text-xs text-muted-foreground">
            Reported confidence {Math.round(output.confidence * 100)}% — confidence is not accuracy.
          </p>
        </div>
      )}

      {output.type === "judgement" && (
        <div className="space-y-1">
          <p className="text-sm font-semibold">{output.verdict}</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {output.reasons.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
      )}

      {output.type === "plan" && (
        <ol className="space-y-1.5">
          {output.steps.map((s, i) => (
            <li key={s.text} className="flex items-start gap-2 text-sm">
              <span className="tabular-nums text-muted-foreground">{i + 1}</span>
              <span>{s.text}</span>
              {s.needsHuman && (
                <span className="ms-auto shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                  Needs you
                </span>
              )}
            </li>
          ))}
        </ol>
      )}

      {!compact && output.notes.length > 0 && (
        <ul className="space-y-1.5">
          {output.notes.map((n) => {
            const meta = NOTE_META[n.kind];
            const Icon = meta.icon;
            return (
              <li key={n.text} className="flex items-start gap-2 text-xs">
                <Icon className={cn("mt-0.5 size-3.5 shrink-0", meta.tone)} aria-hidden />
                <span>
                  <span className={cn("font-semibold", meta.tone)}>{meta.label}: </span>
                  <span className="text-muted-foreground">{n.text}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
