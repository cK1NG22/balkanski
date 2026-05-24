import { loadStarterVocab, __resetVocabCache } from '@/data/loader';

describe('loadStarterVocab("sr")', () => {
  beforeEach(() => {
    __resetVocabCache();
  });

  it('parses the bundled JSON and reports validated=true', () => {
    const v = loadStarterVocab('sr');
    expect(v.validated).toBe(true);
    expect(v.language).toBe('sr');
  });

  it('returns at least 100 concepts and variants', () => {
    const v = loadStarterVocab('sr');
    expect(v.concepts.length).toBeGreaterThanOrEqual(100);
    expect(v.variants.length).toBeGreaterThanOrEqual(100);
  });

  it('carries a methodology block with sources', () => {
    const v = loadStarterVocab('sr');
    expect(v.meta.version).toBeTruthy();
    expect(v.meta.sources.length).toBeGreaterThan(0);
    expect(v.meta.sources[0].name).toContain('opensubtitles');
  });

  it('the rank-1 SR variant is a real corpus-top function word', () => {
    const v = loadStarterVocab('sr');
    const top = [...v.variants].sort(
      (a, b) => a.frequencyRankInLang - b.frequencyRankInLang,
    )[0];
    // "da" should be #1 in the OpenSubtitles SR list — if this changes, the
    // pipeline likely regressed.
    expect(top.latinSpelling).toBe('da');
    expect(top.frequencyRankInLang).toBe(1);
  });

  it('every SR variant has a cyrillicSpelling (script-toggle promise)', () => {
    const v = loadStarterVocab('sr');
    for (const variant of v.variants) {
      expect(variant.cyrillicSpelling).toBeTruthy();
    }
  });

  it('caches across repeated calls (same identity)', () => {
    const a = loadStarterVocab('sr');
    const b = loadStarterVocab('sr');
    expect(a).toBe(b);
  });

  it('throws a clear error for an unsupported language', () => {
    expect(() => loadStarterVocab('hr')).toThrow(/No starter vocab bundle/);
  });
});
