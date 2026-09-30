/**
 * AI Literacy curriculum BREADTH — wave 1, post-reconciliation content phase.
 *
 * Scales the canonical `ai-literacy` domain beyond the single proven
 * "What is AI?" vertical slice with real gradeable content on the SAME shared
 * spine (no new engine). The vertical slice covered AI basics; this wave adds
 * the remaining priority AI-literacy areas as real competencies:
 *   - How machines learn (ML concepts)      — SELECT + MATCH
 *   - Generative AI (makes new things)       — SELECT + EXPLAIN
 *   - Prompting (asking AI clearly)          — SEQUENCE + SELECT
 *   - Hallucinations (AI can make things up) — SELECT + EXPLAIN
 *   - Bias & fairness                        — SELECT + MATCH
 *   - Privacy & safety                       — SELECT + SELECT
 *   - Human oversight & checking (evaluation)— SEQUENCE + SELECT
 *   - Project: be a smart AI helper          — CREATE capstone
 *
 * All activities match the shared ActivityEvaluator EXACTLY so they grade →
 * Evidence → Mastery → Review:
 *   SELECT   {question, options, correctAnswers[]}  / {selectedAnswers[]}
 *   MATCH    {pairs:[{left,right}]}                 / {matches:[{left,right}]}
 *   SEQUENCE {items, correctOrder[]}                / {orderedItems[]}
 *   EXPLAIN  {question, keyPoints[]}                / {explanation}  (>=0.7 of
 *            keyPoints must appear as case-insensitive SUBSTRINGS, and the
 *            explanation must be >=20 chars). keyPoints are therefore kept to
 *            short, natural words a child would actually type.
 *   CREATE   {prompt, rubric}                       / {submission|description}
 *
 * EvidenceType: SELECT=KNOWLEDGE, MATCH=APPLICATION, SEQUENCE=PROBLEM_SOLVING,
 * EXPLAIN=EXPLANATION, CREATE=CREATION.
 *
 * PROD-SAFE idempotent upserts with fixed ids; self-sufficient skill upserts.
 * Run: npm run seed:ai-literacy:breadth
 */
import { PrismaClient, ActivityType, DifficultyLevel, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const DOMAIN_SLUG = 'ai-literacy';

interface SkillDef {
  slug: string;
  name: string;
  description: string;
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
  skill: SkillDef;
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

const UNDERSTANDING_AI: SkillDef = {
  slug: 'ai-understanding-ai',
  name: 'Understanding AI',
  description: 'The big ideas behind artificial intelligence.',
  order: 1,
};
const USING_AI_WELL: SkillDef = {
  slug: 'ai-using-ai-well',
  name: 'Using AI Well',
  description: 'Get good results from AI by asking clearly and checking its work.',
  order: 2,
};
const AI_AND_SOCIETY: SkillDef = {
  slug: 'ai-and-society',
  name: 'AI, Fairness & Safety',
  description: 'Use AI responsibly: fairness, privacy, safety, and human oversight.',
  order: 3,
};

// ML CONCEPTS — how machines learn.
const ML_CONCEPTS: CompetencyDef = {
  skill: UNDERSTANDING_AI,
  competencyId: 'ai-competency-how-machines-learn',
  competencyName: 'How machines learn',
  competencyDescription: 'Understand that AI learns patterns from lots of examples (data).',
  objectiveId: 'ai-objective-how-machines-learn',
  objectiveName: 'Explain learning from examples',
  objectiveDescription: 'Know that AI improves by seeing many examples, not by being told every rule.',
  missionId: 'ai-mission-how-machines-learn',
  missionTitle: 'How AI Learns',
  missionDescription: 'Discover how AI learns from examples, with Nova.',
  activities: [
    {
      id: 'ai-act-ml-learns-from',
      type: ActivityType.SELECT,
      title: 'How does AI learn?',
      description: 'Choose how AI learns to do a task.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'How does AI usually learn to tell a cat from a dog?',
        context: 'AI learns by looking at MANY examples (this is a cat, this is a dog) until it spots the patterns.',
        keyPoints: ['AI learns from many examples', 'It finds patterns in data'],
        options: [
          'By looking at many labelled examples until it spots patterns',
          'By being born knowing everything',
          'By guessing randomly forever',
          'By reading one book once',
        ],
        correctAnswers: ['By looking at many labelled examples until it spots patterns'],
      },
    },
    {
      id: 'ai-act-ml-more-examples',
      type: ActivityType.SELECT,
      title: 'More examples, better AI?',
      description: 'Decide what good, varied examples do.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'An AI has only ever seen photos of white cats. What might happen?',
        context: 'AI only knows what it has seen. If its examples are not varied, it can get confused by new cases.',
        keyPoints: ['AI only knows what it has seen', 'Varied examples matter'],
        options: [
          'It might not recognise a black cat',
          'It will always be perfect',
          'It will learn to bark',
          'Nothing — examples do not matter',
        ],
        correctAnswers: ['It might not recognise a black cat'],
      },
    },
    {
      id: 'ai-act-ml-match',
      type: ActivityType.MATCH,
      title: 'Match the AI word',
      description: 'Match each AI idea to its meaning.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        question: 'Match each AI word to what it means.',
        context: 'These are the building blocks of how AI learns.',
        pairs: [
          { left: 'Data', right: 'the examples AI learns from' },
          { left: 'Pattern', right: 'something that repeats that AI can spot' },
          { left: 'Training', right: 'showing AI examples so it can learn' },
        ],
      },
    },
  ],
};

// GENERATIVE AI — makes new things.
const GENERATIVE_AI: CompetencyDef = {
  skill: UNDERSTANDING_AI,
  competencyId: 'ai-competency-generative-ai',
  competencyName: 'Generative AI',
  competencyDescription: 'Understand that some AI can make new text, pictures, or sounds.',
  objectiveId: 'ai-objective-generative-ai',
  objectiveName: 'Describe what generative AI makes',
  objectiveDescription: 'Know that generative AI creates new content based on patterns it learned.',
  missionId: 'ai-mission-generative-ai',
  missionTitle: 'AI That Creates',
  missionDescription: 'Meet AI that can make new pictures and words, with Nova.',
  activities: [
    {
      id: 'ai-act-gen-what-makes',
      type: ActivityType.SELECT,
      title: 'What does generative AI do?',
      description: 'Choose what generative AI makes.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'What does "generative" AI do?',
        context: 'Generative AI makes NEW things — like a new story, a new picture, or a new song — based on patterns it learned.',
        keyPoints: ['Generative AI makes new things', 'It uses patterns it learned'],
        options: [
          'It makes new things like text, pictures, or music',
          'It only deletes files',
          'It only adds numbers',
          'It can only say yes or no',
        ],
        correctAnswers: ['It makes new things like text, pictures, or music'],
      },
    },
    {
      id: 'ai-act-gen-explain',
      type: ActivityType.EXPLAIN,
      title: 'Explain generative AI',
      description: 'Explain in your own words what generative AI can make.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        question: 'In your own words, what can generative AI make? Give an example.',
        context:
          'Write 1-2 sentences. Try to use the words "new" and "example" — say what it makes (something new) and give one example (like a picture or a story).',
        keyPoints: ['new', 'example'],
      },
    },
  ],
};

// PROMPTING — asking AI clearly.
const PROMPTING: CompetencyDef = {
  skill: USING_AI_WELL,
  competencyId: 'ai-competency-prompting',
  competencyName: 'Prompting: asking AI clearly',
  competencyDescription: 'Ask AI clear questions to get better, more useful answers.',
  objectiveId: 'ai-objective-prompting',
  objectiveName: 'Write clear prompts',
  objectiveDescription: 'Give AI enough detail so it can help well.',
  missionId: 'ai-mission-prompting',
  missionTitle: 'Ask AI the Right Way',
  missionDescription: 'Learn to ask AI clearly so it can help you, with Nova.',
  activities: [
    {
      id: 'ai-act-prompt-best',
      type: ActivityType.SELECT,
      title: 'Which prompt is clearest?',
      description: 'Choose the clearest request to an AI.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'You want help writing a thank-you note to your grandma. Which prompt is BEST?',
        context: 'A clear prompt says what you want, who it is for, and any details. More helpful detail = better answer.',
        keyPoints: ['Say what you want', 'Give helpful details'],
        options: [
          'Write a short, friendly thank-you note to my grandma for a birthday gift',
          'note',
          'do something',
          'grandma',
        ],
        correctAnswers: ['Write a short, friendly thank-you note to my grandma for a birthday gift'],
      },
    },
    {
      id: 'ai-act-prompt-improve-order',
      type: ActivityType.SEQUENCE,
      title: 'Build a good prompt',
      description: 'Order the parts of a clear prompt.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Put the parts of a clear prompt in a sensible order.',
        context: 'First say the task, then who or what it is for, then any special details.',
        items: ['Add details: keep it under 3 sentences', 'The task: write a poem', 'Who it is for: about my pet dog'],
        correctOrder: ['The task: write a poem', 'Who it is for: about my pet dog', 'Add details: keep it under 3 sentences'],
      },
    },
    {
      id: 'ai-act-prompt-vague',
      type: ActivityType.SELECT,
      title: 'Why did AI give a bad answer?',
      description: 'Choose the likely reason.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        question: 'You typed just "help" and the AI gave a confusing answer. Why?',
        context: 'If a prompt is too vague, AI has to guess what you mean. Clear detail helps it help you.',
        keyPoints: ['Vague prompts make AI guess', 'Add detail'],
        options: [
          'The prompt was too vague, so AI had to guess',
          'AI is broken forever',
          'You must whisper to AI',
          'AI never helps with anything',
        ],
        correctAnswers: ['The prompt was too vague, so AI had to guess'],
      },
    },
  ],
};

// HALLUCINATIONS — AI can make things up.
const HALLUCINATIONS: CompetencyDef = {
  skill: USING_AI_WELL,
  competencyId: 'ai-competency-hallucinations',
  competencyName: 'AI can make things up',
  competencyDescription: 'Know that AI can state wrong things confidently, so answers need checking.',
  objectiveId: 'ai-objective-hallucinations',
  objectiveName: 'Recognise AI can be confidently wrong',
  objectiveDescription: 'Understand AI sometimes invents facts and why checking matters.',
  missionId: 'ai-mission-hallucinations',
  missionTitle: 'Check AI\'s Work',
  missionDescription: 'Learn that AI can be confidently wrong, and how to check, with Nova.',
  activities: [
    {
      id: 'ai-act-hallu-what',
      type: ActivityType.SELECT,
      title: 'Can AI be confidently wrong?',
      description: 'Choose the true statement.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'AI gives you a "fact" in a very sure voice. Should you believe it right away?',
        context: 'AI can sound very sure even when it is wrong — this is sometimes called a "hallucination". Always check important facts.',
        keyPoints: ['AI can be confidently wrong', 'Check important facts'],
        options: [
          'No — AI can be wrong even when it sounds sure, so check it',
          'Yes — if it sounds sure it must be true',
          'Only if it uses big words',
          'Yes — AI is never wrong',
        ],
        correctAnswers: ['No — AI can be wrong even when it sounds sure, so check it'],
      },
    },
    {
      id: 'ai-act-hallu-explain',
      type: ActivityType.EXPLAIN,
      title: 'Why check AI answers?',
      description: 'Explain why you should check what AI tells you.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        question: 'Explain why it is a good idea to check important facts an AI gives you.',
        context:
          'Write 1-2 sentences. Try to use the words "wrong" and "check" — AI can be wrong, so you should check.',
        keyPoints: ['wrong', 'check'],
      },
    },
  ],
};

// BIAS & FAIRNESS.
const BIAS_FAIRNESS: CompetencyDef = {
  skill: AI_AND_SOCIETY,
  competencyId: 'ai-competency-bias-fairness',
  competencyName: 'Bias & fairness',
  competencyDescription: 'Understand AI can be unfair if it learned from unfair examples.',
  objectiveId: 'ai-objective-bias-fairness',
  objectiveName: 'Recognise unfair AI',
  objectiveDescription: 'Know bias comes from the examples AI learned from, and why fairness matters.',
  missionId: 'ai-mission-bias-fairness',
  missionTitle: 'Is It Fair?',
  missionDescription: 'Learn how AI can be unfair, and why fairness matters, with Nova.',
  activities: [
    {
      id: 'ai-act-bias-where-from',
      type: ActivityType.SELECT,
      title: 'Where does unfair AI come from?',
      description: 'Choose where bias comes from.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'An AI is unfair to some people. Where did that unfairness most likely come from?',
        context: 'AI learns from examples. If the examples were unfair or incomplete, the AI can be unfair too.',
        keyPoints: ['Bias comes from unfair examples', 'AI copies its data'],
        options: [
          'From unfair or incomplete examples it learned from',
          'From the color of the computer',
          'From the time of day',
          'AI is always perfectly fair',
        ],
        correctAnswers: ['From unfair or incomplete examples it learned from'],
      },
    },
    {
      id: 'ai-act-bias-match',
      type: ActivityType.MATCH,
      title: 'Fair or unfair?',
      description: 'Match each situation to fair or unfair.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        question: 'Match each situation to whether it is fair or unfair.',
        context: 'Fairness means AI treats people equally and does not leave groups out.',
        pairs: [
          { left: 'AI trained on faces of only one group', right: 'unfair' },
          { left: 'AI trained on many different kinds of people', right: 'fair' },
          { left: 'AI that ignores some kids on purpose', right: 'unfair' },
        ],
      },
    },
  ],
};

// PRIVACY & SAFETY.
const PRIVACY_SAFETY: CompetencyDef = {
  skill: AI_AND_SOCIETY,
  competencyId: 'ai-competency-privacy-safety',
  competencyName: 'Privacy & safety',
  competencyDescription: 'Keep private information private and stay safe when using AI.',
  objectiveId: 'ai-objective-privacy-safety',
  objectiveName: 'Protect private information',
  objectiveDescription: 'Know what not to share with AI and when to ask a grown-up.',
  missionId: 'ai-mission-privacy-safety',
  missionTitle: 'Stay Safe with AI',
  missionDescription: 'Learn what to keep private and how to stay safe, with Nova.',
  activities: [
    {
      id: 'ai-act-privacy-share',
      type: ActivityType.SELECT,
      title: 'What should you NOT share?',
      description: 'Choose what to keep private from AI.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Which of these should you NOT type into an AI chat?',
        context: 'Keep private things private: your home address, phone number, passwords, and full name.',
        keyPoints: ['Keep private info private', 'Do not share address or passwords'],
        options: [
          'Your home address and password',
          'A question about dinosaurs',
          'A math problem',
          'A story idea about a dragon',
        ],
        correctAnswers: ['Your home address and password'],
      },
    },
    {
      id: 'ai-act-privacy-grownup',
      type: ActivityType.SELECT,
      title: 'When to ask a grown-up',
      description: 'Choose the safe action.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        question: 'An AI asks you for your address or something makes you uncomfortable. What should you do?',
        context: 'If something feels wrong or an app asks for private info, stop and tell a trusted grown-up.',
        keyPoints: ['Tell a trusted grown-up', 'Do not share private info'],
        options: [
          'Stop and tell a trusted grown-up',
          'Type your address quickly',
          'Keep it a secret',
          'Share it with everyone',
        ],
        correctAnswers: ['Stop and tell a trusted grown-up'],
      },
    },
  ],
};

// HUMAN OVERSIGHT & EVALUATION — checking AI's work.
const HUMAN_OVERSIGHT: CompetencyDef = {
  skill: AI_AND_SOCIETY,
  competencyId: 'ai-competency-human-oversight',
  competencyName: 'Human oversight & checking',
  competencyDescription: 'People should stay in charge and check AI decisions that matter.',
  objectiveId: 'ai-objective-human-oversight',
  objectiveName: 'Keep humans in charge',
  objectiveDescription: 'Know when AI should be checked by a person and how to evaluate its answer.',
  missionId: 'ai-mission-human-oversight',
  missionTitle: 'People Stay in Charge',
  missionDescription: 'Learn why people must check important AI decisions, with Nova.',
  activities: [
    {
      id: 'ai-act-oversight-who-decides',
      type: ActivityType.SELECT,
      title: 'Who should make the big decision?',
      description: 'Choose who should decide important things.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'AI suggests something important, like who wins a prize. Who should make the final decision?',
        context: 'AI can help, but for important decisions a person should check and decide. This is called human oversight.',
        keyPoints: ['A person should check', 'Humans stay in charge'],
        options: [
          'A person should check the AI and make the final decision',
          'The AI alone, no checking needed',
          'Nobody',
          'A random computer',
        ],
        correctAnswers: ['A person should check the AI and make the final decision'],
      },
    },
    {
      id: 'ai-act-oversight-evaluate-order',
      type: ActivityType.SEQUENCE,
      title: 'How to check an AI answer',
      description: 'Order the steps to check an AI answer.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        question: 'Put the steps for checking an AI answer in a sensible order.',
        context: 'Read it, ask if it makes sense, check it against a trusted source, then decide.',
        items: [
          'Check it against a trusted source',
          'Read the AI answer carefully',
          'Decide if you will use it',
          'Ask yourself: does this make sense?',
        ],
        correctOrder: [
          'Read the AI answer carefully',
          'Ask yourself: does this make sense?',
          'Check it against a trusted source',
          'Decide if you will use it',
        ],
      },
    },
  ],
};

// PROJECT — capstone CREATE.
const AI_PROJECT: CompetencyDef = {
  skill: AI_AND_SOCIETY,
  competencyId: 'ai-competency-project',
  competencyName: 'Project: be a smart AI helper',
  competencyDescription: 'Put it together: use AI wisely, safely, and fairly in a small project.',
  objectiveId: 'ai-objective-project',
  objectiveName: 'Apply AI literacy in a project',
  objectiveDescription: 'Write a short plan showing safe, fair, checked use of AI.',
  missionId: 'ai-mission-project',
  missionTitle: 'My AI Helper Plan (Project)',
  missionDescription: 'Plan how you would use AI wisely for a real task — your AI literacy project with Nova.',
  activities: [
    {
      id: 'ai-act-project-plan',
      type: ActivityType.CREATE,
      title: 'Plan your smart AI use',
      description: 'Write a short plan for using AI wisely on a task you choose.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        prompt:
          'Pick a task an AI could help you with (like ideas for a poster, or facts for a report). Write a short plan (3-4 sentences): what you would ask the AI, one private thing you would NOT share, and how you would CHECK its answer before using it.',
        context:
          'This is your AI literacy project! Show you can use AI wisely: a clear request, keeping private info private, and checking the answer.',
        rubric: [
          'A clear task and prompt',
          'One private thing you would not share',
          'How you would check the answer',
          'Shows AI is a helper, not the boss',
        ],
      },
    },
  ],
};

const COMPETENCIES: CompetencyDef[] = [
  ML_CONCEPTS,
  GENERATIVE_AI,
  PROMPTING,
  HALLUCINATIONS,
  BIAS_FAIRNESS,
  PRIVACY_SAFETY,
  HUMAN_OVERSIGHT,
  AI_PROJECT,
];

async function main() {
  console.log('Seeding AI Literacy breadth (wave 1): ML, generative AI, prompting, hallucinations, bias, privacy, oversight, project...');

  const domain = await prisma.domain.upsert({
    where: { slug: DOMAIN_SLUG },
    update: { name: 'AI Literacy' },
    create: {
      name: 'AI Literacy',
      slug: DOMAIN_SLUG,
      description: 'Understand what AI is, how it learns, and how to use it wisely.',
      icon: 'Bot',
      color: '#6366f1',
      order: 13,
    },
  });

  const world = await prisma.world.findFirst({
    where: { domain: { slug: DOMAIN_SLUG } },
    orderBy: { order: 'asc' },
  });

  let comps = 0;
  let acts = 0;

  for (const def of COMPETENCIES) {
    const skill = await prisma.skill.upsert({
      where: { slug: def.skill.slug },
      update: {},
      create: {
        domainId: domain.id,
        name: def.skill.name,
        slug: def.skill.slug,
        description: def.skill.description,
        order: def.skill.order,
      },
    });

    const competency = await prisma.competency.upsert({
      where: { id: def.competencyId },
      update: { name: def.competencyName, description: def.competencyDescription, skillId: skill.id },
      create: {
        id: def.competencyId,
        skillId: skill.id,
        name: def.competencyName,
        description: def.competencyDescription,
        order: 2,
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
      update: { worldId: world?.id ?? null, title: def.missionTitle, description: def.missionDescription },
      create: {
        id: def.missionId,
        worldId: world?.id ?? null,
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
    console.log(`  ✓ ${def.competencyName}  (skill=${def.skill.slug}, mission=${def.missionId}, activities=${def.activities.length})`);
  }

  console.log(`AI Literacy breadth wave 1 seeded: competencies=${comps}, activities=${acts}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
