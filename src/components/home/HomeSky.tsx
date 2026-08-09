import type { ReactNode } from "react";
import { WorldIllustration } from "@/components/world/WorldIllustration";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { cn } from "@/lib/utils";
import type { HomeAtmosphere } from "@/types/home";

/**
 * The environment layer of the home world.
 *
 * The home screen is a place before it is information: the sky wash, the
 * region illustration and the weather line all come from state, so morning in
 * Signal Bay never looks like evening in Signal Bay.
 */
export function HomeSky({
  atmosphere,
  children,
  className,
}: {
  atmosphere: HomeAtmosphere;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label={`${atmosphere.placeName}, ${atmosphere.timeOfDay}`}
      className={cn(
        "surface-panel relative overflow-hidden p-5 sm:p-7",
        className,
      )}
      style={{
        backgroundImage: `radial-gradient(120% 90% at 12% 0%, ${atmosphere.skyFrom} 0%, transparent 62%), radial-gradient(110% 80% at 92% 8%, ${atmosphere.skyTo} 0%, transparent 60%)`,
      }}
    >
      {children}
    </section>
  );
}

export function PlaceBanner({ atmosphere }: { atmosphere: HomeAtmosphere }) {
  const { p, fit } = useAgePresentation();
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {atmosphere.timeOfDay} · {atmosphere.placeName}
        </p>
        <h1 className={cn(p.titleClass, "mt-1")}>{atmosphere.placeLine}</h1>
        {p.showSecondaryMeta && (
          <p className="mt-2 text-sm text-muted-foreground">{fit(atmosphere.weatherLine)}</p>
        )}
      </div>
      <WorldIllustration
        scene={{ biome: atmosphere.biome, accent: atmosphere.accent, label: atmosphere.placeName }}
        className="w-full max-w-[260px] justify-self-end rounded-2xl"
      />
    </div>
  );
}
