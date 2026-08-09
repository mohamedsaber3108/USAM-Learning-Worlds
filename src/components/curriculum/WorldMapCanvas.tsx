import { useCallback, useEffect, useRef, useState } from "react";
import { Lock, Minus, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CurriculumWorld } from "@/types/curriculum";
import { useAgePresentation } from "@/design/AgePresentationProvider";

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 3;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * The learning world map.
 *
 * Worlds are places, connected by travel lines. Zoom and pan are supported so
 * the map can grow with the curriculum without becoming a list.
 */
export function WorldMapCanvas({
  worlds,
  selectedId,
  onSelect,
}: {
  worlds: CurriculumWorld[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { p: presentation } = useAgePresentation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const stateRef = useRef({ zoom, offset });
  stateRef.current = { zoom, offset };
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const zoomAt = useCallback((px: number, py: number, next: number) => {
    const { zoom: z, offset: o } = stateRef.current;
    const k = next / z;
    setOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k });
    setZoom(next);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const rect = el.getBoundingClientRect();
      const { zoom: z } = stateRef.current;
      zoomAt(
        e.clientX - rect.left,
        e.clientY - rect.top,
        clamp(z * Math.exp(-dy * 0.0015), MIN_ZOOM, MAX_ZOOM),
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const stepZoom = (dir: 1 | -1) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    zoomAt(rect.width / 2, rect.height / 2, clamp(stateRef.current.zoom * (dir === 1 ? 1.25 : 0.8), MIN_ZOOM, MAX_ZOOM));
  };

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="surface-panel relative overflow-hidden">
      <div
        ref={containerRef}
        className="relative h-[440px] touch-none select-none sm:h-[520px]"
        style={{
          backgroundImage:
            "radial-gradient(90% 70% at 20% 10%, color-mix(in oklab, var(--color-primary) 12%, transparent), transparent 65%), radial-gradient(80% 70% at 85% 80%, color-mix(in oklab, var(--color-secondary) 12%, transparent), transparent 60%)",
        }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          setOffset({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <div
          className="absolute inset-0 origin-top-left"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
            {worlds.flatMap((w) =>
              w.neighbourWorldIds.map((nid) => {
                const n = worlds.find((x) => x.id === nid);
                if (!n || n.id < w.id) return null;
                return (
                  <line
                    key={`${w.id}-${nid}`}
                    x1={w.x}
                    y1={w.y}
                    x2={n.x}
                    y2={n.y}
                    stroke="currentColor"
                    className="text-border"
                    strokeWidth={0.35}
                    strokeDasharray="1.4 1.4"
                  />
                );
              }),
            )}
          </svg>

          {worlds.map((world) => {
            const active = world.id === selectedId;
            return (
              <button
                key={world.id}
                type="button"
                onClick={() => onSelect(world.id)}
                style={{
                  insetInlineStart: `${world.x}%`,
                  top: `${world.y}%`,
                  transform: "translate(-50%, -50%)",
                  ["--world-accent" as string]: world.accentColor,
                }}
                className={cn(
                  "absolute w-[min(30vw,168px)] rounded-2xl border p-3 text-start backdrop-blur-sm transition-all",
                  "border-border/70 bg-card/80 hover:-translate-y-[calc(50%+2px)] hover:border-[color-mix(in_oklab,var(--world-accent)_60%,transparent)]",
                  active && "border-[color-mix(in_oklab,var(--world-accent)_75%,transparent)] shadow-lg ring-2 ring-[color-mix(in_oklab,var(--world-accent)_40%,transparent)]",
                  !world.unlocked && "opacity-70",
                )}
              >
                <span
                  className="block size-8 rounded-xl"
                  style={{
                    background:
                      "linear-gradient(140deg, color-mix(in oklab, var(--world-accent) 70%, transparent), color-mix(in oklab, var(--world-accent) 20%, transparent))",
                  }}
                  aria-hidden
                />
                <span className="mt-2 block font-display text-sm font-bold leading-tight">{world.name}</span>
                {presentation.showSecondaryMeta && (
                  <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                    {world.tagline}
                  </span>
                )}
                {!world.unlocked && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    <Lock className="size-3" aria-hidden /> Locked
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-3 end-3 flex items-center gap-1 rounded-full border border-border/70 bg-card/90 p-1 backdrop-blur">
        <MapButton label="Zoom out" onClick={() => stepZoom(-1)}>
          <Minus className="size-4" aria-hidden />
        </MapButton>
        <MapButton label="Reset map view" onClick={reset}>
          <RotateCcw className="size-4" aria-hidden />
        </MapButton>
        <MapButton label="Zoom in" onClick={() => stepZoom(1)}>
          <Plus className="size-4" aria-hidden />
        </MapButton>
      </div>
    </div>
  );
}

function MapButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}
