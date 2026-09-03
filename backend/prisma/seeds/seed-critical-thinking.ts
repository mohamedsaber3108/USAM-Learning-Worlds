/**
 * Critical Thinking Concepts Seeding
 *
 * Seeds CriticalThinkingConcept with real, age-appropriate critical-thinking
 * content for learners aged 8-14, matching the pattern established in
 * seed-career-exploration.ts / seed-digital-literacy.ts.
 *
 * Age bands (AgeBand enum): AGE_8_9, AGE_10_11, AGE_12_14
 *
 * Each entry teaches one concrete critical-thinking skill — spotting bias,
 * evaluating evidence, distinguishing fact from opinion, recognizing common
 * logical fallacies, questioning sources, telling cause apart from
 * correlation, etc. — framed with everyday examples kids actually run into
 * (ads, group chats, homework arguments, social media), not abstract logic
 * theory.
 */

import { PrismaClient, AgeBand } from '@prisma/client';

const prisma = new PrismaClient();

const criticalThinkingConcepts = [
  {
    name: 'Fact vs. Opinion — Two Different Kinds of Statements',
    slug: 'fact-vs-opinion-two-different-kinds-of-statements',
    description:
      'A fact is something that can be checked and proven true or false (\"Water boils at 100°C\"). An opinion is someone\'s personal view or preference (\"Pizza is the best food\"). Mixing the two up is one of the most common ways people get confused or misled. Try this: when you hear a claim, ask \"Could I check this with evidence?\" If yes, it\'s a fact claim. If it\'s about taste, feelings, or values, it\'s an opinion.',
    category: 'REASONING_BASICS',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 1,
  },
  {
    name: 'What Counts as Evidence?',
    slug: 'what-counts-as-evidence',
    description:
      'Evidence is information that supports or challenges a claim — like data, eyewitness observation, expert testing, or documented results. Not all "proof" people offer is actually evidence: "My friend said so" or "I just feel like it\'s true" are weaker than "Three separate studies measured this" or "I watched it happen myself." Before believing a claim, ask: what\'s the evidence, and how strong is it?',
    category: 'EVIDENCE_EVALUATION',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 2,
  },
  {
    name: 'Questioning Where Information Comes From',
    slug: 'questioning-where-information-comes-from',
    description:
      'Before trusting a claim, it helps to ask: Who is telling me this? Do they know what they\'re talking about? Do they benefit from me believing it? A stranger\'s post, a company\'s ad, a scientist\'s research paper, and a rumor from a classmate are not equally trustworthy sources — even if they sound equally confident. Checking the source is often faster than checking every fact.',
    category: 'SOURCE_EVALUATION',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 3,
  },
  {
    name: 'Spotting Bias — Everyone Sees Things From Somewhere',
    slug: 'spotting-bias-everyone-sees-things-from-somewhere',
    description:
      'Bias means a source leans toward a certain view because of their beliefs, feelings, or what they want you to think — not necessarily lying, just seeing things from one angle. A toy company\'s ad will only show the fun parts of a toy. A person retelling an argument will usually make themselves look more reasonable. Noticing bias doesn\'t mean ignoring the source — it means reading it a little more carefully.',
    category: 'BIAS_AWARENESS',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 4,
  },
  {
    name: 'Ads Want Something From You',
    slug: 'ads-want-something-from-you',
    description:
      'Advertisements are designed to make you want to buy, click, or believe something — that\'s their whole job, so they naturally highlight the best possible version of a product and hide the downsides. Phrases like "the BEST ever," "everyone loves it," or dramatic background music are persuasion techniques, not proof of quality. Ask: what is this ad trying to get me to do, and does it show me the full picture?',
    category: 'MEDIA_LITERACY',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 5,
  },
  {
    name: 'Cause vs. Correlation — Just Because Two Things Happen Together',
    slug: 'cause-vs-correlation-just-because-two-things-happen-together',
    description:
      'Correlation means two things happen around the same time or seem connected. Causation means one thing actually makes the other happen. Ice cream sales and drownings both go up in summer — but ice cream doesn\'t cause drowning; hot weather causes both. Before saying "X caused Y," ask: is there a third reason both things might be happening, or real proof that X leads to Y?',
    category: 'REASONING_BASICS',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 6,
  },
  {
    name: 'The Bandwagon Trap — "Everyone\'s Doing It" Isn\'t Proof',
    slug: 'the-bandwagon-trap-everyones-doing-it-isnt-proof',
    description:
      'The bandwagon fallacy says something must be true or good just because lots of people believe or do it. But popularity doesn\'t equal correctness — plenty of widely-believed things throughout history turned out to be wrong. When you catch yourself thinking "everyone says so, so it must be true," pause and ask what the actual evidence is, separate from how many people agree.',
    category: 'LOGICAL_FALLACIES',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 7,
  },
  {
    name: 'Attacking the Person Instead of the Argument',
    slug: 'attacking-the-person-instead-of-the-argument',
    description:
      'This is called an "ad hominem" — Latin for "against the person." It happens when someone dismisses an idea by insulting or dismissing the person who said it, instead of actually responding to their point ("Why would I listen to you, you\'re not even good at math!"). A person can be annoying, wrong about other things, or someone you dislike, and still make a true point. Judge the argument, not just the arguer.',
    category: 'LOGICAL_FALLACIES',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 8,
  },
  {
    name: 'False Either-Or — The World Usually Has More Than Two Options',
    slug: 'false-either-or-the-world-usually-has-more-than-two-options',
    description:
      'The false dilemma (or "either-or") trap presents a situation as having only two possible choices when really there are more: "Either you agree with me completely, or you don\'t care at all." Real situations are usually more complicated than two extremes. When someone frames a choice as only two options, ask: is there a middle ground, or another option they left out?',
    category: 'LOGICAL_FALLACIES',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 9,
  },
  {
    name: 'Anecdotes Aren\'t Data — One Story Isn\'t the Whole Picture',
    slug: 'anecdotes-arent-data-one-story-isnt-the-whole-picture',
    description:
      'An anecdote is a single personal story ("My cousin ate that and felt sick, so it must be unsafe for everyone"). Anecdotes feel very convincing because they\'re vivid and personal, but one example doesn\'t tell you what usually happens — it could be a coincidence, or true for that person but not most people. Solid conclusions usually need many examples or careful testing, not just one story.',
    category: 'EVIDENCE_EVALUATION',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 10,
  },
  {
    name: 'Confirmation Bias — Why We Notice What We Already Believe',
    slug: 'confirmation-bias-why-we-notice-what-we-already-believe',
    description:
      'Confirmation bias is the tendency to notice, remember, and search for information that agrees with what you already believe, while overlooking evidence that disagrees. If you think a certain sports team is unlucky, you\'ll remember every close loss and forget the wins. Good critical thinkers deliberately look for evidence that might prove them wrong, not just evidence that proves them right.',
    category: 'BIAS_AWARENESS',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 11,
  },
  {
    name: 'The Slippery Slope — Assuming One Small Step Leads to Disaster',
    slug: 'the-slippery-slope-assuming-one-small-step-leads-to-disaster',
    description:
      'A slippery slope argument claims that one small action will inevitably trigger a chain of increasingly extreme, often unlikely, consequences ("If we let students retake one quiz, soon nobody will study at all and grades will mean nothing"). The middle steps are usually unproven. When you hear a dramatic chain-reaction prediction, ask: is each step in that chain actually likely, or just possible in theory?',
    category: 'LOGICAL_FALLACIES',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 12,
  },
  {
    name: 'Correlation, Sample Size, and Why Small Groups Can Mislead',
    slug: 'correlation-sample-size-and-why-small-groups-can-mislead',
    description:
      'A claim based on a tiny sample ("I asked 3 friends and they all agreed") can be very misleading, even if it\'s technically true for that small group — it might not represent everyone. The bigger and more varied the group tested or surveyed, the more trustworthy a general conclusion usually is. When you see a statistic, a good next question is: how many people or cases was this actually based on?',
    category: 'EVIDENCE_EVALUATION',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 13,
  },
  {
    name: 'Straw Man — Arguing Against a Weaker Version of the Idea',
    slug: 'straw-man-arguing-against-a-weaker-version-of-the-idea',
    description:
      'A straw man argument happens when someone restates another person\'s idea in a distorted, oversimplified, or more extreme way — and then argues against that easier-to-beat version instead of the real one ("So you\'re saying we should never do homework?" when the person actually just suggested less homework on weekends). Before responding to an argument, check: am I responding to what they actually said, or an exaggerated version of it?',
    category: 'LOGICAL_FALLACIES',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 14,
  },
  {
    name: 'Checking Claims Before Sharing Them',
    slug: 'checking-claims-before-sharing-them',
    description:
      'Before sharing surprising news, a "fact," or a warning with friends or family, three quick checks help: (1) Where did this come from, and is that source reliable? (2) Have other trustworthy sources reported the same thing? (3) Does it play on strong emotions like fear or outrage — a common sign that something is trying to spread fast rather than be accurate? A ten-second pause before sharing prevents a lot of misinformation.',
    category: 'SOURCE_EVALUATION',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 15,
  },
];

async function main() {
  console.log('Seeding CriticalThinkingConcept...');
  for (const concept of criticalThinkingConcepts) {
    await prisma.criticalThinkingConcept.upsert({
      where: { slug: concept.slug },
      update: concept,
      create: concept,
    });
  }
  console.log(`Seeded ${criticalThinkingConcepts.length} CriticalThinkingConcept rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
