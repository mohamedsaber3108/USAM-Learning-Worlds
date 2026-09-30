/**
 * English curriculum BREADTH — wave 1 (A1), post-reconciliation content phase.
 *
 * The shared learning spine is already PROVEN (plans-local/78 PRODUCTION
 * VERIFIED). This seed does NOT create a new engine or a "vertical slice to
 * prove the engine" — it scales real A1 CONTENT across four more English
 * strands beyond the existing Vocabulary competency, each plugging into the
 * unchanged spine:
 *
 *   Domain(English) → Skill(per strand) → Competency(tagged to its
 *   EnglishStrand) → LearningObjective → Activities(gradeable, with teaching
 *   content) → Mission → MissionActivity
 *
 * Then the existing engine handles the rest unchanged: MissionRun →
 * ActivityAttempt → Evidence(competencyId) → MasteryRecord → reviewDue →
 * recommendation.
 *
 * Strands covered this wave (A1): GRAMMAR, READING, LISTENING, WRITING.
 * (VOCABULARY A1 already exists via seed-english-vocabulary-slice.ts.)
 *
 * PROD-SAFE: fully idempotent (upsert by fixed id/slug). Self-sufficient — it
 * UPSERTS its own EnglishStrand rows (with the correct `strandType` + CEFR) so
 * competency tagging never depends on a prior strand seed's shape. Activity
 * `content` shapes exactly match the shared ActivityEvaluator
 * (SELECT/MATCH/SEQUENCE/SOLVE), so answers grade and Evidence records.
 *
 * Run: npm run seed:english:breadth
 */
import { PrismaClient, EnglishStrandFamily, ActivityType, DifficultyLevel, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const DOMAIN_SLUG = 'english';

interface StrandDef {
  slug: string;
  name: string;
  description: string;
  strandType: EnglishStrandFamily;
  cefrLevel: string;
  order: number;
}

interface ActivityDef {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  assessmentPurpose: 'FORMATIVE' | 'SUMMATIVE';
  content: Prisma.InputJsonValue;
}

interface CompetencyDef {
  strand: StrandDef;
  skillSlug: string;
  skillName: string;
  skillOrder: number;
  competencyId: string;
  competencyName: string;
  competencyDescription: string;
  objectiveId: string;
  objectiveName: string;
  objectiveDescription: string;
  missionId: string;
  missionTitle: string;
  missionDescription: string;
  activities: ActivityDef[];
}

// ---------------------------------------------------------------------------
// GRAMMAR (A1) — basic sentences: capital letters, is/are, simple word order.
// ---------------------------------------------------------------------------
const GRAMMAR_A1: CompetencyDef = {
  strand: {
    slug: 'grammar-a1-basic-sentences',
    name: 'Grammar: Basic Sentences (A1)',
    description: 'Ages 7-9. Capital letters, full stops, is/are, and simple subject-verb word order.',
    strandType: EnglishStrandFamily.GRAMMAR,
    cefrLevel: 'A1',
    order: 20,
  },
  skillSlug: 'english-grammar',
  skillName: 'English Grammar',
  skillOrder: 2,
  competencyId: 'english-competency-basic-sentences-a1',
  competencyName: 'Basic sentences (A1)',
  competencyDescription: 'Build correct simple sentences: capital letter, is/are, and word order.',
  objectiveId: 'english-objective-basic-sentences-a1',
  objectiveName: 'Write and choose correct simple sentences',
  objectiveDescription: 'Pick the correctly formed sentence and put words in the right order.',
  missionId: 'english-mission-basic-sentences',
  missionTitle: 'Building Sentences',
  missionDescription: 'Learn how a good sentence is built, then make your own with Luma.',
  activities: [
    {
      id: 'english-act-grammar-isare',
      type: ActivityType.SELECT,
      title: 'is or are?',
      description: 'Choose the correct word to finish the sentence.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'The dogs ___ playing in the park.',
        context: 'Use "is" for ONE thing and "are" for MORE than one. "Dogs" is more than one, so we use "are".',
        keyPoints: ['is = one', 'are = more than one'],
        options: ['is', 'are', 'am', 'be'],
        correctAnswers: ['are'],
      },
    },
    {
      id: 'english-act-grammar-capital',
      type: ActivityType.SELECT,
      title: 'Which sentence is written correctly?',
      description: 'Pick the sentence with the right capital letter and full stop.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Which sentence is correct?',
        context: 'A sentence starts with a CAPITAL letter and ends with a full stop (.).',
        keyPoints: ['Start with a capital letter', 'End with a full stop'],
        options: [
          'My cat is soft.',
          'my cat is soft',
          'my Cat is soft.',
          'MY CAT IS SOFT',
        ],
        correctAnswers: ['My cat is soft.'],
      },
    },
    {
      id: 'english-act-grammar-order',
      type: ActivityType.SEQUENCE,
      title: 'Put the sentence in order',
      description: 'Arrange the words to make a correct sentence.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        question: 'Put the words in the right order.',
        context: 'In English a simple sentence usually goes: who → does → what. "She" (who) "eats" (does) "an apple" (what).',
        items: ['an apple', 'She', 'eats'],
        correctOrder: ['She', 'eats', 'an apple'],
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// READING (A1) — read a short text and answer about it.
// ---------------------------------------------------------------------------
const READING_A1: CompetencyDef = {
  strand: {
    slug: 'reading-a1-picture-books-simple-texts',
    name: 'Reading: Picture Books & Simple Texts (A1)',
    description: 'Ages 7-9. Read short, simple texts and answer literal questions about who/what/where.',
    strandType: EnglishStrandFamily.READING,
    cefrLevel: 'A1',
    order: 21,
  },
  skillSlug: 'english-reading',
  skillName: 'English Reading',
  skillOrder: 3,
  competencyId: 'english-competency-simple-texts-a1',
  competencyName: 'Read simple texts (A1)',
  competencyDescription: 'Read a short text and answer literal who/what/where questions.',
  objectiveId: 'english-objective-simple-texts-a1',
  objectiveName: 'Understand a short simple text',
  objectiveDescription: 'Find facts stated directly in a short text.',
  missionId: 'english-mission-simple-texts',
  missionTitle: 'Reading Together',
  missionDescription: 'Read a little story with Luma and show what you understood.',
  activities: [
    {
      id: 'english-act-reading-who',
      type: ActivityType.SELECT,
      title: 'Who is in the story?',
      description: 'Read the text and choose who it is about.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Read: "Sara has a red ball. She plays with it in the garden." Who plays with the ball?',
        context: 'The answer is right there in the text. Read carefully and find the name.',
        keyPoints: ['Find the name in the text', 'Sara plays with the ball'],
        options: ['Sara', 'the dog', 'the teacher', 'nobody'],
        correctAnswers: ['Sara'],
      },
    },
    {
      id: 'english-act-reading-where',
      type: ActivityType.SELECT,
      title: 'Where does it happen?',
      description: 'Read the text and choose the place.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Read: "Sara has a red ball. She plays with it in the garden." Where does she play?',
        context: 'A "where" question asks about the place. Look for a place word in the text.',
        keyPoints: ['Look for the place', 'in the garden'],
        options: ['in the garden', 'at school', 'in the car', 'on the moon'],
        correctAnswers: ['in the garden'],
      },
    },
    {
      id: 'english-act-reading-match',
      type: ActivityType.MATCH,
      title: 'Match who does what',
      description: 'Match each person to what they do in the text.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        question: 'Read: "Ali reads a book. Mona draws a cat. Sam kicks the ball." Match each child to what they do.',
        context: 'Read each sentence and connect the name to the action.',
        pairs: [
          { left: 'Ali', right: 'reads a book' },
          { left: 'Mona', right: 'draws a cat' },
          { left: 'Sam', right: 'kicks the ball' },
        ],
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// LISTENING (A1) — follow a simple instruction / short spoken line (text-based
// proxy: the "heard" line is shown as text so it grades deterministically).
// ---------------------------------------------------------------------------
const LISTENING_A1: CompetencyDef = {
  strand: {
    slug: 'listening-a1-instructions-stories',
    name: 'Listening: Instructions & Stories (A1)',
    description: 'Ages 7-9. Follow one- and two-step spoken instructions and catch key facts in short spoken lines.',
    strandType: EnglishStrandFamily.LISTENING,
    cefrLevel: 'A1',
    order: 22,
  },
  skillSlug: 'english-listening',
  skillName: 'English Listening',
  skillOrder: 4,
  competencyId: 'english-competency-follow-instructions-a1',
  competencyName: 'Follow simple instructions (A1)',
  competencyDescription: 'Understand and follow short spoken instructions and catch key facts.',
  objectiveId: 'english-objective-follow-instructions-a1',
  objectiveName: 'Understand a short spoken instruction',
  objectiveDescription: 'Choose the correct action for a simple instruction.',
  missionId: 'english-mission-follow-instructions',
  missionTitle: 'Listen and Do',
  missionDescription: 'Listen to Luma and choose exactly what she asked for.',
  activities: [
    {
      id: 'english-act-listening-action',
      type: ActivityType.SELECT,
      title: 'What should you do?',
      description: 'Luma says an instruction. Choose the right action.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Luma says: "Please clap your hands two times." What do you do?',
        context: 'Listen for the ACTION word ("clap") and the NUMBER ("two times"). Do exactly that.',
        keyPoints: ['Action = clap', 'How many = two'],
        options: ['Clap twice', 'Jump twice', 'Clap three times', 'Sit down'],
        correctAnswers: ['Clap twice'],
      },
    },
    {
      id: 'english-act-listening-fact',
      type: ActivityType.SELECT,
      title: 'What color is the cat?',
      description: 'Listen to the short line and catch the fact.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Luma says: "I have a black cat named Ziko." What color is the cat?',
        context: 'Catch the important detail — the color word.',
        keyPoints: ['Listen for the color', 'black'],
        options: ['black', 'white', 'orange', 'brown'],
        correctAnswers: ['black'],
      },
    },
    {
      id: 'english-act-listening-order',
      type: ActivityType.SEQUENCE,
      title: 'Do the steps in order',
      description: 'Luma gives two steps. Put them in the order she said.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        question: 'Luma says: "First stand up, then wave hello." Put the steps in order.',
        context: 'Listen for order words: "first" comes before "then".',
        items: ['wave hello', 'stand up'],
        correctOrder: ['stand up', 'wave hello'],
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// WRITING (A1) — write short correct sentences/captions.
// ---------------------------------------------------------------------------
const WRITING_A1: CompetencyDef = {
  strand: {
    slug: 'writing-a1-sentences-captions',
    name: 'Writing: Sentences & Captions (A1)',
    description: 'Ages 7-9. Write short correct sentences and picture captions with capital letters and full stops.',
    strandType: EnglishStrandFamily.WRITING,
    cefrLevel: 'A1',
    order: 23,
  },
  skillSlug: 'english-writing',
  skillName: 'English Writing',
  skillOrder: 5,
  competencyId: 'english-competency-sentences-captions-a1',
  competencyName: 'Write sentences & captions (A1)',
  competencyDescription: 'Write short, correct sentences and captions for pictures.',
  objectiveId: 'english-objective-sentences-captions-a1',
  objectiveName: 'Write a short correct sentence',
  objectiveDescription: 'Produce a short sentence with correct spelling and punctuation.',
  missionId: 'english-mission-sentences-captions',
  missionTitle: 'Write It Down',
  missionDescription: 'Write your own short sentences and captions with Luma.',
  activities: [
    {
      id: 'english-act-writing-fix',
      type: ActivityType.SELECT,
      title: 'Which caption is written correctly?',
      description: 'Choose the correctly written caption.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Which caption for a photo of a sunset is correct?',
        context: 'A good caption is a real sentence: capital letter at the start, full stop at the end.',
        keyPoints: ['Capital letter', 'Full stop'],
        options: [
          'The sun is going down.',
          'the sun is going down',
          'THE SUN is going down',
          'the Sun Is Going Down',
        ],
        correctAnswers: ['The sun is going down.'],
      },
    },
    {
      id: 'english-act-writing-build',
      type: ActivityType.SEQUENCE,
      title: 'Build a caption',
      description: 'Order the words into a correct caption.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Order the words to caption a picture of a dog running.',
        context: 'Who → does → what: "The dog" (who) "is running" (does what).',
        items: ['is running', 'The dog', 'fast'],
        correctOrder: ['The dog', 'is running', 'fast'],
      },
    },
    {
      id: 'english-act-writing-create',
      type: ActivityType.CREATE,
      title: 'Write your own caption',
      description: 'Write a short caption for your favorite thing.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        prompt: 'Write one short sentence about your favorite food. Start with a capital letter and end with a full stop.',
        context: 'You are the writer now! One clear sentence is perfect. Example: "I love warm bread."',
        rubric: ['One complete sentence', 'Capital letter at the start', 'Full stop at the end'],
      },
    },
  ],
};

const COMPETENCIES: CompetencyDef[] = [GRAMMAR_A1, READING_A1, LISTENING_A1, WRITING_A1];

async function main() {
  console.log('Seeding English breadth (A1): grammar, reading, listening, writing...');

  const domain = await prisma.domain.upsert({
    where: { slug: DOMAIN_SLUG },
    update: {},
    create: {
      name: 'English',
      slug: DOMAIN_SLUG,
      description: 'Learn English — vocabulary, grammar, reading, and more.',
      icon: 'Languages',
      color: '#8b5cf6',
      order: 1,
    },
  });

  const englishWorld = await prisma.world.findFirst({
    where: { domain: { slug: DOMAIN_SLUG } },
    orderBy: { order: 'asc' },
  });

  let comps = 0;
  let acts = 0;

  for (const def of COMPETENCIES) {
    // 1) Strand — upsert by slug so tagging never depends on a prior strand
    //    seed. This also FIXES the missing-strandType gap for this family.
    const strand = await prisma.englishStrand.upsert({
      where: { slug: def.strand.slug },
      update: {
        name: def.strand.name,
        description: def.strand.description,
        strandType: def.strand.strandType,
        cefrLevel: def.strand.cefrLevel,
        order: def.strand.order,
      },
      create: {
        slug: def.strand.slug,
        name: def.strand.name,
        description: def.strand.description,
        strandType: def.strand.strandType,
        cefrLevel: def.strand.cefrLevel,
        order: def.strand.order,
      },
    });

    // 2) Skill (one per strand family).
    const skill = await prisma.skill.upsert({
      where: { slug: def.skillSlug },
      update: {},
      create: {
        domainId: domain.id,
        name: def.skillName,
        slug: def.skillSlug,
        description: `${def.skillName} — core skills that build real English ability.`,
        order: def.skillOrder,
      },
    });

    // 3) Competency, tagged to its real strand.
    const competency = await prisma.competency.upsert({
      where: { id: def.competencyId },
      update: { strandId: strand.id, name: def.competencyName, description: def.competencyDescription },
      create: {
        id: def.competencyId,
        skillId: skill.id,
        name: def.competencyName,
        description: def.competencyDescription,
        order: 1,
        strandId: strand.id,
      },
    });

    // 4) Objective.
    const objective = await prisma.learningObjective.upsert({
      where: { id: def.objectiveId },
      update: { name: def.objectiveName, description: def.objectiveDescription },
      create: {
        id: def.objectiveId,
        competencyId: competency.id,
        name: def.objectiveName,
        description: def.objectiveDescription,
        order: 1,
      },
    });

    // 5) Mission.
    const mission = await prisma.mission.upsert({
      where: { id: def.missionId },
      update: { worldId: englishWorld?.id ?? null, title: def.missionTitle, description: def.missionDescription },
      create: {
        id: def.missionId,
        worldId: englishWorld?.id ?? null,
        title: def.missionTitle,
        description: def.missionDescription,
        type: 'GUIDED',
        estimatedMinutes: 10,
        order: 1,
      },
    });

    // 6) Activities + mission join.
    for (const [index, a] of def.activities.entries()) {
      const activity = await prisma.activity.upsert({
        where: { id: a.id },
        update: { content: a.content, title: a.title, description: a.description },
        create: {
          id: a.id,
          objectiveId: objective.id,
          type: a.type,
          title: a.title,
          description: a.description,
          difficulty: a.difficulty,
          assessmentPurpose: a.assessmentPurpose,
          order: index,
          content: a.content,
        },
      });
      await prisma.missionActivity.upsert({
        where: { missionId_activityId: { missionId: mission.id, activityId: activity.id } },
        update: {},
        create: { missionId: mission.id, activityId: activity.id, order: index, isRequired: true },
      });
      acts += 1;
    }
    comps += 1;
    console.log(`  ✓ ${def.competencyName}  (strand=${def.strand.slug}, mission=${def.missionId}, activities=${def.activities.length})`);
  }

  console.log(`English breadth A1 seeded: competencies=${comps}, activities=${acts}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
