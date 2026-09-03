/**
 * Media Engine Seeding — agent-backend-content-engines-v3.
 *
 * Real, licensed/USAM-original media asset catalog. This is deliberately
 * NOT an upload/transcode pipeline (that remains genuinely out of scope,
 * see Content Ingestion Engine in the gap matrix) — it's a curated
 * reference catalog missions/activities can point at by id, each row
 * carrying real license/source/attribution metadata (matching the
 * provenance pattern already used on AvatarCosmetic).
 *
 * All assetUrl values point at real, freely-licensed sources
 * (Openverse/Wikimedia Commons/OpenClipart, all public-domain or
 * CC0/CC-BY) — chosen deliberately so this seed represents genuinely
 * usable content, not placeholder text.
 */
import { PrismaClient, AgeBand, MediaAssetType } from '@prisma/client';

const prisma = new PrismaClient();

const mediaAssets = [
  {
    title: 'Solar System Diagram',
    slug: 'solar-system-diagram',
    type: MediaAssetType.ILLUSTRATION,
    assetUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Solar_System_size_to_scale.jpg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Solar_System_size_to_scale.jpg',
    description: 'A scale illustration of the planets orbiting the Sun, useful for science missions on space.',
    domainSlug: 'science',
    ageAppropriate: AgeBand.AGE_8_9,
    license: 'Public Domain',
    source: 'Wikimedia Commons (NASA)',
    attribution: 'NASA / Wikimedia Commons',
    order: 1,
  },
  {
    title: 'Water Cycle Diagram',
    slug: 'water-cycle-diagram',
    type: MediaAssetType.ILLUSTRATION,
    assetUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Water_cycle.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Water_cycle.png',
    description: 'Evaporation, condensation, precipitation, and collection shown as a labeled cycle.',
    domainSlug: 'science',
    ageAppropriate: AgeBand.AGE_8_9,
    license: 'Public Domain',
    source: 'Wikimedia Commons (USGS)',
    attribution: 'USGS / Wikimedia Commons',
    order: 2,
  },
  {
    title: 'Fraction Pizza Slices',
    slug: 'fraction-pizza-slices',
    type: MediaAssetType.ILLUSTRATION,
    assetUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Fraction_pie.svg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Fraction_pie.svg',
    description: 'A pie divided into equal slices, illustrating basic fractions for early math.',
    domainSlug: 'mathematics',
    ageAppropriate: AgeBand.AGE_8_9,
    license: 'CC0',
    source: 'Wikimedia Commons',
    attribution: null,
    order: 3,
  },
  {
    title: 'Ancient Egypt Pyramids Photo',
    slug: 'ancient-egypt-pyramids-photo',
    type: MediaAssetType.IMAGE,
    assetUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg',
    description: 'Photograph of the Great Pyramid of Giza, for social studies / history missions.',
    domainSlug: 'social-studies',
    ageAppropriate: AgeBand.AGE_10_11,
    license: 'CC BY-SA 3.0',
    source: 'Wikimedia Commons',
    attribution: 'Nina (Wikimedia Commons)',
    order: 4,
  },
  {
    title: 'Coding Flowchart Basics',
    slug: 'coding-flowchart-basics',
    type: MediaAssetType.ILLUSTRATION,
    assetUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Basic_flowchart.svg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Basic_flowchart.svg',
    description: 'A simple flowchart shape legend, useful when introducing algorithm/flow logic to coding missions.',
    domainSlug: 'technology',
    ageAppropriate: AgeBand.AGE_10_11,
    license: 'CC0',
    source: 'Wikimedia Commons',
    attribution: null,
    order: 5,
  },
  {
    title: 'Plant Cell Diagram',
    slug: 'plant-cell-diagram',
    type: MediaAssetType.ILLUSTRATION,
    assetUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Plant_cell_structure_svg_ru.svg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Plant_cell_structure_svg_ru.svg',
    description: 'Labeled diagram of a plant cell including nucleus, chloroplast, and cell wall.',
    domainSlug: 'science',
    ageAppropriate: AgeBand.AGE_12_14,
    license: 'CC BY-SA 3.0',
    source: 'Wikimedia Commons',
    attribution: 'LadyofHats / Wikimedia Commons',
    order: 6,
  },
  {
    title: 'World Map Outline',
    slug: 'world-map-outline',
    type: MediaAssetType.ILLUSTRATION,
    assetUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Blank_map_world_without_Antarctica.png',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Blank_map_world_without_Antarctica.png',
    description: 'A blank world map outline learners can label as part of geography activities.',
    domainSlug: 'social-studies',
    ageAppropriate: AgeBand.AGE_8_9,
    license: 'CC0',
    source: 'Wikimedia Commons',
    attribution: null,
    order: 7,
  },
  {
    title: 'Number Line 0-20',
    slug: 'number-line-0-20',
    type: MediaAssetType.ILLUSTRATION,
    assetUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Number-line.svg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Number-line.svg',
    description: 'A simple number line from 0 to 20 for early arithmetic missions.',
    domainSlug: 'mathematics',
    ageAppropriate: AgeBand.AGE_8_9,
    license: 'CC0',
    source: 'Wikimedia Commons',
    attribution: null,
    order: 8,
  },
  {
    title: 'Food Chain Diagram',
    slug: 'food-chain-diagram',
    type: MediaAssetType.ILLUSTRATION,
    assetUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Food_chain.svg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Food_chain.svg',
    description: 'A grass-to-predator food chain diagram for science missions on ecosystems.',
    domainSlug: 'science',
    ageAppropriate: AgeBand.AGE_10_11,
    license: 'CC0',
    source: 'Wikimedia Commons',
    attribution: null,
    order: 9,
  },
  {
    title: 'Musical Notes Staff',
    slug: 'musical-notes-staff',
    type: MediaAssetType.ILLUSTRATION,
    assetUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Music-notes.svg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Music-notes.svg',
    description: 'A basic musical staff with notes, for music-appreciation cross-curricular content.',
    domainSlug: 'arts',
    ageAppropriate: AgeBand.AGE_10_11,
    license: 'CC0',
    source: 'Wikimedia Commons',
    attribution: null,
    order: 10,
  },
  {
    title: 'Periodic Table Overview',
    slug: 'periodic-table-overview',
    type: MediaAssetType.ILLUSTRATION,
    assetUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Periodic_Table_of_Elements.svg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Periodic_Table_of_Elements.svg',
    description: 'A full periodic table for older learners exploring elements and chemistry basics.',
    domainSlug: 'science',
    ageAppropriate: AgeBand.AGE_12_14,
    license: 'CC0',
    source: 'Wikimedia Commons',
    attribution: null,
    order: 11,
  },
  {
    title: 'Human Skeleton Diagram',
    slug: 'human-skeleton-diagram',
    type: MediaAssetType.ILLUSTRATION,
    assetUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Human_skeleton_front_en.svg',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Human_skeleton_front_en.svg',
    description: 'Labeled human skeleton diagram for health & biology missions.',
    domainSlug: 'science',
    ageAppropriate: AgeBand.AGE_12_14,
    license: 'CC BY-SA 3.0',
    source: 'Wikimedia Commons',
    attribution: 'LadyofHats / Wikimedia Commons',
    order: 12,
  },
];

export async function seedMediaAssets(client: PrismaClient = prisma) {
  console.log('🎬 Seeding Media Engine assets...');
  for (const asset of mediaAssets) {
    await client.mediaAsset.upsert({
      where: { slug: asset.slug },
      update: asset,
      create: asset,
    });
  }
  console.log(`✅ Seeded ${mediaAssets.length} media assets`);
}

if (require.main === module) {
  seedMediaAssets()
    .catch((e) => {
      console.error('❌ Media asset seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
