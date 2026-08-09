/**
 * Phase 19: Skill Graph Loading Skeleton
 */

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for skill graph
 */
export function SkillGraphSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" variant="text" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Domain stats */}
      <div className="grid grid-cols-3 gap-4 lg:grid-cols-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="surface-card space-y-2 p-4">
            <Skeleton className="h-4 w-full" variant="text" />
            <Skeleton className="h-6 w-16" variant="text" />
          </div>
        ))}
      </div>

      {/* Skill nodes */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="surface-card space-y-3 p-4">
            <Skeleton className="h-5 w-full" variant="text" />
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" variant="text" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for skill detail page
 */
export function SkillDetailSkeleton() {
  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" variant="text" />
        <Skeleton className="h-5 w-1/2" variant="text" />
      </div>

      {/* Mastery ladder */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-10 flex-1 rounded-md" />
        ))}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-card space-y-2 p-4">
            <Skeleton className="h-4 w-full" variant="text" />
            <Skeleton className="h-8 w-16" variant="text" />
          </div>
        ))}
      </div>

      {/* Evidence */}
      <div className="surface-panel space-y-4 p-6">
        <Skeleton className="h-6 w-32" variant="text" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
              <Skeleton className="size-10 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" variant="text" />
                <Skeleton className="h-4 w-1/2" variant="text" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
