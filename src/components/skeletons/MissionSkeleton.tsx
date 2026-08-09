/**
 * Phase 19: Mission Loading Skeletons
 */

import { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Skeleton for mission card
 */
export function MissionCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("surface-card space-y-4 p-6", className)}>
      {/* Title */}
      <Skeleton className="h-6 w-3/4" variant="text" />

      {/* Description */}
      <SkeletonText lines={2} />

      {/* Progress bar */}
      <Skeleton className="h-2 w-full rounded-full" />

      {/* Metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SkeletonAvatar size="sm" />
          <Skeleton className="h-4 w-20" variant="text" />
        </div>
        <Skeleton className="h-4 w-16" variant="text" />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Skeleton for mission list
 */
export function MissionListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <MissionCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for mission page
 */
export function MissionPageSkeleton() {
  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" variant="text" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" variant="text" />
      </div>

      {/* Title */}
      <Skeleton className="h-10 w-2/3" variant="text" />

      {/* Stage rail + content */}
      <div className="flex gap-6">
        {/* Stage rail */}
        <div className="w-[200px] space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-6">
          <SkeletonCard />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for mission briefing
 */
export function MissionBriefingSkeleton() {
  return (
    <div className="surface-panel space-y-6 p-8">
      {/* Character + Title */}
      <div className="flex items-start gap-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-3/4" variant="text" />
          <Skeleton className="h-4 w-1/2" variant="text" />
        </div>
      </div>

      {/* Premise */}
      <SkeletonText lines={4} />

      {/* Objectives */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-5 flex-1" variant="text" />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Skeleton className="h-12 flex-1 rounded-md" />
        <Skeleton className="h-12 w-32 rounded-md" />
      </div>
    </div>
  );
}
