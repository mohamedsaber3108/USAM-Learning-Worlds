import { ArrowUpRight, Eye, TriangleAlert } from "lucide-react";
import type { ParentInsight } from "@/types/engines";

const SIGNAL = {
  positive: { icon: ArrowUpRight, tone: "text-secondary", label: "Strength" },
  watch: { icon: Eye, tone: "text-primary", label: "Watch" },
  action: { icon: TriangleAlert, tone: "text-destructive", label: "Needs action" },
} as const;

export function ParentInsightCard({ insight }: { insight: ParentInsight }) {
  const signal = SIGNAL[insight.signal];
  const Icon = signal.icon;
  return (
    <article className="surface-panel space-y-3 p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${signal.tone}`}>
            <Icon className="size-3.5 shrink-0" aria-hidden />
            {signal.label}
          </p>
          <h3 className="mt-1 font-display text-lg font-bold">{insight.headline}</h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-xl font-bold">{insight.value}</p>
          <p className="text-[11px] text-muted-foreground">{insight.metric}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{insight.detail}</p>
    </article>
  );
}
