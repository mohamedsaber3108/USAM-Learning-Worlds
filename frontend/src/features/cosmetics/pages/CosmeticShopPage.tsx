import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ShoppingBag,
  Lock,
  CheckCircle2,
  Zap,
  Square,
  Award,
  Type,
  Palette,
  Sparkles,
  PartyPopper,
} from 'lucide-react'
import { cosmeticsApi } from '@/lib/api/endpoints'

type CosmeticCategory = 'BORDER' | 'BADGE' | 'TITLE' | 'COLOR_THEME'

interface CosmeticItem {
  id: string
  name: string
  category: CosmeticCategory
  xpCost: number
  iconOrStyleKey: string
  isDefault: boolean
  owned: boolean
  canAfford: boolean
  isEquipped: boolean
}

const CATEGORY_META: Record<CosmeticCategory, { label: string; icon: typeof Square; tint: string }> = {
  BORDER: { label: 'Profile Borders', icon: Square, tint: 'bg-primary-50 text-primary-600' },
  BADGE: { label: 'Badges', icon: Award, tint: 'bg-secondary-50 text-secondary-600' },
  TITLE: { label: 'Titles', icon: Type, tint: 'bg-accent-50 text-accent-600' },
  COLOR_THEME: { label: 'Dashboard Themes', icon: Palette, tint: 'bg-success-50 text-success-600' },
}

// Border style-key -> real CSS so the shop card previews look like what
// will actually render on the dashboard avatar.
const BORDER_PREVIEW: Record<string, string> = {
  'border-slate': 'ring-4 ring-slate-300',
  'border-gold': 'ring-4 ring-secondary-400',
  'border-blue': 'ring-4 ring-primary-400',
  'border-purple': 'ring-4 ring-purple-400',
  'border-diamond': 'ring-4 ring-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.6)]',
}

const THEME_PREVIEW: Record<string, string> = {
  'theme-indigo': 'bg-primary-500',
  'theme-orange': 'bg-orange-500',
  'theme-pink': 'bg-pink-500',
}

export function CosmeticShopPage() {
  const queryClient = useQueryClient()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<{ name: string; category: CosmeticCategory } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['cosmetics'],
    queryFn: () => cosmeticsApi.list().then((res) => res.data),
  })

  const items: CosmeticItem[] = data?.items || []
  const totalXP: number = data?.totalXP ?? 0

  const grouped = items.reduce<Record<string, CosmeticItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category]!.push(item)
    return acc
  }, {})

  async function handleUnlock(item: CosmeticItem) {
    setPendingId(item.id)
    setErrorMsg(null)
    try {
      await cosmeticsApi.unlock(item.id)
      setConfirmation({ name: item.name, category: item.category })
      // Real refetch so owned/canAfford/totalXP reflect the just-spent XP —
      // no optimistic-only fake update.
      await queryClient.invalidateQueries({ queryKey: ['cosmetics'] })
      await queryClient.invalidateQueries({ queryKey: ['progression'] })
      window.setTimeout(() => setConfirmation(null), 2600)
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Could not unlock this item. Try again.')
    } finally {
      setPendingId(null)
    }
  }

  async function handleEquip(item: CosmeticItem) {
    setPendingId(item.id)
    setErrorMsg(null)
    try {
      await cosmeticsApi.equip(item.id)
      await queryClient.invalidateQueries({ queryKey: ['cosmetics'] })
      await queryClient.invalidateQueries({ queryKey: ['cosmetics-equipped'] })
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Could not equip this item. Try again.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-primary-600 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-white/90 hover:text-white transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                Back
              </Link>
              <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" strokeWidth={2} />
                Shop
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-white font-semibold">
              <Zap className="w-4 h-4" strokeWidth={2} />
              {totalXP.toLocaleString()} XP
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMsg && (
          <div className="mb-4 p-3 rounded-control bg-accent-50 text-accent-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-slate-500">Loading the shop...</p>
          </div>
        ) : (
          (Object.keys(CATEGORY_META) as CosmeticCategory[]).map((category) => {
            const meta = CATEGORY_META[category]
            const CategoryIcon = meta.icon
            const categoryItems = grouped[category] || []
            if (categoryItems.length === 0) return null

            return (
              <div key={category} className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`icon-chip ${meta.tint}`}>
                    <CategoryIcon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <h2 className="font-display font-bold text-lg text-slate-900">{meta.label}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {categoryItems.map((item) => {
                    const locked = !item.owned && !item.canAfford
                    const affordableLocked = !item.owned && item.canAfford
                    const isPending = pendingId === item.id

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`stat-card ${item.isEquipped ? 'border-success-400' : ''} ${
                          locked ? 'opacity-60' : ''
                        }`}
                      >
                        {/* Live preview swatch */}
                        <div className="flex items-center justify-center mb-4">
                          {category === 'BORDER' ? (
                            <div
                              className={`w-16 h-16 rounded-full bg-surface-200 ${
                                BORDER_PREVIEW[item.iconOrStyleKey] || 'ring-4 ring-slate-300'
                              } ${locked ? 'grayscale' : ''}`}
                            />
                          ) : category === 'COLOR_THEME' ? (
                            <div
                              className={`w-16 h-16 rounded-2xl ${
                                THEME_PREVIEW[item.iconOrStyleKey] || 'bg-primary-500'
                              } ${locked ? 'grayscale' : ''}`}
                            />
                          ) : (
                            <div
                              className={`icon-chip w-16 h-16 ${meta.tint} ${locked ? 'grayscale' : ''}`}
                            >
                              {category === 'TITLE' ? (
                                <Sparkles className="w-7 h-7" strokeWidth={2} />
                              ) : (
                                <Award className="w-7 h-7" strokeWidth={2} />
                              )}
                            </div>
                          )}
                        </div>

                        <h3 className="text-base font-display font-semibold text-slate-900 text-center mb-1">
                          {item.name}
                        </h3>
                        {category === 'TITLE' && (
                          <p className="text-xs text-slate-400 text-center mb-2">
                            Shows next to your name as "{item.name}"
                          </p>
                        )}

                        <p className="text-center text-sm font-medium text-secondary-600 mb-3">
                          {item.isDefault ? 'Free' : `${item.xpCost.toLocaleString()} XP`}
                        </p>

                        {item.isEquipped ? (
                          <div className="btn w-full bg-success-50 text-success-700 shadow-none cursor-default flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                            Equipped
                          </div>
                        ) : item.owned ? (
                          <button
                            onClick={() => handleEquip(item)}
                            disabled={isPending}
                            className="btn btn-primary w-full"
                          >
                            {isPending ? 'Equipping...' : 'Equip'}
                          </button>
                        ) : affordableLocked ? (
                          <button
                            onClick={() => handleUnlock(item)}
                            disabled={isPending}
                            className="btn btn-primary w-full"
                          >
                            {isPending ? 'Unlocking...' : `Unlock for ${item.xpCost} XP`}
                          </button>
                        ) : (
                          <div className="btn w-full bg-surface-100 text-slate-400 shadow-none cursor-not-allowed flex items-center justify-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" strokeWidth={2} />
                            Need {(item.xpCost - totalXP).toLocaleString()} more XP
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </main>

      {/* Satisfying unlock confirmation toast */}
      <AnimatePresence>
        {confirmation && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-soft-md flex items-center gap-3"
          >
            <div className="icon-chip bg-secondary-500/20 text-secondary-300">
              <Sparkles className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <p className="font-semibold text-sm">Unlocked!</p>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                {confirmation.name} is now yours <PartyPopper className="w-3.5 h-3.5" strokeWidth={2} />
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
