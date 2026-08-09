import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { Clock, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LearningDomain, Mission, Project, Challenge } from "@/types/domain";

function Glyph({ name, className }: { name: string; className?: string }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Circle;
  return <Icon className={className} aria-hidden strokeWidth={1.75} />;
}

export function DomainCard({
  domain,
  mastered,
  total,
}: {
  domain: LearningDomain;
  mastered: number;
  total: number;
}) {
  const pct = total ? Math.round((mastered / total) * 100) : 0;
  return (
    <Link
      to="/learn/$domainId"
      params={{ domainId: domain.id }}
      className="surface-panel group flex flex-col gap-3 p-5 transition-transform duration-200 hover:-translate-y-1"
    >
      <span
        className="grid size-11 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: `color-mix(in oklab, ${domain.accentColor} 22%, transparent)` }}
      >
        <Glyph name={domain.glyph} className="size-5" />
      </span>
      <div className="min-w-0">
        <h3 className="text-base font-semibold">{domain.shortName}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{domain.description}</p>
      </div>
      <div className="mt-auto space-y-1.5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${pct}%`, backgroundColor: domain.accentColor }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {mastered}/{total} competencies mastered
        </p>
      </div>
    </Link>
  );
}

export function MissionCard({ mission, domainName }: { mission: Mission; domainName: string }) {
  const locked = mission.status === "locked";
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {domainName}
          </p>
          <h3 className="mt-1 text-lg font-semibold">{mission.title}</h3>
        </div>
        {locked ? (
          <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
            {mission.status === "in-progress" ? "In progress" : "Available"}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{mission.premise}</p>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden /> {mission.estimatedMinutes} min
        </span>
        <span>{mission.objectiveIds.length} learning objectives</span>
        <span>Ages {mission.ageBands.join(", ")}</span>
      </div>
      {mission.progress > 0 && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-700"
            style={{ width: `${Math.round(mission.progress * 100)}%` }}
          />
        </div>
      )}
    </>
  );

  if (locked) {
    return (
      <div className="surface-panel flex flex-col gap-3 p-5 opacity-60" aria-disabled>
        {body}
        <p className="text-xs text-muted-foreground">
          Unlocks when earlier objectives reach proficiency.
        </p>
      </div>
    );
  }

  return (
    <Link
      to="/missions/$missionId"
      params={{ missionId: mission.id }}
      className={cn(
        "surface-panel flex flex-col gap-3 p-5 transition-transform duration-200 hover:-translate-y-1",
      )}
    >
      {body}
    </Link>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="surface-panel flex flex-col gap-3 p-5">
      <span className="w-fit rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-semibold capitalize text-secondary">
        {project.stage}
      </span>
      <h3 className="text-lg font-semibold">{project.title}</h3>
      <p className="text-sm text-muted-foreground">{project.brief}</p>
      <div className="mt-auto space-y-1.5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-secondary transition-[width] duration-700"
            style={{ width: `${Math.round(project.progress * 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {project.competencyIds.length} competencies assessed in this project
        </p>
      </div>
    </article>
  );
}

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  return (
    <article className="surface-panel flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold capitalize text-accent">
          {challenge.mode.replace("-", " ")}
        </span>
        <span className="text-xs text-muted-foreground">
          {challenge.participants.toLocaleString()} learners
        </span>
      </div>
      <h3 className="text-lg font-semibold">{challenge.title}</h3>
      <p className="text-sm text-muted-foreground">{challenge.description}</p>
      <p className="text-xs text-muted-foreground">Ages {challenge.ageBands.join(", ")}</p>
    </article>
  );
}
