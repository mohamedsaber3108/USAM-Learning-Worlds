/**
 * Phase 15: Parental Controls for Community Features
 *
 * CRITICAL: Parents must have full control and visibility
 */
import type { ParentalCommunityControls, SafetyDashboard } from "@/types/community";
import { Shield, Eye, Bell, UserCheck, Lock, Activity, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ParentalControlsPanelProps {
  controls: ParentalCommunityControls;
  onUpdate: (controls: Partial<ParentalCommunityControls>) => Promise<void>;
}

export function ParentalControlsPanel({ controls, onUpdate }: ParentalControlsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Master Switch */}
      <div className="surface-panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-primary" aria-hidden />
              <h3 className="font-display text-lg font-semibold">Community Features</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Allow your child to participate in teams, showcases, and community events.
              You can control individual features below.
            </p>
          </div>
          <Switch
            checked={controls.communityEnabled}
            onCheckedChange={(enabled) => onUpdate({ communityEnabled: enabled })}
          />
        </div>
      </div>

      {/* Individual Features */}
      <div className="space-y-3">
        <h4 className="font-semibold">What Your Child Can Do</h4>
        <div className="space-y-2">
          <FeatureToggle
            icon={UserCheck}
            label="Join Teams & Guilds"
            description="Collaborate with other learners on projects and missions"
            enabled={controls.canJoinGroups}
            onToggle={(enabled) => onUpdate({ canJoinGroups: enabled })}
            disabled={!controls.communityEnabled}
          />
          <FeatureToggle
            icon={Activity}
            label="Participate in Challenges"
            description="Join learning challenges and competitions"
            enabled={controls.canJoinChallenges}
            onToggle={(enabled) => onUpdate({ canJoinChallenges: enabled })}
            disabled={!controls.communityEnabled}
          />
          <FeatureToggle
            icon={Eye}
            label="Showcase Projects"
            description="Share completed projects with the community"
            enabled={controls.canShowcasePublicly}
            onToggle={(enabled) => onUpdate({ canShowcasePublicly: enabled })}
            disabled={!controls.communityEnabled}
          />
          <FeatureToggle
            icon={Bell}
            label="Give & Receive Peer Feedback"
            description="Exchange structured feedback on projects"
            enabled={controls.canGivePeerFeedback}
            onToggle={(enabled) => onUpdate({ canGivePeerFeedback: enabled })}
            disabled={!controls.communityEnabled}
          />
          <FeatureToggle
            icon={Activity}
            label="Join Events"
            description="Participate in workshops and community events"
            enabled={controls.canJoinEvents}
            onToggle={(enabled) => onUpdate({ canJoinEvents: enabled })}
            disabled={!controls.communityEnabled}
          />
        </div>
      </div>

      {/* Approval Requirements */}
      <div className="surface-panel p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="size-5 text-secondary" aria-hidden />
          <h4 className="font-semibold">Require Your Approval For</h4>
        </div>
        <div className="space-y-3">
          <ApprovalCheckbox
            label="Joining a team or guild"
            description="You'll get a notification to approve or deny"
            checked={controls.requireApprovalFor.includes("join-group")}
            onCheckedChange={(checked) => {
              const updated = checked
                ? [...controls.requireApprovalFor, "join-group"]
                : controls.requireApprovalFor.filter((a) => a !== "join-group");
              onUpdate({ requireApprovalFor: updated as ParentalCommunityControls["requireApprovalFor"] });
            }}
          />
          <ApprovalCheckbox
            label="Showcasing a project"
            description="Review project before it's publicly shared"
            checked={controls.requireApprovalFor.includes("showcase")}
            onCheckedChange={(checked) => {
              const updated = checked
                ? [...controls.requireApprovalFor, "showcase"]
                : controls.requireApprovalFor.filter((a) => a !== "showcase");
              onUpdate({ requireApprovalFor: updated as ParentalCommunityControls["requireApprovalFor"] });
            }}
          />
          <ApprovalCheckbox
            label="Giving peer feedback"
            description="Review feedback before it's sent"
            checked={controls.requireApprovalFor.includes("feedback")}
            onCheckedChange={(checked) => {
              const updated = checked
                ? [...controls.requireApprovalFor, "feedback"]
                : controls.requireApprovalFor.filter((a) => a !== "feedback");
              onUpdate({ requireApprovalFor: updated as ParentalCommunityControls["requireApprovalFor"] });
            }}
          />
          <ApprovalCheckbox
            label="Registering for events"
            description="Approve event participation in advance"
            checked={controls.requireApprovalFor.includes("event")}
            onCheckedChange={(checked) => {
              const updated = checked
                ? [...controls.requireApprovalFor, "event"]
                : controls.requireApprovalFor.filter((a) => a !== "event");
              onUpdate({ requireApprovalFor: updated as ParentalCommunityControls["requireApprovalFor"] });
            }}
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="surface-panel p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="size-5 text-secondary" aria-hidden />
          <h4 className="font-semibold">Notify Me When</h4>
        </div>
        <div className="space-y-3">
          <ApprovalCheckbox
            label="Content is reported or flagged"
            description="If your child's content or a report they made is reviewed"
            checked={controls.notifyParentFor.includes("reports")}
            onCheckedChange={(checked) => {
              const updated = checked
                ? [...controls.notifyParentFor, "reports"]
                : controls.notifyParentFor.filter((n) => n !== "reports");
              onUpdate({ notifyParentFor: updated as ParentalCommunityControls["notifyParentFor"] });
            }}
          />
          <ApprovalCheckbox
            label="Content is flagged by moderators"
            description="If moderators flag any of your child's content"
            checked={controls.notifyParentFor.includes("flags")}
            onCheckedChange={(checked) => {
              const updated = checked
                ? [...controls.notifyParentFor, "flags"]
                : controls.notifyParentFor.filter((n) => n !== "flags");
              onUpdate({ notifyParentFor: updated as ParentalCommunityControls["notifyParentFor"] });
            }}
          />
          <ApprovalCheckbox
            label="New community connections"
            description="When your child joins a new team or guild"
            checked={controls.notifyParentFor.includes("new-connections")}
            onCheckedChange={(checked) => {
              const updated = checked
                ? [...controls.notifyParentFor, "new-connections"]
                : controls.notifyParentFor.filter((n) => n !== "new-connections");
              onUpdate({ notifyParentFor: updated as ParentalCommunityControls["notifyParentFor"] });
            }}
          />
          <ApprovalCheckbox
            label="All community activity"
            description="Get notified for every community interaction"
            checked={controls.notifyParentFor.includes("all")}
            onCheckedChange={(checked) => {
              const updated = checked
                ? [...controls.notifyParentFor, "all"]
                : controls.notifyParentFor.filter((n) => n !== "all");
              onUpdate({ notifyParentFor: updated as ParentalCommunityControls["notifyParentFor"] });
            }}
          />
        </div>
      </div>

      {/* Safety Information */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="flex-1 space-y-2 text-sm">
            <p className="font-semibold text-primary">How We Keep Your Child Safe</p>
            <ul className="space-y-1 text-primary/80">
              <li>✓ All messages use structured templates (no freeform chat)</li>
              <li>✓ Every piece of content is moderated before sharing</li>
              <li>✓ Your child can report and block at any time</li>
              <li>✓ You can see all their community activity</li>
              <li>✓ Adult mentors supervise group activities</li>
              <li>✓ Age-appropriate access rules are enforced</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureToggle({
  icon: Icon,
  label,
  description,
  enabled,
  onToggle,
  disabled,
}: {
  icon: typeof Shield;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-lg border p-4",
        disabled && "opacity-50"
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 text-muted-foreground" aria-hidden />
        <div className="flex-1">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} disabled={disabled} />
    </div>
  );
}

function ApprovalCheckbox({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={label}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-0.5"
      />
      <div className="flex-1">
        <label htmlFor={label} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

/* -------------------------------- Safety Dashboard ------------------------------- */

interface ParentSafetyDashboardProps {
  dashboard: SafetyDashboard;
}

export function ParentSafetyDashboard({ dashboard }: ParentSafetyDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Activity Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Teams Joined"
          value={dashboard.recentActivity.teamsJoined}
          icon={UserCheck}
        />
        <StatCard
          label="Messages Received"
          value={dashboard.recentActivity.messagesReceived}
          icon={Bell}
        />
        <StatCard
          label="Showcases Created"
          value={dashboard.recentActivity.showcasesCreated}
          icon={Eye}
        />
        <StatCard
          label="Feedback Given"
          value={dashboard.recentActivity.feedbackGiven}
          icon={Activity}
        />
      </div>

      {/* Safety Metrics */}
      <div className="surface-panel p-6">
        <h3 className="mb-4 font-display text-lg font-semibold">Safety Metrics</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <SafetyMetric
            label="Reports Received"
            value={dashboard.safetyMetrics.reportsReceived}
            description="Times your child's content was reported"
            alertLevel={dashboard.safetyMetrics.reportsReceived > 0 ? "warning" : "normal"}
          />
          <SafetyMetric
            label="Reports Submitted"
            value={dashboard.safetyMetrics.reportsSubmitted}
            description="Times your child reported something"
            alertLevel="normal"
          />
          <SafetyMetric
            label="Blocked Users"
            value={dashboard.safetyMetrics.blockedUsers}
            description="Users your child has blocked"
            alertLevel="normal"
          />
          <SafetyMetric
            label="Flagged Content"
            value={dashboard.safetyMetrics.flaggedContent}
            description="Your child's content flagged for review"
            alertLevel={dashboard.safetyMetrics.flaggedContent > 0 ? "warning" : "normal"}
          />
        </div>
      </div>

      {/* Pending Approvals */}
      {dashboard.pendingApprovals.length > 0 && (
        <div className="surface-panel p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" aria-hidden />
            <h3 className="font-display text-lg font-semibold">Pending Approvals</h3>
            <Badge variant="secondary">{dashboard.pendingApprovals.length}</Badge>
          </div>
          <div className="space-y-3">
            {dashboard.pendingApprovals.map((approval) => (
              <div
                key={approval.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4"
              >
                <div className="flex-1">
                  <p className="font-medium">{approval.type}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{approval.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Submitted {new Date(approval.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Shield;
}) {
  return (
    <div className="surface-panel p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

function SafetyMetric({
  label,
  value,
  description,
  alertLevel,
}: {
  label: string;
  value: number;
  description: string;
  alertLevel: "normal" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        alertLevel === "warning"
          ? "border-amber-200 bg-amber-50"
          : "border-border bg-surface-raised"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <p
          className={cn(
            "text-2xl font-bold",
            alertLevel === "warning" ? "text-amber-600" : "text-foreground"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * CRITICAL: Parent Empowerment
 *
 * ✅ Parents see ALL community activity
 * ✅ Parents control ALL community features
 * ✅ Parents can require approval for specific actions
 * ✅ Parents receive notifications based on their preferences
 * ✅ Safety metrics are transparent
 * ✅ Pending approvals are clearly visible
 * ✅ Easy to enable/disable features
 * ✅ Clear explanations of each setting
 *
 * Parents should feel informed and in control.
 */
