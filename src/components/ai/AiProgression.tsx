import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { MasteryBadge, MASTERY_META } from "@/components/curriculum/mastery-ui";
import { COMPETENCY_META } from "@/data/ai-literacy";
import { cn } from "@/lib/utils";
import type {
  AiConcept,
  AiConceptId,
  AiPathwaySnapshot,
  AiPlayground,
  CompetencyStanding,
} from "@/types/ai-literacy";
import type { AgeBand } from "@/types/domain";

/**
 * The twenty-two concept progression.
 *
 * Prompting sits at position eleven, on purpose: a learner walks through data,
 * patterns and prediction before they are handed a text box.
 */
export function AiProgression({
  concepts,
  ageBand,
  currentConceptId,
  selectedId,
  onSelect,
}: {
  concepts: AiConcept[];
  ageBand: AgeBand;
  currentConceptId: AiConceptId;
  selectedId: AiConceptId | null;
  onSelect: (id: AiConceptId) => void;
}) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {concepts.map((concept, index) => {
        const framing = concept.framing[ageBand];
        const core = concept.coreFor.includes(ageBand);
        const here = concept.id === currentConceptId;
        return (
          <li key={concept.id}>
            <button
              type="button"
              onClick={() => onSelect(concept.id)}
              aria-pressed={selectedId === concept.id}
              className={cn(
                "flex h-full w-full flex-col gap-2 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-primary/60",
                here && "border-primary/70 shadow-[0_0_0_1px_var(--color-primary)]",
                selectedId === concept.id && "border-primary",
              )}
            >
              <span className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="break-words font-display text-base font-semibold">
                    {framing.title}
                  </span>
                </span>
                <MasteryBadge state={concept.mastery} className="shrink-0" />
              </span>
              <span className="text-sm text-muted-foreground">{framing.summary}</span>
              <span className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                {concept.competencies.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-medium text-secondary"
                  >
                    {COMPETENCY_META[c].label}
                  </span>
                ))}
                {core ? (
                  <span className="rounded-full border border-primary/40 px-2 py-0.5 text-xs font-semibold text-primary">
                    Core now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="size-3" aria-hidden />
                    Later layer
                  </span>
                )}
                {here && <span className="text-xs text-primary">You're here</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** Detail for one concept: the stable objective plus the misconception it kills. */
export function AiConceptDetail({ concept, ageBand }: { concept: AiConcept; ageBand: AgeBand }) {
  const framing = concept.framing[ageBand];
  return (
    <aside className="surface-panel h-full space-y-4 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {framing.title}
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold">Objective</h3>
        <p className="text-sm text-muted-foreground">{concept.objective}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          The objective is identical at every age. Only the framing above moves.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold">What proves it</h4>
        <p className="text-sm text-muted-foreground">{framing.provesIt}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold">The question to ask the system</h4>
        <p className="text-sm text-muted-foreground">“{framing.askThis}”</p>
      </div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
        <h4 className="text-sm font-semibold text-destructive">Common misconception</h4>
        <p className="text-sm text-muted-foreground">{concept.misconception}</p>
      </div>

      {concept.requires.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold">Builds on</h4>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {concept.requires.map((r) => (
              <li key={r} className="rounded-full border border-border px-2 py-0.5 text-xs">
                {r.replace(/-/g, " ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {concept.evidence.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold">Evidence so far</h4>
          <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
            {concept.evidence.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

/** Six competencies. Mastery is claimed here, not on topic coverage. */
export function CompetencyBoard({ standings }: { standings: CompetencyStanding[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {standings.map((s) => (
        <li key={s.competency} className="surface-panel space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-base font-semibold">
              {COMPETENCY_META[s.competency].label}
            </h3>
            <MasteryBadge state={s.mastery} className="shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground">{COMPETENCY_META[s.competency].meaning}</p>
          <p className="text-sm">{s.shown}</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Next evidence: </span>
            {s.nextEvidence}
          </p>
          <p className="sr-only">{MASTERY_META[s.mastery].meaning}</p>
        </li>
      ))}
    </ul>
  );
}

/** Playground entry card. Purpose first, never "try the AI". */
export function PlaygroundCard({
  playground,
  ageBand,
}: {
  playground: AiPlayground;
  ageBand: AgeBand;
}) {
  const open = playground.availableFor.includes(ageBand) && playground.status === "available";
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold">{playground.name}</h3>
        {open ? (
          <ArrowRight className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
        ) : (
          <Lock className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </div>
      <p className="text-sm text-muted-foreground">{playground.purpose}</p>
      <p className="mt-auto flex items-start gap-1.5 pt-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-secondary" aria-hidden />
        {playground.guardrail}
      </p>
      {!open && (
        <p className="text-xs text-muted-foreground">
          Opens in a later layer — this one needs judgement you're still building.
        </p>
      )}
    </>
  );

  const className =
    "flex h-full flex-col gap-2 rounded-2xl border border-border bg-surface p-5 transition-colors";

  return open ? (
    <Link
      to="/ai/$playgroundId"
      params={{ playgroundId: playground.id }}
      className={cn(className, "hover:border-primary/60")}
    >
      {body}
    </Link>
  ) : (
    <div className={cn(className, "opacity-70")} aria-disabled>
      {body}
    </div>
  );
}

/** Session guardrail strip. AI time is capped by design, and the cap is visible. */
export function SessionGuard({ session }: { session: AiPathwaySnapshot["session"] }) {
  const pct = Math.min(100, Math.round((session.usedMinutes / session.capMinutes) * 100));
  return (
    <div className="surface-panel flex flex-wrap items-center gap-4 p-4">
      <ShieldCheck className="size-5 shrink-0 text-secondary" aria-hidden />
      <div className="min-w-48 flex-1">
        <p className="text-sm font-semibold">
          AI-assisted time today: {session.usedMinutes} of {session.capMinutes} minutes
        </p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {session.runsToday} experiment runs. Every run needs a question you're testing — the cap is
        the point, not a bug.
      </p>
    </div>
  );
}
