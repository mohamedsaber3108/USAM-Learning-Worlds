import { useState, useRef, useEffect, useMemo } from 'react'
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
 * A magnifier icon that expands to an input, debounced query (300ms),
 * results dropdown grouped by content type (missions/activities/
 * concepts), full keyboard navigation (arrow up/down + enter + escape),
 * and click/enter navigates to the right detail route per result type.
 */

const TYPE_ORDER: SearchResultItem['type'][] = ['mission', 'activity', 'concept']

const TYPE_LABEL: Record<SearchResultItem['type'], string> = {
  mission: 'Missions',
  activity: 'Activities',
  concept: 'Concepts',
}

const TYPE_ROUTE: Record<SearchResultItem['type'], (item: SearchResultItem) => string> = {
  mission: (item) => `/missions/${item.id}`,
  // Activities have no standalone detail route — they only render inside
  // a Mission's page (MissionDetailPage/MissionPlayerPage). Route to the
  // specific mission the search backend resolved (item.missionId, via
  // mission_activities) so clicking an activity result actually lands on
  // the mission that contains it, instead of always dumping the learner
  // on the generic /missions browse list regardless of what they clicked.
  activity: (item) => (item.missionId ? `/missions/${item.missionId}` : `/missions`),
  concept: (item) => `/learn/concepts/${item.id}`,
}

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

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

  // Flat list (ordered mission -> activity -> concept, ranked within each
  // group) drives both the grouped dropdown render and keyboard nav index,
  // so arrow-key position always matches what's visually highlighted.
  const flatResults = useMemo(() => {
    const results = data?.results ?? []
    return [...results].sort((a, b) => {
      const typeDiff = TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
      if (typeDiff !== 0) return typeDiff
      return b.rank - a.rank
    })
  }, [data])

  const groupedResults = useMemo(() => {
    const groups: Array<{ type: SearchResultItem['type']; items: SearchResultItem[] }> = []
    for (const type of TYPE_ORDER) {
      const items = flatResults.filter((r) => r.type === type)
      if (items.length > 0) groups.push({ type, items })
    }
    return groups
  }, [flatResults])

  // Reset keyboard selection whenever the visible result set changes so a
  // stale index from a previous query doesn't select the wrong row.
  useEffect(() => {
    setActiveIndex(-1)
  }, [flatResults])

  useEffect(() => {
    if (activeIndex >= 0) {
      itemRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  function handleClose() {
    setOpen(false)
    setQ('')
    setActiveIndex(-1)
  }

  function handleSelect(item: SearchResultItem) {
    navigate(TYPE_ROUTE[item.type](item))
    handleClose()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      handleClose()
      return
    }
    if (flatResults.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % flatResults.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? flatResults.length - 1 : i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = activeIndex >= 0 ? flatResults[activeIndex] : flatResults[0]
      if (target) handleSelect(target)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-2 min-w-11 min-h-11 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        aria-label="Search"
      >
        <Search className="w-5 h-5" />
      </button>
    )
  }

  let flatCursor = 0

  return (
    <div className="relative">
      <div className="flex items-center bg-white/10 rounded-full px-3 py-1.5 gap-2 min-w-[160px] sm:min-w-[220px]">
        <Search className="w-4 h-4 text-white/70 shrink-0" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search missions, activities..."
          role="combobox"
          aria-expanded={debounced.length >= 2}
          aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
          className="bg-transparent text-white placeholder-white/50 text-sm outline-none flex-1 min-w-0"
        />
        <button
          onClick={handleClose}
          aria-label="Close search"
          className="min-w-11 min-h-11 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-full"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {debounced.length >= 2 && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white rounded-xl shadow-lift border border-surface-200 z-50"
        >
          {groupedResults.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-slate-400">No results</div>
          )}
          {groupedResults.map((group) => (
            <div key={group.type}>
              <div className="px-4 pt-3 pb-1 text-[10px] uppercase font-bold text-slate-400 sticky top-0 bg-white">
                {TYPE_LABEL[group.type]}
              </div>
              {group.items.map((item) => {
                const index = flatCursor++
                const isActive = index === activeIndex
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    id={`search-result-${index}`}
                    role="option"
                    aria-selected={isActive}
                    ref={(el) => (itemRefs.current[index] = el)}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelect(item)}
                    className={`block w-full text-left px-4 py-3 border-b border-surface-50 last:border-0 ${
                      isActive ? 'bg-primary-50' : 'hover:bg-surface-50'
                    }`}
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
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
