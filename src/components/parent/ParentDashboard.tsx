/**
 * Phase 16: Parent Dashboard
 *
 * CRITICAL: Educational insights, not surveillance
 * Visual storytelling, not spreadsheets
 * Observation-based language, never diagnostic
 */
import type { ParentDashboard, ObservationInsight } from "@/types/parent";
import {
  TrendingUp,
  Target,
  Sparkles,
  Clock,
  Calendar,
  Award,
  Shield,
  MessageSquare,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ParentDashboardProps {
  dashboard: ParentDashboard;
  onViewProject?: (projectId: string) => void;
  onViewSkill?: (skillId: string) => void;
  onViewSafety?: () => void;
}

export function ParentDashboardView({
  dashboard,
  onViewProject,
  onViewSkill,
  onViewSafety,
}: ParentDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold">
          {dashboard.childName}'s Learning Journey
        </h1>
        <p className="text-muted-foreground">
          Insights from the past week • Age {dashboard.ageBand}
        </p>
      </div>

      {/* Hero Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HeroCard
          icon={TrendingUp}
          label="Active Skills"
          value={dashboard.learningProgress.activeSkills.length.toString()}
          subtitle="Currently developing"
          color="text-primary"
        />
        <HeroCard
          icon={Award}
          label="Projects"
          value={dashboard.projectsOverview.activeProjects.length.toString()}
          subtitle="In progress"
          color="text-secondary"
        />
        <HeroCard
          icon={Clock}
          label="This Week"
          value={`${Math.round(dashboard.timeSpent.thisWeek.totalMinutes / 60)}h`}
          subtitle={`${dashboard.timeSpent.thisWeek.daysActive} active days`}
          color="text-primary"
        />
        <HeroCard
          icon={Shield}
          label="Safety"
          value={dashboard.safetyOverview.status === "all-clear" ? "All Clear" : "Needs Attention"}
          subtitle="Community settings"
          color={dashboard.safetyOverview.status === "all-clear" ? "text-green-600" : "text-amber-600"}
        />
      </div>

      {/* Learning Progress Summary */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <Sparkles className="size-6 text-primary" aria-hidden />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold">This Week's Progress</h2>
            <p className="mt-2 text-muted-foreground">
              {dashboard.learningProgress.summary}
            </p>
          </div>
        </div>

        {/* Recent Milestones */}
        {dashboard.learningProgress.recentMilestones.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold">Recent Milestones</h3>
            {dashboard.learningProgress.recentMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4"
              >
                <Award className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div className="flex-1">
                  <p className="font-semibold text-primary">{milestone.title}</p>
                  <p className="mt-1 text-sm text-primary/80">{milestone.description}</p>
                  <p className="mt-2 text-xs text-primary/60">{milestone.significance}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(milestone.achievedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Observations: Strengths */}
      {dashboard.learningProgress.strengths.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="size-5 text-secondary" aria-hidden />
            <h2 className="font-display text-xl font-semibold">Areas of Strength</h2>
          </div>
          <div className="space-y-4">
            {dashboard.learningProgress.strengths.map((insight) => (
              <ObservationCard key={insight.id} insight={insight} variant="positive" />
            ))}
          </div>
        </Card>
      )}

      {/* Observations: Practice Opportunities */}
      {dashboard.learningProgress.practiceOpportunities.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Target className="size-5 text-primary" aria-hidden />
            <h2 className="font-display text-xl font-semibold">
              Practice Opportunities
            </h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            These areas may benefit from additional practice or review.
          </p>
          <div className="space-y-4">
            {dashboard.learningProgress.practiceOpportunities.map((insight) => (
              <ObservationCard key={insight.id} insight={insight} variant="neutral" />
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations for Parents */}
      {dashboard.recommendations.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="size-5 text-amber-600" aria-hidden />
            <h2 className="font-display text-xl font-semibold">
              Things You Can Do
            </h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Actionable ways to support your child's learning.
          </p>
          <div className="space-y-3">
            {dashboard.recommendations
              .sort((a, b) => {
                const priority = { high: 0, medium: 1, low: 2 };
                return priority[a.priority] - priority[b.priority];
              })
              .map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onAction={() => {
                    if (rec.linkTo?.type === "project") onViewProject?.(rec.linkTo.id);
                    if (rec.linkTo?.type === "skill") onViewSkill?.(rec.linkTo.id);
                  }}
                />
              ))}
          </div>
        </Card>
      )}

      {/* Active Projects */}
      {dashboard.projectsOverview.activeProjects.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="size-5 text-primary" aria-hidden />
            <h2 className="font-display text-xl font-semibold">
              Projects in Progress
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {dashboard.projectsOverview.activeProjects.map((project) => (
              <button
                key={project.projectId}
                onClick={() => onViewProject?.(project.projectId)}
                className="group rounded-xl border border-border p-4 text-left transition-all hover:border-primary/30"
              >
                <h3 className="font-semibold group-hover:text-primary">
                  {project.title}
                </h3>
                <p className="mt-2 text-xs capitalize text-muted-foreground">
                  {project.state.replace("-", " ")}
                </p>
                <Progress value={project.progress * 100} className="mt-3 h-2" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {Math.round(project.progress * 100)}% complete
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {project.skillsBeingDeveloped.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Time Spent Visualization */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="size-5 text-secondary" aria-hidden />
          <h2 className="font-display text-xl font-semibold">
            Learning Time
          </h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          {dashboard.timeSpent.consistency.observation}
        </p>

        {/* This Week */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">This Week</span>
              <span className="font-semibold">
                {Math.round(dashboard.timeSpent.thisWeek.totalMinutes / 60)} hours
              </span>
            </div>
            <div className="space-y-2">
              {dashboard.timeSpent.thisWeek.byDomain.map((domain) => (
                <div key={domain.domainId}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{domain.domainName}</span>
                    <span>{Math.round(domain.minutes / 60)}h {domain.minutes % 60}m</span>
                  </div>
                  <Progress
                    value={(domain.minutes / dashboard.timeSpent.thisWeek.totalMinutes) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Distribution */}
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Daily Activity
            </p>
            <div className="flex items-end gap-2" style={{ height: "100px" }}>
              {dashboard.timeSpent.weeklyDistribution.map((day, index) => {
                const maxMinutes = Math.max(
                  ...dashboard.timeSpent.weeklyDistribution.map((d) => d.minutes)
                );
                const height = day.minutes > 0 ? (day.minutes / maxMinutes) * 100 : 5;
                return (
                  <div key={index} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-all",
                        day.minutes > 0 ? "bg-primary" : "bg-muted"
                      )}
                      style={{ height: `${height}%` }}
                      title={`${day.minutes} minutes`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Engagement Patterns */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="size-5 text-primary" aria-hidden />
          <h2 className="font-display text-xl font-semibold">
            Engagement Patterns
          </h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">{dashboard.engagementPatterns.summary}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium text-muted-foreground">Time Preferences</p>
              <p className="mt-2 text-sm">{dashboard.engagementPatterns.timePreferences.observation}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium text-muted-foreground">Session Patterns</p>
              <p className="mt-2 text-sm">
                {dashboard.engagementPatterns.sessionPatterns.observation}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Communication Activity (Privacy-Respecting) */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="size-5 text-secondary" aria-hidden />
          <h2 className="font-display text-xl font-semibold">
            Communication Activity
          </h2>
        </div>
        <p className="mb-4 text-sm">{dashboard.communicationActivity.summary}</p>
        <div className="space-y-2">
          {dashboard.communicationActivity.contexts.map((context, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div>
                <p className="text-sm font-medium capitalize">
                  {context.context}
                </p>
                <p className="text-xs text-muted-foreground">
                  {context.messageCount} messages
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Last: {new Date(context.lastActive).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {dashboard.communicationActivity.moderationNote}
        </p>
      </Card>

      {/* Safety Overview */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-secondary" aria-hidden />
            <h2 className="font-display text-xl font-semibold">Safety & Settings</h2>
          </div>
          <Button variant="outline" size="sm" onClick={onViewSafety}>
            Manage Settings
          </Button>
        </div>
        <p className="mb-4 text-sm">{dashboard.safetyOverview.summary}</p>
        {dashboard.safetyOverview.pendingApprovals > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="font-medium text-amber-900">
              {dashboard.safetyOverview.pendingApprovals}{" "}
              {dashboard.safetyOverview.pendingApprovals === 1 ? "item" : "items"} awaiting your
              approval
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function HeroCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className={cn("mt-2 font-display text-3xl font-bold", color)}>{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Icon className={cn("size-5", color)} aria-hidden />
      </div>
    </Card>
  );
}

function ObservationCard({
  insight,
  variant,
}: {
  insight: ObservationInsight;
  variant: "positive" | "neutral";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        variant === "positive"
          ? "border-green-200 bg-green-50"
          : "border-border bg-surface-raised"
      )}
    >
      <p className="font-semibold">{insight.observation}</p>
      <p className="mt-2 text-sm text-muted-foreground">{insight.interpretation}</p>
      {insight.evidence.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Evidence:</p>
          <ul className="space-y-0.5">
            {insight.evidence.map((e, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                • {e}
              </li>
            ))}
          </ul>
        </div>
      )}
      {insight.suggestion && (
        <p className="mt-3 text-sm font-medium text-primary">{insight.suggestion}</p>
      )}
    </div>
  );
}

function RecommendationCard({
  recommendation,
  onAction,
}: {
  recommendation: ParentDashboard["recommendations"][0];
  onAction?: () => void;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{recommendation.title}</h3>
            {recommendation.priority === "high" && (
              <Badge variant="secondary" className="text-[10px]">
                Priority
              </Badge>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{recommendation.reason}</p>
          <p className="mt-2 text-sm font-medium">{recommendation.action}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Why:</span> {recommendation.benefit}
          </p>
        </div>
        {recommendation.linkTo && onAction && (
          <Button size="sm" variant="outline" onClick={onAction}>
            {recommendation.linkTo.label}
            <ArrowRight className="ms-2 size-4 rtl:rotate-180" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * CRITICAL: Parent Experience Principles
 *
 * ✅ Use observation-based language
 * ✅ Show patterns, not raw data
 * ✅ Give actionable recommendations
 * ✅ Respect child's privacy (show activity, not content)
 * ✅ Visual storytelling over spreadsheets
 * ✅ Celebrate strengths
 * ✅ Frame practice opportunities positively
 *
 * ❌ NEVER make diagnostic claims
 * ❌ NEVER use labels (gifted, struggling, ADHD)
 * ❌ NEVER compare to other children
 * ❌ NEVER expose private conversations
 * ❌ NEVER present overwhelming data
 */
