/**
 * Digital Literacy Concepts Seeding
 *
 * Seeds DigitalLiteracyConcept with real, age-appropriate content for
 * learners aged 8-14, matching the pattern established in
 * seed-cross-curricular.ts (AILiteracyConcept / EntrepreneurshipConcept /
 * FinancialLiteracyConcept).
 *
 * Age bands (AgeBand enum): AGE_8_9, AGE_10_11, AGE_12_14
 *
 * Categories:
 *   ONLINE_SAFETY        - basic rules for staying safe online
 *   MISINFORMATION       - recognizing fake content, ads, and manipulation
 *   PRIVACY              - what's OK to share vs. keep private
 *   DIGITAL_CITIZENSHIP  - kindness, empathy, and behavior online
 *   ADS_VS_CONTENT       - telling sponsored/ad content apart from real content
 *   ACCOUNT_SAFETY       - passwords, logins, and account basics
 *   SCREEN_TIME          - self-awareness about device/screen habits
 */

import { PrismaClient, AgeBand } from '@prisma/client';

const prisma = new PrismaClient();

const digitalLiteracyConcepts = [
  // ---------------------------------------------------------------------
  // ONLINE SAFETY BASICS
  // ---------------------------------------------------------------------
  {
    name: 'Trusted Adults for Anything Weird Online',
    slug: 'trusted-adults-for-anything-weird-online',
    description:
      "If a message, game invite, or pop-up online ever feels weird, scary, or confusing, the right move is to tell a trusted adult right away — you won't get in trouble for showing them something strange, even if you clicked on it by accident.",
    category: 'ONLINE_SAFETY',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 1,
  },
  {
    name: 'Strangers Online Are Still Strangers',
    slug: 'strangers-online-are-still-strangers',
    description:
      "Someone you've only met through a screen — even if they seem friendly, share your interests, or say they're a kid too — is still a stranger. The same rule from real life applies: don't share your address, school name, or meet up in person without a trusted adult knowing.",
    category: 'ONLINE_SAFETY',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 2,
  },
  {
    name: 'Reading Before You Click',
    slug: 'reading-before-you-click',
    description:
      "Pop-ups that say you 'won' something, or buttons that flash 'Download Now', are often designed to get you to click fast without thinking. Before clicking anything unexpected, pause and read what it actually says — or ask an adult if you're not sure.",
    category: 'ONLINE_SAFETY',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 3,
  },
  {
    name: 'Spotting Manipulation Tactics',
    slug: 'spotting-manipulation-tactics',
    description:
      "Scammers and bad actors use urgency ('act now!'), fear ('your account will be deleted!'), or flattery ('you're special, share this secret') to get people to act without thinking. Recognizing these patterns — regardless of the platform — is a skill that protects you for life, not just online.",
    category: 'ONLINE_SAFETY',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 4,
  },
  {
    name: 'When Someone Asks You to Keep a Secret From Parents',
    slug: 'secret-from-parents-red-flag',
    description:
      "A major warning sign in online conversations is anyone — friend, stranger, or someone posing as a kid — asking you to keep the conversation secret from your parents or guardians. Healthy relationships, online or offline, don't need to be hidden.",
    category: 'ONLINE_SAFETY',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 5,
  },

  // ---------------------------------------------------------------------
  // MISINFORMATION / RECOGNIZING FAKE CONTENT
  // ---------------------------------------------------------------------
  {
    name: 'Not Everything Online Is True',
    slug: 'not-everything-online-is-true',
    description:
      "Anyone can post anything online, even if it's false. Just because something is written down, has a lot of views, or looks official doesn't mean it's true — the same way a rumor at school could be wrong even if lots of kids repeat it.",
    category: 'MISINFORMATION',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 6,
  },
  {
    name: 'Checking If a Photo Is Really What It Claims',
    slug: 'checking-if-a-photo-is-real',
    description:
      "Photos and videos can be old, taken out of context, staged, or edited to trick people. Before believing a surprising photo, ask: does this look normal, could this be from somewhere else or another time, and is there another source saying the same thing?",
    category: 'MISINFORMATION',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 7,
  },
  {
    name: 'What Deepfakes and AI-Generated Content Are',
    slug: 'what-deepfakes-are',
    description:
      "AI tools can now create fake photos, videos, and voices of real people saying or doing things that never happened. Knowing this technology exists means being extra careful before believing or sharing something surprising, especially if it seems too shocking to be true.",
    category: 'MISINFORMATION',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 8,
  },
  {
    name: 'Checking More Than One Source',
    slug: 'checking-more-than-one-source',
    description:
      "If a big claim is true, more than one trustworthy source should be reporting it — not just one random post. Before believing or sharing surprising news, take ten seconds to search whether a well-known news site or reputable organization confirms it too.",
    category: 'MISINFORMATION',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 9,
  },
  {
    name: 'Emotional Headlines Are a Warning Sign',
    slug: 'emotional-headlines-warning-sign',
    description:
      "Headlines and posts designed to make you feel instantly angry, scared, or shocked are often written that way on purpose — strong emotions make people share before checking facts. Noticing your own reaction ('wow, this makes me really mad') is itself a signal to slow down and verify.",
    category: 'MISINFORMATION',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 10,
  },

  // ---------------------------------------------------------------------
  // PRIVACY AWARENESS
  // ---------------------------------------------------------------------
  {
    name: 'Your Full Name, Address, and School Stay Private',
    slug: 'full-name-address-school-stay-private',
    description:
      "Your full name, home address, phone number, and school name are private information. It's OK to have a fun username and share your interests, but personal details that could help a stranger find you in real life should never be posted publicly.",
    category: 'PRIVACY',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 11,
  },
  {
    name: 'Photos Can Reveal More Than You Think',
    slug: 'photos-reveal-more-than-you-think',
    description:
      "A photo of your street, school uniform, or a bedroom with visible details can accidentally show where you live or go to school, even if you didn't say it in words. Before posting a photo, look at the background, not just yourself.",
    category: 'PRIVACY',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 12,
  },
  {
    name: 'Location Sharing and Why It Matters',
    slug: 'location-sharing-and-why-it-matters',
    description:
      "Many apps can attach your exact location to photos and posts, or show your live location to others. Understanding which apps track location, and turning that off for public posts, is a real privacy skill — not just a setting to ignore.",
    category: 'PRIVACY',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 13,
  },
  {
    name: 'Once You Post It, You May Not Be Able to Take It Back',
    slug: 'once-you-post-it-you-cant-take-it-back',
    description:
      "Even a deleted post can already be seen, saved, or shared by others before it disappears. Thinking 'would I be okay with anyone — a teacher, a future employer, a stranger — seeing this?' before posting is a lifelong-useful habit.",
    category: 'PRIVACY',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 14,
  },

  // ---------------------------------------------------------------------
  // DIGITAL CITIZENSHIP / KINDNESS ONLINE
  // ---------------------------------------------------------------------
  {
    name: 'Treat People Online Like You Would in Person',
    slug: 'treat-people-online-like-in-person',
    description:
      "There's a real person with real feelings behind every screen name. Before typing a comment, imagine saying it to that person's face — if it would hurt their feelings in person, it will hurt them online too.",
    category: 'DIGITAL_CITIZENSHIP',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 15,
  },
  {
    name: 'What to Do If You See Someone Being Mean Online',
    slug: 'what-to-do-if-you-see-cyberbullying',
    description:
      "If you see someone being bullied or excluded online, you can help by not joining in, not laughing along, telling a trusted adult, and — if it feels safe — sending the person a kind message. Staying silent lets unkindness continue; small actions can stop it.",
    category: 'DIGITAL_CITIZENSHIP',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 16,
  },
  {
    name: 'Screenshots Last Forever',
    slug: 'screenshots-last-forever',
    description:
      "A message you think is private or will disappear can be screenshotted and shared by anyone who sees it, permanently. Writing things you'd be embarrassed for a parent or teacher to see is a risk even in 'private' chats.",
    category: 'DIGITAL_CITIZENSHIP',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 17,
  },
  {
    name: 'Your Digital Footprint',
    slug: 'your-digital-footprint',
    description:
      "Everything you post, like, comment, and search builds up a 'digital footprint' — a trail that can follow you for years. Being thoughtful about what you add to that trail now protects the reputation of the person you'll be later, including as a teenager and adult.",
    category: 'DIGITAL_CITIZENSHIP',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 18,
  },

  // ---------------------------------------------------------------------
  // ADS VS. CONTENT
  // ---------------------------------------------------------------------
  {
    name: 'Ads Are Trying to Get You to Buy or Click Something',
    slug: 'ads-are-trying-to-get-you-to-buy-something',
    description:
      "An ad's job is to convince you to buy a product, download an app, or click a link — that's different from a video or post whose job is just to inform or entertain you. Noticing 'wait, is this trying to sell me something?' is the first step to spotting an ad.",
    category: 'ADS_VS_CONTENT',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 19,
  },
  {
    name: 'Spotting Sponsored Content and Influencer Ads',
    slug: 'spotting-sponsored-content',
    description:
      "When a YouTuber or influencer shows a product and says words like 'sponsored,' 'ad,' 'partner,' or '#ad', it means a company paid them to talk about it — their opinion may be less independent than it looks. Looking for these labels helps you separate genuine recommendations from paid promotion.",
    category: 'ADS_VS_CONTENT',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 20,
  },
  {
    name: 'How Free Games and Apps Actually Make Money',
    slug: 'how-free-games-and-apps-make-money',
    description:
      "'Free' apps and games often make money through ads, data collection, or in-app purchases designed to feel small ($0.99 here, $1.99 there) but add up. Understanding this business model helps you make smarter choices about what you download and buy.",
    category: 'ADS_VS_CONTENT',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 21,
  },

  // ---------------------------------------------------------------------
  // PASSWORD / ACCOUNT SAFETY BASICS
  // ---------------------------------------------------------------------
  {
    name: 'Passwords Are Like House Keys — Don\'t Share Them',
    slug: 'passwords-are-like-house-keys',
    description:
      "Your password protects your account the way a key protects your house. You shouldn't give it to friends, even best friends, because you can't control what someone else does once they have it — even by accident.",
    category: 'ACCOUNT_SAFETY',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 22,
  },
  {
    name: 'What Makes a Password Strong',
    slug: 'what-makes-a-password-strong',
    description:
      "A strong password is long, uses a mix of letters/numbers/symbols, and isn't something easy to guess like a birthday or pet's name. A password like 'PurpleTiger42!Jump' is much harder to crack than '123456' or your own name.",
    category: 'ACCOUNT_SAFETY',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 23,
  },
  {
    name: 'Why Reusing the Same Password Everywhere Is Risky',
    slug: 'why-reusing-passwords-is-risky',
    description:
      "If you use the same password on every account and one website gets hacked, attackers can try that same password on your other accounts too. Using different passwords per account — or a password manager — limits the damage from any single breach.",
    category: 'ACCOUNT_SAFETY',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 24,
  },
  {
    name: 'What Two-Factor Authentication Does',
    slug: 'what-two-factor-authentication-does',
    description:
      "Two-factor authentication adds a second check beyond your password — like a code sent to a phone — so even if someone steals your password, they still can't log in without that second step. Turning it on for important accounts is one of the single best protections available.",
    category: 'ACCOUNT_SAFETY',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 25,
  },

  // ---------------------------------------------------------------------
  // SCREEN-TIME SELF-AWARENESS
  // ---------------------------------------------------------------------
  {
    name: "Noticing How Long You've Actually Been on a Screen",
    slug: 'noticing-how-long-on-a-screen',
    description:
      "It's easy to lose track of time on a game or video app — ten minutes can turn into an hour without noticing. Checking a clock, or your device's screen-time report, before and after using an app builds awareness of how time is really being spent.",
    category: 'SCREEN_TIME',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 26,
  },
  {
    name: 'How Screens Right Before Bed Affect Sleep',
    slug: 'how-screens-before-bed-affect-sleep',
    description:
      "Bright screens and exciting content close to bedtime can make it harder to fall asleep and lower the quality of sleep, even if you don't feel tired at the time. Giving your brain a screen-free wind-down period before bed helps you feel better the next day.",
    category: 'SCREEN_TIME',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 27,
  },
  {
    name: 'Why Some Apps Are Designed to Be Hard to Put Down',
    slug: 'why-some-apps-are-designed-to-be-hard-to-put-down',
    description:
      "Features like autoplay, infinite scrolling, and streaks/rewards are deliberately built to keep you using an app as long as possible — that's their business goal, not necessarily what's best for you. Recognizing these design tricks makes it easier to set your own limits on purpose, instead of by accident.",
    category: 'SCREEN_TIME',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 28,
  },
];

async function main() {
  console.log('Seeding Digital Literacy Concepts...');
  for (const concept of digitalLiteracyConcepts) {
    await prisma.digitalLiteracyConcept.upsert({
      where: { slug: concept.slug },
      update: concept,
      create: concept,
    });
  }
  console.log(`Seeded ${digitalLiteracyConcepts.length} DigitalLiteracyConcept rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
