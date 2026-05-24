import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env, isSupabaseConfigured } from './env';

// Phase 0: Supabase is unconfigured by default. The client will throw on use
// until Carter sets EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY in .env.
// All db calls should go through a thin wrapper in `src/data/api/` that can
// surface a friendly "configure Supabase first" message in dev.

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env',
    );
  }
  if (!_client) {
    _client = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }
  return _client;
}

export { isSupabaseConfigured };
