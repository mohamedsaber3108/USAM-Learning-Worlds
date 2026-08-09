import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { ChallengeCard } from "@/components/learning/Cards";
import { challengeService, queryKeys } from "@/services";
import { useExperience } from "@/state/experience";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "Challenges — USAM for Kids" },
      {
        name: "description",
        content: "Seasonal solo, team and head-to-head challenges that stretch real competencies.",
      },
      { property: "og:title", content: "Challenges — USAM for Kids" },
      {
        property: "og:description",
        content: "Challenges reward accuracy and reasoning, not speed alone.",
      },
    ],
  }),
  component: ChallengesPage,
});

function ChallengesPage() {
  const { adaptation } = useExperience();
  const challengesQuery = useQuery({ queryKey: queryKeys.challenges, queryFn: challengeService.list });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Challenges"
        title="Stretch what you know"
        description={`Filtered for the ${adaptation.label} layer. Challenges always target a named competency.`}
      />
      <AsyncBoundary query={challengesQuery} loadingLabel="Loading challenges">
        {(challenges) => {
          const forBand = challenges.filter((c) => c.ageBands.includes(adaptation.band));
          const others = challenges.filter((c) => !c.ageBands.includes(adaptation.band));
          return (
            <div className="space-y-8">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {forBand.map((c) => (
                  <ChallengeCard key={c.id} challenge={c} />
                ))}
              </div>
              {others.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-semibold text-muted-foreground">
                    Not matched to your layer yet
                  </h2>
                  <div className="grid gap-4 opacity-60 sm:grid-cols-2 xl:grid-cols-3">
                    {others.map((c) => (
                      <ChallengeCard key={c.id} challenge={c} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
