import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Sparkles, Languages, Code2, ArrowRight, Bot, Rocket,
  ShieldCheck, Trophy, Mic, Star, Brain, Compass, MessageCircle,
  PlayCircle, HeartHandshake, Users2, FolderCheck, Hammer, Award,
  TrendingUp, Lightbulb,
} from 'lucide-react'
import { CharacterFace } from '@/features/characters/components/CharacterFace'
import { setPreferredCharacter, type PreferredCharacterName } from '../lib/characterPreference'

/**
 * USAM Kids — public LANDING (product-first reconstruction, directive §17).
 *
 * Rebuilt around the LOCKED 4 primary domains (English, Coding, AI,
 * Entrepreneurship) — the previous version presented the REJECTED generic
 * school-subject "worlds" (Math/Science/Arts), which is scope-wrong. This
 * answers: what USAM is, who it's for, what the child learns + actually does,
 * the four domains, the learning journey, companions, voice, projects/evidence/
 * portfolio, parent value, safety, and a clear start. EN/AR + RTL, built on the
 * real CharacterFace SVG system + design tokens. i18n via t(key, fallback) so it
 * renders before locale keys are authored (AR/EN keys added in the i18n pass).
 */

interface LandingCharacter {
  name: PreferredCharacterName
  roleKey: string
  roleFallback: string
  greetingFallback: string
  tint: string
}

// Hero companion picker — the 4 characters the pre-signup preference supports.
const LANDING_CHARACTERS: LandingCharacter[] = [
  { name: 'Azouz', roleKey: 'mainGuide', roleFallback: 'Your guide', greetingFallback: "Hi! I'm Azouz. I'll help you find what to do next — I never do the work for you.", tint: '#f59e0b' },
  { name: 'Zein', roleKey: 'explorer', roleFallback: 'Explorer', greetingFallback: "Let's explore! Every world has something new to discover.", tint: '#3b90f6' },
  { name: 'Luma', roleKey: 'englishCoach', roleFallback: 'English coach', greetingFallback: 'Say it so a stranger could picture it. Words are powerful!', tint: '#8b5cf6' },
  { name: 'Codey', roleKey: 'codingMentor', roleFallback: 'Coding mentor', greetingFallback: "Predict what the code does — then run it. Bugs are just clues.", tint: '#10b981' },
]

// THE 4 LOCKED PRIMARY DOMAINS (replaces the old 6 school-subject worlds).
const DOMAINS = [
  { key: 'english', icon: Languages, grad: 'from-grape-400 to-grape-600', mentor: 'Luma',
    titleFallback: 'English', bodyFallback: 'Vocabulary, reading, writing, speaking and real conversation — CEFR-aligned, with Luma.' },
  { key: 'coding', icon: Code2, grad: 'from-success-400 to-success-600', mentor: 'Codey',
    titleFallback: 'Coding', bodyFallback: 'Think like a problem-solver: logic, loops, debugging and real programs you build and run.' },
  { key: 'ai', icon: Bot, grad: 'from-secondary-400 to-secondary-600', mentor: 'Nova',
    titleFallback: 'AI Literacy', bodyFallback: 'How AI really works, where it gets things wrong, and how to create with it responsibly — with Nova.' },
  { key: 'entrepreneurship', icon: Rocket, grad: 'from-accent-400 to-accent-600', mentor: 'Adam',
    titleFallback: 'Entrepreneurship', bodyFallback: 'Turn an idea into something real: find a problem, build a solution, test it, and pitch it — with Adam.' },
]

// The learning journey (the visible loop) → landing.journey.*
const JOURNEY = [
  { key: 'discover', icon: Compass, titleFallback: 'Discover', bodyFallback: 'Meet Azouz and find your starting point with a quick, playful check-in.' },
  { key: 'learn', icon: PlayCircle, titleFallback: 'Learn', bodyFallback: 'Short missions teach one idea at a time — then you try it yourself.' },
  { key: 'practice', icon: Brain, titleFallback: 'Practice', bodyFallback: 'Smart review brings back what you are about to forget, right on time.' },
  { key: 'build', icon: Hammer, titleFallback: 'Build', bodyFallback: 'Make real projects — a program, a story, an idea, a pitch.' },
  { key: 'prove', icon: Award, titleFallback: 'Prove', bodyFallback: 'Earn evidence of real skill, not just points — saved to your portfolio.' },
  { key: 'grow', icon: TrendingUp, titleFallback: 'Grow', bodyFallback: 'See exactly what you are getting better at, across every domain.' },
]

// Why USAM → landing.features.*
const FEATURES = [
  { icon: Sparkles, titleFallback: 'Characters who guide', bodyFallback: 'Azouz and specialist mentors teach with hints and questions — never by handing over answers.' },
  { icon: Brain, titleFallback: 'Adaptive to your child', bodyFallback: 'Difficulty, pacing and what-comes-next adapt to age, ability, interests and progress.' },
  { icon: Mic, titleFallback: 'Voice built in', bodyFallback: 'Speak, listen and get pronunciation help — in English and Arabic.' },
  { icon: Languages, titleFallback: 'Arabic & English', bodyFallback: 'A real bilingual experience, right-to-left done properly — not an afterthought.' },
  { icon: FolderCheck, titleFallback: 'Real evidence', bodyFallback: 'A portfolio of real work and verifiable credentials parents can trust.' },
  { icon: ShieldCheck, titleFallback: 'Safe by design', bodyFallback: 'Child-first privacy, moderation, and AI that never asks for secrecy or creates dependency.' },
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
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#domains" className="hover:text-primary-600 transition-colors">{t('landing.navDomains', 'What they learn')}</a>
            <a href="#how" className="hover:text-primary-600 transition-colors">{t('landing.navHow', 'How it works')}</a>
            <a href="#parents" className="hover:text-primary-600 transition-colors">{t('landing.navParents', 'For parents')}</a>
            <a href="#pricing" className="hover:text-primary-600 transition-colors">{t('landing.navPricing', 'Plans')}</a>
          </nav>
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
              {t('landing.ageBadge', 'For curious kids, ages 8–14')}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="mt-5 font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-ink"
            >
              {t('landing.heroTitle', 'One world where kids master English, Coding, AI and Entrepreneurship')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="mt-5 text-lg text-slate-600 max-w-xl mx-auto lg:mx-0"
            >
              {t('landing.heroSubtitle', 'A guided, AI-native learning universe where your child learns alone — with characters, voice, real projects, and evidence of growth you can trust.')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start"
            >
              <Link to="/register" className="btn-hero-accent w-full sm:w-auto">
                {t('landing.startLearning', 'Start learning')}
                <ArrowRight className="w-5 h-5 rtl:scale-x-[-1]" />
              </Link>
              <a href="#domains" className="btn btn-secondary px-6 py-4 text-base w-full sm:w-auto justify-center">
                {t('landing.howCta', 'See what they learn')}
              </a>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
              className="mt-8 flex flex-wrap items-center gap-4 justify-center lg:justify-start text-xs font-semibold text-slate-500"
            >
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary-500" />{t('landing.trustSafe', 'Safe for kids')}</span>
              <span className="inline-flex items-center gap-1.5"><Languages className="w-4 h-4 text-grape-500" />{t('landing.trustBilingual', 'Arabic & English')}</span>
              <span className="inline-flex items-center gap-1.5"><HeartHandshake className="w-4 h-4 text-accent-500" />{t('landing.trustParents', 'Parent-trusted evidence')}</span>
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
                    <p className="text-[11px] font-semibold text-slate-500">{t(`landing.charRoles.${c.roleKey}`, c.roleFallback)}</p>
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
                  <p className="text-sm text-slate-700 leading-snug">"{t(`landing.charGreetings.${selectedCharacter.name.toLowerCase()}`, selectedCharacter.greetingFallback)}"</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================== DOMAINS (the 4 locked pillars) */}
      <section id="domains" className="section-x py-16 lg:py-20 scroll-mt-20">
        <div className="text-center mb-10">
          <p className="eyebrow justify-center">{t('landing.domainsEyebrow', 'What your child learns')}</p>
          <h2 className="display-lg mt-1">{t('landing.domainsTitle', 'Four skills that shape the future')}</h2>
          <p className="text-slate-500 mt-2 max-w-2xl mx-auto">{t('landing.domainsSubtitle', 'Not a pile of school subjects — four connected domains a child grows across, with a mentor for each.')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {DOMAINS.map(({ key, icon: Icon, grad, mentor, titleFallback, bodyFallback }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="card relative overflow-hidden flex items-start gap-4"
            >
              <div aria-hidden className={`absolute -right-10 -top-10 w-28 h-28 rounded-full bg-gradient-to-br ${grad} opacity-10`} />
              <div className={`icon-chip bg-gradient-to-br ${grad} text-white w-14 h-14 shrink-0`}><Icon className="w-7 h-7" strokeWidth={2} /></div>
              <div className="relative">
                <h3 className="font-display font-bold text-lg text-ink">{t(`landing.domains.${key}Title`, titleFallback)}</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{t(`landing.domains.${key}Body`, bodyFallback)}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600">
                  <CharacterFace characterId={mentor} size={22} /> {t('landing.ledBy', 'Led by')} {mentor}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6 max-w-2xl mx-auto">
          {t('landing.domainsNote', 'Science, maths and more show up inside real projects when they help — but USAM is built around these four, not a generic school curriculum.')}
        </p>
      </section>

      {/* ===================================================== LEARNING JOURNEY */}
      <section id="how" className="bg-surface-50 border-y border-surface-200 py-16 lg:py-20 scroll-mt-20">
        <div className="section-x">
          <div className="text-center mb-12">
            <p className="eyebrow justify-center">{t('landing.howEyebrow', 'How it works')}</p>
            <h2 className="display-lg mt-1">{t('landing.howTitle', 'A learning loop that actually sticks')}</h2>
            <p className="text-slate-500 mt-2 max-w-xl mx-auto">{t('landing.howSubtitle', 'Every session: review, learn, practice, build, prove, grow — adapted to your child.')}</p>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {JOURNEY.map(({ key, icon: Icon, titleFallback, bodyFallback }, i) => (
              <motion.li
                key={key}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="card relative"
              >
                <span className="absolute top-4 end-4 font-display font-extrabold text-3xl text-surface-200">{i + 1}</span>
                <div className="icon-chip bg-primary-50 text-primary-600 w-14 h-14 mb-4"><Icon className="w-7 h-7" strokeWidth={2} /></div>
                <h3 className="font-display font-bold text-ink">{t(`landing.journey.${key}Title`, titleFallback)}</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{t(`landing.journey.${key}Body`, bodyFallback)}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===================================================== COMPANIONS */}
      <section className="section-x py-16 lg:py-20 text-center">
        <p className="eyebrow justify-center">{t('landing.companionsEyebrow', 'The USAM universe')}</p>
        <h2 className="display-lg mt-1">{t('landing.companionsTitle', 'A cast of characters who teach')}</h2>
        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">{t('landing.companionsBody', 'Azouz is your main companion. Specialist mentors appear when they can help — and unlock as your child grows.')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6">
          {['Azouz', 'Luma', 'Codey', 'Nova', 'Adam', 'Mira', 'Zara', 'Rex'].map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.7 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05, type: 'spring', stiffness: 160 }}
              className="flex flex-col items-center"
            >
              <div className="rounded-full p-2.5 bg-surface-100 shadow-soft">
                <CharacterFace characterId={name} size={64} />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-600">{name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================================================== FEATURES */}
      <section className="bg-surface-50 border-y border-surface-200 py-16 lg:py-20">
        <div className="section-x">
          <div className="text-center mb-10">
            <p className="eyebrow justify-center">{t('landing.whyEyebrow', 'Why USAM')}</p>
            <h2 className="display-lg mt-1">{t('landing.whyTitle', 'Built for how children really learn')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, titleFallback, bodyFallback }, i) => (
              <motion.div
                key={titleFallback}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="card"
              >
                <div className="icon-chip bg-primary-50 text-primary-600 mb-4"><Icon className="w-6 h-6" /></div>
                <h3 className="font-display font-bold text-lg text-ink">{t(`landing.features.f${i}Title`, titleFallback)}</h3>
                <p className="text-slate-500 mt-1.5 text-sm leading-relaxed">{t(`landing.features.f${i}Body`, bodyFallback)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== PARENTS / SAFETY */}
      <section id="parents" className="section-x py-16 lg:py-20 scroll-mt-20">
        <div className="card-playful bg-primary-50/40 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="icon-chip bg-primary-600 text-white w-12 h-12 mb-4"><Users2 className="w-6 h-6" /></div>
            <p className="eyebrow">{t('landing.parentsEyebrow', 'For parents')}</p>
            <h2 className="display-lg mt-1">{t('landing.parentsTitle', 'See real growth — and stay in control')}</h2>
            <p className="text-slate-600 mt-3 leading-relaxed">{t('landing.parentsBody', 'A calm dashboard shows mastery by domain, a portfolio of real work, and verifiable credentials. Consent, privacy and screen-time controls are built in — child data is protected by design.')}</p>
            <Link to="/register" className="btn btn-primary mt-5">
              {t('landing.parentsCta', 'Create a family account')}
              <ArrowRight className="w-4 h-4 rtl:scale-x-[-1]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              { k: 'progress', fallback: 'Mastery and evidence by domain — not just points' },
              { k: 'portfolio', fallback: 'A portfolio of real projects your child built' },
              { k: 'privacy', fallback: 'Consent, data export/delete, and screen-time controls' },
            ].map(({ k, fallback }, i) => (
              <motion.div
                key={k}
                initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 bg-white rounded-control p-4 border border-surface-200"
              >
                <ShieldCheck className="w-5 h-5 text-primary-500 shrink-0" strokeWidth={2} />
                <span className="text-sm font-medium text-slate-700">{t(`landing.parentsPoints.${k}`, fallback)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== PRICING TEASER */}
      <section id="pricing" className="section-x py-16 lg:py-20 scroll-mt-20 text-center">
        <p className="eyebrow justify-center">{t('landing.pricingEyebrow', 'Simple family plans')}</p>
        <h2 className="display-lg mt-1">{t('landing.pricingTitle', 'Start free. Upgrade when you are ready.')}</h2>
        <p className="text-slate-500 mt-2 max-w-xl mx-auto">{t('landing.pricingSubtitle', 'A free tier to explore, a plan for one learner, and a family plan with voice for up to four children.')}</p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {[
            { k: 'free', name: 'Free', fallback: 'Explore the world, a few missions a day.' },
            { k: 'explorer', name: 'Explorer', fallback: 'One learner, the full learning product.', featured: false },
            { k: 'family', name: 'Family', fallback: 'Up to 4 children, everything, plus voice.', featured: true },
          ].map(({ k, name, fallback, featured }, i) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className={`card text-start ${featured ? 'ring-2 ring-primary-400 relative' : ''}`}
            >
              {featured && <span className="absolute -top-3 start-5 inline-flex items-center gap-1 rounded-pill bg-primary-600 text-white px-3 py-0.5 text-[11px] font-bold"><Lightbulb className="w-3 h-3" />{t('landing.pricingPopular', 'Most popular')}</span>}
              <h3 className="font-display font-extrabold text-ink">{t(`landing.plans.${k}Name`, name)}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{t(`landing.plans.${k}Body`, fallback)}</p>
            </motion.div>
          ))}
        </div>
        <Link to="/register" className="btn btn-primary mt-8 inline-flex">
          {t('landing.pricingCta', 'See plans & start')}
          <ArrowRight className="w-4 h-4 rtl:scale-x-[-1]" />
        </Link>
      </section>

      {/* ===================================================== FINAL CTA */}
      <section className="relative bg-aurora text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0 dots-layer opacity-[0.15]" />
        <div className="relative section-x py-20 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl">{t('landing.finalCtaTitle', 'Your child’s learning adventure starts here')}</h2>
          <p className="mt-3 text-white/80 max-w-xl mx-auto">{t('landing.finalCtaBody', 'English, Coding, AI and Entrepreneurship — one world, one companion, real growth.')}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-hero-accent w-full sm:w-auto">
              {t('landing.startLearning', 'Start learning')}
              <ArrowRight className="w-5 h-5 rtl:scale-x-[-1]" />
            </Link>
            <Link to="/login" className="chip-glass px-6 py-4 text-base hover:bg-white/25 transition-colors w-full sm:w-auto justify-center">
              {t('landing.logIn', 'Log in')}
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
          <p>© {new Date().getFullYear()} USAM · {t('landing.footerTagline', 'Learn. Build. Grow.')}</p>
        </div>
      </footer>
    </div>
  )
}
