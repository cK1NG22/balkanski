// Linear Pareto sequencer.
//
// Lessons unlock in strict order of `variant.frequency_rank_in_lang` for the
// user's primary language. Pareto is the curriculum spine; SRS sits on top
// for review of past-learned items.
//
// Pure functions — no DB access here. Caller passes in the relevant slice.

import type { Language, Variant } from '@/data/schemas/variant';

export interface SequencerInput {
  language: Language;
  knownVariantIds: ReadonlySet<string>;
  allVariants: readonly Variant[];
}

export interface ParetoStatus {
  totalRanked: number;
  knownCount: number;
  nextRankToTeach: number | null;
  percentToFluency: number; // 0..1 over the top-N target (default 2000 ≈ 80% fluency)
}

export const FLUENCY_TARGET_RANK = 2000;

export function selectNextVariant(input: SequencerInput): Variant | null {
  const candidates = input.allVariants
    .filter((v) => v.language === input.language && v.regionalTag === null)
    .filter((v) => !input.knownVariantIds.has(v.id))
    .sort((a, b) => a.frequencyRankInLang - b.frequencyRankInLang);
  return candidates[0] ?? null;
}

/** Lookahead: pick the next N unknown variants in Pareto order. */
export function selectNextVariants(
  input: SequencerInput,
  limit: number,
): Variant[] {
  if (limit <= 0) return [];
  return input.allVariants
    .filter((v) => v.language === input.language && v.regionalTag === null)
    .filter((v) => !input.knownVariantIds.has(v.id))
    .sort((a, b) => a.frequencyRankInLang - b.frequencyRankInLang)
    .slice(0, limit);
}

export function paretoStatus(
  input: SequencerInput,
  targetRank: number = FLUENCY_TARGET_RANK,
): ParetoStatus {
  const inLanguage = input.allVariants.filter(
    (v) => v.language === input.language && v.regionalTag === null,
  );
  const known = inLanguage.filter((v) => input.knownVariantIds.has(v.id));
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

// Where to start a learner who took the placement test.
// Maps proficiencyEstimate (0..2000-ish) to a starting rank.
export function startingRankForProficiency(proficiencyEstimate: number): number {
  if (proficiencyEstimate <= 0) return 1;
  return Math.min(proficiencyEstimate, FLUENCY_TARGET_RANK);
}
