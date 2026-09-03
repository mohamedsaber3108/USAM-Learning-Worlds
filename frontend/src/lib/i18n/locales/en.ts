/**
 * English locale — source-of-truth strings for the localization-wave-1
 * screens: AppShell nav, DashboardPage (incl. age-adaptive copyTone
 * strings), LandingPage hero, and the onboarding flow.
 */
export const en = {
  common: {
    appName: 'USAM Learning Worlds',
    logout: 'Logout',
    login: 'Log in',
  },
  nav: {
    home: 'Home',
    learn: 'Learn',
    missions: 'Missions',
    community: 'Community',
    profile: 'Profile',
    more: 'More',
  },
  more: {
    title: 'More',
    close: 'Close',
    shop: 'Shop',
    shopDesc: 'Spend XP on borders, badges, titles & themes',
    myJourney: 'My Journey',
    myJourneyDesc: 'Your activity timeline, patterns & stats',
    myPortfolio: 'My Portfolio',
    myPortfolioDesc: 'Your best showcased projects, all in one place',
    achievements: 'Achievements',
    achievementsDesc: 'Badges & milestones',
    leaderboard: 'Leaderboard',
    leaderboardDesc: 'See how you rank',
    progress: 'Progress',
    progressDesc: 'Your mastery over time',
    voiceChat: 'Voice Chat',
    voiceChatDesc: 'Talk with your AI coach',
    characters: 'Characters',
    charactersDesc: 'Meet your mentor team',
    timeLimits: 'Time Limits',
    timeLimitsDesc: "Manage a learner's screen time (via Parent Dashboard)",
    parentDashboard: 'Parent Dashboard',
    parentDashboardDesc: 'Guardian controls',
    english: 'English',
    englishDesc: 'Strands & AI coach',
    language: 'Language',
    languageDesc: 'Switch between English and Arabic',
  },
  dashboard: {
    welcomeBack: 'Welcome back, {{name}}',
    defaultLearnerName: 'Learner',
    greetingSubtext: {
      'encouraging-simple': "Let's have some fun learning today!",
      'encouraging-balanced': 'Ready to continue your learning journey?',
      'encouraging-mature': 'Ready to keep building on your progress?',
    },
    levelLabel: 'Level',
    levelHelptext: {
      'encouraging-simple': '{{xp}} of {{next}} stars to your next level!',
      'encouraging-balanced': '{{xp}} / {{next}} XP to next level',
      'encouraging-mature': '{{xp}} / {{next}} XP to next level',
    },
    totalXpLabel: 'Total XP',
    xpCelebration: {
      'encouraging-simple': 'Awesome job!',
      'encouraging-balanced': 'Great progress!',
      'encouraging-mature': "Nice work - you're building real momentum",
    },
    rankLabel: 'Rank #{{rank}}',
    streakLabel: 'Streak',
    streakCelebration: {
      'encouraging-simple': 'You did it!',
      'encouraging-balanced': "You're on a roll!",
      'encouraging-mature': 'Consistency is paying off',
    },
    bestStreak: 'Best: {{days}} days',
    rank: 'Rank',
    rankAmongAll: 'Among all active learners',
    rankKeepClimbing: 'Keep climbing!',
    masteryHeading: {
      'encouraging-simple': 'What you know so far',
      'encouraging-balanced': 'Mastery Progress',
      'encouraging-mature': 'Mastery Breakdown',
    },
    mastered: 'Mastered',
    learning: 'Learning',
    toExplore: 'To Explore',
    quickActionsHeading: {
      'encouraging-simple': 'What to do next',
      'encouraging-balanced': 'Quick Actions',
      'encouraging-mature': 'Quick Actions',
    },
    viewProgress: {
      'encouraging-simple': 'See My Progress',
      'encouraging-balanced': 'View Full Progress',
      'encouraging-mature': 'View Full Progress',
    },
    parentDashboard: 'Parent Dashboard',
    recentMissions: 'Recent Missions',
    missionCompleted: 'Completed',
    missionInProgress: 'In Progress',
    quickActions: {
      learn: 'Learn',
      missions: 'Missions',
      projects: 'Projects',
      community: 'Community',
      achievements: 'Achievements',
      leaderboard: 'Leaderboard',
      voiceChat: 'Voice Chat',
      english: 'English',
    },
  },
  landing: {
    logIn: 'Log in',
    heroTitle: 'Learning worlds kids actually want to explore',
    heroTitleHighlight: 'actually',
    heroSubtitle:
      'A bilingual (Arabic & English) learning adventure for ages 8–14 — missions, characters, and real subjects like math, science, coding, and language, guided by a cast of friendly mentors.',
    subjects: {
      mathematics: 'Mathematics',
      science: 'Science',
      language: 'Language',
      technology: 'Technology',
      arts: 'Arts & Creativity',
      socialStudies: 'Social Studies',
    },
    tryTitle: 'Try it now — pick your favorite guide',
    trySubtitle: 'No account needed. Tap a character to meet them.',
    startLearning: 'Start Learning',
    startLearningWith: 'Start learning with {{name}}',
    tip: "Tip: pick a character above first — we'll introduce you to them right after you sign up.",
  },
  onboarding: {
    stepLabels: {
      language: 'Language',
      welcome: 'Welcome',
      age: 'About you',
      character: 'Your guides',
      complete: 'All set',
    },
    welcome: {
      title: 'Welcome to USAM Learning Worlds!',
      subtitle:
        "A place where you'll go on missions, build cool projects, and level up your skills in coding, English, and more — one fun step at a time.",
      missionsPoint: 'Complete missions and earn XP as you learn',
      guidePoint: 'Get help from your own learning guide',
      getToKnow: "First, let's get to know you a little — it only takes a minute!",
      getStarted: "Let's Get Started",
    },
    language: {
      title: 'Choose your language',
      subtitle: 'You can change this any time in Settings.',
      continue: 'Continue',
    },
    age: {
      title: 'How old are you?',
      subtitle: "This helps us pick missions and lessons that fit you.",
      bands: {
        AGE_8_9: { label: 'Age 8-9', blurb: "I'm just starting my learning journey" },
        AGE_10_11: { label: 'Age 10-11', blurb: 'Ready for bigger challenges' },
        AGE_12_14: { label: 'Age 12-14', blurb: 'I want to level up fast' },
      },
      saving: 'Saving...',
      continue: 'Continue',
      error: "We couldn't save your age band. Please try again.",
    },
    character: {
      title: 'Meet your guide team',
      subtitle: "Four characters are with you from day one — flip through and get to know them all.",
      preferredPickSame: '{{name}} was your pick earlier too — great choice!',
      preferredPickOther:
        'You picked {{name}} as your favorite before — nice choice! But now the whole team is with you from the start.',
      next: 'Next',
      back: 'Back',
      continueWithAll: "Let's go!",
      dotAriaLabel: 'Go to {{name}}',
      azouz: {
        role: 'Your main guide',
        quote:
          "Hi, I'm Azouz! I'll be with you on every mission — cheering you on, giving hints when you're stuck, and throwing a little celebration every time you level up. Let's explore together!",
      },
      zein: {
        role: 'The explorer',
        quote:
          "I'm Zein! My passion is finding new worlds to learn in — hidden facts, shortcuts, and \"what if\" questions. Walk with me and we'll never run out of things to discover!",
      },
      luma: {
        role: 'English coach',
        quote:
          "Hey, I'm Luma! Words and language are my thing — reading, grammar, and talking about anything until it clicks. No boring drills, we turn practice into real conversation.",
      },
      codey: {
        role: 'Coding coach',
        quote:
          "Hey, I'm Codey! I build real things with code — games, tiny apps, weird experiments. Bugs don't scare me, and by the end they won't scare you either.",
      },
    },
    complete: {
      title: 'All set!',
      subtitle:
        'Your profile is ready and your guide team is waiting to walk you through your first mission. Let\'s head to your dashboard.',
      checklist: {
        language: 'Language selected',
        age: 'Age band saved',
        characters: 'Met your guide team',
        ready: 'Ready to start learning',
      },
      cta: 'Go to my dashboard',
    },
  },
  language: {
    toggleLabel: 'Language',
    english: 'English',
    arabic: 'العربية',
  },
};

export type TranslationKeys = typeof en;
