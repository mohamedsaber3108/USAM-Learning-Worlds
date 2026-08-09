/**
 * Phase 18: Visually Hidden Component
 *
 * Hide content visually but keep it accessible to screen readers
 */

import { type ReactNode } from "react";

interface VisuallyHiddenProps {
  children: ReactNode;
  /**
   * If true, element becomes visible when focused
   * Useful for skip links
   */
  focusable?: boolean;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function VisuallyHidden({
  children,
  focusable = false,
  as: Component = "span",
  className,
}: VisuallyHiddenProps) {
  return (
    <Component className={focusable ? `sr-only-focusable ${className || ""}` : `sr-only ${className || ""}`}>
      {children}
    </Component>
  );
}

/**
 * CSS (add to styles.css):
 *
 * .sr-only {
 *   position: absolute;
 *   width: 1px;
 *   height: 1px;
 *   padding: 0;
 *   margin: -1px;
 *   overflow: hidden;
 *   clip: rect(0, 0, 0, 0);
 *   white-space: nowrap;
 *   border-width: 0;
 * }
 *
 * .sr-only-focusable:focus,
 * .sr-only-focusable:active {
 *   position: static;
 *   width: auto;
 *   height: auto;
 *   padding: inherit;
 *   margin: inherit;
 *   overflow: visible;
 *   clip: auto;
 *   white-space: normal;
 * }
 */

/**
 * Usage examples:
 *
 * ```tsx
 * // Button with icon only
 * <button>
 *   <X />
 *   <VisuallyHidden>Close</VisuallyHidden>
 * </button>
 *
 * // Loading indicator
 * <div>
 *   <Spinner />
 *   <VisuallyHidden>Loading...</VisuallyHidden>
 * </div>
 *
 * // Skip link
 * <VisuallyHidden focusable as="a" href="#main">
 *   Skip to main content
 * </VisuallyHidden>
 * ```
 */
