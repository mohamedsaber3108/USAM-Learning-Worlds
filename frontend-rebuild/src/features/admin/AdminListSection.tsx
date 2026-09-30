import { useQuery } from '@tanstack/react-query'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, SectionHeader } from '@/components/ui/Card'

/** Generic admin read section: fetches a list and renders a labelled row per
 * item. Keeps the many admin data views consistent (no per-view one-offs). */
export function AdminListSection<T extends Record<string, unknown>>({
  title,
  queryKey,
  queryFn,
  primary,
  secondary,
}: {
  title: string
  queryKey: string
  queryFn: () => Promise<T[]>
  primary: (item: T) => string
  secondary?: (item: T) => string | undefined
}) {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: [queryKey], queryFn, retry: false })

  return (
    <section>
      <SectionHeader title={title} />
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {data.map((item, i) => (
            <Card key={i}>
              <p className="font-medium text-ink-900">{primary(item)}</p>
              {secondary?.(item) && <p className="text-xs text-ink-400">{secondary(item)}</p>}
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
