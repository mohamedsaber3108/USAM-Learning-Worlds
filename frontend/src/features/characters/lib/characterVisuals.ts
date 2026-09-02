/**
 * Per-character visual identity: icon + accent color, keyed by character
 * *name* (the stable, human-authored key — ids are DB uuids and roles are
 * shared across several characters, e.g. multiple MENTOR roles).
 *
 * This is a deliberate v1 choice: no illustrated/Rive character art exists
 * yet (confirmed via audit), so a colored circle + lucide-react icon is the
 * honest stand-in. See docs/architecture/USAM_FRONTEND_UX_UPGRADE_PLAN.md
 * for the recommendation to swap this for real character art later — when
 * that happens, only this file and CharacterAvatar's internals should need
 * to change; every consumer's props stay the same.
 */
import {
  Sparkles,
  Compass,
  Languages,
  Code2,
  Cpu,
  Palette,
  FlaskConical,
  Puzzle,
  Mic2,
  Rocket,
  ShieldCheck,
  PiggyBank,
  Flame,
  BookOpen,
  Map,
  type LucideIcon,
} from 'lucide-react'

export interface CharacterVisual {
  icon: LucideIcon
  /** Tailwind-friendly hex used for the avatar background circle. */
  color: string
  /** One-line role/specialty description shown on gallery cards. */
  blurb: string
}

/**
 * Keyed by character name (case-sensitive, matches the seeded `Character.name`).
 * Covers the full planned 15-character roster; only "Azouz" is seeded on the
 * backend today — the rest render correctly the moment the sibling agent's
 * seed + /characters(/unlocked) endpoints land, no frontend change needed.
 */
export const CHARACTER_VISUALS: Record<string, CharacterVisual> = {
  Azouz: { icon: Sparkles, color: '#F59E0B', blurb: 'Your main learning guide, here for anything' },
  Zein: { icon: Compass, color: '#0EA5E9', blurb: 'Explorer — helps you discover new worlds to learn' },
  Luma: { icon: Languages, color: '#8B5CF6', blurb: 'English coach — conversation, grammar & reading' },
  Codey: { icon: Code2, color: '#22C55E', blurb: 'Coding mentor — builds real projects with you' },
  Nova: { icon: Cpu, color: '#6366F1', blurb: 'AI mentor — demystifies how smart machines think' },
  Mira: { icon: Palette, color: '#EC4899', blurb: 'Creative mentor — art, design & imagination' },
  Rami: { icon: FlaskConical, color: '#14B8A6', blurb: 'Science mentor — experiments & discovery' },
  Faris: { icon: Puzzle, color: '#F97316', blurb: 'Problem solver — logic puzzles & strategy' },
  Tala: { icon: Mic2, color: '#D946EF', blurb: 'Communication coach — speaking & presenting' },
  Adam: { icon: Rocket, color: '#EF4444', blurb: 'Entrepreneurship mentor — ideas into ventures' },
  Byte: { icon: ShieldCheck, color: '#0891B2', blurb: 'Digital safety guide — smart & safe online' },
  Nour: { icon: PiggyBank, color: '#65A30D', blurb: 'Financial literacy mentor — money smarts' },
  Rex: { icon: Flame, color: '#DC2626', blurb: 'Rival — challenges you to beat your best' },
  Zara: { icon: BookOpen, color: '#7C3AED', blurb: 'Storyteller — narrative worlds & imagination' },
  Atlas: { icon: Map, color: '#0D9488', blurb: 'World guide — navigates the whole learning map' },
}

export const DEFAULT_CHARACTER_VISUAL: CharacterVisual = {
  icon: Sparkles,
  color: '#94A3B8',
  blurb: 'A mentor from the USAM character universe',
}

export function getCharacterVisual(name: string): CharacterVisual {
  return CHARACTER_VISUALS[name] ?? DEFAULT_CHARACTER_VISUAL
}
