/**
 * English Strands + Coding Concepts Seeding (parallel-agent-2)
 *
 * English: covers the full 9-strand inventory (Vocabulary, Grammar,
 * Pronunciation, Listening, Reading, Writing, Speaking, Shadowing,
 * Dictation) across CEFR A1-B2, tagged with the age band the strand
 * targets (ages 8-14).
 *
 * Coding: covers a real progression from block-based coding
 * (Scratch/Blockly, ages 8-11) through text-based coding
 * (Python/JavaScript, ages 12-14), including data structures,
 * functions, and web/API basics.
 *
 * Age bands are encoded in the description text because the current
 * Prisma schema for EnglishStrand/CodingConcept has no dedicated
 * age-band column (id, name, slug, description, cefrLevel/category,
 * order, isActive, createdAt only). Upserts are keyed on slug so this
 * script is safely re-runnable.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EnglishStrandSeed {
  name: string;
  slug: string;
  description: string;
  cefrLevel: string;
  order: number;
}

interface CodingConceptSeed {
  name: string;
  slug: string;
  description: string;
  category: string;
  difficulty: number;
  order: number;
}

// ============================================
// ENGLISH STRANDS
// 9 strand types x CEFR progression, ages 8-14
// ============================================

const englishStrands: EnglishStrandSeed[] = [
  // VOCABULARY
  {
    name: 'Vocabulary: Everyday Words (A1)',
    slug: 'vocabulary-a1-everyday-words',
    description:
      'Ages 8-9. Core high-frequency words for home, school, family, food, animals, and colors. Builds a working sight-word bank of ~300-500 words through picture-word matching, flashcards, and labeling games.',
    cefrLevel: 'A1',
    order: 1,
  },
  {
    name: 'Vocabulary: Topic Word Banks (A2)',
    slug: 'vocabulary-a2-topic-word-banks',
    description:
      'Ages 9-11. Thematic vocabulary sets (hobbies, weather, town/places, jobs, feelings) with word families, simple synonyms/antonyms, and collocations like "go swimming" or "do homework".',
    cefrLevel: 'A2',
    order: 2,
  },
  {
    name: 'Vocabulary: Academic & Descriptive Words (B1)',
    slug: 'vocabulary-b1-academic-descriptive',
    description:
      'Ages 11-13. Expands into descriptive adjectives, connectors (however, although, because), and early academic vocabulary used in school subjects (compare, describe, explain, summarize).',
    cefrLevel: 'B1',
    order: 3,
  },
  {
    name: 'Vocabulary: Nuance & Idiom (B2)',
    slug: 'vocabulary-b2-nuance-idiom',
    description:
      'Ages 13-14. Precision vocabulary, register (formal vs informal), common idioms and phrasal verbs, and word-in-context inference for unfamiliar terms in longer texts.',
    cefrLevel: 'B2',
    order: 4,
  },

  // GRAMMAR
  {
    name: 'Grammar: Basic Sentence Structure (A1)',
    slug: 'grammar-a1-basic-sentences',
    description:
      'Ages 8-9. Subject-verb-object order, present simple, singular/plural nouns, basic pronouns, and simple question forms (What is..? Where is..?).',
    cefrLevel: 'A1',
    order: 5,
  },
  {
    name: 'Grammar: Tenses & Comparatives (A2)',
    slug: 'grammar-a2-tenses-comparatives',
    description:
      'Ages 9-11. Past simple, present continuous, comparative/superlative adjectives, and everyday prepositions of time and place.',
    cefrLevel: 'A2',
    order: 6,
  },
  {
    name: 'Grammar: Complex Tenses & Clauses (B1)',
    slug: 'grammar-b1-complex-tenses-clauses',
    description:
      'Ages 11-13. Present perfect, future forms (will/going to), modal verbs (should, must, might), and joining ideas with relative and conditional clauses (if I study, I will pass).',
    cefrLevel: 'B1',
    order: 7,
  },
  {
    name: 'Grammar: Reported Speech & Passive Voice (B2)',
    slug: 'grammar-b2-reported-speech-passive',
    description:
      'Ages 13-14. Reported speech, passive voice, mixed conditionals, and editing for grammatical accuracy in multi-paragraph writing.',
    cefrLevel: 'B2',
    order: 8,
  },

  // PRONUNCIATION
  {
    name: 'Pronunciation: Phonics Foundations (A1)',
    slug: 'pronunciation-a1-phonics-foundations',
    description:
      'Ages 8-9. Letter-sound correspondence, short/long vowel sounds, and blending for CVC words using phonics songs and minimal-pair drills.',
    cefrLevel: 'A1',
    order: 9,
  },
  {
    name: 'Pronunciation: Word Stress & Syllables (A2)',
    slug: 'pronunciation-a2-word-stress-syllables',
    description:
      'Ages 10-12. Syllable counting, word stress patterns, and tricky consonant clusters (th, sh, ch) with recorded self-comparison practice.',
    cefrLevel: 'A2',
    order: 10,
  },
  {
    name: 'Pronunciation: Sentence Stress & Intonation (B1)',
    slug: 'pronunciation-b1-sentence-stress-intonation',
    description:
      'Ages 12-14. Rising/falling intonation for questions and statements, sentence stress for emphasis, and linking sounds between words for natural flow.',
    cefrLevel: 'B1',
    order: 11,
  },

  // LISTENING
  {
    name: 'Listening: Short Instructions & Stories (A1)',
    slug: 'listening-a1-instructions-stories',
    description:
      'Ages 8-9. Following two-step spoken instructions and understanding short read-aloud stories with picture support and comprehension checks.',
    cefrLevel: 'A1',
    order: 12,
  },
  {
    name: 'Listening: Dialogues & Announcements (A2)',
    slug: 'listening-a2-dialogues-announcements',
    description:
      'Ages 10-12. Understanding everyday dialogues, simple announcements, and short audio clips, extracting who/what/where/when details.',
    cefrLevel: 'A2',
    order: 13,
  },
  {
    name: 'Listening: Extended Talks & Note-Taking (B1)',
    slug: 'listening-b1-extended-talks-notetaking',
    description:
      'Ages 12-14. Following 2-3 minute talks or podcasts aimed at learners, taking structured notes, and identifying speaker opinion vs fact.',
    cefrLevel: 'B1',
    order: 14,
  },

  // READING
  {
    name: 'Reading: Picture Books & Simple Texts (A1)',
    slug: 'reading-a1-picture-books-simple-texts',
    description:
      'Ages 8-9. Decoding simple decodable texts and picture books, answering literal comprehension questions, and building reading stamina.',
    cefrLevel: 'A1',
    order: 15,
  },
  {
    name: 'Reading: Short Stories & Non-Fiction (A2)',
    slug: 'reading-a2-short-stories-nonfiction',
    description:
      'Ages 10-12. Reading graded short stories and simple non-fiction articles, sequencing events, and identifying main idea vs supporting detail.',
    cefrLevel: 'A2',
    order: 16,
  },
  {
    name: 'Reading: Inference & Text Structure (B1)',
    slug: 'reading-b1-inference-text-structure',
    description:
      'Ages 12-13. Making inferences beyond the literal text, recognizing text structures (cause/effect, compare/contrast), and vocabulary-in-context strategies.',
    cefrLevel: 'B1',
    order: 17,
  },
  {
    name: 'Reading: Critical Analysis (B2)',
    slug: 'reading-b2-critical-analysis',
    description:
      'Ages 13-14. Evaluating author purpose and bias, comparing multiple short texts on the same topic, and summarizing longer passages accurately.',
    cefrLevel: 'B2',
    order: 18,
  },

  // WRITING
  {
    name: 'Writing: Sentences & Captions (A1)',
    slug: 'writing-a1-sentences-captions',
    description:
      'Ages 8-9. Writing complete simple sentences, captions for pictures, and short personal messages using taught vocabulary and punctuation basics.',
    cefrLevel: 'A1',
    order: 19,
  },
  {
    name: 'Writing: Paragraphs & Journals (A2)',
    slug: 'writing-a2-paragraphs-journals',
    description:
      'Ages 10-12. Structuring a topic paragraph, writing simple journal entries and friendly letters/emails, and using connectors (and, but, so, then).',
    cefrLevel: 'A2',
    order: 20,
  },
  {
    name: 'Writing: Structured Essays (B1)',
    slug: 'writing-b1-structured-essays',
    description:
      'Ages 12-13. Planning and drafting multi-paragraph essays (opinion, narrative, how-to) with intro/body/conclusion structure and basic self-editing.',
    cefrLevel: 'B1',
    order: 21,
  },
  {
    name: 'Writing: Argumentative & Reflective Writing (B2)',
    slug: 'writing-b2-argumentative-reflective',
    description:
      'Ages 13-14. Writing persuasive/argumentative pieces with evidence and counterargument, plus reflective writing on personal experience with varied sentence style.',
    cefrLevel: 'B2',
    order: 22,
  },

  // SPEAKING
  {
    name: 'Speaking: Greetings & Simple Exchanges (A1)',
    slug: 'speaking-a1-greetings-exchanges',
    description:
      'Ages 8-9. Greetings, introducing yourself, asking/answering simple personal questions, and basic classroom request phrases.',
    cefrLevel: 'A1',
    order: 23,
  },
  {
    name: 'Speaking: Everyday Conversation (A2)',
    slug: 'speaking-a2-everyday-conversation',
    description:
      'Ages 10-12. Holding short conversations about routines, likes/dislikes, and simple opinions, with partner role-play and turn-taking practice.',
    cefrLevel: 'A2',
    order: 24,
  },
  {
    name: 'Speaking: Presentations & Discussion (B1)',
    slug: 'speaking-b1-presentations-discussion',
    description:
      'Ages 12-14. Giving a short prepared presentation, participating in small-group discussion, and expressing/justifying opinions with reasons.',
    cefrLevel: 'B1',
    order: 25,
  },

  // SHADOWING
  {
    name: 'Shadowing: Model Sentences (A1)',
    slug: 'shadowing-a1-model-sentences',
    description:
      'Ages 8-9. Listening to a native-speaker model and immediately repeating short sentences to build rhythm, sound accuracy, and confidence.',
    cefrLevel: 'A1',
    order: 26,
  },
  {
    name: 'Shadowing: Dialogue Chunks (A2)',
    slug: 'shadowing-a2-dialogue-chunks',
    description:
      'Ages 10-12. Shadowing short scripted dialogues line-by-line to internalize natural stress, intonation, and connected speech patterns.',
    cefrLevel: 'A2',
    order: 27,
  },
  {
    name: 'Shadowing: Extended Passages (B1)',
    slug: 'shadowing-b1-extended-passages',
    description:
      'Ages 12-14. Real-time shadowing of longer audio passages (30-60 seconds) with self-recording and playback comparison against the model speaker.',
    cefrLevel: 'B1',
    order: 28,
  },

  // DICTATION
  {
    name: 'Dictation: Words & Short Phrases (A1)',
    slug: 'dictation-a1-words-phrases',
    description:
      'Ages 8-9. Listening and writing down single words and short 3-5 word phrases, reinforcing spelling-sound links from phonics practice.',
    cefrLevel: 'A1',
    order: 29,
  },
  {
    name: 'Dictation: Sentences (A2)',
    slug: 'dictation-a2-sentences',
    description:
      'Ages 10-12. Full-sentence dictation from spoken audio, checking punctuation, capitalization, and correct spelling of taught vocabulary.',
    cefrLevel: 'A2',
    order: 30,
  },
  {
    name: 'Dictation: Passages & Self-Correction (B1)',
    slug: 'dictation-b1-passages-self-correction',
    description:
      'Ages 12-14. Multi-sentence passage dictation followed by guided self-correction against the transcript, targeting listening precision and accuracy under pace.',
    cefrLevel: 'B1',
    order: 31,
  },
];

// ============================================
// CODING CONCEPTS
// Ages 8-11: Scratch/Blockly block-based progression
// Ages 12-14: Python/JavaScript text-based progression
// ============================================

const codingConcepts: CodingConceptSeed[] = [
  // --- SCRATCH / BLOCKLY (ages 8-11) ---
  {
    name: 'Blocks & the Coding Canvas',
    slug: 'scratch-blocks-canvas',
    description:
      'Ages 8-9. Orientation to the block-based workspace: dragging blocks, snapping them together, and running a script by clicking it.',
    category: 'SCRATCH_BASICS',
    difficulty: 1,
    order: 1,
  },
  {
    name: 'Sequences',
    slug: 'scratch-sequences',
    description:
      'Ages 8-9. Programs run top-to-bottom: ordering blocks so a sprite moves, turns, and speaks in the intended sequence to complete a task.',
    category: 'SCRATCH_BASICS',
    difficulty: 1,
    order: 2,
  },
  {
    name: 'Events (When Green Flag / When Key Pressed)',
    slug: 'scratch-events',
    description:
      'Ages 8-9. Triggering scripts with events like "when green flag clicked", "when key pressed", and "when this sprite clicked" to make programs interactive.',
    category: 'SCRATCH_BASICS',
    difficulty: 1,
    order: 3,
  },
  {
    name: 'Motion & Coordinates',
    slug: 'scratch-motion-coordinates',
    description:
      'Ages 8-9. Moving sprites with steps, glide, and go-to-x-y blocks, and reading the x/y coordinate grid to place objects precisely.',
    category: 'SCRATCH_BASICS',
    difficulty: 1,
    order: 4,
  },
  {
    name: 'Loops (Repeat & Forever)',
    slug: 'scratch-loops',
    description:
      'Ages 9-10. Using "repeat", "repeat until", and "forever" blocks to run actions multiple times instead of duplicating blocks by hand.',
    category: 'SCRATCH_LOGIC',
    difficulty: 2,
    order: 5,
  },
  {
    name: 'Conditionals (If / If-Else)',
    slug: 'scratch-conditionals',
    description:
      'Ages 9-10. Making decisions with "if" and "if-else" blocks based on sensing (touching, key pressed) and comparison operators.',
    category: 'SCRATCH_LOGIC',
    difficulty: 2,
    order: 6,
  },
  {
    name: 'Variables in Scratch',
    slug: 'scratch-variables',
    description:
      'Ages 9-10. Creating and using variables to track a score, timer, or lives, and updating them with "set" and "change by" blocks.',
    category: 'SCRATCH_LOGIC',
    difficulty: 2,
    order: 7,
  },
  {
    name: 'Broadcast & Receive Messages',
    slug: 'scratch-broadcast-messages',
    description:
      'Ages 10-11. Coordinating multiple sprites by broadcasting custom messages and having other sprites react with "when I receive".',
    category: 'SCRATCH_LOGIC',
    difficulty: 3,
    order: 8,
  },
  {
    name: 'Operators & Boolean Logic',
    slug: 'scratch-operators-boolean',
    description:
      'Ages 10-11. Combining conditions with and/or/not, and using math and comparison operators inside "if" blocks for richer game logic.',
    category: 'SCRATCH_LOGIC',
    difficulty: 3,
    order: 9,
  },
  {
    name: 'Custom Blocks (My Blocks)',
    slug: 'scratch-custom-blocks',
    description:
      'Ages 10-11. Creating a reusable "My Block" to package a repeated sequence (e.g. "jump") into a single named block, an early step toward functions.',
    category: 'SCRATCH_LOGIC',
    difficulty: 3,
    order: 10,
  },
  {
    name: 'Cloning & Collision Detection',
    slug: 'scratch-cloning-collision',
    description:
      'Ages 10-11. Using "create clone of myself" to spawn multiple sprites and detecting collisions with "touching" to build simple games.',
    category: 'SCRATCH_LOGIC',
    difficulty: 3,
    order: 11,
  },
  {
    name: 'Lists in Scratch',
    slug: 'scratch-lists',
    description:
      'Ages 10-11. Storing multiple values in a list (e.g. a set of high scores or words), adding/removing items, and reading by index.',
    category: 'SCRATCH_DATA',
    difficulty: 3,
    order: 12,
  },
  {
    name: 'From Blocks to Text Code',
    slug: 'scratch-to-text-bridge',
    description:
      'Ages 11. Bridging unit mapping each block concept (sequence, loop, conditional, variable) to its text-based equivalent in Python/JavaScript, preparing for the transition.',
    category: 'SCRATCH_TRANSITION',
    difficulty: 3,
    order: 13,
  },

  // --- PYTHON / JAVASCRIPT (ages 12-14) ---
  {
    name: 'Setting Up & Running Code',
    slug: 'py-setup-running-code',
    description:
      'Ages 12-13. Writing a first Python/JavaScript program, running scripts, and reading error messages/tracebacks as helpful clues rather than failures.',
    category: 'TEXT_BASICS',
    difficulty: 1,
    order: 14,
  },
  {
    name: 'Variables & Data Types (Python/JS)',
    slug: 'py-variables-data-types',
    description:
      'Ages 12-13. Declaring variables (let/const in JS, plain assignment in Python) and working with strings, integers, floats, and booleans.',
    category: 'TEXT_BASICS',
    difficulty: 1,
    order: 15,
  },
  {
    name: 'Operators & Expressions',
    slug: 'py-operators-expressions',
    description:
      'Ages 12-13. Arithmetic, comparison, and logical operators, and evaluating multi-step expressions with correct operator precedence.',
    category: 'TEXT_BASICS',
    difficulty: 1,
    order: 16,
  },
  {
    name: 'Input & Output',
    slug: 'py-input-output',
    description:
      'Ages 12-13. Reading user input (input() in Python, prompt()/console in JS) and formatting output with print()/console.log() and string formatting.',
    category: 'TEXT_BASICS',
    difficulty: 1,
    order: 17,
  },
  {
    name: 'Conditionals (if / elif / else, Python/JS)',
    slug: 'py-conditionals',
    description:
      'Ages 12-13. Writing if/elif/else (Python) or if/else if/else (JS) chains to branch program logic based on comparisons and boolean expressions.',
    category: 'TEXT_CONTROL_FLOW',
    difficulty: 2,
    order: 18,
  },
  {
    name: 'Loops (for & while, Python/JS)',
    slug: 'py-loops-for-while',
    description:
      'Ages 12-13. Using for loops to iterate a known number of times or over a collection, and while loops for condition-controlled repetition.',
    category: 'TEXT_CONTROL_FLOW',
    difficulty: 2,
    order: 19,
  },
  {
    name: 'Functions & Parameters (Python/JS)',
    slug: 'py-functions-parameters',
    description:
      'Ages 13. Defining reusable functions with def/function, passing parameters, returning values, and understanding local vs global scope.',
    category: 'TEXT_FUNCTIONS',
    difficulty: 2,
    order: 20,
  },
  {
    name: 'Lists & Arrays (Python/JS)',
    slug: 'py-lists-arrays',
    description:
      'Ages 13. Creating lists/arrays, indexing and slicing, appending/removing items, and iterating over a collection with a loop.',
    category: 'TEXT_DATA_STRUCTURES',
    difficulty: 2,
    order: 21,
  },
  {
    name: 'Dictionaries & Objects (Python/JS)',
    slug: 'py-dictionaries-objects',
    description:
      'Ages 13. Storing key-value data with Python dictionaries or JavaScript objects, accessing/updating fields, and modeling real-world records (a student profile, a game character).',
    category: 'TEXT_DATA_STRUCTURES',
    difficulty: 3,
    order: 22,
  },
  {
    name: 'String Manipulation (Python/JS)',
    slug: 'py-string-manipulation',
    description:
      'Ages 13. Slicing, concatenating, searching, and formatting strings; common built-in methods like split(), join(), upper()/lower(), and template strings.',
    category: 'TEXT_DATA_STRUCTURES',
    difficulty: 2,
    order: 23,
  },
  {
    name: 'Error Handling (Try/Except/Catch)',
    slug: 'py-error-handling',
    description:
      'Ages 13-14. Using try/except (Python) or try/catch (JavaScript) to handle expected failures gracefully, such as invalid user input.',
    category: 'TEXT_CONTROL_FLOW',
    difficulty: 3,
    order: 24,
  },
  {
    name: 'File & Data Basics (Python/JS)',
    slug: 'py-file-data-basics',
    description:
      'Ages 13-14. Reading/writing simple text or JSON files to persist data between program runs, and parsing structured data into lists/dicts or arrays/objects.',
    category: 'TEXT_DATA_STRUCTURES',
    difficulty: 3,
    order: 25,
  },
  {
    name: 'Classes & Objects (Intro OOP, Python/JS)',
    slug: 'py-classes-objects-intro',
    description:
      'Ages 14. Defining a simple class with attributes and methods, creating instances, and understanding "self"/"this" as the object being acted on.',
    category: 'TEXT_OOP',
    difficulty: 3,
    order: 26,
  },
  {
    name: 'Modules & Libraries (Python/JS)',
    slug: 'py-modules-libraries',
    description:
      'Ages 14. Importing built-in and third-party modules (Python import / JS import), and understanding why code is organized into reusable modules.',
    category: 'TEXT_OOP',
    difficulty: 3,
    order: 27,
  },
  {
    name: 'DOM Events & Callbacks (JavaScript)',
    slug: 'js-events-callbacks',
    description:
      'Ages 14. Handling browser events (click, keypress, submit) with callback functions, connecting user interaction to code that responds to it.',
    category: 'TEXT_WEB',
    difficulty: 3,
    order: 28,
  },
  {
    name: 'Working with APIs (Fetch/Requests)',
    slug: 'apis-web-requests-intro',
    description:
      'Ages 14. Making a basic HTTP GET request to a public API (Python requests / JS fetch), reading a JSON response, and using the returned data in a program.',
    category: 'TEXT_WEB',
    difficulty: 4,
    order: 29,
  },
  {
    name: 'Debugging Strategies (Python/JS)',
    slug: 'py-debugging-strategies',
    description:
      'Ages 13-14. Systematic debugging: reading error messages, adding print/console.log checkpoints, using a debugger or breakpoints, and forming a hypothesis before changing code.',
    category: 'TEXT_PRACTICE',
    difficulty: 2,
    order: 30,
  },
];

async function seedEnglishStrands() {
  console.log('📚 Seeding English strands (parallel-agent-2)...\n');
  let created = 0;
  let updated = 0;

  for (const strand of englishStrands) {
    const existing = await prisma.englishStrand.findUnique({
      where: { slug: strand.slug },
    });

    if (existing) {
      await prisma.englishStrand.update({
        where: { id: existing.id },
        data: strand,
      });
      updated++;
    } else {
      await prisma.englishStrand.create({ data: strand });
      created++;
    }

    console.log(`  ✅ ${strand.name} [${strand.cefrLevel}]`);
  }

  console.log(`\n📊 English strands — created: ${created}, updated: ${updated}, total: ${englishStrands.length}\n`);
}

async function seedCodingConcepts() {
  console.log('💻 Seeding coding concepts (parallel-agent-2)...\n');
  let created = 0;
  let updated = 0;

  for (const concept of codingConcepts) {
    const existing = await prisma.codingConcept.findUnique({
      where: { slug: concept.slug },
    });

    if (existing) {
      await prisma.codingConcept.update({
        where: { id: existing.id },
        data: concept,
      });
      updated++;
    } else {
      await prisma.codingConcept.create({ data: concept });
      created++;
    }

    console.log(`  ✅ ${concept.name} [${concept.category}] difficulty=${concept.difficulty}`);
  }

  console.log(`\n📊 Coding concepts — created: ${created}, updated: ${updated}, total: ${codingConcepts.length}\n`);
}

async function main() {
  await seedEnglishStrands();
  await seedCodingConcepts();
  console.log('🎉 English + Coding seeding complete (parallel-agent-2)!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
