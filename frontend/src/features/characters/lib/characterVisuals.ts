/**
 * Per-character visual identity: icon + accent color + bilingual copy,
 * keyed by character *name* (the stable, human-authored key — ids are DB
 * uuids and roles are shared across several characters, e.g. multiple
 * MENTOR roles).
 *
 * Real, hand-crafted illustrated-style SVG art exists for all 15 characters
 * (see components/CharacterFace.tsx — one bespoke design per character, not
 * a shared shape recolored) and CharacterAvatar renders it. This file only
 * supplies the small lucide-react icon + accent color used as a secondary
 * accent (role badges etc.) and the bilingual name/blurb copy — it is not
 * the primary art source.
 *
 * Arabic content here is copied verbatim from
 * backend/prisma/seeds/seed-character-universe.ts (`nameAr`) and
 * backend/prisma/seeds/seed-arabic-human-approved.ts (`characterBlurbsAr`,
 * written to the Translation table as entityType 'CHARACTER',
 * field 'personalityAr', language 'ar-EG', isHumanApproved: true) — real
 * human-authored Egyptian Arabic, not machine-translated or invented here.
 */
import {
  Sparkles,
  Compass,
  Languages,
  Code2,
  Cpu,
  Palette,
  FlaskConical,
  Puzzle,
  Mic2,
  Rocket,
  ShieldCheck,
  PiggyBank,
  Flame,
  BookOpen,
  Map,
  type LucideIcon,
} from 'lucide-react'

export interface CharacterVisual {
  icon: LucideIcon
  /** Tailwind-friendly hex used for the avatar background circle. */
  color: string
  /** One-line role/specialty description shown on gallery cards (English). */
  blurb: string
  /** Arabic name — matches `personality.nameAr` seeded on the Character row. */
  nameAr: string
  /**
   * Human-approved Egyptian-Arabic personality blurb, copied verbatim from
   * seed-arabic-human-approved.ts's `characterBlurbsAr` map. The gallery
   * prefers the live Translation row (GET /translations/CHARACTER/:id?
   * language=ar-EG) when the backend returns one, and falls back to this
   * exact text otherwise — never inventing new Arabic copy client-side.
   */
  blurbAr: string
}

export const CHARACTER_VISUALS: Record<string, CharacterVisual> = {
  Azouz: {
    icon: Sparkles,
    color: '#F59E0B',
    blurb: 'Your main learning guide, here for anything',
    nameAr: 'عزوز',
    blurbAr:
      'أنا عزوز، صاحبك الأول في USAM! فضولي وبحب أسألك أسئلة تخليك تفكر بنفسك، وهفضل جنبك في كل خطوة من رحلة التعلم بتاعتك.',
  },
  Zein: {
    icon: Compass,
    color: '#0EA5E9',
    blurb: 'Explorer — helps you discover new worlds to learn',
    nameAr: 'زين',
    blurbAr:
      'أنا زين، "المستكشف"! طاقتي عالية ودايمًا نازل أدوّر على عوالم ومهمات جديدة. مش هجاوبلك على كل حاجة، بس هخليك تتحمس تجرب حاجة جديدة بنفسك.',
  },
  Luma: {
    icon: Languages,
    color: '#8B5CF6',
    blurb: 'English coach — conversation, grammar & reading',
    nameAr: 'لوما',
    blurbAr:
      'أنا لوما، مدربتك في اللغة الإنجليزية. صبورة معاك جدًا، وكل غلطة عندي هي خطوة كويسة في طريق التعلم. هساعدك تتكلم وتكتب إنجليزي بثقة أكتر يوم عن يوم.',
  },
  Codey: {
    icon: Code2,
    color: '#22C55E',
    blurb: 'Coding mentor — builds real projects with you',
    nameAr: 'كودي',
    blurbAr:
      'أنا كودي، مرشدك في البرمجة والتفكير المنطقي. بحب الأفكار الذكية، وقبل ما نكتب أي كود هنفكر مع بعض في الخطة. كل باج (bug) بالنسبالنا فرصة نتعلم منها، مش مشكلة.',
  },
  Nova: {
    icon: Cpu,
    color: '#6366F1',
    blurb: 'AI mentor — demystifies how smart machines think',
    nameAr: 'نوفا',
    blurbAr:
      'أنا نوفا، مرشدتك في تعليم الذكاء الاصطناعي. هفهمك إزاي الذكاء الاصطناعي شغال بطريقة سهلة وصريحة، وهعلّمك برضه إنه ممكن يغلط - فلازم دايمًا نفكر وننقّد الكلام اللي بيقوله.',
  },
  Mira: {
    icon: Palette,
    color: '#EC4899',
    blurb: 'Creative mentor — art, design & imagination',
    nameAr: 'ميرا',
    blurbAr:
      'أنا ميرا، مرشدتك في الإبداع والتصميم. كل فكرة عندي ليها قيمة، حتى لو غريبة أو مختلفة. هساعدك تطلع أفكارك من قلبك من غير خوف من الحكم عليها.',
  },
  Rami: {
    icon: FlaskConical,
    color: '#14B8A6',
    blurb: 'Science mentor — experiments & discovery',
    nameAr: 'رامي',
    blurbAr:
      'أنا رامي، مرشدك في العلوم. بحب أسأل "ليه؟" قبل أي حاجة، وهساعدك تلاحظ وتجرب وتفكر زي عالم حقيقي - التخمين المدروس عندي إنجاز، مش غلطة.',
  },
  Faris: {
    icon: Puzzle,
    color: '#F97316',
    blurb: 'Problem solver — logic puzzles & strategy',
    nameAr: 'فارس',
    blurbAr:
      'أنا فارس، "حلّال المشاكل". بحب الألغاز والتحديات المنطقية، وهساعدك تقسّم أي مشكلة كبيرة لخطوات صغيرة سهلة، وهفضل هادي معاك حتى في أصعب سؤال.',
  },
  Tala: {
    icon: Mic2,
    color: '#D946EF',
    blurb: 'Communication coach — speaking & presenting',
    nameAr: 'تالا',
    blurbAr:
      'أنا تالا، مدربة الثقة والتواصل بتاعتك. هساعدك تحس إنك فخور بشغلك وتقدر تحكي عنه بصوت عالي وواضح - كل تدريب بسيط بيقربك من الثقة اللي محتاجها.',
  },
  Adam: {
    icon: Rocket,
    color: '#EF4444',
    blurb: 'Entrepreneurship mentor — ideas into ventures',
    nameAr: 'آدم',
    blurbAr:
      'أنا آدم، مرشدك في ريادة الأعمال للأطفال. هساعدك تلاحظ مشاكل حواليك وتفكر في حلول بسيطة وحقيقية للناس، وهعلّمك إن أي فكرة ممكن تتحسن بعد ما تجربها.',
  },
  Byte: {
    icon: ShieldCheck,
    color: '#0891B2',
    blurb: 'Digital safety guide — smart & safe online',
    nameAr: 'بايت',
    blurbAr:
      'أنا بايت، "حامي الأمان الرقمي". شغلي إني أساعدك تكون فاهم إزاي تحمي نفسك وخصوصيتك أونلاين من غير خوف - الإنترنت ممكن يكون ممتع وأمان في نفس الوقت.',
  },
  Nour: {
    icon: PiggyBank,
    color: '#65A30D',
    blurb: 'Financial literacy mentor — money smarts',
    nameAr: 'نور',
    blurbAr:
      'أنا نور، مرشدك في الفلوس والمهارات الحياتية. هعلّمك تفتكر كويس قبل ما تصرف، وتوفر بذكاء، من خلال أمثلة بسيطة من حياتك اليومية زي المصروف والادخار.',
  },
  Rex: {
    icon: Flame,
    color: '#DC2626',
    blurb: 'Rival — challenges you to beat your best',
    nameAr: 'ريكس',
    blurbAr:
      'أنا ريكس، "الخصم اللطيف"! بحب المنافسة الودّية، بس دايمًا مع نفسك بس - كسر أرقامك القديمة إنت، مش المقارنة بحد تاني. يلا نشوف تقدر تعدّي نفسك امبارح؟',
  },
  Zara: {
    icon: BookOpen,
    color: '#7C3AED',
    blurb: 'Storyteller — narrative worlds & imagination',
    nameAr: 'زارا',
    blurbAr:
      'أنا زارا، راوية القصص بتاعتك. كل مهمة بتخلّصها هي فصل جديد في حكايتك الخاصة، وهساعدك تشوف رحلتك في التعلم كأنها مغامرة حقيقية إنت البطل فيها.',
  },
  Atlas: {
    icon: Map,
    color: '#0D9488',
    blurb: 'World guide — navigates the whole learning map',
    nameAr: 'أطلس',
    blurbAr:
      'أنا أطلس، مرشد العوالم بتاعك. لما تحس إنك تايه أو مش عارف تعمل إيه بعد كده، هوريك الخريطة كلها - إنت وصلت لفين، وإيه اللي فاضل تستكشفه.',
  },
}

export const DEFAULT_CHARACTER_VISUAL: CharacterVisual = {
  icon: Sparkles,
  color: '#94A3B8',
  blurb: 'A mentor from the USAM character universe',
  nameAr: '',
  blurbAr: '',
}

export function getCharacterVisual(name: string): CharacterVisual {
  return CHARACTER_VISUALS[name] ?? DEFAULT_CHARACTER_VISUAL
}
