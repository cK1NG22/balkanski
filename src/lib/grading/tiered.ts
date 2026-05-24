// Tiered grading: right / close / wrong.
//
// - `right`  → exact match (whitespace + case normalized).
// - `close`  → diacritic-only difference, OR single-character edit distance.
// - `wrong`  → anything else (different word, 2+ edit distance).
//
// See CLARIFICATIONS.md §2 for full semantics. Diacritics are meaning-bearing
// in BCS, so missing one downgrades to `close`, not `wrong`.

import type { GradingResult, GradingTier } from '@/data/schemas/grading';

import {
  diacriticMismatchPositions,
  isDiacriticOnlyDifference,
  levenshtein,
  stripDiacritics,
} from './diacritics';

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLowerCase();
}

function gradeAgainstSingle(
  answer: string,
  expected: string,
): GradingResult {
  const a = normalize(answer);
  const e = normalize(expected);

  if (a === e) {
    return {
      tier: 'right',
      correction: null,
      missedDiacritics: [],
      editDistance: 0,
    };
  }

  if (isDiacriticOnlyDifference(a, e)) {
    const positions = diacriticMismatchPositions(a, e);
    const missed = positions.map((i) => e[i]);
    return {
      tier: 'close',
      correction: expected,
      missedDiacritics: missed,
      editDistance: positions.length,
    };
  }

  const distance = levenshtein(a, e);
  if (distance <= 1) {
    return {
      tier: 'close',
      correction: expected,
      missedDiacritics: [],
      editDistance: distance,
    };
  }

  // Also accept stripped-diacritic match with 1-char edit as `close` —
  // covers "lepo" vs "ljepo" type slips.
  const strippedDistance = levenshtein(stripDiacritics(a), stripDiacritics(e));
  if (strippedDistance <= 1) {
    return {
      tier: 'close',
      correction: expected,
      missedDiacritics: [],
      editDistance: distance,
    };
  }

  return {
    tier: 'wrong',
    correction: expected,
    missedDiacritics: [],
    editDistance: distance,
  };
}

// Pick the best (most generous) grading across all accepted answers.
// Order of preference: right > close > wrong.
const tierRank: Record<GradingTier, number> = { right: 0, close: 1, wrong: 2 };

export function gradingTier(
  answer: string,
  acceptedAnswers: string[],
): GradingResult {
  if (acceptedAnswers.length === 0) {
    return {
      tier: 'wrong',
      correction: null,
      missedDiacritics: [],
      editDistance: answer.length,
    };
  }

  let best: GradingResult | null = null;
  for (const accepted of acceptedAnswers) {
    const result = gradeAgainstSingle(answer, accepted);
    if (!best || tierRank[result.tier] < tierRank[best.tier]) {
      best = result;
    }
    if (best.tier === 'right') return best;
  }
  return best!;
}
