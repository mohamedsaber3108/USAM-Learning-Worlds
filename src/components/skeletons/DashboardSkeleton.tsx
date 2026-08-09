/**
 * Phase 19: Dashboard Loading Skeletons
 */

import { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar } from "@/components/ui/skeleton";

/**
 * Skeleton for home dashboard
 */
export function HomeDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Greeting + companion */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" variant="text" />
          <Skeleton className="h-5 w-64" variant="text" />
        </div>
        <SkeletonAvatar size="lg" />
      </div>

      {/* Daily path */}
      <div className="surface-panel space-y-4 p-6">
        <Skeleton className="h-6 w-32" variant="text" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-5 w-3/4" variant="text" />
                <Skeleton className="h-4 w-1/2" variant="text" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Recent activity */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" variant="text" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-4">
              <Skeleton className="size-12 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-full" variant="text" />
                <Skeleton className="h-4 w-2/3" variant="text" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for parent dashboard
 */
export function ParentDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-card space-y-2 p-4">
            <Skeleton className="h-4 w-full" variant="text" />
            <Skeleton className="h-8 w-20" variant="text" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-panel space-y-4 p-6">
          <Skeleton className="h-6 w-40" variant="text" />
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="surface-panel space-y-4 p-6">
          <Skeleton className="h-6 w-40" variant="text" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>

      {/* Recent insights */}
      <div className="surface-panel space-y-6 p-6">
        <Skeleton className="h-6 w-48" variant="text" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-lg border p-4">
              <Skeleton className="h-5 w-full" variant="text" />
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
