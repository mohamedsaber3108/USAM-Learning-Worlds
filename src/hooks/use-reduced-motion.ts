/**
 * Phase 18: Reduced Motion Hook
 *
 * Detect user's reduced motion preference
 */

import { useState, useEffect } from "react";

/**
 * Check if user prefers reduced motion
 *
 * Usage:
 * ```tsx
 * function AnimatedComponent() {
 *   const prefersReducedMotion = usePrefersReducedMotion();
 *
 *   return (
 *     <motion.div
 *       animate={{ opacity: 1 }}
 *       transition={{
 *         duration: prefersReducedMotion ? 0 : 0.3,
 *       }}
 *     >
 *       Content
 *     </motion.div>
 *   );
 * }
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check initial value
    if (typeof window === "undefined") return false;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    return mediaQuery.matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Update state when preference changes
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }

    // Fallback for older browsers
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Get animation duration based on reduced motion preference
 *
 * Usage:
 * ```tsx
 * function Component() {
 *   const duration = useAnimationDuration(300);
 *
 *   return (
 *     <motion.div
 *       animate={{ opacity: 1 }}
 *       transition={{ duration: duration / 1000 }}
 *     >
 *       Content
 *     </motion.div>
 *   );
 * }
 * ```
 */
export function useAnimationDuration(defaultMs: number): number {
  const prefersReducedMotion = usePrefersReducedMotion();
  return prefersReducedMotion ? 0 : defaultMs;
}

/**
 * Get spring config based on reduced motion preference
 *
 * Usage:
 * ```tsx
 * function Component() {
 *   const spring = useSpringConfig({ stiffness: 300, damping: 30 });
 *
 *   return (
 *     <motion.div
 *       animate={{ scale: 1 }}
 *       transition={spring}
 *     >
 *       Content
 *     </motion.div>
 *   );
 * }
 * ```
 */
export function useSpringConfig(config: { stiffness: number; damping: number }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return {
      type: "tween" as const,
      duration: 0,
    };
  }

  return {
    type: "spring" as const,
    stiffness: config.stiffness,
    damping: config.damping,
  };
}
