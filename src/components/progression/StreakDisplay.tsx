/**
 * Phase 14: Responsible Streak Tracking
 *
 * CRITICAL: NO anxiety, NO punishment for breaks
 *
 * We celebrate consistency WITHOUT creating fear.
 * Breaks are normal and expected.
 */
import type { PracticeStreak } from "@/types/progression";
import { Calendar, TrendingUp, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  streak: PracticeStreak;
  className?: string;
}

export function StreakDisplay({ streak, className }: StreakDisplayProps) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Calculate which days were practiced this week
  // This is simplified - real implementation would track actual dates
  const practicedDays = Array.from({ length: 7 }, (_, i) => i < streak.daysThisWeek);

  return (
    <div className={cn("surface-panel p-5", className)}>
      {/* Positive Message */}
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-secondary/10 p-2.5">
          <Calendar className="size-5 text-secondary" aria-hidden />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Practice Rhythm</h3>
          <p className="mt-1 text-sm text-muted-foreground">{streak.message}</p>
        </div>
      </div>

      {/* This Week */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">This Week</p>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div key={day} className="text-center">
              <p className="mb-1 text-[10px] text-muted-foreground">{day}</p>
              <div
                className={cn(
                  "mx-auto flex size-8 items-center justify-center rounded-lg transition-colors",
                  practicedDays[index]
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {practicedDays[index] ? (
                  <CheckCircle className="size-4" aria-hidden />
                ) : (
                  <span className="text-xs">·</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats (Positive Framing) */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard
          label="Days This Week"
          value={streak.daysThisWeek}
          max={7}
          icon={TrendingUp}
          positive
        />
        <StatCard
          label="Personal Best"
          value={streak.longestStreak}
          icon={TrendingUp}
          positive
        />
      </div>

      {/* Encouragement (NO pressure) */}
      {streak.daysThisWeek === 0 && (
        <div className="mt-4 rounded-lg bg-muted p-3 text-center">
          <p className="text-sm text-muted-foreground">
            Ready to practice? Anytime works!
          </p>
        </div>
      )}

      {streak.daysThisWeek >= 3 && streak.daysThisWeek < 7 && (
        <div className="mt-4 rounded-lg bg-secondary/10 p-3 text-center">
          <p className="text-sm text-secondary">
            Nice rhythm! {7 - streak.daysThisWeek} more {7 - streak.daysThisWeek === 1 ? "day" : "days"} to a full week.
          </p>
        </div>
      )}

      {streak.daysThisWeek === 7 && (
        <div className="mt-4 rounded-lg bg-primary/10 p-3 text-center">
          <p className="text-sm font-medium text-primary">
            Amazing! You practiced every day this week. 🎉
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  max,
  icon: Icon,
  positive,
}: {
  label: string;
  value: number;
  max?: number;
  icon: typeof TrendingUp;
  positive?: boolean;
}) {
  return (
    <div className={cn("rounded-lg p-3", positive ? "bg-secondary/5" : "bg-muted")}>
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4", positive ? "text-secondary" : "text-muted-foreground")} aria-hidden />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-1 font-display text-2xl font-bold">
        {value}
        {max && <span className="text-base text-muted-foreground">/{max}</span>}
      </p>
    </div>
  );
}

/**
 * IMPORTANT: Anti-Anxiety Design
 *
 * ✅ Show "days this week" (resets weekly, no accumulated pressure)
 * ✅ Celebrate personal best (growth mindset)
 * ✅ Positive messages only
 * ✅ NO "streak broken" warnings
 * ✅ NO countdown timers
 * ✅ NO loss language
 * ✅ Breaks are normal
 *
 * Message examples:
 * - "You practiced 4 days this week - nice rhythm!"
 * - "You practiced today - keep going!"
 * - "Ready to practice? Anytime works!"
 *
 * NEVER:
 * - "Your streak is about to break!"
 * - "Don't lose your streak!"
 * - "You missed a day!"
 * - "Practice now or lose progress!"
 */

/**
 * Compact streak indicator for home page
 */
export function StreakCompact({ streak }: { streak: PracticeStreak }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-secondary/10 px-3 py-2">
      <Calendar className="size-4 text-secondary" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-secondary">
          {streak.daysThisWeek} {streak.daysThisWeek === 1 ? "day" : "days"} this week
        </p>
      </div>
    </div>
  );
}
