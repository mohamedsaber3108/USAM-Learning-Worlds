/**
 * Project & Rubric Engine Seeding
 *
 * Seeds:
 *  - Project templates (as real Project rows owned by the test learner,
 *    state DRAFT/PLANNING so they act as ready-to-clone templates and are
 *    visible via GET /projects/my and GET /projects/:id) with a full
 *    Idea -> Plan -> Build -> Test -> Present ProjectMilestone lifecycle.
 *  - Rubric templates (entityType 'PROJECT', entityId pointing at the
 *    matching Project) with 3-5 RubricCriterion rows each, using the
 *    levels Json field to hold real 4-band scoring descriptors
 *    (Beginning / Developing / Proficient / Exemplary).
 *
 * Run with: npx ts-node prisma/seeds/seed-projects-rubrics.ts
 * (from backend/ — matches the project's existing seed pattern, see
 * prisma/seeds/seed-coding-concepts.ts)
 *
 * Verified live on kids.usamif.com: seeded 10 Projects / 50 ProjectMilestones /
 * 8 Rubrics / 30 RubricCriterion rows, and confirmed via authenticated
 * GET /api/projects/my and GET /api/projects/:id (200, real seeded titles
 * returned). (parallel-agent-4)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Standard 5-stage pedagogy used across the platform's project lifecycle
const MILESTONE_STAGES = ['Idea', 'Plan', 'Build', 'Test', 'Present'] as const;

interface MilestoneSeed {
  title: string;
  description: string;
}

interface ProjectSeed {
  title: string;
  description: string;
  domain: string;
  ageBand: string;
  skills: string[];
  milestones: MilestoneSeed[];
}

interface CriterionSeed {
  name: string;
  description: string;
  levels: {
    beginning: string;
    developing: string;
    proficient: string;
    exemplary: string;
  };
}

interface RubricSeed {
  title: string;
  appliesToProjectTitle: string; // links rubric to a project template by title
  criteria: CriterionSeed[];
}

// ---------------------------------------------------------------------------
// 1. PROJECT TEMPLATES (10 projects, spanning coding, design, data, science,
//    writing, entrepreneurship, across ages 8-14)
// ---------------------------------------------------------------------------

const projects: ProjectSeed[] = [
  {
    title: 'Build a Simple Weather App',
    description:
      'Design and build a small app or web page that shows today\'s weather for a chosen city using a free weather API, including temperature, conditions, and a simple icon.',
    domain: 'Coding',
    ageBand: 'AGE_10_11',
    skills: ['coding', 'apis', 'html-css', 'problem-solving'],
    milestones: [
      { title: 'Idea', description: 'Pick a city or list of cities, decide what weather info matters most to your users, and sketch what the screen will look like.' },
      { title: 'Plan', description: 'List the steps: find a weather API, figure out what data it returns, and outline the page layout (input box, display area, icon).' },
      { title: 'Build', description: 'Write the code to fetch weather data and display temperature, conditions, and an icon on the page.' },
      { title: 'Test', description: 'Try at least 3 different cities and one that doesn\'t exist. Fix any errors or broken layouts you find.' },
      { title: 'Present', description: 'Demo the app live to a partner or the class, explaining how the API call works and what you\'d add next.' },
    ],
  },
  {
    title: 'Design a Recycling Awareness Poster',
    description:
      'Create a poster (digital or hand-drawn) that teaches your school or neighborhood about one recycling topic, such as sorting plastics or reducing food waste.',
    domain: 'Arts',
    ageBand: 'AGE_8_9',
    skills: ['visual-design', 'research', 'persuasive-writing', 'sustainability'],
    milestones: [
      { title: 'Idea', description: 'Choose one recycling topic and one clear message you want people to remember.' },
      { title: 'Plan', description: 'Research 3 real facts about your topic and sketch a rough layout with headline, image, and facts.' },
      { title: 'Build', description: 'Create the final poster with your headline, image(s), and facts, using colors that grab attention.' },
      { title: 'Test', description: 'Show the poster to two people who haven\'t seen it and ask what message they took away — does it match your goal?' },
      { title: 'Present', description: 'Display or present the poster and explain the facts and design choices you made.' },
    ],
  },
  {
    title: 'Create a Budget Tracker Spreadsheet',
    description:
      'Build a spreadsheet that tracks a monthly allowance or a small savings goal, with categories for income, spending, and savings, plus a simple chart.',
    domain: 'Financial Literacy',
    ageBand: 'AGE_12_14',
    skills: ['spreadsheets', 'financial-literacy', 'data-analysis', 'formulas'],
    milestones: [
      { title: 'Idea', description: 'Decide on a real savings goal or allowance scenario and the spending categories you\'ll track (e.g. snacks, games, savings).' },
      { title: 'Plan', description: 'Sketch the spreadsheet columns and rows, and decide which formulas you\'ll need (SUM, totals, running balance).' },
      { title: 'Build', description: 'Build the spreadsheet with headers, formulas for totals and remaining balance, and at least one chart.' },
      { title: 'Test', description: 'Enter at least two weeks of sample transactions and check the totals update correctly. Fix any formula errors.' },
      { title: 'Present', description: 'Explain your budget plan and chart to a partner: what worked, what you\'d change next month.' },
    ],
  },
  {
    title: 'Program a Rock-Paper-Scissors Game',
    description:
      'Write a program (block-based or text-based) that lets a player compete against the computer in Rock-Paper-Scissors, keeping score across rounds.',
    domain: 'Coding',
    ageBand: 'AGE_8_9',
    skills: ['coding', 'conditionals', 'randomness', 'logic'],
    milestones: [
      { title: 'Idea', description: 'Decide the game rules and how many rounds a match should last, and how the winner is decided.' },
      { title: 'Plan', description: 'Break the game into steps: get player choice, generate computer choice, compare them, and update the score.' },
      { title: 'Build', description: 'Write the code for choices, comparison logic, and score tracking across rounds.' },
      { title: 'Test', description: 'Play at least 10 rounds and check ties, wins, and losses are all scored correctly.' },
      { title: 'Present', description: 'Challenge a classmate to play your game and explain how the computer "decides" its move.' },
    ],
  },
  {
    title: 'Design a Mini Ecosystem Diagram',
    description:
      'Research a real habitat (pond, desert, rainforest, etc.) and design a labeled diagram showing producers, consumers, decomposers, and energy flow.',
    domain: 'Science',
    ageBand: 'AGE_10_11',
    skills: ['research', 'biology', 'diagramming', 'systems-thinking'],
    milestones: [
      { title: 'Idea', description: 'Choose a habitat and list at least 5 organisms that live there.' },
      { title: 'Plan', description: 'Research the role of each organism (producer, consumer, decomposer) and sketch how energy flows between them.' },
      { title: 'Build', description: 'Create the final diagram with labeled organisms, arrows for energy flow, and a short caption for each role.' },
      { title: 'Test', description: 'Ask a partner to trace the energy flow using only your diagram — fix anything that confused them.' },
      { title: 'Present', description: 'Explain your ecosystem and what would happen if one organism disappeared.' },
    ],
  },
  {
    title: 'Pitch a Small Business Idea',
    description:
      'Develop a simple business idea (a product or service for your school/neighborhood), including cost, price, target customer, and a short pitch.',
    domain: 'Entrepreneurship',
    ageBand: 'AGE_12_14',
    skills: ['entrepreneurship', 'financial-literacy', 'public-speaking', 'market-research'],
    milestones: [
      { title: 'Idea', description: 'Brainstorm 3 problems people around you face and pick one product/service idea that solves one of them.' },
      { title: 'Plan', description: 'Estimate costs to make/run it, decide a fair price, and identify who your customers are.' },
      { title: 'Build', description: 'Create pitch materials: a one-page plan, a simple prototype or mockup, and pricing/cost numbers.' },
      { title: 'Test', description: 'Pitch to 2-3 people outside your team and collect their questions and feedback.' },
      { title: 'Present', description: 'Deliver a 2-minute pitch to the class or family, covering the problem, solution, and numbers.' },
    ],
  },
  {
    title: 'Write and Illustrate a Short Story',
    description:
      'Write an original short story (5-10 pages) with a clear beginning, middle, and end, and illustrate at least 3 key scenes.',
    domain: 'Language',
    ageBand: 'AGE_8_9',
    skills: ['creative-writing', 'illustration', 'storytelling', 'editing'],
    milestones: [
      { title: 'Idea', description: 'Choose your main character, setting, and the problem they need to solve.' },
      { title: 'Plan', description: 'Outline the story in 3 parts (beginning, middle, end) and pick 3 scenes worth illustrating.' },
      { title: 'Build', description: 'Write the full draft and create illustrations for your chosen scenes.' },
      { title: 'Test', description: 'Read your story aloud to someone and ask what part was confusing or what they liked most.' },
      { title: 'Present', description: 'Share the finished, illustrated story and explain why you chose that ending.' },
    ],
  },
  {
    title: 'Build a Personal Portfolio Website',
    description:
      'Create a simple multi-section webpage (About Me, My Projects, Contact) using HTML and CSS to showcase your work.',
    domain: 'Technology',
    ageBand: 'AGE_12_14',
    skills: ['html-css', 'web-design', 'digital-literacy', 'self-expression'],
    milestones: [
      { title: 'Idea', description: 'Decide what sections your site needs and what you want visitors to know about you.' },
      { title: 'Plan', description: 'Sketch a simple wireframe of each section and choose a color scheme and fonts.' },
      { title: 'Build', description: 'Write the HTML structure and CSS styling for all sections.' },
      { title: 'Test', description: 'View the site on a phone-sized and computer-sized screen and fix any layout problems.' },
      { title: 'Present', description: 'Walk a partner through your site and explain one thing you\'re proud of.' },
    ],
  },
  {
    title: 'Run a Simple Science Experiment & Report',
    description:
      'Design and run a fair test (e.g. does salt water freeze slower than fresh water?), record data, and write up the results with a conclusion.',
    domain: 'Science',
    ageBand: 'AGE_10_11',
    skills: ['scientific-method', 'data-collection', 'reporting', 'critical-thinking'],
    milestones: [
      { title: 'Idea', description: 'Write a testable question and a hypothesis (your best guess at the answer).' },
      { title: 'Plan', description: 'Design a fair test: what you\'ll change, what you\'ll keep the same, and how you\'ll measure results.' },
      { title: 'Build', description: 'Run the experiment and record your data in a simple table.' },
      { title: 'Test', description: 'Repeat the experiment at least once more to check your results are consistent.' },
      { title: 'Present', description: 'Write a short report with your question, method, data table, and conclusion — was your hypothesis right?' },
    ],
  },
  {
    title: 'Compose a 30-Second Jingle',
    description:
      'Write and record (or notate) an original 30-second jingle for an imaginary product or your own project, including a simple melody and lyrics.',
    domain: 'Music',
    ageBand: 'AGE_8_9',
    skills: ['music-composition', 'rhythm', 'lyric-writing', 'performance'],
    milestones: [
      { title: 'Idea', description: 'Pick the product or project your jingle will advertise and one feeling you want it to give listeners.' },
      { title: 'Plan', description: 'Write a simple 4-line lyric and choose a tempo/mood (fast and fun, slow and calm, etc.).' },
      { title: 'Build', description: 'Create the melody (humming, an instrument, or an app) and match it to your lyrics.' },
      { title: 'Test', description: 'Perform it for someone and check they can remember or hum it back after one listen.' },
      { title: 'Present', description: 'Perform or play your recorded jingle and explain the choices behind the melody and words.' },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. RUBRIC TEMPLATES (8 rubrics, each 3-5 criteria with real 4-band
//    descriptors in the `levels` Json field)
// ---------------------------------------------------------------------------

const rubrics: RubricSeed[] = [
  {
    title: 'Coding Project Rubric',
    appliesToProjectTitle: 'Build a Simple Weather App',
    criteria: [
      {
        name: 'Correctness',
        description: 'Does the program run without errors and produce the expected output?',
        levels: {
          beginning: 'Program does not run, or output is unrelated to the task.',
          developing: 'Program runs but produces incorrect or incomplete output for some cases.',
          proficient: 'Program runs and produces correct output for all typical cases.',
          exemplary: 'Program runs correctly for typical cases and also handles edge cases (bad input, empty data) gracefully.',
        },
      },
      {
        name: 'Code Clarity',
        description: 'Is the code organized, readable, and sensibly named?',
        levels: {
          beginning: 'Code is disorganized, with unclear or missing variable names and no structure.',
          developing: 'Code is somewhat organized but has inconsistent naming or minimal comments.',
          proficient: 'Code is well organized into logical steps/functions with clear variable names.',
          exemplary: 'Code is cleanly structured, clearly named, and includes helpful comments explaining key logic.',
        },
      },
      {
        name: 'Creativity',
        description: 'Does the project go beyond the minimum requirement with an original idea or feature?',
        levels: {
          beginning: 'Meets none of the requirements beyond copying an example.',
          developing: 'Meets the basic requirements with little personalization.',
          proficient: 'Adds at least one original touch (feature, design choice, or twist on the idea).',
          exemplary: 'Adds multiple original features or a genuinely novel approach that clearly reflects the learner\'s own idea.',
        },
      },
      {
        name: 'Problem-Solving',
        description: 'How did the learner handle bugs, blockers, or unexpected results during building?',
        levels: {
          beginning: 'Gave up on errors or asked for the answer without attempting to debug.',
          developing: 'Attempted to fix errors but needed significant help to resolve them.',
          proficient: 'Identified and fixed most errors independently using logical debugging steps.',
          exemplary: 'Independently diagnosed and fixed all errors, and can explain the cause of each bug clearly.',
        },
      },
    ],
  },
  {
    title: 'Visual Design & Poster Rubric',
    appliesToProjectTitle: 'Design a Recycling Awareness Poster',
    criteria: [
      {
        name: 'Message Clarity',
        description: 'Is the main message immediately understandable?',
        levels: {
          beginning: 'No clear message; viewer cannot tell what the poster is about.',
          developing: 'Message is present but requires effort or explanation to understand.',
          proficient: 'Message is clear within a few seconds of viewing.',
          exemplary: 'Message is instantly clear and memorable, sticking with the viewer after they look away.',
        },
      },
      {
        name: 'Use of Facts/Evidence',
        description: 'Are real, accurate facts used to support the message?',
        levels: {
          beginning: 'No facts included, or facts are inaccurate.',
          developing: 'One fact included, correct but not well explained.',
          proficient: 'At least two accurate, relevant facts are included and explained.',
          exemplary: 'Three or more accurate facts are woven naturally into a persuasive, well-explained argument.',
        },
      },
      {
        name: 'Visual Design',
        description: 'Are color, layout, and imagery used effectively to grab attention?',
        levels: {
          beginning: 'Cluttered or blank layout; colors clash or are absent.',
          developing: 'Basic layout with some use of color, but composition feels unplanned.',
          proficient: 'Balanced layout with intentional color choices that support the message.',
          exemplary: 'Layout, color, and imagery work together intentionally to guide the eye and reinforce the message.',
        },
      },
      {
        name: 'Craftsmanship',
        description: 'Is the final piece neat, complete, and carefully finished?',
        levels: {
          beginning: 'Unfinished, sloppy, or missing key elements.',
          developing: 'Mostly complete but with visible rough edges or errors.',
          proficient: 'Complete and neatly finished with no glaring errors.',
          exemplary: 'Polished, complete, and shows evidence of revision (e.g. redrawn elements, corrected spelling).',
        },
      },
    ],
  },
  {
    title: 'Data & Spreadsheet Rubric',
    appliesToProjectTitle: 'Create a Budget Tracker Spreadsheet',
    criteria: [
      {
        name: 'Formula Accuracy',
        description: 'Do the spreadsheet formulas calculate totals and balances correctly?',
        levels: {
          beginning: 'No formulas used, or all formulas produce incorrect results.',
          developing: 'Some formulas are correct but totals are inconsistent or manually re-typed.',
          proficient: 'All key formulas (totals, balance) calculate correctly and update automatically.',
          exemplary: 'All formulas are correct, automatically update, and use efficient functions (e.g. SUM ranges) rather than manual addition.',
        },
      },
      {
        name: 'Organization',
        description: 'Are categories, headers, and rows organized logically?',
        levels: {
          beginning: 'No clear headers or categories; data is scattered.',
          developing: 'Headers exist but categories overlap or are inconsistent.',
          proficient: 'Clear headers and consistent categories that make the data easy to follow.',
          exemplary: 'Clear, consistent organization plus thoughtful extras like color-coding or a summary section.',
        },
      },
      {
        name: 'Data Visualization',
        description: 'Does the chart clearly represent the underlying data?',
        levels: {
          beginning: 'No chart included, or chart does not match the data.',
          developing: 'Chart is included but is the wrong type or missing labels.',
          proficient: 'Chart accurately represents the data with clear labels and a title.',
          exemplary: 'Chart is well-chosen for the data, clearly labeled, and makes a trend or insight obvious at a glance.',
        },
      },
      {
        name: 'Real-World Reasoning',
        description: 'Can the learner explain what the numbers mean and what they would do differently?',
        levels: {
          beginning: 'Cannot explain what the totals or balance mean.',
          developing: 'Explains the numbers with prompting but draws no conclusions.',
          proficient: 'Explains what the numbers show and identifies one change for next month.',
          exemplary: 'Clearly explains trends in the data and proposes specific, reasoned changes to spending or saving.',
        },
      },
    ],
  },
  {
    title: 'Game Logic Rubric',
    appliesToProjectTitle: 'Program a Rock-Paper-Scissors Game',
    criteria: [
      {
        name: 'Correctness',
        description: 'Does the game correctly determine winners for every possible combination?',
        levels: {
          beginning: 'Game frequently declares the wrong winner or crashes.',
          developing: 'Game is correct for some combinations but wrong for others (e.g. ties not handled).',
          proficient: 'Game correctly determines the winner for all 9 possible combinations.',
          exemplary: 'Game correctly handles all combinations, ties, and invalid input without crashing.',
        },
      },
      {
        name: 'Use of Logic/Conditionals',
        description: 'Are conditionals used efficiently rather than repeated by brute force?',
        levels: {
          beginning: 'No conditionals used, or logic is copy-pasted without understanding.',
          developing: 'Conditionals are used but with unnecessary repetition or a confusing structure.',
          proficient: 'Conditionals are used efficiently to cover all cases clearly.',
          exemplary: 'Logic is efficient, easy to follow, and could be easily extended (e.g. to add a new choice).',
        },
      },
      {
        name: 'Score Tracking',
        description: 'Does the game correctly track and display the score across multiple rounds?',
        levels: {
          beginning: 'No score tracking, or score resets/loses accuracy between rounds.',
          developing: 'Score tracking works most of the time but has occasional errors.',
          proficient: 'Score is tracked accurately across all rounds and displayed clearly.',
          exemplary: 'Score tracking is accurate and includes extra polish, like a running match summary or win streak.',
        },
      },
    ],
  },
  {
    title: 'Science Diagram & Report Rubric',
    appliesToProjectTitle: 'Design a Mini Ecosystem Diagram',
    criteria: [
      {
        name: 'Scientific Accuracy',
        description: 'Are the organisms, roles, and energy flow shown correctly?',
        levels: {
          beginning: 'Roles (producer/consumer/decomposer) are missing or mostly incorrect.',
          developing: 'Some roles are correct but energy flow direction or key relationships are wrong.',
          proficient: 'Roles and energy flow are accurately shown for all organisms included.',
          exemplary: 'Roles and energy flow are accurate and include a correct explanation of what happens if a species is removed.',
        },
      },
      {
        name: 'Diagram Clarity',
        description: 'Is the diagram easy to read and follow?',
        levels: {
          beginning: 'Diagram is cluttered or missing labels, hard to interpret.',
          developing: 'Diagram has labels but arrows or connections are unclear.',
          proficient: 'Diagram is clearly labeled with easy-to-follow arrows showing energy flow.',
          exemplary: 'Diagram is clean, clearly labeled, and visually communicates the ecosystem at a glance.',
        },
      },
      {
        name: 'Use of Research',
        description: 'Is the diagram backed by accurate research about the chosen habitat?',
        levels: {
          beginning: 'No evidence of research; organisms/roles appear guessed.',
          developing: 'Some research evident but with factual gaps.',
          proficient: 'Diagram reflects solid research with accurate organism roles and facts.',
          exemplary: 'Diagram reflects thorough research, including a fact beyond common knowledge about the habitat.',
        },
      },
    ],
  },
  {
    title: 'Entrepreneurship Pitch Rubric',
    appliesToProjectTitle: 'Pitch a Small Business Idea',
    criteria: [
      {
        name: 'Problem-Solution Fit',
        description: 'Does the idea solve a real, clearly stated problem?',
        levels: {
          beginning: 'No clear problem identified, or solution does not address it.',
          developing: 'Problem is identified but the solution only partially addresses it.',
          proficient: 'Problem is clear and the solution directly and sensibly addresses it.',
          exemplary: 'Problem and solution are clearly connected, with evidence the learner checked the problem is real (asked others, observed it).',
        },
      },
      {
        name: 'Financial Reasoning',
        description: 'Are costs and pricing realistic and clearly explained?',
        levels: {
          beginning: 'No cost or pricing numbers given.',
          developing: 'Numbers are given but are unrealistic or unexplained.',
          proficient: 'Costs and price are realistic and briefly explained (e.g. covers costs, leaves some profit).',
          exemplary: 'Costs, price, and expected profit are realistic, clearly explained, and show basic understanding of profit margin.',
        },
      },
      {
        name: 'Pitch Delivery',
        description: 'Is the pitch clear, confident, and within time?',
        levels: {
          beginning: 'Pitch is unclear, far too short/long, or reads directly off notes with no eye contact.',
          developing: 'Pitch covers the idea but is disorganized or heavily reliant on notes.',
          proficient: 'Pitch is clear, organized, and delivered with reasonable confidence within the time limit.',
          exemplary: 'Pitch is clear, confident, well-timed, and engages the audience (asks a question, uses a prop, etc.).',
        },
      },
      {
        name: 'Feedback Response',
        description: 'How well did the learner gather and respond to feedback?',
        levels: {
          beginning: 'Did not seek feedback or ignored it entirely.',
          developing: 'Gathered feedback but made no changes based on it.',
          proficient: 'Gathered feedback from at least 2 people and made at least one improvement.',
          exemplary: 'Actively sought feedback, clearly explains what changed because of it and why.',
        },
      },
    ],
  },
  {
    title: 'Creative Writing Rubric',
    appliesToProjectTitle: 'Write and Illustrate a Short Story',
    criteria: [
      {
        name: 'Story Structure',
        description: 'Does the story have a clear beginning, middle, and end?',
        levels: {
          beginning: 'Story is fragmented; missing a clear beginning, middle, or end.',
          developing: 'Story has all three parts but pacing feels uneven or rushed.',
          proficient: 'Story has a clear, well-paced beginning, middle, and end.',
          exemplary: 'Story structure is clear and paced well, with a satisfying resolution that ties back to the opening.',
        },
      },
      {
        name: 'Character Development',
        description: 'Does the main character feel believable and change or grow?',
        levels: {
          beginning: 'Character is undeveloped; no clear traits or growth.',
          developing: 'Character has basic traits but does not change over the story.',
          proficient: 'Character has clear traits and grows or changes by the end.',
          exemplary: 'Character is vivid and believable, with growth that feels earned by events in the story.',
        },
      },
      {
        name: 'Language & Mechanics',
        description: 'Is the writing free of major grammar/spelling errors and descriptive?',
        levels: {
          beginning: 'Frequent errors that make the story hard to read.',
          developing: 'Some errors present but story is still readable.',
          proficient: 'Few errors; writing includes some descriptive language.',
          exemplary: 'Virtually error-free, with vivid descriptive language that brings scenes to life.',
        },
      },
      {
        name: 'Illustrations',
        description: 'Do the illustrations support and enhance the story\'s key scenes?',
        levels: {
          beginning: 'No illustrations, or illustrations unrelated to the story.',
          developing: 'Illustrations included but do not clearly match the scenes described.',
          proficient: 'Illustrations clearly match and support at least 3 key scenes.',
          exemplary: 'Illustrations enhance the story, adding mood or detail beyond what the text alone describes.',
        },
      },
    ],
  },
  {
    title: 'Web Design Rubric',
    appliesToProjectTitle: 'Build a Personal Portfolio Website',
    criteria: [
      {
        name: 'Structure & Semantics',
        description: 'Is the HTML organized using appropriate sections and tags?',
        levels: {
          beginning: 'No clear structure; content is a single unorganized block.',
          developing: 'Some structure present but sections are inconsistent or misused.',
          proficient: 'Clear sections (About, Projects, Contact) using appropriate HTML tags.',
          exemplary: 'Clear, semantic structure with well-organized sections that would make sense to another developer reading the code.',
        },
      },
      {
        name: 'Styling & Layout',
        description: 'Is CSS used effectively to create a clean, readable layout?',
        levels: {
          beginning: 'No styling applied, or styling makes the page harder to read.',
          developing: 'Basic styling applied but layout feels inconsistent or cluttered.',
          proficient: 'Consistent styling with a clean, readable layout across sections.',
          exemplary: 'Polished, consistent styling with thoughtful spacing, color, and typography choices.',
        },
      },
      {
        name: 'Responsiveness',
        description: 'Does the site remain usable on both small and large screens?',
        levels: {
          beginning: 'Site breaks or is unusable on a phone-sized screen.',
          developing: 'Site is usable on both sizes but with visible layout issues.',
          proficient: 'Site adapts cleanly to both phone-sized and computer-sized screens.',
          exemplary: 'Site adapts smoothly with no visible issues, plus extra care (touch-friendly buttons, readable text at all sizes).',
        },
      },
      {
        name: 'Content Quality',
        description: 'Does the content clearly represent the learner and their work?',
        levels: {
          beginning: 'Content is placeholder text or missing key information.',
          developing: 'Content is present but generic or missing personal detail.',
          proficient: 'Content clearly and specifically describes the learner and at least one real project.',
          exemplary: 'Content is specific, personal, and effectively showcases the learner\'s work and personality.',
        },
      },
    ],
  },
];

async function seedProjectsAndRubrics() {
  console.log('🌱 Seeding project templates and rubrics...\n');

  // Find (or fall back to first available) learner to own template projects.
  let learner = await prisma.learner.findUnique({
    where: { displayName: 'AlexTheExplorer' },
  });

  if (!learner) {
    learner = await prisma.learner.findFirst();
  }

  if (!learner) {
    throw new Error(
      'No learner found in the database. Run the base prisma/seed.ts first to create the test learner.',
    );
  }

  console.log(`👤 Using learner: ${learner.displayName} (${learner.id})\n`);

  const projectIdByTitle: Record<string, string> = {};

  let projectsCreated = 0;
  let milestonesCreated = 0;

  for (const p of projects) {
    const existing = await prisma.project.findFirst({
      where: { learnerId: learner.id, title: p.title },
    });

    let project;
    if (existing) {
      project = existing;
      console.log(`↺  Project already exists, reusing: ${p.title}`);
    } else {
      project = await prisma.project.create({
        data: {
          learnerId: learner.id,
          title: p.title,
          description: p.description,
          state: 'PLANNING',
          visibility: 'PUBLIC',
          skills: p.skills,
        },
      });
      projectsCreated++;
      console.log(`✅ Project: ${p.title} [${p.domain}, ${p.ageBand}]`);
    }

    projectIdByTitle[p.title] = project.id;

    // Ensure milestones (Idea -> Plan -> Build -> Test -> Present)
    const existingMilestones = await prisma.projectMilestone.count({
      where: { projectId: project.id },
    });

    if (existingMilestones === 0) {
      for (let i = 0; i < p.milestones.length; i++) {
        const m = p.milestones[i];
        await prisma.projectMilestone.create({
          data: {
            projectId: project.id,
            title: m.title,
            description: m.description,
            status: i === 0 ? 'IN_PROGRESS' : 'PENDING',
            order: i,
          },
        });
        milestonesCreated++;
      }
      console.log(`   📋 Added ${p.milestones.length} milestones (${MILESTONE_STAGES.join(' -> ')})`);
    } else {
      console.log(`   ↺  Milestones already exist (${existingMilestones}), skipping`);
    }
  }

  console.log(`\n📊 Projects created: ${projectsCreated}, Milestones created: ${milestonesCreated}\n`);

  let rubricsCreated = 0;
  let criteriaCreated = 0;

  for (const r of rubrics) {
    const entityId = projectIdByTitle[r.appliesToProjectTitle];
    if (!entityId) {
      console.warn(`⚠️  Skipping rubric "${r.title}" — no matching project "${r.appliesToProjectTitle}"`);
      continue;
    }

    const existingRubric = await prisma.rubric.findFirst({
      where: { title: r.title, entityType: 'PROJECT', entityId },
    });

    let rubric;
    if (existingRubric) {
      rubric = existingRubric;
      console.log(`↺  Rubric already exists, reusing: ${r.title}`);
    } else {
      rubric = await prisma.rubric.create({
        data: {
          entityType: 'PROJECT',
          entityId,
          title: r.title,
        },
      });
      rubricsCreated++;
      console.log(`✅ Rubric: ${r.title} (for "${r.appliesToProjectTitle}")`);
    }

    const existingCriteria = await prisma.rubricCriterion.count({
      where: { rubricId: rubric.id },
    });

    if (existingCriteria === 0) {
      for (let i = 0; i < r.criteria.length; i++) {
        const c = r.criteria[i];
        await prisma.rubricCriterion.create({
          data: {
            rubricId: rubric.id,
            name: c.name,
            description: c.description,
            order: i,
            levels: c.levels,
          },
        });
        criteriaCreated++;
      }
      console.log(`   🧩 Added ${r.criteria.length} criteria`);
    } else {
      console.log(`   ↺  Criteria already exist (${existingCriteria}), skipping`);
    }
  }

  console.log(`\n📊 Rubrics created: ${rubricsCreated}, Criteria created: ${criteriaCreated}\n`);

  console.log('🎉 Project & Rubric seeding complete!\n');
  console.log('Summary:');
  console.log(`   Project templates: ${projects.length}`);
  console.log(`   Rubric templates:  ${rubrics.length}`);
}

seedProjectsAndRubrics()
  .catch((e) => {
    console.error('❌ Project/Rubric seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
