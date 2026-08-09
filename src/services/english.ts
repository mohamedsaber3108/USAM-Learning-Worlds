/**
 * English world service.
 *
 * Mock-backed, async, id-addressed. The speaking loop is the only piece with
 * simulated behaviour: it fabricates a transcript and rubric-aligned feedback
 * so the UI exercises the exact contract a real STT + assessment backend will
 * fill in later.
 */
import { englishElsewhere, englishSessions, englishStrands, englishVenues } from "@/data/english";
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

const respond = <T,>(value: T, ms = 200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/** Transcripts a mock STT returns. Attempt number picks a better one. */
const mockTranscripts = [
  "Um, it's… it's cloudy I think, and cold.",
  "It looks grey outside and the wind is quite strong today.",
  "Grey clouds are stacking up over the roofs and the air bites — about nine degrees.",
];

function buildFeedback(session: EnglishSession, attemptNumber: number): SpeakingFeedback {
  const index = Math.min(attemptNumber - 1, mockTranscripts.length - 1);
  const transcript = mockTranscripts[index] ?? mockTranscripts[0]!;
  const met = session.rubric.slice(0, Math.min(attemptNumber, session.rubric.length)).map((r) => r.id);
  const missed = session.rubric.filter((r) => !met.includes(r.id)).map((r) => r.id);

  return {
    transcript,
    strength:
      attemptNumber === 1
        ? "You started without stalling. That's the hard part."
        : attemptNumber === 2
          ? "Full sentences this time, and the pace held all the way through."
          : "A number and a comparison — someone far away could picture that.",
    fix:
      missed.length > 0
        ? `Next go: ${session.rubric.find((r) => r.id === missed[0])?.lookFor ?? "add one specific detail."}`
        : "Nothing to fix here. Try it a level harder if you want.",
    criteriaMet: met,
    criteriaMissed: missed,
    pronunciationNotes:
      attemptNumber < 3
        ? [
            { sound: "/ð/ in 'weather'", note: "Came out as /d/ — let the tongue touch the teeth." },
            { sound: "final -s in 'clouds'", note: "Dropped. It's the difference between one and many." },
          ]
        : [{ sound: "sentence stress", note: "Clean. The important word carried the line." }],
    wordsSpoken: transcript.split(/\s+/).length,
    countsAsEvidence: missed.length === 0,
  };
}

export const englishService = {
  snapshot: (ageBand: AgeBand): Promise<EnglishWorldSnapshot> => {
    const venues = englishVenues.filter((v) => v.openFor.includes(ageBand));
    const weakest = [...englishStrands].sort((a, b) => a.confidence - b.confidence)[0]!;
    const target =
      venues.find((v) => v.strandIds.includes(weakest.id)) ?? venues[0] ?? englishVenues[0]!;
    return respond({
      strands: englishStrands,
      venues,
      elsewhere: englishElsewhere,
      recommendation: {
        venueId: target.id,
        because: `${weakest.label} is your least confident strand right now, and this is where it gets practised.`,
      },
    });
  },

  strands: (): Promise<EnglishStrand[]> => respond(englishStrands, 120),

  strand: (id: EnglishStrandId): Promise<EnglishStrand | null> =>
    respond(englishStrands.find((s) => s.id === id) ?? null, 120),

  venues: (ageBand?: AgeBand): Promise<EnglishVenue[]> =>
    respond(ageBand ? englishVenues.filter((v) => v.openFor.includes(ageBand)) : englishVenues, 120),

  venue: (id: EnglishVenueId): Promise<EnglishVenue | null> =>
    respond(englishVenues.find((v) => v.id === id) ?? null, 120),

  sessions: (venueId: EnglishVenueId, ageBand?: AgeBand): Promise<EnglishSession[]> => {
    const all = englishSessions.filter((s) => s.venueId === venueId);
    const forAge = ageBand ? all.filter((s) => s.ageBands.includes(ageBand)) : all;
    return respond(forAge.length ? forAge : all, 160);
  },

  session: (id: ID): Promise<EnglishSession | null> =>
    respond(englishSessions.find((s) => s.id === id) ?? null, 120),

  elsewhere: (): Promise<EnglishElsewhere[]> => respond(englishElsewhere, 120),

  /** Plays the model answer. Returns how long the UI should hold "speaking". */
  playModel: (text: string): Promise<{ durationMs: number }> =>
    respond({ durationMs: Math.min(5000, Math.max(1200, text.length * 45)) }, 150),

  /** Simulated record → transcribe → assess round-trip. */
  submitSpeech: (sessionId: ID, attemptNumber: number): Promise<SpeakingAttempt> => {
    const session = englishSessions.find((s) => s.id === sessionId);
    if (!session) return Promise.reject(new Error("Unknown session"));
    return respond(
      {
        id: `att-${sessionId}-${attemptNumber}`,
        sessionId,
        attemptNumber,
        feedback: buildFeedback(session, attemptNumber),
      },
      900,
    );
  },
};

export const englishKeys = {
  snapshot: (band: AgeBand) => ["english", "snapshot", band] as const,
  venues: (band?: AgeBand) => ["english", "venues", band ?? "all"] as const,
  venue: (id: string) => ["english", "venue", id] as const,
  sessions: (venueId: string, band?: AgeBand) =>
    ["english", "sessions", venueId, band ?? "all"] as const,
  elsewhere: ["english", "elsewhere"] as const,
};
