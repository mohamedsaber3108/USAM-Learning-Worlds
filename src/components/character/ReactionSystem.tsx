/**
 * Character Reaction System Component
 *
 * Display character reactions to learner actions
 */

"use client";

import { useState, useEffect } from "react";
import type { CharacterReaction, Reaction, ReactionTrigger } from "@/types";

interface ReactionSystemProps {
  characterId: string;
  characterName: string;
}

export function ReactionSystem({ characterId, characterName }: ReactionSystemProps) {
  const [currentReaction, setCurrentReaction] = useState<Reaction | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Mock function to show a reaction
  const showReaction = (reaction: Reaction) => {
    setCurrentReaction(reaction);
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => setCurrentReaction(null), 500);
    }, reaction.duration);
  };

  // Mock reactions for demo
  const demoReactions: Reaction[] = [
    {
      expression: "happy",
      message: "Great job! You're doing amazing!",
      gesture: "thumbs-up",
      duration: 3000,
    },
    {
      expression: "excited",
      message: "Wow! That's a fantastic answer!",
      gesture: "clap",
      duration: 3000,
    },
    {
      expression: "curious",
      message: "That's an interesting approach. Tell me more!",
      gesture: "think",
      duration: 3000,
    },
    {
      expression: "proud",
      message: "I'm so proud of your progress!",
      gesture: "wave",
      duration: 3000,
    },
  ];

  if (!currentReaction) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-500 ${
        isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-card border rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          {/* Character Avatar with Expression */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
              {getExpressionEmoji(currentReaction.expression)}
            </div>
            {/* Gesture Animation */}
            {currentReaction.gesture && (
              <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                {getGestureEmoji(currentReaction.gesture)}
              </div>
            )}
          </div>

          {/* Message */}
          <div className="flex-1">
            <div className="font-medium text-sm mb-1">{characterName}</div>
            <p className="text-sm">{currentReaction.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get expression emoji
function getExpressionEmoji(expression: string): string {
  const expressions: Record<string, string> = {
    happy: "😊",
    excited: "🤩",
    curious: "🤔",
    proud: "😌",
    thoughtful: "💭",
    encouraging: "💪",
    celebrating: "🎉",
  };
  return expressions[expression] || "😊";
}

// Helper function to get gesture emoji
function getGestureEmoji(gesture: string): string {
  const gestures: Record<string, string> = {
    wave: "👋",
    "thumbs-up": "👍",
    clap: "👏",
    think: "💭",
    encourage: "💪",
  };
  return gestures[gesture] || "👍";
}

// Reaction Trigger Component (for testing/demo)
export function ReactionTriggerDemo() {
  const [reactionQueue, setReactionQueue] = useState<Reaction[]>([]);
  const [currentReaction, setCurrentReaction] = useState<Reaction | null>(null);

  const triggerReaction = (trigger: ReactionTrigger["type"]) => {
    const reactions: Record<ReactionTrigger["type"], Reaction> = {
      achievement: {
        expression: "excited",
        message: "🎉 Amazing achievement! You earned a badge!",
        gesture: "clap",
        duration: 3000,
      },
      mistake: {
        expression: "encouraging",
        message: "That's okay! Mistakes help us learn. Want to try again?",
        gesture: "encourage",
        duration: 3000,
      },
      question: {
        expression: "curious",
        message: "Great question! Let me help you figure this out.",
        gesture: "think",
        duration: 3000,
      },
      progress: {
        expression: "proud",
        message: "You're making excellent progress! Keep it up!",
        gesture: "thumbs-up",
        duration: 3000,
      },
      struggle: {
        expression: "thoughtful",
        message: "I see you're working hard. Would you like a hint?",
        gesture: "think",
        duration: 3000,
      },
      breakthrough: {
        expression: "celebrating",
        message: "YES! You figured it out! That's the breakthrough moment!",
        gesture: "clap",
        duration: 3000,
      },
    };

    const reaction = reactions[trigger];
    setReactionQueue((prev) => [...prev, reaction]);
  };

  useEffect(() => {
    if (!currentReaction && reactionQueue.length > 0) {
      const [next, ...rest] = reactionQueue;
      setCurrentReaction(next);
      setReactionQueue(rest);

      setTimeout(() => {
        setCurrentReaction(null);
      }, next.duration);
    }
  }, [currentReaction, reactionQueue]);

  return (
    <div className="space-y-4">
      {/* Demo Controls */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Test Character Reactions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => triggerReaction("achievement")}
            className="px-4 py-3 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors"
          >
            🏆 Achievement
          </button>
          <button
            onClick={() => triggerReaction("mistake")}
            className="px-4 py-3 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors"
          >
            ❌ Mistake
          </button>
          <button
            onClick={() => triggerReaction("question")}
            className="px-4 py-3 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors"
          >
            ❓ Question
          </button>
          <button
            onClick={() => triggerReaction("progress")}
            className="px-4 py-3 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors"
          >
            📈 Progress
          </button>
          <button
            onClick={() => triggerReaction("struggle")}
            className="px-4 py-3 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors"
          >
            😓 Struggle
          </button>
          <button
            onClick={() => triggerReaction("breakthrough")}
            className="px-4 py-3 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors"
          >
            💡 Breakthrough
          </button>
        </div>
      </div>

      {/* Active Reaction Display */}
      {currentReaction && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card border rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
                  {getExpressionEmoji(currentReaction.expression)}
                </div>
                {currentReaction.gesture && (
                  <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                    {getGestureEmoji(currentReaction.gesture)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm mb-1">Azouz</div>
                <p className="text-sm">{currentReaction.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
