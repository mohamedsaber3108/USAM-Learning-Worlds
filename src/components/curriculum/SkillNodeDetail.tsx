import { useState } from "react";
import { CalendarClock, CheckCircle2, Link2, Lock, Target } from "lucide-react";
import type { AgeVariant, CurriculumNode } from "@/types/curriculum";
import { MasteryBadge, MasteryLadder, PATH_META, PathBadge } from "@/components/curriculum/mastery-ui";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { cn } from "@/lib/utils";

const AGES: AgeVariant["age"][] = [8, 10, 12, 14];

const SURFACE_LABEL: Record<AgeVariant["surface"], string> = {
  visual: "Visual",
  blocks: "Blocks",
  "blocks-and-script": "Blocks + script",
  code: "Code editor",
  conversation: "Conversation",
  studio: "Studio",
};

/**
 * A single skill, fully unpacked.
 *
 * The age switcher changes framing, challenge and working surface — never the
 * objectives, which stay visible and stable above it.
 */
export function SkillNodeDetail({
  node,
  allNodes,
  onSelect,
}: {
  node: CurriculumNode;
  allNodes: CurriculumNode[];
  onSelect: (id: string) => void;
}) {
  const { band } = useAgePresentation();
  const defaultAge: AgeVariant["age"] = band === "8-9" ? 8 : band === "10-11" ? 10 : 12;
  const [age, setAge] = useState<AgeVariant["age"]>(defaultAge);
  const variant = node.ageVariants.find((v) => v.age === age) ?? node.ageVariants[0];
  const byId = (id: string) => allNodes.find((n) => n.id === id);

  return (
    <div className="space-y-5">
      <header className="surface-panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold">{node.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{node.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <MasteryBadge state={node.mastery.state} />
            <PathBadge status={node.pathStatus} />
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">{PATH_META[node.pathStatus].meaning}</p>

        <div className="mt-4">
          <MasteryLadder state={node.mastery.state} />
        </div>

        <p className="mt-4 rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">{node.mastery.note}</p>

        <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
          <Stat label="Ages" value={`${node.ageRange.min}–${node.ageRange.max}`} />
          <Stat label="Evidence gathered" value={`${node.mastery.evidenceCount} demonstrations`} />
          <Stat
            label="Mastery threshold"
            value={`${node.masteryThreshold.demonstrations} demos${node.masteryThreshold.transferRequired ? " + transfer" : ""}`}
          />
        </dl>
      </header>

      {/* age adaptation */}
      <section className="surface-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold">Same objective, four ages</h3>
            <p className="text-sm text-muted-foreground">
              The learning target does not move. Framing, challenge and surface do.
            </p>
          </div>
          <div role="tablist" aria-label="Age presentation" className="flex rounded-full border border-border/70 p-1">
            {AGES.map((a) => (
              <button
                key={a}
                role="tab"
                aria-selected={a === age}
                type="button"
                onClick={() => setAge(a)}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-semibold transition-colors",
                  a === age ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                Age {a}
              </button>
            ))}
          </div>
        </div>

        {variant && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Said like this">{variant.framing}</Field>
            <Field label="Challenge at this age">{variant.challenge}</Field>
            <Field label="Working surface">{SURFACE_LABEL[variant.surface]}</Field>
            <Field label="Support level">{variant.supportLevel}</Field>
          </div>
        )}
      </section>

      <section className="surface-panel p-5">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Target className="size-4 text-primary" aria-hidden /> Learning objectives
        </h3>
        <ul className="mt-3 space-y-2">
          {node.objectives.map((o) => (
            <li key={o.id} className="rounded-xl border border-border/60 p-3">
              <p className="text-sm">{o.statement}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                {o.cognitiveLevel}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <ListPanel
          title="Activities"
          items={node.activities.map((a) => ({ id: a.id, primary: a.title, secondary: `${a.kind} · ${a.minutes} min` }))}
        />
        <ListPanel
          title="Practice"
          items={node.practice.map((p) => ({ id: p.id, primary: p.title, secondary: `${p.format} · ${p.itemCount} items` }))}
        />
        <ListPanel
          title="Projects"
          items={node.projects.map((p) => ({ id: p.id, primary: p.title, secondary: p.brief }))}
        />
        <section className="surface-panel p-5">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
            <CheckCircle2 className="size-4 text-primary" aria-hidden /> Assessment
          </h3>
          <p className="mt-3 text-sm font-semibold">{node.assessment.title}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">{node.assessment.kind}</p>
          <p className="mt-2 text-sm text-muted-foreground">{node.assessment.evidence}</p>
        </section>
      </div>

      <section className="surface-panel p-5">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
          <CalendarClock className="size-4 text-primary" aria-hidden /> Review schedule
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Spaced intervals: {node.reviewSchedule.intervalsDays.map((d) => `${d}d`).join(" → ")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Next review:{" "}
          {node.reviewSchedule.nextReviewAt
            ? new Date(node.reviewSchedule.nextReviewAt).toLocaleDateString()
            : "not scheduled yet"}
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <RelatedPanel
          title="Prerequisites"
          icon={<Lock className="size-4 text-muted-foreground" aria-hidden />}
          nodes={node.prerequisiteIds.map(byId)}
          emptyLabel="Nothing needs to come first."
          onSelect={onSelect}
        />
        <RelatedPanel
          title="Related skills"
          icon={<Link2 className="size-4 text-secondary" aria-hidden />}
          nodes={node.relatedIds.map(byId)}
          emptyLabel="No cross-links yet."
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 p-3">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{children}</p>
    </div>
  );
}

function ListPanel({
  title,
  items,
}: {
  title: string;
  items: { id: string; primary: string; secondary: string }[];
}) {
  return (
    <section className="surface-panel p-5">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-border/60 p-3">
            <p className="text-sm font-semibold">{item.primary}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.secondary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RelatedPanel({
  title,
  icon,
  nodes,
  emptyLabel,
  onSelect,
}: {
  title: string;
  icon: React.ReactNode;
  nodes: (CurriculumNode | undefined)[];
  emptyLabel: string;
  onSelect: (id: string) => void;
}) {
  const present = nodes.filter(Boolean) as CurriculumNode[];
  return (
    <section className="surface-panel p-5">
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
        {icon} {title}
      </h3>
      {present.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {present.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => onSelect(n.id)}
                className="w-full rounded-xl border border-border/60 p-3 text-start transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                <span className="block text-sm font-semibold">{n.name}</span>
                <span className="mt-1.5 inline-flex">
                  <MasteryBadge state={n.mastery.state} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
