const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const tables = ['aILiteracyConcept','entrepreneurshipConcept','financialLiteracyConcept','contentItem','ageVariant','rubric','concept','learningPath','englishStrand','codingConcept'];
  for (const t of tables) {
    try {
      const count = await p[t].count();
      console.log(t, count);
    } catch(e) { console.log(t, 'ERR', JSON.stringify(e.message)); }
  }
  process.exit(0);
})();
