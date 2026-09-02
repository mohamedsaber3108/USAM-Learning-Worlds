import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Compass,
  Languages,
  Code2,
  ArrowRight,
  Calculator,
  FlaskConical,
  Globe2,
  Palette,
} from 'lucide-react'
import { CharacterAvatar } from '@/features/characters/components/CharacterAvatar'
import {
  setPreferredCharacter,
  type PreferredCharacterName,
} from '../lib/characterPreference'

// UPGRADE NOTE: the sibling character-art agent's illustrated CharacterFace
// component (src/features/characters/components/CharacterFace.tsx) has
// landed with hand-crafted SVG avatars, but it currently fails `tsc --strict`
// (exactOptionalPropertyTypes clashes with framer-motion's SVGMotionProps)
// and would break the production build. Using the existing CharacterAvatar
// placeholder (colored circle + lucide icon) here instead so this page ships
// clean; swap to <CharacterFace characterId={name} size={n} /> once that
// type error is fixed upstream — same character names, drop-in replacement.

interface LandingCharacter {
  name: PreferredCharacterName
  role: string
  greeting: string
}

const LANDING_CHARACTERS: LandingCharacter[] = [
  {
    name: 'Azouz',
    role: 'Your main guide',
    greeting: "Hi, I'm Azouz! Ready to learn together? I'll be with you every step of the way.",
  },
  {
    name: 'Zein',
    role: 'Explorer',
    greeting: "Hey, I'm Zein! I love discovering new worlds to learn — let's go exploring.",
  },
  {
    name: 'Luma',
    role: 'English coach',
    greeting: "Hi, I'm Luma! I'll help you with conversation, grammar & reading — in English and Arabic.",
  },
  {
    name: 'Codey',
    role: 'Coding mentor',
    greeting: "Hey, I'm Codey! Let's build real projects together, one line of code at a time.",
  },
]

const SUBJECTS = [
  { icon: Calculator, label: 'Mathematics' },
  { icon: FlaskConical, label: 'Science' },
  { icon: Languages, label: 'Language' },
  { icon: Code2, label: 'Technology' },
  { icon: Palette, label: 'Arts & Creativity' },
  { icon: Globe2, label: 'Social Studies' },
]

export function LandingPage() {
  const [selected, setSelected] = useState<PreferredCharacterName | null>(null)

  const selectedCharacter = LANDING_CHARACTERS.find((c) => c.name === selected) ?? null

  function handlePick(name: PreferredCharacterName) {
    setSelected(name)
    // Client-side only, no auth — CharacterIntroPage reads this after
    // registration so the choice made here is honored, not thrown away.
    setPreferredCharacter(name)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white">
      {/* ---------------------------------------------------------------- */}
      {/* Header */}
      {/* ---------------------------------------------------------------- */}
      <header className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-soft">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-slate-900">USAM Learning Worlds</span>
        </div>
        <Link
          to="/login"
          className="text-sm font-semibold text-primary-700 hover:text-primary-800"
        >
          Log in
        </Link>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Hero */}
      {/* ---------------------------------------------------------------- */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14 pb-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl sm:text-5xl font-display font-bold text-slate-900 leading-tight"
        >
          Learning worlds kids{' '}
          <span className="text-primary-600">actually</span> want to explore
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto"
        >
          A bilingual (Arabic & English) learning adventure for ages 8–14 —
          missions, characters, and real subjects like math, science, coding,
          and language, guided by a cast of friendly mentors.
        </motion.p>

        {/* Character strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-10 flex items-center justify-center gap-4 sm:gap-6"
        >
          {LANDING_CHARACTERS.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center gap-2"
            >
              <CharacterAvatar name={c.name} size="lg" />
              <span className="text-xs font-semibold text-slate-700">{c.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Real interactive preview — pick a character, get a personalized  */}
      {/* greeting. No auth, no fake mockup: this is the actual component  */}
      {/* CharacterAvatar and localStorage preference that ships to prod.  */}
      {/* ---------------------------------------------------------------- */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-12">
        <div className="card p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 text-center">
            Try it now — pick your favorite guide
          </h2>
          <p className="text-sm text-slate-500 text-center mt-1 mb-6">
            No account needed. Tap a character to meet them.
          </p>

          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {LANDING_CHARACTERS.map((c) => {
              const isSelected = selected === c.name
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handlePick(c.name)}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl border-2 transition-all
                    ${isSelected ? 'border-primary-500 bg-primary-50' : 'border-transparent hover:bg-surface-100'}`}
                >
                  <CharacterAvatar name={c.name} size="md" />
                  <span
                    className={`text-xs font-semibold ${isSelected ? 'text-primary-700' : 'text-slate-700'}`}
                  >
                    {c.name}
                  </span>
                </button>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            {selectedCharacter && (
              <motion.div
                key={selectedCharacter.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="mt-6 flex items-start gap-3 p-4 bg-primary-50 rounded-xl text-left"
              >
                <CharacterAvatar name={selectedCharacter.name} size="md" />
                <div>
                  <p className="text-sm font-semibold text-primary-800 mb-0.5">
                    {selectedCharacter.name} · {selectedCharacter.role}
                  </p>
                  <p className="text-slate-700 text-sm sm:text-base">
                    "{selectedCharacter.greeting}"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center">
            <Link
              to="/register"
              className="btn btn-primary w-full sm:w-auto px-8 py-3 text-base"
            >
              {selectedCharacter
                ? `Start learning with ${selectedCharacter.name}`
                : 'Start Learning'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!selectedCharacter && (
              <p className="text-xs text-slate-400 mt-2">
                Tip: pick a character above first — we'll introduce you to them
                right after you sign up.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Value proposition */}
      {/* ---------------------------------------------------------------- */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
          <div className="card p-5 text-center">
            <div className="icon-chip bg-primary-50 mx-auto mb-3">
              <Compass className="w-5 h-5 text-primary-600" />
            </div>
            <h3>Ages 8–14</h3>
            <p className="text-sm text-slate-500 mt-1">
              Missions and difficulty tuned for growing learners.
            </p>
          </div>
          <div className="card p-5 text-center">
            <div className="icon-chip bg-secondary-50 mx-auto mb-3">
              <Languages className="w-5 h-5 text-secondary-600" />
            </div>
            <h3>Bilingual AR / EN</h3>
            <p className="text-sm text-slate-500 mt-1">
              Learn and switch fluidly between Arabic and English.
            </p>
          </div>
          <div className="card p-5 text-center">
            <div className="icon-chip bg-accent-50 mx-auto mb-3">
              <Sparkles className="w-5 h-5 text-accent-600" />
            </div>
            <h3>Real mentors</h3>
            <p className="text-sm text-slate-500 mt-1">
              Every subject comes with a character guide, not a worksheet.
            </p>
          </div>
        </div>

        <h3 className="text-center text-slate-500 text-sm font-semibold uppercase tracking-wide mb-4">
          Subjects covered
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {SUBJECTS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-surface-200 shadow-soft text-sm font-medium text-slate-700"
            >
              <Icon className="w-4 h-4 text-primary-600" />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Bottom CTA */}
      {/* ---------------------------------------------------------------- */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-16 text-center">
        <Link to="/register" className="btn btn-primary w-full sm:w-auto px-10 py-3.5 text-base">
          Start Learning
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-xs text-slate-400 mt-3">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
            Log in
          </Link>
        </p>
      </section>
    </div>
  )
}
