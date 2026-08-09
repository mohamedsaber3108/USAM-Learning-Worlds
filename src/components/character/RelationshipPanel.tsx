import { Heart, MessagesSquare, Sparkles, Star } from "lucide-react";
import { CharacterPortrait } from "@/components/character/CharacterPortrait";
import { ProgressRing } from "@/components/viz/Progress";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { CAST } from "@/data/onboarding";
import { cn } from "@/lib/utils";
import type { CharacterRelationship } from "@/types/onboarding";

const REACTION_COPY: Record<CharacterRelationship["latestReaction"], string> = {
  proud: "Proud of your last step",
  curious: "Curious about what you'll pick",
  supportive: "Ready to help if you ask",
  playful: "In a playful mood",
  reflective: "Thinking about your last reflection",
};

/**
 * Character relationship surface.
 *
 * Trust and familiarity describe how well a mentor can help — not how much the
 * child owes them. No streaks, no guilt, no "they'll miss you" mechanics: every
 * panel states plainly that the learner is in charge.
 */
export function RelationshipPanel({
  relationship,
  compact = false,
}: {
  relationship: CharacterRelationship;
  compact?: boolean;
}) {
  const { p, fit } = useAgePresentation();
  const member = CAST.find((c) => c.id === relationship.characterId);
  const nextMilestone = relationship.milestones.find((m) => !m.achievedAt);

  return (
    <article className="surface-panel space-y-4 p-5">
      <header className="flex items-center gap-3">
        <CharacterPortrait
          character={{
            id: relationship.characterId,
            name: member?.name ?? "Companion",
            accentColor: member?.accentColor ?? "var(--color-primary)",
          }}
          expression="encouraging"
          presentation="avatar"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-heading font-semibold">{member?.name}</h3>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {member?.roleLabel}
          </p>
        </div>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          {REACTION_COPY[relationship.latestReaction]}
        </span>
      </header>

      <div className="flex flex-wrap items-center gap-6">
        <Meter label="Trust" value={relationship.trust} />
        <Meter label="Familiarity" value={relationship.familiarity} />
      </div>

      {!compact && (
        <>
          <Section icon={Star} title="Milestones">
            <ul className="space-y-1.5">
              {relationship.milestones.map((m) => (
                <li key={m.id} className="flex items-start gap-2 text-sm">
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      m.achievedAt ? "bg-success" : "bg-muted-foreground/40",
                    )}
                    aria-hidden
                  />
                  <span className={cn(!m.achievedAt && "text-muted-foreground")}>
                    <span className="font-medium">{m.label}</span>
                    {p.showSecondaryMeta && <span className="block text-xs">{fit(m.description)}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={Sparkles} title="Shared memories">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {relationship.sharedMemories.map((mem) => (
                <li key={mem.id}>
                  <span className="text-foreground">{mem.topic}:</span> {fit(mem.summary)}
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={Heart} title="Favourite topics">
            <ul className="flex flex-wrap gap-2">
              {relationship.favoriteTopics.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-border bg-surface-raised px-3 py-1 text-xs"
                >
                  {t}
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={MessagesSquare} title="Recent conversations">
            <ul className="space-y-1 text-sm text-muted-foreground">
              {relationship.recentConversations.map((c) => (
                <li key={c.id}>“{fit(c.preview)}”</li>
              ))}
            </ul>
          </Section>
        </>
      )}

      {nextMilestone && (
        <p className="text-sm">
          <span className="text-muted-foreground">Next together: </span>
          {nextMilestone.label}
        </p>
      )}
      <p className="rounded-[var(--radius)] border border-border bg-surface-raised p-3 text-xs text-muted-foreground">
        {relationship.autonomyNote}
      </p>
    </article>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <ProgressRing value={value} label={label} size={56} />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{Math.round(value * 100)}% — grows as you work together</p>
      </div>
    </div>
  );
}

function Section({
  icon: IconCmp,
  title,
  children,
}: {
  icon: typeof Star;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <IconCmp className="size-3.5" aria-hidden />
        {title}
      </h4>
      {children}
    </section>
  );
}
