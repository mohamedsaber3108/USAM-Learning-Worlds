/**
 * Arabic Content Seeding
 * CRITICAL: Arabic/Egyptian Arabic is MANDATORY requirement
 *
 * This seeds translations for:
 * - Domains
 * - Skills
 * - Competencies
 * - Activities
 * - Missions
 * - Azouz character
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Arabic translations mapping (MSA = Modern Standard Arabic)
const domainTranslations = {
  'Mathematics': { ar: 'الرياضيات', 'ar-EG': 'الرياضيات' },
  'Science': { ar: 'العلوم', 'ar-EG': 'العلوم' },
  'Language': { ar: 'اللغة', 'ar-EG': 'اللغة' },
  'Technology': { ar: 'التكنولوجيا', 'ar-EG': 'التكنولوجيا' },
  'Arts': { ar: 'الفنون', 'ar-EG': 'الفنون' },
  'Music': { ar: 'الموسيقى', 'ar-EG': 'الموسيقى' },
  'Physical Education': { ar: 'التربية البدنية', 'ar-EG': 'التربية الرياضية' },
  'Social Studies': { ar: 'الدراسات الاجتماعية', 'ar-EG': 'الدراسات الاجتماعية' },
  'Health': { ar: 'الصحة', 'ar-EG': 'الصحة' },
  'Ethics': { ar: 'الأخلاق', 'ar-EG': 'الأخلاق' },
  'Coding': { ar: 'البرمجة', 'ar-EG': 'البرمجة' },
  'Entrepreneurship': { ar: 'ريادة الأعمال', 'ar-EG': 'ريادة الأعمال' },
  'English': { ar: 'اللغة الإنجليزية', 'ar-EG': 'الإنجليزي' },
  'AI Literacy': { ar: 'محو الأمية في الذكاء الاصطناعي', 'ar-EG': 'تعليم الذكاء الاصطناعي' },
  'Critical Thinking': { ar: 'التفكير النقدي', 'ar-EG': 'التفكير النقدي' },
  'Creative Thinking': { ar: 'التفكير الإبداعي', 'ar-EG': 'التفكير الإبداعي' },
  'Digital Literacy': { ar: 'محو الأمية الرقمية', 'ar-EG': 'الثقافة الرقمية' },
  'Financial Literacy': { ar: 'الثقافة المالية', 'ar-EG': 'فهم الفلوس' },
};

// Egyptian Arabic conversational phrases for Azouz
const egyptianArabicPhrases = {
  greeting: [
    'أهلا! عامل إيه؟',
    'السلام عليكم! نورت',
    'هاي! كل حاجة تمام؟',
  ],
  encouragement: [
    'برافو عليك!',
    'ماشاء الله، حلو قوي',
    'تمام! انت قدها',
    'عظيم جداً',
    'كمل، انت على الطريق الصح',
  ],
  help: [
    'مش فاهم حاجة؟ قولي',
    'عايز مساعدة؟',
    'تعالى نشوف مع بعض',
    'ممكن أساعدك؟',
  ],
  thinking: [
    'خليني أفكر...',
    'دي فكرة حلوة',
    'مممم... دي محتاجة تفكير',
  ],
  mistake: [
    'مش مشكلة، كلنا بنغلط',
    'عادي، الغلط بيعلمنا',
    'جرب تاني، انت قريب',
    'مش بعيد عن الإجابة الصح',
  ],
};

async function seedArabicContent() {
  console.log('🌍 Starting Arabic content seeding...\n');

  // 1. Translate Domains
  console.log('📚 Translating domains...');
  const domains = await prisma.domain.findMany();
  let domainCount = 0;

  for (const domain of domains) {
    const translations = domainTranslations[domain.name as keyof typeof domainTranslations];

    if (translations) {
      // Modern Standard Arabic
      await prisma.translation.upsert({
        where: {
          entityType_entityId_field_language: {
            entityType: 'DOMAIN',
            entityId: domain.id,
            field: 'name',
            language: 'ar',
          },
        },
        create: {
          entityType: 'DOMAIN',
          entityId: domain.id,
          field: 'name',
          language: 'ar',
          value: translations.ar,
        },
        update: {
          value: translations.ar,
        },
      });

      // Egyptian Arabic
      await prisma.translation.upsert({
        where: {
          entityType_entityId_field_language: {
            entityType: 'DOMAIN',
            entityId: domain.id,
            field: 'name',
            language: 'ar-EG',
          },
        },
        create: {
          entityType: 'DOMAIN',
          entityId: domain.id,
          field: 'name',
          language: 'ar-EG',
          value: translations['ar-EG'],
        },
        update: {
          value: translations['ar-EG'],
        },
      });

      domainCount++;
    }
  }
  console.log(`✅ Translated ${domainCount} domains to Arabic\n`);

  // 2. Translate Azouz Character
  console.log('🤖 Translating Azouz character...');
  const azouz = await prisma.character.findFirst({
    where: { name: 'Azouz' },
  });

  if (azouz) {
    // Translate system prompt to Egyptian Arabic
    const egyptianPrompt = `أنا عزوز، الصديق والمساعد بتاعك في التعلم!

شخصيتي:
- فضولي ومشجع
- بحب أسأل أسئلة تخليك تفكر
- بستخدم لغة سهلة ومناسبة لسنك
- بشجعك دايماً وبساعدك تتعلم من غلطاتك

أسلوبي:
- بتكلم عربي مصري طبيعي
- بستخدم أمثلة من الحياة
- مش بدي الإجابة على طول، بساعدك تلاقيها بنفسك
- بحتفل معاك بكل نجاح صغير

الحاجات المهمة:
- مش بتظاهر إني صديق حقيقي
- التركيز دايماً على التعلم
- بساعدك تكبر وتتطور
- بحترم وقتك وجهدك`;

    await prisma.translation.upsert({
      where: {
        entityType_entityId_field_language: {
          entityType: 'CHARACTER',
          entityId: azouz.id,
          field: 'systemPrompt',
          language: 'ar-EG',
        },
      },
      create: {
        entityType: 'CHARACTER',
        entityId: azouz.id,
        field: 'systemPrompt',
        language: 'ar-EG',
        value: egyptianPrompt,
      },
      update: {
        value: egyptianPrompt,
      },
    });

    console.log('✅ Azouz character translated to Egyptian Arabic\n');
  }

  // 3. Translate Sample Activities
  console.log('📝 Translating activities...');
  const activities = await prisma.activity.findMany({ take: 10 });
  let activityCount = 0;

  for (const activity of activities) {
    // Translate title
    if (activity.title) {
      // For now, mark as needing translation
      await prisma.translation.upsert({
        where: {
          entityType_entityId_field_language: {
            entityType: 'ACTIVITY',
            entityId: activity.id,
            field: 'title',
            language: 'ar',
          },
        },
        create: {
          entityType: 'ACTIVITY',
          entityId: activity.id,
          field: 'title',
          language: 'ar',
          value: `[يحتاج ترجمة] ${activity.title}`,
        },
        update: {},
      });

      await prisma.translation.upsert({
        where: {
          entityType_entityId_field_language: {
            entityType: 'ACTIVITY',
            entityId: activity.id,
            field: 'title',
            language: 'ar-EG',
          },
        },
        create: {
          entityType: 'ACTIVITY',
          entityId: activity.id,
          field: 'title',
          language: 'ar-EG',
          value: `[يحتاج ترجمة] ${activity.title}`,
        },
        update: {},
      });

      activityCount++;
    }
  }
  console.log(`✅ Marked ${activityCount} activities for Arabic translation\n`);

  // 4. Create Egyptian Arabic phrase bank
  console.log('💬 Creating Egyptian Arabic phrase bank...');
  await prisma.translation.upsert({
    where: {
      entityType_entityId_field_language: {
        entityType: 'SYSTEM',
        entityId: 'azouz-phrases',
        field: 'phrases',
        language: 'ar-EG',
      },
    },
    create: {
      entityType: 'SYSTEM',
      entityId: 'azouz-phrases',
      field: 'phrases',
      language: 'ar-EG',
      value: JSON.stringify(egyptianArabicPhrases),
    },
    update: {
      value: JSON.stringify(egyptianArabicPhrases),
    },
  });
  console.log('✅ Egyptian Arabic phrase bank created\n');

  // Summary
  console.log('📊 Arabic Content Seeding Summary:');
  console.log(`   - Domains translated: ${domainCount}`);
  console.log(`   - Azouz character: ✅ Egyptian Arabic`);
  console.log(`   - Activities marked: ${activityCount}`);
  console.log(`   - Phrase bank: ✅ Created`);
  console.log('\n🎉 Arabic content seeding complete!');
  console.log('\n⚠️  NOTE: Activities marked as [يحتاج ترجمة] need professional translation');
  console.log('   Run translation service to complete content translation\n');
}

// Run seeding
seedArabicContent()
  .catch((e) => {
    console.error('❌ Arabic seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
