import { motion, useReducedMotion, type Transition, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * PageTransition — shared page-level entrance/exit motion for route changes.
 *
 * Design:
 *  - Fade + small upward slide (opacity + y only — transform/opacity are the
 *    only GPU-cheap properties we touch, no layout-triggering props like
 *    width/height/top).
 *  - Spring physics (not a duration/easing curve) so it feels alive rather
 *    than a canned CSS transition.
 *  - Respects `prefers-reduced-motion`: when the OS/browser signals it, we
 *    collapse to an instant, motion-free fade (still opacity-only, near-zero
 *    duration) instead of disabling the transition wrapper entirely — this
 *    avoids any layout jump while eliminating actual motion.
 */

const SPRING: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.9,
}

const REDUCED_MOTION_TRANSITION: Transition = {
  duration: 0.01,
}

const variants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const reducedVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={shouldReduceMotion ? reducedVariants : variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={shouldReduceMotion ? REDUCED_MOTION_TRANSITION : SPRING}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
}
