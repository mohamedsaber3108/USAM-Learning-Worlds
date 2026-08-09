/**
 * Phase 19: Project Loading Skeletons
 */

import { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonImage } from "@/components/ui/skeleton";

/**
 * Skeleton for project card
 */
export function ProjectCardSkeleton() {
  return (
    <div className="surface-card space-y-4 overflow-hidden">
      {/* Thumbnail */}
      <SkeletonImage aspectRatio="16/9" />

      {/* Content */}
      <div className="space-y-3 p-4">
        <Skeleton className="h-6 w-3/4" variant="text" />
        <SkeletonText lines={2} />

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" variant="text" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for project list
 */
export function ProjectListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for project page
 */
export function ProjectPageSkeleton() {
  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-10 w-2/3" variant="text" />
          <Skeleton className="h-5 w-1/2" variant="text" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Progress + state */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-2 flex-1 rounded-full" />
        <Skeleton className="h-6 w-16" variant="text" />
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Workspace */}
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <SkeletonCard />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          <div className="surface-panel space-y-3 p-4">
            <Skeleton className="h-6 w-24" variant="text" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="surface-panel space-y-3 p-4">
            <Skeleton className="h-6 w-32" variant="text" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="size-5 rounded-full" />
                  <Skeleton className="h-5 flex-1" variant="text" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
