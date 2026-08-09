import type { ProjectState } from "@/types/projects";
import { PROJECT_STATE_META } from "@/types/projects";
import {
  Lightbulb,
  ClipboardList,
  Hammer,
  TestTube,
  TrendingUp,
  CheckCircle,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATE_ICONS: Record<ProjectState, typeof Lightbulb> = {
  idea: Lightbulb,
  planning: ClipboardList,
  building: Hammer,
  testing: TestTube,
  improving: TrendingUp,
  completed: CheckCircle,
  featured: Star,
};

interface ProjectStateBadgeProps {
  state: ProjectState;
  showIcon?: boolean;
  className?: string;
}

export function ProjectStateBadge({ state, showIcon = true, className }: ProjectStateBadgeProps) {
  const meta = PROJECT_STATE_META[state];
  const Icon = STATE_ICONS[state];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
        meta.color,
        className
      )}
      title={meta.meaning}
    >
      {showIcon && <Icon className="size-3.5" aria-hidden />}
      {meta.label}
    </span>
  );
}

/**
 * Project state progress indicator
 */
export function ProjectStateProgress({ state }: { state: ProjectState }) {
  const states: ProjectState[] = ["idea", "planning", "building", "testing", "improving", "completed"];
  const currentIndex = states.indexOf(state);
  const isFeatured = state === "featured";

  if (isFeatured) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <Star className="size-5 text-primary" aria-hidden />
        <div className="flex-1">
          <p className="font-semibold text-primary">Featured Project</p>
          <p className="text-xs text-primary/80">Your mentor chose this as exceptional work</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Project Progress</span>
        <span>
          {currentIndex + 1} of {states.length}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {states.map((s, index) => {
          const Icon = STATE_ICONS[s];
          const isCurrent = s === state;
          const isPast = index < currentIndex;
          const meta = PROJECT_STATE_META[s];

          return (
            <div key={s} className="flex flex-1 items-center">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full transition-all",
                  isCurrent && "scale-110 ring-2 ring-primary ring-offset-2",
                  isPast ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
                title={meta.label}
              >
                <Icon className="size-4" aria-hidden />
              </div>
              {index < states.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-colors",
                    isPast ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground">{PROJECT_STATE_META[state].meaning}</p>
    </div>
  );
}
