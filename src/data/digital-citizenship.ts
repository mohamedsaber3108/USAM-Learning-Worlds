/**
 * Digital Citizenship Mock Data
 *
 * Mock data for online safety and digital citizenship
 */

import type { DigitalCitizenshipLesson } from "@/types";

export const DIGITAL_CITIZENSHIP_LESSONS: DigitalCitizenshipLesson[] = [
  {
    id: "dc-lesson-001",
    topic: "online-safety",
    title: "Stay Safe Online",
    scenario: "Learn how to protect yourself on the internet",
    objectives: [
      "Know what information to keep private",
      "Recognize safe vs unsafe websites",
      "Ask an adult if something feels wrong",
      "Use strong passwords",
    ],
    activities: [
      {
        id: "act-001",
        type: "scenario-decision",
        title: "What Should You Share?",
        content: "A new friend online asks for your home address. What do you do?",
        choices: [
          {
            id: "choice-001",
            option: "Give them your address",
            safe: false,
            explanation:
              "Never share your address with people you only know online. This information should stay private.",
          },
          {
            id: "choice-002",
            option: "Tell an adult",
            safe: true,
            explanation:
              "Perfect! Always tell a trusted adult when someone asks for personal information.",
          },
          {
            id: "choice-003",
            option: "Ignore the message",
            safe: true,
            explanation:
              "Good choice! It's okay to ignore messages that make you uncomfortable. Consider telling an adult too.",
          },
        ],
      },
    ],
    ageBands: ["8-9", "10-11", "12-14"],
  },
  {
    id: "dc-lesson-002",
    topic: "digital-footprint",
    title: "Your Digital Footprint",
    scenario: "Everything you do online leaves a trail",
    objectives: [
      "Understand what a digital footprint is",
      "Think before you post",
      "Keep your footprint positive",
      "Delete old content if needed",
    ],
    activities: [
      {
        id: "act-002",
        type: "scenario-decision",
        title: "Think Before You Post",
        content:
          "You're angry at your friend. Should you post about it on social media?",
        choices: [
          {
            id: "choice-004",
            option: "Post angry message",
            safe: false,
            explanation:
              "Once you post something, it's hard to take back. Wait until you're calm and talk to your friend privately.",
          },
          {
            id: "choice-005",
            option: "Wait and talk privately",
            safe: true,
            explanation:
              "Great choice! Private conversations are better for solving problems. Your future self will thank you.",
          },
        ],
      },
    ],
    ageBands: ["10-11", "12-14"],
  },
  {
    id: "dc-lesson-003",
    topic: "cyberbullying",
    title: "Stand Up to Cyberbullying",
    scenario: "Learn how to handle mean behavior online",
    objectives: [
      "Recognize cyberbullying",
      "Don't participate in mean behavior",
      "Report bullying to adults",
      "Support others who are targeted",
    ],
    activities: [
      {
        id: "act-003",
        type: "scenario-decision",
        title: "What Would You Do?",
        content: "You see someone posting mean comments about a classmate. What do you do?",
        choices: [
          {
            id: "choice-006",
            option: "Join in with mean comments",
            safe: false,
            explanation:
              "Adding mean comments makes it worse. This is cyberbullying and can really hurt someone.",
          },
          {
            id: "choice-007",
            option: "Report it and tell an adult",
            safe: true,
            explanation:
              "Perfect! Reporting bullying helps stop it. You're being a good digital citizen.",
          },
          {
            id: "choice-008",
            option: "Defend the person being bullied",
            safe: true,
            explanation:
              "Great! Standing up for others is brave. Also make sure to report it to an adult.",
          },
        ],
      },
    ],
    ageBands: ["8-9", "10-11", "12-14"],
  },
  {
    id: "dc-lesson-004",
    topic: "privacy",
    title: "Protect Your Privacy",
    scenario: "Learn what to keep private online",
    objectives: [
      "Know what's private information",
      "Use privacy settings",
      "Be careful with photos",
      "Control who sees your posts",
    ],
    activities: [
      {
        id: "act-004",
        type: "quiz",
        title: "Privacy Quiz",
        content: "Which of these should you keep private? (Check all that apply)",
      },
    ],
    ageBands: ["10-11", "12-14"],
  },
  {
    id: "dc-lesson-005",
    topic: "misinformation",
    title: "Spot Fake News",
    scenario: "Learn to tell if information is true",
    objectives: [
      "Question what you read",
      "Check multiple sources",
      "Look for author and date",
      "Don't share if unsure",
    ],
    activities: [
      {
        id: "act-005",
        type: "scenario-decision",
        title: "Is This Real?",
        content:
          "You see a shocking headline: 'Pizza gives you superpowers!' Should you share it?",
        choices: [
          {
            id: "choice-009",
            option: "Share it immediately",
            safe: false,
            explanation:
              "This sounds too good to be true! Check if it's real before sharing. This is likely fake news.",
          },
          {
            id: "choice-010",
            option: "Check if it's real first",
            safe: true,
            explanation:
              "Smart! Always verify information before sharing. Look for reliable sources and evidence.",
          },
        ],
      },
    ],
    ageBands: ["10-11", "12-14"],
  },
];
