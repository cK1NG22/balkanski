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
});

describe('loadStarterVocab("hr")', () => {
  beforeEach(() => {
    __resetVocabCache();
  });

  it('parses and reports validated=true', () => {
    const v = loadStarterVocab('hr');
    expect(v.validated).toBe(true);
    expect(v.language).toBe('hr');
  });

  it('every HR variant has cyrillicSpelling === null (schema constraint)', () => {
    const v = loadStarterVocab('hr');
    for (const variant of v.variants) {
      expect(variant.cyrillicSpelling).toBeNull();
    }
  });

  it('contains the HR-specific lexical overrides', () => {
    const v = loadStarterVocab('hr');
    const latins = new Set(v.variants.map((x) => x.latinSpelling));
    // Spot-check the systematic differences from SR.
    expect(latins.has('tko')).toBe(true);      // SR: ko
    expect(latins.has('gdje')).toBe(true);     // SR: gde
    expect(latins.has('lijep')).toBe(true);    // SR: lep
    expect(latins.has('kruh')).toBe(true);     // SR: hleb
    expect(latins.has('čovjek')).toBe(true);   // SR: čovek
    expect(latins.has('željeti')).toBe(true); // SR: želeti   // SR: hteti
    // SR-only forms should not appear in HR:
    expect(latins.has('ko')).toBe(false);
    expect(latins.has('hleb')).toBe(false);
  });
});

describe('loadStarterVocab("bs")', () => {
  beforeEach(() => {
    __resetVocabCache();
  });

  it('parses and reports validated=true', () => {
    const v = loadStarterVocab('bs');
    expect(v.validated).toBe(true);
    expect(v.language).toBe('bs');
  });

  it('every BS variant has cyrillicSpelling === null (schema constraint)', () => {
    const v = loadStarterVocab('bs');
    for (const variant of v.variants) {
      expect(variant.cyrillicSpelling).toBeNull();
    }
  });

  it('blends ijekavian (like HR) with SR-like function words', () => {
    const v = loadStarterVocab('bs');
    const latins = new Set(v.variants.map((x) => x.latinSpelling));
    // ijekavian (like HR):
    expect(latins.has('lijep')).toBe(true);
    expect(latins.has('gdje')).toBe(true);
    expect(latins.has('čovjek')).toBe(true);
    expect(latins.has('željeti')).toBe(true); // SR: želeti
    expect(latins.has('hljeb')).toBe(true); // BS-specific spelling
    // SR-like function words:
    expect(latins.has('ko')).toBe(true);
    expect(latins.has('šta')).toBe(true);
    // HR-specific forms NOT in BS:
    expect(latins.has('tko')).toBe(false);
    expect(latins.has('kruh')).toBe(false);
  });

  it('flags HR-as-proxy in its methodology block (Pareto-honesty)', () => {
    const v = loadStarterVocab('bs');
    const source = v.meta.sources[0];
    expect(source.note).toMatch(/proxy|HR/i);
  });
});
