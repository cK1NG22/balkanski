// Typed environment access. All Expo public env vars must be prefixed
// EXPO_PUBLIC_ to be inlined into the JS bundle at build time.
//
// Set these in .env at the repo root (gitignored). For Phase 0 they can stay
// empty — OAuth + Supabase wiring is a stub until Carter provisions the
// Supabase project.

export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
