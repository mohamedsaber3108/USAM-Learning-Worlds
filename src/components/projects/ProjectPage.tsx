/**
 * Phase 13: Complete Project Page
 *
 * Shows everything a learner needs to work on and complete a project:
 * - Goal and context
 * - Skills being developed
 * - Instructions
 * - Workspace
 * - AI support
 * - Progress and milestones
 * - Artifacts
 * - Reflection
 * - Feedback
 * - Portfolio status
 */
import type { Project, ProjectMilestone, ProjectArtifact, ProjectFeedback } from "@/types/projects";
import { ProjectStateBadge, ProjectStateProgress } from "./ProjectStateBadge";
import { PrivacyControls } from "./PrivacyControls";
import { MasteryBadge } from "@/components/curriculum/mastery-ui";
import { CharacterAvatar } from "@/components/character/CharacterAvatar";
import {
  Target,
  Sparkles,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  ArrowRight,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProjectPageProps {
  project: Project;
  onAdvanceState?: () => void;
  onAddArtifact?: () => void;
  onAddReflection?: () => void;
  onUpdateVisibility?: (visibility: Project["visibility"]) => void;
}

export function ProjectPage({
  project,
  onAdvanceState,
  onAddArtifact,
  onAddReflection,
  onUpdateVisibility,
}: ProjectPageProps) {
  const canEdit = project.state !== "completed" && project.state !== "featured";
  const completedMilestones = project.milestones.filter((m) => m.completed).length;
  const progressPercent = Math.round(project.progress * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-bold">{project.title}</h1>
            {project.missionContext && (
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium">Mission context:</span> {project.missionContext}
              </p>
            )}
          </div>
          <ProjectStateBadge state={project.state} />
        </div>

        <ProjectStateProgress state={project.state} />

        {/* Overall Progress */}
        <div className="surface-panel p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-muted-foreground">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span>
                  {completedMilestones}/{project.milestones.length} milestones
                </span>
                <span>·</span>
                <span>{project.artifacts.length} artifacts</span>
                <span>·</span>
                <span>{project.reflections.length} reflections</span>
              </div>
            </div>
            {canEdit && onAdvanceState && (
              <Button onClick={onAdvanceState} size="sm">
                Next Stage <ArrowRight className="ms-1.5 size-4 rtl:rotate-180" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Goal */}
          <section className="surface-panel p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-3">
                <Target className="size-5 text-primary" aria-hidden />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-semibold">Your Goal</h2>
                <p className="mt-2 text-muted-foreground">{project.goal}</p>
              </div>
            </div>
          </section>

          {/* Brief */}
          <section className="surface-panel p-6">
            <h2 className="font-display text-lg font-semibold">Project Brief</h2>
            <div className="mt-3 prose prose-sm max-w-none text-muted-foreground">
              {project.brief}
            </div>
          </section>

          {/* Skills */}
          <section className="surface-panel p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-secondary/10 p-3">
                <Sparkles className="size-5 text-secondary" aria-hidden />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-semibold">Skills You'll Develop</h2>
                <div className="mt-4 space-y-3">
                  {project.skillConnections.map((sc) => (
                    <SkillConnectionCard key={sc.skillId} connection={sc} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Instructions */}
          <section className="surface-panel p-6">
            <h2 className="font-display text-lg font-semibold">Instructions</h2>
            <div className="mt-3 prose prose-sm max-w-none text-muted-foreground">
              {project.instructions}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3.5" aria-hidden />
              <span>Estimated time: {project.estimatedHours} hours</span>
            </div>
          </section>

          {/* AI Support */}
          {project.aiSupportEnabled && (
            <section className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div className="flex-1">
                <h3 className="font-semibold text-primary">AI Support Available</h3>
                <p className="mt-1 text-sm text-primary/80">
                  Your companion can help you brainstorm, review your work, and suggest next steps.
                  Just ask!
                </p>
              </div>
            </section>
          )}
        </TabsContent>

        {/* Workspace Tab */}
        <TabsContent value="workspace" className="space-y-6">
          <ProjectWorkspace project={project} canEdit={canEdit} />
          {onAddArtifact && (
            <Button onClick={onAddArtifact} variant="outline" className="w-full">
              <FileText className="me-2 size-4" />
              Add Artifact
            </Button>
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <MilestonesSection milestones={project.milestones} canEdit={canEdit} />
          <ArtifactsSection artifacts={project.artifacts} />
          <ReflectionsSection
            reflections={project.reflections}
            onAddReflection={onAddReflection}
            canEdit={canEdit}
          />
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <FeedbackSection feedback={project.feedback} mentorId={project.mentorCharacterId} />
        </TabsContent>
      </Tabs>

      {/* Portfolio Status */}
      <section className="surface-panel p-6">
        <h2 className="font-display text-lg font-semibold">Portfolio Status</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Visibility</p>
            {onUpdateVisibility ? (
              <PrivacyControls
                currentVisibility={project.visibility}
                onChangeVisibility={onUpdateVisibility}
              />
            ) : (
              <ProjectStateBadge state={project.state} showIcon={false} />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Portfolio Status</p>
            <p className="text-lg font-semibold capitalize">{project.portfolioStatus}</p>
          </div>
        </div>
        {project.state === "featured" && project.featuredReason && (
          <div className="mt-4 rounded-xl bg-primary/5 p-4">
            <p className="text-sm font-medium text-primary">Why this was featured:</p>
            <p className="mt-1 text-sm text-primary/80">{project.featuredReason}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function SkillConnectionCard({ connection }: { connection: Project["skillConnections"][0] }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
      <div className="flex-1">
        <p className="text-sm font-medium">Skill Name Here</p>
        <div className="mt-1 flex items-center gap-2">
          <MasteryBadge state={connection.startingMastery} />
          <ArrowRight className="size-3 text-muted-foreground rtl:rotate-180" aria-hidden />
          <MasteryBadge state={connection.targetMastery} />
        </div>
      </div>
      {connection.isPrimaryEvidence && (
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          Primary Evidence
        </span>
      )}
    </div>
  );
}

function ProjectWorkspace({ project, canEdit }: { project: Project; canEdit: boolean }) {
  return (
    <div className="surface-panel p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">
          {project.workspaceType === "code" && "Code Workspace"}
          {project.workspaceType === "design" && "Design Workspace"}
          {project.workspaceType === "writing" && "Writing Workspace"}
          {project.workspaceType === "multimedia" && "Multimedia Workspace"}
          {project.workspaceType === "mixed" && "Mixed Workspace"}
        </h2>
        {canEdit && (
          <Button variant="outline" size="sm">
            <Play className="me-2 size-4" />
            Open Workspace
          </Button>
        )}
      </div>
      <div className="mt-6 flex items-center justify-center rounded-xl border-2 border-dashed border-border p-12 text-center">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Workspace will load here
          </p>
          <p className="text-xs text-muted-foreground">
            {canEdit ? "Click 'Open Workspace' to start building" : "Project completed"}
          </p>
        </div>
      </div>
    </div>
  );
}

function MilestonesSection({
  milestones,
  canEdit,
}: {
  milestones: ProjectMilestone[];
  canEdit: boolean;
}) {
  return (
    <div className="surface-panel p-6">
      <h2 className="font-display text-lg font-semibold">Milestones</h2>
      <div className="mt-4 space-y-3">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={cn(
              "rounded-xl border p-4",
              milestone.completed
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-surface-raised"
            )}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                className={cn(
                  "mt-0.5 size-5 shrink-0",
                  milestone.completed ? "text-primary" : "text-muted-foreground"
                )}
                aria-hidden
              />
              <div className="flex-1">
                <h3 className="font-semibold">{milestone.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
                {milestone.completionCriteria.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {milestone.completionCriteria.map((criteria, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 size-1 shrink-0 rounded-full bg-current" />
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {milestone.completed && milestone.completedAt && (
                  <p className="mt-2 text-xs text-primary">
                    Completed {new Date(milestone.completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArtifactsSection({ artifacts }: { artifacts: ProjectArtifact[] }) {
  if (artifacts.length === 0) {
    return (
      <div className="surface-panel p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No artifacts yet. Add your work as you build!
        </p>
      </div>
    );
  }

  return (
    <div className="surface-panel p-6">
      <h2 className="font-display text-lg font-semibold">Artifacts</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {artifacts.map((artifact) => (
          <a
            key={artifact.id}
            href={artifact.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-border p-4 transition-colors hover:border-primary/30"
          >
            {artifact.thumbnailUrl && (
              <img
                src={artifact.thumbnailUrl}
                alt=""
                className="aspect-video w-full rounded-lg object-cover"
              />
            )}
            <div className="mt-3">
              <h3 className="font-semibold group-hover:text-primary">{artifact.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{artifact.description}</p>
              <p className="mt-2 text-xs capitalize text-muted-foreground">{artifact.type}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function ReflectionsSection({
  reflections,
  onAddReflection,
  canEdit,
}: {
  reflections: Project["reflections"];
  onAddReflection?: () => void;
  canEdit: boolean;
}) {
  return (
    <div className="surface-panel p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Reflections</h2>
        {canEdit && onAddReflection && (
          <Button onClick={onAddReflection} variant="outline" size="sm">
            <MessageSquare className="me-2 size-4" />
            Add Reflection
          </Button>
        )}
      </div>
      <div className="mt-4 space-y-3">
        {reflections.map((reflection) => (
          <div key={reflection.id} className="rounded-xl border border-border p-4">
            <p className="text-sm font-medium text-muted-foreground">{reflection.prompt}</p>
            <p className="mt-2 text-sm">{reflection.response}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(reflection.timestamp).toLocaleDateString()}
            </p>
          </div>
        ))}
        {reflections.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No reflections yet. Pause to think about what you're learning!
          </p>
        )}
      </div>
    </div>
  );
}

function FeedbackSection({
  feedback,
  mentorId,
}: {
  feedback: ProjectFeedback[];
  mentorId: string;
}) {
  return (
    <div className="space-y-4">
      {feedback.map((fb) => (
        <div key={fb.id} className="surface-panel p-6">
          <div className="flex items-start gap-4">
            <CharacterAvatar characterId={fb.fromCharacterId} size="md" />
            <div className="flex-1 space-y-3">
              <p className="text-xs text-muted-foreground">
                {new Date(fb.timestamp).toLocaleDateString()}
              </p>

              {fb.strengths.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-green-700">What's Working Well</h3>
                  <ul className="mt-2 space-y-1">
                    {fb.strengths.map((strength, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {fb.nextSteps.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-primary">Next Steps</h3>
                  <ul className="mt-2 space-y-1">
                    {fb.nextSteps.map((step, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {fb.skillDemonstrated && (
                <div className="rounded-lg bg-secondary/10 p-3">
                  <p className="text-xs font-medium text-secondary">
                    Skill demonstrated: {fb.skillDemonstrated}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {feedback.length === 0 && (
        <div className="surface-panel p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Your mentor will give you feedback as you work
          </p>
        </div>
      )}
    </div>
  );
}
