// English strings (base shape). `ar.ts` is type-checked against this shape so
// Arabic can never silently drift from the key set.
export const en = {
  common: {
    appName: 'USAM Learning Worlds',
    loading: 'Loading…',
    retry: 'Try again',
    back: 'Back',
    next: 'Next',
    save: 'Save',
    cancel: 'Cancel',
    logout: 'Log out',
    search: 'Search',
  },
  nav: {
    home: 'Home',
    learn: 'Learn',
    practice: 'Practice',
    projects: 'Projects',
    progress: 'Progress',
  },
  public: {
    getStarted: 'Get started',
    logIn: 'Log in',
    whatIsUsam: 'What is USAM?',
    forFamilies: 'For families',
    pricing: 'Pricing',
    heroTitle: 'A learning world that grows with your child',
    heroSubtitle:
      'English, Coding, AI literacy, Creativity and Critical thinking — one connected journey, guided by friendly companions.',
  },
  auth: {
    loginTitle: 'Welcome back',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    invalidCredentials: 'Invalid email or password.',
    noAccount: 'New here?',
    createAccount: 'Create an account',
    signupTitle: 'Create your account',
    haveAccount: 'Already have an account?',
    iAmA: 'I am a…',
    learner: 'Learner',
    parent: 'Parent',
    firstName: 'First name',
    displayName: 'Display name',
    passwordHint: 'At least 8 characters',
    createFailed: 'Could not create the account. Please check your details.',
    emailTaken: 'That email is already registered.',
  },
  onboarding: {
    title: 'Let’s set things up',
    ageTitle: 'How old are you?',
    ageSubtitle: 'We’ll shape the experience to fit you.',
    interestsTitle: 'What do you want to explore?',
    interestsSubtitle: 'Pick a few — you can change these later.',
    finish: 'Start learning',
    saving: 'Saving…',
    savedError: 'Could not save. Please try again.',
    interests: {
      english: 'English',
      coding: 'Coding',
      ai: 'AI literacy',
      creativity: 'Creativity',
      thinking: 'Critical thinking',
    },
  },
  states: {
    empty: 'Nothing here yet.',
    error: 'Something went wrong.',
    restricted: 'You do not have access to this page.',
    notFound: 'We could not find that page.',
  },
}

/** Schema = the key structure with string leaves. `ar.ts` is typed against
 * this so the KEY SET can't drift, while allowing translated string values. */
type Stringify<T> = { [K in keyof T]: T[K] extends object ? Stringify<T[K]> : string }
export type TranslationSchema = Stringify<typeof en>
