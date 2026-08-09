/**
 * Phase 15: Moderation State Display
 *
 * CRITICAL: Users must clearly understand content moderation states
 *
 * All user-generated content shows its moderation status.
 */
import type { ModerationStatus, ModerationState } from "@/types/community";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const MODERATION_META: Record<
  ModerationState,
  {
    icon: typeof Clock;
    label: string;
    description: string;
    color: string;
    userMessage: string;
  }
> = {
  draft: {
    icon: FileText,
    label: "Draft",
    description: "Not submitted yet",
    color: "bg-gray-100 text-gray-700",
    userMessage: "This is a draft. Submit it when you're ready!",
  },
  pending: {
    icon: Clock,
    label: "Pending Review",
    description: "Waiting for approval",
    color: "bg-amber-100 text-amber-700",
    userMessage:
      "We're checking this to make sure it's safe. This usually takes a few minutes.",
  },
  approved: {
    icon: CheckCircle,
    label: "Approved",
    description: "Reviewed and public",
    color: "bg-green-100 text-green-700",
    userMessage: "This was approved and is now visible to others!",
  },
  rejected: {
    icon: XCircle,
    label: "Not Approved",
    description: "Needs changes",
    color: "bg-red-100 text-red-700",
    userMessage: "This wasn't approved. See below for what to fix.",
  },
  flagged: {
    icon: AlertTriangle,
    label: "Flagged for Review",
    description: "Under additional review",
    color: "bg-orange-100 text-orange-700",
    userMessage:
      "This needs extra review. It might take a bit longer than usual.",
  },
  removed: {
    icon: Trash2,
    label: "Removed",
    description: "Removed after approval",
    color: "bg-red-100 text-red-700",
    userMessage: "This was removed because it didn't follow our safety rules.",
  },
};

interface ModerationBadgeProps {
  status: ModerationStatus;
  className?: string;
}

export function ModerationBadge({ status, className }: ModerationBadgeProps) {
  const meta = MODERATION_META[status.state];
  const Icon = meta.icon;

  return (
    <Badge
      variant="outline"
      className={cn("inline-flex items-center gap-1.5", meta.color, className)}
      title={meta.description}
    >
      <Icon className="size-3" aria-hidden />
      {meta.label}
    </Badge>
  );
}

interface ModerationStatusDisplayProps {
  status: ModerationStatus;
  contentType?: string;
}

export function ModerationStatusDisplay({
  status,
  contentType = "content",
}: ModerationStatusDisplayProps) {
  const meta = MODERATION_META[status.state];
  const Icon = meta.icon;

  // Don't show anything for approved content (implicit)
  if (status.state === "approved") {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4",
        status.state === "rejected" || status.state === "removed"
          ? "border-red-200 bg-red-50"
          : status.state === "pending"
          ? "border-amber-200 bg-amber-50"
          : status.state === "flagged"
          ? "border-orange-200 bg-orange-50"
          : "border-border bg-surface-raised"
      )}
    >
      <div className="rounded-lg bg-background p-2">
        <Icon
          className={cn(
            "size-5",
            status.state === "rejected" || status.state === "removed"
              ? "text-red-600"
              : status.state === "pending"
              ? "text-amber-600"
              : status.state === "flagged"
              ? "text-orange-600"
              : "text-muted-foreground"
          )}
          aria-hidden
        />
      </div>
      <div className="flex-1">
        <p className="font-semibold">{meta.label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{meta.userMessage}</p>

        {/* Rejection reason */}
        {(status.state === "rejected" || status.state === "removed") &&
          status.reason && (
            <div className="mt-3 rounded-lg bg-background p-3">
              <p className="text-sm font-medium">Why:</p>
              <p className="mt-1 text-sm text-muted-foreground">{status.reason}</p>
            </div>
          )}

        {/* Guidance for fixes */}
        {status.state === "rejected" && status.guidance && (
          <div className="mt-3 rounded-lg bg-background p-3">
            <p className="text-sm font-medium">What to fix:</p>
            <p className="mt-1 text-sm text-muted-foreground">{status.guidance}</p>
          </div>
        )}

        {/* Review details */}
        {status.reviewedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            Reviewed {new Date(status.reviewedAt).toLocaleDateString()} by{" "}
            {status.reviewedBy === "auto" ? "automated system" : "moderator"}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Content submission flow - explains moderation
 */
interface SubmissionExplainerProps {
  contentType: string;
}

export function SubmissionExplainer({ contentType }: SubmissionExplainerProps) {
  return (
    <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-secondary/10 p-2">
          <CheckCircle className="size-5 text-secondary" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-secondary">Safety Check</p>
          <p className="mt-1 text-sm text-secondary/80">
            When you submit {contentType}, we check it to make sure it's safe
            for everyone. This usually takes just a few minutes!
          </p>
          <div className="mt-3 space-y-1 text-sm text-secondary/80">
            <p>✓ We check for safety</p>
            <p>✓ We make sure it follows the rules</p>
            <p>✓ You'll get a notification when it's approved</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact moderation status for lists
 */
export function ModerationStatusCompact({ status }: { status: ModerationStatus }) {
  const meta = MODERATION_META[status.state];

  // Don't show for approved
  if (status.state === "approved") {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <ModerationBadge status={status} />
      {status.state === "pending" && (
        <span className="text-muted-foreground">Usually takes a few minutes</span>
      )}
    </div>
  );
}

/**
 * IMPORTANT: Transparent Moderation
 *
 * Users should always know:
 * - What state their content is in
 * - Why it was rejected (if applicable)
 * - What they need to fix
 * - How long review takes
 *
 * We explain moderation in age-appropriate, non-scary language:
 * - "We're checking this to make sure it's safe"
 * - NOT "Your content is under review for violations"
 *
 * Clear, helpful, safe.
 */
