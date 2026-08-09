/**
 * Presentation Skills Mock Data
 *
 * Mock data for presentation and public speaking
 */

import type { PresentationProject, PresentationFeedback } from "@/types";

export const PRESENTATION_PROJECTS: PresentationProject[] = [
  {
    id: "pres-001",
    title: "My Favorite Animal",
    topic: "Animals",
    audience: "peers",
    format: "slides",
    slides: [
      {
        id: "slide-001",
        order: 1,
        type: "title",
        content: "My Favorite Animal: Dolphins",
        notes: "Start with enthusiasm. Make eye contact.",
      },
      {
        id: "slide-002",
        order: 2,
        type: "content",
        content: "What are dolphins?",
        notes: "Explain that dolphins are marine mammals",
      },
      {
        id: "slide-003",
        order: 3,
        type: "image",
        content: "Where dolphins live",
        notes: "Talk about oceans and coastal areas",
        media: {
          type: "image",
          url: "/images/dolphins.jpg",
        },
      },
    ],
    script: {
      introduction: "Hi everyone! Today I want to tell you about my favorite animal: dolphins!",
      mainPoints: [
        "Dolphins are smart mammals",
        "They live in oceans",
        "They communicate with clicks and whistles",
      ],
      conclusion: "Dolphins are amazing animals. Thank you for listening!",
      totalDuration: 5,
    },
    practice: [],
    feedback: [],
  },
];

export function createMockPresentation(title: string, topic: string): PresentationProject {
  return {
    id: `pres-${Date.now()}`,
    title,
    topic,
    audience: "peers",
    format: "slides",
    slides: [
      {
        id: `slide-${Date.now()}-1`,
        order: 1,
        type: "title",
        content: title,
        notes: "Introduce yourself and your topic",
      },
    ],
    script: {
      introduction: `Hi everyone! Today I'll talk about ${topic}.`,
      mainPoints: [],
      conclusion: "Thank you for listening!",
      totalDuration: 3,
    },
    practice: [],
    feedback: [],
  };
}

export const MOCK_FEEDBACK: PresentationFeedback[] = [
  {
    id: "feedback-001",
    from: "ai",
    strengths: [
      "Clear voice",
      "Good eye contact",
      "Interesting topic",
    ],
    suggestions: [
      "Try adding more details",
      "Slow down a bit on slide 2",
      "Use hand gestures",
    ],
    rating: 4,
  },
  {
    id: "feedback-002",
    from: "peer",
    strengths: [
      "Fun pictures",
      "Easy to understand",
    ],
    suggestions: [
      "Add more fun facts",
    ],
    rating: 5,
  },
];
