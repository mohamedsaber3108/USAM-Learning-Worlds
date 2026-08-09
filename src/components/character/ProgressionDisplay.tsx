/**
 * Character Progression Display Component
 *
 * Show character level, abilities, unlocks, and evolution
 */

"use client";

import type {
  CharacterProgression,
  CharacterAbility,
  CharacterUnlock,
  CharacterEvolution,
} from "@/types";

interface ProgressionDisplayProps {
  progression: CharacterProgression;
}

export function ProgressionDisplay({ progression }: ProgressionDisplayProps) {
  const { level, experience, nextLevelAt, abilities, unlocks, evolution } = progression;

  const experiencePercent = (experience / nextLevelAt) * 100;
  const unlockedAbilities = abilities.filter((a) => a.unlocked);
  const lockedAbilities = abilities.filter((a) => !a.unlocked);
  const unlockedItems = unlocks.filter((u) => u.unlocked);
  const nextEvolution = evolution.find((e) => e.level > level);

  return (
    <div className="space-y-6">
      {/* Level & Experience */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">Level {level}</h2>
            <p className="text-muted-foreground">Character Progression</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{experience}</div>
            <div className="text-sm text-muted-foreground">/ {nextLevelAt} XP</div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="relative">
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${experiencePercent}%` }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            {Math.round(experiencePercent)}% to next level
          </div>
        </div>

        {/* Next Evolution Preview */}
        {nextEvolution && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">Next evolution at Level {nextEvolution.level}:</span>
              <span className="font-medium text-primary">{nextEvolution.title}</span>
            </div>
          </div>
        )}
      </div>

      {/* Unlocked Abilities */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Abilities ({unlockedAbilities.length} unlocked)</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {unlockedAbilities.map((ability) => (
            <AbilityCard key={ability.id} ability={ability} unlocked />
          ))}
        </div>

        {/* Locked Abilities */}
        {lockedAbilities.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Locked Abilities
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              {lockedAbilities.slice(0, 4).map((ability) => (
                <AbilityCard key={ability.id} ability={ability} unlocked={false} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unlocks */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Unlocked Items ({unlockedItems.length})</h3>

        {unlockedItems.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-3">
            {unlockedItems.map((unlock) => (
              <UnlockCard key={unlock.id} unlock={unlock} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Keep leveling up to unlock new items!
          </p>
        )}
      </div>

      {/* Evolution Timeline */}
      {evolution.length > 0 && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Evolution Journey</h3>
          <div className="space-y-4">
            {evolution.map((evo, index) => {
              const isUnlocked = level >= evo.level;
              const isCurrent = level >= evo.level && (index === evolution.length - 1 || level < evolution[index + 1].level);

              return (
                <div
                  key={evo.level}
                  className={`flex items-start gap-4 p-4 rounded-lg ${
                    isUnlocked ? "bg-primary/10 border border-primary/20" : "bg-muted opacity-50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                    isCurrent ? "bg-primary text-primary-foreground" : isUnlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {evo.level}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{evo.title}</h4>
                      {isCurrent && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                      {isUnlocked && !isCurrent && (
                        <span className="text-xs text-primary">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{evo.description}</p>
                    {evo.visualChange && isUnlocked && (
                      <p className="text-xs text-primary">✨ {evo.visualChange}</p>
                    )}
                    {evo.newAbilities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {evo.newAbilities.map((abilityId) => {
                          const ability = abilities.find((a) => a.id === abilityId);
                          return ability ? (
                            <span
                              key={abilityId}
                              className="text-xs bg-primary/20 text-primary px-2 py-1 rounded"
                            >
                              +{ability.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Ability Card Component
function AbilityCard({
  ability,
  unlocked,
}: {
  ability: CharacterAbility;
  unlocked: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        unlocked
          ? "bg-primary/5 border-primary/20"
          : "bg-muted border-muted opacity-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">
          {ability.type === "hint" && "💡"}
          {ability.type === "feedback" && "📝"}
          {ability.type === "encouragement" && "🎉"}
          {ability.type === "teaching" && "📚"}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{ability.name}</h4>
            {!unlocked && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                Level {ability.level}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{ability.description}</p>
          {unlocked && ability.usageCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Used {ability.usageCount} times
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Unlock Card Component
function UnlockCard({ unlock }: { unlock: CharacterUnlock }) {
  return (
    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="text-2xl">
          {unlock.type === "expression" && "😊"}
          {unlock.type === "outfit" && "👕"}
          {unlock.type === "ability" && "⚡"}
          {unlock.type === "dialogue" && "💬"}
          {unlock.type === "story" && "📖"}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{unlock.name}</h4>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded capitalize">
              {unlock.type}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">{unlock.description}</p>
          {unlock.unlockedAt && (
            <p className="text-xs text-muted-foreground">
              Unlocked {new Date(unlock.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
