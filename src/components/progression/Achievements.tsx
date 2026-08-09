/**
 * Phase 14: Achievements System
 *
 * Celebrate meaningful learning accomplishments.
 * Always cite evidence - never arbitrary.
 */
import type { Achievement, AchievementCategory } from "@/types/progression";
import { AGE_ADAPTIVE_PROGRESSION } from "@/types/progression";
import {
  Award,
  Sparkles,
  Users,
  Lightbulb,
  Target,
  Palette,
  Lock,
  CheckCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAgePresentation } from "@/design/AgePresentationProvider";

const CATEGORY_ICONS = {
  skill: Target,
  project: Palette,
  collaboration: Users,
  curiosity: Lightbulb,
  persistence: Sparkles,
  creativity: Palette,
};

const RARITY_COLORS = {
  common: "bg-gray-100 text-gray-700 border-gray-200",
  uncommon: "bg-green-100 text-green-700 border-green-200",
  rare: "bg-blue-100 text-blue-700 border-blue-200",
  legendary: "bg-purple-100 text-purple-700 border-purple-200",
};

interface AchievementsGridProps {
  categories: AchievementCategory[];
  onAchievementClick?: (achievement: Achievement) => void;
}

export function AchievementsGrid({ categories, onAchievementClick }: AchievementsGridProps) {
  const { ageBand } = useAgePresentation();
  const presentation = AGE_ADAPTIVE_PROGRESSION[ageBand];

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <section key={category.id} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = CATEGORY_ICONS[category.id as keyof typeof CATEGORY_ICONS] || Award;
                return <Icon className="size-5 text-secondary" aria-hidden />;
              })()}
              <h2 className="font-display text-xl font-bold">{category.name}</h2>
              <Badge variant="secondary">
                {category.completedCount}/{category.totalCount}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                vocabularyLabel={presentation.vocabulary.achievement}
                onClick={() => onAchievementClick?.(achievement)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  vocabularyLabel: string;
  onClick?: () => void;
}

function AchievementCard({ achievement, vocabularyLabel, onClick }: AchievementCardProps) {
  const progressPercent = achievement.progress * 100;
  const isCompleted = achievement.completed;
  const isLocked = achievement.progress === 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "surface-panel group p-5 text-left transition-all",
        isCompleted && "border-primary/30 bg-primary/5",
        !isCompleted && "hover:border-primary/20"
      )}
    >
      {/* Badge Image */}
      <div className="relative mb-4">
        <div
          className={cn(
            "mx-auto flex size-20 items-center justify-center rounded-full",
            isCompleted
              ? "bg-primary/10"
              : isLocked
              ? "bg-muted"
              : "bg-secondary/10"
          )}
        >
          {isCompleted ? (
            <img
              src={achievement.badgeUrl}
              alt=""
              className="size-16 rounded-full"
            />
          ) : isLocked ? (
            <Lock className="size-8 text-muted-foreground" aria-hidden />
          ) : (
            <div className="relative">
              <img
                src={achievement.badgeUrl}
                alt=""
                className="size-16 rounded-full opacity-40"
              />
              <CheckCircle className="absolute inset-0 m-auto size-8 text-secondary" aria-hidden />
            </div>
          )}
        </div>
        {isCompleted && achievement.completedAt && (
          <div className="absolute -right-2 -top-2 rounded-full bg-primary p-1.5">
            <CheckCircle className="size-4 text-primary-foreground" aria-hidden />
          </div>
        )}
      </div>

      {/* Title and Description */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn("font-semibold", isCompleted && "text-primary")}>
            {achievement.title}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
              RARITY_COLORS[achievement.rarity]
            )}
          >
            {achievement.rarity}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{achievement.description}</p>
      </div>

      {/* Progress or Evidence */}
      {isCompleted ? (
        achievement.evidence && (
          <div className="mt-3 rounded-lg bg-primary/5 p-2">
            <p className="text-xs text-primary">{achievement.evidence}</p>
          </div>
        )
      ) : (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>
      )}

      {/* Criteria */}
      {!isCompleted && achievement.criteria.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">To earn this:</p>
          <ul className="space-y-0.5">
            {achievement.criteria.slice(0, 2).map((criterion, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <span className="mt-1 size-1 shrink-0 rounded-full bg-current" />
                <span>{criterion}</span>
              </li>
            ))}
            {achievement.criteria.length > 2 && (
              <li className="text-xs text-muted-foreground">
                +{achievement.criteria.length - 2} more...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Rewards */}
      {!isCompleted && (achievement.xpReward > 0 || achievement.coinReward > 0) && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {achievement.xpReward > 0 && <span>+{achievement.xpReward} XP</span>}
          {achievement.xpReward > 0 && achievement.coinReward > 0 && <span>·</span>}
          {achievement.coinReward > 0 && <span>+{achievement.coinReward} coins</span>}
        </div>
      )}

      {/* Completion Date */}
      {isCompleted && achievement.completedAt && (
        <p className="mt-3 text-xs text-muted-foreground">
          Earned {new Date(achievement.completedAt).toLocaleDateString()}
        </p>
      )}
    </button>
  );
}

/**
 * Achievement unlock celebration
 */
interface AchievementUnlockProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementUnlock({ achievement, onClose }: AchievementUnlockProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="animate-in zoom-in-95 surface-panel max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex size-32 items-center justify-center rounded-full bg-primary/10">
          <img
            src={achievement.badgeUrl}
            alt=""
            className="size-24 rounded-full"
          />
        </div>

        <div className="mb-2">
          <span
            className={cn(
              "inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase",
              RARITY_COLORS[achievement.rarity]
            )}
          >
            {achievement.rarity}
          </span>
        </div>

        <h2 className="font-display text-2xl font-bold">Achievement Earned!</h2>
        <p className="mt-2 text-lg font-semibold">{achievement.title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{achievement.description}</p>

        {achievement.evidence && (
          <div className="mt-4 rounded-xl bg-primary/5 p-4">
            <p className="text-sm font-medium text-primary">What you did:</p>
            <p className="mt-1 text-sm text-primary/80">{achievement.evidence}</p>
          </div>
        )}

        {(achievement.xpReward > 0 || achievement.coinReward > 0) && (
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            {achievement.xpReward > 0 && (
              <span className="font-semibold text-primary">+{achievement.xpReward} XP</span>
            )}
            {achievement.coinReward > 0 && (
              <span className="font-semibold text-secondary">+{achievement.coinReward} coins</span>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}

/**
 * Compact achievement display for home/profile
 */
export function AchievementsCompact({ achievements }: { achievements: Achievement[] }) {
  const recentAchievements = achievements
    .filter((a) => a.completed)
    .sort((a, b) => {
      if (!a.completedAt || !b.completedAt) return 0;
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    })
    .slice(0, 5);

  if (recentAchievements.length === 0) {
    return (
      <div className="surface-panel p-8 text-center">
        <Award className="mx-auto size-8 text-muted-foreground" aria-hidden />
        <p className="mt-2 text-sm text-muted-foreground">
          Achievements appear here as you learn
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {recentAchievements.map((achievement) => (
        <div
          key={achievement.id}
          className="group relative"
          title={achievement.title}
        >
          <img
            src={achievement.badgeUrl}
            alt={achievement.title}
            className="size-12 rounded-full border-2 border-border transition-transform group-hover:scale-110"
          />
        </div>
      ))}
    </div>
  );
}

/**
 * EDUCATIONAL DESIGN
 *
 * ✅ Every achievement cites evidence
 * ✅ Criteria are clear and learning-focused
 * ✅ Progress is shown, not hidden
 * ✅ Rewards are modest (not excessive)
 * ✅ Celebrates meaningful accomplishments
 * ✅ No FOMO or pressure
 */
