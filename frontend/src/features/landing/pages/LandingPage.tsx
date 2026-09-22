import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Sparkles, Languages, Code2, ArrowRight, Calculator, FlaskConical,
  Globe2, Palette, ShieldCheck, Trophy, Mic, Star, Brain, Rocket,
  Compass, MessageCircle, PlayCircle, HeartHandshake, Users2,
} from 'lucide-react'
import { CharacterFace } from '@/features/characters/components/CharacterFace'
import { setPreferredCharacter, type PreferredCharacterName } from '../lib/characterPreference'

/**
 * USAM Kids — Landing page (ground-up rebuild).
 *
 * A real product-selling marketing page, not a feature dump: a bold animated
 * hero with an interactive character stage, a "how it works" journey, the six
 * learning worlds, the character universe, the balanced-development promise, a
 * safety/parent trust band, and a strong closing CTA. Fully i18n + RTL-safe,
 * built on the existing design tokens and the real CharacterFace SVG system.
 */

interface LandingCharacter {
  name: PreferredCharacterName
  roleKey: string
  greetingKey: string
  tint: string
}

const LANDING_CHARACTERS: LandingCharacter[] = [
  { name: 'Azouz', roleKey: 'mainGuide', greetingKey: 'azouz', tint: '#f59e0b' },
  { name: 'Zein', roleKey: 'explorer', greetingKey: 'zein', tint: '#3b90f6' },
  { name: 'Luma', roleKey: 'englishCoach', greetingKey: 'luma', tint: '#8b5cf6' },
  { name: 'Codey', roleKey: 'codingMentor', greetingKey: 'codey', tint: '#10b981' },
]

// Six learning worlds — labelKey → landing.worldLabels.*
const WORLDS = [
  { key: 'math', icon: Calculator, grad: 'from-sky-400 to-sky-600' },
  { key: 'science', icon: FlaskConical, grad: 'from-primary-400 to-primary-600' },
  { key: 'language', icon: Languages, grad: 'from-grape-400 to-grape-600' },
  { key: 'coding', icon: Code2, grad: 'from-success-400 to-success-600' },
  { key: 'arts', icon: Palette, grad: 'from-bubble-400 to-bubble-600' },
  { key: 'world', icon: Globe2, grad: 'from-accent-400 to-accent-600' },
]

// "How it works" — 4 steps → landing.how.*
const HOW_STEPS = [
  { key: 'pick', icon: Compass },
  { key: 'learn', icon: PlayCircle },
  { key: 'grow', icon: Sparkles },
  { key: 'celebrate', icon: Trophy },
]

// Feature cards → landing.features.*
const FEATURES = [
  { icon: Sparkles, titleKey: 'mentorsTitle', bodyKey: 'mentorsBody' },
  { icon: Brain, titleKey: 'adaptiveTitle', bodyKey: 'adaptiveBody' },
  { icon: Languages, titleKey: 'bilingualTitle', bodyKey: 'bilingualBody' },
  { icon: Mic, titleKey: 'voiceTitle', bodyKey: 'voiceBody' },
  { icon: Code2, titleKey: 'codingTitle', bodyKey: 'codingBody' },
  { icon: ShieldCheck, titleKey: 'safeTitle', bodyKey: 'safeBody' },
]

// Balanced-development dimensions → landing.balanced.dims.*
const BALANCE_DIMS = [
  { key: 'knowledge', color: 'bg-sky-500' },
  { key: 'creativity', color: 'bg-bubble-500' },
  { key: 'problemSolving', color: 'bg-primary-500' },
  { key: 'communication', color: 'bg-grape-500' },
  { key: 'coding', color: 'bg-success-500' },
  { key: 'lifeSkills', color: 'bg-accent-500' },
]

function Wordmark({ onDark = false }: { onDark?: boolean }) {
  return (
    <span
      dir="ltr"
      className={`inline-flex items-center justify-center h-9 px-3 rounded-xl font-display font-extrabold text-lg tracking-tight ${
        onDark ? 'bg-white/15 text-white' : 'bg-primary-600 text-white'
      }`}
    >
      USAM
    </span>
  )
}

export function LandingPage() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<PreferredCharacterName>('Azouz')
  const selectedCharacter = LANDING_CHARACTERS.find((c) => c.name === selected) ?? LANDING_CHARACTERS[0]!

  function handlePick(name: PreferredCharacterName) {
    setSelected(name)
    setPreferredCharacter(name)
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ===================================================== NAV */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-surface-200">
        <div className="section-x flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 rounded-xl">
            <Wordmark />
            <span className="font-display font-bold text-sm text-slate-500 hidden sm:inline">{t('common.appName')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn btn-secondary">{t('landing.logIn')}</Link>
            <Link to="/register" className="btn btn-primary hidden sm:inline-flex">{t('landing.startLearning')}</Link>
          </div>
        </div>
      </header>

      {/* ===================================================== HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
        <div aria-hidden className="absolute -top-28 -start-24 w-[30rem] h-[30rem] rounded-full bg-sky-300/40 blur-3xl animate-drift" />
        <div aria-hidden className="absolute -top-16 end-0 w-[24rem] h-[24rem] rounded-full bg-secondary-300/40 blur-3xl animate-drift [animation-delay:2s]" />
        <div aria-hidden className="absolute top-40 start-1/3 w-[22rem] h-[22rem] rounded-full bg-grape-300/30 blur-3xl animate-drift [animation-delay:4s]" />
        <div aria-hidden className="dots-layer opacity-[0.5]" />

        <div className="relative section-x pt-10 pb-24 lg:pt-16 lg:pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-start">
            <motion.span
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-pill bg-white border border-secondary-200 text-secondary-700 px-4 py-1.5 text-sm font-bold shadow-soft"
            >
              <Star className="w-4 h-4 fill-secondary-400 text-secondary-400" />
              {t('landing.ageBadge')}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="mt-5 font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-ink"
            >
              {t('landing.heroTitle')}
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
              <a href="#how" className="btn btn-secondary px-6 py-4 text-base w-full sm:w-auto justify-center">
                {t('landing.howCta', 'See how it works')}
              </a>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
              className="mt-8 flex items-center gap-4 justify-center lg:justify-start text-xs font-semibold text-slate-500"
            >
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary-500" />{t('landing.trustSafe', 'Safe for kids')}</span>
              <span className="inline-flex items-center gap-1.5"><Languages className="w-4 h-4 text-grape-500" />{t('landing.trustBilingual', 'Arabic & English')}</span>
              <span className="inline-flex items-center gap-1.5"><HeartHandshake className="w-4 h-4 text-accent-500" />{t('landing.trustParents', 'Parent-approved')}</span>
            </motion.div>
          </div>

          {/* Character stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="relative rounded-blob bg-white shadow-hero border border-surface-200/70 p-6 sm:p-8">
              <div aria-hidden className="dots-layer opacity-40 rounded-blob overflow-hidden" />
              <div className="relative grid grid-cols-2 gap-4 sm:gap-6">
                {LANDING_CHARACTERS.map((c, i) => (
                  <motion.button
                    key={c.name}
                    type="button"
                    onClick={() => handlePick(c.name)}
                    aria-pressed={selected === c.name}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 180 }}
                    className={`flex flex-col items-center rounded-blob p-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
                      selected === c.name ? 'bg-primary-50 -translate-y-1 shadow-soft-md' : 'hover:bg-surface-100'
                    }`}
                  >
                    <div className="rounded-full p-3 shadow-lift animate-bob" style={{ backgroundColor: `${c.tint}22`, animationDelay: `${i * 0.5}s` }}>
                      <CharacterFace characterId={c.name} size={88} animate={selected === c.name} />
                    </div>
                    <p className="mt-2 font-display font-extrabold text-sm text-ink">{c.name}</p>
                    <p className="text-[11px] font-semibold text-slate-500">{t(`landing.charRoles.${c.roleKey}`)}</p>
                  </motion.button>
                ))}
              </div>

              {/* Speech bubble for the selected guide */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCharacter.name}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}
                  className="relative mt-4 flex items-start gap-2.5 p-3.5 bg-primary-50 rounded-blob text-start"
                >
                  <MessageCircle className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700 leading-snug">"{t(`landing.charGreetings.${selectedCharacter.greetingKey}`)}"</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================== HOW IT WORKS */}
      <section id="how" className="section-x py-16 lg:py-20 scroll-mt-20">
        <div className="text-center mb-12">
          <p className="eyebrow justify-center">{t('landing.howEyebrow', 'How it works')}</p>
          <h2 className="display-lg mt-1">{t('landing.howTitle', 'A learning adventure in four steps')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_STEPS.map(({ key, icon: Icon }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="card text-center relative"
            >
              <span className="absolute top-4 end-4 font-display font-extrabold text-3xl text-surface-200">{i + 1}</span>
              <div className="icon-chip bg-primary-50 text-primary-600 w-14 h-14 mx-auto mb-4"><Icon className="w-7 h-7" strokeWidth={2} /></div>
              <h3 className="font-display font-bold text-ink">{t(`landing.how.${key}Title`)}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{t(`landing.how.${key}Body`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================================================== WORLDS */}
      <section className="bg-surface-50 border-y border-surface-200 py-16 lg:py-20">
        <div className="section-x">
          <div className="text-center mb-10">
            <p className="eyebrow justify-center">{t('landing.exploreEyebrow')}</p>
            <h2 className="display-lg mt-1">{t('landing.worldsTitle')}</h2>
            <p className="text-slate-500 mt-2 max-w-xl mx-auto">{t('landing.worldsSubtitle', 'Each world is a universe of missions, stories, and projects led by its own character guide.')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {WORLDS.map(({ key, icon: Icon, grad }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`world-tile bg-gradient-to-br ${grad} min-h-[9rem] flex flex-col justify-between`}
              >
                <div aria-hidden className="dots-layer opacity-20" />
                <Icon className="w-8 h-8 relative" strokeWidth={2} />
                <span className="relative font-display font-bold text-lg">{t(`landing.worldLabels.${key}`)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== BALANCED DEVELOPMENT */}
      <section className="section-x py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="eyebrow">{t('landing.balancedEyebrow', 'Balanced development')}</p>
            <h2 className="display-lg mt-1">{t('landing.balancedTitle', 'More than grades — the whole child')}</h2>
            <p className="text-slate-600 mt-3 leading-relaxed">{t('landing.balancedBody', 'USAM grows knowledge, creativity, communication, problem-solving and life skills together — and shows the journey in a way kids and parents actually understand.')}</p>
          </div>
          <div className="card-playful">
            <div className="space-y-4">
              {BALANCE_DIMS.map(({ key, color }, i) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-700">{t(`landing.balanced.dims.${key}`)}</span>
                  </div>
                  <div className="progress-track">
                    <motion.div
                      className={`h-full rounded-full ${color}`}
                      initial={{ width: 0 }} whileInView={{ width: `${55 + i * 7}%` }} viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== FEATURES */}
      <section className="bg-surface-50 border-y border-surface-200 py-16 lg:py-20">
        <div className="section-x">
          <div className="text-center mb-10">
            <p className="eyebrow justify-center">{t('landing.whyEyebrow')}</p>
            <h2 className="display-lg mt-1">{t('landing.whyTitle')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, titleKey, bodyKey }, i) => (
              <motion.div
                key={titleKey}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="card"
              >
                <div className="icon-chip bg-primary-50 text-primary-600 mb-4"><Icon className="w-6 h-6" /></div>
                <h3 className="font-display font-bold text-lg text-ink">{t(`landing.features.${titleKey}`)}</h3>
                <p className="text-slate-500 mt-1.5 text-sm leading-relaxed">{t(`landing.features.${bodyKey}`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== PARENTS / SAFETY */}
      <section className="section-x py-16 lg:py-20">
        <div className="card-playful bg-primary-50/40 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="icon-chip bg-primary-600 text-white w-12 h-12 mb-4"><Users2 className="w-6 h-6" /></div>
            <p className="eyebrow">{t('landing.parentsEyebrow', 'For parents')}</p>
            <h2 className="display-lg mt-1">{t('landing.parentsTitle', 'You stay in the loop, safely')}</h2>
            <p className="text-slate-600 mt-3 leading-relaxed">{t('landing.parentsBody', 'A calm parent dashboard shows real progress and balanced development. Consent, privacy and screen-time controls are built in — child data is protected by design.')}</p>
            <Link to="/register" className="btn btn-primary mt-5">
              {t('landing.parentsCta', 'Create a family account')}
              <ArrowRight className="w-4 h-4 rtl:scale-x-[-1]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {['consent', 'progress', 'privacy'].map((k, i) => (
              <motion.div
                key={k}
                initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 bg-white rounded-control p-4 border border-surface-200"
              >
                <ShieldCheck className="w-5 h-5 text-primary-500 shrink-0" strokeWidth={2} />
                <span className="text-sm font-medium text-slate-700">{t(`landing.parentsPoints.${k}`)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== FINAL CTA */}
      <section className="relative bg-aurora text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0 dots-layer opacity-[0.15]" />
        <div className="relative section-x py-20 text-center">
          <Rocket className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl">{t('landing.finalCtaTitle')}</h2>
          <p className="mt-3 text-white/80 max-w-xl mx-auto">{t('landing.finalCtaBody')}</p>
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

      {/* ===================================================== FOOTER */}
      <footer className="bg-ink text-white/60 py-8">
        <div className="section-x flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Wordmark onDark />
            <span className="font-display font-bold text-white/80">{t('common.appName')}</span>
          </div>
          <p>© {new Date().getFullYear()} USAM · {t('landing.footerTagline')}</p>
        </div>
      </footer>
    </div>
  )
}
