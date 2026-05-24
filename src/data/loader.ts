// Bundled-JSON data loader. Validates the pipeline output against the same
// zod schemas used by the rest of the app, so a malformed JSON file fails at
// load time instead of producing mysterious runtime errors deeper in.
//
// `validated` reflects Carter's Pareto-honesty rule: the flag flips to true
// only when (a) the JSON parses, (b) it carries a `_meta` block matching the
// methodology schema, and (c) every concept + variant validates against zod.
// UI components key off this flag to decide whether "% to fluency" claims
// are safe to render.

import { z } from 'zod';

import srStarter from '../../content/vocab/sr-starter.json';
import { ConceptSchema, type Concept } from './schemas/concept';
import { VariantSchema, type Variant } from './schemas/variant';
import { LanguageSchema, type Language } from './schemas/variant';

const BUNDLES: Partial<Record<Language, unknown>> = {
  sr: srStarter,
  // hr: hrStarter   ← lands in Phase 2
  // bs: bsStarter   ← lands in Phase 2
};

export const MethodologySchema = z.object({
  version: z.string().min(1),
  generated_at: z.string().min(1),
  sources: z.array(z.record(z.string(), z.string())).min(1),
  notes: z.string().min(1),
});
export type Methodology = z.infer<typeof MethodologySchema>;

export const VocabBundleSchema = z.object({
  language: LanguageSchema,
  concepts: z.array(ConceptSchema),
  variants: z.array(VariantSchema),
  _meta: MethodologySchema,
});
export type VocabBundle = z.infer<typeof VocabBundleSchema>;

export interface LoadedVocab {
  language: Language;
  concepts: readonly Concept[];
  variants: readonly Variant[];
  meta: Methodology;
  validated: true;
}

const _cache = new Map<Language, LoadedVocab>();

export function loadStarterVocab(language: Language): LoadedVocab {
  const cached = _cache.get(language);
  if (cached) return cached;
  const raw = BUNDLES[language];
  if (!raw) {
    throw new Error(
      `No starter vocab bundle for language=${language}. Run the Python pipeline for ${language} first.`,
    );
  }
  const parsed = VocabBundleSchema.parse(raw);
  const bundle: LoadedVocab = {
    language: parsed.language,
    concepts: parsed.concepts,
    variants: parsed.variants,
    meta: parsed._meta,
    validated: true,
  };
  _cache.set(language, bundle);
  return bundle;
}

// Test-only: reset the module-level cache between test runs.
export function __resetVocabCache(): void {
  _cache.clear();
}
