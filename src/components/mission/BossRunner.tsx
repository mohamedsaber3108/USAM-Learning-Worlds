import { useState } from "react";
import { Crosshair, ShieldAlert, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CharacterAvatar } from "@/components/character/CharacterAvatar";
import { MASTERY_META } from "@/components/curriculum/mastery-ui";
import { ReviewOptions } from "@/components/mission/Completion";
import type { Character } from "@/types/domain";
import type { BossAssessment, BossOutcome, ReviewOption } from "@/types/mission";
import { cn } from "@/lib/utils";

const VERDICT_META: Record<BossOutcome["verdict"], { label: string; tone: string }> = {
  demonstrated: { label: "Demonstrated", tone: "bg-primary/15 text-primary" },
  "partially-demonstrated": { label: "Partly demonstrated", tone: "bg-secondary/15 text-secondary" },
  "not-yet": { label: "Not yet", tone: "bg-muted text-muted-foreground" },
};

/**
 * Boss assessment: transfer and defence, never recall.
 *
 * There are no hints here by design, and the support policy says so out loud
 * rather than leaving a child wondering why help disappeared.
 */
export function BossRunner({
  boss,
  characters,
  outcome,
  submitting,
  onSubmit,
  onChooseReview,
  chosenReview,
}: {
  boss: BossAssessment;
  characters: Character[];
  outcome: BossOutcome | null;
  submitting: boolean;
  onSubmit: (answers: Record<string, string>) => void;
  onChooseReview: (mode: ReviewOption["mode"]) => void;
  chosenReview: ReviewOption["mode"] | null;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const examiner = characters.find((c) => c.id === boss.examinerCharacterId);
  const allStarted = boss.tasks.every((t) => (answers[t.id] ?? "").trim().length > 0);

  return (
    <div className="space-y-6">
      <section className="surface-panel space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            <Swords className="size-3.5" aria-hidden /> Boss assessment
          </span>
          <span className="text-xs text-muted-foreground">about {boss.estimatedMinutes} minutes</span>
        </div>
        <h1 className="font-display text-3xl font-bold">{boss.title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{boss.premise}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What passing means here
            </p>
            <p className="mt-1 text-sm">{boss.passStandard}</p>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldAlert className="size-3.5" aria-hidden /> Support and retries
            </p>
            <p className="mt-1 text-sm">{boss.supportPolicy}</p>
            <p className="mt-1 text-xs text-muted-foreground">{boss.retryPolicy}</p>
          </div>
        </div>

        {examiner && (
          <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
            <CharacterAvatar character={examiner} mood="focused" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{examiner.name} is examining</p>
              <p className="text-xs text-muted-foreground">
                {boss.entryMet ? boss.entryRequirement + " — met." : "Locked: " + boss.entryRequirement}
              </p>
            </div>
          </div>
        )}
      </section>

      {boss.tasks.map((task, index) => (
        <article key={task.id} className="surface-panel space-y-4 p-5">
          <header className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-surface px-2.5 py-1 font-semibold">
                Task {index + 1}
              </span>
              <span className="capitalize text-muted-foreground">{task.kind}</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Crosshair className="size-3.5" aria-hidden />
                {task.transferDistance === "far" ? "far from where you learned it" : "close to home"}
              </span>
            </div>
            <h2 className="font-display text-xl font-semibold">{task.title}</h2>
            <p className="text-sm italic text-muted-foreground">{task.scenario}</p>
          </header>

          <p className="text-sm font-medium">{task.prompt}</p>

          <ul className="space-y-1 text-xs text-muted-foreground">
            {task.lookingFor.map((l) => (
              <li key={l}>· {l}</li>
            ))}
          </ul>

          <Textarea
            rows={5}
            value={answers[task.id] ?? ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [task.id]: e.target.value }))}
            placeholder="No hints here. Take your time."
            aria-label={task.title}
          />

          {outcome && (
            <p
              className={cn(
                "rounded-lg p-3 text-sm",
                outcome.perTask.find((t) => t.taskId === task.id)?.met
                  ? "bg-primary/10"
                  : "bg-secondary/10",
              )}
            >
              {outcome.perTask.find((t) => t.taskId === task.id)?.observation}
            </p>
          )}
        </article>
      ))}

      {!outcome && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {allStarted
              ? "All three answered. Send it when you're ready."
              : "Answer all three tasks before the table will look at it."}
          </p>
          <Button onClick={() => onSubmit(answers)} disabled={!allStarted || submitting}>
            {submitting ? "The table is reading…" : "Face the table"}
          </Button>
        </div>
      )}

      {outcome && (
        <>
          <section className="surface-panel space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-semibold",
                  VERDICT_META[outcome.verdict].tone,
                )}
              >
                {VERDICT_META[outcome.verdict].label}
              </span>
              <p className="text-sm text-muted-foreground">{outcome.summary}</p>
            </div>
            {outcome.masteryDecisions.map((d) => {
              const to = MASTERY_META[d.decidedState];
              return (
                <div key={d.objectiveId} className="rounded-xl bg-surface p-4">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs", to.tone)}>
                      {to.label}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{d.rationale}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{d.whatWouldStrengthenIt}</p>
                </div>
              );
            })}
            {outcome.evidence.length > 0 && (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {outcome.evidence.map((e) => (
                  <li key={e.id}>
                    Evidence — {e.statement} ({Math.round(e.confidence * 100)}% confidence)
                  </li>
                ))}
              </ul>
            )}
          </section>

          <ReviewOptions
            options={outcome.reviewOptions}
            onChoose={onChooseReview}
            chosen={chosenReview}
          />
        </>
      )}
    </div>
  );
}
