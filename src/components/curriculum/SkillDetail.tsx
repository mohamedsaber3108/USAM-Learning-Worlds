import type { Skill } from "@/types/domain";
import { MasteryBadge, MasteryLadder } from "./mastery-ui";
import { EvidenceList, EvidenceDistribution } from "./EvidenceDisplay";
import { ArrowRight, Lock, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Phase 12: Complete skill representation
 *
 * Every skill shows:
 * - Status (mastery state)
 * - Level (progression)
 * - Confidence (0-1)
 * - Recent evidence
 * - Practice count
 * - Needs review flag
 * - Related skills
 * - Next recommendation
 */

interface SkillDetailProps {
  skill: Skill;
  relatedSkills?: Skill[];
  onStartRecommendation?: () => void;
  onViewRelated?: (skillId: string) => void;
}

export function SkillDetail({
  skill,
  relatedSkills = [],
  onStartRecommendation,
  onViewRelated,
}: SkillDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold">{skill.name}</h1>
            <p className="mt-2 text-muted-foreground">{skill.description}</p>
          </div>
          <MasteryBadge state={skill.status} className="shrink-0" />
        </div>

        {/* Needs Review Warning */}
        {skill.needsReview && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <TrendingUp className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-destructive">Needs Review</h3>
              <p className="mt-1 text-sm text-destructive/80">
                It's been a while since you practiced this. A short review will bring it back.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mastery Progress */}
      <div className="surface-panel p-6">
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <StatTile
              label="Level"
              value={skill.level.toString()}
              description="Progression through this skill"
            />
            <StatTile
              label="Confidence"
              value={`${Math.round(skill.confidence * 100)}%`}
              description="How reliably you demonstrate this"
            />
            <StatTile
              label="Practice Count"
              value={skill.practiceCount.toString()}
              description="Sessions spent practicing"
            />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Mastery Progression</h3>
            <MasteryLadder state={skill.status} />
          </div>
        </div>
      </div>

      {/* Next Recommendation */}
      {skill.nextRecommendation && (
        <div className="surface-panel p-5">
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Target className="size-5 text-primary" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold">Recommended Next</h3>
              <p className="mt-1 text-sm font-medium">{skill.nextRecommendation.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{skill.nextRecommendation.reason}</p>
              {onStartRecommendation && (
                <Button onClick={onStartRecommendation} className="mt-3" size="sm">
                  Start <ArrowRight className="ml-1.5 size-4" aria-hidden />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Evidence */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <EvidenceList
            evidence={skill.recentEvidence}
            title="Recent Evidence"
            emptyMessage="Keep working on activities to build evidence for this skill."
          />
        </div>
        <div className="space-y-4">
          <EvidenceDistribution evidence={skill.recentEvidence} />
        </div>
      </div>

      {/* Related Skills */}
      {relatedSkills.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-lg font-semibold">Related Skills</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedSkills.map((related) => (
              <button
                key={related.id}
                onClick={() => onViewRelated?.(related.id)}
                className="surface-panel group p-4 text-left transition-all hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold group-hover:text-primary">{related.name}</h4>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {related.description}
                    </p>
                  </div>
                  <MasteryBadge state={related.status} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prerequisites locked message */}
      {skill.prerequisiteSkillIds.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-muted bg-muted/30 p-4">
          <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0 flex-1 text-sm text-muted-foreground">
            <p className="font-medium">This skill builds on earlier learning</p>
            <p className="mt-1 text-xs">
              Master the prerequisite skills first to get the most from this one.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="font-display text-3xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

/**
 * Compact skill card for lists and grids
 */
interface SkillCardProps {
  skill: Skill;
  onClick?: () => void;
}

export function SkillCard({ skill, onClick }: SkillCardProps) {
  return (
    <button
      onClick={onClick}
      className="surface-panel group p-5 text-left transition-all hover:border-primary/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold group-hover:text-primary">{skill.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{skill.description}</p>
        </div>
        <MasteryBadge state={skill.status} className="shrink-0" />
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span>Level {skill.level}</span>
        <span>·</span>
        <span>{Math.round(skill.confidence * 100)}% confidence</span>
        <span>·</span>
        <span>{skill.practiceCount} practice sessions</span>
      </div>

      {skill.needsReview && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-destructive">
          <TrendingUp className="size-3.5" aria-hidden />
          Needs review
        </div>
      )}
    </button>
  );
}
