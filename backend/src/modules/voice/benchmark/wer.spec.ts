import { normalizeArabic, wordErrorRate } from './wer';

/**
 * Unit tests for the WER scorer used by the EG-Arabic benchmark harness
 * (audit T-P1-9).
 */
describe('voice benchmark WER', () => {
  it('scores a perfect match as 0', () => {
    const r = wordErrorRate('انا بحب المدرسة', 'انا بحب المدرسة');
    expect(r.wer).toBe(0);
  });

  it('ignores tashkeel / alef variants via normalization', () => {
    // Same words, different diacritics + alef form.
    expect(normalizeArabic('أَنَا')).toBe(normalizeArabic('انا'));
    const r = wordErrorRate('أنا بحب', 'انا بحب');
    expect(r.wer).toBe(0);
  });

  it('counts a single substitution correctly', () => {
    const r = wordErrorRate('انا بحب المدرسة', 'انا بحب البيت');
    expect(r.substitutions).toBe(1);
    expect(r.referenceWords).toBe(3);
    expect(r.wer).toBeCloseTo(1 / 3, 5);
  });

  it('counts a deletion', () => {
    const r = wordErrorRate('واحد اتنين تلاتة', 'واحد تلاتة');
    expect(r.deletions).toBe(1);
    expect(r.wer).toBeCloseTo(1 / 3, 5);
  });

  it('counts an insertion', () => {
    const r = wordErrorRate('واحد اتنين', 'واحد اتنين تلاتة');
    expect(r.insertions).toBe(1);
    expect(r.wer).toBeCloseTo(1 / 2, 5);
  });
});
