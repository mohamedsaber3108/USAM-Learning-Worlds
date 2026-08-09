/**
 * Phase 13: Age-Adaptive Portfolio
 *
 * 8-9: Visual gallery (focus on images and what they made)
 * 10-11: Creator portfolio (focus on creation process)
 * 12-14: Professional-style portfolio (focus on skills demonstrated)
 */
import type { Portfolio, PortfolioProject, AGE_ADAPTIVE_PORTFOLIO } from "@/types/projects";
import type { AgeBand } from "@/types/domain";
import { ProjectStateBadge } from "./ProjectStateBadge";
import { PrivacyBadge } from "./PrivacyControls";
import { MasteryBadge } from "@/components/curriculum/mastery-ui";
import {
  Star,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgePresentation } from "@/design/AgePresentationProvider";

interface PortfolioViewProps {
  portfolio: Portfolio;
  onProjectClick?: (projectId: string) => void;
}

export function PortfolioView({ portfolio, onProjectClick }: PortfolioViewProps) {
  const { ageBand } = useAgePresentation();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">{portfolio.displayName}'s Portfolio</h1>
            {portfolio.bio && <p className="mt-2 text-muted-foreground">{portfolio.bio}</p>}
          </div>
          <PrivacyBadge visibility={portfolio.visibility} />
        </div>

        {/* Stats Bar */}
        <PortfolioStats portfolio={portfolio} ageBand={ageBand} />
      </div>

      {/* Age-Adaptive Content */}
      {ageBand === "8-9" && <VisualGallery portfolio={portfolio} onProjectClick={onProjectClick} />}
      {ageBand === "10-11" && <CreatorPortfolio portfolio={portfolio} onProjectClick={onProjectClick} />}
      {ageBand === "12-14" && <ProfessionalPortfolio portfolio={portfolio} onProjectClick={onProjectClick} />}
    </div>
  );
}

/* -------------------------------- Stats Bar ------------------------------- */

function PortfolioStats({ portfolio, ageBand }: { portfolio: Portfolio; ageBand: AgeBand }) {
  const stats = [
    { label: "Projects", value: portfolio.stats.completedProjects, show: true },
    { label: "Featured", value: portfolio.stats.featuredProjects, show: true },
    { label: "Skills Mastered", value: portfolio.stats.skillsMastered, show: ageBand !== "8-9" },
    { label: "Learning Hours", value: portfolio.stats.learningHours, show: ageBand === "12-14" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.filter((s) => s.show).map((stat) => (
        <div key={stat.label} className="surface-panel p-4">
          <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
          <p className="mt-1 font-display text-3xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- 8-9: Visual Gallery ------------------------------- */

function VisualGallery({
  portfolio,
  onProjectClick,
}: {
  portfolio: Portfolio;
  onProjectClick?: (id: string) => void;
}) {
  const projects = portfolio.projects.filter((p) => p.state === "completed" || p.state === "featured");

  return (
    <div className="space-y-6">
      {/* Featured Section */}
      {portfolio.featuredProjects.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="size-5 text-primary" aria-hidden />
            <h2 className="font-display text-xl font-bold">My Best Work</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.featuredProjects.map((project) => (
              <GalleryCard key={project.projectId} project={project} onClick={onProjectClick} />
            ))}
          </div>
        </section>
      )}

      {/* All Projects Gallery */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">Things I've Made</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <GalleryCard key={project.projectId} project={project} onClick={onProjectClick} />
          ))}
        </div>
      </section>

      {projects.length === 0 && (
        <div className="surface-panel p-12 text-center">
          <p className="text-muted-foreground">No completed projects yet. Keep building!</p>
        </div>
      )}
    </div>
  );
}

function GalleryCard({
  project,
  onClick,
}: {
  project: PortfolioProject;
  onClick?: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onClick?.(project.projectId)}
      className="group overflow-hidden rounded-xl border border-border bg-surface-raised transition-all hover:border-primary/30"
    >
      {project.thumbnailUrl ? (
        <img
          src={project.thumbnailUrl}
          alt=""
          className="aspect-video w-full object-cover"
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
          <Sparkles className="size-12 text-muted-foreground" aria-hidden />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold group-hover:text-primary">{project.title}</h3>
        {project.state === "featured" && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
            <Star className="size-3.5" aria-hidden />
            Featured
          </div>
        )}
      </div>
    </button>
  );
}

/* -------------------------------- 10-11: Creator Portfolio ------------------------------- */

function CreatorPortfolio({
  portfolio,
  onProjectClick,
}: {
  portfolio: Portfolio;
  onProjectClick?: (id: string) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Featured Projects */}
      {portfolio.featuredProjects.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="size-5 text-primary" aria-hidden />
            <h2 className="font-display text-2xl font-bold">Featured Projects</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {portfolio.featuredProjects.map((project) => (
              <CreatorProjectCard key={project.projectId} project={project} onClick={onProjectClick} />
            ))}
          </div>
        </section>
      )}

      {/* Timeline */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-secondary" aria-hidden />
          <h2 className="font-display text-2xl font-bold">My Journey</h2>
        </div>
        <PortfolioTimeline timeline={portfolio.timeline} />
      </section>

      {/* All Projects */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold">All Projects</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {portfolio.projects.map((project) => (
            <CreatorProjectCard key={project.projectId} project={project} onClick={onProjectClick} />
          ))}
        </div>
      </section>
    </div>
  );
}

function CreatorProjectCard({
  project,
  onClick,
}: {
  project: PortfolioProject;
  onClick?: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onClick?.(project.projectId)}
      className="group text-left"
    >
      <div className="overflow-hidden rounded-xl border border-border bg-surface-raised transition-all hover:border-primary/30">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt=""
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <Sparkles className="size-12 text-muted-foreground" aria-hidden />
          </div>
        )}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-semibold group-hover:text-primary">
              {project.title}
            </h3>
            <ProjectStateBadge state={project.state} showIcon={false} />
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{project.artifactsCount} artifacts</span>
            <span>·</span>
            <span>{project.skillsCount} skills</span>
            {project.completedAt && (
              <>
                <span>·</span>
                <span>{new Date(project.completedAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/* -------------------------------- 12-14: Professional Portfolio ------------------------------- */

function ProfessionalPortfolio({
  portfolio,
  onProjectClick,
}: {
  portfolio: Portfolio;
  onProjectClick?: (id: string) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Featured Projects */}
      {portfolio.featuredProjects.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold">Featured Work</h2>
          <div className="grid gap-6">
            {portfolio.featuredProjects.map((project) => (
              <ProfessionalProjectCard
                key={project.projectId}
                project={project}
                onClick={onProjectClick}
              />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Projects */}
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold">Projects</h2>
          <div className="space-y-4">
            {portfolio.projects.map((project) => (
              <ProfessionalProjectCard
                key={project.projectId}
                project={project}
                onClick={onProjectClick}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills Summary */}
          <div className="surface-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-4 text-secondary" aria-hidden />
              <h3 className="font-semibold">Skills</h3>
            </div>
            <div className="space-y-3">
              {portfolio.skills.slice(0, 8).map((skill) => (
                <div key={skill.skillId} className="space-y-1">
                  <p className="text-sm font-medium">{skill.skillName}</p>
                  <div className="flex items-center justify-between gap-2">
                    <MasteryBadge state={skill.currentMastery} />
                    <span className="text-xs text-muted-foreground">
                      {skill.projectsCount} projects
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="surface-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="size-4 text-primary" aria-hidden />
              <h3 className="font-semibold">Achievements</h3>
            </div>
            <div className="space-y-2">
              {portfolio.achievements.slice(0, 5).map((achievement) => (
                <div key={achievement.achievementId} className="text-sm">
                  <p className="font-medium">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(achievement.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="surface-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-4 text-muted-foreground" aria-hidden />
              <h3 className="font-semibold">Growth</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Learning hours</span>
                <span className="font-semibold">{portfolio.stats.learningHours}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skills mastered</span>
                <span className="font-semibold">{portfolio.stats.skillsMastered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total artifacts</span>
                <span className="font-semibold">{portfolio.stats.totalArtifacts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfessionalProjectCard({
  project,
  onClick,
}: {
  project: PortfolioProject;
  onClick?: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onClick?.(project.projectId)}
      className="surface-panel group w-full p-6 text-left transition-all hover:border-primary/30"
    >
      <div className="flex gap-6">
        {project.thumbnailUrl && (
          <img
            src={project.thumbnailUrl}
            alt=""
            className="size-32 shrink-0 rounded-lg object-cover"
          />
        )}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-xl font-semibold group-hover:text-primary">
              {project.title}
            </h3>
            <ProjectStateBadge state={project.state} showIcon={false} />
          </div>
          <p className="text-sm text-muted-foreground">{project.description}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>{project.skillsCount} skills demonstrated</span>
            <span>·</span>
            <span>{project.artifactsCount} artifacts</span>
            {project.completedAt && (
              <>
                <span>·</span>
                <span>Completed {new Date(project.completedAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/* -------------------------------- Timeline ------------------------------- */

function PortfolioTimeline({ timeline }: { timeline: Portfolio["timeline"] }) {
  if (timeline.length === 0) {
    return (
      <div className="surface-panel p-8 text-center">
        <p className="text-sm text-muted-foreground">Your learning journey will appear here</p>
      </div>
    );
  }

  return (
    <div className="surface-panel p-6">
      <div className="space-y-6">
        {timeline.map((entry, index) => (
          <div key={entry.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <span className="size-2 rounded-full bg-primary" />
              </div>
              {index < timeline.length - 1 && (
                <div className="w-0.5 flex-1 bg-border mt-2" />
              )}
            </div>
            <div className="flex-1 pb-6">
              <p className="text-xs text-muted-foreground">
                {new Date(entry.timestamp).toLocaleDateString()}
              </p>
              <h4 className="mt-1 font-semibold">{entry.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
