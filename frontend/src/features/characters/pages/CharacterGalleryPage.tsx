import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { charactersApi, type CharacterSummary } from '@/lib/api/endpoints'
import { CharacterAvatar } from '../components/CharacterAvatar'
import { CHARACTER_VISUALS, getCharacterVisual } from '../lib/characterVisuals'
import { LoadingState } from '@/components/common/CharacterState'

/**
 * The full 15-character roster ordering + unlock hints for the fallback
 * (mock-shape) path used until the backend's /characters/unlocked lands.
 * Azouz, Zein, Luma and Codey are the 4 core characters (unlocked from day
 * 1, per CharacterService.CORE_CHARACTER_NAMES on the backend); the rest
 * unlock progressively and these hints describe the same real trigger
 * conditions implemented in CharacterService.getUnlockedCharactersForLearner
 * (domain engagement, mission/project completion, XP, age band, etc.) in
 * plain child-facing language.
 */
const FALLBACK_ROSTER: Array<{ name: string; role: string; unlockHint: string; unlocked: boolean }> = [
  { name: 'Azouz', role: 'GUIDE', unlockHint: '', unlocked: true },
  { name: 'Zein', role: 'Explorer', unlockHint: 'Always with you from day one', unlocked: true },
  { name: 'Luma', role: 'English Coach', unlockHint: 'Always with you from day one', unlocked: true },
  { name: 'Codey', role: 'Coding Mentor', unlockHint: 'Always with you from day one', unlocked: true },
  { name: 'Nova', role: 'AI Mentor', unlockHint: 'Unlocks after exploring the AI Literacy domain', unlocked: false },
  { name: 'Mira', role: 'Creative Mentor', unlockHint: 'Unlocks after your first Arts or Creativity mission', unlocked: false },
  { name: 'Rami', role: 'Science Mentor', unlockHint: 'Unlocks after your first Science mission', unlocked: false },
  { name: 'Faris', role: 'Problem Solver', unlockHint: 'Unlocks after your first Critical Thinking mission', unlocked: false },
  { name: 'Tala', role: 'Communication Coach', unlockHint: 'Unlocks after submitting your first project', unlocked: false },
  { name: 'Adam', role: 'Entrepreneurship Mentor', unlockHint: 'Unlocks after your first Entrepreneurship mission', unlocked: false },
  { name: 'Byte', role: 'Digital Safety Guide', unlockHint: 'Unlocks after your first Digital Literacy mission (or automatically at age 10+)', unlocked: false },
  { name: 'Nour', role: 'Financial Literacy Mentor', unlockHint: 'Unlocks after your first Financial Literacy mission', unlocked: false },
  { name: 'Rex', role: 'Rival', unlockHint: 'Unlocks after you earn your first XP', unlocked: false },
  { name: 'Zara', role: 'Storyteller', unlockHint: 'Unlocks after completing your first mission', unlocked: false },
  { name: 'Atlas', role: 'World Guide', unlockHint: 'Unlocks after exploring 2+ different domains', unlocked: false },
]

interface RosterEntry {
  id?: string
  name: string
  role: string
  unlocked: boolean
  unlockHint: string
}

export function CharacterGalleryPage() {
  // Prefer the real backend list once it exists; fall back to the seeded
  // single-character roster + a static unlock-hint map otherwise. See the
  // FOLLOW-UP note on charactersApi in lib/api/endpoints.ts.
  const { data: unlockedData, isLoading: unlockedLoading } = useQuery({
    queryKey: ['characters', 'unlocked'],
    queryFn: () => charactersApi.getUnlocked().then((r) => r.data),
    retry: false,
  })

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['characters', 'list'],
    queryFn: () => charactersApi.list().then((r) => r.data),
    retry: false,
    enabled: !unlockedData,
  })

  // Azouz is the one character guaranteed to exist today via GET /characters/:id.
  const { data: azouz } = useQuery({
    queryKey: ['characters', 'azouz-fallback'],
    queryFn: () =>
      charactersApi
        .getById('28cd1b16-d6f5-4f04-9512-9bb36c560400')
        .then((r) => r.data)
        .catch(() => null),
    enabled: !unlockedData && !listData,
    retry: false,
  })

  const loading = unlockedLoading || listLoading

  const roster: RosterEntry[] = (() => {
    if (unlockedData?.length) {
      return unlockedData.map((c: CharacterSummary) => ({
        id: c.id,
        name: c.name,
        role: c.role,
        unlocked: c.isUnlocked ?? true,
        unlockHint: c.unlockHint ?? 'Keep learning to unlock this character',
      }))
    }
    if (listData?.length) {
      // /characters exists but has no per-learner unlock info — treat the
      // seeded roster as unlocked and everything else as the static roster.
      const byName = new Map(listData.map((c: CharacterSummary) => [c.name, c]))
      return FALLBACK_ROSTER.map((entry) => {
        const real = byName.get(entry.name)
        return real
          ? { id: real.id, name: real.name, role: real.role, unlocked: true, unlockHint: '' }
          : entry
      })
    }
    // Nothing from the list/unlocked endpoints yet — use Azouz (real, live)
    // plus the static roster for everyone else.
    return FALLBACK_ROSTER.map((entry) =>
      entry.name === 'Azouz' && azouz
        ? { id: azouz.id, name: azouz.name, role: azouz.role, unlocked: true, unlockHint: '' }
        : entry,
    )
  })()

  const unlockedCount = roster.filter((r) => r.unlocked).length

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
          My Companions <span className="text-slate-400 font-medium">· رفقاء رحلتي</span>
        </h1>
        <p className="text-slate-500 mt-1">
          Meet your mentors and companions. Locked characters show how to unlock them — keep
          learning to build your full team.
        </p>
        <p className="text-sm text-slate-400 mt-1" dir="rtl">
          اتعرّف على مرشديك ورفقاء رحلتك. الشخصيات المقفولة بتوريك إزاي تفتحها — استمر في التعلم
          لتكمل فريقك بالكامل.
        </p>
        <p className="text-xs font-semibold text-primary-600 mt-3">
          {unlockedCount} / {roster.length} unlocked
        </p>
      </header>

      {loading && <LoadingState character="Codey" message="Codey is loading your character crew..." />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roster.map((entry) => {
          const visual = getCharacterVisual(entry.name)
          const card = (
            <div
              key={entry.name}
              className={`card p-5 flex items-start gap-4 transition-shadow ${
                entry.unlocked ? 'hover:shadow-soft-md' : 'opacity-70'
              }`}
            >
              <CharacterAvatar name={entry.name} size="lg" locked={!entry.unlocked} />
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-slate-900 truncate flex items-baseline gap-2">
                  <span>{entry.name}</span>
                  {visual.nameAr && (
                    <span className="text-sm font-semibold text-slate-400" dir="rtl">
                      {visual.nameAr}
                    </span>
                  )}
                </h3>
                <p className="text-xs font-medium text-slate-400 mb-1">{entry.role}</p>
                {entry.unlocked ? (
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600">{visual.blurb}</p>
                    {visual.blurbAr && (
                      <p className="text-sm text-slate-500" dir="rtl">
                        {visual.blurbAr}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">{entry.unlockHint}</p>
                )}
                {entry.unlocked && entry.id && (
                  <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-primary-600">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chat now
                  </span>
                )}
              </div>
            </div>
          )

          return entry.unlocked && entry.id ? (
            <Link key={entry.name} to={`/characters/${entry.id}/chat`} className="block">
              {card}
            </Link>
          ) : (
            <div key={entry.name}>{card}</div>
          )
        })}
      </div>

      {!unlockedData && !listData && (
        <p className="text-xs text-slate-400 mt-8">
          Note: full roster + real per-learner unlock state will appear automatically once
          the backend's <code>/characters</code> and <code>/characters/unlocked</code>{' '}
          endpoints ship — this page already targets that shape.
        </p>
      )}
    </div>
  )
}

// Re-export the visual map size for a quick sanity check in tests/tools —
// harmless, keeps CHARACTER_VISUALS import used even before all 15 render.
export const CHARACTER_COUNT = Object.keys(CHARACTER_VISUALS).length
