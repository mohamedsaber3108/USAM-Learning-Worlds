/**
 * Career Exploration Concepts Seeding
 *
 * Seeds CareerExplorationConcept with real, age-appropriate career-awareness
 * content for learners aged 8-14, matching the pattern established in
 * seed-cross-curricular.ts (AILiteracyConcept / EntrepreneurshipConcept /
 * FinancialLiteracyConcept) and seed-digital-literacy.ts.
 *
 * Age bands (AgeBand enum): AGE_8_9, AGE_10_11, AGE_12_14
 *
 * Each entry covers a role, framed as "what they do" plus "what subjects
 * help you get there" — deliberately not prescriptive ("you must become
 * X"), just exposure to what different careers involve and how school
 * subjects connect to them.
 */

import { PrismaClient, AgeBand } from '@prisma/client';

const prisma = new PrismaClient();

const careerExplorationConcepts = [
  {
    name: 'Scientist — Asking "Why?" for a Living',
    slug: 'scientist-asking-why-for-a-living',
    description:
      "Scientists ask questions about how the world works, then design experiments to test their ideas — from studying stars to studying tiny cells. Subjects that help: Science class (obviously!), Math (for measuring and analyzing results), and Reading/Writing (for explaining what they discover to others).",
    category: 'STEM',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 1,
  },
  {
    name: 'Doctor — Helping Bodies Heal',
    slug: 'doctor-helping-bodies-heal',
    description:
      "Doctors figure out what's wrong when someone feels sick or hurt, and help them get better. Subjects that help: Science (especially biology — how the body works), Math (for calculating medicine doses), and being a good listener and communicator, since doctors talk with people all day.",
    category: 'HEALTH',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 2,
  },
  {
    name: 'Teacher — Helping Others Learn',
    slug: 'teacher-helping-others-learn',
    description:
      "Teachers help people understand new ideas and skills, from reading to rockets. Subjects that help: literally every subject, since teachers need to know their topic well — but also being patient, creative, and good at explaining things in different ways.",
    category: 'EDUCATION_SOCIAL',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 3,
  },
  {
    name: 'Artist — Making Ideas Visible',
    slug: 'artist-making-ideas-visible',
    description:
      "Artists turn ideas and feelings into things people can see, hear, or experience — paintings, animations, music, sculptures, games. Subjects that help: Art class (of course), but also Math (proportions, patterns, geometry) and Technology (for digital art and design tools).",
    category: 'CREATIVE',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 4,
  },
  {
    name: 'Firefighter/Paramedic — Helping in Emergencies',
    slug: 'firefighter-paramedic-helping-in-emergencies',
    description:
      "Firefighters and paramedics rush to help when something goes wrong — a fire, an accident, a medical emergency. Subjects that help: Physical Education (staying strong and fit), Science (understanding fire, chemicals, and the human body), and calm, quick thinking under pressure.",
    category: 'PUBLIC_SERVICE',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 5,
  },
  {
    name: 'Engineer — Building Things That Work',
    slug: 'engineer-building-things-that-work',
    description:
      "Engineers design and build things that solve real problems — bridges, apps, robots, spacecraft, clean water systems. Subjects that help: Math and Science are the foundation, but engineers also need creativity to imagine new solutions and communication skills to work in teams.",
    category: 'STEM',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 6,
  },
  {
    name: 'Entrepreneur — Turning Ideas Into Businesses',
    slug: 'entrepreneur-turning-ideas-into-businesses',
    description:
      "Entrepreneurs spot a problem and build something — a product, a service, a company — to solve it. Subjects that help: Math (budgeting, pricing), Language Arts (pitching ideas persuasively), and Social Studies (understanding people and markets). Curiosity and comfort with risk matter too.",
    category: 'BUSINESS',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 7,
  },
  {
    name: 'Software Developer — Writing Instructions for Computers',
    slug: 'software-developer-writing-instructions-for-computers',
    description:
      "Software developers write the code that makes apps, games, and websites work. Subjects that help: Math (logical thinking and problem-solving), coding practice itself, and — surprisingly — Language Arts, since clear writing helps you plan and explain code to others.",
    category: 'STEM',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 8,
  },
  {
    name: 'Journalist — Finding and Telling True Stories',
    slug: 'journalist-finding-and-telling-true-stories',
    description:
      "Journalists investigate what's happening in the world and explain it clearly and honestly to others. Subjects that help: Language Arts (writing and interviewing), Social Studies (understanding events and context), and a healthy habit of double-checking facts before sharing them.",
    category: 'MEDIA_COMMUNICATION',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 9,
  },
  {
    name: 'Environmental Scientist — Protecting the Planet',
    slug: 'environmental-scientist-protecting-the-planet',
    description:
      "Environmental scientists study air, water, soil, and wildlife to understand and protect ecosystems, and help solve problems like pollution and climate change. Subjects that help: Science (biology, chemistry, earth science), Math (data analysis), and Geography.",
    category: 'STEM',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 10,
  },
  {
    name: 'Architect — Designing Spaces People Live and Work In',
    slug: 'architect-designing-spaces-people-live-and-work-in',
    description:
      "Architects design buildings and spaces, balancing what looks good with what's safe and functional. Subjects that help: Math (geometry, measurements), Art (visual design and drawing), and Science (understanding materials and structural safety).",
    category: 'CREATIVE',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 11,
  },
  {
    name: 'Data Analyst / Data Scientist — Finding Patterns in Numbers',
    slug: 'data-analyst-data-scientist-finding-patterns-in-numbers',
    description:
      "Data analysts and data scientists look through large sets of information to find patterns that help people make better decisions — from predicting weather to recommending videos. Subjects that help: Math and Statistics are central, plus coding/technology skills and clear communication to explain findings.",
    category: 'STEM',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 12,
  },
  {
    name: 'Lawyer — Understanding and Applying Rules Fairly',
    slug: 'lawyer-understanding-and-applying-rules-fairly',
    description:
      "Lawyers help people understand and navigate laws, and argue on their behalf when there's a disagreement. Subjects that help: Language Arts (careful reading and persuasive writing), Social Studies (how societies and governments work), and strong logical reasoning.",
    category: 'LAW_PUBLIC_SERVICE',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 13,
  },
];

async function main() {
  console.log('Seeding CareerExplorationConcept...');
  for (const concept of careerExplorationConcepts) {
    await prisma.careerExplorationConcept.upsert({
      where: { slug: concept.slug },
      update: concept,
      create: concept,
    });
  }
  console.log(`Seeded ${careerExplorationConcepts.length} CareerExplorationConcept rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
