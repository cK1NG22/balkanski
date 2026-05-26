// Cross-language grouping for the compare view.
//
// Each Concept has a deterministic id derived from english_lemma +
// sense_disambiguator (see content-pipeline/balkanski_pipeline/build.py).
// That means SR "lep", HR "lijep", and BS "lijep" all map to the SAME
// conceptId — they're three variants of one English meaning. This module
// performs the join: given the per-language LoadedVocab bundles, return
// one row per concept with up to three language slots.

import type { Concept } from '@/data/schemas/concept';
import type { Variant } from '@/data/schemas/variant';

import type { LoadedVocab } from '../../data/loader';

export interface CompareRow {
  concept: Concept;
  variants: {
    sr?: Variant;
    hr?: Variant;
    bs?: Variant;
  };
  /** Lowest frequencyRankInLang across the present variants. Used to sort
   *  the global compare list canonically: function words first. */
  minRank: number;
}

export interface GroupOptions {
  /** Cap on rows returned. Defaults to Infinity. The Library compare screen
   *  uses 60 for a glance-friendly first page. */
  limit?: number;
}

// Inputs are read-only; outputs are sorted by ascending minRank (most
// frequent first). When the same conceptId appears in multiple bundles the
// concept row picks whichever was seen first (they're structurally identical
// across bundles because the pipeline derives them from the same english
// anchor).
export function groupConceptsAcrossLanguages(
  bundles: readonly LoadedVocab[],
  opts: GroupOptions = {},
): CompareRow[] {
  const byConceptId = new Map<string, CompareRow>();

  for (const bundle of bundles) {
    const conceptById = new Map<string, Concept>();
    for (const c of bundle.concepts) conceptById.set(c.id, c);

    for (const variant of bundle.variants) {
      const concept = conceptById.get(variant.conceptId);
      if (!concept) continue;
      let row = byConceptId.get(concept.id);
      if (!row) {
        row = { concept, variants: {}, minRank: variant.frequencyRankInLang };
        byConceptId.set(concept.id, row);
      } else if (variant.frequencyRankInLang < row.minRank) {
        row.minRank = variant.frequencyRankInLang;
      }
      row.variants[variant.language] = variant;
    }
  }

  const rows = Array.from(byConceptId.values()).sort((a, b) => a.minRank - b.minRank);
  if (opts.limit != null && opts.limit < rows.length) {
    return rows.slice(0, opts.limit);
  }
  return rows;
}
