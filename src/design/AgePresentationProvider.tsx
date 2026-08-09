import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AGE_MODE_ORDER,
  presentationFor,
  resolveCopy,
  type AgeModeId,
  type AgePresentation,
  type CopyVariants,
} from "@/design/age-presentation";
import { useExperience } from "@/state/experience";
import type { AgeBand } from "@/types/domain";

export type LocaleId = "en" | "ar";
export type Direction = "ltr" | "rtl";

export const LOCALES: { id: LocaleId; label: string; dir: Direction }[] = [
  { id: "en", label: "English", dir: "ltr" },
  { id: "ar", label: "العربية", dir: "rtl" },
];

interface AgePresentationValue {
  band: AgeBand;
  setBand: (band: AgeBand) => void;
  bands: AgeBand[];
  p: AgePresentation;
  mode: AgeModeId;
  locale: LocaleId;
  setLocale: (locale: LocaleId) => void;
  dir: Direction;
  reducedMotion: boolean;
  /** Pick the copy variant that suits the active mode. */
  copy: (variants: CopyVariants) => string;
  /** Trim any string to the mode's copy budget without cutting mid-word. */
  fit: (text: string) => string;
  /** Resolve a value per mode without branching on the age band in a component. */
  pick: <T>(byMode: Record<AgeModeId, T>) => T;
  /** Duration in ms after applying the mode's motion multiplier. */
  duration: (ms: number) => number;
}

const AgePresentationContext = createContext<AgePresentationValue | null>(null);

/**
 * The single place age adaptation is decided.
 *
 * Wraps `ExperienceProvider` state and exposes a presentation contract plus
 * localization direction. Also mirrors both onto the document so CSS-level
 * tokens (`body[data-age-band]`, `[dir]`) stay in sync with React state.
 */
export function AgePresentationProvider({ children }: { children: ReactNode }) {
  const { ageBand, setAgeBand } = useExperience();
  const [locale, setLocale] = useState<LocaleId>("en");
  const [reducedMotion, setReducedMotion] = useState(false);

  const dir: Direction = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", locale);
  }, [dir, locale]);

  useEffect(() => {
    document.body.setAttribute("data-age-band", ageBand);
    document.body.setAttribute("data-age-mode", presentationFor(ageBand).mode);
  }, [ageBand]);

  const value = useMemo<AgePresentationValue>(() => {
    const p = presentationFor(ageBand);
    return {
      band: ageBand,
      setBand: setAgeBand,
      bands: AGE_MODE_ORDER,
      p,
      mode: p.mode,
      locale,
      setLocale,
      dir,
      reducedMotion,
      copy: (variants) => resolveCopy(variants, p.mode),
      fit: (text) => {
        if (text.length <= p.copyBudget) return text;
        const cut = text.slice(0, p.copyBudget);
        return `${cut.slice(0, cut.lastIndexOf(" ")).trimEnd()}…`;
      },
      pick: (byMode) => byMode[p.mode],
      duration: (ms) => (reducedMotion ? 0 : Math.round(ms * p.motionMultiplier)),
    };
  }, [ageBand, setAgeBand, locale, dir, reducedMotion]);

  return (
    <AgePresentationContext.Provider value={value}>{children}</AgePresentationContext.Provider>
  );
}

export function useAgePresentation(): AgePresentationValue {
  const ctx = useContext(AgePresentationContext);
  if (!ctx) {
    throw new Error("useAgePresentation must be used inside AgePresentationProvider");
  }
  return ctx;
}

/** Render children only in the listed modes. Keeps age logic declarative. */
export function AgeOnly({ modes, children }: { modes: AgeModeId[]; children: ReactNode }) {
  const { mode } = useAgePresentation();
  return modes.includes(mode) ? <>{children}</> : null;
}

/** Age-aware copy: declare every variant, the provider chooses. */
export function AgeCopy({
  variants,
  className,
}: {
  variants: CopyVariants;
  className?: string;
}) {
  const { copy, p } = useAgePresentation();
  return <p className={className ?? p.bodyClass}>{copy(variants)}</p>;
}
