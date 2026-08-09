/**
 * Phase 15: Safety Controls - Reporting and Blocking
 *
 * CRITICAL: Easy, visible, and child-friendly safety features
 */
import type { Report, ReportReason, BlockedUser } from "@/types/community";
import { REPORT_REASONS } from "@/types/community";
import { Flag, ShieldAlert, UserX, AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";

/* -------------------------------- Reporting ------------------------------- */

interface ReportButtonProps {
  targetType: Report["targetType"];
  targetId: string;
  onSubmit: (report: { reason: ReportReason; description: string }) => Promise<void>;
}

export function ReportButton({ targetType, targetId, onSubmit }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;

    setSubmitting(true);
    try {
      await onSubmit({ reason: reason as ReportReason, description });
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setReason("");
        setDescription("");
      }, 2000);
    } catch (error) {
      console.error("Failed to submit report", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="mr-2 size-4" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle>Report This</DialogTitle>
              <DialogDescription>
                Help us keep everyone safe. Tell us what's wrong and we'll review it quickly.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Safety notice */}
              <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <Shield className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-primary">You're Safe</p>
                  <p className="mt-1 text-primary/80">
                    Reports are private. The person won't know you reported them.
                  </p>
                </div>
              </div>

              {/* Reason selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">What's the problem?</label>
                <Select value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REPORT_REASONS).map(([key, { label, description }]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <p className="font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tell us more (optional)
                </label>
                <Textarea
                  placeholder="What happened? Any details that can help us..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={!reason || submitting} className="flex-1">
                  {submitting ? "Sending..." : "Submit Report"}
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>

              {/* Emergency note */}
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <p className="font-medium">If you're in danger right now:</p>
                <p className="mt-1">
                  Tell a trusted adult immediately, or call emergency services.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <ShieldAlert className="size-8 text-green-600" aria-hidden />
            </div>
            <h3 className="font-semibold">Report Received</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Thank you for keeping our community safe. We'll review this right away.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------- Blocking ------------------------------- */

interface BlockButtonProps {
  userId: string;
  userName: string;
  onBlock: (reason?: string) => Promise<void>;
}

export function BlockButton({ userId, userName, onBlock }: BlockButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [blocking, setBlocking] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const handleBlock = async () => {
    setBlocking(true);
    try {
      await onBlock(reason || undefined);
      setBlocked(true);
      setTimeout(() => {
        setOpen(false);
        setBlocked(false);
        setReason("");
      }, 2000);
    } catch (error) {
      console.error("Failed to block user", error);
    } finally {
      setBlocking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <UserX className="mr-2 size-4" />
          Block
        </Button>
      </DialogTrigger>
      <DialogContent>
        {!blocked ? (
          <>
            <DialogHeader>
              <DialogTitle>Block {userName}?</DialogTitle>
              <DialogDescription>
                Blocking means you won't see their content and they can't contact you.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* What happens */}
              <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">What happens when you block someone:</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>✓ You won't see their showcases or projects</li>
                  <li>✓ They can't send you messages or feedback</li>
                  <li>✓ You won't be matched in teams or challenges</li>
                  <li>✓ They won't know you blocked them</li>
                  <li>✓ You can unblock them later if you want</li>
                </ul>
              </div>

              {/* Optional reason */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Why are you blocking them? (optional, private)
                </label>
                <Textarea
                  placeholder="This helps us keep the community safe..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleBlock}
                  disabled={blocking}
                  variant="destructive"
                  className="flex-1"
                >
                  {blocking ? "Blocking..." : "Block User"}
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <UserX className="size-8 text-green-600" aria-hidden />
            </div>
            <h3 className="font-semibold">User Blocked</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You won't see content from {userName} anymore.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------- Blocked Users List ------------------------------- */

interface BlockedUsersListProps {
  blockedUsers: BlockedUser[];
  onUnblock: (userId: string) => Promise<void>;
}

export function BlockedUsersList({ blockedUsers, onUnblock }: BlockedUsersListProps) {
  if (blockedUsers.length === 0) {
    return (
      <div className="surface-panel p-8 text-center">
        <UserX className="mx-auto size-8 text-muted-foreground" aria-hidden />
        <p className="mt-2 text-sm text-muted-foreground">You haven't blocked anyone</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {blockedUsers.map((blocked) => (
        <div key={blocked.userId} className="surface-panel flex items-center justify-between p-4">
          <div>
            <p className="font-medium">User {blocked.userId}</p>
            <p className="text-xs text-muted-foreground">
              Blocked {new Date(blocked.blockedAt).toLocaleDateString()}
            </p>
            {blocked.reason && (
              <p className="mt-1 text-xs text-muted-foreground">Reason: {blocked.reason}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUnblock(blocked.userId)}
          >
            Unblock
          </Button>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- Safety Notice ------------------------------- */

export function SafetyNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-4">
      <div className="rounded-lg bg-secondary/10 p-2">
        <Shield className="size-5 text-secondary" aria-hidden />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-secondary">You're Protected</p>
        <p className="mt-1 text-sm text-secondary/80">
          All content is checked before it's shared. You can report or block anything
          that makes you uncomfortable.
        </p>
        <div className="mt-3 space-y-1 text-sm text-secondary/80">
          <p>✓ All messages are reviewed</p>
          <p>✓ Parents can see your activity</p>
          <p>✓ You can report or block anytime</p>
          <p>✓ Mentors are here to help</p>
        </div>
      </div>
    </div>
  );
}

/**
 * CRITICAL SAFETY FEATURES
 *
 * ✅ Reporting is easy and visible
 * ✅ Reports are private (reporter not revealed)
 * ✅ Clear categories for reporting
 * ✅ Emergency guidance included
 * ✅ Blocking is immediate and reversible
 * ✅ Blocked users don't know they're blocked
 * ✅ Clear explanation of what blocking does
 * ✅ Optional reason for blocking (helps safety team)
 * ✅ Can unblock later
 * ✅ Age-appropriate language
 * ✅ Reassuring tone (not scary)
 *
 * Users should feel safe and empowered.
 */
