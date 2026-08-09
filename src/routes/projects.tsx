import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { ProjectCard } from "@/components/learning/Cards";
import { projectService, queryKeys } from "@/services";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — USAM for Kids" },
      {
        name: "description",
        content:
          "Project-based learning: briefs, planning, building, feedback and publishing, mentored by characters.",
      },
      { property: "og:title", content: "Projects — USAM for Kids" },
      {
        property: "og:description",
        content: "Real projects that assess real competencies, from brief to published work.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const projectsQuery = useQuery({ queryKey: queryKeys.projects, queryFn: projectService.list });
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Projects"
        title="Build something real"
        description="Projects are where competencies are demonstrated, not just practised. Each stage has mentor feedback attached."
      />
      <AsyncBoundary query={projectsQuery} loadingLabel="Loading projects">
        {(projects) => (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
