import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'usam_last_seen_progress'

const STREAK_MILESTONES = [7, 14, 30, 100] as const
type StreakMilestone = (typeof STREAK_MILESTONES)[number]

export interface MilestoneDetectionInput {
  level: number | undefined | null
  streak: number | undefined | null
  totalXP: number | undefined | null
  masteredCount: number | undefined | null
  completedMissionCount: number | undefined | null
}

interface LastSeenSnapshot {
  level: number
  streak: number
  totalXP: number
  masteredCount: number
  completedMissionCount: number
}

export interface MilestoneResult {
  leveledUp: boolean
  newLevel?: number
  streakMilestone?: StreakMilestone
  firstMissionEver: boolean
  masteryMilestone?: number
}

const EMPTY_RESULT: MilestoneResult = {
  leveledUp: false,
  firstMissionEver: false,
}

function readSnapshot(): LastSeenSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      typeof parsed?.level === 'number' &&
      typeof parsed?.streak === 'number' &&
      typeof parsed?.totalXP === 'number' &&
      typeof parsed?.masteredCount === 'number' &&
      typeof parsed?.completedMissionCount === 'number'
    ) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

function writeSnapshot(snapshot: LastSeenSnapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // localStorage unavailable (e.g. private mode) — fail silently, no crash.
  }
}

/**
 * Pure diffing function — exported for unit testing without React.
 *
 * Compares the current progression numbers against the last-seen snapshot
 * (or `null` if this is genuinely the first load ever) and returns exactly
 * which milestones were newly crossed. This never returns true just because
 * data loaded — only because a tracked number crossed a threshold it hadn't
 * crossed as of the last recorded snapshot.
 */
export function detectMilestones(
  current: MilestoneDetectionInput,
  lastSeen: LastSeenSnapshot | null
): MilestoneResult {
  const level = current.level ?? 1
  const streak = current.streak ?? 0
  const totalXP = current.totalXP ?? 0
  const masteredCount = current.masteredCount ?? 0
  const completedMissionCount = current.completedMissionCount ?? 0

  // No prior snapshot at all = brand-new account, first load ever.
  // We record the baseline but do NOT fire a level-up/mastery/streak
  // celebration retroactively for whatever the account already has —
  // only firstMissionEver can still apply if they already have 1 mission
  // (e.g. onboarding auto-completes one), but level-up/streak/mastery
  // celebrations require a real *previous* snapshot to diff against.
  if (!lastSeen) {
    return {
      leveledUp: false,
      firstMissionEver: completedMissionCount >= 1,
    }
  }

  const result: MilestoneResult = { leveledUp: false, firstMissionEver: false }

  if (level > lastSeen.level) {
    result.leveledUp = true
    result.newLevel = level
  }

  // Find the highest streak milestone threshold crossed between last-seen
  // streak and current streak (handles the case a user was offline for a
  // few days and streak data catches up in a jump, though normally +1/day).
  const crossed = STREAK_MILESTONES.filter(
    (m) => streak >= m && lastSeen.streak < m
  )
  if (crossed.length > 0) {
    result.streakMilestone = crossed[crossed.length - 1]
  }

  if (lastSeen.completedMissionCount === 0 && completedMissionCount >= 1) {
    result.firstMissionEver = true
  }

  if (masteredCount > lastSeen.masteredCount) {
    result.masteryMilestone = masteredCount
  }

  return result
}

/**
 * Real event-driven milestone detection.
 *
 * Diffs the CURRENT fetched progression data against a LAST-SEEN snapshot
 * persisted in localStorage. Returns which milestones (if any) were newly
 * crossed on THIS load only — never fires the same milestone twice, because
 * the snapshot is updated immediately after detection.
 *
 * Call once, after progression/streak/mastery/missions data has all loaded
 * (pass `undefined` fields until ready; the hook waits for `ready === true`
 * before diffing so it never fires on partial/undefined data).
 */
export function useMilestoneDetection(
  input: MilestoneDetectionInput,
  ready: boolean
): MilestoneResult {
  const [result, setResult] = useState<MilestoneResult>(EMPTY_RESULT)
  const hasRunRef = useRef(false)

  useEffect(() => {
    if (!ready || hasRunRef.current) return
    hasRunRef.current = true

    const lastSeen = readSnapshot()
    const detected = detectMilestones(input, lastSeen)

    // Persist the new snapshot immediately so a refresh (or re-mount)
    // never re-fires the same milestone.
    writeSnapshot({
      level: input.level ?? 1,
      streak: input.streak ?? 0,
      totalXP: input.totalXP ?? 0,
      masteredCount: input.masteredCount ?? 0,
      completedMissionCount: input.completedMissionCount ?? 0,
    })

    setResult(detected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  return result
}

// Exposed for tests / manual verification scripts.
export const __internal = { STORAGE_KEY, readSnapshot, writeSnapshot }
