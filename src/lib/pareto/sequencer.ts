// Linear Pareto sequencer.
//
// Lessons unlock in strict order of `variant.frequency_rank_in_lang` for the
// user's primary language. Pareto is the curriculum spine; SRS sits on top
// for review of past-learned items.
//
// Two skip-set inputs:
//   * knownVariantIds       -- "seen" set: variants the user has been graded
//                              on (sourced from review_items.variant_id).
//   * markedKnownVariantIds -- self-marked set: variants the user said they
//                              already know via the Known Words editor.
// Both are unioned internally before filtering. Callers may pass either or
// both; the seen-set is mandatory, marked-known is optional.
// Authoritative design (Known Words feature): docs/decisions/0002-known-words-vs-placement-test.md
//
// Pure functions -- no DB access here. Caller passes in the relevant slice.

import type { Language, Variant } from '@/data/schemas/variant';

export interface SequencerInput {
  language: Language;
  knownVariantIds: ReadonlySet<string>;
  markedKnownVariantIds?: ReadonlySet<string>;
  allVariants: readonly Variant[];
}

export interface ParetoStatus {
  totalRanked: number;
  knownCount: number;
  nextRankToTeach: number | null;
  percentToFluency: number; // 0..1 over the top-N target (default 2000 ≈ 80% fluency)
}

export const FLUENCY_TARGET_RANK = 2000;

function buildSkipSet(input: SequencerInput): ReadonlySet<string> {
  if (!input.markedKnownVariantIds || input.markedKnownVariantIds.size === 0) {
    return input.knownVariantIds;
  }
  return new Set([...input.knownVariantIds, ...input.markedKnownVariantIds]);
}

export function selectNextVariant(input: SequencerInput): Variant | null {
  const skip = buildSkipSet(input);
  const candidates = input.allVariants
    .filter((v) => v.language === input.language && v.regionalTag === null)
    .filter((v) => !skip.has(v.id))
    .sort((a, b) => a.frequencyRankInLang - b.frequencyRankInLang);
  return candidates[0] ?? null;
}

/** Lookahead: pick the next N unknown variants in Pareto order. */
export function selectNextVariants(
  input: SequencerInput,
  limit: number,
): Variant[] {
  if (limit <= 0) return [];
  const skip = buildSkipSet(input);
  return input.allVariants
    .filter((v) => v.language === input.language && v.regionalTag === null)
    .filter((v) => !skip.has(v.id))
    .sort((a, b) => a.frequencyRankInLang - b.frequencyRankInLang)
    .slice(0, limit);
}

export function paretoStatus(
  input: SequencerInput,
  targetRank: number = FLUENCY_TARGET_RANK,
): ParetoStatus {
  const skip = buildSkipSet(input);
  const inLanguage = input.allVariants.filter(
    (v) => v.language === input.language && v.regionalTag === null,
  );
  const known = inLanguage.filter((v) => skip.has(v.id));
  const next = selectNextVariant(input);

  const knownWithinTarget = known.filter((v) => v.frequencyRankInLang <= targetRank).length;
  const percent = Math.max(0, Math.min(1, knownWithinTarget / targetRank));

  return {
    totalRanked: inLanguage.length,
    knownCount: known.length,
    nextRankToTeach: next?.frequencyRankInLang ?? null,
    percentToFluency: percent,
  };
}
