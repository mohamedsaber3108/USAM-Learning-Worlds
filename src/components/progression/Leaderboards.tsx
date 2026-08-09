/**
 * Phase 14: Ethical Leaderboards
 *
 * CRITICAL: NO pressure, NO obsession, NO global competition
 *
 * - Class/friends only (never global)
 * - Multiple dimensions (not just XP)
 * - Opt-in only
 * - Can be hidden
 * - Show "people near you" (more relatable)
 */
import type { Leaderboard, LeaderboardEntry } from "@/types/progression";
import { TrendingUp, Users, Eye, EyeOff, Award, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const METRIC_LABELS = {
  "xp-this-week": "XP This Week",
  "skills-mastered": "Skills Mastered",
  "projects-completed": "Projects Completed",
  "peers-helped": "Peers Helped",
};

const METRIC_ICONS = {
  "xp-this-week": Sparkles,
  "skills-mastered": Target,
  "projects-completed": Award,
  "peers-helped": Users,
};

interface LeaderboardsViewProps {
  leaderboards: Leaderboard[];
  onOptIn: (id: string) => void;
  onOptOut: (id: string) => void;
  onHide: (id: string) => void;
  onShow: (id: string) => void;
}

export function LeaderboardsView({
  leaderboards,
  onOptIn,
  onOptOut,
  onHide,
  onShow,
}: LeaderboardsViewProps) {
  return (
    <div className="space-y-6">
      {/* Opt-In Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-4">
        <Users className="mt-0.5 size-5 shrink-0 text-secondary" aria-hidden />
        <div className="flex-1 text-sm">
          <p className="font-medium text-secondary">Leaderboards are optional</p>
          <p className="mt-1 text-secondary/80">
            You can join to see how you're doing compared to classmates, or skip them entirely.
            It's your choice!
          </p>
        </div>
      </div>

      {/* Leaderboards */}
      {leaderboards.map((leaderboard) => (
        <LeaderboardCard
          key={leaderboard.id}
          leaderboard={leaderboard}
          onOptIn={onOptIn}
          onOptOut={onOptOut}
          onHide={onHide}
          onShow={onShow}
        />
      ))}
    </div>
  );
}

interface LeaderboardCardProps {
  leaderboard: Leaderboard;
  onOptIn: (id: string) => void;
  onOptOut: (id: string) => void;
  onHide: (id: string) => void;
  onShow: (id: string) => void;
}

function LeaderboardCard({
  leaderboard,
  onOptIn,
  onOptOut,
  onHide,
  onShow,
}: LeaderboardCardProps) {
  const Icon = METRIC_ICONS[leaderboard.metric];

  // Not participating
  if (!leaderboard.participating) {
    return (
      <div className="surface-panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Icon className="size-5 text-muted-foreground" aria-hidden />
              <h3 className="font-semibold">{leaderboard.name}</h3>
              <Badge variant="secondary" className="capitalize">
                {leaderboard.scope}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              See how you compare with your {leaderboard.scope} in{" "}
              {METRIC_LABELS[leaderboard.metric].toLowerCase()}.
            </p>
          </div>
          <Button onClick={() => onOptIn(leaderboard.id)} variant="outline" size="sm">
            Join
          </Button>
        </div>
      </div>
    );
  }

  // Participating but hidden
  if (!leaderboard.visible) {
    return (
      <div className="surface-panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Icon className="size-5 text-secondary" aria-hidden />
              <h3 className="font-semibold">{leaderboard.name}</h3>
              <Badge variant="secondary">Hidden</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              You're participating but the leaderboard is hidden.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => onShow(leaderboard.id)} variant="outline" size="sm">
              <Eye className="mr-2 size-4" />
              Show
            </Button>
            <Button onClick={() => onOptOut(leaderboard.id)} variant="outline" size="sm">
              Leave
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Participating and visible
  return (
    <div className="surface-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className="size-5 text-secondary" aria-hidden />
            <h3 className="font-semibold">{leaderboard.name}</h3>
            <Badge variant="secondary" className="capitalize">
              {leaderboard.scope}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {METRIC_LABELS[leaderboard.metric]}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onHide(leaderboard.id)} variant="ghost" size="sm">
            <EyeOff className="size-4" />
          </Button>
          <Button onClick={() => onOptOut(leaderboard.id)} variant="outline" size="sm">
            Leave
          </Button>
        </div>
      </div>

      {/* Your Position */}
      {leaderboard.yourRank && (
        <div className="mt-4 rounded-xl bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Your Position</p>
              <p className="mt-1 text-2xl font-bold text-primary">#{leaderboard.yourRank}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Your Score</p>
              <p className="mt-1 text-2xl font-bold">{leaderboard.yourScore.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Learners */}
      {leaderboard.topEntries.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Top Learners</p>
          {leaderboard.topEntries.map((entry) => (
            <LeaderboardEntryRow key={entry.learnerId} entry={entry} highlight={false} />
          ))}
        </div>
      )}

      {/* People Near You (More Relatable) */}
      {leaderboard.nearbyEntries.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">People Near You</p>
          {leaderboard.nearbyEntries.map((entry) => (
            <LeaderboardEntryRow
              key={entry.learnerId}
              entry={entry}
              highlight={entry.rank === leaderboard.yourRank}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LeaderboardEntryRow({ entry, highlight }: { entry: LeaderboardEntry; highlight: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg p-3 transition-colors",
        highlight ? "bg-primary/10" : "bg-surface-raised hover:bg-surface-raised/80"
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          entry.rank <= 3
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {entry.rank}
      </span>
      <img
        src={entry.avatarUrl}
        alt=""
        className="size-10 shrink-0 rounded-full border-2 border-border"
      />
      <div className="min-w-0 flex-1">
        <p className={cn("font-medium", highlight && "text-primary")}>{entry.displayName}</p>
      </div>
      <p className="shrink-0 text-lg font-bold">{entry.score.toLocaleString()}</p>
    </div>
  );
}

/**
 * Compact leaderboard for dashboard
 */
export function LeaderboardCompact({ leaderboard }: { leaderboard: Leaderboard }) {
  if (!leaderboard.participating || !leaderboard.visible) {
    return null;
  }

  const Icon = METRIC_ICONS[leaderboard.metric];

  return (
    <div className="surface-panel p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="size-4 text-secondary" aria-hidden />
        <h3 className="text-sm font-semibold">{leaderboard.name}</h3>
      </div>
      {leaderboard.yourRank && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Your rank</span>
          <span className="text-lg font-bold text-primary">#{leaderboard.yourRank}</span>
        </div>
      )}
    </div>
  );
}

/**
 * ETHICAL DESIGN PRINCIPLES
 *
 * ✅ Opt-in only (never forced)
 * ✅ Can be hidden at any time
 * ✅ Class/friends scope (never global)
 * ✅ Multiple metrics (not just XP)
 * ✅ Show "people near you" (more relatable than just top)
 * ✅ Your position is private by default
 * ✅ Celebrate multiple achievements
 * ✅ No shaming or pressure
 *
 * ❌ NO global leaderboards
 * ❌ NO forced participation
 * ❌ NO name shaming for low ranks
 * ❌ NO single metric obsession
 * ❌ NO excessive competition
 */
