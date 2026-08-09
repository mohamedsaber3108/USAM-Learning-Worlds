import { useMemo } from "react";
import type { CurriculumNode } from "@/types/curriculum";
import { MASTERY_META, PATH_META } from "@/components/curriculum/mastery-ui";
import { cn } from "@/lib/utils";

const COL_W = 240;
const ROW_H = 164;
const NODE_W = 196;
const NODE_H = 124;

/**
 * Prerequisite graph.
 *
 * Columns are graph depth (what has to come first), edges are prerequisites,
 * colour is mastery state and the ring is adaptive path status. Nothing here
 * is a course list — it is a dependency structure.
 */
export function CurriculumGraph({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: CurriculumNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { positions, width, height } = useMemo(() => {
    const tiers = new Map<number, CurriculumNode[]>();
    for (const node of nodes) {
      const list = tiers.get(node.tier) ?? [];
      list.push(node);
      tiers.set(node.tier, list);
    }
    const pos = new Map<string, { x: number; y: number }>();
    let maxRows = 0;
    [...tiers.keys()]
      .sort((a, b) => a - b)
      .forEach((tier, col) => {
        const list = tiers.get(tier) ?? [];
        maxRows = Math.max(maxRows, list.length);
        list.forEach((node, row) => {
          pos.set(node.id, { x: col * COL_W + 24, y: row * ROW_H + 24 });
        });
      });
    return {
      positions: pos,
      width: tiers.size * COL_W + 60,
      height: maxRows * ROW_H + 40,
    };
  }, [nodes]);

  const edges = nodes.flatMap((node) =>
    node.prerequisiteIds
      .map((pid) => {
        const from = positions.get(pid);
        const to = positions.get(node.id);
        if (!from || !to) return null;
        return { id: `${pid}->${node.id}`, from, to, blocked: node.pathStatus === "locked" };
      })
      .filter(Boolean),
  ) as { id: string; from: { x: number; y: number }; to: { x: number; y: number }; blocked: boolean }[];

  return (
    <div className="surface-panel overflow-x-auto p-2">
      <div className="relative" style={{ width, height }}>
        <svg className="absolute inset-0" width={width} height={height} aria-hidden>
          {edges.map((edge) => {
            const x1 = edge.from.x + NODE_W;
            const y1 = edge.from.y + NODE_H / 2;
            const x2 = edge.to.x;
            const y2 = edge.to.y + NODE_H / 2;
            const mid = (x1 + x2) / 2;
            return (
              <path
                key={edge.id}
                d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray={edge.blocked ? "5 4" : undefined}
                className={edge.blocked ? "text-muted-foreground/50" : "text-primary/50"}
              />
            );
          })}
        </svg>

        {nodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const mastery = MASTERY_META[node.mastery.state];
          const path = PATH_META[node.pathStatus];
          const active = node.id === selectedId;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => onSelect(node.id)}
              style={{ left: pos.x, top: pos.y, width: NODE_W, height: NODE_H }}
              className={cn(
                "absolute rounded-2xl border bg-card/85 p-3 text-start transition-all hover:-translate-y-0.5",
                active ? "border-primary ring-2 ring-primary/35" : "border-border/70 hover:border-primary/50",
                node.pathStatus === "locked" && "opacity-70",
              )}
              aria-label={`${node.name} — ${mastery.label}, ${path.label}`}
            >
              <span className="flex items-center gap-1.5">
                <span className={cn("size-2 rounded-full", mastery.dot)} aria-hidden />
                <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {mastery.label}
                </span>
              </span>
              <span className="mt-1 block font-display text-sm font-bold leading-tight">{node.name}</span>
              <span className={cn("mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold", path.tone)}>
                {path.label}
              </span>
              <span className="mt-1.5 block text-[10px] text-muted-foreground">
                Ages {node.ageRange.min}–{node.ageRange.max}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
