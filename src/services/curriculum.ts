/**
 * Curriculum + world map service.
 *
 * Wired to the real backend (`backend/src/modules/learning/learning.controller.ts`,
 * mounted at `/api/learning`). That controller exposes Concepts and
 * LearningPaths — there is no "World"/"WorldLocation"/"WorldRegion" model in
 * the Prisma schema (see `backend/prisma/schema.prisma`), so the world-map
 * geometry (x/y coordinates, glyphs, region groupings) that
 * `src/data/curriculum.ts` fabricates has no backend source yet. Rather than
 * silently keep serving fake map geometry, `worldMapService.map/world/regions/
 * locations` now surface that gap explicitly (empty regions/locations,
 * worlds derived from real Domains) instead of returning invented shapes.
 *
 * `curriculumService.nodes/node/path` map real `Concept` + `LearningPath`
 * rows (backend UPPERCASE enums, e.g. `AgeBand.AGE_8_9`) onto the frontend's
 * lowercase `CurriculumNode`/`AdaptivePath` contracts (CONF-003/CONF-004 in
 * docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md).
 */
import { fetchAPI } from "@/services/api";
import type {
  AdaptivePath,
  CurriculumNode,
  CurriculumWorld,
  MasteryState,
  WorldLocation,
  WorldMap,
  WorldProgress,
  WorldRegion,
} from "@/types/curriculum";
import type { AgeBand, ID } from "@/types/domain";

/* --------------------------- backend response shapes --------------------- */

interface BackendDomain {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  order: number;
}

interface BackendConcept {
  id: string;
  competencyId: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
  competency?: { id: string; name: string; skillId: string };
}

interface BackendLearningPath {
  id: string;
  domainId: string;
  name: string;
  slug: string;
  description?: string | null;
  ageBand?: BackendAgeBand | null;
  order: number;
}

type BackendAgeBand = "AGE_8_9" | "AGE_10_11" | "AGE_12_14";

/* ------------------------------- mappers ---------------------------------- */

function ageBandFromBackend(band?: BackendAgeBand | null): AgeBand {
  switch (band) {
    case "AGE_8_9":
      return "8-9";
    case "AGE_10_11":
      return "10-11";
    case "AGE_12_14":
      return "12-14";
    default:
      return "10-11";
  }
}

/** Domains are the closest real analogue to "worlds" — no map geometry exists server-side yet. */
function domainToWorld(domain: BackendDomain, index: number): CurriculumWorld {
  return {
    id: domain.id,
    name: domain.name,
    domainId: domain.id,
    tagline: domain.description ?? domain.name,
    description: domain.description ?? "",
    glyph: domain.icon ?? "sparkles",
    accentColor: domain.color ?? "#6366f1",
    guideCharacterId: "",
    // No backend geometry yet — deterministic placeholder layout, not fabricated per-node data.
    x: 20 + (index % 4) * 20,
    y: 20 + Math.floor(index / 4) * 25,
    unlocked: true,
    unlockHint: null,
    regionIds: [],
    neighbourWorldIds: [],
  };
}

/**
 * There is no Prisma `mastery` payload embedded on `Concept` responses from
 * `GET /learning/concepts` today (that lives on `MasteryRecord`, keyed by
 * learner+competency, and requires a separate authenticated call per
 * competency). Rather than invent a mastery value, nodes render as
 * "introduced"/"available" until that join is added backend-side.
 */
function conceptToNode(concept: BackendConcept): CurriculumNode {
  return {
    id: concept.id,
    name: concept.name,
    summary: concept.description ?? "",
    domainId: concept.competency?.skillId ?? "",
    worldId: concept.competency?.skillId ?? "",
    locationId: concept.competencyId,
    ageRange: { min: 8, max: 14 },
    tier: concept.order,
    prerequisiteIds: [],
    relatedIds: [],
    objectives: [],
    activities: [],
    practice: [],
    projects: [],
    assessment: { id: `${concept.id}-assessment`, title: "", kind: "formative", evidence: "" },
    masteryThreshold: { confidence: 0.7, demonstrations: 2, transferRequired: false },
    reviewSchedule: { intervalsDays: [1, 3, 7], nextReviewAt: null, lastReviewedAt: null },
    mastery: {
      state: "introduced" as MasteryState,
      confidence: 0,
      evidenceCount: 0,
      lastDemonstratedAt: null,
      note: "",
      recentEvidence: [],
      practiceCount: 0,
    },
    pathStatus: "available",
    ageVariants: [],
  };
}

const respondError = (context: string) => (err: unknown) => {
  // eslint-disable-next-line no-console
  console.error(`[curriculum service] ${context}`, err);
  throw err;
};

export const worldMapService = {
  map: async (): Promise<WorldMap> => {
    // Domains live at the app-level `/domains` route (backend/src/app.controller.ts),
    // not under `/learning` — there's no dedicated "world" endpoint.
    const domains = await fetchAPI<BackendDomain[]>("/domains").catch(() => [] as BackendDomain[]);
    const worlds = domains.map(domainToWorld);
    return { worlds, regions: [], locations: [] };
  },

  world: async (worldId: ID): Promise<CurriculumWorld | null> => {
    const { worlds } = await worldMapService.map();
    return worlds.find((w) => w.id === worldId) ?? null;
  },

  regions: async (_worldId: ID): Promise<WorldRegion[]> => {
    // No WorldRegion model in the backend schema yet.
    return [];
  },

  locations: async (_worldId: ID): Promise<WorldLocation[]> => {
    // No WorldLocation model in the backend schema yet.
    return [];
  },

  progress: async (worldId: ID): Promise<WorldProgress> => {
    const nodes = await curriculumService.nodes(worldId);
    return {
      worldId,
      nodesTotal: nodes.length,
      nodesMastered: nodes.filter((n) => n.mastery.state === "mastered").length,
      nodesInProgress: nodes.filter((n) =>
        ["practicing", "developing", "proficient"].includes(n.mastery.state),
      ).length,
      needsReview: nodes.filter((n) => n.mastery.state === "needs-review").length,
    };
  },
};

export const curriculumService = {
  nodes: async (worldId?: ID): Promise<CurriculumNode[]> => {
    const concepts = await fetchAPI<BackendConcept[]>(
      worldId ? `/learning/skills/${worldId}/concepts` : "/learning/concepts",
    ).catch(respondError("nodes"));
    return (concepts ?? []).map(conceptToNode);
  },

  node: async (nodeId: ID): Promise<CurriculumNode | null> => {
    const concept = await fetchAPI<BackendConcept>(`/learning/concepts/${nodeId}`).catch(() => null);
    return concept ? conceptToNode(concept) : null;
  },

  /** The adaptive path is engine-owned; here it's derived from real LearningPath rows. */
  path: async (): Promise<AdaptivePath> => {
    const paths = await fetchAPI<BackendLearningPath[]>("/learning/paths").catch(
      () => [] as BackendLearningPath[],
    );
    // Without an authenticated learner-specific recommendation call wired in
    // here, treat all path node ids as "available" and leave the rest empty
    // rather than fabricate locked/needs-review buckets.
    return {
      recommendedNextId: paths[0]?.id ?? null,
      availableIds: paths.map((p) => p.id),
      lockedIds: [],
      needsReviewIds: [],
      optionalChallengeIds: [],
      advancedChallengeIds: [],
    };
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
