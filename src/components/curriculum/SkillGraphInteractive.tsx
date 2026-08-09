import { useState, useMemo } from "react";
import type { Skill, LearningDomain } from "@/types/domain";
import { MasteryBadge } from "./mastery-ui";
import { SkillCard } from "./SkillDetail";
import {
  Languages,
  Code2,
  Sparkles,
  Palette,
  Scale,
  Puzzle,
  MessagesSquare,
  Laptop,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Phase 12: Interactive Skill Graph
 *
 * 9 Domains (as per Phase 12):
 * 1. English
 * 2. Coding
 * 3. AI
 * 4. Creative Thinking
 * 5. Critical Thinking
 * 6. Communication
 * 7. Entrepreneurship
 * 8. Digital Literacy
 * 9. STEM
 */

const DOMAIN_ICONS: Record<string, typeof Languages> = {
  "d-english": Languages,
  "d-coding": Code2,
  "d-ai": Sparkles,
  "d-creativity": Palette,
  "d-critical": Scale,
  "d-problem": Puzzle,
  "d-communication": MessagesSquare,
  "d-entrepreneurship": TrendingUp,
  "d-digital": Laptop,
  "d-stem": Puzzle,
};

interface SkillGraphProps {
  domains: LearningDomain[];
  skills: Skill[];
  onSkillClick?: (skill: Skill) => void;
}

export function SkillGraphInteractive({ domains, skills, onSkillClick }: SkillGraphProps) {
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<"all" | "in-progress" | "needs-review">("all");

  const filteredSkills = useMemo(() => {
    let filtered = skills;

    // Filter by domain
    if (selectedDomainId) {
      filtered = filtered.filter((s) => s.domainId === selectedDomainId);
    }

    // Filter by state
    if (filterState === "in-progress") {
      filtered = filtered.filter(
        (s) =>
          s.status === "exploring" ||
          s.status === "practicing" ||
          s.status === "developing"
      );
    } else if (filterState === "needs-review") {
      filtered = filtered.filter((s) => s.needsReview);
    }

    return filtered;
  }, [skills, selectedDomainId, filterState]);

  const domainStats = useMemo(() => {
    return domains.map((domain) => {
      const domainSkills = skills.filter((s) => s.domainId === domain.id);
      const mastered = domainSkills.filter((s) => s.status === "mastered").length;
      const proficient = domainSkills.filter((s) => s.status === "proficient").length;
      const developing = domainSkills.filter((s) => s.status === "developing").length;
      const needsReview = domainSkills.filter((s) => s.needsReview).length;
      const total = domainSkills.length;

      return {
        domain,
        total,
        mastered,
        proficient,
        developing,
        needsReview,
        progress: total > 0 ? ((mastered + proficient * 0.75) / total) * 100 : 0,
      };
    });
  }, [domains, skills]);

  return (
    <div className="space-y-6">
      {/* Domain Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {domainStats.map(({ domain, total, mastered, proficient, needsReview, progress }) => {
          const Icon = DOMAIN_ICONS[domain.id] || Puzzle;
          const isSelected = selectedDomainId === domain.id;

          return (
            <button
              key={domain.id}
              onClick={() => setSelectedDomainId(isSelected ? null : domain.id)}
              className={cn(
                "surface-panel group p-5 text-left transition-all",
                isSelected && "border-primary bg-primary/5"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      className="size-5 shrink-0"
                      style={{ color: domain.accentColor }}
                      aria-hidden
                    />
                    <h3 className="font-semibold group-hover:text-primary">{domain.shortName}</h3>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{domain.description}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2 text-[11px]">
                  {mastered > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                      {mastered} mastered
                    </span>
                  )}
                  {proficient > 0 && (
                    <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-secondary">
                      {proficient} proficient
                    </span>
                  )}
                  {needsReview > 0 && (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-destructive">
                      {needsReview} review
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">Show:</span>
        {[
          { value: "all" as const, label: "All Skills" },
          { value: "in-progress" as const, label: "In Progress" },
          { value: "needs-review" as const, label: "Needs Review" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setFilterState(filter.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filterState === filter.value
                ? "bg-primary text-primary-foreground"
                : "bg-surface-raised text-muted-foreground hover:bg-surface-raised/80"
            )}
          >
            {filter.label}
          </button>
        ))}

        {selectedDomainId && (
          <button
            onClick={() => setSelectedDomainId(null)}
            className="ml-auto text-sm font-medium text-primary hover:underline"
          >
            Clear domain filter
          </button>
        )}
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="surface-panel p-12 text-center">
          <p className="text-muted-foreground">
            {filterState === "needs-review"
              ? "No skills need review right now. Great work!"
              : "No skills match your current filters."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} onClick={() => onSkillClick?.(skill)} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Simplified skill graph showing relationships between skills
 */
interface SkillRelationshipGraphProps {
  skill: Skill;
  allSkills: Skill[];
  onSkillClick?: (skill: Skill) => void;
}

export function SkillRelationshipGraph({
  skill,
  allSkills,
  onSkillClick,
}: SkillRelationshipGraphProps) {
  const prerequisites = allSkills.filter((s) => skill.prerequisiteSkillIds.includes(s.id));
  const related = allSkills.filter((s) => skill.relatedSkillIds.includes(s.id));
  const unlocks = allSkills.filter((s) => s.prerequisiteSkillIds.includes(skill.id));

  return (
    <div className="space-y-6">
      {prerequisites.length > 0 && (
        <Section title="Prerequisites" description="Skills that come before this one">
          <SkillChips skills={prerequisites} onSkillClick={onSkillClick} />
        </Section>
      )}

      <div className="surface-panel p-6">
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-xl bg-primary/10 px-6 py-4">
            <span className="size-2 rounded-full bg-primary" aria-hidden />
            <span className="font-semibold">{skill.name}</span>
            <MasteryBadge state={skill.status} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <Section title="Related Skills" description="Skills often learned together">
          <SkillChips skills={related} onSkillClick={onSkillClick} />
        </Section>
      )}

      {unlocks.length > 0 && (
        <Section title="Unlocks" description="Skills you can learn next">
          <SkillChips skills={unlocks} onSkillClick={onSkillClick} />
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function SkillChips({
  skills,
  onSkillClick,
}: {
  skills: Skill[];
  onSkillClick?: (skill: Skill) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <button
          key={skill.id}
          onClick={() => onSkillClick?.(skill)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-4 py-2 text-sm transition-colors hover:border-primary/30 hover:bg-surface-raised/80"
        >
          <span>{skill.name}</span>
          <MasteryBadge state={skill.status} />
        </button>
      ))}
    </div>
  );
}
