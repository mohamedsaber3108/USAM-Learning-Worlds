import * as Icons from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CharacterAvatar } from "@/components/character/CharacterAvatar";
import { MASTERY_META } from "@/components/curriculum/mastery-ui";
import { evidenceKindLabel } from "@/services/mission";
import type { Character } from "@/types/domain";
import type {
  EvidenceSignal,
  MasteryDecision,
  MissionCompletion,
  ReviewOption,
} from "@/types/mission";
import { cn } from "@/lib/utils";

/** Running ledger of what the learner has actually demonstrated so far. */
export function EvidenceLedger({ evidence }: { evidence: EvidenceSignal[] }) {
  return (
    <section className="surface-panel space-y-3 p-5">
      <div>
        <h3 className="font-display text-lg font-semibold">Evidence so far</h3>
        <p className="text-xs text-muted-foreground">
          Completion is decided by this list, not by how many screens you passed.
        </p>
      </div>
      {evidence.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing recorded yet. Finish one piece of work and it will appear here.
        </p>
      ) : (
        <ul className="space-y-2">
          {evidence.map((e) => (
            <li key={e.id} className="rounded-lg bg-surface p-3">
              <p className="text-sm">{e.statement}</p>
              <p className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                <span>{evidenceKindLabel(e.kind)}</span>
                <span>confidence {Math.round(e.confidence * 100)}%</span>
                <span>{e.unassisted ? "unassisted" : "with help"}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function MasteryDecisionPanel({ decisions }: { decisions: MasteryDecision[] }) {
  return (
    <section className="surface-panel space-y-4 p-5">
      <div>
        <h3 className="font-display text-lg font-semibold">What the evidence supports</h3>
        <p className="text-xs text-muted-foreground">
          A mission can be finished and still not move a skill. That is not a failure state.
        </p>
      </div>
      {decisions.map((d) => {
        const from = MASTERY_META[d.previousState];
        const to = MASTERY_META[d.decidedState];
        const moved = d.previousState !== d.decidedState;
        return (
          <article key={d.objectiveId} className="space-y-2 rounded-xl bg-surface p-4">
            <p className="text-sm font-medium">{d.objectiveStatement}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={cn("rounded-full px-2 py-0.5", from.tone)}>{from.label}</span>
              <Icons.ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />
              <span className={cn("rounded-full px-2 py-0.5 font-semibold", to.tone)}>
                {to.label}
              </span>
              {!moved && <span className="text-muted-foreground">unchanged, on purpose</span>}
            </div>
            <p className="text-sm text-muted-foreground">{d.rationale}</p>
            <p className="text-xs text-muted-foreground">
              {d.sufficientEvidence ? "Backed by" : "Not yet enough:"} {d.evidence.length} piece
              {d.evidence.length === 1 ? "" : "s"} of evidence. {d.whatWouldStrengthenIt}
            </p>
          </article>
        );
      })}
    </section>
  );
}

export function RewardPanel({ completion }: { completion: MissionCompletion }) {
  return (
    <section className="surface-panel space-y-4 p-5">
      <div>
        <h3 className="font-display text-lg font-semibold">What you earned</h3>
        <p className="text-xs text-muted-foreground">
          Every reward here is attached to something you demonstrated.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {completion.rewardsEarned.map((r) => {
          const Icon =
            (Icons as unknown as Record<string, Icons.LucideIcon>)[r.glyph] ?? Icons.Award;
          return (
            <li key={r.id} className="flex items-start gap-3 rounded-xl bg-primary/10 p-4">
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {completion.rewardsWithheld.length > 0 && (
        <div className="space-y-2 rounded-xl border border-dashed border-border p-4">
          <p className="text-sm font-medium">Still locked, and why</p>
          {completion.rewardsWithheld.map(({ reward, missing }) => (
            <p key={reward.id} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{reward.name}</span> — needs {missing}.
            </p>
          ))}
        </div>
      )}
    </section>
  );
}

const REVIEW_ICON: Record<ReviewOption["mode"], keyof typeof Icons> = {
  "instant-review": "Rewind",
  "later-review": "CalendarClock",
  "spaced-review": "CalendarRange",
  "practice-again": "Repeat2",
  "challenge-again": "Flame",
};

export function ReviewOptions({
  options,
  onChoose,
  chosen,
}: {
  options: ReviewOption[];
  onChoose: (mode: ReviewOption["mode"]) => void;
  chosen: ReviewOption["mode"] | null;
}) {
  return (
    <section className="surface-panel space-y-3 p-5">
      <div>
        <h3 className="font-display text-lg font-semibold">Coming back to this</h3>
        <p className="text-xs text-muted-foreground">
          You pick. None of these expire and none of them are punishments.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => {
          const Icon =
            (Icons as unknown as Record<string, Icons.LucideIcon>)[REVIEW_ICON[o.mode]] ??
            Icons.Clock;
          const active = chosen === o.mode;
          return (
            <li key={o.mode}>
              <button
                type="button"
                onClick={() => onChoose(o.mode)}
                aria-pressed={active}
                className={cn(
                  "w-full rounded-xl border p-4 text-start transition-colors",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-surface-raised",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Icon className="size-4 text-secondary" aria-hidden />
                  {o.label}
                  {o.recommended && (
                    <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-medium text-secondary">
                      suggested
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{o.description}</span>
                <span className="mt-1.5 block text-[11px] text-muted-foreground">{o.reason}</span>
                {o.scheduledFor && (
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    First check-in {new Date(o.scheduledFor).toLocaleDateString()}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function NextRecommendations({
  completion,
  characters,
}: {
  completion: MissionCompletion;
  characters: Character[];
}) {
  return (
    <section className="surface-panel space-y-3 p-5">
      <div>
        <h3 className="font-display text-lg font-semibold">Where this goes next</h3>
        <p className="text-xs text-muted-foreground">
          Suggestions come with reasons. Stopping is on the list for a reason too.
        </p>
      </div>
      <ul className="space-y-3">
        {completion.nextRecommendations.map((rec) => {
          const character = characters.find((c) => c.id === rec.characterId);
          return (
            <li
              key={rec.id}
              className="grid gap-3 rounded-xl bg-surface p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
            >
              {character && <CharacterAvatar character={character} size="sm" mood="encouraging" />}
              <div className="min-w-0">
                <p className="text-sm font-semibold">{rec.title}</p>
                <p className="text-xs text-muted-foreground">{rec.reason}</p>
              </div>
              <Button asChild variant={rec.kind === "rest" ? "ghost" : "secondary"} size="sm">
                <Link to={rec.targetPath}>
                  {rec.kind === "rest" ? "Stop here" : "Go"}
                  <Icons.ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
