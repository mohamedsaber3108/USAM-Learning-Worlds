import { motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'

/**
 * Hand-crafted illustrated-style SVG avatars — one bespoke design per
 * character (not a shared shape recolored). Every character is a distinct
 * blob/creature silhouette with its own gradient, facial features and
 * role-motif accessory (circuits, flask, compass, cape, etc).
 *
 * Idle life comes from real framer-motion animation (not a static CSS
 * class): the whole body gently bobs + breathes, and eyes blink on an
 * independent, staggered loop so a wall of characters doesn't blink in
 * unison.
 */
export interface CharacterFaceProps {
  /** Character name (matches CHARACTER_VISUALS keys), case-insensitive. */
  characterId: string
  /** Pixel size of the rendered square SVG. */
  size?: number
  /** Locked characters render as a desaturated silhouette of their real design. */
  locked?: boolean
  /** Disable idle animation (e.g. for reduced-motion or tiny thumbnails). */
  animate?: boolean
  className?: string
}

/* ---------------------------------------------------------------------- */
/* Shared primitives                                                       */
/* ---------------------------------------------------------------------- */

/** Blinking eye pair — independent stagger per character via blinkDelay. */
function Eyes({
  cx1,
  cx2,
  cy,
  r = 7,
  pupil = '#1E293B',
  sclera = '#FFFFFF',
  blinkDelay = 0,
  animate = true,
}: {
  cx1: number
  cx2: number
  cy: number
  r?: number
  pupil?: string
  sclera?: string
  blinkDelay?: number
  animate?: boolean
}) {
  const blinkProps = animate
    ? {
        animate: { scaleY: [1, 1, 1, 0.1, 1, 1, 1, 1, 1, 1] },
        transition: {
          duration: 4.5,
          repeat: Infinity,
          repeatDelay: blinkDelay,
          ease: 'easeInOut' as const,
          times: [0, 0.4, 0.75, 0.8, 0.85, 1, 1, 1, 1, 1],
        },
      }
    : {}
  return (
    <>
      {[cx1, cx2].map((cx, i) => (
        <motion.g key={i} style={{ transformOrigin: `${cx}px ${cy}px` }} {...blinkProps}>
          <circle cx={cx} cy={cy} r={r} fill={sclera} />
          <circle cx={cx + r * 0.25} cy={cy + r * 0.15} r={r * 0.55} fill={pupil} />
          <circle cx={cx + r * 0.45} cy={cy - r * 0.25} r={r * 0.18} fill="#fff" opacity={0.9} />
        </motion.g>
      ))}
    </>
  )
}

/** Wrapping bob + breathing-scale motion applied to the whole creature. */
function IdleBody({
  animate,
  children,
  bobDelay = 0,
}: {
  animate: boolean
  children: ReactNode
  bobDelay?: number
}) {
  const bobProps = animate
    ? {
        animate: { y: [0, -2.5, 0], scale: [1, 1.015, 1] },
        transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const, delay: bobDelay },
      }
    : {}
  return (
    <motion.g {...bobProps} style={{ transformOrigin: '60px 68px' }}>
      {children}
    </motion.g>
  )
}

/* ---------------------------------------------------------------------- */
/* Per-character designs (viewBox 0 0 120 120)                            */
/* ---------------------------------------------------------------------- */

type FaceRenderer = (opts: { uid: string; animate: boolean }) => ReactNode

const AZOUZ: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFD86B" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    <IdleBody animate={animate}>
      {/* star-blob body with soft points */}
      <path
        d="M60 18c4 10 8 14 18 16-10 4-14 8-16 18-4-10-8-14-18-16 10-4 14-8 16-18z"
        fill={`url(#g-${uid})`}
        opacity={0.55}
        transform="translate(-2 -6) scale(1.1)"
      />
      <circle cx="60" cy="68" r="38" fill={`url(#g-${uid})`} />
      <path d="M60 20 L66 34 L54 34 Z" fill="#FDE68A" opacity={0.9} />
      <circle cx="30" cy="58" r="5" fill="#FDE68A" />
      <circle cx="92" cy="70" r="4" fill="#FDE68A" />
      <Eyes cx1={47} cx2={73} cy={64} animate={animate} blinkDelay={2.2} />
      <path d="M48 84q12 10 24 0" stroke="#7C4A03" strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <circle cx="38" cy="78" r="5" fill="#FCA5A5" opacity={0.55} />
      <circle cx="82" cy="78" r="5" fill="#FCA5A5" opacity={0.55} />
    </IdleBody>
  </>
)

const ZEIN: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
    </defs>
    <IdleBody animate={animate}>
      {/* explorer hood/cap silhouette */}
      <path d="M22 70c0-24 17-42 38-42s38 18 38 42c0 6-4 10-10 10H32c-6 0-10-4-10-10z" fill={`url(#g-${uid})`} />
      <path d="M60 28c-14 0-26 10-32 24 8-6 20-9 32-9s24 3 32 9c-6-14-18-24-32-24z" fill="#0C4A6E" opacity={0.5} />
      {/* compass rose emblem */}
      <g transform="translate(60 66)">
        <circle r="12" fill="#E0F2FE" />
        <path d="M0 -10 L3 0 L0 10 L-3 0 Z" fill="#F97316" />
        <path d="M-10 0 L0 -3 L10 0 L0 3 Z" fill="#0EA5E9" opacity={0.8} />
      </g>
      <Eyes cx1={41} cx2={79} cy={82} animate={animate} blinkDelay={3.1} pupil="#0C4A6E" />
      <path d="M50 96q10 8 20 0" stroke="#0C4A6E" strokeWidth={3} strokeLinecap="round" fill="none" />
    </IdleBody>
  </>
)

const LUMA: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <radialGradient id={`g-${uid}`} cx="40%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#E9D5FF" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </radialGradient>
    </defs>
    <IdleBody animate={animate}>
      {/* glowing orb creature */}
      <circle cx="60" cy="64" r="30" fill={`url(#g-${uid})`} opacity={0.35} />
      <circle cx="60" cy="64" r="24" fill={`url(#g-${uid})`} />
      {/* open book resting under the orb */}
      <path d="M32 92 Q60 82 88 92 L88 100 Q60 92 32 100 Z" fill="#FDF4FF" />
      <path d="M60 82 L60 96" stroke="#C084FC" strokeWidth={2} />
      <path d="M34 92 Q46 88 58 92" stroke="#C084FC" strokeWidth={1.4} fill="none" />
      <path d="M86 92 Q74 88 62 92" stroke="#C084FC" strokeWidth={1.4} fill="none" />
      <Eyes cx1={50} cx2={70} cy={60} r={6.5} animate={animate} blinkDelay={2.7} pupil="#6D28D9" />
      <path d="M51 74q9 7 18 0" stroke="#6D28D9" strokeWidth={3} strokeLinecap="round" fill="none" />
      <circle cx="30" cy="40" r="3" fill="#F5D0FE" />
      <circle cx="92" cy="46" r="2.2" fill="#F5D0FE" />
    </IdleBody>
  </>
)

const CODEY: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#86EFAC" />
        <stop offset="100%" stopColor="#16A34A" />
      </linearGradient>
    </defs>
    <IdleBody animate={animate}>
      {/* robot-blob head, rounded square */}
      <rect x="26" y="30" width="68" height="60" rx="22" fill={`url(#g-${uid})`} />
      <rect x="54" y="14" width="12" height="16" rx="5" fill="#4ADE80" />
      <circle cx="60" cy="12" r="5" fill="#BBF7D0" />
      {/* circuit pattern */}
      <path d="M34 50h10v-8h8" stroke="#052e12" strokeWidth={2} fill="none" opacity={0.45} />
      <path d="M86 60h-9v10h-8" stroke="#052e12" strokeWidth={2} fill="none" opacity={0.45} />
      <circle cx="44" cy="42" r="2" fill="#052e12" opacity={0.45} />
      <circle cx="77" cy="70" r="2" fill="#052e12" opacity={0.45} />
      {/* screen face */}
      <rect x="38" y="52" width="44" height="28" rx="10" fill="#052e12" opacity={0.85} />
      <Eyes cx1={50} cx2={70} cy={66} r={5.5} sclera="#BBF7D0" pupil="#052e12" animate={animate} blinkDelay={1.9} />
      <path d="M52 76h16" stroke="#BBF7D0" strokeWidth={2.4} strokeLinecap="round" />
    </IdleBody>
  </>
)

const NOVA: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#A5B4FC" />
        <stop offset="100%" stopColor="#4338CA" />
      </linearGradient>
    </defs>
    <IdleBody animate={animate}>
      {/* sleek hexagonal AI head */}
      <path d="M60 20 L94 40 L94 80 L60 100 L26 80 L26 40 Z" fill={`url(#g-${uid})`} />
      {/* node network */}
      <g stroke="#1E1B4B" strokeWidth={1.4} opacity={0.5}>
        <path d="M36 44 L52 54 M84 44 L68 54 M52 54 L68 54 M52 54 L52 74 M68 54 L68 74" />
      </g>
      <circle cx="36" cy="44" r="2.4" fill="#C7D2FE" />
      <circle cx="84" cy="44" r="2.4" fill="#C7D2FE" />
      <circle cx="52" cy="74" r="2.4" fill="#C7D2FE" />
      <circle cx="68" cy="74" r="2.4" fill="#C7D2FE" />
      {/* glowing core face */}
      <circle cx="60" cy="60" r="20" fill="#1E1B4B" opacity={0.9} />
      <Eyes cx1={51} cx2={69} cy={58} r={5} sclera="#C7D2FE" pupil="#1E1B4B" animate={animate} blinkDelay={2.4} />
      <motion.circle
        cx="60"
        cy="70"
        r="3"
        fill="#818CF8"
        {...(animate
          ? { animate: { opacity: [0.4, 1, 0.4] }, transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const } }
          : {})}
      />
    </IdleBody>
  </>
)

const MIRA: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F9A8D4" />
        <stop offset="100%" stopColor="#DB2777" />
      </linearGradient>
    </defs>
    <IdleBody animate={animate}>
      {/* paint-palette shaped body with a thumb-hole notch */}
      <path
        d="M60 24c24 0 38 16 38 34 0 16-10 28-26 30-6 1-8-4-4-8 3-3 1-7-3-7-20 0-38-9-38-30 0-11 12-19 33-19z"
        fill={`url(#g-${uid})`}
      />
      <circle cx="42" cy="52" r="5" fill="#FDE68A" />
      <circle cx="60" cy="42" r="5" fill="#93C5FD" />
      <circle cx="78" cy="52" r="5" fill="#86EFAC" />
      <circle cx="82" cy="68" r="5" fill="#FCA5A5" />
      <Eyes cx1={49} cx2={71} cy={66} animate={animate} blinkDelay={3.6} pupil="#831843" />
      <path d="M50 80q10 8 20 0" stroke="#831843" strokeWidth={3} strokeLinecap="round" fill="none" />
    </IdleBody>
  </>
)

const RAMI: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5EEAD4" />
        <stop offset="100%" stopColor="#0F766E" />
      </linearGradient>
    </defs>
    <IdleBody animate={animate}>
      {/* flask-shaped head/body */}
      <rect x="52" y="18" width="16" height="20" fill="#99F6E4" />
      <path d="M46 38h28l14 40c3 9-4 18-14 18H46c-10 0-17-9-14-18z" fill={`url(#g-${uid})`} />
      {/* bubbling liquid line */}
      <path d="M40 70h40" stroke="#042f2e" strokeWidth={2} opacity={0.25} />
      <circle cx="46" cy="82" r="3" fill="#CCFBF1" opacity={0.8} />
      <circle cx="72" cy="86" r="2.4" fill="#CCFBF1" opacity={0.8} />
      <circle cx="60" cy="90" r="2" fill="#CCFBF1" opacity={0.8} />
      <Eyes cx1={50} cx2={70} cy={64} animate={animate} blinkDelay={2.1} pupil="#042f2e" />
      <ellipse cx="60" cy="64" rx="26" ry="20" fill="none" stroke="#042f2e" strokeWidth={1.6} opacity={0.15} />
      <path d="M50 82q10 6 20 0" stroke="#042f2e" strokeWidth={3} strokeLinecap="round" fill="none" />
    </IdleBody>
  </>
)

const FARIS: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDBA74" />
        <stop offset="100%" stopColor="#C2410C" />
      </linearGradient>
    </defs>
    <IdleBody animate={animate}>
      {/* jigsaw-notched blob body */}
      <path
        d="M40 30h20c0-6 6-10 10-6 4 4 0 10-6 10v6h20c6 0 10 6 6 10-4 4-4 10 0 14 4 4 0 10-6 10H64v6c6 0 10 6 6 10-4 4-10 0-10-6H40c-6 0-10-6-6-10 4-4 4-10 0-14-4-4 0-10 6-10v-6c-6 0-10-6-6-10s10-4 10 0z"
        fill={`url(#g-${uid})`}
      />
      <Eyes cx1={49} cx2={71} cy={58} animate={animate} blinkDelay={1.7} pupil="#7C2D12" />
      <path d="M50 72q10 7 20 0" stroke="#7C2D12" strokeWidth={3} strokeLinecap="round" fill="none" />
    </IdleBody>
  </>
)

const TALA: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F0ABFC" />
        <stop offset="100%" stopColor="#A21CAF" />
      </linearGradient>
    </defs>
    <IdleBody animate={animate}>
      {/* mic-head creature */}
      <rect x="42" y="20" width="36" height="50" rx="18" fill={`url(#g-${uid})`} />
      <rect x="46" y="26" width="28" height="6" rx="3" fill="#FDF4FF" opacity={0.6} />
      <rect x="46" y="36" width="28" height="6" rx="3" fill="#FDF4FF" opacity={0.6} />
      <rect x="46" y="46" width="28" height="6" rx="3" fill="#FDF4FF" opacity={0.6} />
      <rect x="50" y="70" width="20" height="20" rx="6" fill="#86198F" />
      <path d="M60 90v10" stroke="#86198F" strokeWidth={5} strokeLinecap="round" />
      <path d="M42 96h36" stroke="#86198F" strokeWidth={5} strokeLinecap="round" />
      <Eyes cx1={50} cx2={70} cy={38} r={5.5} animate={animate} blinkDelay={2.9} pupil="#701A75" />
      {/* sound waves */}
      <motion.g
        {...(animate
          ? { animate: { opacity: [0.2, 0.9, 0.2] }, transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const } }
          : {})}
      >
        <path d="M26 44q-6 6 0 12" stroke="#D946EF" strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M94 44q6 6 0 12" stroke="#D946EF" strokeWidth={3} fill="none" strokeLinecap="round" />
      </motion.g>
    </IdleBody>
  </>
)

const ADAM: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FCA5A5" />
        <stop offset="100%" stopColor="#B91C1C" />
      </linearGradient>
    </defs>
    <IdleBody animate={animate}>
      {/* rocket-shaped body */}
      <path d="M60 16c14 14 18 34 18 50a18 18 0 01-36 0c0-16 4-36 18-50z" fill={`url(#g-${uid})`} />
      <path d="M42 60l-12 20 16-6z" fill="#991B1B" />
      <path d="M78 60l12 20-16-6z" fill="#991B1B" />
      <circle cx="60" cy="56" r="18" fill="#FEE2E2" />
      <Eyes cx1={53} cx2={67} cy={56} r={5} animate={animate} blinkDelay={2.6} pupil="#7F1D1D" />
      <path d="M53 66q7 5 14 0" stroke="#7F1D1D" strokeWidth={2.6} strokeLinecap="round" fill="none" />
      {/* contrail */}
      <motion.g
        {...(animate
          ? { animate: { y: [0, 6, 0], opacity: [0.7, 0.2, 0.7] }, transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const } }
          : {})}
      >
        <path d="M50 96q10 8 20 0" stroke="#FCA5A5" strokeWidth={6} strokeLinecap="round" />
      </motion.g>
    </IdleBody>
  </>
)

const BYTE: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#67E8F9" />
        <stop offset="100%" stopColor="#0E7490" />
      </linearGradient>
    </defs>
    <IdleBody animate={animate}>
      {/* shield-shaped body */}
      <path d="M60 18l32 12v26c0 24-14 38-32 46-18-8-32-22-32-46V30z" fill={`url(#g-${uid})`} />
      <path d="M60 18l32 12v26c0 24-14 38-32 46" fill="#164E63" opacity={0.25} />
      {/* padlock emblem */}
      <g transform="translate(60 78)">
        <rect x="-10" y="-2" width="20" height="16" rx="4" fill="#ECFEFF" />
        <path d="M-6 -2v-6a6 6 0 0112 0v6" stroke="#ECFEFF" strokeWidth={3} fill="none" />
        <circle r="2.4" fill="#0E7490" />
      </g>
      <Eyes cx1={50} cx2={70} cy={52} animate={animate} blinkDelay={2.0} pupil="#083344" />
      <path d="M50 64q10 6 20 0" stroke="#083344" strokeWidth={2.8} strokeLinecap="round" fill="none" />
    </IdleBody>
  </>
)

const NOUR: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#BEF264" />
        <stop offset="100%" stopColor="#4D7C0F" />
      </linearGradient>
    </defs>
    <IdleBody animate={animate}>
      {/* piggy-bank shaped body */}
      <ellipse cx="58" cy="66" rx="36" ry="28" fill={`url(#g-${uid})`} />
      <ellipse cx="92" cy="58" rx="8" ry="7" fill={`url(#g-${uid})`} />
      <circle cx="94" cy="56" r="1.6" fill="#365314" />
      <path d="M34 46q-6-8 2-12" stroke="#365314" strokeWidth={4} strokeLinecap="round" fill="none" />
      {/* coin slot */}
      <rect x="50" y="38" width="16" height="5" rx="2.5" fill="#365314" />
      <ellipse cx="58" cy="30" rx="7" ry="7" fill="#FEF9C3" />
      <Eyes cx1={46} cx2={68} cy={64} animate={animate} blinkDelay={3.3} pupil="#365314" />
      <path d="M46 78q10 7 20 0" stroke="#365314" strokeWidth={3} strokeLinecap="round" fill="none" />
      <ellipse cx="30" cy="82" rx="4" ry="6" fill="#4D7C0F" />
      <ellipse cx="86" cy="82" rx="4" ry="6" fill="#4D7C0F" />
    </IdleBody>
  </>
)

const REX: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FCA5A5" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>
    </defs>
    <IdleBody animate={animate}>
      {/* spiky-eared determined creature */}
      <path d="M34 42l6-20 12 16z" fill={`url(#g-${uid})`} />
      <path d="M86 42l-6-20-12 16z" fill={`url(#g-${uid})`} />
      <circle cx="60" cy="64" r="34" fill={`url(#g-${uid})`} />
      {/* competitive spark */}
      <motion.path
        d="M60 20l4 10-10 4 10 4-4 10-4-10 10-4-10-4z"
        fill="#FDE047"
        {...(animate
          ? { animate: { rotate: [0, 15, -10, 0], scale: [1, 1.15, 1] }, transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' as const } }
          : {})}
        style={{ transformOrigin: '60px 28px' }}
      />
      {/* determined angled brows */}
      <path d="M40 54l14 4" stroke="#7F1D1D" strokeWidth={3} strokeLinecap="round" />
      <path d="M80 54l-14 4" stroke="#7F1D1D" strokeWidth={3} strokeLinecap="round" />
      <Eyes cx1={47} cx2={73} cy={64} animate={animate} blinkDelay={1.5} pupil="#7F1D1D" />
      <path d="M47 82q13 6 26 0" stroke="#7F1D1D" strokeWidth={3.2} strokeLinecap="round" fill="none" />
    </IdleBody>
  </>
)

const ZARA: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#C4B5FD" />
        <stop offset="100%" stopColor="#5B21B6" />
      </linearGradient>
    </defs>
    <IdleBody animate={animate}>
      {/* swirling storyteller cape */}
      <motion.path
        d="M60 44c-22 4-34 20-30 44 10-14 20-18 30-16 10-2 20 2 30 16 4-24-8-40-30-44z"
        fill={`url(#g-${uid})`}
        opacity={0.8}
        {...(animate
          ? { animate: { rotate: [0, 2, -2, 0] }, transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' as const } }
          : {})}
        style={{ transformOrigin: '60px 60px' }}
      />
      <circle cx="60" cy="46" r="24" fill={`url(#g-${uid})`} />
      {/* scroll motif at the base */}
      <rect x="42" y="94" width="36" height="10" rx="5" fill="#EDE9FE" />
      <circle cx="42" cy="99" r="5" fill="#DDD6FE" />
      <circle cx="78" cy="99" r="5" fill="#DDD6FE" />
      <circle cx="30" cy="36" r="2.4" fill="#F5D0FE" />
      <circle cx="92" cy="40" r="2" fill="#F5D0FE" />
      <Eyes cx1={51} cx2={69} cy={44} r={5.5} animate={animate} blinkDelay={2.5} pupil="#4C1D95" />
      <path d="M52 56q8 6 16 0" stroke="#4C1D95" strokeWidth={2.8} strokeLinecap="round" fill="none" />
    </IdleBody>
  </>
)

const ATLAS: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5EEAD4" />
        <stop offset="100%" stopColor="#115E59" />
      </linearGradient>
    </defs>
    <IdleBody animate={animate}>
      {/* globe-headed navigator */}
      <circle cx="60" cy="60" r="38" fill={`url(#g-${uid})`} />
      {/* map grid lines */}
      <g stroke="#134E4A" strokeWidth={1.4} opacity={0.4} fill="none">
        <ellipse cx="60" cy="60" rx="38" ry="16" />
        <ellipse cx="60" cy="60" rx="38" ry="30" />
        <path d="M60 22v76" />
        <path d="M28 42q32 12 64 0" />
        <path d="M28 78q32-12 64 0" />
      </g>
      {/* compass point accent */}
      <path d="M60 30 L64 58 L60 90 L56 58 Z" fill="#FBBF24" opacity={0.85} />
      <Eyes cx1={48} cx2={72} cy={58} animate={animate} blinkDelay={3.4} pupil="#134E4A" />
      <path d="M49 74q11 7 22 0" stroke="#134E4A" strokeWidth={3} strokeLinecap="round" fill="none" />
    </IdleBody>
  </>
)

const RENDERERS: Record<string, FaceRenderer> = {
  azouz: AZOUZ,
  zein: ZEIN,
  luma: LUMA,
  codey: CODEY,
  nova: NOVA,
  mira: MIRA,
  rami: RAMI,
  faris: FARIS,
  tala: TALA,
  adam: ADAM,
  byte: BYTE,
  nour: NOUR,
  rex: REX,
  zara: ZARA,
  atlas: ATLAS,
}

const DEFAULT: FaceRenderer = ({ uid, animate }) => (
  <>
    <defs>
      <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#CBD5E1" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>
    </defs>
    <IdleBody animate={animate}>
      <circle cx="60" cy="64" r="34" fill={`url(#g-${uid})`} />
      <Eyes cx1={48} cx2={72} cy={62} animate={animate} pupil="#334155" />
      <path d="M49 78q11 7 22 0" stroke="#334155" strokeWidth={3} strokeLinecap="round" fill="none" />
    </IdleBody>
  </>
)

let uidCounter = 0

export function CharacterFace({ characterId, size = 64, locked = false, animate = true, className = '' }: CharacterFaceProps) {
  const key = characterId.toLowerCase()
  const Renderer = RENDERERS[key] ?? DEFAULT
  // Stable-enough unique id per mount so gradient ids never collide across
  // many avatars rendered on the same page (gallery grid, etc).
  const uid = `${key}-${(uidCounter++).toString(36)}`

  const style: CSSProperties = locked
    ? { filter: 'grayscale(1) brightness(0.8) contrast(0.9)', opacity: 0.85 }
    : {}

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      style={style}
      role="img"
      aria-hidden="true"
    >
      {Renderer({ uid, animate: animate && !locked })}
    </svg>
  )
}
