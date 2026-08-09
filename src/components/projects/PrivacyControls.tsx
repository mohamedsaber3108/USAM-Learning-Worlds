/**
 * Phase 13: Privacy Controls
 *
 * IMPORTANT: Private by default, community sharing requires parent approval
 */
import type { ProjectVisibility } from "@/types/projects";
import { VISIBILITY_META } from "@/types/projects";
import { Lock, Eye, Users, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const VISIBILITY_ICONS: Record<ProjectVisibility, typeof Lock> = {
  private: Lock,
  family: Eye,
  community: Users,
};

interface PrivacyControlsProps {
  currentVisibility: ProjectVisibility;
  onChangeVisibility: (visibility: ProjectVisibility) => void;
  parentApprovalPending?: boolean;
}

export function PrivacyControls({
  currentVisibility,
  onChangeVisibility,
  parentApprovalPending = false,
}: PrivacyControlsProps) {
  const visibilityOptions: ProjectVisibility[] = ["private", "family", "community"];

  return (
    <div className="space-y-4">
      <Select value={currentVisibility} onValueChange={(v) => onChangeVisibility(v as ProjectVisibility)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {visibilityOptions.map((visibility) => {
            const meta = VISIBILITY_META[visibility];
            const Icon = VISIBILITY_ICONS[visibility];
            return (
              <SelectItem key={visibility} value={visibility}>
                <div className="flex items-center gap-2">
                  <Icon className="size-4" aria-hidden />
                  <div>
                    <p className="font-medium">{meta.label}</p>
                    <p className="text-xs text-muted-foreground">{meta.description}</p>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Warnings and Info */}
      {currentVisibility === "private" && (
        <InfoBox
          icon={Lock}
          title="Private"
          description="Only you can see this project. It won't appear in your portfolio for others."
          variant="default"
        />
      )}

      {currentVisibility === "family" && (
        <InfoBox
          icon={Eye}
          title="Family Sharing"
          description="Your parents can see this project in their parent dashboard."
          variant="default"
        />
      )}

      {currentVisibility === "community" && !parentApprovalPending && (
        <InfoBox
          icon={ShieldCheck}
          title="Community Sharing"
          description="Other USAM learners can see this. Your parent approved this setting."
          variant="success"
        />
      )}

      {currentVisibility === "community" && parentApprovalPending && (
        <InfoBox
          icon={AlertCircle}
          title="Pending Approval"
          description="Your parent needs to approve community sharing. It's currently visible to family only."
          variant="warning"
        />
      )}
    </div>
  );
}

function InfoBox({
  icon: Icon,
  title,
  description,
  variant,
}: {
  icon: typeof Lock;
  title: string;
  description: string;
  variant: "default" | "success" | "warning";
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3",
        variant === "success" && "border-green-200 bg-green-50",
        variant === "warning" && "border-amber-200 bg-amber-50",
        variant === "default" && "border-border bg-surface-raised"
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          variant === "success" && "text-green-600",
          variant === "warning" && "text-amber-600",
          variant === "default" && "text-muted-foreground"
        )}
        aria-hidden
      />
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

/**
 * Quick privacy toggle for project cards
 */
export function PrivacyBadge({ visibility }: { visibility: ProjectVisibility }) {
  const meta = VISIBILITY_META[visibility];
  const Icon = VISIBILITY_ICONS[visibility];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        visibility === "private" && "bg-gray-100 text-gray-700",
        visibility === "family" && "bg-blue-100 text-blue-700",
        visibility === "community" && "bg-green-100 text-green-700"
      )}
      title={meta.description}
    >
      <Icon className="size-3" aria-hidden />
      {meta.label}
    </span>
  );
}

/**
 * IMPORTANT: Safety and Privacy Compliance
 *
 * 1. Projects are PRIVATE by default
 * 2. Community sharing requires parent approval
 * 3. No public social profiles are created
 * 4. Learners control their own visibility settings
 * 5. Parents can override visibility at any time
 * 6. Portfolio sharing is opt-in, not opt-out
 */
