/**
 * English world service.
 *
 * Wired to the real backend `english-coach` AI service (`backend/src/modules
 * /ai/english-coach.controller.ts`, mounted at `/api/english-coach`) via
 * `src/services/api.ts`'s `englishAPI`. There is no backend model for
 * `EnglishStrand`/`EnglishVenue`/`EnglishSession` (no matching Prisma
 * tables — see `backend/prisma/schema.prisma`), so this file cannot fetch
 * real venues/strands/sessions; those calls now surface that gap explicitly
 * (empty lists / thrown errors) instead of silently returning
 * `src/data/english.ts` mock content as if it were live.
 *
 * What IS real and wired: conversation practice, grammar correction,
 * pronunciation feedback, vocabulary generation and reading-passage
 * generation, all backed by the real `EnglishCoachService` LLM calls.
 */
import { englishAPI } from "@/services/api";
import type { AgeBand, ID } from "@/types/domain";
import type {
  EnglishElsewhere,
  EnglishSession,
  EnglishStrand,
  EnglishStrandId,
  EnglishVenue,
  EnglishVenueId,
  EnglishWorldSnapshot,
  SpeakingAttempt,
  SpeakingFeedback,
} from "@/types/english";

export const englishService = {
  /**
   * No backend model backs strands/venues/elsewhere yet — return an honest
   * empty snapshot (recommendation omitted) rather than mock content
   * presented as live data. Components consuming this should treat an
   * empty `venues`/`strands` array as "content not seeded yet", not an error.
   */
  snapshot: async (_ageBand: AgeBand): Promise<EnglishWorldSnapshot> => {
    return {
      strands: [],
      venues: [],
      elsewhere: [],
      recommendation: { venueId: "conversation-rooms", because: "" },
    };
  },

  strands: async (): Promise<EnglishStrand[]> => [],

  strand: async (_id: EnglishStrandId): Promise<EnglishStrand | null> => null,

  venues: async (_ageBand?: AgeBand): Promise<EnglishVenue[]> => [],

  venue: async (_id: EnglishVenueId): Promise<EnglishVenue | null> => null,

  sessions: async (_venueId: EnglishVenueId, _ageBand?: AgeBand): Promise<EnglishSession[]> => [],

  session: async (_id: ID): Promise<EnglishSession | null> => null,

  elsewhere: async (): Promise<EnglishElsewhere[]> => [],

  /** Plays the model answer. No backend TTS wired — duration estimate only, no audio call. */
  playModel: (text: string): Promise<{ durationMs: number }> =>
    Promise.resolve({ durationMs: Math.min(5000, Math.max(1200, text.length * 45)) }),

  /**
   * Real round-trip to the backend's `EnglishCoachService.providePronunciationFeedback`.
   * There is no speech-to-text pipeline wired yet (see the backend's own
   * BACKLOG note in `english-coach.service.ts`), so `transcript` must be
   * supplied by the caller; the backend still returns a real
   * (LLM-hardcoded-score) pronunciationScore rather than a frontend mock.
   */
  submitSpeech: async (
    sessionId: ID,
    attemptNumber: number,
    word = "practice",
    transcript?: string,
  ): Promise<SpeakingAttempt> => {
    const result = await englishAPI.getPronunciationFeedback(word, transcript);
    const feedback: SpeakingFeedback = {
      transcript: transcript ?? "",
      strength: result.feedback,
      fix: "",
      criteriaMet: [],
      criteriaMissed: [],
      pronunciationNotes: [],
      wordsSpoken: transcript?.split(/\s+/).filter(Boolean).length ?? 0,
      countsAsEvidence: result.pronunciationScore !== null,
    };
    return {
      id: `att-${sessionId}-${attemptNumber}`,
      sessionId,
      attemptNumber,
      feedback,
    };
  },

  /** Real grammar correction via backend LLM. */
  correctGrammar: (text: string) => englishAPI.correctGrammar(text),

  /** Real conversation-practice turn via backend LLM. */
  converse: (userMessage: string, topic?: string, cefrLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2") =>
    englishAPI.startConversation(topic, cefrLevel, userMessage),

  /** Real vocabulary-set generation via backend LLM. */
  generateVocabulary: (topic: string, wordCount?: number) =>
    englishAPI.generateVocabulary(topic, wordCount),

  /** Real reading-passage generation via backend LLM. */
  generateReading: (topic: string, length?: "short" | "medium" | "long") =>
    englishAPI.generateReading(topic, length),
};

export const englishKeys = {
  snapshot: (band: AgeBand) => ["english", "snapshot", band] as const,
  venues: (band?: AgeBand) => ["english", "venues", band ?? "all"] as const,
  venue: (id: string) => ["english", "venue", id] as const,
  sessions: (venueId: string, band?: AgeBand) =>
    ["english", "sessions", venueId, band ?? "all"] as const,
  elsewhere: ["english", "elsewhere"] as const,
};
