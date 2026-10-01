import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Languages, Code2, Bot, Rocket, ArrowRight, Mic, ShieldCheck,
  Compass, PlayCircle, Brain, Hammer, Award, TrendingUp,
  Sparkles, Lightbulb, Users2, FolderCheck, Star,
} from 'lucide-react'
import { CharacterStage } from '@/features/characters/components/CharacterStage'
import { CharacterFace } from '@/features/characters/components/CharacterFace'

/**
 * USAM Kids — public LANDING (experience reconstruction, Phase 1).
 *
 * Rebuilt from the SaaS marketing skeleton (negative baseline: hero + rows of
 * feature cards on a white page, characters as 64px dots) into a WORLD-FIRST
 * experience that communicates child + world + Azouz + adventure + voice before
 * any marketing prose (directive §11). The four LOCKED domains (English,
 * Coding, AI, Entrepreneurship) are shown as DESTINATIONS with their mentors
 * (§7), not a flat card grid. Azouz leads at hero scale via CharacterStage
 * (§9/§10) instead of a tiny circular icon. Warm sunlit canvas, teal brand,
 * flat depth — per docs/architecture/FRONTEND_DESIGN_LANGUAGE.md. EN/AR + RTL
 * throughout via t(key, fallback) + logical properties.
 *
 * See plans-local/90_EXPERIENCE_DEFECT_REGISTER.md (L1–L5) and
 * plans-local/91_LOCKED_EXPERIENCE_DIRECTION.md §4.
 */

// THE 4 LOCKED PRIMARY DOMAINS — as world destinations, each with its mentor.
const WORLDS = [
  { key: 'english', icon: Languages, mentor: 'Luma', grad: 'from-grape-400 to-grape-600',
    titleFallback: 'English World', bodyFallback: 'Speak, read, write and have real conversations — with Luma.' },
  { key: 'coding', icon: Code2, mentor: 'Codey', grad: 'from-success-400 to-success-600',
    titleFallback: 'Coding Lab', bodyFallback: 'Think in logic and build real programs you run — with Codey.' },
  { key: 'ai', icon: Bot, mentor: 'Nova', grad: 'from-secondary-400 to-secondary-600',
    titleFallback: 'AI Lab', bodyFallback: 'See how AI really works, and create with it — with Nova.' },
  { key: 'entrepreneurship', icon: Rocket, mentor: 'Adam', grad: 'from-accent-400 to-accent-600',
    titleFallback: 'Startup Studio', bodyFallback: 'Turn an idea into something real, then pitch it — with Adam.' },
]

// The adventure loop — shown as a path, not 6 equal cards.
const LOOP = [
  { key: 'discover', icon: Compass, titleFallback: 'Discover', bodyFallback: 'Meet Azouz and find your start.' },
  { key: 'learn', icon: PlayCircle, titleFallback: 'Learn', bodyFallback: 'Short missions, one idea at a time.' },
  { key: 'practice', icon: Brain, titleFallback: 'Practice', bodyFallback: 'Smart review, right on time.' },
  { key: 'build', icon: Hammer, titleFallback: 'Build', bodyFallback: 'Make real projects.' },
  { key: 'prove', icon: Award, titleFallback: 'Prove', bodyFallback: 'Earn real evidence.' },
  { key: 'grow', icon: TrendingUp, titleFallback: 'Grow', bodyFallback: 'See what you master.' },
]

const FEATURES = [
  { icon: Sparkles, titleFallback: 'Characters who guide', bodyFallback: 'Azouz and mentors teach with hints and questions — never by handing over answers.' },
  { icon: Brain, titleFallback: 'Adapts to your child', bodyFallback: 'Pace, difficulty and what-comes-next adapt to age, ability and interests.' },
  { icon: Mic, titleFallback: 'Voice built in', bodyFallback: 'Speak, listen and get pronunciation help — in English and Arabic.' },
  { icon: FolderCheck, titleFallback: 'Real evidence', bodyFallback: 'A portfolio of real work and credentials parents can trust.' },
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

  return (
    <div className="min-h-screen bg-surface-50 overflow-x-hidden">
      {/* ===================================================== NAV */}
      <header className="sticky top-0 z-40 bg-surface-50/85 backdrop-blur border-b border-surface-200">
        <div className="section-x flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300">
            <Wordmark />
            <span className="font-display font-bold text-sm text-slate-500 hidden sm:inline">{t('common.appName')}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#worlds" className="hover:text-primary-600 transition-colors">{t('landing.navDomains', 'The worlds')}</a>
            <a href="#how" className="hover:text-primary-600 transition-colors">{t('landing.navHow', 'How it works')}</a>
            <a href="#parents" className="hover:text-primary-600 transition-colors">{t('landing.navParents', 'For parents')}</a>
            <a href="#pricing" className="hover:text-primary-600 transition-colors">{t('landing.navPricing', 'Plans')}</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn btn-secondary">{t('landing.logIn', 'Log in')}</Link>
            <Link to="/register" className="btn btn-primary hidden sm:inline-flex">{t('landing.startLearning', 'Start learning')}</Link>
          </div>
        </div>
      </header>

      {/* ===================================================== WORLD HERO
          A single sunlit scene: Azouz at scale with a speech bubble, the four
          worlds visible around him, one CTA + a voice cue. Reads before prose. */}
      <section className="relative overflow-hidden bg-brand-soft">
        <div aria-hidden className="absolute -top-24 -start-24 w-[32rem] h-[32rem] rounded-full bg-sky-300/30 blur-3xl animate-drift" />
        <div aria-hidden className="absolute top-10 -end-20 w-[26rem] h-[26rem] rounded-full bg-grape-300/25 blur-3xl animate-drift [animation-delay:3s]" />
        <div aria-hidden className="absolute bottom-0 start-1/3 w-[24rem] h-[24rem] rounded-full bg-accent-200/30 blur-3xl animate-drift [animation-delay:5s]" />
        <div aria-hidden className="dots-layer opacity-40" />

        <div className="relative section-x pt-10 pb-16 lg:pt-14 lg:pb-24 grid lg:grid-cols-2 gap-10 items-center">
          {/* Copy side */}
          <div className="text-center lg:text-start order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 rounded-pill bg-white border border-secondary-200 text-secondary-700 px-4 py-1.5 text-sm font-bold shadow-soft">
              <Star className="w-4 h-4 fill-secondary-400 text-secondary-400" />
              {t('landing.ageBadge', 'A learning world for curious kids, ages 8–14')}
            </span>
            <h1 className="mt-5 display-xl">
              {t('landing.heroTitle', 'Step into a world where kids master English, Coding, AI and Entrepreneurship')}
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">
              {t('landing.heroSubtitle', 'Azouz and a cast of mentors guide your child through missions, real projects and voice conversations — learning they can do on their own, and growth you can trust.')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <Link to="/register" className="btn-hero-accent w-full sm:w-auto">
                {t('landing.startLearning', 'Start the adventure')}
                <ArrowRight className="w-5 h-5 rtl:scale-x-[-1]" />
              </Link>
              <a href="#worlds" className="btn btn-secondary px-6 py-4 text-base w-full sm:w-auto justify-center">
                {t('landing.howCta', 'Explore the worlds')}
              </a>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-4 justify-center lg:justify-start text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Mic className="w-4 h-4 text-primary-500" />{t('landing.trustVoice', 'Talks & listens')}</span>
              <span className="inline-flex items-center gap-1.5"><Languages className="w-4 h-4 text-grape-500" />{t('landing.trustBilingual', 'Arabic & English')}</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-accent-500" />{t('landing.trustSafe', 'Safe by design')}</span>
            </div>
          </div>

          {/* Scene side — Azouz at hero scale, worlds orbiting. */}
          <div className="relative order-1 lg:order-2 flex justify-center">
            <div className="relative">
              <CharacterStage
                characterId="Azouz"
                size={260}
                state="encouraging"
                tint="#1c5a4d"
                bubbleSide="top"
                speech={
                  <span className="font-semibold">
                    {t('landing.azouzHello', "Hi! I'm Azouz. Pick a world and I'll guide you — I never do the work for you.")}
                  </span>
                }
              />
              {/* The four worlds as small orbiting portals around Azouz. */}
              <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
                {WORLDS.map((w, i) => (
                  <motion.div
                    key={w.key}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 180 }}
                    className={`flex flex-col items-center gap-1 rounded-blob p-2 bg-gradient-to-br ${w.grad} shadow-soft-md`}
                  >
                    <CharacterFace characterId={w.mentor} size={40} />
                    <span className="text-[10px] font-bold text-white text-center leading-tight">{w.mentor}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== WORLDS (destinations) */}
      <section id="worlds" className="section-x py-16 lg:py-20 scroll-mt-20">
        <div className="text-center mb-10">
          <p className="eyebrow justify-center">{t('landing.domainsEyebrow', 'Four worlds to explore')}</p>
          <h2 className="display-lg mt-1">{t('landing.domainsTitle', 'Each world has a mentor who teaches')}</h2>
          <p className="text-slate-500 mt-2 max-w-2xl mx-auto">{t('landing.domainsSubtitle', 'Not school subjects on a list — four connected worlds your child grows across, each led by a character who knows it best.')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WORLDS.map(({ key, mentor, grad, titleFallback, bodyFallback }, i) => (
            <div
              key={key}
              className={`animate-fade-in-up ${i % 2 === 1 ? 'lg:mt-8' : ''}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`relative overflow-hidden rounded-blob p-6 text-white shadow-lift bg-gradient-to-br ${grad} h-full`}>
                <div aria-hidden className="dots-layer opacity-[0.18]" />
                <div className="relative flex justify-center mb-3">
                  <div className="rounded-full bg-white/15 p-2.5">
                    <CharacterFace characterId={mentor} size={92} />
                  </div>
                </div>
                <h3 className="relative font-display font-extrabold text-lg text-center">{t(`landing.domains.${key}Title`, titleFallback)}</h3>
                <p className="relative text-sm text-white/90 mt-2 text-center leading-relaxed">{t(`landing.domains.${key}Body`, bodyFallback)}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6 max-w-2xl mx-auto">
          {t('landing.domainsNote', 'Science, maths and more appear inside real projects when they help — USAM is built around these four worlds, not a generic school curriculum.')}
        </p>
      </section>

      {/* ===================================================== THE LOOP (a path) */}
      <section id="how" className="bg-white border-y border-surface-200 py-16 lg:py-20 scroll-mt-20">
        <div className="section-x">
          <div className="text-center mb-12">
            <p className="eyebrow justify-center">{t('landing.howEyebrow', 'How a day works')}</p>
            <h2 className="display-lg mt-1">{t('landing.howTitle', 'A learning loop that actually sticks')}</h2>
          </div>
          <ol className="relative flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-4 sm:gap-3 justify-between">
            {LOOP.map(({ key, icon: Icon, titleFallback, bodyFallback }, i) => (
              <li
                key={key}
                className="relative flex-1 flex flex-col items-center text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="relative w-14 h-14 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-3 border-2 border-primary-100">
                  <Icon className="w-6 h-6" strokeWidth={2} />
                  <span className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-extrabold flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="font-display font-bold text-sm text-ink">{t(`landing.journey.${key}Title`, titleFallback)}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-snug max-w-[9rem]">{t(`landing.journey.${key}Body`, bodyFallback)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===================================================== COMPANIONS (at scale) */}
      <section className="section-x py-16 lg:py-20 text-center">
        <p className="eyebrow justify-center">{t('landing.companionsEyebrow', 'The USAM universe')}</p>
        <h2 className="display-lg mt-1">{t('landing.companionsTitle', 'A whole cast, ready to help')}</h2>
        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">{t('landing.companionsBody', 'Azouz is your main companion. Specialist mentors appear when they can help — and unlock as your child grows.')}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-10">
          {['Azouz', 'Luma', 'Codey', 'Nova', 'Adam', 'Mira', 'Zara', 'Atlas'].map((name, i) => (
            <div
              key={name}
              className="flex flex-col items-center animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <CharacterFace characterId={name} size={96} />
              <p className="mt-1 text-sm font-bold text-slate-600">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================== FEATURES */}
      <section className="bg-white border-y border-surface-200 py-16 lg:py-20">
        <div className="section-x">
          <div className="text-center mb-10">
            <p className="eyebrow justify-center">{t('landing.whyEyebrow', 'Why USAM')}</p>
            <h2 className="display-lg mt-1">{t('landing.whyTitle', 'Built for how children really learn')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, titleFallback, bodyFallback }, i) => (
              <div
                key={titleFallback}
                className="card animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="icon-chip bg-primary-50 text-primary-600 mb-4"><Icon className="w-6 h-6" /></div>
                <h3 className="font-display font-bold text-base text-ink">{t(`landing.features.f${i}Title`, titleFallback)}</h3>
                <p className="text-slate-500 mt-1.5 text-sm leading-relaxed">{t(`landing.features.f${i}Body`, bodyFallback)}</p>
              </div>
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
            <p className="text-slate-600 mt-3 leading-relaxed">{t('landing.parentsBody', 'A calm dashboard shows mastery by world, a portfolio of real work, and verifiable credentials. Consent, privacy and screen-time controls are built in — child data is protected by design.')}</p>
            <Link to="/register" className="btn btn-primary mt-5">
              {t('landing.parentsCta', 'Create a family account')}
              <ArrowRight className="w-4 h-4 rtl:scale-x-[-1]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              { k: 'progress', fallback: 'Mastery and evidence by world — not just points' },
              { k: 'portfolio', fallback: 'A portfolio of real projects your child built' },
              { k: 'privacy', fallback: 'Consent, data export/delete, and screen-time controls' },
            ].map(({ k, fallback }, i) => (
              <div
                key={k}
                className="flex items-center gap-3 bg-white rounded-control p-4 border border-surface-200 animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <ShieldCheck className="w-5 h-5 text-primary-500 shrink-0" strokeWidth={2} />
                <span className="text-sm font-medium text-slate-700">{t(`landing.parentsPoints.${k}`, fallback)}</span>
              </div>
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
            { k: 'explorer', name: 'Explorer', fallback: 'One learner, the full learning product.' },
            { k: 'family', name: 'Family', fallback: 'Up to 4 children, everything, plus voice.', featured: true },
          ].map(({ k, name, fallback, featured }, i) => (
            <div
              key={k}
              className={`card text-start animate-fade-in-up ${featured ? 'ring-2 ring-primary-400 relative' : ''}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {featured && <span className="absolute -top-3 start-5 inline-flex items-center gap-1 rounded-pill bg-primary-600 text-white px-3 py-0.5 text-[11px] font-bold"><Lightbulb className="w-3 h-3" />{t('landing.pricingPopular', 'Most popular')}</span>}
              <h3 className="font-display font-extrabold text-ink">{t(`landing.plans.${k}Name`, name)}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{t(`landing.plans.${k}Body`, fallback)}</p>
            </div>
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
        <div className="relative section-x py-20 text-center flex flex-col items-center">
          <CharacterFace characterId="Azouz" size={120} state="celebrating" />
          <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl">{t('landing.finalCtaTitle', "Your child's learning adventure starts here")}</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">{t('landing.finalCtaBody', 'English, Coding, AI and Entrepreneurship — one world, one companion, real growth.')}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-hero-accent w-full sm:w-auto">
              {t('landing.startLearning', 'Start the adventure')}
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
