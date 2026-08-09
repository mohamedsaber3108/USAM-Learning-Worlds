import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, Swords } from "lucide-react";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { CharacterAvatar } from "@/components/character/CharacterAvatar";
import { MissionBriefing } from "@/components/mission/MissionBriefing";
import { StageRail } from "@/components/mission/StageRail";
import { ActivityRunner } from "@/components/mission/ActivityRunner";
import {
  EvidenceLedger,
  MasteryDecisionPanel,
  NextRecommendations,
  ReviewOptions,
  RewardPanel,
} from "@/components/mission/Completion";
import { Button } from "@/components/ui/button";
import { characterService, queryKeys } from "@/services";
import { missionRunService } from "@/services/mission";
import type {
  ActivityResponse,
  ActivityResult,
  EvidenceSignal,
  MissionCompletion,
  MissionStageKind,
  ReviewOption,
} from "@/types/mission";

export const Route = createFileRoute("/missions/$missionId")({
  head: () => ({
    meta: [
      { title: "Mission run — USAM for Kids" },
      {
        name: "description",
        content:
          "Story setup, objectives, guided practice, challenge, creation, reflection and an assessment backed by real evidence.",
      },
      { property: "og:title", content: "Mission run — USAM for Kids" },
      {
        property: "og:description",
        content: "An adventure with explicit learning objectives and evidence-backed completion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MissionRunPage,
});

function MissionRunPage() {
  const { missionId } = Route.useParams();
  const runQuery = useQuery({
    queryKey: ["mission-run", missionId],
    queryFn: () => missionRunService.get(missionId),
  });
  const activitiesQuery = useQuery({
    queryKey: ["mission-run", missionId, "activities"],
    queryFn: () => missionRunService.activities(missionId),
  });
  const charactersQuery = useQuery({ queryKey: queryKeys.characters, queryFn: characterService.list });

  return (
    <div className="space-y-6">
      <Link
        to="/missions"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden /> All missions
      </Link>

      <AsyncBoundary query={runQuery} loadingLabel="Opening the mission">
        {(run) => (
          <MissionRunExperience
            run={run}
            activities={activitiesQuery.data ?? []}
            characters={charactersQuery.data ?? []}
          />
        )}
      </AsyncBoundary>
    </div>
  );
}

type Run = NonNullable<Awaited<ReturnType<typeof missionRunService.get>>>;
type Activities = Awaited<ReturnType<typeof missionRunService.activities>>;
type Characters = Awaited<ReturnType<typeof characterService.list>>;

function MissionRunExperience({
  run,
  activities,
  characters,
}: {
  run: Run;
  activities: Activities;
  characters: Characters;
}) {
  const [stageIndex, setStageIndex] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<MissionStageKind>>(new Set());
  const [results, setResults] = useState<Record<string, ActivityResult>>({});
  const [evidence, setEvidence] = useState<EvidenceSignal[]>([]);
  const [completion, setCompletion] = useState<MissionCompletion | null>(null);
  const [chosenReview, setChosenReview] = useState<ReviewOption["mode"] | null>(null);

  const stage = run.stages[stageIndex]!;
  const guide = characters.find((c) => c.id === run.guideCharacterId);
  const narrator = characters.find((c) => c.id === stage.characterId) ?? guide;
  const stageActivities = useMemo(
    () => stage.activityIds.map((id) => activities.find((a) => a.id === id)).filter(Boolean),
    [stage, activities],
  );
  const reflection = useMemo(() => {
    const reflect = activities.find((a) => a.stage === "reflection");
    return reflect ? (results[reflect.id] ? reflect.title : null) : null;
  }, [activities, results]);

  const progress = completedStages.size / run.stages.length;

  const submitMutation = useMutation({
    mutationFn: ({ activityId, response }: { activityId: string; response: ActivityResponse }) =>
      missionRunService.submit(activityId, response),
    onSuccess: (result) => {
      setResults((prev) => ({ ...prev, [result.activityId]: result }));
      if (result.evidence.length) setEvidence((prev) => [...prev, ...result.evidence]);
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => missionRunService.complete(run.missionId, evidence, reflection),
    onSuccess: setCompletion,
  });

  const stageSatisfied =
    !stage.interactive ||
    stageActivities.every((a) => a && results[a.id] && !results[a.id]?.retryReason);

  const advance = () => {
    setCompletedStages((prev) => new Set(prev).add(stage.kind));
    const next = Math.min(stageIndex + 1, run.stages.length - 1);
    setStageIndex(next);
    const nextStage = run.stages[next];
    if (nextStage && nextStage.kind === "mastery-decision" && !completion) {
      completeMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <MissionBriefing run={run} {...(guide ? { guide } : {})} progress={progress} />

      <StageRail
        stages={run.stages}
        activeIndex={stageIndex}
        completed={completedStages}
        onSelect={setStageIndex}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          <section className="surface-panel space-y-3 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              {stage.purpose}
            </p>
            <h2 className="font-display text-2xl font-semibold">{stage.title}</h2>
            <div className="flex items-start gap-3">
              {narrator && <CharacterAvatar character={narrator} mood="explaining" size="sm" />}
              <p className="text-sm leading-relaxed text-muted-foreground">{stage.narration}</p>
            </div>
          </section>

          {stageActivities.map(
            (activity) =>
              activity && (
                <ActivityRunner
                  key={activity.id}
                  activity={activity}
                  characters={characters}
                  result={results[activity.id] ?? null}
                  submitting={submitMutation.isPending}
                  onSubmit={(response) =>
                    submitMutation.mutate({ activityId: activity.id, response })
                  }
                />
              ),
          )}

          {stage.kind === "mastery-decision" &&
            (completion ? (
              <MasteryDecisionPanel decisions={completion.masteryDecisions} />
            ) : (
              <p className="surface-panel p-5 text-sm text-muted-foreground">
                Reading through everything you did…
              </p>
            ))}

          {stage.kind === "reward" && completion && <RewardPanel completion={completion} />}

          {stage.kind === "next-recommendation" && completion && (
            <>
              <ReviewOptions
                options={completion.reviewOptions}
                onChoose={setChosenReview}
                chosen={chosenReview}
              />
              <NextRecommendations completion={completion} characters={characters} />
              {run.bossAssessmentId && (
                <Button asChild variant="secondary">
                  <Link to="/boss/$bossId" params={{ bossId: run.bossAssessmentId }}>
                    <Swords className="size-4" aria-hidden /> Face the boss assessment
                  </Link>
                </Button>
              )}
            </>
          )}

          {stageIndex < run.stages.length - 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {stageSatisfied
                  ? "This part is done."
                  : "Finish the work above before moving on — nothing is skipped here."}
              </p>
              <Button onClick={advance} disabled={!stageSatisfied}>
                Continue the mission
              </Button>
            </div>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <EvidenceLedger evidence={evidence} />
        </aside>
      </div>
    </div>
  );
}
