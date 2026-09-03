/**
 * Communication Engine — Seeding
 *
 * Seeds CommunicationSkillConcept with real, age-appropriate content on
 * speaking, listening, presenting, active listening, and body language,
 * framed for kids aged 8-14. Mirrors seed-cross-curricular.ts's
 * AILiteracyConcept pattern exactly: a flat list of concepts with a
 * category tag, no relations, upserted by unique slug.
 *
 * Built from scratch per USAM_KIDS_ENGINE_GAP_MATRIX.md's "Communication
 * Engine | Missing" row — was zero-trace before this pass.
 */

import { PrismaClient, AgeBand } from '@prisma/client';

const prisma = new PrismaClient();

const communicationSkillConcepts = [
  {
    name: 'Finding Your Speaking Voice',
    slug: 'finding-your-speaking-voice',
    description:
      "Speaking clearly starts with volume and pace — not too fast, not too quiet. Try this: say one sentence out loud, then say it again a little slower and a little louder. Notice how much easier it is to understand.",
    category: 'SPEAKING',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 1,
  },
  {
    name: 'One Idea at a Time',
    slug: 'one-idea-at-a-time',
    description:
      "When you're explaining something, share one idea, pause, then share the next one. Cramming five ideas into one long sentence makes it hard for listeners to keep up — short sentences are easier to follow than long ones.",
    category: 'SPEAKING',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 2,
  },
  {
    name: 'What Active Listening Actually Looks Like',
    slug: 'what-active-listening-looks-like',
    description:
      "Active listening means showing the other person you're paying attention: face them, nod sometimes, and don't start planning what you'll say next while they're still talking. It's a skill, not just 'being quiet.'",
    category: 'ACTIVE_LISTENING',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 3,
  },
  {
    name: 'Asking a Follow-Up Question',
    slug: 'asking-a-follow-up-question',
    description:
      "A great way to show you were really listening is asking a question about what the person just said, like 'What happened after that?' It proves you were tracking, not just waiting for your turn.",
    category: 'ACTIVE_LISTENING',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 4,
  },
  {
    name: 'Your Body Talks Before You Do',
    slug: 'your-body-talks-before-you-do',
    description:
      "Crossed arms, looking at the floor, or facing away can make you seem uninterested even if you're not. Standing or sitting up, facing the person, and relaxed hands send the message 'I'm here and listening' before you say a word.",
    category: 'BODY_LANGUAGE',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 5,
  },
  {
    name: 'Eye Contact Without the Stare-Down',
    slug: 'eye-contact-without-the-stare-down',
    description:
      "You don't need to lock eyes the whole time — that feels intense. Aim for looking at someone's face most of the time when they talk, glancing away occasionally is totally normal and still counts as good eye contact.",
    category: 'BODY_LANGUAGE',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 6,
  },
  {
    name: 'Starting a Presentation Strong',
    slug: 'starting-a-presentation-strong',
    description:
      "The first sentence sets the tone. Instead of 'Um, so, my project is about...', try opening with the most interesting fact or question from your topic — it grabs attention immediately.",
    category: 'PRESENTING',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 7,
  },
  {
    name: 'Using Note Cards Without Reading Word-for-Word',
    slug: 'using-note-cards-without-reading-word-for-word',
    description:
      "Write only key words or short phrases on your note cards, not full sentences. That forces you to actually explain the idea in your own words instead of reading a script, which sounds more natural to your audience.",
    category: 'PRESENTING',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 8,
  },
  {
    name: 'Handling Nerves Before You Speak',
    slug: 'handling-nerves-before-you-speak',
    description:
      "Feeling nervous before presenting is normal — even adults get it. Try taking three slow breaths and reminding yourself: the audience wants you to succeed, they're not looking for mistakes.",
    category: 'PRESENTING',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 9,
  },
  {
    name: 'Disagreeing Without Being Disagreeable',
    slug: 'disagreeing-without-being-disagreeable',
    description:
      "You can say 'I see it differently' or 'I'm not sure I agree, here's why' without being rude. The goal is explaining your view, not proving the other person wrong or making them feel bad.",
    category: 'SPEAKING',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 10,
  },
  {
    name: 'Listening for Feelings, Not Just Facts',
    slug: 'listening-for-feelings-not-just-facts',
    description:
      "Sometimes what someone says out loud isn't the whole story — tone of voice and word choice can hint at how they feel. If a friend says 'it's fine' in a flat voice, that's worth noticing, not just taking literally.",
    category: 'ACTIVE_LISTENING',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 11,
  },
  {
    name: 'Adjusting How You Talk for Your Audience',
    slug: 'adjusting-how-you-talk-for-your-audience',
    description:
      "You explain a video game differently to a friend who plays it than to a grandparent who's never seen it. Good communicators adjust their words and detail level based on who's listening — that's not being fake, it's being clear.",
    category: 'SPEAKING',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 12,
  },
];

async function main() {
  console.log('Seeding CommunicationSkillConcept...');
  for (const concept of communicationSkillConcepts) {
    await prisma.communicationSkillConcept.upsert({
      where: { slug: concept.slug },
      update: concept,
      create: concept,
    });
  }
  console.log(`Seeded ${communicationSkillConcepts.length} CommunicationSkillConcept rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
