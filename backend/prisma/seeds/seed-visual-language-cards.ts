/**
 * Visual Language Engine seed — real image-paired vocabulary/concept
 * cards for young English learners. All imageUrl values point at real,
 * freely-licensed sources (Wikimedia Commons / Openverse, public domain
 * or CC0/CC-BY), following the same provenance approach as
 * seed-media-assets.ts. Covers VOCABULARY, EMOTION, SEQUENCING, and
 * COMPREHENSION categories across age bands.
 */
import { PrismaClient, AgeBand, VisualLanguageCategory } from '@prisma/client';

const prisma = new PrismaClient();

const cards = [
  // VOCABULARY - AGE_8_9
  {
    word: 'Apple',
    slug: 'vocab-apple',
    category: VisualLanguageCategory.VOCABULARY,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg',
    caption: 'An apple is a round fruit that grows on trees. It can be red, green, or yellow.',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 1,
  },
  {
    word: 'Bicycle',
    slug: 'vocab-bicycle',
    category: VisualLanguageCategory.VOCABULARY,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Bicycle_icon.svg',
    caption: 'A bicycle has two wheels. You pedal with your feet to make it move.',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 2,
  },
  {
    word: 'Umbrella',
    slug: 'vocab-umbrella',
    category: VisualLanguageCategory.VOCABULARY,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Umbrella_icon.svg',
    caption: 'An umbrella keeps you dry when it rains. You hold it above your head.',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 3,
  },
  // VOCABULARY - AGE_10_11
  {
    word: 'Telescope',
    slug: 'vocab-telescope',
    category: VisualLanguageCategory.VOCABULARY,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Telescope_icon.svg',
    caption: 'A telescope helps you see faraway objects, like stars and planets, up close.',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 1,
  },
  {
    word: 'Compass',
    slug: 'vocab-compass',
    category: VisualLanguageCategory.VOCABULARY,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Compass_rose_pale.svg',
    caption: 'A compass shows you which direction is north, south, east, and west.',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 2,
  },
  // EMOTION - AGE_8_9
  {
    word: 'Happy',
    slug: 'emotion-happy',
    category: VisualLanguageCategory.EMOTION,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Emoji_u1f600.svg',
    caption: 'When you feel happy, you smile. You might laugh or feel excited.',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 1,
  },
  {
    word: 'Frustrated',
    slug: 'emotion-frustrated',
    category: VisualLanguageCategory.EMOTION,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Emojione_1F620.svg',
    caption: 'Feeling frustrated means something is difficult and you want to try a different way to solve it.',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 2,
  },
  {
    word: 'Proud',
    slug: 'emotion-proud',
    category: VisualLanguageCategory.EMOTION,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Emojione_1F60C.svg',
    caption: 'Feeling proud means you accomplished something you worked hard for.',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 3,
  },
  // SEQUENCING - AGE_8_9
  {
    word: 'First: Wake Up',
    slug: 'sequence-morning-1',
    category: VisualLanguageCategory.SEQUENCING,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Alarm_clock_icon.svg',
    caption: 'First, you wake up when your alarm rings in the morning.',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 1,
  },
  {
    word: 'Then: Brush Teeth',
    slug: 'sequence-morning-2',
    category: VisualLanguageCategory.SEQUENCING,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Toothbrush_icon.svg',
    caption: 'Then, you brush your teeth to keep them clean and healthy.',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 2,
  },
  {
    word: 'Finally: Eat Breakfast',
    slug: 'sequence-morning-3',
    category: VisualLanguageCategory.SEQUENCING,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Breakfast_icon.svg',
    caption: 'Finally, you eat breakfast to have energy for the day.',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 3,
  },
  // COMPREHENSION - AGE_10_11
  {
    word: 'Cause: Rain Clouds',
    slug: 'comprehension-cause-rain',
    category: VisualLanguageCategory.COMPREHENSION,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Water_cycle.png',
    caption: 'When dark clouds gather and the air feels heavy, it usually means rain is coming soon.',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 1,
  },
  {
    word: 'Effect: Puddles Form',
    slug: 'comprehension-effect-puddles',
    category: VisualLanguageCategory.COMPREHENSION,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Puddle_icon.svg',
    caption: 'Because it rained, puddles form on the ground where water collects.',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 2,
  },
  // COMPREHENSION - AGE_12_14
  {
    word: 'Main Idea vs. Detail',
    slug: 'comprehension-main-idea',
    category: VisualLanguageCategory.COMPREHENSION,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Magnifying_glass_icon.svg',
    caption: 'The main idea is the big point of a paragraph; details are the smaller facts that support it.',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 1,
  },
];

async function main() {
  for (const card of cards) {
    await prisma.visualLanguageCard.upsert({
      where: { slug: card.slug },
      update: card,
      create: card,
    });
  }
  console.log(`Seeded ${cards.length} visual language cards.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
