import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgePresentation } from "@/design/AgePresentationProvider";

/**
 * Iconography.
 *
 * Lucide at a fixed set of sizes and stroke weights so icons never drift.
 * `directional` icons mirror automatically in RTL locales.
 */

export const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export type IconSize = keyof typeof ICON_SIZES;

export function Icon({
  as: Component,
  size = "md",
  directional = false,
  label,
  className,
}: {
  as: LucideIcon;
  size?: IconSize;
  /** Arrows, chevrons and progress icons must mirror in RTL. */
  directional?: boolean;
  /** Provide when the icon carries meaning on its own. */
  label?: string;
  className?: string;
}) {
  const { p } = useAgePresentation();
  const stroke = p.mode === "explorer" ? 2.4 : p.mode === "creator" ? 2 : 1.75;
  return (
    <Component
      size={ICON_SIZES[size]}
      strokeWidth={stroke}
      className={cn(directional && "rtl-flip", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}
