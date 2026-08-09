/**
 * Phase 18: Keyboard Navigation Hooks
 *
 * Utilities for keyboard accessibility
 */

import { useEffect, useCallback, type RefObject } from "react";

/* -------------------------------- Keyboard Shortcut -------------------------- */

/**
 * Register a global keyboard shortcut
 *
 * Usage:
 * ```tsx
 * useKeyboardShortcut('/', () => openSearch());
 * useKeyboardShortcut('Escape', () => closeModal());
 * ```
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    disabled?: boolean;
  }
) {
  useEffect(() => {
    if (options?.disabled) return;

    const handler = (event: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Check modifiers
      if (options?.ctrl && !event.ctrlKey) return;
      if (options?.shift && !event.shiftKey) return;
      if (options?.alt && !event.altKey) return;
      if (options?.meta && !event.metaKey) return;

      // Check key
      if (event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, options]);
}

/* -------------------------------- Arrow Navigation --------------------------- */

/**
 * Enable arrow key navigation within a list
 *
 * Usage:
 * ```tsx
 * const listRef = useArrowNavigation({
 *   onSelect: (index) => handleSelect(items[index]),
 *   itemCount: items.length,
 * });
 *
 * <ul ref={listRef}>
 *   {items.map((item, i) => (
 *     <li key={i} tabIndex={0}>{item}</li>
 *   ))}
 * </ul>
 * ```
 */
export function useArrowNavigation<T extends HTMLElement = HTMLElement>(options: {
  onSelect?: (index: number) => void;
  itemCount: number;
  orientation?: "vertical" | "horizontal";
  loop?: boolean;
}) {
  const { onSelect, itemCount, orientation = "vertical", loop = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      const items = Array.from(target.parentElement?.children || []).filter(
        (el) => el instanceof HTMLElement && el.tabIndex >= 0
      ) as HTMLElement[];

      const currentIndex = items.indexOf(target);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      if (orientation === "vertical") {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          nextIndex = currentIndex + 1;
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          nextIndex = currentIndex - 1;
        }
      } else {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          nextIndex = currentIndex + 1;
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          nextIndex = currentIndex - 1;
        }
      }

      if (event.key === "Home") {
        event.preventDefault();
        nextIndex = 0;
      } else if (event.key === "End") {
        event.preventDefault();
        nextIndex = itemCount - 1;
      }

      // Handle looping
      if (loop) {
        if (nextIndex < 0) nextIndex = itemCount - 1;
        if (nextIndex >= itemCount) nextIndex = 0;
      } else {
        nextIndex = Math.max(0, Math.min(itemCount - 1, nextIndex));
      }

      // Focus next item
      if (nextIndex !== currentIndex && items[nextIndex]) {
        items[nextIndex].focus();
      }

      // Handle selection with Enter/Space
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect?.(currentIndex);
      }
    },
    [itemCount, orientation, loop, onSelect]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null; // No ref needed, uses event delegation
}

/* -------------------------------- Focus Within ------------------------------- */

/**
 * Detect if focus is within element
 *
 * Usage:
 * ```tsx
 * const { ref, hasFocus } = useFocusWithin<HTMLDivElement>();
 *
 * <div ref={ref} className={hasFocus ? 'focused' : ''}>
 *   <input />
 *   <button>Submit</button>
 * </div>
 * ```
 */
export function useFocusWithin<T extends HTMLElement = HTMLElement>() {
  const [hasFocus, setHasFocus] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleFocusIn = () => setHasFocus(true);
    const handleFocusOut = (event: FocusEvent) => {
      // Check if focus moved outside the element
      if (!element.contains(event.relatedTarget as Node)) {
        setHasFocus(false);
      }
    };

    element.addEventListener("focusin", handleFocusIn);
    element.addEventListener("focusout", handleFocusOut);

    return () => {
      element.removeEventListener("focusin", handleFocusIn);
      element.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return { ref, hasFocus };
}

/* -------------------------------- Escape Key --------------------------------- */

/**
 * Handle Escape key press
 *
 * Usage:
 * ```tsx
 * useEscapeKey(() => closeModal(), { disabled: !isOpen });
 * ```
 */
export function useEscapeKey(callback: () => void, options?: { disabled?: boolean }) {
  useEffect(() => {
    if (options?.disabled) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [callback, options]);
}

/* -------------------------------- Tab Trap ----------------------------------- */

/**
 * Trap Tab key within element (for modals)
 *
 * Usage:
 * ```tsx
 * const modalRef = useTabTrap(isOpen);
 *
 * <div ref={modalRef} role="dialog">
 *   {/* Modal content *\/}
 * </div>
 * ```
 */
export function useTabTrap<T extends HTMLElement = HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    element.addEventListener("keydown", handleKeyDown);
    return () => element.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);

  return ref;
}

import { useState, useRef } from "react";

/**
 * Example: Keyboard shortcuts help
 *
 * ```tsx
 * function KeyboardShortcutsHelp() {
 *   const [isOpen, setIsOpen] = useState(false);
 *
 *   useKeyboardShortcut('?', () => setIsOpen(true));
 *   useEscapeKey(() => setIsOpen(false), { disabled: !isOpen });
 *
 *   if (!isOpen) return null;
 *
 *   return (
 *     <div role="dialog" aria-label="Keyboard shortcuts">
 *       <h2>Keyboard Shortcuts</h2>
 *       <dl>
 *         <dt><kbd>/</kbd></dt>
 *         <dd>Search</dd>
 *         <dt><kbd>h</kbd></dt>
 *         <dd>Go to Home</dd>
 *         <dt><kbd>?</kbd></dt>
 *         <dd>Show this help</dd>
 *       </dl>
 *       <button onClick={() => setIsOpen(false)}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */
