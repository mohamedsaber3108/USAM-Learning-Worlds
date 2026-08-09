import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flag, ShieldCheck, Timer, UserCheck } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { notificationService, queryKeys, safetyService } from "@/services";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety & Parents — USAM for Kids" },
      {
        name: "description",
        content:
          "Parental controls, privacy settings, session limits, reporting and AI safety states for young learners.",
      },
      { property: "og:title", content: "Safety & Parents — USAM for Kids" },
      {
        property: "og:description",
        content: "Child-safety architecture: approvals, moderation states and session controls.",
      },
    ],
  }),
  component: SafetyPage,
});

function SafetyPage() {
  const safetyQuery = useQuery({ queryKey: queryKeys.safety, queryFn: safetyService.getSettings });
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: notificationService.list,
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Safety"
        title="Parental controls & safety"
        description="These are frontend placeholders for real controls. Nothing here grants access that isn't implemented."
      />

      <AsyncBoundary query={safetyQuery} loadingLabel="Loading safety settings">
        {(s) => (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Tile
              icon={ShieldCheck}
              title="Parental controls"
              value={s.parentalControlsEnabled ? "Enabled" : "Disabled"}
              note={`Content filter: ${s.contentFilter}`}
            />
            <Tile
              icon={UserCheck}
              title="Pending approvals"
              value={String(s.pendingParentApprovals)}
              note="Sharing beyond family needs approval"
            />
            <Tile
              icon={Timer}
              title="Session limit"
              value={`${s.sessionLimitMinutes} min`}
              note="Learning session cap per day"
            />
            <Tile
              icon={Flag}
              title="Reporting"
              value="Available"
              note="Report content or behaviour in one tap"
            />
          </div>
        )}
      </AsyncBoundary>

      <section className="space-y-3">
        <SectionHeading title="AI safety states" hint="How the companion behaves at the edges." />
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            ["Blocked content", "Azouz declines and offers a safe alternative activity."],
            ["Off-topic request", "Redirected to the current learning objective."],
            ["Distress signal", "Escalates to a parent notification, never handled silently."],
            ["Model uncertainty", "Azouz says what it doesn't know instead of guessing."],
          ].map(([title, body]) => (
            <li key={title} className="surface-panel p-5">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <SectionHeading title="Recent notifications" />
        <AsyncBoundary query={notificationsQuery} loadingLabel="Loading notifications">
          {(items) => (
            <ul className="surface-panel divide-y divide-border">
              {items.map((n) => (
                <li key={n.id} className="p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <p className="min-w-0 font-medium">{n.title}</p>
                    <span className="shrink-0 rounded-full bg-surface-raised px-2.5 py-1 text-xs capitalize">
                      {n.kind}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                </li>
              ))}
            </ul>
          )}
        </AsyncBoundary>
      </section>
    </div>
  );
}

function Tile({
  icon: Icon,
  title,
  value,
  note,
}: {
  icon: typeof ShieldCheck;
  title: string;
  value: string;
  note: string;
}) {
  return (
    <article className="surface-panel p-5">
      <Icon className="size-5 text-secondary" aria-hidden />
      <h3 className="mt-3 text-sm text-muted-foreground">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </article>
  );
}
