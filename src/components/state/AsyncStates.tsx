import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "Loading", rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label}</span>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {label}…
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-panel flex flex-col items-center gap-3 p-10 text-center">
      <Inbox className="size-8 text-muted-foreground" aria-hidden />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="surface-panel flex flex-col items-center gap-3 p-10 text-center">
      <AlertTriangle className="size-8 text-destructive" aria-hidden />
      <h3 className="text-lg font-semibold">Something didn't load</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Small helper so every screen handles loading / error / empty identically. */
export function AsyncBoundary<T>({
  query,
  emptyTitle = "Nothing here yet",
  emptyDescription = "New content will appear as your journey grows.",
  loadingLabel,
  children,
}: {
  query: { data: T | undefined; isPending: boolean; isError: boolean; refetch: () => void };
  emptyTitle?: string;
  emptyDescription?: string;
  loadingLabel?: string;
  children: (data: NonNullable<T>) => ReactNode;
}) {
  if (query.isPending) return <LoadingState label={loadingLabel ?? "Loading"} />;
  if (query.isError)
    return <ErrorState message="We couldn't reach your learning world." onRetry={query.refetch} />;
  const data = query.data;
  if (data == null || (Array.isArray(data) && data.length === 0))
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return <>{children(data)}</>;
}
