/**
 * Phase 19: Responsive Hooks
 *
 * Utilities for responsive design
 */

import { useState, useEffect } from "react";

/* -------------------------------- Breakpoints -------------------------------- */

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
export type Device = "mobile" | "tablet" | "desktop";

/* -------------------------------- Device Detection --------------------------- */

/**
 * Get current device type
 *
 * Usage:
 * ```tsx
 * const device = useResponsive();
 *
 * return (
 *   <div>
 *     {device === 'mobile' && <MobileView />}
 *     {device === 'tablet' && <TabletView />}
 *     {device === 'desktop' && <DesktopView />}
 *   </div>
 * );
 * ```
 */
export function useResponsive(): Device {
  const [device, setDevice] = useState<Device>(() => getDeviceType());

  useEffect(() => {
    const updateDevice = () => {
      setDevice(getDeviceType());
    };

    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  return device;
}

function getDeviceType(): Device {
  const width = window.innerWidth;
  if (width < BREAKPOINTS.md) return "mobile";
  if (width < BREAKPOINTS.lg) return "tablet";
  return "desktop";
}

/* -------------------------------- Breakpoint Detection ----------------------- */

/**
 * Check if current viewport matches breakpoint
 *
 * Usage:
 * ```tsx
 * const isMobile = useBreakpoint('md', 'down');
 * const isDesktop = useBreakpoint('lg', 'up');
 *
 * return isMobile ? <MobileNav /> : <DesktopNav />;
 * ```
 */
export function useBreakpoint(breakpoint: Breakpoint, direction: "up" | "down" = "up"): boolean {
  const [matches, setMatches] = useState(() => matchBreakpoint(breakpoint, direction));

  useEffect(() => {
    const updateMatch = () => {
      setMatches(matchBreakpoint(breakpoint, direction));
    };

    window.addEventListener("resize", updateMatch);
    return () => window.removeEventListener("resize", updateMatch);
  }, [breakpoint, direction]);

  return matches;
}

function matchBreakpoint(breakpoint: Breakpoint, direction: "up" | "down"): boolean {
  const width = window.innerWidth;
  const breakpointValue = BREAKPOINTS[breakpoint];

  return direction === "up" ? width >= breakpointValue : width < breakpointValue;
}

/* -------------------------------- Media Query -------------------------------- */

/**
 * Custom media query hook
 *
 * Usage:
 * ```tsx
 * const isPortrait = useMediaQuery('(orientation: portrait)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 * const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)');
 *
 * return isTouch ? <TouchUI /> : <MouseUI />;
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }

    // Fallback for older browsers
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, [query]);

  return matches;
}

/* -------------------------------- Window Size -------------------------------- */

/**
 * Get current window dimensions
 *
 * Usage:
 * ```tsx
 * const { width, height } = useWindowSize();
 *
 * return (
 *   <div style={{ width: width * 0.8, height: height * 0.6 }}>
 *     Responsive container
 *   </div>
 * );
 * ```
 */
export function useWindowSize() {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}

/* -------------------------------- Orientation -------------------------------- */

/**
 * Detect device orientation
 *
 * Usage:
 * ```tsx
 * const orientation = useOrientation();
 *
 * return orientation === 'portrait' ? (
 *   <PortraitLayout />
 * ) : (
 *   <LandscapeLayout />
 * );
 * ```
 */
export function useOrientation(): "portrait" | "landscape" {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(() =>
    window.innerHeight > window.innerWidth ? "portrait" : "landscape"
  );

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? "portrait" : "landscape");
    };

    window.addEventListener("resize", updateOrientation);
    return () => window.removeEventListener("resize", updateOrientation);
  }, []);

  return orientation;
}

/* -------------------------------- Touch Device ------------------------------- */

/**
 * Detect if device supports touch
 *
 * Usage:
 * ```tsx
 * const isTouch = useTouchDevice();
 *
 * return (
 *   <Button size={isTouch ? 'large' : 'default'}>
 *     Click me
 *   </Button>
 * );
 * ```
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  });

  return isTouch;
}

/**
 * Utilities for responsive components
 */
export const responsive = {
  /**
   * Check if current device is mobile
   */
  isMobile: () => getDeviceType() === "mobile",

  /**
   * Check if current device is tablet
   */
  isTablet: () => getDeviceType() === "tablet",

  /**
   * Check if current device is desktop
   */
  isDesktop: () => getDeviceType() === "desktop",

  /**
   * Get current breakpoint
   */
  getCurrentBreakpoint: (): Breakpoint => {
    const width = window.innerWidth;
    if (width >= BREAKPOINTS["2xl"]) return "2xl";
    if (width >= BREAKPOINTS.xl) return "xl";
    if (width >= BREAKPOINTS.lg) return "lg";
    if (width >= BREAKPOINTS.md) return "md";
    if (width >= BREAKPOINTS.sm) return "sm";
    return "xs";
  },
};

/**
 * Example: Responsive component
 *
 * ```tsx
 * function ResponsiveGrid() {
 *   const device = useResponsive();
 *
 *   const columns = {
 *     mobile: 1,
 *     tablet: 2,
 *     desktop: 3,
 *   }[device];
 *
 *   return (
 *     <div className={`grid grid-cols-${columns} gap-4`}>
 *       {items.map(item => <Card key={item.id} {...item} />)}
 *     </div>
 *   );
 * }
 * ```
 *
 * Example: Conditional rendering
 *
 * ```tsx
 * function Navigation() {
 *   const isMobile = useBreakpoint('md', 'down');
 *
 *   return isMobile ? <MobileNav /> : <DesktopNav />;
 * }
 * ```
 */
