import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import { searchApi, type SearchResultItem } from '@/lib/api/endpoints'

/**
 * Header search — real frontend surface for the Search Engine
 * (backend `search.controller.ts` / `search.service.ts` ran a real
 * Postgres full-text search over missions/activities/concepts but had
 * zero frontend references before this pass — same "backend built,
 * frontend dead" bug class documented across Ticks 17-25 in
 * usam_kids_fix_progress.md, instance #10).
 *
 * Deliberately simple: a magnifier icon that expands to an input,
 * debounced query (300ms), dropdown of ranked results, click navigates
 * to the right detail route per result type.
 */

const TYPE_ROUTE: Record<SearchResultItem['type'], (id: string) => string> = {
  mission: (id) => `/missions/${id}`,
  activity: () => `/missions`,
  concept: (id) => `/learn/concepts/${id}`,
}

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const { data } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => searchApi.search(debounced).then((r) => r.data),
    enabled: open && debounced.length >= 2,
  })

  function handleClose() {
    setOpen(false)
    setQ('')
  }

  function handleSelect(item: SearchResultItem) {
    navigate(TYPE_ROUTE[item.type](item.id))
    handleClose()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
        aria-label="Search"
      >
        <Search className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="relative">
      <div className="flex items-center bg-white/10 rounded-full px-3 py-1.5 gap-2 min-w-[160px] sm:min-w-[220px]">
        <Search className="w-4 h-4 text-white/70 shrink-0" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search missions, activities..."
          className="bg-transparent text-white placeholder-white/50 text-sm outline-none flex-1 min-w-0"
        />
        <button onClick={handleClose} aria-label="Close search">
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {debounced.length >= 2 && (
        <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white rounded-xl shadow-lift border border-surface-200 z-50">
          {(!data || data.results.length === 0) && (
            <div className="px-4 py-6 text-center text-sm text-slate-400">No results</div>
          )}
          {data?.results.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelect(item)}
              className="block w-full text-left px-4 py-3 border-b border-surface-50 last:border-0 hover:bg-surface-50"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-primary-500">{item.type}</span>
                <span className="text-sm font-semibold text-slate-700 truncate">{item.title}</span>
              </div>
              <div
                className="text-xs text-slate-500 mt-0.5 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: item.snippet }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
