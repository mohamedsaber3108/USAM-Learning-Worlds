import type { ReactNode } from "react";
import { CharacterPortrait } from "@/components/character/CharacterPortrait";
import { useAgePresentation } from "@/design/AgePresentationProvider";

/**
 * Character-aware world states.
 *
 * A child in a world should never meet "Something went wrong". Someone they
 * know tells them what happened, in the language of the place, and offers a
 * way forward.
 */
const AZOUZ = { id: "ch-azouz", name: "Azouz", accentColor: "var(--color-primary)" };

function Frame({
  expression,
  title,
  body,
  children,
  role,
}: {
  expression: "thinking" | "concerned" | "encouraging";
  title: string;
  body: string;
  children?: ReactNode;
  role?: "alert" | "status";
}) {
  const { p, fit } = useAgePresentation();
  return (
    <div
      {...(role ? { role } : {})}
      aria-live={role === "status" ? "polite" : undefined}
      className="surface-panel flex flex-col items-center gap-3 p-8 text-center sm:p-10"
    >
      <CharacterPortrait
        character={AZOUZ}
        expression={expression}
        size={p.mode === "explorer" ? 104 : 80}
      />
      <h3 className="font-display text-heading font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{fit(body)}</p>
      {children}
    </div>
  );
}

export function WorldLoading({ label = "Azouz is opening the bay" }: { label?: string }) {
  return (
    <Frame
      role="status"
      expression="thinking"
      title={label}
      body="Lights on, tide checked, characters finding their places."
    />
  );
}

export function WorldError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Frame
      role="alert"
      expression="concerned"
      title="The bay didn't load"
      body={message}
    >
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="interactive min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Try the gate again
        </button>
      )}
    </Frame>
  );
}

export function WorldEmpty({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <Frame expression="encouraging" title={title} body={body}>
      {children}
    </Frame>
  );
}
