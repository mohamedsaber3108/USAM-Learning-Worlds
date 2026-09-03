require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const row = await prisma.moderationLog.create({
      data: {
        contentType: 'TEXT',
        contentPreview: 'test preview',
        flagged: true,
        categories: ['TEST'],
        severity: 'HIGH',
        action: 'BLOCKED',
      },
    });
    console.log('WROTE', row.id);
  } catch (e) {
    console.error('FAILED', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
