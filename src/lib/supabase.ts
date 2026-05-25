import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env, isSupabaseConfigured } from './env';
import { supabaseSecureStorage } from './storage/secure-storage';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env',
    );
  }
  if (!_client) {
    _client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        // PKCE flow is the secure variant for native apps — Supabase stashes
        // a code_verifier in storage so the auth response can't be replayed
        // if the redirect URL is intercepted.
        flowType: 'pkce',
        // RN has no window.location; the deep-link parsing is done by hand
        // in oauth.ts after WebBrowser closes.
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
        storage: supabaseSecureStorage,
      },
    });
  }
  return _client;
}

export { isSupabaseConfigured };
