import {
  FLUENCY_TARGET_RANK,
  paretoStatus,
  selectNextVariant,
  startingRankForProficiency,
} from '@/lib/pareto/sequencer';
import type { Variant } from '@/data/schemas/variant';

function v(partial: Partial<Variant> & Pick<Variant, 'id' | 'language' | 'frequencyRankInLang'>): Variant {
  return {
    conceptId: '00000000-0000-0000-0000-000000000000',
    regionalTag: null,
    latinSpelling: partial.latinSpelling ?? 'word',
    cyrillicSpelling: null,
    stressMark: null,
    ipa: null,
    audioUrl: null,
    caseForms: null,
    ...partial,
  };
}

describe('selectNextVariant', () => {
  const variants: Variant[] = [
    v({ id: 'a', language: 'sr', frequencyRankInLang: 1 }),
    v({ id: 'b', language: 'sr', frequencyRankInLang: 2 }),
    v({ id: 'c', language: 'sr', frequencyRankInLang: 3 }),
    v({ id: 'd', language: 'hr', frequencyRankInLang: 1 }),
    v({ id: 'e', language: 'sr', frequencyRankInLang: 4, regionalTag: 'beogradski' }),
  ];

  it('returns the lowest-rank unknown variant in the target language', () => {
    const next = selectNextVariant({
      language: 'sr',
      knownVariantIds: new Set(),
      allVariants: variants,
    });
    expect(next?.id).toBe('a');
  });

  it('skips known variants', () => {
    const next = selectNextVariant({
      language: 'sr',
      knownVariantIds: new Set(['a', 'b']),
      allVariants: variants,
    });
    expect(next?.id).toBe('c');
  });

  it('filters by language', () => {
    const next = selectNextVariant({
      language: 'hr',
      knownVariantIds: new Set(),
      allVariants: variants,
    });
    expect(next?.id).toBe('d');
  });

  it('skips regional variants (only standard forms on the primary path)', () => {
    const next = selectNextVariant({
      language: 'sr',
      knownVariantIds: new Set(['a', 'b', 'c']),
      allVariants: variants,
    });
    expect(next).toBeNull();
  });

  it('returns null when nothing is left to teach', () => {
    const next = selectNextVariant({
      language: 'bs',
      knownVariantIds: new Set(),
      allVariants: variants,
    });
    expect(next).toBeNull();
  });
});

describe('paretoStatus', () => {
  const variants: Variant[] = [
    v({ id: 'a', language: 'sr', frequencyRankInLang: 1 }),
    v({ id: 'b', language: 'sr', frequencyRankInLang: 2 }),
    v({ id: 'c', language: 'sr', frequencyRankInLang: 3 }),
  ];

  it('counts known and computes percent', () => {
    const status = paretoStatus(
      {
        language: 'sr',
        knownVariantIds: new Set(['a']),
        allVariants: variants,
      },
      10,
    );
    expect(status.totalRanked).toBe(3);
    expect(status.knownCount).toBe(1);
    expect(status.nextRankToTeach).toBe(2);
    expect(status.percentToFluency).toBeCloseTo(0.1, 5);
  });

  it('exposes the fluency-target constant', () => {
    expect(FLUENCY_TARGET_RANK).toBe(2000);
  });
});

describe('startingRankForProficiency', () => {
  it('starts at 1 for absolute beginners', () => {
    expect(startingRankForProficiency(0)).toBe(1);
    expect(startingRankForProficiency(-50)).toBe(1);
  });

  it('passes through mid-range estimates', () => {
    expect(startingRankForProficiency(500)).toBe(500);
  });

  it('caps at the fluency target', () => {
    expect(startingRankForProficiency(5000)).toBe(FLUENCY_TARGET_RANK);
  });
});
