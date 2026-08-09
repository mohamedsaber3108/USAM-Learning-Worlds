import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { glyphIcon } from "@/components/english/StrandBoard";
import type { AgeBand } from "@/types/domain";
import type { EnglishVenue } from "@/types/english";

const ACCENT: Record<EnglishVenue["accent"], string> = {
  primary: "text-primary border-primary/40 bg-primary/10",
  secondary: "text-secondary border-secondary/40 bg-secondary/10",
  accent: "text-accent border-accent/40 bg-accent/10",
  success: "text-success border-success/40 bg-success/10",
};

/**
 * The English world, drawn as a place.
 *
 * Venues sit at fixed coordinates so the map is a memorable geography rather
 * than a reshuffling grid. The same venues are listed below it for anyone who
 * would rather read than travel.
 */
export function EnglishWorldMap({
  venues,
  ageBand,
  activeId,
}: {
  venues: EnglishVenue[];
  ageBand: AgeBand;
  activeId?: string;
}) {
  return (
    <div className="surface-panel relative overflow-hidden p-4">
      <div className="relative h-[380px] w-full rounded-xl bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent_60%),radial-gradient(circle_at_75%_75%,color-mix(in_oklab,var(--color-secondary)_14%,transparent),transparent_55%)]">
        <svg className="absolute inset-0 size-full" aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none">
          {venues.slice(1).map((venue, i) => {
            const prev = venues[i]!;
            return (
              <line
                key={venue.id}
                x1={prev.position.x}
                y1={prev.position.y}
                x2={venue.position.x}
                y2={venue.position.y}
                stroke="currentColor"
                className="text-border"
                strokeWidth={0.3}
                strokeDasharray="1.5 1.5"
              />
            );
          })}
        </svg>

        {venues.map((venue) => {
          const Glyph = glyphIcon(venue.glyph);
          const framing = venue.ageFraming[ageBand];
          return (
            <Link
              key={venue.id}
              to="/english/$venueId"
              params={{ venueId: venue.id }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border px-3 py-2 text-center backdrop-blur transition-transform hover:scale-105 focus-visible:scale-105",
                ACCENT[venue.accent],
                activeId === venue.id && "ring-2 ring-primary",
              )}
              style={{ left: `${venue.position.x}%`, top: `${venue.position.y}%` }}
            >
              <Glyph className="mx-auto size-5" aria-hidden />
              <span className="mt-1 block max-w-[9rem] text-xs font-semibold text-foreground">
                {framing.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function VenueCard({ venue, ageBand }: { venue: EnglishVenue; ageBand: AgeBand }) {
  const Glyph = glyphIcon(venue.glyph);
  const framing = venue.ageFraming[ageBand];
  return (
    <Link
      to="/english/$venueId"
      params={{ venueId: venue.id }}
      className="surface-panel flex h-full flex-col gap-3 p-5 transition-colors hover:border-primary/60"
    >
      <div className="flex items-start gap-3">
        <span className={cn("rounded-xl border p-2", ACCENT[venue.accent])}>
          <Glyph className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold">{framing.title}</h3>
          <p className="text-xs text-muted-foreground">{venue.tagline}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{framing.description}</p>
      <ul className="mt-auto space-y-1 pt-2 text-xs text-muted-foreground">
        {framing.focus.map((f) => (
          <li key={f} className="flex gap-2">
            <span aria-hidden className="text-primary">
              •
            </span>
            {f}
          </li>
        ))}
      </ul>
    </Link>
  );
}
