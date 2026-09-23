import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders'
import { MissionCompletePage } from './MissionCompletePage'

// The score/XP numbers animate via useCountUp (a ~900ms rAF animation). We're
// asserting the page reads the CORRECT value from the outcome shape, not the
// animation itself — so make the count-up resolve to its final value
// synchronously to keep these tests deterministic (no timing flakiness under
// full-suite CPU load).
vi.mock('@/lib/hooks/useCountUp', () => ({
  useCountUp: (value: number) => value,
}))

/**
 * Locks in the reward-loop fix (commit 48b3bde). The page previously read
 * `result.finalScore` / `result.xpEarned`, but the complete endpoint returns
 * those nested under `outcome.finalScore` / `outcome.xp.amount` — so every
 * learner saw 0% and +0 XP. These tests assert the page reads the real shape
 * and surfaces pass state + level-up, so that regression can't return.
 */

const passResult = {
  success: true,
  message: 'Mission completed!',
  outcome: {
    finalScore: 90,
    passed: true,
    requiredActivities: 3,
    activitiesAttempted: 3,
    xp: { awarded: true, amount: 95, leveledUp: true, newLevel: 4 },
  },
}

describe('MissionCompletePage', () => {
  it('renders the score and XP from the real outcome shape', async () => {
    renderWithProviders(<MissionCompletePage />, {
      route: '/missions/complete',
      state: { result: passResult, runId: 'run-1' },
    })

    // Score is read from outcome.finalScore (90) and XP from outcome.xp.amount (95).
    expect(await screen.findByText('90%')).toBeInTheDocument()
    expect(screen.getByText('+95')).toBeInTheDocument()
    expect(screen.getByText('Great Job!')).toBeInTheDocument()
  })

  it('shows the pass/mastery badge and the level-up celebration', async () => {
    renderWithProviders(<MissionCompletePage />, {
      route: '/missions/complete',
      state: { result: passResult, runId: 'run-1' },
    })

    expect(screen.getByText(/counts toward your mastery/i)).toBeInTheDocument()
    expect(screen.getByText(/reached level 4/i)).toBeInTheDocument()
  })

  it('shows the not-passed state without a level-up when the mission was not passed', async () => {
    const failResult = {
      success: true,
      message: 'Mission finished — keep practicing to master it!',
      outcome: {
        finalScore: 40,
        passed: false,
        requiredActivities: 3,
        activitiesAttempted: 3,
        xp: { awarded: false },
      },
    }
    renderWithProviders(<MissionCompletePage />, {
      route: '/missions/complete',
      state: { result: failResult, runId: 'run-2' },
    })

    expect(await screen.findByText('40%')).toBeInTheDocument()
    expect(screen.getByText(/practice a bit more/i)).toBeInTheDocument()
    expect(screen.queryByText(/reached level/i)).not.toBeInTheDocument()
  })

  it('shows the no-results fallback when navigated to without state', () => {
    renderWithProviders(<MissionCompletePage />, { route: '/missions/complete' })
    expect(screen.getByText(/no results found/i)).toBeInTheDocument()
  })
})
