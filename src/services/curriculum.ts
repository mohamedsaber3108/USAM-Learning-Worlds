/**
 * Curriculum + world map service.
 *
 * Mock-backed today. Every function here is shaped like a call to a content
 * service: async, id-addressed, and returning plain data the UI does not
 * mutate. Swapping in a backend means replacing the bodies only.
 */
import {
  curriculumNodes,
  curriculumWorlds,
  worldLocations,
  worldRegions,
} from "@/data/curriculum";
import type {
  AdaptivePath,
  CurriculumNode,
  CurriculumWorld,
  WorldLocation,
  WorldMap,
  WorldProgress,
  WorldRegion,
} from "@/types/curriculum";
import type { ID } from "@/types/domain";

const respond = <T,>(value: T, ms = 220): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const worldMapService = {
  map: (): Promise<WorldMap> =>
    respond({ worlds: curriculumWorlds, regions: worldRegions, locations: worldLocations }),

  world: (worldId: ID): Promise<CurriculumWorld | null> =>
    respond(curriculumWorlds.find((w) => w.id === worldId) ?? null, 120),

  regions: (worldId: ID): Promise<WorldRegion[]> =>
    respond(worldRegions.filter((r) => r.worldId === worldId), 120),

  locations: (worldId: ID): Promise<WorldLocation[]> =>
    respond(worldLocations.filter((l) => l.worldId === worldId), 120),

  progress: (worldId: ID): Promise<WorldProgress> => {
    const nodes = curriculumNodes.filter((n) => n.worldId === worldId);
    return respond(
      {
        worldId,
        nodesTotal: nodes.length,
        nodesMastered: nodes.filter((n) => n.mastery.state === "mastered").length,
        nodesInProgress: nodes.filter((n) =>
          ["practicing", "developing", "proficient"].includes(n.mastery.state),
        ).length,
        needsReview: nodes.filter((n) => n.mastery.state === "needs-review").length,
      },
      120,
    );
  },
};

export const curriculumService = {
  nodes: (worldId?: ID): Promise<CurriculumNode[]> =>
    respond(worldId ? curriculumNodes.filter((n) => n.worldId === worldId) : curriculumNodes),

  node: (nodeId: ID): Promise<CurriculumNode | null> =>
    respond(curriculumNodes.find((n) => n.id === nodeId) ?? null, 120),

  /** The adaptive path is engine-owned; the UI only groups what it returns. */
  path: (): Promise<AdaptivePath> => {
    const by = (status: CurriculumNode["pathStatus"]) =>
      curriculumNodes.filter((n) => n.pathStatus === status).map((n) => n.id);
    return respond(
      {
        recommendedNextId: curriculumNodes.find((n) => n.pathStatus === "recommended-next")?.id ?? null,
        availableIds: by("available"),
        lockedIds: by("locked"),
        needsReviewIds: by("needs-review"),
        optionalChallengeIds: by("optional-challenge"),
        advancedChallengeIds: by("advanced-challenge"),
      },
      150,
    );
  },
};

export const curriculumKeys = {
  map: ["curriculum", "world-map"] as const,
  world: (id: ID) => ["curriculum", "world", id] as const,
  worldProgress: (id: ID) => ["curriculum", "world", id, "progress"] as const,
  nodes: (worldId?: ID) => ["curriculum", "nodes", worldId ?? "all"] as const,
  node: (id: ID) => ["curriculum", "node", id] as const,
  path: ["curriculum", "adaptive-path"] as const,
};
