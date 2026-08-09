/**
 * Phase 19: Lazy Loading Hooks
 *
 * Utilities for lazy loading assets and components
 */

import { useState, useEffect, useRef, useCallback } from "react";

/* -------------------------------- Intersection Observer ---------------------- */

/**
 * Detect when element enters viewport
 *
 * Usage:
 * ```tsx
 * function LazyComponent() {
 *   const { ref, isVisible } = useLazyLoad();
 *
 *   return (
 *     <div ref={ref}>
 *       {isVisible ? <HeavyComponent /> : <Skeleton />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(options?: {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}) {
  const { threshold = 0, rootMargin = "200px", triggerOnce = true } = options || {};

  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

/* -------------------------------- Lazy Image --------------------------------- */

/**
 * Lazy load image when it enters viewport
 *
 * Usage:
 * ```tsx
 * function ImageCard({ src, alt }) {
 *   const { ref, src: imageSrc } = useLazyImage(src, placeholderSrc);
 *
 *   return <img ref={ref} src={imageSrc} alt={alt} />;
 * }
 * ```
 */
export function useLazyImage(
  src: string,
  placeholder?: string
): {
  ref: React.RefObject<HTMLImageElement>;
  src: string;
  isLoaded: boolean;
} {
  const [currentSrc, setCurrentSrc] = useState(placeholder || src);
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref, isVisible } = useLazyLoad<HTMLImageElement>({
    rootMargin: "200px",
  });

  useEffect(() => {
    if (!isVisible || isLoaded) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
    };
  }, [isVisible, src, isLoaded]);

  return { ref, src: currentSrc, isLoaded };
}

/* -------------------------------- Preload ------------------------------------ */

/**
 * Preload resource on hover or view
 *
 * Usage:
 * ```tsx
 * function Link({ to }) {
 *   const preloadRef = usePreload(
 *     () => import('@/routes/missions'),
 *     { trigger: 'hover' }
 *   );
 *
 *   return <a ref={preloadRef} href={to}>Missions</a>;
 * }
 * ```
 */
export function usePreload<T extends HTMLElement = HTMLElement>(
  importFn: () => Promise<any>,
  options?: {
    trigger?: "hover" | "view";
    delay?: number;
  }
) {
  const { trigger = "hover", delay = 0 } = options || {};
  const ref = useRef<T>(null);
  const hasPreloaded = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const preload = useCallback(() => {
    if (hasPreloaded.current) return;

    hasPreloaded.current = true;
    importFn();
  }, [importFn]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (trigger === "hover") {
      const handleMouseEnter = () => {
        if (delay > 0) {
          timeoutRef.current = window.setTimeout(preload, delay);
        } else {
          preload();
        }
      };

      const handleMouseLeave = () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };

      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }

    if (trigger === "view") {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            if (delay > 0) {
              timeoutRef.current = window.setTimeout(preload, delay);
            } else {
              preload();
            }
            observer.disconnect();
          }
        },
        { rootMargin: "100px" }
      );

      observer.observe(element);

      return () => {
        observer.disconnect();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [trigger, delay, preload]);

  return ref;
}

/* -------------------------------- Progressive Loading ------------------------ */

/**
 * Load items progressively in batches
 *
 * Usage:
 * ```tsx
 * function MissionList({ missions }) {
 *   const visibleItems = useProgressiveLoad(missions, { batchSize: 5, delay: 100 });
 *
 *   return (
 *     <div>
 *       {visibleItems.map(mission => (
 *         <MissionCard key={mission.id} mission={mission} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useProgressiveLoad<T>(
  items: T[],
  options?: {
    batchSize?: number;
    delay?: number;
  }
): T[] {
  const { batchSize = 10, delay = 100 } = options || {};
  const [visibleCount, setVisibleCount] = useState(batchSize);

  useEffect(() => {
    if (visibleCount >= items.length) return;

    const timeout = setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
    }, delay);

    return () => clearTimeout(timeout);
  }, [visibleCount, items.length, batchSize, delay]);

  return items.slice(0, visibleCount);
}

/* -------------------------------- Idle Loading ------------------------------- */

/**
 * Load during idle time (requestIdleCallback)
 *
 * Usage:
 * ```tsx
 * function Component() {
 *   const [heavyData, setHeavyData] = useState(null);
 *
 *   useIdleLoad(() => {
 *     // Load heavy data during idle time
 *     const data = processHeavyData();
 *     setHeavyData(data);
 *   });
 *
 *   return heavyData ? <HeavyView data={heavyData} /> : <Skeleton />;
 * }
 * ```
 */
export function useIdleLoad(callback: () => void, deps: React.DependencyList = []) {
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(callback, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeout = setTimeout(callback, 1);
      return () => clearTimeout(timeout);
    }
  }, deps);
}

/**
 * Example: Lazy load world assets
 *
 * ```tsx
 * function WorldPage({ worldId }) {
 *   const { ref, isVisible } = useLazyLoad({ rootMargin: '400px' });
 *   const [assets, setAssets] = useState(null);
 *
 *   useEffect(() => {
 *     if (isVisible) {
 *       loadWorldAssets(worldId).then(setAssets);
 *     }
 *   }, [isVisible, worldId]);
 *
 *   return (
 *     <div ref={ref}>
 *       {assets ? (
 *         <WorldCanvas assets={assets} />
 *       ) : (
 *         <WorldSkeleton />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * Example: Progressive mission loading
 *
 * ```tsx
 * function MissionList({ missions }) {
 *   const visibleMissions = useProgressiveLoad(missions, {
 *     batchSize: 5,
 *     delay: 100,
 *   });
 *
 *   return (
 *     <div>
 *       {visibleMissions.map(mission => (
 *         <MissionCard key={mission.id} mission={mission} />
 *       ))}
 *       {visibleMissions.length < missions.length && (
 *         <LoadingIndicator />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
