import { Link } from "@tanstack/react-router";
import { CharacterPortrait } from "@/components/character/CharacterPortrait";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { cn } from "@/lib/utils";
import type { CastRef, HomeMoment } from "@/types/home";

/**
 * Moments — what just happened, delivered by whoever it belongs to.
 *
 * Nothing is celebrated anonymously and nothing is celebrated without
 * evidence: a moment either names what the learner proved or stays quiet.
 */
const TONE: Record<HomeMoment["kind"], string> = {
  "new-mission": "from-primary/18",
  "mission-completed": "from-success/18",
  "achievement-unlocked": "from-warning/18",
  "character-waiting": "from-accent/18",
  "new-project": "from-secondary/18",
  "returning-learner": "from-muted/25",
  "streak-milestone": "from-accent/16",
  "new-world-unlocked": "from-secondary/20",
};

export function MomentBanner({
  moment,
  cast,
}: {
  moment: HomeMoment;
  cast: Record<string, CastRef>;
}) {
  const { p, fit } = useAgePresentation();
  const who = cast[moment.characterId];
  return (
    <article
      className={cn(
        "surface-panel animate-rise flex gap-4 bg-gradient-to-r to-transparent p-4 sm:p-5",
        TONE[moment.kind],
      )}
    >
      <CharacterPortrait
        character={{
          id: moment.characterId,
          name: who?.name ?? "Guide",
          accentColor: who?.accentColor ?? "var(--color-primary)",
        }}
        expression={moment.kind === "mission-completed" ? "celebrating" : "excited"}
        presentation="avatar"
        size={p.mode === "explorer" ? 72 : 56}
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-heading font-semibold">{moment.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{fit(moment.body)}</p>
        {moment.evidence && p.showSecondaryMeta && (
          <p className="mt-2 text-xs text-muted-foreground">{moment.evidence}</p>
        )}
        {moment.action && (
          <Link
            to={moment.action.to}
            params={moment.action.params as never}
            className="interactive mt-3 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            {moment.action.label}
          </Link>
        )}
      </div>
    </article>
  );
}
