/**
 * Character Creation Wizard Component
 *
 * 7-step wizard for creating and customizing a learning companion
 */

"use client";

import { useState } from "react";
import type {
  CharacterCreationWizard as WizardState,
  CharacterCreationStep,
  CharacterInProgress,
  CharacterTrait,
  CharacterBaseOption,
} from "@/types";

interface CharacterCreationWizardProps {
  onComplete: (character: CharacterInProgress) => void;
  onCancel?: () => void;
}

const STEPS: CharacterCreationStep[] = [
  "welcome",
  "choose-base",
  "customize-appearance",
  "choose-name",
  "select-traits",
  "set-voice",
  "complete",
];

// Mock base character options
const BASE_OPTIONS: CharacterBaseOption[] = [
  {
    id: "base-001",
    name: "Azouz",
    description: "Curious and encouraging companion",
    personality: "Friendly, patient, loves learning",
    defaultAppearance: {
      skinTone: "medium",
      hairStyle: "short",
      hairColor: "brown",
      eyeColor: "brown",
      outfit: "casual",
      accessories: [],
    },
    preview: "🧑",
    ageBands: ["8-9", "10-11", "12-14"],
  },
  {
    id: "base-002",
    name: "Luna",
    description: "Creative and adventurous friend",
    personality: "Energetic, imaginative, fun",
    defaultAppearance: {
      skinTone: "light",
      hairStyle: "long",
      hairColor: "blonde",
      eyeColor: "blue",
      outfit: "creative",
      accessories: ["glasses"],
    },
    preview: "👧",
    ageBands: ["8-9", "10-11", "12-14"],
  },
  {
    id: "base-003",
    name: "Max",
    description: "Logical and problem-solving buddy",
    personality: "Analytical, helpful, curious",
    defaultAppearance: {
      skinTone: "dark",
      hairStyle: "curly",
      hairColor: "black",
      eyeColor: "brown",
      outfit: "smart",
      accessories: [],
    },
    preview: "👦",
    ageBands: ["8-9", "10-11", "12-14"],
  },
];

// Mock traits
const TRAIT_OPTIONS: CharacterTrait[] = [
  {
    id: "trait-001",
    name: "Patient",
    description: "Takes time to explain things carefully",
    category: "personality",
    icon: "⏱️",
  },
  {
    id: "trait-002",
    name: "Encouraging",
    description: "Always cheers you on",
    category: "personality",
    icon: "📣",
  },
  {
    id: "trait-003",
    name: "Creative",
    description: "Thinks of fun, new ways to learn",
    category: "personality",
    icon: "🎨",
  },
  {
    id: "trait-004",
    name: "Loves Science",
    description: "Excited about experiments and discoveries",
    category: "interest",
    icon: "🔬",
  },
  {
    id: "trait-005",
    name: "Loves Reading",
    description: "Enjoys stories and books",
    category: "interest",
    icon: "📚",
  },
  {
    id: "trait-006",
    name: "Loves Coding",
    description: "Passionate about programming",
    category: "interest",
    icon: "💻",
  },
];

export function CharacterCreationWizard({
  onComplete,
  onCancel,
}: CharacterCreationWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [character, setCharacter] = useState<CharacterInProgress>({
    appearance: {},
    traits: [],
    voiceSettings: {
      speed: 1.0,
      pitch: 1.0,
      voice: "default",
    },
  });

  const currentStep = STEPS[currentStepIndex];
  const progress = (currentStepIndex + 1) / STEPS.length;

  const goNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete(character);
    }
  };

  const goBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const selectBase = (base: CharacterBaseOption) => {
    setCharacter({
      ...character,
      baseCharacter: base.id,
      appearance: base.defaultAppearance,
      name: base.name,
    });
    goNext();
  };

  const updateAppearance = (key: keyof CharacterInProgress["appearance"], value: string) => {
    setCharacter({
      ...character,
      appearance: {
        ...character.appearance,
        [key]: value,
      },
    });
  };

  const toggleTrait = (trait: CharacterTrait) => {
    const exists = character.traits.find((t) => t.id === trait.id);
    if (exists) {
      setCharacter({
        ...character,
        traits: character.traits.filter((t) => t.id !== trait.id),
      });
    } else {
      if (character.traits.length < 3) {
        setCharacter({
          ...character,
          traits: [...character.traits, trait],
        });
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {currentStepIndex + 1} of {STEPS.length}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card rounded-lg border p-8">
        {currentStep === "welcome" && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4">Create Your Learning Companion!</h2>
            <p className="text-muted-foreground mb-8">
              Let's create a special character who will learn with you, encourage you,
              and celebrate your successes!
            </p>
            <button
              onClick={goNext}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
              Let's Start!
            </button>
          </div>
        )}

        {currentStep === "choose-base" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Choose Your Character</h2>
            <p className="text-muted-foreground mb-6">
              Pick a character to start with. You can customize them next!
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {BASE_OPTIONS.map((base) => (
                <button
                  key={base.id}
                  onClick={() => selectBase(base)}
                  className="p-6 border-2 rounded-lg hover:border-primary hover:bg-muted transition-all text-left"
                >
                  <div className="text-5xl mb-3 text-center">{base.preview}</div>
                  <h3 className="font-semibold mb-2">{base.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{base.description}</p>
                  <p className="text-xs text-muted-foreground">{base.personality}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === "customize-appearance" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Customize Appearance</h2>
            <p className="text-muted-foreground mb-6">
              Make your character unique!
            </p>

            <div className="space-y-6">
              {/* Hair Style */}
              <div>
                <label className="block font-medium mb-2">Hair Style</label>
                <div className="grid grid-cols-4 gap-2">
                  {["short", "long", "curly", "spiky"].map((style) => (
                    <button
                      key={style}
                      onClick={() => updateAppearance("hairStyle", style)}
                      className={`p-3 border rounded-lg capitalize ${
                        character.appearance.hairStyle === style
                          ? "border-primary bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <label className="block font-medium mb-2">Hair Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {["black", "brown", "blonde", "red"].map((color) => (
                    <button
                      key={color}
                      onClick={() => updateAppearance("hairColor", color)}
                      className={`p-3 border rounded-lg capitalize ${
                        character.appearance.hairColor === color
                          ? "border-primary bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outfit */}
              <div>
                <label className="block font-medium mb-2">Outfit</label>
                <div className="grid grid-cols-3 gap-2">
                  {["casual", "smart", "creative"].map((outfit) => (
                    <button
                      key={outfit}
                      onClick={() => updateAppearance("outfit", outfit)}
                      className={`p-3 border rounded-lg capitalize ${
                        character.appearance.outfit === outfit
                          ? "border-primary bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                    >
                      {outfit}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={goBack}
                className="px-6 py-3 border rounded-lg hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={goNext}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentStep === "choose-name" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">What's Their Name?</h2>
            <p className="text-muted-foreground mb-6">
              Keep the default name or choose something new!
            </p>
            <input
              type="text"
              value={character.name || ""}
              onChange={(e) => setCharacter({ ...character, name: e.target.value })}
              className="w-full p-3 border rounded-lg mb-8"
              placeholder="Enter a name..."
            />
            <div className="flex gap-3">
              <button
                onClick={goBack}
                className="px-6 py-3 border rounded-lg hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={goNext}
                disabled={!character.name}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentStep === "select-traits" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Choose Personality Traits</h2>
            <p className="text-muted-foreground mb-6">
              Select up to 3 traits that describe your character
            </p>
            <div className="grid md:grid-cols-2 gap-3 mb-8">
              {TRAIT_OPTIONS.map((trait) => {
                const isSelected = character.traits.find((t) => t.id === trait.id);
                return (
                  <button
                    key={trait.id}
                    onClick={() => toggleTrait(trait)}
                    disabled={!isSelected && character.traits.length >= 3}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "hover:bg-muted"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{trait.icon}</span>
                      <div>
                        <h4 className="font-medium">{trait.name}</h4>
                        <p className="text-sm text-muted-foreground">{trait.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button
                onClick={goBack}
                className="px-6 py-3 border rounded-lg hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={goNext}
                disabled={character.traits.length === 0}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentStep === "set-voice" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Voice Settings</h2>
            <p className="text-muted-foreground mb-6">
              Adjust how your character sounds
            </p>

            <div className="space-y-6">
              <div>
                <label className="block font-medium mb-2">
                  Speed: {character.voiceSettings.speed.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={character.voiceSettings.speed}
                  onChange={(e) =>
                    setCharacter({
                      ...character,
                      voiceSettings: {
                        ...character.voiceSettings,
                        speed: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Pitch: {character.voiceSettings.pitch.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={character.voiceSettings.pitch}
                  onChange={(e) =>
                    setCharacter({
                      ...character,
                      voiceSettings: {
                        ...character.voiceSettings,
                        pitch: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={goBack}
                className="px-6 py-3 border rounded-lg hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={goNext}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentStep === "complete" && (
          <div className="text-center">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-3xl font-bold mb-4">All Done!</h2>
            <p className="text-muted-foreground mb-8">
              {character.name} is ready to learn with you!
            </p>
            <div className="bg-muted rounded-lg p-6 mb-8">
              <div className="text-4xl mb-3">
                {BASE_OPTIONS.find((b) => b.id === character.baseCharacter)?.preview}
              </div>
              <h3 className="font-semibold text-lg mb-2">{character.name}</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {character.traits.map((trait) => (
                  <span
                    key={trait.id}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {trait.icon} {trait.name}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => onComplete(character)}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
              Start Learning Together!
            </button>
          </div>
        )}
      </div>

      {/* Cancel Button */}
      {onCancel && currentStep !== "complete" && (
        <button
          onClick={onCancel}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
