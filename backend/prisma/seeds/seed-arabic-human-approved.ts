/**
 * Arabic Educational Content Engine + Translation QA Engine (v1)
 *
 * Real, hand-written (NOT machine-translated) Egyptian-Arabic-appropriate
 * Arabic content for the two highest-traffic English content sets in the
 * platform, each marked isHumanApproved: true because a human deliberately
 * composed this exact Arabic wording for this exact purpose (not run
 * through an LLM/MT pipeline and not a raw literal translation):
 *
 *   1. The 15 named Character personality blurbs (short "who am I" bios,
 *      distinct from the full systemPrompt which Azouz already has an
 *      Egyptian-Arabic version of in seed-arabic.ts) - field: 'personalityAr'
 *   2. The 28 DigitalLiteracyConcept name + description pairs - fields:
 *      'name' and 'description'
 *
 * This is the "controlled, non-hallucinated" approval gate the gap matrix
 * calls for, applied to real content rather than left as an empty
 * boolean column with nothing in it. Idempotent: safe to re-run.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPROVED_BY = 'human-content-author:usam-wave2-cluster-7';

// ---------------------------------------------------------------------------
// 1. Character personality blurbs - short, warm, Egyptian-Arabic "who I am"
//    bios a child would read/hear when meeting each character. Distinct
//    from the long systemPrompt (an LLM instruction doc); this is child-
//    facing copy.
// ---------------------------------------------------------------------------
const characterBlurbsAr: Record<string, string> = {
  Azouz:
    'أنا عزوز، صاحبك الأول في USAM! فضولي وبحب أسألك أسئلة تخليك تفكر بنفسك، وهفضل جنبك في كل خطوة من رحلة التعلم بتاعتك.',
  Zein:
    'أنا زين، "المستكشف"! طاقتي عالية ودايمًا نازل أدوّر على عوالم ومهمات جديدة. مش هجاوبلك على كل حاجة، بس هخليك تتحمس تجرب حاجة جديدة بنفسك.',
  Luma:
    'أنا لوما، مدربتك في اللغة الإنجليزية. صبورة معاك جدًا، وكل غلطة عندي هي خطوة كويسة في طريق التعلم. هساعدك تتكلم وتكتب إنجليزي بثقة أكتر يوم عن يوم.',
  Codey:
    'أنا كودي، مرشدك في البرمجة والتفكير المنطقي. بحب الأفكار الذكية، وقبل ما نكتب أي كود هنفكر مع بعض في الخطة. كل باج (bug) بالنسبالنا فرصة نتعلم منها، مش مشكلة.',
  Nova:
    'أنا نوفا، مرشدتك في تعليم الذكاء الاصطناعي. هفهمك إزاي الذكاء الاصطناعي شغال بطريقة سهلة وصريحة، وهعلّمك برضه إنه ممكن يغلط - فلازم دايمًا نفكر وننقّد الكلام اللي بيقوله.',
  Mira:
    'أنا ميرا، مرشدتك في الإبداع والتصميم. كل فكرة عندي ليها قيمة، حتى لو غريبة أو مختلفة. هساعدك تطلع أفكارك من قلبك من غير خوف من الحكم عليها.',
  Rami:
    'أنا رامي، مرشدك في العلوم. بحب أسأل "ليه؟" قبل أي حاجة، وهساعدك تلاحظ وتجرب وتفكر زي عالم حقيقي - التخمين المدروس عندي إنجاز، مش غلطة.',
  Faris:
    'أنا فارس، "حلّال المشاكل". بحب الألغاز والتحديات المنطقية، وهساعدك تقسّم أي مشكلة كبيرة لخطوات صغيرة سهلة، وهفضل هادي معاك حتى في أصعب سؤال.',
  Tala:
    'أنا تالا، مدربة الثقة والتواصل بتاعتك. هساعدك تحس إنك فخور بشغلك وتقدر تحكي عنه بصوت عالي وواضح - كل تدريب بسيط بيقربك من الثقة اللي محتاجها.',
  Adam:
    'أنا آدم، مرشدك في ريادة الأعمال للأطفال. هساعدك تلاحظ مشاكل حواليك وتفكر في حلول بسيطة وحقيقية للناس، وهعلّمك إن أي فكرة ممكن تتحسن بعد ما تجربها.',
  Byte:
    'أنا بايت، "حامي الأمان الرقمي". شغلي إني أساعدك تكون فاهم إزاي تحمي نفسك وخصوصيتك أونلاين من غير خوف - الإنترنت ممكن يكون ممتع وأمان في نفس الوقت.',
  Nour:
    'أنا نور، مرشدك في الفلوس والمهارات الحياتية. هعلّمك تفتكر كويس قبل ما تصرف، وتوفر بذكاء، من خلال أمثلة بسيطة من حياتك اليومية زي المصروف والادخار.',
  Rex:
    'أنا ريكس، "الخصم اللطيف"! بحب المنافسة الودّية، بس دايمًا مع نفسك بس - كسر أرقامك القديمة إنت، مش المقارنة بحد تاني. يلا نشوف تقدر تعدّي نفسك امبارح؟',
  Zara:
    'أنا زارا، راوية القصص بتاعتك. كل مهمة بتخلّصها هي فصل جديد في حكايتك الخاصة، وهساعدك تشوف رحلتك في التعلم كأنها مغامرة حقيقية إنت البطل فيها.',
  Atlas:
    'أنا أطلس، مرشد العوالم بتاعك. لما تحس إنك تايه أو مش عارف تعمل إيه بعد كده، هوريك الخريطة كلها - إنت وصلت لفين، وإيه اللي فاضل تستكشفه.',
};

// ---------------------------------------------------------------------------
// 2. Digital Literacy Concepts - 28 name + description pairs, hand-written
//    in natural Egyptian Arabic appropriate for ages 8-14 (not literal
//    word-for-word translations of the English - re-composed so they read
//    naturally to an Egyptian child).
// ---------------------------------------------------------------------------
const digitalLiteracyAr: Record<string, { name: string; description: string }> = {
  'trusted-adults-for-anything-weird-online': {
    name: 'كبير تثق فيه لأي حاجة غريبة أونلاين',
    description:
      'لو جاتلك رسالة أو دعوة لعبة أو إعلان مفاجئ حسّيته غريب أو مخيف أو مش مفهوم، الحركة الصح إنك تقول لكبير تثق فيه على طول. مش هتقع في مشكلة لو وريته حاجة غريبة، حتى لو ضغطت عليها بالغلط.',
  },
  'strangers-online-are-still-strangers': {
    name: 'الغريب أونلاين لسه غريب',
    description:
      'حد تعرفت عليه بس من خلال الشاشة - حتى لو بيبدو ودود أو بيحب حاجات زيك أو بيقول إنه طفل زيك - هو لسه شخص غريب. نفس قاعدة الحياة الحقيقية سارية: مايصحش تقوله عنوانك أو اسم مدرستك أو تقابله من غير ما كبير يعرف.',
  },
  'reading-before-you-click': {
    name: 'اقرا الأول قبل ما تدوس',
    description:
      'الإعلانات المفاجئة اللي بتقول "كسبت جايزة" أو الأزرار اللي بتلمع "دوس هنا حالًا"، غالبًا مصممة عشان تخليك تدوس بسرعة من غير تفكير. قبل ما تدوس على حاجة مفاجئة، وقف وقرا كويس، أو اسأل كبير لو مش متأكد.',
  },
  'spotting-manipulation-tactics': {
    name: 'اكتشاف أسلوب الخداع',
    description:
      'النصابين وأصحاب النوايا السيئة بيستخدموا الاستعجال ("اعمل ده حالًا!") أو الخوف ("حسابك هيتقفل!") أو المديح ("إنت مميز، احتفظ بالسر ده") عشان يخلوك تتصرف من غير تفكير. لو عرفت الأسلوب ده، هتقدر تحمي نفسك في أي مكان أونلاين.',
  },
  'secret-from-parents-red-flag': {
    name: 'لو حد طلب منك تخفي كلام عن والديك',
    description:
      'أخطر علامة تحذير في أي محادثة أونلاين هي لو حد - صاحب، غريب، أو حد بيتظاهر إنه طفل زيك - طلب منك تخبّي المحادثة عن والديك. العلاقات السليمة، أونلاين أو في الحياة الحقيقية، مش محتاجة تتخبّى.',
  },
  'not-everything-online-is-true': {
    name: 'مش كل اللي على النت صحيح',
    description:
      'أي حد ممكن يكتب أي حاجة على النت، حتى لو مش صحيحة. مجرد إن الحاجة مكتوبة أو ليها مشاهدات كتير أو شكلها رسمي، ده مايعنيش إنها صح - زي شائعة في المدرسة ممكن تكون غلط حتى لو كل زمايلك بيكرروها.',
  },
  'checking-if-a-photo-is-real': {
    name: 'التأكد لو الصورة حقيقية زي ما تقول',
    description:
      'الصور والفيديوهات ممكن تكون قديمة أو مأخوذة من مكان تاني أو معمولة بتمثيل أو معدّلة عشان تخدع الناس. قبل ما تصدق صورة غريبة، اسأل نفسك: ده منطقي؟ ممكن تكون من مكان أو زمان تاني؟ فيه مصدر تاني بيقول نفس الكلام؟',
  },
  'what-deepfakes-are': {
    name: 'الديب فيك والمحتوى المصنوع بالذكاء الاصطناعي',
    description:
      'برامج الذكاء الاصطناعي بقت تقدر تصنع صور وفيديوهات وأصوات مزيفة لناس حقيقيين بيقولوا أو بيعملوا حاجات مايعملوهاش أبدًا. لما تعرف إن التكنولوجيا دي موجودة، هتخلّيك تفكر مرتين قبل ما تصدق حاجة غريبة، حتى لو شكلها مقنع.',
  },
  'checking-more-than-one-source': {
    name: 'التأكد من أكتر من مصدر',
    description:
      'لو الخبر الكبير صحيح، أكتر من مصدر موثوق هيكون بينشره - مش بوست واحد بس من حد مش معروف. قبل ما تصدق أو تشارك خبر مفاجئ، خد ثواني وشوف لو موقع إخباري معروف أو جهة موثوقة بتأكد الخبر ده كمان.',
  },
  'emotional-headlines-warning-sign': {
    name: 'العناوين اللي بتهيّج مشاعرك علامة تحذير',
    description:
      'العناوين والبوستات المصممة عشان تخليك تحس بغضب أو خوف أو صدمة فورًا، غالبًا مكتوبة كده عن قصد - المشاعر القوية بتخلي الناس تشارك قبل ما تتحقق من الحقيقة. لما تلاحظ رد فعلك القوي، ده نفسه علامة إنك تهدّي وتتأكد.',
  },
  'full-name-address-school-stay-private': {
    name: 'اسمك الكامل وعنوانك ومدرستك حاجات خاصة',
    description:
      'اسمك الكامل وعنوان بيتك ونمرة تليفونك واسم مدرستك معلومات خاصة. تقدر تستخدم اسم مستخدم حلو وتحكي عن اهتماماتك، بس التفاصيل اللي ممكن تساعد غريب يوصل لك في الحياة الحقيقية مايصحش تنزلها على العام.',
  },
  'photos-reveal-more-than-you-think': {
    name: 'الصور ممكن تفضح أكتر ما تتخيل',
    description:
      'صورة لشارعك أو يونيفورم مدرستك أو أوضتك بتفاصيل واضحة ممكن تكشف مكان سكنك أو مدرستك، حتى لو معملتش كده بالكلام. قبل ما تنزّل صورة، بص للخلفية، مش لنفسك بس.',
  },
  'location-sharing-and-why-it-matters': {
    name: 'مشاركة الموقع وليه ده مهم',
    description:
      'تطبيقات كتير بتضيف موقعك الدقيق للصور والبوستات، أو بتوري موقعك لحظة بلحظة لغيرك. إنك تفهم إيه التطبيقات اللي بتتبع موقعك، وتقفلها للبوستات العامة، ده مهارة خصوصية حقيقية، مش إعداد تسيبه من غير اهتمام.',
  },
  'once-you-post-it-you-cant-take-it-back': {
    name: 'اللي تنزّله ممكن مايتمسحش خالص',
    description:
      'حتى البوست اللي تمسحه ممكن يكون حد شافه أو حفظه أو شاركه قبل ما يختفي. سؤال زي "أنا مبسوط إن أي حد - مدرّس، صاحب شغل في المستقبل، غريب - يشوف البوست ده؟" قبل ما تنزّله، عادة كويسة تفيدك طول عمرك.',
  },
  'treat-people-online-like-in-person': {
    name: 'عامل الناس أونلاين زي ما تعاملهم قدامك',
    description:
      'ورا كل اسم على الشاشة فيه شخص حقيقي بمشاعر حقيقية. قبل ما تكتب تعليق، تخيّل إنك بتقوله في وشّه - لو هيجرحه لو قلته قدامه، هيجرحه أونلاين برضه.',
  },
  'what-to-do-if-you-see-cyberbullying': {
    name: 'لو شفت حد بيتنمّر على حد أونلاين',
    description:
      'لو شفت حد بيتنمّر أو بيتم استبعاده أونلاين، تقدر تساعد من غير ما تدخل في المشكلة: ماتضحكش على اللي بيحصل، قول لكبير تثق فيه، وممكن كمان تبعت رسالة لطيفة للشخص اللي بيتنمّر عليه لو حسّيت إنها آمنة. السكوت بيسيب الأذى مستمر، والحركة الصغيرة ممكن توقفه.',
  },
  'screenshots-last-forever': {
    name: 'الاسكرين شوت يفضل موجود للأبد',
    description:
      'رسالة تفتكر إنها خاصة أو هتتمسح لوحدها، ممكن حد ياخد لها اسكرين شوت ويشاركها للأبد. أي كلام تحس إنك مش عايز والديك أو مدرّسك يشوفوه، فيه خطورة إنك تكتبه حتى في الشات "الخاص".',
  },
  'your-digital-footprint': {
    name: 'أثرك الرقمي',
    description:
      'كل حاجة تنزّلها أو تعمل لايك عليها أو تعلّق عليها أو تبحث عنها بتبني "أثر رقمي" - سيرة بتفضل موجودة لسنين. إنك تفكر كويس في اللي بتضيفه للأثر ده دلوقتي، ده بيحمي سمعتك لما تكبر، حتى لما تكون شاب أو راجل.',
  },
  'ads-are-trying-to-get-you-to-buy-something': {
    name: 'الإعلان شغله إنه يخليك تشتري أو تدوس على حاجة',
    description:
      'شغل الإعلان إنه يخليك تشتري منتج أو تنزّل تطبيق أو تدوس على لينك - ده مختلف عن فيديو أو بوست شغله بس إنه يعلّمك أو يسليك. لما تسأل نفسك "لحظة، ده بيحاول يبيعلي حاجة؟"، ده أول خطوة عشان تعرف تكشف الإعلان.',
  },
  'spotting-sponsored-content': {
    name: 'اكتشاف المحتوى الممول وإعلانات المشاهير',
    description:
      'لما يوتيوبر أو مشهور على السوشيال ميديا يعرض منتج ويقول كلمة زي "ممول" أو "إعلان" أو "#ad"، ده معناه شركة دفعتله عشان يتكلم عليه - رأيه هنا ممكن مايكونش مستقل بالكامل. لما تدوّر على الكلمات دي، هتقدر تفرّق بين النصيحة الحقيقية والإعلان المدفوع.',
  },
  'how-free-games-and-apps-make-money': {
    name: 'إزاي الألعاب والتطبيقات المجانية بتكسب فلوس',
    description:
      'التطبيقات "المجانية" غالبًا بتكسب من الإعلانات أو جمع البيانات أو المشتريات الداخلية اللي بتحس إنها صغيرة (جنيهين هنا، تلاتة هناك) بس بتتجمّع مع بعض. لما تفهم الطريقة دي في الكسب، هتقدر تاخد قرارات أذكى في اللي تنزّله وتشتريه.',
  },
  'passwords-are-like-house-keys': {
    name: 'الباسورد زي مفتاح البيت - ماتشاركه مع حد',
    description:
      'الباسورد بيحمي حسابك زي ما المفتاح بيحمي بيتك. مايصحش تعطيه لصحابك حتى لو أعز صحابك، لأنك مش هتتحكم في اللي هيعمله بالحساب بعد ما ياخده، حتى بالغلط.',
  },
  'what-makes-a-password-strong': {
    name: 'إيه اللي يخلي الباسورد قوي',
    description:
      'الباسورد القوي طويل، وفيه خليط من حروف وأرقام ورموز، ومش حاجة سهل حد يخمّنها زي تاريخ ميلادك أو اسم حيوانك. باسورد زي "نمر٤٢حبيبي!" أصعب بكتير من "123456" أو اسمك.',
  },
  'why-reusing-passwords-is-risky': {
    name: 'ليه استخدام نفس الباسورد في كل حساب خطر',
    description:
      'لو استخدمت نفس الباسورد في كل حساب وموقع اتخرق، الهاكرز هيجربوا نفس الباسورد على حساباتك التانية. استخدام باسورد مختلف لكل حساب - أو برنامج لحفظ الباسوردات - بيقلّل الضرر لو حصل اختراق في مكان واحد.',
  },
  'what-two-factor-authentication-does': {
    name: 'دور التحقق بخطوتين',
    description:
      'التحقق بخطوتين بيضيف خطوة كمان بعد الباسورد - زي كود يوصلك على التليفون - عشان حتى لو حد سرق باسوردك، مايقدرش يدخل من غير الخطوة التانية دي. تشغيله للحسابات المهمة من أحسن طرق الحماية الموجودة.',
  },
  'noticing-how-long-on-a-screen': {
    name: 'ملاحظة قد إيه إنت فاضل على الشاشة',
    description:
      'سهل إنك تنسى الوقت وإنت بتلعب أو بتتفرج - عشر دقايق ممكن تتحول لساعة من غير ما تحس. إنك تبص للساعة أو تقيّم وقت الشاشة قبل وبعد استخدام التطبيق، ده بيخليك تعرف فعلًا بتصرف وقتك في إيه.',
  },
  'how-screens-before-bed-affect-sleep': {
    name: 'إزاي الشاشة قبل النوم بتأثر على نومك',
    description:
      'الشاشة الضوية والمحتوى الممتع قبل النوم ممكن يخلّي النوم أصعب ويقلّل من جودته، حتى لو حاسس إنك مش تعبان وقتها. إنك تسيب وقت من غير شاشة قبل النوم بيساعدك تحس بحال أحسن ثاني يوم.',
  },
  'why-some-apps-are-designed-to-be-hard-to-put-down': {
    name: 'ليه بعض التطبيقات معمولة عشان تكون صعب تسيبها',
    description:
      'خصائص زي التشغيل الأوتوماتيكي والسكرول اللانهائي والنقاط والجوايز، معمولة عن قصد عشان تخليك تستخدم التطبيق أطول وقت ممكن - ده هدف شركتهم، مش بالضرورة الأحسن لك. لما تعرف الحيل دي، هتقدر تحدد وقتك بنفسك عن قصد، مش بالغلط.',
  },
};

async function seedCharacterBlurbs() {
  console.log('Character personality blurbs (Egyptian Arabic, human-approved)...');
  const characters = await prisma.character.findMany({
    where: { name: { in: Object.keys(characterBlurbsAr) } },
  });

  let count = 0;
  for (const character of characters) {
    const blurb = characterBlurbsAr[character.name];
    if (!blurb) continue;

    await prisma.translation.upsert({
      where: {
        entityType_entityId_field_language: {
          entityType: 'CHARACTER',
          entityId: character.id,
          field: 'personalityAr',
          language: 'ar-EG',
        },
      },
      create: {
        entityType: 'CHARACTER',
        entityId: character.id,
        field: 'personalityAr',
        language: 'ar-EG',
        value: blurb,
        isHumanApproved: true,
        approvedBy: APPROVED_BY,
        approvedAt: new Date(),
      },
      update: {
        value: blurb,
        isHumanApproved: true,
        approvedBy: APPROVED_BY,
        approvedAt: new Date(),
      },
    });
    count++;
  }
  console.log(`  -> ${count}/${Object.keys(characterBlurbsAr).length} character blurbs seeded.`);
  if (count < Object.keys(characterBlurbsAr).length) {
    const found = new Set(characters.map((c) => c.name));
    const missing = Object.keys(characterBlurbsAr).filter((n) => !found.has(n));
    console.warn(`  !! Characters not found in DB (skipped): ${missing.join(', ')}`);
  }
}

async function seedDigitalLiteracyConcepts() {
  console.log('Digital Literacy concept name+description (Egyptian Arabic, human-approved)...');
  const concepts = await prisma.digitalLiteracyConcept.findMany({
    where: { slug: { in: Object.keys(digitalLiteracyAr) } },
  });

  let nameCount = 0;
  let descCount = 0;
  for (const concept of concepts) {
    const ar = digitalLiteracyAr[concept.slug];
    if (!ar) continue;

    await prisma.translation.upsert({
      where: {
        entityType_entityId_field_language: {
          entityType: 'DIGITAL_LITERACY_CONCEPT',
          entityId: concept.id,
          field: 'name',
          language: 'ar-EG',
        },
      },
      create: {
        entityType: 'DIGITAL_LITERACY_CONCEPT',
        entityId: concept.id,
        field: 'name',
        language: 'ar-EG',
        value: ar.name,
        isHumanApproved: true,
        approvedBy: APPROVED_BY,
        approvedAt: new Date(),
      },
      update: {
        value: ar.name,
        isHumanApproved: true,
        approvedBy: APPROVED_BY,
        approvedAt: new Date(),
      },
    });
    nameCount++;

    await prisma.translation.upsert({
      where: {
        entityType_entityId_field_language: {
          entityType: 'DIGITAL_LITERACY_CONCEPT',
          entityId: concept.id,
          field: 'description',
          language: 'ar-EG',
        },
      },
      create: {
        entityType: 'DIGITAL_LITERACY_CONCEPT',
        entityId: concept.id,
        field: 'description',
        language: 'ar-EG',
        value: ar.description,
        isHumanApproved: true,
        approvedBy: APPROVED_BY,
        approvedAt: new Date(),
      },
      update: {
        value: ar.description,
        isHumanApproved: true,
        approvedBy: APPROVED_BY,
        approvedAt: new Date(),
      },
    });
    descCount++;
  }

  console.log(
    `  -> ${nameCount} names + ${descCount} descriptions seeded (of ${Object.keys(digitalLiteracyAr).length} concepts mapped).`,
  );
  if (concepts.length < Object.keys(digitalLiteracyAr).length) {
    const found = new Set(concepts.map((c) => c.slug));
    const missing = Object.keys(digitalLiteracyAr).filter((s) => !found.has(s));
    console.warn(`  !! Concepts not found in DB (skipped): ${missing.join(', ')}`);
  }
}

async function main() {
  console.log('🇪🇬 Seeding human-approved Egyptian Arabic content (Arabic Educational Content Engine + Translation QA Engine v1)...\n');
  await seedCharacterBlurbs();
  await seedDigitalLiteracyConcepts();
  console.log('\n✅ Done. All rows written by this script have isHumanApproved = true.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
