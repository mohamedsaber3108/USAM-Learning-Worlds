import { Link } from "@tanstack/react-router";
import { Award, Compass, Map as MapIcon, Sparkles } from "lucide-react";
import { CharacterPortrait } from "@/components/character/CharacterPortrait";
import { RelationshipPanel } from "@/components/character/RelationshipPanel";
import { AvatarPreview } from "@/components/onboarding/AvatarPreview";
import { WorldIllustration } from "@/components/world/WorldIllustration";
import { MissionTrack, type MissionStep } from "@/components/viz/Progress";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { cn } from "@/lib/utils";
import type { OnboardingOutcome } from "@/types/onboarding";

const STATE_LABEL: Record<string, string> = {
  "not-started": "Not started",
  introduced: "Introduced",
  practicing: "Practising",
  proficient: "Proficient",
  mastered: "Mastered",
  "needs-review": "Needs review",
};

/**
 * End of onboarding.
 *
 * The last screen is a destination, not a receipt: a world, a mission, a map
 * and a reason to go there — plus the first achievement, tied to evidence.
 */
export function OnboardingComplete({ outcome }: { outcome: OnboardingOutcome }) {
  const { fit } = useAgePresentation();
  const steps: MissionStep[] = outcome.mission.steps.map((s, i) => ({
    id: s.id,
    title: s.label,
    state: i === 0 ? "current" : "locked",
    kind: s.kind === "make" ? "build" : s.kind,
  }));

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border">
        <div className="absolute inset-0 -z-10">
          <WorldIllustration
            scene={{ biome: outcome.world.biome, label: outcome.world.name, accent: "" }}
          />
        </div>
        <div className="flex flex-col gap-6 bg-gradient-to-t from-background via-background/85 to-transparent p-6 sm:flex-row sm:items-end sm:p-10">
          <AvatarPreview config={outcome.character.avatar} size={132} />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {outcome.world.name}
            </p>
            <h2 className="font-display text-display font-semibold">
              Welcome in, {outcome.character.nickname}.
            </h2>
            <p className="max-w-lg text-muted-foreground">{fit(outcome.world.description)}</p>
          </div>
          <CharacterPortrait
            character={{ id: outcome.companionId, name: "Azouz" }}
            expression="celebrating"
            className="sm:ms-auto"
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="surface-panel space-y-2 p-5">
            <h3 className="flex items-center gap-2 font-display text-heading font-semibold">
              <Compass className="size-4 text-primary" aria-hidden />
              Your first mission
            </h3>
            <p className="text-sm text-muted-foreground">{outcome.mission.purpose}</p>
          </div>
          <MissionTrack steps={steps} title={outcome.mission.title} />
        </div>

        <div className="space-y-4">
          <section className="surface-panel space-y-3 p-5">
            <h3 className="flex items-center gap-2 font-display text-heading font-semibold">
              <MapIcon className="size-4 text-secondary" aria-hidden />
              Your starting learning map
            </h3>
            <ul className="space-y-2">
              {outcome.learningMap.map((node) => (
                <li key={node.domainId} className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{node.label}</span>
                    <span className="block text-xs text-muted-foreground">{fit(node.reason)}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px]",
                      node.state === "not-started"
                        ? "border-border text-muted-foreground"
                        : "border-primary text-primary",
                    )}
                  >
                    {STATE_LABEL[node.state]}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-panel space-y-3 p-5">
            <h3 className="flex items-center gap-2 font-display text-heading font-semibold">
              <Sparkles className="size-4 text-accent" aria-hidden />
              Where to go next
            </h3>
            <ul className="space-y-2">
              {outcome.recommendations.map((rec) => (
                <li key={rec.id}>
                  <Link
                    to={rec.to}
                    className="interactive block rounded-[var(--radius)] border border-border bg-surface-raised p-3"
                  >
                    <span className="block text-sm font-medium">{rec.title}</span>
                    <span className="block text-xs text-muted-foreground">{rec.reason}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-panel flex items-start gap-3 border-primary p-5">
            <Award className="mt-0.5 size-5 text-primary" aria-hidden />
            <div>
              <h3 className="font-display text-heading font-semibold">
                First achievement: {outcome.achievement.title}
              </h3>
              <p className="text-sm text-muted-foreground">{outcome.achievement.evidence}</p>
            </div>
          </section>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="font-display text-heading font-semibold">Who you know so far</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {outcome.relationships.slice(0, 4).map((rel) => (
            <RelationshipPanel key={rel.characterId} relationship={rel} compact />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/missions"
          className="interactive inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-medium text-primary-foreground"
        >
          Go to my mission
        </Link>
        <Link
          to="/"
          className="interactive inline-flex min-h-12 items-center rounded-full border border-border px-6 font-medium"
        >
          See my home base
        </Link>
      </div>
    </div>
  );
}
