import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Sparkles, Languages, Code2, ArrowRight, Calculator, FlaskConical,
  Globe2, Palette, ShieldCheck, Trophy, Mic, BookOpen, Star,
} from 'lucide-react'
import { CharacterFace } from '@/features/characters/components/CharacterFace'
import { setPreferredCharacter, type PreferredCharacterName } from '../lib/characterPreference'
import usamLogo from '@/assets/usam-logo.png'

interface LandingCharacter {
  name: PreferredCharacterName
  role: string
  greeting: string
}

const LANDING_CHARACTERS: LandingCharacter[] = [
  { name: 'Azouz', role: 'Your main guide', greeting: "Hi, I'm Azouz! Ready to learn together? I'll be with you every step of the way." },
  { name: 'Zein', role: 'Explorer', greeting: "Hey, I'm Zein! I love discovering new worlds to learn — let's go exploring." },
  { name: 'Luma', role: 'English coach', greeting: "Hi, I'm Luma! I'll help you with conversation, grammar & reading — in English and Arabic." },
  { name: 'Codey', role: 'Coding mentor', greeting: "Hey, I'm Codey! Let's build real projects together, one line of code at a time." },
]

// Learning "worlds" — each a vibrant gradient tile. Real subjects that map
// to actual app areas.
const WORLDS = [
  { key: 'mathematics', label: 'Math', icon: Calculator, grad: 'from-sky-400 to-sky-600' },
  { key: 'science', label: 'Science', icon: FlaskConical, grad: 'from-primary-400 to-primary-600' },
  { key: 'language', label: 'Language', icon: Languages, grad: 'from-grape-400 to-grape-600' },
  { key: 'technology', label: 'Coding', icon: Code2, grad: 'from-success-400 to-success-600' },
  { key: 'arts', label: 'Arts', icon: Palette, grad: 'from-bubble-400 to-bubble-600' },
  { key: 'socialStudies', label: 'World', icon: Globe2, grad: 'from-accent-400 to-accent-600' },
]

const FEATURES = [
  { icon: Sparkles, title: 'Friendly AI mentors', body: 'Every subject has a character guide who talks with you, not a worksheet.' },
  { icon: Trophy, title: 'Earn XP & badges', body: 'Missions, streaks and real Open-Badge credentials as you master skills.' },
  { icon: Languages, title: 'Bilingual AR / EN', body: 'Learn and switch fluidly between Arabic and English at your own pace.' },
  { icon: Mic, title: 'Talk & listen', body: 'Practice speaking with voice — great for language and confidence.' },
  { icon: Code2, title: 'Real coding', body: 'Write Python & build projects that run right in your browser, safely.' },
  { icon: ShieldCheck, title: 'Safe for kids', body: 'Age-adapted, moderated, and built with child safety at the core.' },
]

export function LandingPage() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<PreferredCharacterName>('Azouz')
  const selectedCharacter: LandingCharacter =
    LANDING_CHARACTERS.find((c) => c.name === selected) ?? LANDING_CHARACTERS[0]!

  function handlePick(name: PreferredCharacterName) {
    setSelected(name)
    setPreferredCharacter(name)
  }

  const CHAR_TINTS = ['#f59e0b', '#3b90f6', '#8b5cf6', '#10b981']

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ============================= HERO =============================
          BRIGHT, warm, energetic canvas (not a dark teal wall). Light
          gradient sky + floating colorful blobs + dot grid, dark ink text
          for high contrast, and a big playful character stage. */}
      <div className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
        {/* Colorful ambient blobs — one per world hue, softly drifting. */}
        <div aria-hidden className="absolute -top-28 -start-24 w-[30rem] h-[30rem] rounded-full bg-sky-300/40 blur-3xl animate-drift" />
        <div aria-hidden className="absolute -top-16 end-0 w-[24rem] h-[24rem] rounded-full bg-secondary-300/40 blur-3xl animate-drift" style={{ animationDelay: '2s' }} />
        <div aria-hidden className="absolute top-40 start-1/3 w-[22rem] h-[22rem] rounded-full bg-grape-300/30 blur-3xl animate-drift" style={{ animationDelay: '4s' }} />
        <div aria-hidden className="dots-layer opacity-[0.5]" />

        {/* Nav */}
        <header className="relative section-x flex items-center justify-between h-20">
          <div className="flex items-center gap-2.5">
            <img src={usamLogo} alt="" aria-hidden className="h-9 w-auto" />
            <span className="font-display font-extrabold text-lg text-ink">{t('common.appName')}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-secondary">
              {t('landing.logIn')}
            </Link>
          </div>
        </header>

        {/* Hero body */}
        <section className="relative section-x pt-8 pb-24 lg:pt-14 lg:pb-32 grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-start">
            <motion.span
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-pill bg-white border border-secondary-200 text-secondary-700 px-4 py-1.5 text-sm font-bold shadow-soft"
            >
              <Star className="w-4 h-4 fill-secondary-400 text-secondary-400" />
              For curious minds, ages 8–14
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="mt-5 font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-ink"
            >
              Learning worlds kids{' '}
              <span className="relative whitespace-nowrap text-primary-600">
                <span className="relative z-10">actually</span>
                <span aria-hidden className="absolute inset-x-0 bottom-1 h-3 bg-secondary-300 -rotate-1 rounded" />
              </span>{' '}
              want to explore
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="mt-5 text-lg text-slate-600 max-w-xl mx-auto lg:mx-0"
            >
              {t('landing.heroSubtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start"
            >
              <Link to="/register" className="btn-hero-accent w-full sm:w-auto">
                {t('landing.startLearning')}
                <ArrowRight className="w-5 h-5 rtl:scale-x-[-1]" />
              </Link>
              <Link to="/login" className="btn btn-secondary px-6 py-4 text-base w-full sm:w-auto justify-center">
                {t('landing.logIn')}
              </Link>
            </motion.div>
          </div>

          {/* Big animated mascot stage — a bright card with each guide on a
              colorful tinted disc so the characters POP instead of floating
              on a dark wall. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="relative rounded-blob bg-white shadow-hero border border-surface-200/70 p-6 sm:p-8">
              <div aria-hidden className="dots-layer opacity-40 rounded-blob overflow-hidden" />
              <div className="relative grid grid-cols-2 gap-4 sm:gap-6">
                {LANDING_CHARACTERS.map((c, i) => (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 180 }}
                    className="flex flex-col items-center"
                  >
                    <div
                      className="rounded-full p-3 shadow-lift animate-bob"
                      style={{ backgroundColor: `${CHAR_TINTS[i] ?? '#f59e0b'}22`, animationDelay: `${i * 0.5}s` }}
                    >
                      <CharacterFace characterId={c.name} size={96} />
                    </div>
                    <p className="mt-2 font-display font-extrabold text-sm text-ink">{c.name}</p>
                    <p className="text-[11px] font-semibold text-slate-500">{c.role}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* ==================== INTERACTIVE PICKER ==================== */}
      <section className="section-x relative z-10 pb-16">
        <div className="card-playful max-w-3xl mx-auto">
          <div className="text-center">
            <p className="eyebrow justify-center">{t('landing.tryTitle')}</p>
            <h2 className="display-lg mt-1">Pick a guide and say hi</h2>
            <p className="text-slate-500 mt-1">{t('landing.trySubtitle')}</p>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-4">
            {LANDING_CHARACTERS.map((c) => {
              const isSel = selected === c.name
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handlePick(c.name)}
                  aria-pressed={isSel}
                  className={`flex flex-col items-center gap-2 p-2 sm:p-3 rounded-blob border-2 transition-all
                    ${isSel ? 'border-primary-500 bg-primary-50 shadow-soft-md -translate-y-1' : 'border-transparent hover:bg-surface-100'}`}
                >
                  <CharacterFace characterId={c.name} size={64} animate={isSel} />
                  <span className={`text-xs font-bold ${isSel ? 'text-primary-700' : 'text-slate-600'}`}>{c.name}</span>
                </button>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCharacter.name}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}
              className="mt-6 flex items-start gap-4 p-4 bg-primary-50 rounded-blob text-start"
            >
              <div className="shrink-0"><CharacterFace characterId={selectedCharacter.name} size={72} /></div>
              <div>
                <p className="text-sm font-bold text-primary-800 mb-0.5">{selectedCharacter.name} · {selectedCharacter.role}</p>
                <p className="text-slate-700">"{selectedCharacter.greeting}"</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 text-center">
            <Link to="/register" className="btn-hero w-full sm:w-auto">
              {t('landing.startLearningWith', { name: selectedCharacter.name })}
              <ArrowRight className="w-5 h-5 rtl:scale-x-[-1]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== WORLDS ==================== */}
      <section className="section-x pb-16">
        <div className="text-center mb-8">
          <p className="eyebrow justify-center">Explore</p>
          <h2 className="display-lg mt-1">Six worlds to discover</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {WORLDS.map(({ key, label, icon: Icon, grad }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className={`world-tile bg-gradient-to-br ${grad} min-h-[8rem] flex flex-col justify-between`}
            >
              <div aria-hidden className="dots-layer opacity-20" />
              <Icon className="w-8 h-8 relative" strokeWidth={2} />
              <span className="relative font-display font-bold text-lg">{t(`landing.subjects.${key}`, label)}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="bg-surface-50 py-16 border-y border-surface-200">
        <div className="section-x">
          <div className="text-center mb-10">
            <p className="eyebrow justify-center">Why USAM</p>
            <h2 className="display-lg mt-1">Built to keep kids learning</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="card-playful"
              >
                <div className="icon-chip bg-primary-50 text-primary-600 mb-4"><Icon className="w-6 h-6" /></div>
                <h3 className="font-display font-bold text-lg text-ink">{title}</h3>
                <p className="text-slate-500 mt-1.5 text-sm leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="relative bg-aurora text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0 dots-layer opacity-[0.15]" />
        <div className="relative section-x py-20 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl">Start your first mission today</h2>
          <p className="mt-3 text-white/80 max-w-xl mx-auto">Free to begin. Pick a guide, choose a world, and learn something new in minutes.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-hero-accent w-full sm:w-auto">
              {t('landing.startLearning')}
              <ArrowRight className="w-5 h-5 rtl:scale-x-[-1]" />
            </Link>
            <Link to="/login" className="chip-glass px-6 py-4 text-base hover:bg-white/25 transition-colors w-full sm:w-auto justify-center">
              {t('landing.logIn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-white/60 py-8">
        <div className="section-x flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <img src={usamLogo} alt="" aria-hidden className="h-6 w-auto brand-logo-invert" />
            <span className="font-display font-bold text-white/80">{t('common.appName')}</span>
          </div>
          <p>© {new Date().getFullYear()} USAM Learning Worlds. Made for young learners.</p>
        </div>
      </footer>
    </div>
  )
}
