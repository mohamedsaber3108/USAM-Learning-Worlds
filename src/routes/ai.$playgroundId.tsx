import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { ExperimentRunner } from "@/components/ai/ExperimentRunner";
import { MasteryBadge } from "@/components/curriculum/mastery-ui";
import { aiKeys, aiLiteracyService } from "@/services/ai-literacy";
import { useExperience } from "@/state/experience";

export const Route = createFileRoute("/ai/$playgroundId")({
  head: () => ({
    meta: [
      { title: "AI playground — USAM for Kids" },
      {
        name: "description",
        content:
          "Run a real AI experiment: state an input, choose the action, read the output, compare two runs, score against fixed criteria, improve one thing, and reflect.",
      },
      { property: "og:title", content: "AI playground — USAM for Kids" },
      {
        property: "og:description",
        content: "Not a chat window. A method for studying what these systems actually do.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlaygroundPage,
});

function PlaygroundPage() {
  const { playgroundId } = Route.useParams();
  const { ageBand } = useExperience();

  const query = useQuery({
    queryKey: aiKeys.playground(playgroundId),
    queryFn: () => aiLiteracyService.playground(playgroundId),
  });

  if (query.isSuccess && query.data === null) throw notFound();

  return (
    <div className="space-y-8">
      <Link
        to="/ai"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to the AI world
      </Link>

      <AsyncBoundary query={query} loadingLabel="Opening the lab">
        {({ playground, experiment, concepts }) => (
          <div className="space-y-8">
            <PageHeader
              eyebrow={playground.name}
              title={experiment.title}
              description={playground.purpose}
            />

            <ul className="flex flex-wrap gap-2">
              {concepts.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs"
                >
                  <span className="font-medium">{c.framing[ageBand].title}</span>
                  <MasteryBadge state={c.mastery} />
                </li>
              ))}
            </ul>

            <ExperimentRunner playground={playground} experiment={experiment} ageBand={ageBand} />
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
