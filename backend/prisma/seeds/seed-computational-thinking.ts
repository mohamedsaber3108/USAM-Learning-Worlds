/**
 * Computational Thinking Concepts Seeding
 *
 * Seeds ComputationalThinkingConcept with real, age-appropriate content for
 * learners aged 8-14, matching the pattern established in
 * seed-career-exploration.ts / seed-cross-curricular.ts.
 *
 * Age bands (AgeBand enum): AGE_8_9, AGE_10_11, AGE_12_14
 *
 * Covers the four core computational-thinking pillars — deliberately taught
 * through concrete, non-coding, kid-friendly examples (Lego, recipes,
 * treasure hunts, board games) rather than syntax, since computational
 * thinking is a reasoning skill, not a programming-language skill. Distinct
 * from (and does not touch) the pre-existing, orphaned CodingConcept model.
 */

import { PrismaClient, AgeBand } from '@prisma/client';

const prisma = new PrismaClient();

const computationalThinkingConcepts = [
  // ---------------- Decomposition ----------------
  {
    name: 'Decomposition — Breaking a Big Lego Build Into Steps',
    slug: 'decomposition-breaking-a-big-lego-build-into-steps',
    description:
      "A giant Lego castle looks impossible all at once — but if you break it into smaller jobs (build the base, then the towers, then the gate, then the roof), each piece is easy. That's decomposition: taking one big, scary problem and splitting it into smaller problems you can actually solve. Try it: next time you have a big project, write down the 3-5 smaller steps before you start.",
    category: 'DECOMPOSITION',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 1,
  },
  {
    name: 'Decomposition — Planning a Birthday Party in Chunks',
    slug: 'decomposition-planning-a-birthday-party-in-chunks',
    description:
      "Planning a whole birthday party feels overwhelming if you think about everything at once. But split it into chunks — guest list, invitations, food, decorations, games — and suddenly each chunk is a small, manageable task. Grown-ups do this for parties, trips, and even building houses. Breaking things into chunks is the first move computational thinkers make on any big problem.",
    category: 'DECOMPOSITION',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 2,
  },
  {
    name: 'Decomposition — Debugging Why a Recipe Went Wrong',
    slug: 'decomposition-debugging-why-a-recipe-went-wrong',
    description:
      "If cookies come out wrong, you don't just say 'it failed' — you decompose the process: Was it the measuring? The oven temperature? The mixing order? The baking time? By checking each step separately, you find exactly where it went wrong instead of guessing at the whole recipe. This step-by-step checking is exactly how programmers find bugs in code, and how scientists find where an experiment broke down.",
    category: 'DECOMPOSITION',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 3,
  },
  {
    name: 'Decomposition — Splitting a Group Project So Everyone Has a Job',
    slug: 'decomposition-splitting-a-group-project-so-everyone-has-a-job',
    description:
      "When four kids are assigned one big school project, decomposition means figuring out which smaller pieces need doing (research, writing, poster design, presenting) and giving each piece to a person. Good decomposition means the pieces don't overlap weirdly and, when put back together, they make the whole project — that's a skill software teams use every day when splitting up a big app between engineers.",
    category: 'DECOMPOSITION',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 4,
  },

  // ---------------- Pattern Recognition ----------------
  {
    name: 'Pattern Recognition — Spotting the Rule in a Bead Bracelet',
    slug: 'pattern-recognition-spotting-the-rule-in-a-bead-bracelet',
    description:
      "Red, blue, blue, red, blue, blue... once you notice the repeating rule, you can predict the next bead without being told. That's pattern recognition: noticing repeats, similarities, or rules in what looks like a jumble of information. It's the same skill you use to know a song's chorus is coming back, or that every Tuesday means library day at school.",
    category: 'PATTERN_RECOGNITION',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 5,
  },
  {
    name: "Pattern Recognition — Noticing What All the 'Wet Floor' Signs Have in Common",
    slug: 'pattern-recognition-noticing-what-all-the-wet-floor-signs-have-in-common',
    description:
      "Warning signs for wet floors, poison, or fire all use bright yellow or red and simple pictures — because our brains are quick at spotting patterns in color and shape, even from far away or in a hurry. Recognizing what many different examples have in common (not just one) is how you build a mental category, like 'these are all warning signs' — the same move used in science to spot animal families, or in math to spot number sequences.",
    category: 'PATTERN_RECOGNITION',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 6,
  },
  {
    name: 'Pattern Recognition — Finding the Trick in a Number Sequence',
    slug: 'pattern-recognition-finding-the-trick-in-a-number-sequence',
    description:
      "2, 4, 8, 16, 32... spot the pattern (each number doubles) and you can predict the next ten numbers without adding them up one by one. Recognizing patterns lets you solve problems faster because you stop treating every new case as a total mystery — you connect it to a rule you've already figured out. This is exactly what happens in math class, weather forecasting, and even video game strategy.",
    category: 'PATTERN_RECOGNITION',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 7,
  },
  {
    name: "Pattern Recognition — Predicting a Video Game Boss's Attack Pattern",
    slug: 'pattern-recognition-predicting-a-video-game-boss-attack-pattern',
    description:
      "Good gamers beat tough bosses by watching for the attack pattern — 'it always does the fireball attack three times, then a slam' — and planning around it instead of reacting blindly. Recognizing recurring patterns in a system's behavior (a game, a person's habits, or weather) lets you predict what happens next and prepare for it, which is exactly what pattern recognition is used for in real-world fields like fraud detection and medicine.",
    category: 'PATTERN_RECOGNITION',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 8,
  },

  // ---------------- Abstraction ----------------
  {
    name: "Abstraction — Why a Subway Map Isn't a Photo of the City",
    slug: 'abstraction-why-a-subway-map-isnt-a-photo-of-the-city',
    description:
      "A subway map doesn't show every building, tree, or curve in the road — it only shows the stations and lines, drawn as neat straight lines and dots. That's abstraction: keeping only the details you actually need for the job (finding your train) and throwing away everything else (exact streets, building heights). Abstraction is what makes maps, diagrams, and instructions useful instead of overwhelming.",
    category: 'ABSTRACTION',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 9,
  },
  {
    name: 'Abstraction — Using a Steering Wheel Icon to Mean "Drive Here"',
    slug: 'abstraction-using-a-steering-wheel-icon-to-mean-drive-here',
    description:
      "A tiny steering wheel icon on a screen stands in for the whole complicated idea of 'driving a car' — you don't need to see an engine or explain physics to understand it. Icons, symbols, and simple names are abstractions: a small, simple stand-in for something big and complicated, so our brains (and computers) don't have to deal with all the messy detail every single time.",
    category: 'ABSTRACTION',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 10,
  },
  {
    name: 'Abstraction — Treating "Dog" as One Idea Instead of Every Single Detail',
    slug: 'abstraction-treating-dog-as-one-idea-instead-of-every-single-detail',
    description:
      "When you hear 'walk the dog,' you don't need to know the dog's exact breed, color, or age — the word 'dog' abstracts away all those details so people can talk and think efficiently. Programmers do the same thing with code: they create a general idea like 'Animal' and don't worry about every specific animal's details until they need to. Abstraction is what lets big, complicated systems (language, code, organizations) stay usable instead of drowning in detail.",
    category: 'ABSTRACTION',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 11,
  },

  // ---------------- Algorithm Design ----------------
  {
    name: 'Algorithm Design — Writing Exact Steps for a Peanut Butter Sandwich',
    slug: 'algorithm-design-writing-exact-steps-for-a-peanut-butter-sandwich',
    description:
      "Try writing down the *exact* steps to make a peanut butter sandwich, in order, with nothing skipped — most people forget to say 'open the jar' or 'pick up the knife' the first time! That's algorithm design: creating a clear, ordered, step-by-step set of instructions that gets the same correct result every time, even if someone else (or a robot) follows it without asking questions.",
    category: 'ALGORITHM_DESIGN',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 12,
  },
  {
    name: 'Algorithm Design — Giving a Robot Directions Through a Maze',
    slug: 'algorithm-design-giving-a-robot-directions-through-a-maze',
    description:
      "If you had to give a robot directions through a maze using only 'move forward', 'turn left', and 'turn right', you'd have to plan the exact sequence of moves in advance — no shortcuts, no 'you know what I mean.' This precise, ordered instruction-writing is the heart of algorithm design, and it's exactly what block-based coding tools like Scratch practice, even before you ever touch real code.",
    category: 'ALGORITHM_DESIGN',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 13,
  },
  {
    name: 'Algorithm Design — Comparing Two Ways to Sort a Bookshelf',
    slug: 'algorithm-design-comparing-two-ways-to-sort-a-bookshelf',
    description:
      "You could sort a messy bookshelf by picking the smallest book each time and placing it next, or by splitting the books into two piles and sorting each pile separately before combining them. Both work, but one might be faster depending on how many books there are — that's the idea behind comparing algorithms: there's often more than one correct way to solve a problem, and computational thinkers learn to judge which approach is more efficient for the situation.",
    category: 'ALGORITHM_DESIGN',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 14,
  },
];

async function main() {
  console.log('Seeding ComputationalThinkingConcept...');
  for (const concept of computationalThinkingConcepts) {
    await prisma.computationalThinkingConcept.upsert({
      where: { slug: concept.slug },
      update: concept,
      create: concept,
    });
  }
  console.log(`Seeded ${computationalThinkingConcepts.length} ComputationalThinkingConcept rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
