import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { BossRunner } from "@/components/mission/BossRunner";
import { characterService, queryKeys } from "@/services";
import { bossService } from "@/services/mission";
import type { BossOutcome, ReviewOption } from "@/types/mission";

export const Route = createFileRoute("/boss/$bossId")({
  head: () => ({
    meta: [
      { title: "Boss assessment — USAM for Kids" },
      {
        name: "description",
        content:
          "A transfer assessment: apply what you learned in an unfamiliar situation and defend your reasoning.",
      },
      { property: "og:title", content: "Boss assessment — USAM for Kids" },
      {
        property: "og:description",
        content: "Not a quiz. Three unfamiliar tasks that test whether the skill really transferred.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BossPage,
});

function BossPage() {
  const { bossId } = Route.useParams();
  const [outcome, setOutcome] = useState<BossOutcome | null>(null);
  const [chosenReview, setChosenReview] = useState<ReviewOption["mode"] | null>(null);

  const bossQuery = useQuery({
    queryKey: ["boss", bossId],
    queryFn: () => bossService.get(bossId),
  });
  const charactersQuery = useQuery({
    queryKey: queryKeys.characters,
    queryFn: characterService.list,
  });

  const gradeMutation = useMutation({
    mutationFn: (answers: Record<string, string>) => bossService.submit(bossId, answers),
    onSuccess: setOutcome,
  });

  return (
    <div className="space-y-6">
      <Link
        to="/missions"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden /> Back to missions
      </Link>

      <AsyncBoundary query={bossQuery} loadingLabel="Setting the table">
        {(boss) => (
          <BossRunner
            boss={boss}
            characters={charactersQuery.data ?? []}
            outcome={outcome}
            submitting={gradeMutation.isPending}
            onSubmit={(answers) => gradeMutation.mutate(answers)}
            onChooseReview={setChosenReview}
            chosenReview={chosenReview}
          />
        )}
      </AsyncBoundary>
    </div>
  );
}
