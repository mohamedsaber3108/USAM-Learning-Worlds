import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { AdapterBoard, ConceptDetail, LabCard, PathwayMap } from "@/components/coding/PathwayMap";
import { codingKeys, codingService } from "@/services/coding";
import { useExperience } from "@/state/experience";
import type { CodingConceptId } from "@/types/coding";

export const Route = createFileRoute("/code/")({
  head: () => ({
    meta: [
      { title: "Code Lab — USAM for Kids" },
      {
        name: "description",
        content:
          "A real computer-science pathway for ages 8–14: computational thinking through loops, functions, data and algorithms to Python, web, JavaScript and AI-assisted coding.",
      },
      { property: "og:title", content: "Code Lab — USAM for Kids" },
      {
        property: "og:description",
        content:
          "Eighteen concepts, one spine — blocks at eight, Python and code review at fourteen, with a mentor that refuses to write your code.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CodePathwayPage,
});

function CodePathwayPage() {
  const { ageBand } = useExperience();
  const [conceptId, setConceptId] = useState<CodingConceptId | null>(null);
  const pathwayQuery = useQuery({
    queryKey: codingKeys.pathway(ageBand),
    queryFn: () => codingService.pathway(ageBand),
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Coding pathway"
        title="Computer science, in order"
        description="One spine from computational thinking to AI-assisted development. Your age decides the surface — blocks, blocks-and-text, or a text editor — never the destination."
      />

      <AsyncBoundary query={pathwayQuery} loadingLabel="Opening the lab">
        {(snapshot) => {
          const selected =
            snapshot.concepts.find((c) => c.id === conceptId) ??
            snapshot.concepts.find((c) => c.id === snapshot.currentConceptId) ??
            null;
          const recommended = snapshot.labs.find((l) => l.id === snapshot.recommendation.labId);

          return (
            <>
              {recommended && (
                <Link
                  to="/code/$labId"
                  params={{ labId: recommended.id }}
                  className="surface-panel flex flex-wrap items-center gap-4 border-primary/40 bg-primary/5 p-5 transition-colors hover:border-primary"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Open next
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold">{recommended.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {snapshot.recommendation.because}
                    </p>
                  </div>
                  <ArrowRight className="size-5 text-primary" aria-hidden />
                </Link>
              )}

              <section className="space-y-4">
                <SectionHeading
                  title="The progression"
                  hint="All eighteen concepts, always visible. Objectives are fixed; the framing moves with you."
                />
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <PathwayMap
                    concepts={snapshot.concepts}
                    ageBand={ageBand}
                    currentConceptId={snapshot.currentConceptId}
                    selectedId={selected?.id ?? null}
                    onSelect={(id) => setConceptId(id)}
                  />
                  {selected && (
                    <ConceptDetail
                      concept={selected}
                      concepts={snapshot.concepts}
                      ageBand={ageBand}
                    />
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <SectionHeading title="Labs" hint="Where the concepts get used on something real." />
                <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {snapshot.labs.map((lab) => (
                    <li key={lab.id}>
                      <LabCard lab={lab} ageBand={ageBand} />
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                <SectionHeading
                  title="Runtimes"
                  hint="Each environment is an adapter behind one interface. The shells are built; the sandboxes slot in behind them."
                />
                <AdapterBoard adapters={snapshot.adapters} />
              </section>
            </>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
