import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, MessageSquare, Play, ShieldCheck } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SimulationRunner } from "@/components/venture/SimulationRunner";
import { ventureKeys, ventureService } from "@/services/venture";
import { pitchCriteria, pitchSections } from "@/data/venture";
import { useExperience } from "@/state/experience";
import type { Pitch, PitchFeedback, PitchSectionId } from "@/types/venture";

export const Route = createFileRoute("/venture/$labId")({
  head: () => ({
    meta: [
      { title: "Venture Lab — USAM for Kids" },
      {
        name: "description",
        content:
          "Run a business simulation in Sim Coins, or build and rehearse a pitch with mock AI coaching and peer review structure.",
      },
      { property: "og:title", content: "Venture Lab — USAM for Kids" },
      {
        property: "og:description",
        content: "Decide, watch the trade-off, then say out loud why you chose it.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LabPage,
  errorComponent: ({ error }) => <div role="alert">{error.message}</div>,
  notFoundComponent: () => <div>That lab doesn't exist.</div>,
});

function LabPage() {
  const { labId } = Route.useParams();
  const { ageBand } = useExperience();
  const query = useQuery({ queryKey: ventureKeys.lab(labId), queryFn: () => ventureService.lab(labId) });

  if (query.isSuccess && query.data === null) throw notFound();

  return (
    <div className="space-y-8">
      <Link
        to="/venture"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All labs
      </Link>

      <AsyncBoundary query={query} loadingLabel="Opening the lab">
        {(snapshot) => (
          <div className="space-y-8">
            <PageHeader
              eyebrow="Entrepreneurship World"
              title={snapshot.lab.name}
              description={snapshot.lab.purpose}
            />
            <p className="surface-panel p-4 text-sm text-muted-foreground">
              {snapshot.lab.framing[ageBand]}
            </p>

            {snapshot.lab.kind === "pitch" ? (
              <PitchStage ageBand={ageBand} />
            ) : snapshot.scenarios[0] ? (
              <SimulationRunner
                scenario={snapshot.scenarios[0]}
                decisions={snapshot.decisions}
                metrics={snapshot.metrics}
                ageBand={ageBand}
              />
            ) : null}
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}

const emptySections = Object.fromEntries(pitchSections.map((s) => [s.id, ""])) as Record<
  PitchSectionId,
  string
>;

function PitchStage({ ageBand }: { ageBand: "8-9" | "10-11" | "12-14" }) {
  const [ventureName, setVentureName] = useState("");
  const [sections, setSections] = useState<Record<PitchSectionId, string>>(emptySections);
  const [feedback, setFeedback] = useState<PitchFeedback | null>(null);
  const [presenting, setPresenting] = useState(false);
  const [reflection, setReflection] = useState("");

  const pitch: Pitch = { id: "pitch-local", ventureName, sections, updatedAt: "now" };
  const totalSeconds = pitchSections.reduce((sum, s) => sum + s.seconds, 0);

  return (
    <div className="space-y-6">
      <section className="surface-panel space-y-4 p-5">
        <SectionHeading
          title="Pitch builder"
          hint={`Six answers, about ${totalSeconds} seconds on stage.`}
        />
        <Input
          value={ventureName}
          onChange={(event) => setVentureName(event.target.value)}
          placeholder="What's it called?"
        />
        <ol className="space-y-4">
          {pitchSections.map((section) => (
            <li key={section.id}>
              <label className="text-sm font-medium" htmlFor={`pitch-${section.id}`}>
                {section.label} — {section.question}
              </label>
              <p className="mb-1 text-xs text-muted-foreground">{section.hint[ageBand]}</p>
              <Textarea
                id={`pitch-${section.id}`}
                rows={2}
                value={sections[section.id]}
                onChange={(event) =>
                  setSections((prev) => ({ ...prev, [section.id]: event.target.value }))
                }
              />
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setPresenting((prev) => !prev)} variant="secondary">
            <Play className="size-4" aria-hidden />
            {presenting ? "Leave presentation mode" : "Presentation mode"}
          </Button>
          <Button onClick={() => void ventureService.pitchFeedback(pitch).then(setFeedback)}>
            <MessageSquare className="size-4" aria-hidden />
            Ask for coaching
          </Button>
        </div>
      </section>

      {presenting && (
        <section className="surface-panel space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Presentation mode — {ventureName || "Untitled venture"}
          </p>
          {pitchSections.map((section) => (
            <div key={section.id}>
              <p className="text-xs text-muted-foreground">
                {section.label} · {section.seconds}s
              </p>
              <p className="font-display text-xl">
                {sections[section.id] || <span className="text-muted-foreground">—</span>}
              </p>
            </div>
          ))}
        </section>
      )}

      {feedback && (
        <section className="surface-panel space-y-3 p-5">
          <SectionHeading title="Coaching (simulated)" hint={feedback.headline} />
          <p className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
            {feedback.band.replace("-", " ")}
          </p>
          <ul className="space-y-2">
            {feedback.notes.map((note, index) => (
              <li key={`${note.criterionId}-${index}`} className="rounded-xl bg-surface-raised p-3 text-sm">
                <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {note.kind}
                </span>
                <p>{note.body}</p>
              </li>
            ))}
          </ul>
          {feedback.missing.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Still unanswered: {feedback.missing.join(", ")}
            </p>
          )}
        </section>
      )}

      <section className="surface-panel space-y-3 p-5">
        <SectionHeading title="Peer feedback" hint="Structured, and gated behind an adult." />
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          Sharing a pitch with peers needs approval first. The review structure is ready: three
          reviewers, one strength, one question, one suggestion each.
        </p>
        <ul className="space-y-2">
          {pitchCriteria.map((criterion) => (
            <li key={criterion.id} className="rounded-xl bg-surface-raised p-3 text-sm">
              <p className="font-medium">{criterion.label}</p>
              <p className="text-muted-foreground">{criterion.strongLooksLike}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-panel space-y-3 p-5">
        <SectionHeading title="Reflection" hint="The pitch isn't finished until you've judged it." />
        <Textarea
          rows={3}
          value={reflection}
          onChange={(event) => setReflection(event.target.value)}
          placeholder="Which section was weakest, and what will you change before you say it again?"
        />
      </section>
    </div>
  );
}
