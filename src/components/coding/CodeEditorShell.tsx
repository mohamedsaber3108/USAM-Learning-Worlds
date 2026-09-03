import { useState } from "react";
import { Blocks, Lightbulb, Play, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useExperience } from "@/state/experience";
import { hintService } from "@/services";
import type { CodingExercise, ContextualHint } from "@/types/engines";

/**
 * Coding surface shell. The editor form follows the age adaptation layer
 * (blocks → blocks+script → editor) rather than any per-page branching.
 */
export function CodeEditorShell({ exercise }: { exercise: CodingExercise }) {
  const { adaptation } = useExperience();
  const [source, setSource] = useState(exercise.starter);
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [hints, setHints] = useState<ContextualHint[]>([]);
  const [revealed, setRevealed] = useState(0);

  const surface = adaptation.codingSurface;
  const blocksOnly = surface === "visual-blocks";

  async function run() {
    setRunning(true);
    setOutput(null);
    await new Promise((r) => setTimeout(r, 700));
    setOutput(
      blocksOnly
        ? "Rover ran the path and stopped at the flag."
        : exercise.checks.map((c) => `✓ ${c}`).join("\n"),
    );
    setRunning(false);
  }

  async function nextHint() {
    const list = hints.length ? hints : await hintService.list(exercise.id);
    setHints(list);
    setRevealed((n) => Math.min(n + 1, list.length));
  }

  return (
    <section className="surface-panel space-y-4 p-5 sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-display text-xl font-bold">{exercise.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{exercise.brief}</p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {blocksOnly ? (
            <Blocks className="me-1 size-3" aria-hidden />
          ) : (
            <TerminalSquare className="me-1 size-3" aria-hidden />
          )}
          {blocksOnly ? "Blocks" : exercise.language}
        </Badge>
      </div>

      {blocksOnly ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {exercise.blocks.map((block) => (
            <li
              key={block}
              className="rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3 text-sm font-semibold"
            >
              {block}
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-destructive/70" aria-hidden />
            <span className="size-2 rounded-full bg-primary/70" aria-hidden />
            <span className="size-2 rounded-full bg-secondary/70" aria-hidden />
            <span className="ms-2">main.{exercise.language === "python" ? "py" : "js"}</span>
          </div>
          <label className="sr-only" htmlFor="code-source">
            Code editor
          </label>
          <textarea
            id="code-source"
            value={source}
            spellCheck={false}
            onChange={(e) => setSource(e.target.value)}
            rows={10}
            className="w-full resize-y bg-background p-4 font-mono text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={run} disabled={running} className="min-h-11">
          <Play className="size-4" aria-hidden />
          {running ? "Running…" : "Run"}
        </Button>
        <Button variant="secondary" onClick={nextHint} className="min-h-11">
          <Lightbulb className="size-4" aria-hidden />
          Ask Azouz for a hint
        </Button>
      </div>

      {hints.slice(0, revealed).map((h) => (
        <p key={h.id} className="rounded-xl bg-surface p-4 text-sm">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Hint {h.level}
            {h.revealsAnswer ? " · reveals the fix" : ""}
          </span>
          <br />
          {h.text}
        </p>
      ))}

      <div aria-live="polite">
        {output && (
          <pre className="whitespace-pre-wrap rounded-xl border border-border bg-surface p-4 font-mono text-sm">
            {output}
          </pre>
        )}
      </div>

      <ul className="space-y-1 text-sm text-muted-foreground">
        {exercise.checks.map((c) => (
          <li key={c}>· {c}</li>
        ))}
      </ul>
    </section>
  );
}
