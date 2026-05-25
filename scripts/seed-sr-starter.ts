// Seed public.concept and public.variant from content/vocab/sr-starter.json
// using the service_role key (bypasses RLS). Idempotent — IDs are deterministic
// UUIDv5 from the content pipeline, so re-running won't duplicate rows.
//
// Run: pnpm seed-sr

import { createClient } from '@supabase/supabase-js';

import { loadStarterVocab } from '../src/data/loader';
import type { Concept } from '../src/data/schemas/concept';
import type { Variant } from '../src/data/schemas/variant';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`✗ ${name} is not set`);
    process.exit(1);
  }
  return v;
}

const url = requireEnv('EXPO_PUBLIC_SUPABASE_URL');
const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function conceptRow(c: Concept) {
  return {
    id: c.id,
    english_lemma: c.englishLemma,
    english_translation: c.englishTranslation,
    part_of_speech: c.partOfSpeech,
    sense_disambiguator: c.senseDisambiguator,
    topic_tags: c.topicTags,
    frequency_rank_aggregate: c.frequencyRankAggregate,
  };
}

function variantRow(v: Variant) {
  return {
    id: v.id,
    concept_id: v.conceptId,
    language: v.language,
    regional_tag: v.regionalTag,
    latin_spelling: v.latinSpelling,
    cyrillic_spelling: v.cyrillicSpelling,
    stress_mark: v.stressMark,
    ipa: v.ipa,
    audio_url: v.audioUrl,
    frequency_rank_in_lang: v.frequencyRankInLang,
    case_forms: v.caseForms,
  };
}

const BATCH = 100;

async function main() {
  const bundle = loadStarterVocab('sr');
  console.log(`Loaded sr-starter: ${bundle.concepts.length} concepts, ${bundle.variants.length} variants`);
  console.log(`Methodology version: ${bundle.meta.version}`);

  console.log('\nUpserting concepts (must land first — variants FK to them)...');
  // Dedupe by id: the content pipeline can produce duplicate rows when two
  // source entries hash to the same UUIDv5 (same englishLemma + partOfSpeech).
  // Postgres ON CONFLICT DO UPDATE rejects batches that contain the same key
  // twice. Tracked TODO: fix the dedupe at source in content-pipeline/.
  const conceptById = new Map(bundle.concepts.map((c) => [c.id, c]));
  if (conceptById.size < bundle.concepts.length) {
    console.warn(
      `  ! deduped ${bundle.concepts.length - conceptById.size} concept(s) by id ` +
        `(pipeline should dedupe at source)`,
    );
  }
  const conceptRows = [...conceptById.values()].map(conceptRow);
  for (let i = 0; i < conceptRows.length; i += BATCH) {
    const slice = conceptRows.slice(i, i + BATCH);
    const { error } = await admin.from('concept').upsert(slice);
    if (error) {
      console.error(`✗ concept upsert failed at batch starting ${i}:`, error.message);
      process.exit(1);
    }
    console.log(`  concept: ${Math.min(i + slice.length, conceptRows.length)}/${conceptRows.length}`);
  }

  console.log('\nUpserting variants...');
  const variantById = new Map(bundle.variants.map((v) => [v.id, v]));
  if (variantById.size < bundle.variants.length) {
    console.warn(
      `  ! deduped ${bundle.variants.length - variantById.size} variant(s) by id`,
    );
  }
  const variantRows = [...variantById.values()].map(variantRow);
  for (let i = 0; i < variantRows.length; i += BATCH) {
    const slice = variantRows.slice(i, i + BATCH);
    const { error } = await admin.from('variant').upsert(slice);
    if (error) {
      console.error(`✗ variant upsert failed at batch starting ${i}:`, error.message);
      process.exit(1);
    }
    console.log(`  variant: ${Math.min(i + slice.length, variantRows.length)}/${variantRows.length}`);
  }

  const { count: conceptCount } = await admin
    .from('concept')
    .select('*', { count: 'exact', head: true });
  const { count: variantCount } = await admin
    .from('variant')
    .select('*', { count: 'exact', head: true });
  console.log(`\n✓ Done. DB now has concept=${conceptCount}, variant=${variantCount}.`);
}

main().catch((err) => {
  console.error('✗ unexpected failure:', err);
  process.exit(1);
});
