import { ArrowRight, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { MasteryBadge } from "@/components/curriculum/mastery-ui";
import type { AgeBand } from "@/types/domain";
import type { CodingConcept, CodingSurface } from "@/types/coding";

const SURFACE_META: Record<CodingSurface, { label: string; tone: string }> = {
  unplugged: { label: "Off screen", tone: "border-border bg-surface text-muted-foreground" },
  blocks: { label: "Blocks", tone: "border-secondary/40 bg-secondary/10 text-secondary" },
  "blocks-plus-text": { label: "Blocks + text", tone: "border-primary/40 bg-primary/10 text-primary" },
  text: { label: "Text", tone: "border-primary/50 bg-primary/15 text-primary" },
  project: { label: "Project", tone: "border-secondary/50 bg-secondary/15 text-secondary" },
};

/**
 * The eighteen-concept spine, in teaching order.
 *
 * Every concept is always visible. Age changes which ones are *core now* and
 * how each is framed — an eight-year-old can see that algorithms exist and are
 * waiting, which is the point.
 */
export function PathwayMap({
  concepts,
  ageBand,
  currentConceptId,
  selectedId,
  onSelect,
}: {
  concepts: CodingConcept[];
  ageBand: AgeBand;
  currentConceptId: string;
  selectedId?: string | null;
  onSelect?: (id: CodingConcept["id"]) => void;
}) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {concepts.map((concept, index) => {
        const framing = concept.framing[ageBand];
        const core = concept.coreFor.includes(ageBand);
        const active = selectedId === concept.id;
        const here = currentConceptId === concept.id;
        const surface = SURFACE_META[framing.surface];
        return (
          <li key={concept.id}>
            <button
              type="button"
              onClick={() => onSelect?.(concept.id)}
              aria-pressed={active}
              className={cn(
                "flex h-full w-full flex-col gap-2 rounded-xl border p-4 text-left transition-colors",
                active
                  ? "border-primary bg-primary/10"
                  : here
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-surface hover:border-primary/50",
                !core && "opacity-80",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="break-words font-display text-base font-semibold">{framing.title}</span>
                </span>
                <MasteryBadge state={concept.mastery} className="shrink-0" />
              </div>
              <p className="text-sm text-muted-foreground">{framing.summary}</p>
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs">
                <span className={cn("rounded-full border px-2 py-0.5 font-medium", surface.tone)}>
                  {surface.label}
                </span>
                {core ? (
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-medium text-primary">
                    Core now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Lock className="size-3" aria-hidden /> Later layer
                  </span>
                )}
                {here && <span className="text-primary">You're here</span>}
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** Detail for one concept: stable objective, age framing, prerequisites, evidence. */
export function ConceptDetail({
  concept,
  concepts,
  ageBand,
}: {
  concept: CodingConcept;
  concepts: CodingConcept[];
  ageBand: AgeBand;
}) {
  const framing = concept.framing[ageBand];
  const prereqs = concept.requires
    .map((id) => concepts.find((c) => c.id === id))
    .filter((c): c is CodingConcept => Boolean(c));

  return (
    <aside className="surface-panel space-y-4 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {framing.title}
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold">Objective</h3>
        <p className="text-sm text-muted-foreground">{concept.objective}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          The objective is the same at every age. Only the framing above changes.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold">What proves it</h4>
        <p className="text-sm text-muted-foreground">{framing.provesIt}</p>
      </div>

      {prereqs.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold">Builds on</h4>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {prereqs.map((p) => (
              <li
                key={p.id}
                className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted-foreground"
              >
                {p.framing[ageBand].title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold">Evidence so far</h4>
        {concept.evidence.length ? (
          <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
            {concept.evidence.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing yet. Mastery here moves when work shows it, not when a lab is opened.
          </p>
        )}
      </div>
    </aside>
  );
}

/** Adapter status board — honest about what runs today and what is a shell. */
export function AdapterBoard({ adapters }: { adapters: { id: string; label: string; language: string; status: string; note: string }[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {adapters.map((a) => (
        <li key={a.id} className="surface-panel space-y-1.5 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">{a.label}</span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium",
                a.status === "available"
                  ? "border-secondary/50 bg-secondary/10 text-secondary"
                  : "border-border bg-surface text-muted-foreground",
              )}
            >
              {a.status === "available" ? "Shell live" : "Adapter planned"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{a.language}</p>
          <p className="text-sm text-muted-foreground">{a.note}</p>
        </li>
      ))}
    </ul>
  );
}

/** Compact lab card used on the pathway page. */
export function LabCard({
  lab,
  ageBand,
}: {
  lab: { id: string; title: string; premise: string; minutes: number; conceptIds: string[]; instructions: Record<AgeBand, { goal: string }> };
  ageBand: AgeBand;
}) {
  return (
    <Link
      to="/code/$labId"
      params={{ labId: lab.id }}
      className="surface-panel flex h-full flex-col gap-2 p-4 transition-colors hover:border-primary"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-base font-semibold">{lab.title}</h3>
        <ArrowRight className="size-4 shrink-0 text-primary rtl:rotate-180" aria-hidden />
      </div>
      <p className="text-sm text-muted-foreground">{lab.premise}</p>
      <p className="text-sm">{lab.instructions[ageBand].goal}</p>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2 text-xs text-muted-foreground">
        <span>{lab.minutes} min</span>
        {lab.conceptIds.map((c) => (
          <span key={c} className="rounded-full border border-border px-2 py-0.5">
            {c.replace(/-/g, " ")}
          </span>
        ))}
      </div>
    </Link>
  );
}
