/**
 * Phase 14: XP and Level Display
 *
 * Age-adaptive: Stars (8-9), XP (10-11), Experience (12-14)
 * De-emphasized for 12-14 to focus on skills
 */
import type { LearnerLevel, XPGain } from "@/types/progression";
import { AGE_ADAPTIVE_PROGRESSION } from "@/types/progression";
import { Star, TrendingUp, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAgePresentation } from "@/design/AgePresentationProvider";

interface XPDisplayProps {
  level: LearnerLevel;
  className?: string;
  compact?: boolean;
}

export function XPDisplay({ level, className, compact = false }: XPDisplayProps) {
  const { ageBand } = useAgePresentation();
  const presentation = AGE_ADAPTIVE_PROGRESSION[ageBand];
  const progressPercent = (level.currentXP / level.xpForNextLevel) * 100;

  // 12-14: De-emphasize (but still show in profile)
  if (!presentation.showXPNumbers && !compact) {
    return null;
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="rounded-lg bg-primary/10 p-1.5">
          {presentation.rewardLanguage === "playful" ? (
            <Star className="size-4 text-primary" aria-hidden />
          ) : (
            <Sparkles className="size-4 text-primary" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {presentation.showLevelNumbers && (
            <p className="text-xs font-medium text-muted-foreground">
              {presentation.vocabulary.level} {level.currentLevel}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Progress value={progressPercent} className="h-1.5 flex-1" />
            {presentation.showXPNumbers && (
              <span className="text-xs font-semibold">{Math.round(progressPercent)}%</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("surface-panel p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {presentation.showLevelNumbers && (
            <p className="text-sm font-medium text-muted-foreground">
              {presentation.vocabulary.level}
            </p>
          )}
          <p className="mt-1 font-display text-4xl font-bold">{level.currentLevel}</p>
        </div>
        <div className="rounded-xl bg-primary/10 p-3">
          {presentation.rewardLanguage === "playful" ? (
            <Star className="size-8 text-primary" aria-hidden />
          ) : presentation.rewardLanguage === "balanced" ? (
            <Sparkles className="size-8 text-primary" aria-hidden />
          ) : (
            <TrendingUp className="size-8 text-primary" aria-hidden />
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {presentation.showXPNumbers && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{presentation.vocabulary.xp}</span>
            <span className="font-semibold">
              {level.currentXP.toLocaleString()} / {level.xpForNextLevel.toLocaleString()}
            </span>
          </div>
        )}
        <Progress value={progressPercent} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {level.xpForNextLevel - level.currentXP} {presentation.vocabulary.xp} until next level
        </p>
      </div>

      {level.unlocksAtNextLevel.length > 0 && (
        <div className="mt-4 rounded-lg bg-secondary/10 p-3">
          <p className="text-xs font-semibold text-secondary">Next level unlocks:</p>
          <ul className="mt-1.5 space-y-1">
            {level.unlocksAtNextLevel.map((unlock, i) => (
              <li key={i} className="text-xs text-secondary/80">
                • {unlock}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * XP Gain Animation - show when XP is awarded
 */
interface XPGainToastProps {
  gain: XPGain;
  onClose: () => void;
}

export function XPGainToast({ gain, onClose }: XPGainToastProps) {
  const { ageBand } = useAgePresentation();
  const presentation = AGE_ADAPTIVE_PROGRESSION[ageBand];

  return (
    <div className="animate-in slide-in-from-bottom-5 rounded-xl border border-primary/20 bg-primary/10 p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary p-2">
          <Star className="size-5 text-primary-foreground" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-primary">
            +{gain.amount} {presentation.vocabulary.xp}
          </p>
          <p className="mt-0.5 text-sm text-primary/80">{gain.reason}</p>
        </div>
        <button
          onClick={onClose}
          className="text-primary/60 hover:text-primary"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/**
 * Level Up Celebration
 */
interface LevelUpCelebrationProps {
  newLevel: number;
  unlocks: string[];
  onContinue: () => void;
}

export function LevelUpCelebration({ newLevel, unlocks, onContinue }: LevelUpCelebrationProps) {
  const { ageBand } = useAgePresentation();
  const presentation = AGE_ADAPTIVE_PROGRESSION[ageBand];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="animate-in zoom-in-95 surface-panel max-w-md p-8 text-center">
        <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
          <Sparkles className="size-12 text-primary-foreground" aria-hidden />
        </div>

        <h2 className="font-display text-3xl font-bold">
          {presentation.vocabulary.level} {newLevel}!
        </h2>
        <p className="mt-2 text-muted-foreground">
          {presentation.rewardLanguage === "playful"
            ? "You're getting really good at this!"
            : presentation.rewardLanguage === "balanced"
            ? "Great progress! Keep learning."
            : "Your skills are advancing."}
        </p>

        {unlocks.length > 0 && (
          <div className="mt-6 rounded-xl bg-secondary/10 p-4">
            <p className="text-sm font-semibold text-secondary">You unlocked:</p>
            <ul className="mt-2 space-y-1">
              {unlocks.map((unlock, i) => (
                <li key={i} className="text-sm text-secondary/80">
                  ✓ {unlock}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onContinue}
          className="mt-6 w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
}

/**
 * IMPORTANT: Educational Design
 *
 * - XP rewards meaningful learning actions only
 * - Level-ups unlock new content, not just numbers
 * - De-emphasized for older learners (12-14)
 * - Celebrations are positive, not manipulative
 * - No pressure to grind XP
 */
