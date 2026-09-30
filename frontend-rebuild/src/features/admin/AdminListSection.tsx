import { useQuery } from '@tanstack/react-query'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { SectionHeader, Table } from '@/components/ui'

/** Generic admin read section — fetches a list and renders it in the shared
 * Table primitive. Keeps admin data views consistent (no per-view one-offs). */
export function AdminListSection<T extends Record<string, unknown>>({
  title,
  queryKey,
  queryFn,
  columns,
  row,
}: {
  title: string
  queryKey: string
  queryFn: () => Promise<T[]>
  columns: string[]
  row: (item: T) => React.ReactNode[]
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
        <Table headers={columns} rows={data.map(row)} />
      )}
    </section>
  )
}
