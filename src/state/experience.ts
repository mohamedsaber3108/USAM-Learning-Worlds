import { createContext, createElement, useContext, useMemo, useState, type ReactNode } from "react";
import { adaptationFor, bandForAge, type AgeAdaptation } from "@/lib/age";
import { learner as mockLearner } from "@/data/mock";
import type { AgeBand, CharacterState, VoiceState } from "@/types/domain";

interface ExperienceValue {
  ageBand: AgeBand;
  setAgeBand: (band: AgeBand) => void;
  adaptation: AgeAdaptation;
  learnerName: string;
  /** Companion state — a future AI backend writes into exactly this shape. */
  azouz: CharacterState;
  setAzouz: (patch: Partial<CharacterState>) => void;
  voiceState: VoiceState;
  setVoiceState: (state: VoiceState) => void;
}

const ExperienceContext = createContext<ExperienceValue | null>(null);

const initialAzouz: CharacterState = {
  characterId: "ch-azouz",
  mood: "encouraging",
  voiceState: "idle",
  dialogueState: "greeting",
  currentMissionId: "m-1",
  currentObjectiveId: "o-en-1",
  utterance: null,
  recommendedActionId: "rec-1",
};

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [ageBand, setAgeBand] = useState<AgeBand>(bandForAge(mockLearner.profile.age));
  const [azouz, setAzouzState] = useState<CharacterState>(initialAzouz);

  const value = useMemo<ExperienceValue>(
    () => ({
      ageBand,
      setAgeBand,
      adaptation: adaptationFor(ageBand),
      learnerName: mockLearner.profile.displayName,
      azouz,
      setAzouz: (patch) => setAzouzState((prev) => ({ ...prev, ...patch })),
      voiceState: azouz.voiceState,
      setVoiceState: (voiceState) => setAzouzState((prev) => ({ ...prev, voiceState })),
    }),
    [ageBand, azouz],
  );

  return createElement(ExperienceContext.Provider, { value }, children);
}

export function useExperience(): ExperienceValue {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience must be used inside ExperienceProvider");
  return ctx;
}
