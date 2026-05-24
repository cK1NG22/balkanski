import {
  diacriticMismatchPositions,
  isDiacriticOnlyDifference,
  levenshtein,
  stripDiacritics,
} from '@/lib/grading/diacritics';

describe('stripDiacritics', () => {
  it('replaces BCS diacritics with ASCII equivalents', () => {
    expect(stripDiacritics('piše')).toBe('pise');
    expect(stripDiacritics('učenje')).toBe('ucenje');
    expect(stripDiacritics('đak')).toBe('dak');
    expect(stripDiacritics('žar')).toBe('zar');
    expect(stripDiacritics('Ćao')).toBe('Cao');
  });

  it('preserves strings with no diacritics', () => {
    expect(stripDiacritics('hello')).toBe('hello');
    expect(stripDiacritics('kruh')).toBe('kruh');
  });
});

describe('isDiacriticOnlyDifference', () => {
  it('returns true for diacritic-only differences', () => {
    expect(isDiacriticOnlyDifference('pise', 'piše')).toBe(true);
    expect(isDiacriticOnlyDifference('ucenje', 'učenje')).toBe(true);
  });

  it('returns false for identical strings', () => {
    expect(isDiacriticOnlyDifference('piše', 'piše')).toBe(false);
  });

  it('returns false for strings with non-diacritic differences', () => {
    expect(isDiacriticOnlyDifference('pisem', 'piše')).toBe(false);
    expect(isDiacriticOnlyDifference('hello', 'world')).toBe(false);
  });
});

describe('diacriticMismatchPositions', () => {
  it('returns indices where diacritics differ', () => {
    expect(diacriticMismatchPositions('pise', 'piše')).toEqual([2]);
    expect(diacriticMismatchPositions('cao', 'ćao')).toEqual([0]);
  });

  it('returns [] when stripped strings differ (not a diacritic-only case)', () => {
    expect(diacriticMismatchPositions('hello', 'world')).toEqual([]);
  });
});

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('hleb', 'hleb')).toBe(0);
  });

  it('returns the correct edit distance', () => {
    expect(levenshtein('hleb', 'hljeb')).toBe(1);
    expect(levenshtein('kruh', 'hleb')).toBe(4);
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
  });
});
