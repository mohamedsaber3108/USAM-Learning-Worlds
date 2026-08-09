/**
 * Phase 19: Progressive Image Component
 *
 * Loads low-quality placeholder first, then high-quality image
 */

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * High-quality image source
   */
  src: string;
  /**
   * Low-quality placeholder (optional)
   * If not provided, shows skeleton
   */
  placeholder?: string;
  /**
   * Alt text (required for accessibility)
   */
  alt: string;
  /**
   * Aspect ratio (e.g., "16/9", "1/1")
   */
  aspectRatio?: string;
  /**
   * Show skeleton while loading
   */
  showSkeleton?: boolean;
}

export function ProgressiveImage({
  src,
  placeholder,
  alt,
  aspectRatio,
  showSkeleton = true,
  className,
  ...props
}: ProgressiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(placeholder || "");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      setIsError(false);
    };

    img.onerror = () => {
      setIsError(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (isError) {
    return (
      <div
        className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        Failed to load image
      </div>
    );
  }

  if (!isLoaded && showSkeleton && !placeholder) {
    return <Skeleton className={className} style={aspectRatio ? { aspectRatio } : undefined} />;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={cn(
        "transition-opacity duration-300",
        isLoaded ? "opacity-100" : "opacity-50 blur-sm",
        className
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
      {...props}
    />
  );
}

/**
 * Lazy progressive image - only loads when in viewport
 */
export function LazyProgressiveImage(props: ProgressiveImageProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {shouldLoad ? (
        <ProgressiveImage {...props} />
      ) : (
        <Skeleton className={props.className} style={props.aspectRatio ? { aspectRatio: props.aspectRatio } : undefined} />
      )}
    </div>
  );
}

import { useRef } from "react";

/**
 * Example usage:
 *
 * ```tsx
 * // Basic progressive image
 * <ProgressiveImage
 *   src="/images/mission.webp"
 *   placeholder="/images/mission-thumb.webp"
 *   alt="Mission background"
 *   aspectRatio="16/9"
 * />
 *
 * // Lazy progressive image
 * <LazyProgressiveImage
 *   src="/images/world.webp"
 *   alt="World map"
 *   aspectRatio="16/9"
 * />
 * ```
 */
