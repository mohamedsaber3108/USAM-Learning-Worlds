/**
 * Character Relationship Tracker Component
 *
 * Display relationship level, trust, milestones, and shared memories
 */

"use client";

import type {
  CharacterRelationship,
  RelationshipMilestone,
  SharedMemory,
  SharedActivity,
} from "@/types";

interface RelationshipTrackerProps {
  relationship: CharacterRelationship;
}

export function RelationshipTracker({ relationship }: RelationshipTrackerProps) {
  const {
    characterName,
    level,
    trust,
    interactions,
    lastInteraction,
    milestones,
    memories,
    activities,
  } = relationship;

  const nextMilestone = milestones.find((m) => !m.unlockedAt);
  const completedMilestones = milestones.filter((m) => m.unlockedAt);
  const recentMemories = memories.slice(0, 5);
  const recentActivities = activities.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Relationship Header */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
            👤
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{characterName}</h2>
            <p className="text-muted-foreground">Your Learning Companion</p>
          </div>
        </div>

        {/* Level & Trust */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Relationship Level</span>
              <span className="text-primary font-semibold">Level {level}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${(level / 10) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Trust</span>
              <span className="text-primary font-semibold">{Math.round(trust * 100)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${trust * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{interactions}</div>
            <div className="text-sm text-muted-foreground">Interactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{memories.length}</div>
            <div className="text-sm text-muted-foreground">Shared Memories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{completedMilestones.length}</div>
            <div className="text-sm text-muted-foreground">Milestones</div>
          </div>
        </div>
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Next Milestone</h3>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
              🎯
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">{nextMilestone.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {nextMilestone.description}
              </p>
              <div className="text-xs text-muted-foreground">
                Unlocks at Level {nextMilestone.level}
              </div>
              {nextMilestone.rewards.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-medium mb-1">Rewards:</div>
                  <div className="flex flex-wrap gap-2">
                    {nextMilestone.rewards.map((reward, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                      >
                        {reward}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Completed Milestones */}
      {completedMilestones.length > 0 && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Completed Milestones</h3>
          <div className="space-y-3">
            {completedMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-start gap-3 p-3 bg-muted rounded-lg"
              >
                <div className="text-xl">✅</div>
                <div className="flex-1">
                  <h4 className="font-medium">{milestone.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {milestone.description}
                  </p>
                  {milestone.unlockedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Unlocked {new Date(milestone.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared Memories */}
      {recentMemories.length > 0 && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Shared Memories</h3>
          <div className="space-y-3">
            {recentMemories.map((memory) => (
              <div
                key={memory.id}
                className="flex items-start gap-3 p-3 bg-muted rounded-lg"
              >
                <div className="text-xl">
                  {memory.type === "mission" && "🎯"}
                  {memory.type === "achievement" && "🏆"}
                  {memory.type === "conversation" && "💬"}
                  {memory.type === "project" && "📦"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{memory.title}</h4>
                    {memory.importance === "high" && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                        Important
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{memory.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(memory.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {memories.length > 5 && (
            <button className="text-sm text-primary hover:underline mt-3">
              View all {memories.length} memories →
            </button>
          )}
        </div>
      )}

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Activities Together</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{activity.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="capitalize">{activity.type}</span>
                    <span>•</span>
                    <span>{new Date(activity.completedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  {activity.outcome === "success" && (
                    <span className="text-green-600">✓ Success</span>
                  )}
                  {activity.outcome === "learning" && (
                    <span className="text-blue-600">📚 Learning</span>
                  )}
                  {activity.outcome === "struggle" && (
                    <span className="text-yellow-600">⚡ Challenge</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {activities.length > 5 && (
            <button className="text-sm text-primary hover:underline mt-3">
              View all {activities.length} activities →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
