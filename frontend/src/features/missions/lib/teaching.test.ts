import { describe, it, expect } from 'vitest'
import { extractTeaching } from './teaching'

/**
 * extractTeaching decides whether a mission activity has anything worth
 * teaching before practice. These tests pin the self-hiding contract: no
 * teachable content => null (player skips the Learn step), and the various
 * content shapes the backend evaluator produces are surfaced correctly.
 */
describe('extractTeaching', () => {
  it('returns null when there is nothing to teach', () => {
    expect(extractTeaching({ content: { question: 'What is 2+2?', options: ['3', '4'] } })).toBeNull()
    expect(extractTeaching({})).toBeNull()
    expect(extractTeaching({ content: {} })).toBeNull()
  })

  it('surfaces context as teaching', () => {
    const t = extractTeaching({ content: { question: 'q', context: 'A verb is an action word.' } })
    expect(t).not.toBeNull()
    expect(t?.context).toBe('A verb is an action word.')
  })

  it('surfaces key points, filtering empty entries', () => {
    const t = extractTeaching({ content: { keyPoints: ['First point', '', '  ', 'Second point'] } })
    expect(t?.keyPoints).toEqual(['First point', 'Second point'])
  })

  it('uses a SOLVE activity solution as a worked example', () => {
    const t = extractTeaching({ content: { problem: '2+2', solution: 'Add: 2 + 2 = 4' } })
    expect(t?.workedExample).toBe('Add: 2 + 2 = 4')
  })

  it('ignores whitespace-only content', () => {
    expect(extractTeaching({ content: { context: '   ', solution: '' } })).toBeNull()
  })

  it('reads context from the activity root as a fallback', () => {
    const t = extractTeaching({ context: 'Root-level context', content: {} })
    expect(t?.context).toBe('Root-level context')
  })
})
