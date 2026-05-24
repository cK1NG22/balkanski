// Stress test for the English-as-anchor data model.
//
// Populates 20 hand-curated concept + variant rows hitting every edge case
// from CLARIFICATIONS.md §3 (no-clean-English, homonyms, indeclinables,
// phrases, one-country-only, regional variants, Latin/Cyrillic same word).
// Then runs the Pareto sequencer + cross-language compare query against the
// in-memory rows and asserts the expected results.
//
// Pure in-memory — no DB connection. Phase 0 verification gate.

import { randomUUID } from 'node:crypto';

import { ConceptSchema, type Concept } from '../src/data/schemas/concept';
import { VariantSchema, type Variant } from '../src/data/schemas/variant';
import { selectNextVariant } from '../src/lib/pareto/sequencer';

let failed = 0;
function assert(label: string, cond: boolean, extra?: string): void {
  const tag = cond ? '✓' : '✗';
  if (!cond) failed += 1;
  console.log(`  ${tag} ${label}${cond ? '' : extra ? `  → ${extra}` : ''}`);
}

// Generate stable concept/variant IDs by label so cross-references work.
const cidByLabel = new Map<string, string>();
const vidByLabel = new Map<string, string>();
const cid = (label: string): string => {
  const existing = cidByLabel.get(label);
  if (existing) return existing;
  const fresh = randomUUID();
  cidByLabel.set(label, fresh);
  return fresh;
};
const vid = (label: string): string => {
  const existing = vidByLabel.get(label);
  if (existing) return existing;
  const fresh = randomUUID();
  vidByLabel.set(label, fresh);
  return fresh;
};

// ─── Concepts ───────────────────────────────────────────────────────────────
const concepts: Concept[] = [
  // standard word with all three SCB forms
  {
    id: cid('bread'),
    englishLemma: 'bread',
    englishTranslation: 'bread',
    partOfSpeech: 'noun',
    senseDisambiguator: null,
    topicTags: ['food'],
    frequencyRankAggregate: 87,
  },
  // untranslatable cultural concept (no clean English)
  {
    id: cid('inat'),
    englishLemma: 'inat:spite-driven-stubbornness',
    englishTranslation: 'spiteful stubbornness',
    partOfSpeech: 'noun',
    senseDisambiguator: null,
    topicTags: ['culture'],
    frequencyRankAggregate: 1820,
  },
  // homonym — bank (financial institution)
  {
    id: cid('bank-institution'),
    englishLemma: 'bank',
    englishTranslation: 'bank',
    partOfSpeech: 'noun',
    senseDisambiguator: 'financial-institution',
    topicTags: ['places', 'money'],
    frequencyRankAggregate: 312,
  },
  // homonym — bank (riverbank)
  {
    id: cid('bank-riverbank'),
    englishLemma: 'bank',
    englishTranslation: 'riverbank',
    partOfSpeech: 'noun',
    senseDisambiguator: 'riverbank',
    topicTags: ['geography'],
    frequencyRankAggregate: 1455,
  },
  // indeclinable adverb
  {
    id: cid('quickly'),
    englishLemma: 'quickly',
    englishTranslation: 'quickly',
    partOfSpeech: 'adverb',
    senseDisambiguator: null,
    topicTags: ['manner'],
    frequencyRankAggregate: 140,
  },
  // phrase
  {
    id: cid('how-are-you'),
    englishLemma: 'how are you',
    englishTranslation: 'how are you',
    partOfSpeech: 'phrase',
    senseDisambiguator: null,
    topicTags: ['greetings'],
    frequencyRankAggregate: 25,
  },
  // one-country-only (HR-specific)
  {
    id: cid('kerchief'),
    englishLemma: 'kerchief',
    englishTranslation: 'kerchief',
    partOfSpeech: 'noun',
    senseDisambiguator: null,
    topicTags: ['clothing'],
    frequencyRankAggregate: 3200,
  },
  // standard adjective with regional variant
  {
    id: cid('pretty'),
    englishLemma: 'pretty',
    englishTranslation: 'pretty',
    partOfSpeech: 'adjective',
    senseDisambiguator: null,
    topicTags: ['appearance'],
    frequencyRankAggregate: 210,
  },
];

console.log('Validating concept rows...');
for (const c of concepts) {
  const parsed = ConceptSchema.safeParse(c);
  assert(`concept ${c.englishLemma} parses`, parsed.success, parsed.success ? '' : JSON.stringify(parsed.error?.issues));
}

// ─── Variants ──────────────────────────────────────────────────────────────
const variants: Variant[] = [
  // bread × hr / sr / bs
  { id: vid('bread-hr'), conceptId: cid('bread'), language: 'hr', regionalTag: null, latinSpelling: 'kruh', cyrillicSpelling: null, stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 92, caseForms: { nom: 'kruh', gen: 'kruha', dat: 'kruhu', acc: 'kruh', voc: 'kruše', ins: 'kruhom', loc: 'kruhu' } },
  { id: vid('bread-sr'), conceptId: cid('bread'), language: 'sr', regionalTag: null, latinSpelling: 'hleb', cyrillicSpelling: 'хлеб', stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 87, caseForms: { nom: 'hleb', gen: 'hleba', dat: 'hlebu', acc: 'hleb', voc: 'hlebe', ins: 'hlebom', loc: 'hlebu' } },
  { id: vid('bread-bs'), conceptId: cid('bread'), language: 'bs', regionalTag: null, latinSpelling: 'hljeb', cyrillicSpelling: null, stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 89, caseForms: { nom: 'hljeb', gen: 'hljeba', dat: 'hljebu', acc: 'hljeb', voc: 'hljebe', ins: 'hljebom', loc: 'hljebu' } },
  // inat — sr standard
  { id: vid('inat-sr'), conceptId: cid('inat'), language: 'sr', regionalTag: null, latinSpelling: 'inat', cyrillicSpelling: 'инат', stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 1820, caseForms: { nom: 'inat', gen: 'inata', dat: 'inatu', acc: 'inat', voc: 'inate', ins: 'inatom', loc: 'inatu' } },
  // bank (institution) × all three
  { id: vid('bank-inst-hr'), conceptId: cid('bank-institution'), language: 'hr', regionalTag: null, latinSpelling: 'banka', cyrillicSpelling: null, stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 318, caseForms: null },
  { id: vid('bank-inst-sr'), conceptId: cid('bank-institution'), language: 'sr', regionalTag: null, latinSpelling: 'banka', cyrillicSpelling: 'банка', stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 314, caseForms: null },
  { id: vid('bank-inst-bs'), conceptId: cid('bank-institution'), language: 'bs', regionalTag: null, latinSpelling: 'banka', cyrillicSpelling: null, stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 320, caseForms: null },
  // bank (riverbank) × hr only
  { id: vid('bank-river-hr'), conceptId: cid('bank-riverbank'), language: 'hr', regionalTag: null, latinSpelling: 'obala', cyrillicSpelling: null, stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 1500, caseForms: null },
  // quickly — indeclinable
  { id: vid('quickly-hr'), conceptId: cid('quickly'), language: 'hr', regionalTag: null, latinSpelling: 'brzo', cyrillicSpelling: null, stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 145, caseForms: null },
  { id: vid('quickly-sr'), conceptId: cid('quickly'), language: 'sr', regionalTag: null, latinSpelling: 'brzo', cyrillicSpelling: 'брзо', stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 140, caseForms: null },
  { id: vid('quickly-bs'), conceptId: cid('quickly'), language: 'bs', regionalTag: null, latinSpelling: 'brzo', cyrillicSpelling: null, stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 142, caseForms: null },
  // phrase
  { id: vid('how-hr'), conceptId: cid('how-are-you'), language: 'hr', regionalTag: null, latinSpelling: 'kako si', cyrillicSpelling: null, stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 28, caseForms: null },
  { id: vid('how-sr'), conceptId: cid('how-are-you'), language: 'sr', regionalTag: null, latinSpelling: 'kako si', cyrillicSpelling: 'како си', stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 25, caseForms: null },
  { id: vid('how-bs'), conceptId: cid('how-are-you'), language: 'bs', regionalTag: null, latinSpelling: 'kako si', cyrillicSpelling: null, stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 26, caseForms: null },
  // kerchief — HR only
  { id: vid('kerchief-hr'), conceptId: cid('kerchief'), language: 'hr', regionalTag: null, latinSpelling: 'marama', cyrillicSpelling: null, stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 3200, caseForms: null },
  // pretty × hr / sr / bs + sr Dalmatinski regional
  { id: vid('pretty-hr'), conceptId: cid('pretty'), language: 'hr', regionalTag: null, latinSpelling: 'lijepo', cyrillicSpelling: null, stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 215, caseForms: null },
  { id: vid('pretty-sr'), conceptId: cid('pretty'), language: 'sr', regionalTag: null, latinSpelling: 'lepo', cyrillicSpelling: 'лепо', stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 210, caseForms: null },
  { id: vid('pretty-bs'), conceptId: cid('pretty'), language: 'bs', regionalTag: null, latinSpelling: 'lijepo', cyrillicSpelling: null, stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 218, caseForms: null },
  { id: vid('pretty-dalmatinski'), conceptId: cid('pretty'), language: 'hr', regionalTag: 'dalmatinski', latinSpelling: 'lipo', cyrillicSpelling: null, stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 215, caseForms: null },
];

console.log('\nValidating variant rows...');
for (const v of variants) {
  const parsed = VariantSchema.safeParse(v);
  assert(
    `variant ${v.latinSpelling} (${v.language}${v.regionalTag ? '/' + v.regionalTag : ''}) parses`,
    parsed.success,
    parsed.success ? '' : JSON.stringify(parsed.error?.issues),
  );
}

console.log('\nRunning sequencer queries...');

// SR beginner with nothing known should get the lowest-rank standard SR variant.
const srNext = selectNextVariant({
  language: 'sr',
  knownVariantIds: new Set(),
  allVariants: variants,
});
assert(
  "SR beginner's first variant is 'kako si' (rank 25)",
  srNext?.latinSpelling === 'kako si',
  srNext ? `${srNext.latinSpelling} @ ${srNext.frequencyRankInLang}` : 'null',
);

// HR learner with 'kako si' and 'brzo' known — lowest remaining unknown HR variant is 'kruh' (rank 92).
const hrNext = selectNextVariant({
  language: 'hr',
  knownVariantIds: new Set([vid('how-hr'), vid('quickly-hr')]),
  allVariants: variants,
});
assert(
  "HR learner skips known and picks 'kruh' (rank 92)",
  hrNext?.latinSpelling === 'kruh',
  hrNext ? `${hrNext.latinSpelling} @ ${hrNext.frequencyRankInLang}` : 'null',
);

// Sequencer never picks regional variants on the primary path.
const hrExhausted = selectNextVariant({
  language: 'hr',
  knownVariantIds: new Set([
    vid('how-hr'),
    vid('quickly-hr'),
    vid('bread-hr'),
    vid('bank-inst-hr'),
    vid('pretty-hr'),
    vid('bank-river-hr'),
    vid('kerchief-hr'),
  ]),
  allVariants: variants,
});
assert(
  'HR sequencer never picks Dalmatinski variant (returns null when standard HR is exhausted)',
  hrExhausted === null,
  hrExhausted ? `${hrExhausted.latinSpelling} (regional: ${hrExhausted.regionalTag})` : 'null',
);

console.log('\nRunning cross-language compare queries...');

const breadVariants = variants.filter((v) => v.conceptId === cid('bread'));
assert('bread concept has variants in all 3 languages', breadVariants.length === 3);
assert("bread has Serbian Cyrillic 'хлеб'", breadVariants.some((v) => v.cyrillicSpelling === 'хлеб'));
assert("bread Croatian is 'kruh'", breadVariants.some((v) => v.language === 'hr' && v.latinSpelling === 'kruh'));
assert("bread Bosnian is 'hljeb'", breadVariants.some((v) => v.language === 'bs' && v.latinSpelling === 'hljeb'));

const prettyVariants = variants.filter((v) => v.conceptId === cid('pretty'));
assert('pretty has 4 variants (3 standard + 1 dalmatinski)', prettyVariants.length === 4);
assert("pretty includes Dalmatinski 'lipo'", prettyVariants.some((v) => v.regionalTag === 'dalmatinski' && v.latinSpelling === 'lipo'));

const kerchiefVariants = variants.filter((v) => v.conceptId === cid('kerchief'));
assert('one-country word has exactly 1 variant', kerchiefVariants.length === 1);

const homonymBankInst = variants.filter((v) => v.conceptId === cid('bank-institution'));
const homonymBankRiver = variants.filter((v) => v.conceptId === cid('bank-riverbank'));
assert('financial-institution bank has variants', homonymBankInst.length > 0);
assert('riverbank has variants', homonymBankRiver.length > 0);
assert('homonyms are distinct concepts', cid('bank-institution') !== cid('bank-riverbank'));

const indeclinables = variants.filter((v) => v.caseForms === null && v.latinSpelling === 'brzo');
assert('indeclinables have null case_forms', indeclinables.length === 3);

console.log(`\n${failed === 0 ? '✓ All checks passed.' : `✗ ${failed} check(s) failed.`}`);
if (failed > 0) process.exit(1);
