import { getSupabase } from '@/lib/supabase';

// DEV-ONLY test login. Bypasses the Google OAuth handshake (App → Google →
// Supabase → balkanski:// deep link) so the app can be dogfooded on a
// simulator or device without the 4-hop redirect chain succeeding.
//
// This file's only caller is gated behind `__DEV__` on the sign-in screen, so
// it never ships in a production build. It exists purely to unblock testing
// every screen downstream of auth (onboarding, lessons, review, compare).
//
// One-time Supabase dashboard setup (Carter):
//   Authentication → Sign In / Providers → Email: enabled
//   Authentication → Providers → Email → "Confirm email": OFF
// With "Confirm email" off, signUp returns a live session immediately, so the
// very first tap creates the account AND signs in.

const TEST_EMAIL = 'dev@balkanski.test';
const TEST_PASSWORD = 'balkanski-dev-login';

export type DevSignInResult =
  | { type: 'success' }
  | { type: 'error'; message: string };

export async function signInWithTestAccount(): Promise<DevSignInResult> {
  const supabase = getSupabase();

  // Sign in first. On the very first run the account doesn't exist yet, so a
  // failure here is expected — fall through to signUp.
  const signIn = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (!signIn.error) return { type: 'success' };

  const signUp = await supabase.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (signUp.error) return { type: 'error', message: signUp.error.message };

  // If "Confirm email" is still ON, signUp creates the user but no session.
  // Surface the exact dashboard toggle to flip rather than failing silently.
  if (!signUp.data.session) {
    return {
      type: 'error',
      message:
        'Account created, but no session was returned. Turn OFF "Confirm email" ' +
        'in Supabase (Authentication → Providers → Email), then tap again.',
    };
  }
  return { type: 'success' };
}
