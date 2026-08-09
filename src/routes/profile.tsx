import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Lock, Sparkles } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { learnerService, queryKeys } from "@/services";
import { competencies as allCompetencies } from "@/data/mock";
import { useExperience } from "@/state/experience";
import { AGE_BANDS, AGE_ADAPTATIONS } from "@/lib/age";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Avatar — USAM for Kids" },
      {
        name: "description",
        content:
          "Your learner profile, interests, interaction style and an avatar whose items are earned through learning.",
      },
      { property: "og:title", content: "Profile & Avatar — USAM for Kids" },
      {
        property: "og:description",
        content: "Customisation is earned: every item traces back to a mastered competency.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { ageBand, setAgeBand } = useExperience();
  const learnerQuery = useQuery({ queryKey: queryKeys.learner, queryFn: learnerService.getCurrent });
  const customizationQuery = useQuery({
    queryKey: queryKeys.customization,
    queryFn: learnerService.getCustomization,
  });
  const inventoryQuery = useQuery({
    queryKey: queryKeys.inventory,
    queryFn: learnerService.getInventory,
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Profile"
        title="Who you are here"
        description="Your profile drives adaptation: age band, interests, motivation drivers and preferred interaction style."
      />

      <AsyncBoundary query={learnerQuery} loadingLabel="Loading your profile">
        {(learner) => (
          <section className="surface-panel grid gap-6 p-6 md:grid-cols-2">
            <div className="space-y-3">
              <h2 className="font-display text-xl font-semibold">{learner.profile.displayName}</h2>
              <dl className="space-y-2 text-sm">
                <Row label="Age" value={`${learner.profile.age} (${learner.profile.ageBand})`} />
                <Row label="Stage" value={learner.profile.developmentalStage} />
                <Row label="Interaction style" value={learner.profile.preferredInteractionStyle} />
                <Row label="Languages" value={learner.profile.languages.join(", ")} />
                <Row label="Motivation" value={learner.profile.motivationDrivers.join(", ")} />
              </dl>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Interests</h3>
              <ul className="flex flex-wrap gap-2">
                {learner.profile.interests.map((i) => (
                  <li
                    key={i}
                    className="rounded-full bg-secondary/15 px-3 py-1.5 text-sm capitalize text-secondary"
                  >
                    {i}
                  </li>
                ))}
              </ul>
              <h3 className="pt-2 text-sm font-semibold text-muted-foreground">Experience layer</h3>
              <div role="group" aria-label="Age experience layer" className="flex flex-wrap gap-2">
                {AGE_BANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setAgeBand(b)}
                    aria-pressed={ageBand === b}
                    className={cn(
                      "min-h-11 rounded-xl px-4 text-sm font-semibold",
                      ageBand === b
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-raised text-muted-foreground",
                    )}
                  >
                    {b} · {AGE_ADAPTATIONS[b].label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </AsyncBoundary>

      <section className="space-y-3">
        <SectionHeading
          title="Your character"
          hint="Identity is part of the journey — items are unlocked by mastery."
        />
        <AsyncBoundary query={customizationQuery} loadingLabel="Loading your character">
          {(cust) => (
            <div className="surface-panel grid gap-6 p-6 md:grid-cols-[auto_minmax(0,1fr)]">
              <div
                className="grid size-32 place-items-center rounded-3xl"
                style={{
                  background: `linear-gradient(135deg, color-mix(in oklab, ${cust.primaryColor} 40%, transparent), color-mix(in oklab, ${cust.secondaryColor} 40%, transparent))`,
                }}
              >
                <Sparkles className="size-10 text-foreground/80" aria-hidden />
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <Row label="Name" value={cust.name} />
                <Row label="Level" value={String(cust.level)} />
                <Row label="Hair" value={cust.hair} />
                <Row label="Skin tone" value={cust.skinTone} />
                <Row label="Outfit" value={cust.outfit} />
                <Row label="Accessory" value={cust.accessory ?? "None"} />
              </dl>
            </div>
          )}
        </AsyncBoundary>
      </section>

      <section className="space-y-3">
        <SectionHeading title="Unlocks" hint="Each item names the competency that earned it." />
        <AsyncBoundary query={inventoryQuery} loadingLabel="Loading unlocks">
          {(items) => (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={cn("surface-panel p-4", !item.unlocked && "opacity-60")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    {!item.unlocked && <Lock className="size-4 text-muted-foreground" aria-hidden />}
                  </div>
                  <p className="text-xs capitalize text-muted-foreground">{item.slot}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.unlocked ? "Earned via " : "Unlocks with "}
                    {allCompetencies.find((c) => c.id === item.unlockedByCompetencyId)?.name ??
                      "a future competency"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </AsyncBoundary>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right capitalize">{value}</dd>
    </div>
  );
}
