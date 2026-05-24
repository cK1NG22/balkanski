import { gradingTier } from '@/lib/grading/tiered';

describe('gradingTier', () => {
  it('returns `right` for exact match', () => {
    const result = gradingTier('hleb', ['hleb']);
    expect(result.tier).toBe('right');
    expect(result.editDistance).toBe(0);
  });

  it('returns `right` ignoring whitespace and case', () => {
    expect(gradingTier(' Hleb ', ['hleb']).tier).toBe('right');
  });

  it('returns `close` for missing diacritic (š→s)', () => {
    const result = gradingTier('pise', ['piše']);
    expect(result.tier).toBe('close');
    expect(result.missedDiacritics).toContain('š');
    expect(result.correction).toBe('piše');
  });

  it('returns `close` for missing diacritic (ć→c)', () => {
    const result = gradingTier('cao', ['ćao']);
    expect(result.tier).toBe('close');
    expect(result.missedDiacritics).toContain('ć');
  });

  it('returns `close` for single-character edit distance', () => {
    const result = gradingTier('hlebb', ['hleb']);
    expect(result.tier).toBe('close');
    expect(result.editDistance).toBe(1);
  });

  it('returns `wrong` for 2+ character edit distance', () => {
    const result = gradingTier('kruh', ['hleb']);
    expect(result.tier).toBe('wrong');
  });

  it('returns `wrong` for empty accepted list', () => {
    expect(gradingTier('anything', []).tier).toBe('wrong');
  });

  it('returns the best tier across multiple accepted answers', () => {
    // exact match wins over close match
    expect(gradingTier('hleb', ['kruh', 'hleb', 'hljeb']).tier).toBe('right');
    // close match wins over wrong
    expect(gradingTier('pise', ['kruh', 'piše']).tier).toBe('close');
  });

  it('treats Cyrillic vs Latin as wrong (different scripts)', () => {
    const result = gradingTier('hleb', ['хлеб']);
    expect(result.tier).toBe('wrong');
  });
});
