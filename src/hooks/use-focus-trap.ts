/**
 * Phase 18: Focus Trap Hook
 *
 * Traps focus within an element (for modals, dialogs, etc.)
 */

import { useEffect, useRef } from "react";

/**
 * Trap focus within element
 *
 * Usage:
 * ```tsx
 * function Modal({ isOpen, children }) {
 *   const modalRef = useFocusTrap(isOpen);
 *
 *   if (!isOpen) return null;
 *
 *   return (
 *     <div ref={modalRef} role="dialog" aria-modal="true">
 *       {children}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const element = ref.current;
    if (!element) return;

    // Save currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const getFocusableElements = () => {
      return element.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), details:not([disabled]), summary:not(:disabled)'
      );
    };

    // Focus first element
    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    if (firstElement) {
      firstElement.focus();
    }

    // Handle Tab key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) return;

      if (event.shiftKey) {
        // Shift + Tab: go to last element if on first
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: go to first element if on last
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      element.removeEventListener("keydown", handleKeyDown);

      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    };
  }, [enabled]);

  return ref;
}

/**
 * Alternative: Focus trap with more options
 */
export function useFocusTrapWithOptions<T extends HTMLElement = HTMLElement>(options: {
  enabled: boolean;
  initialFocus?: "first" | "last" | HTMLElement | null;
  returnFocus?: boolean;
  preventScroll?: boolean;
}) {
  const { enabled, initialFocus = "first", returnFocus = true, preventScroll = false } = options;

  const ref = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const element = ref.current;
    if (!element) return;

    // Save currently focused element
    if (returnFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    // Get focusable elements
    const getFocusableElements = () => {
      return Array.from(
        element.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        )
      );
    };

    // Focus initial element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      let elementToFocus: HTMLElement | null = null;

      if (initialFocus === "first") {
        elementToFocus = focusableElements[0];
      } else if (initialFocus === "last") {
        elementToFocus = focusableElements[focusableElements.length - 1];
      } else if (initialFocus instanceof HTMLElement) {
        elementToFocus = initialFocus;
      }

      if (elementToFocus) {
        elementToFocus.focus({ preventScroll });
      }
    }

    // Handle Tab key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus({ preventScroll });
        }
      } else {
        // Tab
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus({ preventScroll });
        }
      }
    };

    element.addEventListener("keydown", handleKeyDown);

    return () => {
      element.removeEventListener("keydown", handleKeyDown);

      // Restore focus
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus({ preventScroll });
        previousActiveElement.current = null;
      }
    };
  }, [enabled, initialFocus, returnFocus, preventScroll]);

  return ref;
}
