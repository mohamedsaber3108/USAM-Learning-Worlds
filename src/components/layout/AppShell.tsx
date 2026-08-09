import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Bell, Compass, Menu, MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AGE_BANDS } from "@/lib/age";
import { useExperience } from "@/state/experience";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { AzouzPortrait } from "@/components/character/AzouzPanel";
import { CommandPalette } from "@/components/shell/CommandPalette";
import {
  PRIMARY_NAV,
  SECONDARY_NAV,
  type NavItem as NavConfig,
} from "@/components/layout/nav-items";

/**
 * World shell.
 *
 * Navigation is a map of places, and its *presentation* is age-adaptive while
 * its structure is not: Explorer sees fewer, larger destinations with hints,
 * Pathfinder sees all of them, compact. Nobody sees an LMS sidebar.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { ageBand, setAgeBand, adaptation, learnerName } = useExperience();
  const { p } = useAgePresentation();

  const primary = PRIMARY_NAV.slice(0, p.maxPrimaryNavItems);
  const overflow = [...PRIMARY_NAV.slice(p.maxPrimaryNavItems), ...SECONDARY_NAV];
  const bottomBar = PRIMARY_NAV.slice(0, p.mode === "explorer" ? 4 : 5);
  const showHints = p.navComplexity === "essential";

  return (
    <div className="aurora-bg min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <div className="mx-auto flex w-full max-w-[1500px] gap-0 lg:gap-6 lg:px-6">
        {/* Desktop rail — places in the world */}
        <aside
          className={cn(
            "sticky top-0 hidden h-dvh shrink-0 flex-col gap-2 py-6 lg:flex",
            p.mode === "pathfinder" ? "lg:w-60" : "lg:w-72",
          )}
        >
          <Brand />
          <nav aria-label="Places" className="mt-4 flex-1 space-y-1.5 overflow-y-auto pr-1">
            {primary.map((item) => (
              <NavItem
                key={item.to}
                {...item}
                size={p.mode === "explorer" ? "large" : p.mode === "creator" ? "medium" : "compact"}
                showHint={showHints}
                active={isActive(pathname, item.to)}
              />
            ))}

            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <MoreHorizontal className="size-[18px] shrink-0" aria-hidden />
              More places
            </button>
            {moreOpen &&
              overflow.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  size="compact"
                  showHint={false}
                  active={isActive(pathname, item.to)}
                />
              ))}
          </nav>
          <AgeSwitcher band={ageBand} onChange={setAgeBand} />
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="grid size-11 place-items-center rounded-xl bg-surface"
            >
              <Menu className="size-5" />
            </button>
            <Brand compact />
            <Link
              to="/profile"
              aria-label="Notifications and profile"
              className="ml-auto grid size-11 place-items-center rounded-xl bg-surface"
            >
              <Bell className="size-5" />
            </Link>
          </header>

          {open && (
            <div className="border-b border-border bg-surface p-3 lg:hidden">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid size-11 place-items-center rounded-xl"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav aria-label="All places" className="grid grid-cols-2 gap-1">
                {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => (
                  <NavItem
                    key={item.to}
                    {...item}
                    size="compact"
                    showHint={false}
                    active={isActive(pathname, item.to)}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </nav>
              <div className="mt-3">
                <AgeSwitcher band={ageBand} onChange={setAgeBand} />
              </div>
            </div>
          )}

          <main id="main" className="px-4 py-6 sm:px-6 lg:px-0 lg:py-8">
            <p className="sr-only">Experience adapted for {adaptation.label} learners</p>
            {children}
          </main>

          <footer className="border-t border-border px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-0">
            USAM for Kids · {learnerName}'s learning world · Adaptive experience:{" "}
            {adaptation.summary}
          </footer>
        </div>
      </div>

      {/* Mobile world bar */}
      <nav
        aria-label="Primary places"
        className={cn(
          "sticky bottom-0 z-40 grid border-t border-border bg-background/95 backdrop-blur lg:hidden",
          bottomBar.length === 4 ? "grid-cols-4" : "grid-cols-5",
        )}
      >
        {bottomBar.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center gap-1",
              p.mode === "explorer" ? "min-h-16 text-xs" : "min-h-14 text-[11px]",
              isActive(pathname, item.to) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className={p.mode === "explorer" ? "size-6" : "size-5"} aria-hidden />
            {item.label}
          </Link>
        ))}
      </nav>

      <CommandPalette />
    </div>
  );
}

function isActive(pathname: string, to: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-3 px-2">
      <AzouzPortrait size={compact ? 36 : 44} animate={false} />
      <span className="min-w-0">
        <span className="block truncate font-display text-lg font-bold leading-tight">
          USAM <span className="text-gradient-warm">for Kids</span>
        </span>
        {!compact && (
          <span className="block text-[11px] text-muted-foreground">Your learning world</span>
        )}
      </span>
    </Link>
  );
}

function NavItem({
  to,
  label,
  hint,
  icon: Icon,
  active,
  size,
  showHint,
  onClick,
}: NavConfig & {
  active: boolean;
  size: "large" | "medium" | "compact";
  showHint: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl font-medium transition-colors",
        size === "large" && "min-h-16 px-3 py-2 text-base",
        size === "medium" && "min-h-12 px-3 py-2 text-sm",
        size === "compact" && "min-h-11 px-3 py-2 text-sm",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-surface hover:text-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-xl",
          size === "large" ? "size-11 bg-surface-raised" : "size-[18px]",
        )}
        aria-hidden
      >
        <Icon className={size === "large" ? "size-6" : "size-[18px]"} />
      </span>
      <span className="min-w-0">
        <span className="block truncate">{label}</span>
        {showHint && hint && (
          <span className="block truncate text-xs font-normal text-muted-foreground">{hint}</span>
        )}
      </span>
    </Link>
  );
}

function AgeSwitcher({
  band,
  onChange,
}: {
  band: string;
  onChange: (b: (typeof AGE_BANDS)[number]) => void;
}) {
  return (
    <div className="surface-panel p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Compass className="size-3.5" aria-hidden /> Experience layer
      </p>
      <div role="group" aria-label="Age experience layer" className="grid grid-cols-3 gap-1">
        {AGE_BANDS.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => onChange(b)}
            aria-pressed={band === b}
            className={cn(
              "min-h-11 rounded-lg px-1 text-xs font-semibold transition-colors",
              band === b
                ? "bg-primary text-primary-foreground"
                : "bg-surface-raised text-muted-foreground hover:text-foreground",
            )}
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  );
}
