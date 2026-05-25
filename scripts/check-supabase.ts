// Connectivity smoke test. Run via `pnpm check-supabase`.
//
// Confirms (a) the env vars are loaded, (b) the URL is reachable, and
// (c) the anon key is accepted by the auth endpoint. Does NOT touch any
// table — that's a migration concern for a later step.

import { createClient } from '@supabase/supabase-js';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`✗ ${name} is not set`);
    process.exit(1);
  }
  return v;
}

const url = requireEnv('EXPO_PUBLIC_SUPABASE_URL');
const key = requireEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');

console.log(`Project: ${url.replace(/^https?:\/\//, '')}`);
console.log(`Key prefix: ${key.slice(0, 18)}…${key.slice(-4)}`);

const client = createClient(url, key, {
  auth: { persistSession: false },
});

async function main(): Promise<void> {
  // 1. Auth ping: getSession on a fresh client returns { session: null }
  //    if the key is valid; it errors if the key is malformed/wrong project.
  const { data: sessionData, error: sessionErr } = await client.auth.getSession();
  if (sessionErr) {
    console.error('✗ auth.getSession failed:', sessionErr.message);
    process.exit(1);
  }
  console.log(
    `✓ auth reachable (session: ${sessionData.session ? 'active' : 'none'})`,
  );

  // 2. Settings ping: hits the public auth/settings endpoint, which echoes
  //    back the project config. This proves the project ref is correct.
  const settingsRes = await fetch(`${url}/auth/v1/settings`, {
    headers: { apikey: key },
  });
  if (!settingsRes.ok) {
    console.error(`✗ /auth/v1/settings returned ${settingsRes.status}`);
    process.exit(1);
  }
  const settings = (await settingsRes.json()) as {
    external?: Record<string, boolean>;
    disable_signup?: boolean;
  };
  const enabledProviders = settings.external
    ? Object.entries(settings.external)
        .filter(([, on]) => on)
        .map(([k]) => k)
    : [];
  console.log(
    `✓ project settings reachable (signup disabled: ${settings.disable_signup ?? 'n/a'})`,
  );
  console.log(
    `  enabled providers: ${enabledProviders.length ? enabledProviders.join(', ') : '(none yet)'}`,
  );

  console.log('\n✓ Supabase project reachable and key accepted.');
}

main().catch((err) => {
  console.error('✗ unexpected failure:', err);
  process.exit(1);
});
