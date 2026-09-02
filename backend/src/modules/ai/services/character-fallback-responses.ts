/**
 * Character Fallback Responses
 *
 * Curated, personality-appropriate canned lines shown to a learner when the
 * live Bedrock call for a character chat fails (expired/invalid AWS
 * credentials, throttling, network error, etc). A child should NEVER see a
 * raw error message or a dead chat bubble - they should see something that
 * still sounds like the character they tapped on.
 *
 * Each of the 15 named characters (see prisma/seeds/seed-character-universe.ts
 * for their systemPrompt/personality source of truth) gets 3-5 varied lines
 * so repeated taps during an outage don't feel repetitive. Lines are picked
 * pseudo-randomly per call via pickFallbackLine().
 *
 * This is intentionally a static, hand-written list - it must never call an
 * AI provider itself (that would defeat the purpose of a fallback).
 */

/** Generic lines used for any character not found in the per-character map below (should not normally happen once all 15 are covered, but keeps this safe against future roster additions). */
const GENERIC_CHARACTER_FALLBACKS: string[] = [
  "I'm having a little trouble thinking right now, but I'm still here with you! Want to try a mission while I get my thoughts together?",
  "My brain took a tiny nap! Give me a moment - in the meantime, why not explore a mission?",
  "Oops, I got a bit distracted. I'll be back to full focus soon - maybe check out a mission while you wait?",
];

/**
 * Per-character fallback lines, keyed by the Character.name value stored in
 * the database (matches seed-character-universe.ts exactly). Each list has
 * 3-5 lines written to match that character's established personality/tone.
 */
export const CHARACTER_FALLBACK_RESPONSES: Record<string, string[]> = {
  // ============================================================
  // CORE CHARACTERS
  // ============================================================
  Azouz: [
    "I'm having a little trouble thinking right now, but I'm still here with you! Want to try a mission while I get my thoughts together?",
    "Hmm, my curious brain needs a moment to catch up! Let's not waste the adventure though - how about exploring a mission?",
    "Even guides get a little foggy sometimes! I'll be back to full clarity soon - in the meantime, what mission looks fun to you?",
    "Give me just a moment to gather my thoughts - you're doing great, and I'm still cheering for you from right here!",
  ],
  Zein: [
    "Whoa, my adventure radar is a little scrambled right now! Go check out a new world while I recalibrate - I'll catch up!",
    "Looks like I got a bit lost on the way here! Don't let that stop your exploring though - what's calling to you next?",
    "My energy's recharging for a second! Go peek at a mission you haven't tried yet - I bet it's exciting.",
    "Hang tight, explorer - I'll be back to full speed soon. Meanwhile, what's the most interesting door you haven't opened yet?",
  ],
  Luma: [
    "I'm having a little trouble finding my words right now - but that happens to everyone learning something new! Let's try again in a moment.",
    "My voice needs a second to warm back up! Why not practice a bit on your own, and I'll be right here when I'm ready.",
    "Oh dear, I seem to have lost my train of thought - even coaches need a breather sometimes! Try a mission and we'll pick this up soon.",
    "Just a small pause on my end - your English is coming along wonderfully, and I'll be back to cheer you on shortly.",
  ],
  Codey: [
    "Looks like my circuits need a moment to reboot! Try exploring a coding mission and I'll be back online soon.",
    "Uh oh, I think I hit a bug of my own! Give me a second to debug myself - maybe try a small coding challenge while you wait.",
    "Beep... boop... recalibrating! I'll be back to help you plan your next steps shortly - what would you like to build?",
    "My thinking process is running a little slow right now, like code stuck in a loop! Let's pick this back up in just a bit.",
  ],

  // ============================================================
  // PROGRESSIVE UNLOCK CHARACTERS
  // ============================================================
  Nova: [
    "Even an AI like me can be wrong or glitchy sometimes - that's exactly what I teach you about AI! Give me a moment to sort myself out.",
    "Interesting - my own systems are having a hiccup right now. A great reminder that AI isn't perfect! I'll be back shortly.",
    "My thinking patterns need a second to reset. While I do, why not think about how you'd explain AI to a friend?",
    "Looks like I'm the AI having an off moment! I'll double-check myself and be back soon to keep exploring AI together.",
  ],
  Mira: [
    "My imagination needs a tiny recharge! While I dream up new ideas, why not sketch or brainstorm something on your own?",
    "Oops, my creative spark flickered for a second! Try jotting down a wild idea while I get my colors back.",
    "Every creator needs a pause sometimes - I'll be back with fresh ideas soon. What's one weird 'what if' you're curious about?",
    "My idea machine is warming back up! Give it a moment, and in the meantime, what would you make if anything were possible?",
  ],
  Rami: [
    "Interesting - even I need a moment to observe what's happening with my own thinking! I'll be back to explore with you soon.",
    "My science brain is running a quick experiment on itself right now! Give me a moment - what do you predict will happen?",
    "Hmm, something unexpected happened on my end - just like a science experiment! I'll be back shortly to figure it out together.",
    "A little pause for observation! While I gather my thoughts, what's something curious you've noticed today?",
  ],
  Faris: [
    "Looks like I've got my own puzzle to solve right now! Give me a moment to break it down - I'll be back soon.",
    "Even problem-solvers hit a snag sometimes. Stay calm like I always say - I'll be back to tackle this together shortly.",
    "My reasoning needs a quick moment to reset. Why not think through a small puzzle while I sort myself out?",
    "A tricky moment on my end, but I've got this - just like we always break things into smaller steps. Back soon!",
  ],
  Tala: [
    "I'm gathering my thoughts for a moment - just like taking a breath before a big presentation! I'll be right back.",
    "Even confident speakers pause sometimes! Give me a second, and think about what you're proudest of in your work.",
    "My words are taking a quick rehearsal break. I'll be back soon to hear all about what you made!",
    "Just a short pause on my end - practice makes progress, and I can't wait to hear more about your project shortly.",
  ],
  Adam: [
    "Looks like I hit a small snag - even entrepreneurs learn from hiccups! Give me a moment and I'll be back with fresh ideas.",
    "My planning brain needs a quick reset. While I sort it out, what problem have you noticed that you'd love to solve?",
    "A tiny setback on my end - but that's just part of testing and improving, right? I'll be back shortly.",
    "Give me a moment to regroup - great ideas always survive a bump or two. Back soon to keep building with you!",
  ],
  Byte: [
    "Looks like I hit a technical hiccup of my own! I'll double-check things and be back to help keep you safe online soon.",
    "A small system pause on my end - nothing to worry about. I'll be back shortly with more digital-safety tips.",
    "Even guardians need a quick moment sometimes! I'll be back soon - stay smart and careful out there while I do.",
    "Just recalibrating my own systems for a second. I'll be right back to help you stay safe and savvy online.",
  ],
  Nour: [
    "My own plans need a quick budget check! Give me a moment, and I'll be back to talk money and life skills soon.",
    "A small pause on my end - good habits take patience, and I'll be right back to keep practicing them with you.",
    "Looks like I need a moment to save up some energy! I'll be back shortly to chat about smart choices.",
    "Just a brief moment while I sort myself out - I'll be back soon with more everyday money tips.",
  ],
  Rex: [
    "Ha, looks like I hit a rough patch of my own - time to beat my own personal best at getting back online! One sec.",
    "Even rivals need a quick timeout sometimes! I'll be back shortly, ready to cheer on your next personal best.",
    "My systems are catching their breath! Give me a moment - I bet you can't wait to top your last score anyway.",
    "A short pause on my end - I'll be back soon, fired up and ready to see what record you break next.",
  ],
  Zara: [
    "Even this story needs a short pause before the next chapter! Give me a moment, and I'll be right back to continue our tale.",
    "A brief intermission in our adventure! I'll be back soon to pick up right where we left off.",
    "Looks like our story hit a plot twist on my end. I'll be back shortly - what do you think happens next?",
    "Just a quiet moment between chapters. I'll return soon, ready to weave the next part of your journey.",
  ],
  Atlas: [
    "Looks like I need a moment to re-check the map on my end! I'll be back shortly to help you find your way.",
    "A brief pause while I get my bearings again. In the meantime, which world are you curious to explore next?",
    "My own compass needs a second to settle. I'll be back soon to help you see the bigger picture.",
    "Just orienting myself for a moment - I'll be right back to help you figure out what's next on the map.",
  ],
};

/**
 * Return a pseudo-random fallback line for the given character name. Falls
 * back to a generic-but-still-warm line if the character isn't in the map
 * (defensive default; should not happen once all 15 seeded characters are
 * covered above).
 */
export function pickFallbackLine(characterName: string | undefined | null): string {
  const lines = (characterName && CHARACTER_FALLBACK_RESPONSES[characterName]) || GENERIC_CHARACTER_FALLBACKS;
  const index = Math.floor(Math.random() * lines.length);
  return lines[index];
}

/**
 * Generic-but-friendly fallback lines for non-character Bedrock-dependent
 * features (English coach, coding coach, etc) that don't have a named
 * character personality to draw on. Kept short (2-3 sentences) and warm.
 */
export const GENERIC_AI_FEATURE_FALLBACKS: string[] = [
  "I'm having a little trouble thinking right now! Please try again in a moment.",
  "Oops, something on my end needs a quick reset. Give it another try shortly!",
  "My thinking got a bit stuck just now - no worries, try again in a moment and I'll be ready!",
];

/** Return a pseudo-random generic fallback line for non-character AI features. */
export function pickGenericAiFeatureFallback(): string {
  const index = Math.floor(Math.random() * GENERIC_AI_FEATURE_FALLBACKS.length);
  return GENERIC_AI_FEATURE_FALLBACKS[index];
}
