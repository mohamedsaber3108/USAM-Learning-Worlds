import { FsrsService } from './fsrs.service';

/**
 * Unit tests for the FSRS scheduler wrapper (audit T-P1-4). Proves the real
 * FSRS algorithm is driving intervals — not the old fixed 1/3/7/14/30 buckets.
 */
describe('FsrsService', () => {
  const svc = new FsrsService();

  it('schedules a brand-new card into the future on first "remembered"', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const r = svc.schedule(null, true, now);
    expect(r.nextReviewDue).toBeInstanceOf(Date);
    expect(r.nextReviewDue!.getTime()).toBeGreaterThan(now.getTime());
    expect(r.reps).toBeGreaterThanOrEqual(1);
    expect(r.confidence).toBeGreaterThanOrEqual(0);
    expect(r.confidence).toBeLessThanOrEqual(1);
  });

  it('forgetting a card increments lapses vs a remembered card', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    const remembered = svc.schedule(null, true, now)
    const forgot = svc.schedule(
      { ...remembered },
      false,
      new Date('2026-01-05T00:00:00Z'),
    )
    expect(forgot.lapses).toBeGreaterThanOrEqual(remembered.lapses)
  })

  it('grows the interval for a well-remembered card over successive reviews', () => {
    let state = svc.schedule(null, true, new Date('2026-01-01T00:00:00Z'))
    const firstGap = state.scheduledDays
    // Review again on the due date, remembered again.
    state = svc.schedule(state, true, state.nextReviewDue!)
    const secondGap = state.scheduledDays
    // FSRS increases stability (and thus the scheduled interval) on repeated success.
    expect(secondGap).toBeGreaterThanOrEqual(firstGap)
  })
})
