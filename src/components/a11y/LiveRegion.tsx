/**
 * Phase 18: Live Region Component
 *
 * ARIA live regions for screen reader announcements
 */

import { useEffect, useRef, type ReactNode } from "react";

interface LiveRegionProps {
  children: ReactNode;
  /**
   * Politeness level:
   * - "polite": Announces when screen reader is idle
   * - "assertive": Interrupts screen reader
   */
  politeness?: "polite" | "assertive";
  /**
   * If true, entire region is announced when it changes
   * If false, only additions are announced
   */
  atomic?: boolean;
  /**
   * If true, region is visible
   * If false, visually hidden but still announced
   */
  visible?: boolean;
  className?: string;
}

export function LiveRegion({
  children,
  politeness = "polite",
  atomic = true,
  visible = false,
  className,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className={visible ? className : `sr-only ${className || ""}`}
    >
      {children}
    </div>
  );
}

/**
 * Hook for announcing messages
 *
 * Usage:
 * ```tsx
 * function Component() {
 *   const announce = useAnnounce();
 *
 *   const handleSuccess = () => {
 *     announce("Mission completed!", "polite");
 *   };
 *
 *   return <button onClick={handleSuccess}>Complete</button>;
 * }
 * ```
 */
export function useAnnounce() {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create live region if it doesn't exist
    if (!regionRef.current) {
      const div = document.createElement("div");
      div.setAttribute("role", "status");
      div.setAttribute("aria-live", "polite");
      div.setAttribute("aria-atomic", "true");
      div.className = "sr-only";
      document.body.appendChild(div);
      regionRef.current = div;
    }

    return () => {
      if (regionRef.current && document.body.contains(regionRef.current)) {
        document.body.removeChild(regionRef.current);
        regionRef.current = null;
      }
    };
  }, []);

  const announce = (message: string, politeness: "polite" | "assertive" = "polite") => {
    if (!regionRef.current) return;

    // Update politeness level
    regionRef.current.setAttribute("aria-live", politeness);

    // Clear and set new message
    regionRef.current.textContent = "";
    setTimeout(() => {
      if (regionRef.current) {
        regionRef.current.textContent = message;
      }
    }, 100);
  };

  return announce;
}

/**
 * Announcement Queue Component
 *
 * Manages multiple announcements without overlapping
 */
export function AnnouncementQueue({
  announcements,
  politeness = "polite",
}: {
  announcements: string[];
  politeness?: "polite" | "assertive";
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (currentIndex >= announcements.length) {
      setCurrentMessage("");
      return;
    }

    const message = announcements[currentIndex];
    setCurrentMessage(message);

    // Move to next announcement after delay
    const timeout = setTimeout(() => {
      setCurrentIndex((i) => i + 1);
    }, 2000); // Adjust timing as needed

    return () => clearTimeout(timeout);
  }, [currentIndex, announcements]);

  if (!currentMessage) return null;

  return (
    <LiveRegion politeness={politeness} atomic>
      {currentMessage}
    </LiveRegion>
  );
}

import { useState } from "react";
