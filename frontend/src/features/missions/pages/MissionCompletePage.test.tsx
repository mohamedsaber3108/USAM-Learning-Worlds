import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders'
import { MissionCompletePage } from './MissionCompletePage'

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

    // Score counts up to 90% and XP to +95 (animation eases to the final
    // value over ~900ms, so allow the count-up to settle).
    await waitFor(() => expect(screen.getByText('90%')).toBeInTheDocument(), { timeout: 3000 })
    await waitFor(() => expect(screen.getByText('+95')).toBeInTheDocument(), { timeout: 3000 })
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

    await waitFor(() => expect(screen.getByText('40%')).toBeInTheDocument(), { timeout: 3000 })
    expect(screen.getByText(/practice a bit more/i)).toBeInTheDocument()
    expect(screen.queryByText(/reached level/i)).not.toBeInTheDocument()
  })

  it('shows the no-results fallback when navigated to without state', () => {
    renderWithProviders(<MissionCompletePage />, { route: '/missions/complete' })
    expect(screen.getByText(/no results found/i)).toBeInTheDocument()
  })
})
