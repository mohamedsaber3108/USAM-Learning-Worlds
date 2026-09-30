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
