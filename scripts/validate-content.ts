// Validates every JSON content file in content/ against the relevant zod schema.
// Runs in CI and before any content-pipeline output is committed.
//
// Phase 0 has no real content yet — this script exits cleanly when content/
// is empty or contains only the placeholder structure.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT_DIR = join(__dirname, '..', 'content');

let checked = 0;
let failed = 0;

function walk(dir: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const p = join(dir, entry);
    let s;
    try {
      s = statSync(p);
    } catch {
      continue;
    }
    if (s.isDirectory()) {
      out.push(...walk(p));
    } else if (entry.endsWith('.json')) {
      out.push(p);
    }
  }
  return out;
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

for (const file of walk(CONTENT_DIR)) {
  checked += 1;
  const rel = file.replace(CONTENT_DIR + '/', '');
  try {
    const raw = readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw);
    // Phase 0 sanity: just ensure it's JSON. Schema-specific validation
    // (variant, concept, alphabet, lesson-pack) lands in Phase 1 when
    // the first real content arrives.
    if (!isObject(parsed) && !Array.isArray(parsed)) {
      console.error(`  ✗ ${rel}: not an object or array`);
      failed += 1;
    } else {
      console.log(`  ✓ ${rel}`);
    }
  } catch (err) {
    console.error(`  ✗ ${rel}: ${err instanceof Error ? err.message : String(err)}`);
    failed += 1;
  }
}

if (checked === 0) {
  console.log('No content files found (Phase 0 — content lands in Phase 1).');
}
console.log(`\n${failed === 0 ? '✓ All content validates.' : `✗ ${failed}/${checked} failed.`}`);
if (failed > 0) process.exit(1);
