/**
 * Question Engine seed — completes the gap-matrix "Question Engine" build
 * (backend/src/modules/questions/) with real, curriculum-linked MCQ/
 * fill-blank question templates. This was left unseeded after the parent
 * delegation batch was interrupted mid-run; the model/service/controller
 * were already committed and wired, only content was missing.
 *
 * Real content, tied to real LearningObjective rows already in prod.
 */
import { PrismaClient, QuestionType, DifficultyLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function findObjective(nameContains: string) {
  return prisma.learningObjective.findFirst({
    where: { name: { contains: nameContains, mode: 'insensitive' } },
  });
}

async function main() {
  console.log('Seeding QuestionTemplate rows...');

  const placeValue = await findObjective('place value');
  const singleDigitAdd = await findObjective('Single Digit Addition');
  const doubleDigitAdd = await findObjective('Double Digit Addition');
  const timesTables15 = await findObjective('Times Tables 1-5');
  const timesTables612 = await findObjective('Times Tables 6-12');

  const templates: {
    objectiveId: string;
    type: QuestionType;
    stem: string;
    correctAnswer: string;
    distractors: string[];
    difficulty: DifficultyLevel;
  }[] = [];

  if (placeValue) {
    templates.push({
      objectiveId: placeValue.id,
      type: 'MCQ' as QuestionType,
      stem: 'In the number 347, what digit is in the tens place?',
      correctAnswer: '4',
      distractors: ['3', '7', '0'],
      difficulty: 'EASY' as DifficultyLevel,
    });
    templates.push({
      objectiveId: placeValue.id,
      type: 'MCQ' as QuestionType,
      stem: 'What is the value of the 5 in the number 512?',
      correctAnswer: '500',
      distractors: ['5', '50', '5000'],
      difficulty: 'MEDIUM' as DifficultyLevel,
    });
  }

  if (singleDigitAdd) {
    templates.push({
      objectiveId: singleDigitAdd.id,
      type: 'MCQ' as QuestionType,
      stem: 'What is 7 + 6?',
      correctAnswer: '13',
      distractors: ['12', '14', '11'],
      difficulty: 'EASY' as DifficultyLevel,
    });
    templates.push({
      objectiveId: singleDigitAdd.id,
      type: 'FILL_BLANK' as QuestionType,
      stem: '4 + 9 = ___',
      correctAnswer: '13',
      distractors: ['12', '14', '3'],
      difficulty: 'EASY' as DifficultyLevel,
    });
  }

  if (doubleDigitAdd) {
    templates.push({
      objectiveId: doubleDigitAdd.id,
      type: 'MCQ' as QuestionType,
      stem: 'What is 34 + 28?',
      correctAnswer: '62',
      distractors: ['52', '61', '64'],
      difficulty: 'MEDIUM' as DifficultyLevel,
    });
  }

  if (timesTables15) {
    templates.push({
      objectiveId: timesTables15.id,
      type: 'MCQ' as QuestionType,
      stem: 'What is 4 × 5?',
      correctAnswer: '20',
      distractors: ['18', '24', '16'],
      difficulty: 'EASY' as DifficultyLevel,
    });
    templates.push({
      objectiveId: timesTables15.id,
      type: 'MCQ' as QuestionType,
      stem: 'What is 3 × 3?',
      correctAnswer: '9',
      distractors: ['6', '12', '8'],
      difficulty: 'EASY' as DifficultyLevel,
    });
  }

  if (timesTables612) {
    templates.push({
      objectiveId: timesTables612.id,
      type: 'MCQ' as QuestionType,
      stem: 'What is 7 × 8?',
      correctAnswer: '56',
      distractors: ['54', '63', '49'],
      difficulty: 'MEDIUM' as DifficultyLevel,
    });
    templates.push({
      objectiveId: timesTables612.id,
      type: 'MCQ' as QuestionType,
      stem: 'What is 9 × 6?',
      correctAnswer: '54',
      distractors: ['56', '45', '63'],
      difficulty: 'MEDIUM' as DifficultyLevel,
    });
  }

  let created = 0;
  for (const t of templates) {
    const exists = await prisma.questionTemplate.findFirst({
      where: { objectiveId: t.objectiveId, stem: t.stem },
    });
    if (exists) continue;
    await prisma.questionTemplate.create({ data: t });
    created++;
  }

  console.log(`Seeded ${created} QuestionTemplate rows (${templates.length} candidates, objectives found: place=${!!placeValue} sda=${!!singleDigitAdd} dda=${!!doubleDigitAdd} tt15=${!!timesTables15} tt612=${!!timesTables612}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
