import { CharacterPortrait } from "@/components/character/CharacterPortrait";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { CAST } from "@/data/onboarding";
import { cn } from "@/lib/utils";
import type { CastMember } from "@/types/onboarding";

/**
 * The cast introduction.
 *
 * Characters are roles with responsibilities. The child taps to meet them —
 * meeting someone is a choice, never an obligation.
 */
export function CastIntroduction({
  metIds,
  onMeet,
}: {
  metIds: string[];
  onMeet: (member: CastMember) => void;
}) {
  const { p, fit } = useAgePresentation();
  const visible = p.mode === "explorer" ? CAST.slice(0, 6) : CAST;

  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-muted-foreground">
        You'll meet the same characters again and again. Each one does a different job — they are
        roles in your learning, not extra friends to keep happy.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((member) => {
          const met = metIds.includes(member.id);
          return (
            <li key={member.id}>
              <button
                type="button"
                onClick={() => onMeet(member)}
                aria-pressed={met}
                className={cn(
                  "interactive surface-panel flex w-full gap-4 p-5 text-start",
                  met && "border-primary",
                )}
              >
                <CharacterPortrait
                  character={{ id: member.id, name: member.name, accentColor: member.accentColor }}
                  expression={met ? "encouraging" : "idle"}
                  presentation="avatar"
                />
                <span className="min-w-0 space-y-1">
                  <span className="flex items-center gap-2">
                    <span className="font-display text-heading font-semibold">{member.name}</span>
                    {met && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] text-primary">
                        Met
                      </span>
                    )}
                  </span>
                  <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                    {member.roleLabel}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {fit(p.showSecondaryMeta ? member.responsibility : member.tagline)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
