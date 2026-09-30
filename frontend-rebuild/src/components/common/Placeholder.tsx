/**
 * Placeholder for a route whose real surface is built in a later task. It is
 * NOT mock data — it honestly states the surface is under construction and
 * names the backend it will consume, so no fake content ships to production.
 * Every placeholder is tracked in the Master Execution Control queue.
 */
export function Placeholder({ title, backend }: { title: string; backend?: string }) {
  return (
    <section className="rounded-card border border-line bg-white p-8 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Under construction</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-ink-900">{title}</h1>
      <p className="mt-2 max-w-prose text-sm text-ink-500">
        This surface is part of the USAM rebuild and will be connected to real backend data before it ships.
      </p>
      {backend && (
        <p className="mt-3 font-mono text-xs text-ink-400">Backend: {backend}</p>
      )}
    </section>
  )
}
