import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import {
  AiConceptDetail,
  AiProgression,
  CompetencyBoard,
  PlaygroundCard,
  SessionGuard,
} from "@/components/ai/AiProgression";
import { aiKeys, aiLiteracyService } from "@/services/ai-literacy";
import { useExperience } from "@/state/experience";
import type { AiConceptId } from "@/types/ai-literacy";

export const Route = createFileRoute("/ai/")({
  head: () => ({
    meta: [
      { title: "AI Literacy World — USAM for Kids" },
      {
        name: "description",
        content:
          "Twenty-two concepts from what AI is through data, bias, privacy and agents — plus seven labs where children study AI systems instead of chatting with them.",
      },
      { property: "og:title", content: "AI Literacy World — USAM for Kids" },
      {
        property: "og:description",
        content:
          "AI literacy is not prompt engineering. Understand, use, evaluate, create, reflect, act responsibly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiWorldPage,
});

function AiWorldPage() {
  const { ageBand } = useExperience();
  const [conceptId, setConceptId] = useState<AiConceptId | null>(null);
  const pathwayQuery = useQuery({
    queryKey: aiKeys.pathway(ageBand),
    queryFn: () => aiLiteracyService.pathway(ageBand),
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="AI literacy world"
        title="Learn how these systems work"
        description="AI is the thing you're studying, not just the thing helping you. Prompting is one node out of twenty-two — it arrives after data, patterns, prediction and evaluation."
      />

      <AsyncBoundary query={pathwayQuery} loadingLabel="Opening the AI world">
        {(pathway) => {
          const selected =
            pathway.concepts.find((c) => c.id === (conceptId ?? pathway.currentConceptId)) ??
            pathway.concepts[0]!;
          return (
            <div className="space-y-10">
              <SessionGuard session={pathway.session} />

              <section className="space-y-4">
                <SectionHeading
                  title="What you're becoming able to do"
                  hint="Six competencies. Mastery is claimed here — not on topics covered."
                />
                <CompetencyBoard standings={pathway.competencies} />
              </section>

              <section className="space-y-4">
                <SectionHeading
                  title="The progression"
                  hint="Twenty-two concepts, always visible. Objectives are fixed; the framing follows your layer."
                />
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
                  <AiProgression
                    concepts={pathway.concepts}
                    ageBand={ageBand}
                    currentConceptId={pathway.currentConceptId}
                    selectedId={conceptId}
                    onSelect={setConceptId}
                  />
                  <AiConceptDetail concept={selected} ageBand={ageBand} />
                </div>
              </section>

              <section className="space-y-4">
                <SectionHeading
                  title="Playgrounds"
                  hint="Every lab runs the same seven moves: input, action, output, compare, evaluate, improve, reflect."
                />
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {pathway.playgrounds.map((playground) => (
                    <li key={playground.id}>
                      <PlaygroundCard playground={playground} ageBand={ageBand} />
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
