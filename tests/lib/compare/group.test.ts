import { groupConceptsAcrossLanguages } from '@/lib/compare/group';
import type { LoadedVocab } from '@/data/loader';
import type { Concept } from '@/data/schemas/concept';
import type { Variant } from '@/data/schemas/variant';

function makeConcept(id: string, englishTranslation: string): Concept {
  return {
    id: `c${id.padStart(7, '0')}-0000-4000-8000-000000000000`,
    englishLemma: englishTranslation,
    englishTranslation,
    partOfSpeech: 'pronoun',
    senseDisambiguator: null,
    topicTags: [],
    frequencyRankAggregate: null,
  };
}

function makeVariant(
  conceptId: string,
  language: 'sr' | 'hr' | 'bs',
  latin: string,
  rank: number,
  cyr: string | null = null,
): Variant {
  return {
    id: `${language}-${latin.padEnd(8, '_')}-${rank}`.slice(0, 36),
    conceptId,
    language,
    regionalTag: null,
    latinSpelling: latin,
    cyrillicSpelling: cyr,
    stressMark: null,
    ipa: null,
    audioUrl: null,
    frequencyRankInLang: rank,
    caseForms: null,
  };
}

function makeBundle(
  language: 'sr' | 'hr' | 'bs',
  concepts: Concept[],
  variants: Variant[],
): LoadedVocab {
  return {
    language,
    concepts,
    variants,
    meta: { version: '1.0.0', generated_at: '2026-05-26', sources: [], notes: '' },
    validated: true,
  };
}

describe('groupConceptsAcrossLanguages', () => {
  const c1 = makeConcept('1', 'who');
  const c2 = makeConcept('2', 'pretty');
  const c3 = makeConcept('3', 'bread');

  const sr = makeBundle(
    'sr',
    [c1, c2, c3],
    [
      makeVariant(c1.id, 'sr', 'ko', 30, 'ко'),
      makeVariant(c2.id, 'sr', 'lep', 50, 'леп'),
      makeVariant(c3.id, 'sr', 'hleb', 200, 'хлеб'),
    ],
  );

  const hr = makeBundle(
    'hr',
    [c1, c2, c3],
    [
      makeVariant(c1.id, 'hr', 'tko', 35),
      makeVariant(c2.id, 'hr', 'lijep', 55),
      makeVariant(c3.id, 'hr', 'kruh', 220),
    ],
  );

  const bs = makeBundle(
    'bs',
    [c1, c2, c3],
    [
      makeVariant(c1.id, 'bs', 'ko', 35),
      makeVariant(c2.id, 'bs', 'lijep', 55),
      makeVariant(c3.id, 'bs', 'hljeb', 9999),
    ],
  );

  it('groups variants by conceptId across all three bundles', () => {
    const rows = groupConceptsAcrossLanguages([sr, hr, bs]);
    expect(rows).toHaveLength(3);
    const who = rows.find((r) => r.concept.englishTranslation === 'who')!;
    expect(who.variants.sr?.latinSpelling).toBe('ko');
    expect(who.variants.hr?.latinSpelling).toBe('tko');
    expect(who.variants.bs?.latinSpelling).toBe('ko');
  });

  it('sorts by ascending minRank (most frequent first)', () => {
    const rows = groupConceptsAcrossLanguages([sr, hr, bs]);
    expect(rows.map((r) => r.concept.englishTranslation)).toEqual([
      'who', // minRank 30
      'pretty', // minRank 50
      'bread', // minRank 200
    ]);
  });

  it('leaves a slot undefined when a language is missing the concept', () => {
    const partialHr = makeBundle('hr', [c1], [makeVariant(c1.id, 'hr', 'tko', 35)]);
    const rows = groupConceptsAcrossLanguages([sr, partialHr, bs]);
    const pretty = rows.find((r) => r.concept.englishTranslation === 'pretty')!;
    expect(pretty.variants.sr).toBeDefined();
    expect(pretty.variants.hr).toBeUndefined();
    expect(pretty.variants.bs).toBeDefined();
  });

  it('respects the limit option', () => {
    const rows = groupConceptsAcrossLanguages([sr, hr, bs], { limit: 2 });
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.concept.englishTranslation)).toEqual(['who', 'pretty']);
  });

  it('takes minRank across languages when ranks differ', () => {
    // bread: sr=200, hr=220, bs=9999. Min should be 200.
    const rows = groupConceptsAcrossLanguages([sr, hr, bs]);
    const bread = rows.find((r) => r.concept.englishTranslation === 'bread')!;
    expect(bread.minRank).toBe(200);
  });

  it('handles a single-language bundle (Phase 1 backwards compat)', () => {
    const rows = groupConceptsAcrossLanguages([sr]);
    expect(rows).toHaveLength(3);
    expect(rows[0].variants.sr).toBeDefined();
    expect(rows[0].variants.hr).toBeUndefined();
  });
});
