import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { Workbench } from "@/components/coding/Workbench";
import { codingKeys, codingService } from "@/services/coding";
import { useExperience } from "@/state/experience";

export const Route = createFileRoute("/code/$labId")({
  head: () => ({
    meta: [
      { title: "Coding lab — USAM for Kids" },
      {
        name: "description",
        content:
          "A full coding workbench: editor or blocks, console, output preview, checks, debugging and version history, with a mentor that asks questions instead of writing code.",
      },
      { property: "og:title", content: "Coding lab — USAM for Kids" },
      {
        property: "og:description",
        content: "Run it, read what happened, fix it yourself. The mentor won't type for you.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LabPage,
});

function LabPage() {
  const { labId } = Route.useParams();
  const { ageBand } = useExperience();

  const labQuery = useQuery({
    queryKey: codingKeys.lab(labId),
    queryFn: () => codingService.lab(labId),
  });
  const historyQuery = useQuery({
    queryKey: codingKeys.history(labId),
    queryFn: () => codingService.history(labId),
  });

  if (labQuery.isSuccess && labQuery.data === null) throw notFound();

  return (
    <div className="space-y-8">
      <Link
        to="/code"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to the pathway
      </Link>

      <AsyncBoundary query={labQuery} loadingLabel="Booting the runtime">
        {(lab) => (
          <div className="space-y-6">
            <PageHeader
              eyebrow={lab.conceptIds.map((c) => c.replace(/-/g, " ")).join(" · ")}
              title={lab.title}
              description={lab.premise}
            />
            <Workbench
              key={lab.id}
              lab={lab}
              ageBand={ageBand}
              initialHistory={historyQuery.data ?? []}
            />
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
