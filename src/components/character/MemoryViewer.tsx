/**
 * Character Memory Viewer Component
 *
 * Display what the character remembers about the learner
 */

"use client";

import { useState } from "react";
import type {
  CharacterMemory,
  MemoryCategory,
  MemoryEntry,
  LearningMemory,
} from "@/types";

interface MemoryViewerProps {
  memory: CharacterMemory;
}

export function MemoryViewer({ memory }: MemoryViewerProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [view, setView] = useState<"categories" | "recent" | "important" | "learning">(
    "categories"
  );

  const { categories, recentInteractions, importantMoments, learningJourney } = memory;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-2xl font-bold mb-2">Character Memory</h2>
        <p className="text-muted-foreground">
          See what your character remembers about you and your learning journey
        </p>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setView("categories")}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            view === "categories"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          📂 Categories
        </button>
        <button
          onClick={() => setView("recent")}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            view === "recent"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          ⏱️ Recent ({recentInteractions.length})
        </button>
        <button
          onClick={() => setView("important")}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            view === "important"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          ⭐ Important ({importantMoments.length})
        </button>
        <button
          onClick={() => setView("learning")}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            view === "learning"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          📚 Learning Journey ({learningJourney.length})
        </button>
      </div>

      {/* Categories View */}
      {view === "categories" && (
        <div className="grid md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className="bg-card rounded-lg border p-6 text-left hover:border-primary transition-colors"
            >
              <div className="text-3xl mb-3">{category.icon}</div>
              <h3 className="font-semibold mb-2">{category.name}</h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{category.count} memories</span>
                <span>•</span>
                <span>{new Date(category.lastUpdated).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Recent Interactions View */}
      {view === "recent" && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Recent Interactions</h3>
          <div className="space-y-4">
            {recentInteractions.length > 0 ? (
              recentInteractions.map((entry) => (
                <MemoryEntryCard key={entry.id} entry={entry} />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No recent interactions yet. Start learning to create memories!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Important Moments View */}
      {view === "important" && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Important Moments</h3>
          <div className="space-y-4">
            {importantMoments.length > 0 ? (
              importantMoments.map((entry) => (
                <MemoryEntryCard key={entry.id} entry={entry} highlight />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Important moments will appear here as you learn together
              </p>
            )}
          </div>
        </div>
      )}

      {/* Learning Journey View */}
      {view === "learning" && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Learning Journey</h3>
          <div className="space-y-4">
            {learningJourney.length > 0 ? (
              learningJourney.map((learning) => (
                <LearningMemoryCard key={learning.skillId} learning={learning} />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Your learning journey will be tracked here
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Memory Entry Card Component
function MemoryEntryCard({
  entry,
  highlight = false,
}: {
  entry: MemoryEntry;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-lg ${
        highlight ? "bg-primary/10 border border-primary/20" : "bg-muted"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">
          {entry.relatedTo.type === "skill" && "🎯"}
          {entry.relatedTo.type === "mission" && "🚀"}
          {entry.relatedTo.type === "project" && "📦"}
          {entry.relatedTo.type === "conversation" && "💬"}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{entry.title}</h4>
            {entry.emotion && (
              <span className="text-lg" title={entry.emotion}>
                {entry.emotion === "happy" && "😊"}
                {entry.emotion === "excited" && "🤩"}
                {entry.emotion === "curious" && "🤔"}
                {entry.emotion === "proud" && "😌"}
                {entry.emotion === "thoughtful" && "💭"}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{entry.content}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="capitalize">{entry.category}</span>
            <span>•</span>
            <span>{new Date(entry.date).toLocaleDateString()}</span>
            {entry.importance > 0.7 && (
              <>
                <span>•</span>
                <span className="text-primary">⭐ Important</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Learning Memory Card Component
function LearningMemoryCard({ learning }: { learning: LearningMemory }) {
  const latestProgress = learning.masteryProgress[learning.masteryProgress.length - 1];
  const progressSteps = learning.masteryProgress.length;

  return (
    <div className="p-4 bg-muted rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium mb-1">{learning.skillName}</h4>
          <p className="text-xs text-muted-foreground">
            Started {new Date(learning.firstIntroduction).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium capitalize">{latestProgress.state}</div>
          <div className="text-xs text-muted-foreground">{progressSteps} checkpoints</div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="flex items-center gap-2 mb-3">
        {learning.masteryProgress.map((progress, i) => (
          <div
            key={i}
            className="flex-1 h-2 rounded-full"
            style={{
              backgroundColor:
                progress.state === "mastered"
                  ? "hsl(var(--primary))"
                  : progress.state === "proficient"
                  ? "hsl(142 76% 36%)"
                  : progress.state === "practiced"
                  ? "hsl(47 96% 53%)"
                  : "hsl(var(--muted))",
            }}
            title={`${progress.state} - ${new Date(progress.date).toLocaleDateString()}`}
          />
        ))}
      </div>

      {/* Character Comments */}
      {learning.characterComments.length > 0 && (
        <div className="space-y-1">
          {learning.characterComments.slice(0, 2).map((comment, i) => (
            <p key={i} className="text-sm text-muted-foreground italic">
              "{comment}"
            </p>
          ))}
          {learning.characterComments.length > 2 && (
            <button className="text-xs text-primary hover:underline">
              +{learning.characterComments.length - 2} more comments
            </button>
          )}
        </div>
      )}
    </div>
  );
}
