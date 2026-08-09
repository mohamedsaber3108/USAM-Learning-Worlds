import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Repeat2 } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { assessmentService, practiceService, queryKeys } from "@/services";
import { objectives as allObjectives } from "@/data/mock";

const reasonCopy = {
  "spaced-review": "Scheduled review — this is fading",
  "shaky-mastery": "Confidence dipped after your last attempt",
  "pre-assessment": "Warm-up before an assessment",
} as const;

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice & Assessment — USAM for Kids" },
      {
        name: "description",
        content:
          "Spaced retrieval practice and assessments driven by mastery evidence, not streaks.",
      },
      { property: "og:title", content: "Practice & Assessment — USAM for Kids" },
      {
        property: "og:description",
        content: "Short, targeted practice sets scheduled by the adaptive engine.",
      },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const practicesQuery = useQuery({ queryKey: queryKeys.practices, queryFn: practiceService.listDue });
  const assessmentsQuery = useQuery({
    queryKey: queryKeys.assessments,
    queryFn: assessmentService.list,
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Practice"
        title="Practice that targets what's fading"
        description="Practice sets are scheduled from mastery confidence and time since last retrieval."
      />

      <section className="space-y-3">
        <SectionHeading title="Due today" />
        <AsyncBoundary
          query={practicesQuery}
          loadingLabel="Checking your review schedule"
          emptyTitle="Nothing due"
          emptyDescription="You're up to date. New reviews appear as mastery decays."
        >
          {(practices) => (
            <ul className="grid gap-3 sm:grid-cols-2">
              {practices.map((p) => (
                <li key={p.id} className="surface-panel p-5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                    <Repeat2 className="size-3.5" aria-hidden /> {reasonCopy[p.reason]}
                  </p>
                  <h3 className="mt-1.5 font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {allObjectives.find((o) => o.id === p.objectiveId)?.statement}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{p.itemCount} items</p>
                </li>
              ))}
            </ul>
          )}
        </AsyncBoundary>
      </section>

      <section className="space-y-3">
        <SectionHeading title="Assessments" hint="Formative, performance and portfolio reviews." />
        <AsyncBoundary query={assessmentsQuery} loadingLabel="Loading assessments">
          {(assessments) => (
            <ul className="space-y-3">
              {assessments.map((a) => (
                <li
                  key={a.id}
                  className="surface-panel grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {a.kind.replace("-", " ")} · {a.objectiveIds.length} objectives
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface-raised px-3 py-1 text-xs font-semibold capitalize">
                    {a.score != null ? `${Math.round(a.score * 100)}%` : a.status.replace("-", " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AsyncBoundary>
      </section>
    </div>
  );
}
