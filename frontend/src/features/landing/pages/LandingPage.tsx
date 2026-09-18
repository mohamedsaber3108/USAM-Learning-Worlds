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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ============================= HERO ============================= */}
      <div className="relative bg-brand-hero text-white overflow-hidden">
        {/* Decorative drifting blobs + dot grid */}
        <div aria-hidden className="absolute -top-24 -start-24 w-96 h-96 rounded-full bg-sky-400/20 blur-3xl animate-drift" />
        <div aria-hidden className="absolute top-32 -end-24 w-[26rem] h-[26rem] rounded-full bg-secondary-300/20 blur-3xl animate-drift" style={{ animationDelay: '3s' }} />
        <div aria-hidden className="dots-layer opacity-[0.15]" />

        {/* Nav */}
        <header className="relative section-x flex items-center justify-between h-20">
          <div className="flex items-center gap-2.5">
            <img src={usamLogo} alt="" aria-hidden className="h-9 w-auto brand-logo-invert" />
            <span className="font-display font-bold text-lg">{t('common.appName')}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="chip-glass hover:bg-white/25 transition-colors">
              {t('landing.logIn')}
            </Link>
          </div>
        </header>

        {/* Hero body */}
        <section className="relative section-x pt-8 pb-20 lg:pt-14 lg:pb-28 grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-start">
            <motion.span
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-pill bg-white/15 border border-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm"
            >
              <Star className="w-4 h-4 fill-secondary-300 text-secondary-300" />
              For curious minds, ages 8–14
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="mt-5 font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05]"
            >
              Learning worlds kids{' '}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">actually</span>
                <span aria-hidden className="absolute inset-x-0 bottom-1 h-3 bg-secondary-400/60 -rotate-1 rounded" />
              </span>{' '}
              want to explore
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="mt-5 text-lg text-white/80 max-w-xl mx-auto lg:mx-0"
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
              <Link to="/login" className="chip-glass px-6 py-4 text-base hover:bg-white/25 transition-colors w-full sm:w-auto justify-center">
                {t('landing.logIn')}
              </Link>
            </motion.div>
          </div>

          {/* Big animated mascots cluster */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
            className="relative mx-auto"
          >
            <div className="relative w-[20rem] h-[20rem] sm:w-[24rem] sm:h-[24rem]">
              <div aria-hidden className="absolute inset-0 rounded-blob bg-white/10 backdrop-blur-sm border border-white/15" />
              {LANDING_CHARACTERS.map((c, i) => {
                const positions = [
                  'top-2 start-10', 'top-8 end-4', 'bottom-10 start-4', 'bottom-2 end-12',
                ]
                const pos = positions[i] ?? 'top-2 start-10'
                return (
                  <div key={c.name} className={`absolute ${pos} animate-bob`} style={{ animationDelay: `${i * 0.6}s` }}>
                    <div className="rounded-full bg-white/90 shadow-hero p-1.5">
                      <CharacterFace characterId={c.name} size={i === 0 ? 132 : 104} />
                    </div>
                    <p className="text-center mt-1 text-xs font-bold text-white/90">{c.name}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </section>

        {/* Wave divider */}
        <svg aria-hidden className="relative block w-full h-12 sm:h-16 text-white" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path fill="currentColor" d="M0 40c240 40 480 40 720 20s480-40 720-20v40H0z" />
        </svg>
      </div>

      {/* ==================== INTERACTIVE PICKER ==================== */}
      <section className="section-x -mt-6 relative z-10 pb-16">
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
      <section className="relative bg-brand-hero text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0 dots-layer opacity-[0.12]" />
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
