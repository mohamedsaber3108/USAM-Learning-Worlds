import { useState } from "react";
import { FlaskConical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { Simulation } from "@/types/engines";

/** Sandbox / simulation shell — predict, adjust, run, reflect. */
export function SimulationPanel({ simulation }: { simulation: Simulation }) {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(simulation.variables.map((v) => [v.id, v.value])),
  );
  const [runs, setRuns] = useState(0);
  const [reflection, setReflection] = useState("");

  return (
    <section className="surface-panel space-y-5 p-5 sm:p-6">
      <div className="min-w-0">
        <h2 className="font-display text-xl font-bold">{simulation.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{simulation.scenario}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {simulation.variables.map((v) => (
          <div key={v.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor={`${simulation.id}-${v.id}`} className="font-medium">
                {v.label}
              </label>
              <span className="text-muted-foreground">
                {values[v.id]} {v.unit}
              </span>
            </div>
            <Slider
              id={`${simulation.id}-${v.id}`}
              min={v.min}
              max={v.max}
              value={[values[v.id] ?? v.value]}
              onValueChange={([next]) =>
                setValues((prev) => ({ ...prev, [v.id]: next ?? v.value }))
              }
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button className="min-h-11" onClick={() => setRuns((n) => n + 1)}>
          <FlaskConical className="size-4" aria-hidden />
          Run test
        </Button>
        <Button
          variant="ghost"
          className="min-h-11"
          onClick={() => {
            setValues(Object.fromEntries(simulation.variables.map((v) => [v.id, v.value])));
            setRuns(0);
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </Button>
        <span aria-live="polite" className="text-sm text-muted-foreground">
          {runs === 0 ? "Predict the result before your first run." : `${runs} run${runs > 1 ? "s" : ""} recorded`}
        </span>
      </div>

      <div>
        <h3 className="text-sm font-semibold">Success criteria</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {simulation.successCriteria.map((c) => (
            <li key={c}>· {c}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <label htmlFor={`${simulation.id}-reflect`} className="text-sm font-semibold">
          {simulation.reflectionPrompt}
        </label>
        <textarea
          id={`${simulation.id}-reflect`}
          rows={3}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Write what you noticed…"
          className="w-full rounded-xl border border-border bg-surface p-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </section>
  );
}
