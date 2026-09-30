import type { TranslationSchema } from './en'

// Arabic — first-class, typed against the English schema so keys can't drift.
export const ar: TranslationSchema = {
  common: {
    appName: 'عوالم أسام التعليمية',
    loading: 'جارٍ التحميل…',
    retry: 'حاول مرة أخرى',
    back: 'رجوع',
    next: 'التالي',
    save: 'حفظ',
    cancel: 'إلغاء',
    logout: 'تسجيل الخروج',
    search: 'بحث',
  },
  nav: {
    home: 'الرئيسية',
    learn: 'تعلّم',
    practice: 'تدرّب',
    projects: 'المشاريع',
    progress: 'التقدّم',
  },
  public: {
    getStarted: 'ابدأ الآن',
    logIn: 'تسجيل الدخول',
    whatIsUsam: 'ما هو أسام؟',
    forFamilies: 'للعائلات',
    pricing: 'الأسعار',
    heroTitle: 'عالم تعليمي ينمو مع طفلك',
    heroSubtitle:
      'اللغة الإنجليزية والبرمجة والذكاء الاصطناعي والإبداع والتفكير الناقد — رحلة واحدة متصلة يرافقها أصدقاء ودودون.',
  },
  auth: {
    loginTitle: 'مرحبًا بعودتك',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    noAccount: 'جديد هنا؟',
    createAccount: 'أنشئ حسابًا',
  },
  states: {
    empty: 'لا يوجد شيء هنا بعد.',
    error: 'حدث خطأ ما.',
    restricted: 'ليس لديك صلاحية الوصول إلى هذه الصفحة.',
    notFound: 'تعذّر العثور على تلك الصفحة.',
  },
}
