/**
 * English curriculum BREADTH — wave 2, post-reconciliation content phase.
 *
 * Extends the proven shared spine with the remaining priority English strands
 * (NOT a new engine). Wave 1 added Grammar/Reading/Listening/Writing A1; this
 * wave adds:
 *   - Pronunciation (A1)  — rhyme / same-sound awareness (text proxy)
 *   - Speaking & Conversation (A1) — choose the right thing to say
 *   - Dictation (A1) — hear-and-write (spelling of common words, text proxy)
 *   - Shadowing (A1) — repeat-the-model chunking (order the phrase, text proxy)
 *   - Writing PROJECT (A2) — a real transfer/capstone CREATE task
 *
 * HONESTY on audio strands: Pronunciation/Speaking/Shadowing/Dictation are
 * inherently spoken. Real audio capture + scoring is a separate capability
 * (Voice pipeline, currently PROVIDER-GATED). Until that is live-verified, these
 * competencies use TEXT-PROXY activities that genuinely teach + assess the
 * underlying skill deterministically (rhyme choice, phrase order, spelling,
 * appropriate-response choice) rather than faking audio scoring. The Skill/
 * Competency/strand tagging is real so the strand lights up on the path; the
 * activities are honest text proxies, not pretend microphone grading.
 *
 * Same shape as wave 1; content matches ActivityEvaluator exactly so it grades
 * → Evidence → Mastery → Review. PROD-SAFE idempotent upserts; self-sufficient
 * strand upserts. Run: npm run seed:english:breadth2
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

// PRONUNCIATION (A1) — sound/rhyme awareness (text proxy).
const PRONUNCIATION_A1: CompetencyDef = {
  strand: {
    slug: 'pronunciation-a1-phonics-foundations',
    name: 'Pronunciation: Phonics Foundations (A1)',
    description: 'Ages 7-9. Hear and notice sounds: rhyme, first sounds, and same-sound word groups.',
    strandType: EnglishStrandFamily.PRONUNCIATION,
    cefrLevel: 'A1',
    order: 24,
  },
  skillSlug: 'english-pronunciation',
  skillName: 'English Pronunciation',
  skillOrder: 6,
  competencyId: 'english-competency-phonics-foundations-a1',
  competencyName: 'Sounds & rhymes (A1)',
  competencyDescription: 'Notice rhyming words and shared first sounds.',
  objectiveId: 'english-objective-phonics-foundations-a1',
  objectiveName: 'Hear rhymes and first sounds',
  objectiveDescription: 'Choose words that rhyme or share a starting sound.',
  missionId: 'english-mission-phonics-foundations',
  missionTitle: 'Sound It Out',
  missionDescription: 'Play with sounds and rhymes with Luma.',
  activities: [
    {
      id: 'english-act-pron-rhyme',
      type: ActivityType.SELECT,
      title: 'Which word rhymes with "cat"?',
      description: 'Choose the word that rhymes.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Which word rhymes with "cat"?',
        context: 'Rhyming words end with the same sound. "cat" and "hat" both end in "-at".',
        keyPoints: ['Rhyme = same ending sound', 'cat / hat'],
        options: ['hat', 'dog', 'sun', 'cup'],
        correctAnswers: ['hat'],
      },
    },
    {
      id: 'english-act-pron-firstsound',
      type: ActivityType.SELECT,
      title: 'Which word starts with the same sound as "sun"?',
      description: 'Choose the word with the same first sound.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Which word starts with the same sound as "sun"?',
        context: 'Listen to the FIRST sound. "sun" starts with /s/. So does "sock".',
        keyPoints: ['First sound of sun = /s/', 'sock also starts with /s/'],
        options: ['sock', 'moon', 'ball', 'tree'],
        correctAnswers: ['sock'],
      },
    },
    {
      id: 'english-act-pron-oddone',
      type: ActivityType.SELECT,
      title: 'Which word does NOT rhyme?',
      description: 'Find the word that does not belong.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        question: 'Three words rhyme and one does not. Which does NOT rhyme? (bed, red, fed, dog)',
        context: 'bed/red/fed all end in "-ed". Find the one that ends differently.',
        keyPoints: ['bed/red/fed rhyme', 'dog does not'],
        options: ['dog', 'bed', 'red', 'fed'],
        correctAnswers: ['dog'],
      },
    },
  ],
};

// SPEAKING & CONVERSATION (A1) — choose the appropriate thing to say.
const SPEAKING_A1: CompetencyDef = {
  strand: {
    slug: 'speaking-a1-greetings-exchanges',
    name: 'Speaking: Greetings & Exchanges (A1)',
    description: 'Ages 7-9. Say the right thing in everyday exchanges: greetings, please/thank you, simple answers.',
    strandType: EnglishStrandFamily.SPEAKING,
    cefrLevel: 'A1',
    order: 25,
  },
  skillSlug: 'english-speaking',
  skillName: 'English Speaking',
  skillOrder: 7,
  competencyId: 'english-competency-greetings-exchanges-a1',
  competencyName: 'Everyday exchanges (A1)',
  competencyDescription: 'Choose the right polite, correct response in a simple conversation.',
  objectiveId: 'english-objective-greetings-exchanges-a1',
  objectiveName: 'Respond appropriately in conversation',
  objectiveDescription: 'Pick the best reply for a common spoken situation.',
  missionId: 'english-mission-greetings-exchanges',
  missionTitle: 'Let\'s Talk',
  missionDescription: 'Practise saying the right thing with Luma.',
  activities: [
    {
      id: 'english-act-speak-greet',
      type: ActivityType.SELECT,
      title: 'What do you say back?',
      description: 'Choose the best reply.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Someone says: "Good morning! How are you?" What is a good reply?',
        context: 'When someone greets you and asks how you are, greet back and answer.',
        keyPoints: ['Greet back', 'Answer the question'],
        options: ["I'm fine, thank you!", 'Goodbye!', 'It is raining.', 'No.'],
        correctAnswers: ["I'm fine, thank you!"],
      },
    },
    {
      id: 'english-act-speak-polite',
      type: ActivityType.SELECT,
      title: 'The polite way to ask',
      description: 'Choose the polite request.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'You want a pencil from a friend. What is the polite way to ask?',
        context: 'Polite requests use "please" and ask, not demand.',
        keyPoints: ['Use please', 'Ask, do not demand'],
        options: ['Can I borrow a pencil, please?', 'Give me a pencil.', 'Pencil!', 'I take pencil.'],
        correctAnswers: ['Can I borrow a pencil, please?'],
      },
    },
    {
      id: 'english-act-speak-order',
      type: ActivityType.SEQUENCE,
      title: 'Order the conversation',
      description: 'Put the short conversation in a sensible order.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        question: 'Put this conversation in order.',
        context: 'A conversation flows: greet → ask → answer → thank.',
        items: ['Thank you!', 'Hello!', 'Yes, here you go.', 'Can I have some water, please?'],
        correctOrder: ['Hello!', 'Can I have some water, please?', 'Yes, here you go.', 'Thank you!'],
      },
    },
  ],
};

// DICTATION (A1) — hear-and-write proxy = spelling of common words.
const DICTATION_A1: CompetencyDef = {
  strand: {
    slug: 'dictation-a1-words-phrases',
    name: 'Dictation: Words & Phrases (A1)',
    description: 'Ages 7-9. Write common words and short phrases correctly from a model (spelling focus).',
    strandType: EnglishStrandFamily.DICTATION,
    cefrLevel: 'A1',
    order: 26,
  },
  skillSlug: 'english-dictation',
  skillName: 'English Dictation',
  skillOrder: 8,
  competencyId: 'english-competency-words-phrases-a1',
  competencyName: 'Write words correctly (A1)',
  competencyDescription: 'Spell common everyday words and short phrases correctly.',
  objectiveId: 'english-objective-words-phrases-a1',
  objectiveName: 'Spell common words correctly',
  objectiveDescription: 'Choose or write the correct spelling of common words.',
  missionId: 'english-mission-words-phrases',
  missionTitle: 'Write What You Hear',
  missionDescription: 'Listen and write the words correctly with Luma.',
  activities: [
    {
      id: 'english-act-dict-spelling1',
      type: ActivityType.SELECT,
      title: 'Which spelling is correct?',
      description: 'Choose the correctly spelled word.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Luma says the word "friend". Which spelling is correct?',
        context: '"friend" has a silent "i": f-r-i-e-n-d. Say it and picture the letters.',
        keyPoints: ['friend = f-r-i-e-n-d'],
        options: ['friend', 'frend', 'freind', 'frennd'],
        correctAnswers: ['friend'],
      },
    },
    {
      id: 'english-act-dict-spelling2',
      type: ActivityType.SELECT,
      title: 'Spell "because"',
      description: 'Choose the correctly spelled word.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Luma says "because". Which spelling is correct?',
        context: 'A tricky one: b-e-c-a-u-s-e. Break it into "be-cause".',
        keyPoints: ['because = be-cause'],
        options: ['because', 'becuase', 'becase', 'becoz'],
        correctAnswers: ['because'],
      },
    },
    {
      id: 'english-act-dict-write',
      type: ActivityType.SOLVE,
      title: 'Write the word you hear',
      description: 'Type the word exactly.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        problem: 'Luma says the word "school". Type it exactly, all lowercase.',
        solution: 'school',
        acceptableAnswers: ['school'],
      },
    },
  ],
};

// SHADOWING (A1) — repeat-the-model chunking (order the model phrase).
const SHADOWING_A1: CompetencyDef = {
  strand: {
    slug: 'shadowing-a1-model-sentences',
    name: 'Shadowing: Model Sentences (A1)',
    description: 'Ages 7-9. Repeat short model sentences accurately, keeping the words in the right chunks/order.',
    strandType: EnglishStrandFamily.SHADOWING,
    cefrLevel: 'A1',
    order: 27,
  },
  skillSlug: 'english-shadowing',
  skillName: 'English Shadowing',
  skillOrder: 9,
  competencyId: 'english-competency-model-sentences-a1',
  competencyName: 'Repeat model sentences (A1)',
  competencyDescription: 'Reproduce a short model sentence with the words in the right order.',
  objectiveId: 'english-objective-model-sentences-a1',
  objectiveName: 'Reproduce a model sentence',
  objectiveDescription: 'Rebuild the model sentence exactly as it was said.',
  missionId: 'english-mission-model-sentences',
  missionTitle: 'Say It Like Luma',
  missionDescription: 'Listen to Luma and say it back exactly, chunk by chunk.',
  activities: [
    {
      id: 'english-act-shadow-order1',
      type: ActivityType.SEQUENCE,
      title: 'Say it back in order',
      description: 'Rebuild the model sentence.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Luma said: "I would like some water." Put the chunks in the order she said.',
        context: 'Shadowing means copying exactly. Keep the chunks in the same order Luma used.',
        items: ['some water', 'I would like'],
        correctOrder: ['I would like', 'some water'],
      },
    },
    {
      id: 'english-act-shadow-order2',
      type: ActivityType.SEQUENCE,
      title: 'Copy the longer sentence',
      description: 'Rebuild the model sentence.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Luma said: "On Sunday we go to the park." Put the chunks in her order.',
        context: 'Keep the time chunk ("On Sunday") first, exactly like the model.',
        items: ['to the park', 'On Sunday', 'we go'],
        correctOrder: ['On Sunday', 'we go', 'to the park'],
      },
    },
    {
      id: 'english-act-shadow-pick',
      type: ActivityType.SELECT,
      title: 'Which is the exact copy?',
      description: 'Choose the sentence that matches the model exactly.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        question: 'Luma said: "She is reading a book." Which is the EXACT copy?',
        context: 'Shadowing must match exactly — same words, same order.',
        keyPoints: ['Exact words', 'Exact order'],
        options: ['She is reading a book.', 'She reads a book.', 'A book she is reading.', 'She is read a book.'],
        correctAnswers: ['She is reading a book.'],
      },
    },
  ],
};

// WRITING PROJECT (A2) — transfer/capstone CREATE.
const WRITING_PROJECT_A2: CompetencyDef = {
  strand: {
    slug: 'writing-a2-paragraphs-journals',
    name: 'Writing: Paragraphs & Journals (A2)',
    description: 'Ages 9-11. Write a short organised paragraph with a beginning, middle, and end.',
    strandType: EnglishStrandFamily.WRITING,
    cefrLevel: 'A2',
    order: 28,
  },
  skillSlug: 'english-writing',
  skillName: 'English Writing',
  skillOrder: 5,
  competencyId: 'english-competency-paragraphs-a2',
  competencyName: 'Write a short paragraph (A2)',
  competencyDescription: 'Plan and write a short organised paragraph on a familiar topic.',
  objectiveId: 'english-objective-paragraphs-a2',
  objectiveName: 'Write an organised short paragraph',
  objectiveDescription: 'Produce a 3-4 sentence paragraph with a clear order.',
  missionId: 'english-mission-paragraphs',
  missionTitle: 'My First Paragraph (Project)',
  missionDescription: 'Plan and write a short paragraph — your own mini writing project with Luma.',
  activities: [
    {
      id: 'english-act-para-plan',
      type: ActivityType.SEQUENCE,
      title: 'Plan your paragraph',
      description: 'Order the parts of a good short paragraph.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'A good short paragraph has 3 parts. Put them in order.',
        context: 'Start by telling the topic, then give details, then finish with an ending sentence.',
        items: ['Details in the middle', 'A topic sentence to start', 'An ending sentence'],
        correctOrder: ['A topic sentence to start', 'Details in the middle', 'An ending sentence'],
      },
    },
    {
      id: 'english-act-para-write',
      type: ActivityType.CREATE,
      title: 'Write your paragraph',
      description: 'Write a short paragraph about your favorite day.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        prompt: 'Write a short paragraph (3-4 sentences) about your favorite day of the week. Start with a topic sentence (which day), add 1-2 details (what you do), and finish with an ending sentence (why you like it).',
        context: 'This is your writing project! Use your plan: topic sentence → details → ending. Capital letters and full stops, please.',
        rubric: ['A clear topic sentence', '1-2 detail sentences', 'An ending sentence', 'Capital letters and full stops'],
      },
    },
  ],
};

const COMPETENCIES: CompetencyDef[] = [
  PRONUNCIATION_A1,
  SPEAKING_A1,
  DICTATION_A1,
  SHADOWING_A1,
  WRITING_PROJECT_A2,
];

async function main() {
  console.log('Seeding English breadth (wave 2): pronunciation, speaking, dictation, shadowing, writing-project...');

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

    const competency = await prisma.competency.upsert({
      where: { id: def.competencyId },
      update: { strandId: strand.id, name: def.competencyName, description: def.competencyDescription },
      create: {
        id: def.competencyId,
        skillId: skill.id,
        name: def.competencyName,
        description: def.competencyDescription,
        order: 2,
        strandId: strand.id,
      },
    });

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

  console.log(`English breadth wave 2 seeded: competencies=${comps}, activities=${acts}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
