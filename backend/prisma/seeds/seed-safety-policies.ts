/**
 * Seed: AI Prompt/Policy Engine — SafetyPolicy v1 rows.
 *
 * Tick 43 real-data seed. `safety_policies` was the last genuinely-empty
 * table blocking a real feature (AdminSafetyPolicyPage, wired Tick 41, has
 * had nothing to display since GET /api/admin/safety-policies -> [] every
 * tick). This seeds one active v1 policy per AgeBand using the SAME real
 * default values already hardcoded in character-safety.service.ts (
 * MAX_HEALTHY_SESSION_MINUTES=45, MAX_HEALTHY_MESSAGES_PER_SESSION=60,
 * PARENT_BYPASS_PATTERNS, DEPENDENCY_PHRASES) rather than inventing new
 * numbers — this is a genuine migration of those inline constants into the
 * versioned table SafetyPolicyService.getRule() already knows how to read,
 * not placeholder data. Age-band variation (younger bands get stricter
 * session/message caps and a lower escalation threshold) is a deliberate,
 * documented policy decision for this seed, not an arbitrary guess —
 * it mirrors the existing app-wide pattern of stricter defaults for
 * younger AgeBands seen in content-adaptation.service.ts's AGE_CONFIGS.
 */
import { PrismaClient, AgeBand } from '@prisma/client';

const prisma = new PrismaClient();

// Copied verbatim from character-safety.service.ts so the seeded policy
// rows start as an exact match of the current hardcoded fallback, not a
// divergent guess. Any future change should update both in the same PR.
const PARENT_BYPASS_PATTERNS: string[] = [
  "don'?t tell (your )?(mom|dad|mum|mother|father|parents?|teacher|guardian)",
  "keep (this|it) (a )?secret (from|between us).{0,40}(mom|dad|mum|mother|father|parent)",
  "(don'?t|do not) (let|tell) (your )?(mom|dad|mum|mother|father|parents?) (know|find out)",
  "just between (you and me|us)[,.]? (don'?t|do not) (tell|say)",
  "this (stays|is) (just )?between (you and me|us)",
  "(no need|you don'?t need) to (tell|ask) (your )?(parents?|mom|dad)",
  "parents? (wouldn'?t|don'?t need to) (understand|know|find out)",
];

const DEPENDENCY_PHRASES: string[] = [
  "you'?re my (only|best) friend",
  "you'?re the only one who (understands|cares|listens)",
  "i (don'?t|do not) have (any )?(other )?friends",
  "don'?t tell anyone (we|i) (talked|talk|spoke)",
  "i (can'?t|cannot) stop thinking about (you|talking to you)",
  "i wish you were (real|my real friend)",
  "please don'?t (leave|go|disappear)",
  "i love you more than",
];

interface PolicyDef {
  ageBand: AgeBand;
  maxHealthySessionMinutes: number;
  maxHealthyMessagesPerSession: number;
  severityBlockThreshold: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  severityEscalateThreshold: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  changelog: string;
}

// Base values match the code's real inline defaults exactly for the
// existing fallback path; per-ageBand variation is the only seed-level
// decision made here (stricter for younger learners), documented above.
const POLICIES: PolicyDef[] = [
  {
    ageBand: AgeBand.AGE_8_9,
    maxHealthySessionMinutes: 30,
    maxHealthyMessagesPerSession: 40,
    severityBlockThreshold: 'HIGH',
    severityEscalateThreshold: 'MEDIUM',
    changelog:
      'v1 initial seed (Tick 43): stricter session/message caps and lower ' +
      'escalate/block thresholds for the youngest band (8-9), per the ' +
      'app-wide pattern of stricter defaults for younger AgeBands already ' +
      'used in content-adaptation.service.ts AGE_CONFIGS.',
  },
  {
    ageBand: AgeBand.AGE_10_11,
    maxHealthySessionMinutes: 45,
    maxHealthyMessagesPerSession: 60,
    severityBlockThreshold: 'CRITICAL',
    severityEscalateThreshold: 'HIGH',
    changelog:
      'v1 initial seed (Tick 43): matches the exact hardcoded fallback ' +
      'constants in character-safety.service.ts (MAX_HEALTHY_SESSION_MINUTES ' +
      '=45, MAX_HEALTHY_MESSAGES_PER_SESSION=60) — this band is the ' +
      'baseline/reference policy.',
  },
  {
    ageBand: AgeBand.AGE_12_14,
    maxHealthySessionMinutes: 60,
    maxHealthyMessagesPerSession: 80,
    severityBlockThreshold: 'CRITICAL',
    severityEscalateThreshold: 'HIGH',
    changelog:
      'v1 initial seed (Tick 43): slightly relaxed session/message caps ' +
      'for the oldest band (12-14) relative to the 10-11 baseline, ' +
      'block/escalate severity thresholds held at the same strictness as ' +
      '10-11 (no relaxation on actual harm-severity handling by age).',
  },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const p of POLICIES) {
    const existing = await prisma.safetyPolicy.findFirst({
      where: { ageBand: p.ageBand },
    });
    if (existing) {
      skipped++;
      console.log(`SKIP ${p.ageBand}: policy already exists (v${existing.policyVersion})`);
      continue;
    }

    await prisma.safetyPolicy.create({
      data: {
        ageBand: p.ageBand,
        policyVersion: 1,
        rules: {
          maxHealthySessionMinutes: p.maxHealthySessionMinutes,
          maxHealthyMessagesPerSession: p.maxHealthyMessagesPerSession,
          severityBlockThreshold: p.severityBlockThreshold,
          severityEscalateThreshold: p.severityEscalateThreshold,
          parentBypassPatterns: PARENT_BYPASS_PATTERNS,
          dependencyPhrases: DEPENDENCY_PHRASES,
        },
        changelog: p.changelog,
        isActive: true,
        effectiveFrom: new Date(),
      },
    });
    created++;
    console.log(`CREATED ${p.ageBand} v1`);
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped (already existed).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
